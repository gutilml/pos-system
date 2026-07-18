import { beforeEach, describe, expect, it, vi } from 'vitest'
import { resetCartForTests, selectActiveItems, useCartStore } from '@/store/useCartStore'
import { useShiftStore } from '@/store/useShiftStore'
import type { Shift } from '@/api/shifts'

vi.mock('@/api/shifts', () => ({
  DEFAULT_STORE_ID: 'store-1',
  fetchCurrentShift: vi.fn(),
  openShiftRequest: vi.fn(),
  closeShiftRequest: vi.fn(),
}))

import {
  closeShiftRequest,
  fetchCurrentShift,
  openShiftRequest,
} from '@/api/shifts'

const openShift: Shift = {
  id: 'shift-1',
  storeId: 'store-1',
  status: 'OPEN',
  startingCash: 100,
  expectedCash: null,
  actualCash: null,
  discrepancy: null,
  openedAt: '2026-07-16T12:00:00Z',
  closedAt: null,
}

describe('useShiftStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useShiftStore.setState({
      currentShift: null,
      isLoading: false,
      error: null,
      hydrationFailed: false,
    })
    resetCartForTests({
      items: [
        {
          productId: 'p1',
          sku: '1001',
          name: 'Cola',
          unitPrice: 1.99,
          quantity: 1,
        },
      ],
    })
  })

  it('checkCurrentShift sets currentShift from the API', async () => {
    vi.mocked(fetchCurrentShift).mockResolvedValue(openShift)

    await useShiftStore.getState().checkCurrentShift()

    expect(fetchCurrentShift).toHaveBeenCalledWith('store-1')
    expect(useShiftStore.getState().currentShift?.id).toBe('shift-1')
    expect(useShiftStore.getState().isLoading).toBe(false)
    expect(useShiftStore.getState().hydrationFailed).toBe(false)
  })

  it('checkCurrentShift treats null as no open shift without failing hydration', async () => {
    vi.mocked(fetchCurrentShift).mockResolvedValue(null)

    await useShiftStore.getState().checkCurrentShift()

    expect(useShiftStore.getState().currentShift).toBeNull()
    expect(useShiftStore.getState().hydrationFailed).toBe(false)
    expect(useShiftStore.getState().error).toBeNull()
  })

  it('checkCurrentShift marks hydrationFailed on API errors', async () => {
    vi.mocked(fetchCurrentShift).mockRejectedValue(new Error('Network down'))

    await useShiftStore.getState().checkCurrentShift()

    expect(useShiftStore.getState().currentShift).toBeNull()
    expect(useShiftStore.getState().hydrationFailed).toBe(true)
    expect(useShiftStore.getState().error).toBe('Network down')
    expect(useShiftStore.getState().isLoading).toBe(false)
  })

  it('openShift stores the returned shift', async () => {
    vi.mocked(openShiftRequest).mockResolvedValue(openShift)

    await useShiftStore.getState().openShift(100)

    expect(openShiftRequest).toHaveBeenCalledWith('store-1', 100)
    expect(useShiftStore.getState().currentShift?.status).toBe('OPEN')
  })

  it('closeShift clears the shift and the cart', async () => {
    useShiftStore.setState({ currentShift: openShift })
    vi.mocked(closeShiftRequest).mockResolvedValue({
      ...openShift,
      status: 'CLOSED',
      actualCash: 150,
      expectedCash: 150,
      discrepancy: 0,
    })

    await useShiftStore.getState().closeShift(150)

    expect(closeShiftRequest).toHaveBeenCalledWith('shift-1', 150)
    expect(useShiftStore.getState().currentShift).toBeNull()
    expect(selectActiveItems(useCartStore.getState())).toHaveLength(0)
    expect(useCartStore.getState().ticketOrder).toHaveLength(1)
  })
})
