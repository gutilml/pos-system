import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { lineTotal, roundMoney } from '@/lib/money'
import type { CartItem, CartProduct } from '@/types/cart'

export type Ticket = {
  id: string
  label: string
  items: CartItem[]
  amountReceived: number | null
}

type CartState = {
  tickets: Record<string, Ticket>
  ticketOrder: string[]
  activeTicketId: string
  nextTicketNumber: number
  taxRate: number
  pendingWeightProduct: CartProduct | null
  addItem: (product: CartProduct, quantity?: number) => void
  confirmWeight: (quantity: number) => void
  clearPendingWeight: () => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  resetAllTickets: () => void
  setTaxRate: (rate: number) => void
  setAmountReceived: (amount: number | null) => void
  createNewTicket: () => void
  switchTicket: (ticketId: string) => void
  closeTicket: (ticketId: string) => void
}

function createTicket(number: number): Ticket {
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `ticket-${number}-${Date.now()}`
  return {
    id,
    label: `Ticket ${number}`,
    items: [],
    amountReceived: null,
  }
}

function initialTickets() {
  const ticket = createTicket(1)
  return {
    tickets: { [ticket.id]: ticket } as Record<string, Ticket>,
    ticketOrder: [ticket.id],
    activeTicketId: ticket.id,
    nextTicketNumber: 2,
  }
}

function pushOrMergeItem(
  items: CartItem[],
  product: CartProduct,
  quantity: number,
): CartItem[] {
  const qty = roundMoney(quantity)
  if (qty <= 0) return items

  const existing = items.find((item) => item.productId === product.id)
  if (existing) {
    return items.map((item) =>
      item.productId === product.id
        ? { ...item, quantity: roundMoney(item.quantity + qty) }
        : item,
    )
  }

  return [
    ...items,
    {
      productId: product.id,
      sku: product.sku,
      name: product.name,
      unitPrice: roundMoney(product.sellingPrice),
      quantity: qty,
    },
  ]
}

function updateActiveTicket(
  state: CartState,
  updater: (ticket: Ticket) => Ticket,
): Partial<CartState> {
  const current = state.tickets[state.activeTicketId]
  if (!current) return {}
  return {
    tickets: {
      ...state.tickets,
      [state.activeTicketId]: updater(current),
    },
  }
}

export function selectActiveItems(state: {
  tickets: Record<string, Ticket>
  activeTicketId: string
}): CartItem[] {
  return state.tickets[state.activeTicketId]?.items ?? []
}

export function selectActiveAmountReceived(state: {
  tickets: Record<string, Ticket>
  activeTicketId: string
}): number | null {
  return state.tickets[state.activeTicketId]?.amountReceived ?? null
}

