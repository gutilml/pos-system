import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ShiftHistoryModal } from '@/components/shift/ShiftHistoryModal'
import { useAuthStore } from '@/store/useAuthStore'
import type { Shift, ShiftDetail } from '@/api/shifts'

vi.mock('@/api/shifts', async () => {
  const actual = await vi.importActual<typeof import('@/api/shifts')>('@/api/shifts')
  return {
    ...actual,
    listShifts: vi.fn(),
    getShiftDetail: vi.fn(),
  }
})

import { getShiftDetail, listShifts } from '@/api/shifts'

const closedShift: Shift = {
  id: 'shift-aaaa-bbbb-cccc-dddddddddddd',
  storeId: 'store-1',
  status: 'CLOSED',
  startingCash: 100,
  expectedCash: 150,
  actualCash: 148,
  discrepancy: -2,
  openedAt: '2026-07-24T09:00:00Z',
  closedAt: '2026-07-24T17:00:00Z',
  totalCashPayments: 50,
  totalCardPayments: 0,
  totalCreditPayments: 0,
  totalSalesGrandTotal: 50,
}

const detail: ShiftDetail = {
  ...closedShift,
  events: [
    {
      id: 'evt-1',
      shiftId: closedShift.id,
      type: 'PAY_IN',
      amount: 20,
      reason: 'Change fund',
      createdAt: '2026-07-24T10:00:00Z',
    },
  ],
}

describe('ShiftHistoryModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({
      user: {
        id: 'u1',
        username: 'cashier',
        role: 'CASHIER',
        storeId: 'store-1',
        storeName: 'Demo',
        active: true,
        uiLocale: 'en',
      },
      status: 'authenticated',
      error: null,
    })
  })

  it('lists shifts then shows detail with events and totals', async () => {
    const user = userEvent.setup()
    vi.mocked(listShifts).mockResolvedValue([closedShift])
    vi.mocked(getShiftDetail).mockResolvedValue(detail)

    render(<ShiftHistoryModal open onClose={vi.fn()} />)

    await waitFor(() => {
      expect(listShifts).toHaveBeenCalledWith('store-1')
    })
    await waitFor(() => {
      expect(screen.getByTestId(`shift-history-row-${closedShift.id}`)).toBeInTheDocument()
    })

    await user.click(screen.getByTestId(`shift-history-row-${closedShift.id}`))

    await waitFor(() => {
      expect(getShiftDetail).toHaveBeenCalledWith(closedShift.id)
      expect(screen.getByTestId('shift-history-detail')).toBeInTheDocument()
    })
    expect(screen.getByTestId('shift-history-events')).toBeInTheDocument()
    expect(screen.getByTestId('shift-history-event-evt-1')).toBeInTheDocument()
    expect(screen.getByText('Change fund')).toBeInTheDocument()
  })

  it('shows empty state when no shifts', async () => {
    vi.mocked(listShifts).mockResolvedValue([])
    render(<ShiftHistoryModal open onClose={vi.fn()} />)
    await waitFor(() => {
      expect(screen.getByText('No shifts yet.')).toBeInTheDocument()
    })
  })
})
