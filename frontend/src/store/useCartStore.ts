import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { priceCartLine } from '@/lib/discountPricing'
import { roundMoney } from '@/lib/money'
import type { CartItem, CartProduct } from '@/types/cart'

export type PaymentMethod = 'CASH' | 'CARD' | 'CREDIT'

export type PaymentTender = {
  id: string
  method: PaymentMethod
  amount: number
}

export type AssignedCustomer = {
  id: string
  name: string
  phone: string | null
  creditLimit: number
  currentBalance: number
}

export type Ticket = {
  id: string
  label: string
  items: CartItem[]
  amountReceived: number | null
  payments: PaymentTender[]
  customer: AssignedCustomer | null
  /** Decimal fraction (0.10 = 10% cart-wide). */
  globalDiscountPercentage: number
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
  addPayment: (method: PaymentMethod, amount: number) => void
  /** At most one tender per method; amount ≤ 0 removes; rejects overpay. */
  upsertPayment: (method: PaymentMethod, amount: number) => boolean
  removePayment: (paymentId: string) => void
  clearPayments: () => void
  setCustomer: (customer: AssignedCustomer | null) => void
  setItemDiscountPercentage: (productId: string, fraction: number) => void
  setGlobalDiscountPercentage: (fraction: number) => void
  createNewTicket: () => void
  switchTicket: (ticketId: string) => void
  closeTicket: (ticketId: string) => void
}

