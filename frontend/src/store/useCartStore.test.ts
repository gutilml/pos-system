import { beforeEach, describe, expect, it } from 'vitest'
import {
  selectChangeDue,
  selectGrandTotal,
  selectSubtotal,
  selectTaxTotal,
  useCartStore,
} from '@/store/useCartStore'

const cola = {
  id: 'p-cola',
  sku: '1001',
  name: 'Cola 12oz',
  sellingPrice: 1.99,
}

const chips = {
  id: 'p-chips',
  sku: '1002',
  name: 'Chips',
  sellingPrice: 2.5,
}

describe('useCartStore', () => {
  beforeEach(() => {
    useCartStore.setState({
      items: [],
      taxRate: 0,
      amountReceived: null,
    })
  })

  it('adds items and merges quantities for the same product', () => {
    const { addItem } = useCartStore.getState()
    addItem(cola, 1)
    addItem(cola, 2)

    const { items } = useCartStore.getState()
    expect(items).toHaveLength(1)
    expect(items[0].quantity).toBe(3)
    expect(selectSubtotal(items)).toBe(5.97)
  })

  it('calculates subtotal, tax, and grand total with scale-4 money math', () => {
    const { addItem, setTaxRate } = useCartStore.getState()
    addItem(cola, 2) // 3.98
    addItem(chips, 1) // 2.50 → subtotal 6.48
    setTaxRate(0.0825)

    const { items, taxRate } = useCartStore.getState()
    expect(selectSubtotal(items)).toBe(6.48)
    expect(selectTaxTotal(items, taxRate)).toBe(0.5346)
    expect(selectGrandTotal(items, taxRate)).toBe(7.0146)
  })

  it('calculates change due from amount received', () => {
    const { addItem, setAmountReceived } = useCartStore.getState()
    addItem(cola, 1)
    setAmountReceived(5)

    const { items, taxRate, amountReceived } = useCartStore.getState()
    expect(selectChangeDue(items, taxRate, amountReceived)).toBe(3.01)
  })

  it('removes an item when quantity is updated to zero', () => {
    const { addItem, updateQuantity } = useCartStore.getState()
    addItem(cola, 1)
    updateQuantity(cola.id, 0)

    expect(useCartStore.getState().items).toHaveLength(0)
  })
})
