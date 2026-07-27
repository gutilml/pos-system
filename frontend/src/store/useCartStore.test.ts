import { beforeEach, describe, expect, it } from 'vitest'
import {
  resetCartForTests,
  selectActiveAmountReceived,
  selectActiveCustomer,
  selectActiveGlobalDiscountPercentage,
  selectActiveItems,
  selectActivePayments,
  selectAvailableCredit,
  selectBalanceDue,
  selectCanCompleteSale,
  selectChangeDue,
  selectGrandTotal,
  selectPayableGrandTotal,
  paymentsForApi,
  selectSubtotal,
  selectTaxTotal,
  selectTotalDiscountAmount,
  selectTotalTendered,
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

const special = {
  id: 'p-special',
  sku: '3001',
  name: 'Daily Special',
  sellingPrice: 2.5,
  excludeFromGlobalDiscounts: true,
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

  it('tracks payment tenders and balance due with scale-4 math', () => {
    const { addItem, upsertPayment, removePayment } = useCartStore.getState()
    addItem(cola, 2)
    addItem(chips, 1)

    const state0 = useCartStore.getState()
    const items = selectActiveItems(state0)
    expect(selectGrandTotal(items, 0)).toBe(6.48)
    expect(selectBalanceDue(items, 0, selectActivePayments(state0))).toBe(6.48)

    expect(upsertPayment('CASH', 2.48)).toBe(true)
    expect(upsertPayment('CREDIT', 4)).toBe(true)

    const state1 = useCartStore.getState()
    const payments = selectActivePayments(state1)
    expect(selectTotalTendered(payments)).toBe(6.48)
    expect(selectBalanceDue(items, 0, payments)).toBe(0)
    expect(selectCanCompleteSale(items, 0, payments, null)).toBe(false)

    useCartStore.getState().setCustomer({
      id: 'cust-1',
      name: 'Dana',
      phone: null,
      creditLimit: 100,
      currentBalance: 10,
    })
    const state2 = useCartStore.getState()
    expect(
      selectCanCompleteSale(
        items,
        0,
        selectActivePayments(state2),
        selectActiveCustomer(state2),
      ),
    ).toBe(true)
    expect(selectAvailableCredit(selectActiveCustomer(state2)!)).toBe(90)

    removePayment(payments[0].id)
    const state3 = useCartStore.getState()
    expect(selectBalanceDue(items, 0, selectActivePayments(state3))).toBe(2.48)
  })

  it('completes against payable 2dp when internal total has mills', () => {
    const { addItem, setTaxRate, upsertPayment } = useCartStore.getState()
    addItem(cola, 2)
    addItem(chips, 1)
    setTaxRate(0.0825)

    const state = useCartStore.getState()
    const items = selectActiveItems(state)
    expect(selectGrandTotal(items, state.taxRate)).toBe(7.0146)
    expect(selectPayableGrandTotal(items, state.taxRate)).toBe(7.01)

    expect(upsertPayment('CASH', 7.01)).toBe(true)
    // CASH overage is now allowed (customer may hand over more; change is returned)
    expect(upsertPayment('CASH', 7.02)).toBe(true)

    const payments = selectActivePayments(useCartStore.getState())
    expect(selectBalanceDue(items, state.taxRate, payments)).toBe(0)
    expect(selectCanCompleteSale(items, state.taxRate, payments, null)).toBe(true)
    expect(paymentsForApi(payments, selectGrandTotal(items, state.taxRate))).toEqual([
      expect.objectContaining({ method: 'CASH', amount: 7.0146 }),
    ])
  })

  it('upsertPayment replaces per method, clears on zero, and rejects non-cash overpay', () => {
    const { addItem, upsertPayment } = useCartStore.getState()
    addItem(cola, 2)
    addItem(chips, 1)

    expect(upsertPayment('CASH', 2)).toBe(true)
    expect(upsertPayment('CASH', 3)).toBe(true)
    expect(selectActivePayments(useCartStore.getState())).toEqual([
      expect.objectContaining({ method: 'CASH', amount: 3 }),
    ])

    expect(upsertPayment('CARD', 10)).toBe(false)
    expect(selectActivePayments(useCartStore.getState())).toHaveLength(1)

    expect(upsertPayment('CASH', 0)).toBe(true)
    expect(selectActivePayments(useCartStore.getState())).toHaveLength(0)
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

  it('replicates backend discount math for item, global, and excluded lines', () => {
    const { addItem, setItemDiscountPercentage, setGlobalDiscountPercentage } =
      useCartStore.getState()

    addItem(cola, 1)
    addItem(chips, 1)
    addItem(special, 1)

    setItemDiscountPercentage(cola.id, 0.1)
    setGlobalDiscountPercentage(0.1)

    const state = useCartStore.getState()
    const items = selectActiveItems(state)
    const global = selectActiveGlobalDiscountPercentage(state)

    expect(selectSubtotal(items, global)).toBe(6.541)
    expect(selectTotalDiscountAmount(items, global)).toBe(0.449)
    expect(items[0].itemDiscountPercentage).toBe(0.1)
    expect(items[2].excludeFromGlobalDiscounts).toBe(true)
  })

  it('does not stack global on item-discounted lines', () => {
    resetCartForTests({
      items: [
        {
          productId: 'p-premium',
          sku: 'PREM',
          name: 'Premium',
          unitPrice: 100,
          quantity: 1,
          itemDiscountPercentage: 0.1,
        },
      ],
      globalDiscountPercentage: 0.1,
    })

    const state = useCartStore.getState()
    const items = selectActiveItems(state)
    const global = selectActiveGlobalDiscountPercentage(state)

    expect(selectSubtotal(items, global)).toBe(90)
    expect(selectTotalDiscountAmount(items, global)).toBe(10)
  })
})
