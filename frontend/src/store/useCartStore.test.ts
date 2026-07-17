import { beforeEach, describe, expect, it } from 'vitest'
import {
  resetCartForTests,
  selectActiveAmountReceived,
  selectActiveItems,
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

const deliHam = {
  id: 'p-ham',
  sku: '2001',
  name: 'Deli Ham',
  sellingPrice: 0.0125,
  sellByWeight: true,
  unitOfMeasure: 'gr',
}

describe('useCartStore', () => {
  beforeEach(() => {
    localStorage.clear()
    resetCartForTests()
  })

  it('adds items and merges quantities for the same product', () => {
    const { addItem } = useCartStore.getState()
    addItem(cola, 1)
    addItem(cola, 2)

    const items = selectActiveItems(useCartStore.getState())
    expect(items).toHaveLength(1)
    expect(items[0].quantity).toBe(3)
    expect(selectSubtotal(items)).toBe(5.97)
  })

  it('calculates subtotal, tax, and grand total with scale-4 money math', () => {
    const { addItem, setTaxRate } = useCartStore.getState()
    addItem(cola, 2) // 3.98
    addItem(chips, 1) // 2.50 → subtotal 6.48
    setTaxRate(0.0825)

    const state = useCartStore.getState()
    const items = selectActiveItems(state)
    expect(selectSubtotal(items)).toBe(6.48)
    expect(selectTaxTotal(items, state.taxRate)).toBe(0.5346)
    expect(selectGrandTotal(items, state.taxRate)).toBe(7.0146)
  })

  it('calculates change due from amount received', () => {
    const { addItem, setAmountReceived } = useCartStore.getState()
    addItem(cola, 1)
    setAmountReceived(5)

    const state = useCartStore.getState()
    const items = selectActiveItems(state)
    expect(
      selectChangeDue(items, state.taxRate, selectActiveAmountReceived(state)),
    ).toBe(3.01)
  })

  it('removes an item when quantity is updated to zero', () => {
    const { addItem, updateQuantity } = useCartStore.getState()
    addItem(cola, 1)
    updateQuantity(cola.id, 0)

    expect(selectActiveItems(useCartStore.getState())).toHaveLength(0)
  })

  it('intercepts sellByWeight products into pendingWeightProduct', () => {
    const { addItem } = useCartStore.getState()
    addItem(deliHam)

    const state = useCartStore.getState()
    expect(selectActiveItems(state)).toHaveLength(0)
    expect(state.pendingWeightProduct?.id).toBe(deliHam.id)
  })

  it('confirmWeight adds the pending product with the entered quantity', () => {
    const { addItem, confirmWeight } = useCartStore.getState()
    addItem(deliHam)
    confirmWeight(250)

    const state = useCartStore.getState()
    const items = selectActiveItems(state)
    expect(state.pendingWeightProduct).toBeNull()
    expect(items).toHaveLength(1)
    expect(items[0].quantity).toBe(250)
    expect(items[0].productId).toBe(deliHam.id)
  })

  it('persists tickets to localStorage and can rehydrate them', async () => {
    const { addItem, setTaxRate } = useCartStore.getState()
    addItem(cola, 2)
    setTaxRate(0.0825)

    const raw = localStorage.getItem('pos-cart')
    expect(raw).toBeTruthy()
    const parsed = JSON.parse(raw!) as {
      state: {
        tickets: Record<string, { items: unknown[] }>
        activeTicketId: string
        taxRate: number
      }
    }
    const activeItems = parsed.state.tickets[parsed.state.activeTicketId]?.items
    expect(activeItems).toHaveLength(1)
    expect(parsed.state.taxRate).toBe(0.0825)

    resetCartForTests()
    expect(selectActiveItems(useCartStore.getState())).toHaveLength(0)

    localStorage.setItem('pos-cart', raw!)
    await useCartStore.persist.rehydrate()

    const rehydrated = useCartStore.getState()
    const items = selectActiveItems(rehydrated)
    expect(items).toHaveLength(1)
    expect(items[0].sku).toBe('1001')
    expect(items[0].quantity).toBe(2)
    expect(rehydrated.taxRate).toBe(0.0825)
  })

  it('isolates items across tickets and preserves amount received when switching', () => {
    const { addItem, createNewTicket, switchTicket, setAmountReceived } =
      useCartStore.getState()

    addItem(cola, 1)
    setAmountReceived(5)
    const firstId = useCartStore.getState().activeTicketId

    createNewTicket()
    addItem(chips, 2)
    const secondId = useCartStore.getState().activeTicketId
    expect(secondId).not.toBe(firstId)
    expect(selectActiveItems(useCartStore.getState())).toHaveLength(1)
    expect(selectActiveItems(useCartStore.getState())[0].sku).toBe('1002')

    switchTicket(firstId)
    const state = useCartStore.getState()
    expect(selectActiveItems(state)[0].sku).toBe('1001')
    expect(selectActiveAmountReceived(state)).toBe(5)
  })

  it('always keeps at least one ticket when the last tab is closed', () => {
    const { closeTicket } = useCartStore.getState()
    const onlyId = useCartStore.getState().activeTicketId

    closeTicket(onlyId)

    const state = useCartStore.getState()
    expect(state.ticketOrder).toHaveLength(1)
    expect(state.activeTicketId).not.toBe(onlyId)
    expect(selectActiveItems(state)).toHaveLength(0)
  })
})