function newId(prefix: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function createTicket(number: number): Ticket {
  return {
    id: newId('ticket'),
    label: `Ticket ${number}`,
    items: [],
    amountReceived: null,
    payments: [],
    customer: null,
    globalDiscountPercentage: 0,
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
      itemDiscountPercentage: 0,
      excludeFromGlobalDiscounts: product.excludeFromGlobalDiscounts === true,
      trackInventory: product.trackInventory === true,
      currentStock: product.currentStock ?? 0,
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

function normalizeTicket(raw: Partial<Ticket> & { id: string; label: string }): Ticket {
  return {
    id: raw.id,
    label: raw.label,
    items: raw.items ?? [],
    amountReceived: raw.amountReceived ?? null,
    payments: raw.payments ?? [],
    customer: raw.customer ?? null,
    globalDiscountPercentage: raw.globalDiscountPercentage ?? 0,
  }
}

function normalizeCartItem(raw: Partial<CartItem> & Pick<CartItem, 'productId' | 'sku' | 'name' | 'unitPrice' | 'quantity'>): CartItem {
  return {
    ...raw,
    itemDiscountPercentage: raw.itemDiscountPercentage ?? 0,
    excludeFromGlobalDiscounts: raw.excludeFromGlobalDiscounts === true,
    trackInventory: raw.trackInventory === true,
    currentStock: Number.isFinite(Number(raw.currentStock)) ? Number(raw.currentStock) : 0,
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

export function selectActivePayments(state: {
  tickets: Record<string, Ticket>
  activeTicketId: string
}): PaymentTender[] {
  return state.tickets[state.activeTicketId]?.payments ?? []
}

export function selectActiveCustomer(state: {
  tickets: Record<string, Ticket>
  activeTicketId: string
}): AssignedCustomer | null {
  return state.tickets[state.activeTicketId]?.customer ?? null
}

export function selectActiveGlobalDiscountPercentage(state: {
  tickets: Record<string, Ticket>
  activeTicketId: string
}): number {
  return state.tickets[state.activeTicketId]?.globalDiscountPercentage ?? 0
}

export function selectTotalTendered(payments: PaymentTender[]): number {
  return roundMoney(payments.reduce((sum, payment) => sum + payment.amount, 0))
}

export function selectBalanceDue(
  items: CartItem[],
  taxRate: number,
  payments: PaymentTender[],
  globalDiscountPercentage = 0,
): number {
  return roundMoney(
    Math.max(0, selectGrandTotal(items, taxRate, globalDiscountPercentage) - selectTotalTendered(payments)),
  )
}

export function selectTenderChangeDue(
  items: CartItem[],
  taxRate: number,
  payments: PaymentTender[],
  globalDiscountPercentage = 0,
): number {
  return roundMoney(
    Math.max(
      0,
      selectTotalTendered(payments) - selectGrandTotal(items, taxRate, globalDiscountPercentage),
    ),
  )
}

export function selectAvailableCredit(customer: AssignedCustomer): number {
  return roundMoney(Math.max(0, customer.creditLimit - customer.currentBalance))
}

export function selectCanCompleteSale(
  items: CartItem[],
  taxRate: number,
  payments: PaymentTender[],
  customer: AssignedCustomer | null,
  globalDiscountPercentage = 0,
): boolean {
  if (items.length === 0 || payments.length === 0) return false
  const tendered = selectTotalTendered(payments)
  const total = selectGrandTotal(items, taxRate, globalDiscountPercentage)
  if (tendered !== total) {
    return false
  }
  const hasCredit = payments.some((payment) => payment.method === 'CREDIT')
  if (hasCredit && !customer) return false
  return true
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
            payments: [],
            customer: null,
            globalDiscountPercentage: 0,
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

      upsertPayment: (method, amount) => {
        const tenderAmount = roundMoney(amount)
        const state = get()
        const ticket = state.tickets[state.activeTicketId]
        if (!ticket) return false

        if (tenderAmount <= 0) {
          if (!ticket.payments.some((payment) => payment.method === method)) {
            return true
          }
          set((prev) =>
            updateActiveTicket(prev, (active) => ({
              ...active,
              payments: active.payments.filter((payment) => payment.method !== method),
            })),
          )
          return true
        }

        const others = ticket.payments.filter((payment) => payment.method !== method)
        const othersSum = selectTotalTendered(others)
        const grandTotal = selectGrandTotal(
          ticket.items,
          state.taxRate,
          ticket.globalDiscountPercentage,
        )
        const maxForMethod = roundMoney(Math.max(0, grandTotal - othersSum))
        if (tenderAmount > maxForMethod) return false

        set((prev) =>
          updateActiveTicket(prev, (active) => {
            const existing = active.payments.find((payment) => payment.method === method)
            if (existing) {
              return {
                ...active,
                payments: active.payments.map((payment) =>
                  payment.method === method
                    ? { ...payment, amount: tenderAmount }
                    : payment,
                ),
              }
            }
            return {
              ...active,
              payments: [
                ...active.payments,
                { id: newId('pay'), method, amount: tenderAmount },
              ],
            }
          }),
        )
        return true
      },

      addPayment: (method, amount) => {
        get().upsertPayment(method, amount)
      },

      removePayment: (paymentId) => {
        set((state) =>
          updateActiveTicket(state, (ticket) => ({
            ...ticket,
            payments: ticket.payments.filter((payment) => payment.id !== paymentId),
          })),
        )
      },

      clearPayments: () => {
        set((state) =>
          updateActiveTicket(state, (ticket) => ({
            ...ticket,
            payments: [],
          })),
        )
      },

      setCustomer: (customer) => {
        set((state) =>
          updateActiveTicket(state, (ticket) => ({
            ...ticket,
            customer,
          })),
        )
      },

      setItemDiscountPercentage: (productId, fraction) => {
        const pct = Math.max(0, Math.min(1, roundMoney(fraction)))
        set((state) =>
          updateActiveTicket(state, (ticket) => ({
            ...ticket,
            items: ticket.items.map((item) =>
              item.productId === productId
                ? { ...item, itemDiscountPercentage: pct }
                : item,
            ),
          })),
        )
      },

      setGlobalDiscountPercentage: (fraction) => {
        const pct = Math.max(0, Math.min(1, roundMoney(fraction)))
        set((state) =>
          updateActiveTicket(state, (ticket) => ({
            ...ticket,
            globalDiscountPercentage: pct,
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
      version: 4,
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
        if (version < 3) {
          const tickets = (data.tickets as Record<string, Partial<Ticket>> | undefined) ?? {}
          const normalized: Record<string, Ticket> = {}
          for (const [id, ticket] of Object.entries(tickets)) {
            normalized[id] = normalizeTicket({
              ...ticket,
              id: ticket.id ?? id,
              label: ticket.label ?? 'Ticket',
            })
          }
          return {
            ...data,
            tickets: normalized,
          } as never
        }
        if (version < 4) {
          const tickets = (data.tickets as Record<string, Partial<Ticket>> | undefined) ?? {}
          const normalized: Record<string, Ticket> = {}
          for (const [id, ticket] of Object.entries(tickets)) {
            const base = normalizeTicket({
              ...ticket,
              id: ticket.id ?? id,
              label: ticket.label ?? 'Ticket',
            })
            base.items = (base.items ?? []).map((item) => normalizeCartItem(item))
            normalized[id] = base
          }
          return {
            ...data,
            tickets: normalized,
          } as never
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
  payments?: PaymentTender[]
  customer?: AssignedCustomer | null
  globalDiscountPercentage?: number
  pendingWeightProduct?: CartProduct | null
}) {
  const ticket = createTicket(1)
  ticket.items = (partial?.items ?? []).map((item) => normalizeCartItem(item))
  ticket.amountReceived = partial?.amountReceived ?? null
  ticket.payments = partial?.payments ?? []
  ticket.customer = partial?.customer ?? null
  ticket.globalDiscountPercentage = partial?.globalDiscountPercentage ?? 0
  useCartStore.setState({
    tickets: { [ticket.id]: ticket },
    ticketOrder: [ticket.id],
    activeTicketId: ticket.id,
    nextTicketNumber: 2,
    taxRate: partial?.taxRate ?? 0,
    pendingWeightProduct: partial?.pendingWeightProduct ?? null,
  })
}

export function selectSubtotal(items: CartItem[], globalDiscountPercentage = 0): number {
  return roundMoney(
    items.reduce(
      (sum, item) => sum + priceCartLine(item, globalDiscountPercentage).lineTotal,
      0,
    ),
  )
}

export function selectTotalDiscountAmount(
  items: CartItem[],
  globalDiscountPercentage = 0,
): number {
  return roundMoney(
    items.reduce(
      (sum, item) => sum + priceCartLine(item, globalDiscountPercentage).lineDiscountAmount,
      0,
    ),
  )
}

export function selectTaxTotal(
  items: CartItem[],
  taxRate: number,
  globalDiscountPercentage = 0,
): number {
  return roundMoney(selectSubtotal(items, globalDiscountPercentage) * taxRate)
}

export function selectGrandTotal(
  items: CartItem[],
  taxRate: number,
  globalDiscountPercentage = 0,
): number {
  return roundMoney(
    selectSubtotal(items, globalDiscountPercentage) +
      selectTaxTotal(items, taxRate, globalDiscountPercentage),
  )
}

export function selectChangeDue(
  items: CartItem[],
  taxRate: number,
  amountReceived: number | null,
  globalDiscountPercentage = 0,
): number {
  if (amountReceived === null) return 0
  return roundMoney(
    amountReceived - selectGrandTotal(items, taxRate, globalDiscountPercentage),
  )
}

export function selectItemLineTotal(item: CartItem, globalDiscountPercentage = 0): number {
  return priceCartLine(item, globalDiscountPercentage).lineTotal
}

export function selectItemPricedLine(item: CartItem, globalDiscountPercentage = 0) {
  return priceCartLine(item, globalDiscountPercentage)
}
