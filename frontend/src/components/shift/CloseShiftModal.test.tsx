import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CloseShiftModal } from '@/components/shift/CloseShiftModal'
import { useShiftStore } from '@/store/useShiftStore'
import type { Shift } from '@/api/shifts'

vi.mock('@/api/shifts', () => ({
  DEFAULT_STORE_ID: 'store-1',
  fetchCurrentShift: vi.fn(),
  openShiftRequest: vi.fn(),
  closeShiftRequest: vi.fn(),
  addDrawerEventRequest: vi.fn(),
}))

import { closeShiftRequest } from '@/api/shifts'

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

describe('CloseShiftModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useShiftStore.setState({
      currentShift: openShift,
      lastClosedShift: null,
      isLoading: false,
      error: null,
      hydrationFailed: false,
    })
  })

  it('keeps the blind count blind (no expected or tender totals before submit)', () => {
    render(<CloseShiftModal open onClose={() => undefined} />)

    expect(screen.getByRole('heading', { name: /blind count/i })).toBeInTheDocument()
    expect(screen.queryByTestId('ticket-expected-cash')).not.toBeInTheDocument()
    expect(screen.queryByText('Expected cash')).not.toBeInTheDocument()
    expect(screen.queryByText(/sales summary/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/^Card$/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/credit \(store tab\)/i)).not.toBeInTheDocument()
    expect(screen.getByLabelText(/actual cash/i)).toBeInTheDocument()
  })

  it('closes the blind-count modal after a successful close', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    vi.mocked(closeShiftRequest).mockResolvedValue({
      ...openShift,
      status: 'CLOSED',
      expectedCash: 150,
      actualCash: 150,
      discrepancy: 0,
      closedAt: '2026-07-16T20:00:00Z',
      totalCashPayments: 40,
      totalCardPayments: 20,
      totalCreditPayments: 5,
      totalSalesGrandTotal: 65,
    })

    render(<CloseShiftModal open onClose={onClose} />)

    await user.type(screen.getByLabelText(/actual cash/i), '150')
    await user.click(screen.getByRole('button', { name: /close shift/i }))

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled()
    })
    expect(useShiftStore.getState().lastClosedShift?.expectedCash).toBe(150)
    expect(useShiftStore.getState().lastClosedShift?.totalCardPayments).toBe(20)
  })

  it('closes when Escape is pressed', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<CloseShiftModal open onClose={onClose} />)

    await user.keyboard('{Escape}')

    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
