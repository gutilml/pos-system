import { describe, expect, it } from 'vitest'
import { formatCartStockDisplay } from '@/components/register/CartItemRow'
import type { CartItem } from '@/types/cart'

describe('formatCartStockDisplay Feature 112', () => {
  it('shows dash when inventory is not tracked', () => {
    const item: CartItem = {
      productId: 'c1',
      sku: '1',
      name: 'Child',
      unitPrice: 1,
      quantity: 2,
      trackInventory: false,
      currentStock: 0,
    }
    expect(formatCartStockDisplay(item)).toBe('—')
  })

  it('subtracts shared parent pool across sibling child lines', () => {
    const a: CartItem = {
      productId: 'child-a',
      sku: 'a',
      name: 'Child A',
      unitPrice: 1,
      quantity: 3,
      trackInventory: true,
      currentStock: 24,
      stockedProductId: 'parent-1',
    }
    const b: CartItem = {
      productId: 'child-b',
      sku: 'b',
      name: 'Child B',
      unitPrice: 1,
      quantity: 5,
      trackInventory: true,
      currentStock: 24,
      stockedProductId: 'parent-1',
    }
    expect(formatCartStockDisplay(a, [a, b])).toBe('16')
    expect(formatCartStockDisplay(b, [a, b])).toBe('16')
  })
})
