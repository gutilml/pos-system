import { create } from 'zustand'
import { lineTotal, roundMoney } from '@/lib/money'
import type { CartItem, CartProduct } from '@/types/cart'

type CartState = {
  items: CartItem[]
  taxRate: number
  amountReceived: number | null
  pendingWeightProduct: CartProduct | null
  addItem: (product: CartProduct, quantity?: number) => void
  confirmWeight: (quantity: number) => void
  clearPendingWeight: () => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  setTaxRate: (rate: number) => void
  setAmountReceived: (amount: number | null) => void
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

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  taxRate: 0,
  amountReceived: null,
  pendingWeightProduct: null,

  addItem: (product, quantity = 1) => {
    // Weight-based items must be confirmed via the modal before entering the cart.
    if (product.sellByWeight === true) {
      set({ pendingWeightProduct: product })
      return
    }

    const qty = roundMoney(quantity)
    if (qty <= 0) return

    set((state) => ({
      items: pushOrMergeItem(state.items, product, qty),
    }))
  },

  confirmWeight: (quantity) => {
    const product = get().pendingWeightProduct
    if (!product) return

    const qty = roundMoney(quantity)
    if (qty <= 0) return

    set((state) => ({
      pendingWeightProduct: null,
      items: pushOrMergeItem(state.items, product, qty),
    }))
  },

  clearPendingWeight: () => set({ pendingWeightProduct: null }),

  removeItem: (productId) => {
    set((state) => ({
      items: state.items.filter((item) => item.productId !== productId),
    }))
  },

  updateQuantity: (productId, quantity) => {
    const qty = roundMoney(quantity)
    if (qty <= 0) {
      get().removeItem(productId)
      return
    }

    set((state) => ({
      items: state.items.map((item) =>
        item.productId === productId ? { ...item, quantity: qty } : item,
      ),
    }))
  },

  clearCart: () => set({ items: [], amountReceived: null, pendingWeightProduct: null }),

  setTaxRate: (rate) => set({ taxRate: Math.max(0, rate) }),

  setAmountReceived: (amount) =>
    set({ amountReceived: amount === null ? null : roundMoney(amount) }),
}))

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