const bootstrap = initialTickets()

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      ...bootstrap,
      taxRate: 0,
      pendingWeightProduct: null,

      addItem: (product, quantity = 1) => {
        if (product.sellByWeight === true) {
          set({ pendingWeightProduct: product })
          return
        }

        const qty = roundMoney(quantity)
        if (qty <= 0) return

        set((state) =>
          updateActiveTicket(state, (ticket) => ({
            ...ticket,
            items: pushOrMergeItem(ticket.items, product, qty),
          })),
        )
      },

      confirmWeight: (quantity) => {
        const product = get().pendingWeightProduct
        if (!product) return

        const qty = roundMoney(quantity)
        if (qty <= 0) return

        set((state) => ({
          pendingWeightProduct: null,
          ...updateActiveTicket(state, (ticket) => ({
            ...ticket,
            items: pushOrMergeItem(ticket.items, product, qty),
          })),
        }))
      },

      clearPendingWeight: () => set({ pendingWeightProduct: null }),

      removeItem: (productId) => {
        set((state) =>
          updateActiveTicket(state, (ticket) => ({
            ...ticket,
            items: ticket.items.filter((item) => item.productId !== productId),
          })),
        )
      },

      updateQuantity: (productId, quantity) => {
        const qty = roundMoney(quantity)
        if (qty <= 0) {
          get().removeItem(productId)
          return
        }

        set((state) =>
          updateActiveTicket(state, (ticket) => ({
            ...ticket,
            items: ticket.items.map((item) =>
              item.productId === productId ? { ...item, quantity: qty } : item,
            ),
          })),
        )
      },

      clearCart: () => {
        set((state) => ({
          pendingWeightProduct: null,
          ...updateActiveTicket(state, (ticket) => ({
            ...ticket,
            items: [],
            amountReceived: null,
          })),
        }))
      },

      resetAllTickets: () => {
        const next = initialTickets()
        set({
          ...next,
          pendingWeightProduct: null,
        })
      },

      setTaxRate: (rate) => set({ taxRate: Math.max(0, rate) }),

      setAmountReceived: (amount) => {
        set((state) =>
          updateActiveTicket(state, (ticket) => ({
            ...ticket,
            amountReceived: amount === null ? null : roundMoney(amount),
          })),
        )
      },

      createNewTicket: () => {
        set((state) => {
          const ticket = createTicket(state.nextTicketNumber)
          return {
            tickets: { ...state.tickets, [ticket.id]: ticket },
            ticketOrder: [...state.ticketOrder, ticket.id],
            activeTicketId: ticket.id,
            nextTicketNumber: state.nextTicketNumber + 1,
            pendingWeightProduct: null,
          }
        })
      },

      switchTicket: (ticketId) => {
        const state = get()
        if (!state.tickets[ticketId] || ticketId === state.activeTicketId) return
        set({ activeTicketId: ticketId, pendingWeightProduct: null })
      },

      closeTicket: (ticketId) => {
        set((state) => {
          if (!state.tickets[ticketId]) return state

          const remainingOrder = state.ticketOrder.filter((id) => id !== ticketId)
          const { [ticketId]: _removed, ...remainingTickets } = state.tickets

          if (remainingOrder.length === 0) {
            const blank = createTicket(state.nextTicketNumber)
            return {
              tickets: { [blank.id]: blank },
              ticketOrder: [blank.id],
              activeTicketId: blank.id,
              nextTicketNumber: state.nextTicketNumber + 1,
              pendingWeightProduct: null,
            }
          }

          const nextActive =
            state.activeTicketId === ticketId
              ? remainingOrder[Math.max(0, state.ticketOrder.indexOf(ticketId) - 1)] ??
                remainingOrder[0]
              : state.activeTicketId

          return {
            tickets: remainingTickets,
            ticketOrder: remainingOrder,
            activeTicketId: nextActive,
            pendingWeightProduct:
              state.activeTicketId === ticketId ? null : state.pendingWeightProduct,
          }
        })
      },
    }),
    {
      name: 'pos-cart',
      version: 2,
      partialize: (state) => ({
        tickets: state.tickets,
        ticketOrder: state.ticketOrder,
        activeTicketId: state.activeTicketId,
        nextTicketNumber: state.nextTicketNumber,
        taxRate: state.taxRate,
      }),
      migrate: (persisted, version) => {
        const data = persisted as Record<string, unknown>
        if (version < 2) {
          const items = (data.items as CartItem[] | undefined) ?? []
          const amountReceived = (data.amountReceived as number | null | undefined) ?? null
          const taxRate = (data.taxRate as number | undefined) ?? 0
          const ticket = createTicket(1)
          ticket.items = items
          ticket.amountReceived = amountReceived
          return {
            tickets: { [ticket.id]: ticket },
            ticketOrder: [ticket.id],
            activeTicketId: ticket.id,
            nextTicketNumber: 2,
            taxRate,
          }
        }
        return data as never
      },
    },
  ),
)

/** Test helper: replace all tickets with a single ticket holding the given items. */
export function resetCartForTests(partial?: {
  items?: CartItem[]
  taxRate?: number
  amountReceived?: number | null
  pendingWeightProduct?: CartProduct | null
}) {
  const ticket = createTicket(1)
  ticket.items = partial?.items ?? []
  ticket.amountReceived = partial?.amountReceived ?? null
  useCartStore.setState({
    tickets: { [ticket.id]: ticket },
    ticketOrder: [ticket.id],
    activeTicketId: ticket.id,
    nextTicketNumber: 2,
    taxRate: partial?.taxRate ?? 0,
    pendingWeightProduct: partial?.pendingWeightProduct ?? null,
  })
}

export function selectSubtotal(items: CartItem[]): number {
  return roundMoney(
    items.reduce((sum, item) => sum + lineTotal(item.unitPrice, item.quantity), 0),
  )
}

export function selectTaxTotal(items: CartItem[], taxRate: number): number {
  return roundMoney(selectSubtotal(items) * taxRate)
}

export function selectGrandTotal(items: CartItem[], taxRate: number): number {
  return roundMoney(selectSubtotal(items) + selectTaxTotal(items, taxRate))
}

export function selectChangeDue(
  items: CartItem[],
  taxRate: number,
  amountReceived: number | null,
): number {
  if (amountReceived === null) return 0
  return roundMoney(amountReceived - selectGrandTotal(items, taxRate))
}

export function selectItemLineTotal(item: CartItem): number {
  return lineTotal(item.unitPrice, item.quantity)
}
