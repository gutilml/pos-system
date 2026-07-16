import { create } from 'zustand'
import { lineTotal, roundMoney } from '@/lib/money'
import type { CartItem, CartProduct } from '@/types/cart'

type CartState = {
  items: CartItem[]
  taxRate: number
  amountReceived: number | null
  addItem: (product: CartProduct, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  setTaxRate: (rate: number) => void
  setAmountReceived: (amount: number | null) => void
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  taxRate: 0,
  amountReceived: null,

  addItem: (product, quantity = 1) => {
    const qty = roundMoney(quantity)
    if (qty <= 0) return

    set((state) => {
      const existing = state.items.find((item) => item.productId === product.id)
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.productId === product.id
              ? { ...item, quantity: roundMoney(item.quantity + qty) }
              : item,
          ),
        }
      }

      return {
        items: [
          ...state.items,
          {
            productId: product.id,
            sku: product.sku,
            name: product.name,
            unitPrice: roundMoney(product.sellingPrice),
            quantity: qty,
          },
        ],
      }
    })
  },

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

  clearCart: () => set({ items: [], amountReceived: null }),

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
