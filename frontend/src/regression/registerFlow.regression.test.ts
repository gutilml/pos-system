/**
 * High-level register smoke path (Features 089 / 078 / 087 / 101).
 * Run only via: `npm run test:regression`
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from '@/store/useAuthStore'
import { resetCartForTests, selectActiveItems, useCartStore } from '@/store/useCartStore'

vi.mock('@/api/auth', () => ({
  fetchCsrf: vi.fn().mockResolvedValue('csrf'),
  fetchMe: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
}))

vi.mock('@/api/shifts', async () => {
  const actual = await vi.importActual<typeof import('@/api/shifts')>('@/api/shifts')
  return {
    ...actual,
    listShifts: vi.fn(),
    getShiftDetail: vi.fn(),
  }
})

vi.mock('@/api/transactions', async () => {
  const actual = await vi.importActual<typeof import('@/api/transactions')>(
    '@/api/transactions',
  )
  return {
    ...actual,
    listTransactions: vi.fn(),
    reimburseTransaction: vi.fn(),
  }
})

import { login } from '@/api/auth'
import { getShiftDetail, listShifts } from '@/api/shifts'
import { listTransactions, reimburseTransaction } from '@/api/transactions'

describe('registerFlow regression smoke', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({ user: null, status: 'idle', error: null })
    resetCartForTests()
  })

  it('login hydrates tax; weight confirm; shifts and cashier reimburse APIs are callable', async () => {
    vi.mocked(login).mockResolvedValue({
      id: 'u1',
      username: 'cashier',
      role: 'CASHIER',
      storeId: 'store-1',
      storeName: 'Demo',
      active: true,
      uiLocale: 'en',
      defaultTaxRate: 0.08,
    })
    vi.mocked(listShifts).mockResolvedValue([
      {
        id: 'shift-1',
        storeId: 'store-1',
        status: 'CLOSED',
        startingCash: 100,
        expectedCash: 100,
        actualCash: 100,
        discrepancy: 0,
        openedAt: '2026-07-25T09:00:00Z',
        closedAt: '2026-07-25T17:00:00Z',
      },
    ])
    vi.mocked(getShiftDetail).mockResolvedValue({
      id: 'shift-1',
      storeId: 'store-1',
      status: 'CLOSED',
      startingCash: 100,
      expectedCash: 100,
      actualCash: 100,
      discrepancy: 0,
      openedAt: '2026-07-25T09:00:00Z',
      closedAt: '2026-07-25T17:00:00Z',
      events: [],
    })
    vi.mocked(listTransactions).mockResolvedValue([])
    vi.mocked(reimburseTransaction).mockResolvedValue({
      id: 'tx-1',
      storeId: 'store-1',
      shiftId: 'shift-1',
      customerId: null,
      status: 'COMPLETED',
      subtotal: 0,
      taxTotal: 0,
      grandTotal: 0,
      globalDiscountPercentage: 0,
      totalDiscountAmount: 0,
      amountReceived: 0,
      changeGiven: 0,
      payments: [],
      items: [],
      createdAt: '2026-07-25T12:00:00Z',
    })

    await useAuthStore.getState().login('cashier', 'cashier')
    expect(useCartStore.getState().taxRate).toBe(0.08)

    useCartStore.getState().addItem({
      id: 'p-ham',
      sku: '2001',
      name: 'Deli Ham',
      sellingPrice: 0.01,
      sellByWeight: true,
      unitOfMeasure: 'gr',
    })
    useCartStore.getState().confirmWeight(250)
    const items = selectActiveItems(useCartStore.getState())
    expect(items).toHaveLength(1)
    expect(items[0].quantity).toBe(250)

    const shifts = await listShifts('store-1')
    expect(shifts).toHaveLength(1)
    const detail = await getShiftDetail('shift-1')
    expect(detail.events).toEqual([])

    const tickets = await listTransactions('store-1')
    expect(tickets).toEqual([])
    await reimburseTransaction('tx-1', { lines: [] })
    expect(reimburseTransaction).toHaveBeenCalledWith('tx-1', { lines: [] })
  })
})
