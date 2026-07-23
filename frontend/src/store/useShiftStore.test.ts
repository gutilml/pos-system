import { beforeEach, describe, expect, it, vi } from 'vitest'
import { resetCartForTests, selectActiveItems, useCartStore } from '@/store/useCartStore'
import { useShiftStore } from '@/store/useShiftStore'
import type { Shift } from '@/api/shifts'

vi.mock('@/api/shifts', () => ({
  DEFAULT_STORE_ID: 'store-1',
  fetchCurrentShift: vi.fn(),
  openShiftRequest: vi.fn(),
  closeShiftRequest: vi.fn(),
  addDrawerEventRequest: vi.fn(),
}))

import {
  addDrawerEventRequest,
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

const closedShift: Shift = {
  ...openShift,
  status: 'CLOSED',
  actualCash: 148.5,
  expectedCash: 150,
  discrepancy: -1.5,
  closedAt: '2026-07-16T20:00:00Z',
}

describe('useShiftStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useShiftStore.setState({
      currentShift: null,
      lastClosedShift: null,
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

  it('openShift clears any previous lastClosedShift', async () => {
    useShiftStore.setState({ lastClosedShift: closedShift })
    vi.mocked(openShiftRequest).mockResolvedValue(openShift)

    await useShiftStore.getState().openShift(100)

    expect(useShiftStore.getState().lastClosedShift).toBeNull()
  })

  it('closeShift clears the open shift, resets cart, and retains closed shift for ticket', async () => {
    useShiftStore.setState({ currentShift: openShift })
    vi.mocked(closeShiftRequest).mockResolvedValue(closedShift)

    const returned = await useShiftStore.getState().closeShift(148.5)

    expect(closeShiftRequest).toHaveBeenCalledWith('shift-1', 148.5)
    expect(returned).toEqual(closedShift)
    expect(useShiftStore.getState().currentShift).toBeNull()
    expect(useShiftStore.getState().lastClosedShift).toEqual(closedShift)
    expect(selectActiveItems(useCartStore.getState())).toHaveLength(0)
    expect(useCartStore.getState().ticketOrder).toHaveLength(1)
  })

  it('clearLastClosedShift dismisses the ticket payload', () => {
    useShiftStore.setState({ lastClosedShift: closedShift })
    useShiftStore.getState().clearLastClosedShift()
    expect(useShiftStore.getState().lastClosedShift).toBeNull()
  })

  it('addDrawerEvent posts against the open shift id', async () => {
    useShiftStore.setState({ currentShift: openShift })
    vi.mocked(addDrawerEventRequest).mockResolvedValue({
      id: 'evt-1',
      shiftId: 'shift-1',
      type: 'PAY_OUT',
      amount: 25,
      reason: 'Safe drop',
      createdAt: '2026-07-16T14:00:00Z',
    })

    const event = await useShiftStore.getState().addDrawerEvent({
      type: 'PAY_OUT',
      amount: 25,
      reason: 'Safe drop',
    })

    expect(addDrawerEventRequest).toHaveBeenCalledWith('shift-1', {
      type: 'PAY_OUT',
      amount: 25,
      reason: 'Safe drop',
    })
    expect(event.id).toBe('evt-1')
    expect(useShiftStore.getState().currentShift?.status).toBe('OPEN')
  })
})
