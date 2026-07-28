import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DrawerEventModal } from '@/components/shift/DrawerEventModal'
import { useShiftStore } from '@/store/useShiftStore'
import type { Shift } from '@/api/shifts'

vi.mock('@/api/shifts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/shifts')>()
  return {
    ...actual,
    fetchCurrentShift: vi.fn(),
    openShiftRequest: vi.fn(),
    closeShiftRequest: vi.fn(),
    addDrawerEventRequest: vi.fn(),
  }
})

import { addDrawerEventRequest } from '@/api/shifts'

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

describe('DrawerEventModal', () => {
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

  it('rejects blank reason and non-positive amount without calling the API', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<DrawerEventModal open onClose={onClose} />)

    await user.click(screen.getByTestId('drawer-event-submit'))
    expect(screen.getByTestId('drawer-event-error')).toHaveTextContent(/greater than zero/i)
    expect(addDrawerEventRequest).not.toHaveBeenCalled()

    await user.type(screen.getByTestId('drawer-amount'), '10')
    await user.click(screen.getByTestId('drawer-event-submit'))
    expect(screen.getByTestId('drawer-event-error')).toHaveTextContent(/reason/i)
    expect(addDrawerEventRequest).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('rejects reason shorter than 10 characters', async () => {
    const user = userEvent.setup()
    render(<DrawerEventModal open onClose={vi.fn()} />)

    await user.type(screen.getByTestId('drawer-amount'), '10')
    await user.type(screen.getByTestId('drawer-reason'), 'PAGO')
    await user.click(screen.getByTestId('drawer-event-submit'))

    expect(screen.getByTestId('drawer-event-error')).toHaveTextContent(/at least 10 characters/i)
    expect(addDrawerEventRequest).not.toHaveBeenCalled()
  })

  it('posts PAY_IN with amount and trimmed reason, then closes', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    vi.mocked(addDrawerEventRequest).mockResolvedValue({
      id: 'evt-1',
      shiftId: 'shift-1',
      type: 'PAY_IN',
      amount: 50,
      reason: 'Float top-up',
      createdAt: '2026-07-16T13:00:00Z',
    })

    render(<DrawerEventModal open onClose={onClose} initialType="PAY_IN" />)

    await user.type(screen.getByTestId('drawer-amount'), '50')
    await user.type(screen.getByTestId('drawer-reason'), '  Float top-up  ')
    await user.click(screen.getByTestId('drawer-event-submit'))

    await waitFor(() => {
      expect(addDrawerEventRequest).toHaveBeenCalledWith('shift-1', {
        type: 'PAY_IN',
        amount: 50,
        reason: 'Float top-up',
      })
    })
    expect(onClose).toHaveBeenCalled()
  })

  it('keeps the modal open and shows store error when the API fails', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    vi.mocked(addDrawerEventRequest).mockRejectedValue(new Error('Shift is closed'))

    render(<DrawerEventModal open onClose={onClose} initialType="PAY_OUT" />)

    expect(screen.getByTestId('drawer-type-pay-out')).toBeChecked()
    await user.type(screen.getByTestId('drawer-amount'), '20')
    await user.type(screen.getByTestId('drawer-reason'), 'Safe drop box')
    await user.click(screen.getByTestId('drawer-event-submit'))

    await waitFor(() => {
      expect(screen.getByTestId('drawer-event-error')).toHaveTextContent(/shift is closed/i)
    })
    expect(onClose).not.toHaveBeenCalled()
    expect(screen.getByTestId('drawer-amount')).toHaveValue('20')
    expect(screen.getByTestId('drawer-reason')).toHaveValue('Safe drop box')
  })

  it('asks for approval password and retries when backend requires approval', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    vi.mocked(addDrawerEventRequest)
      .mockRejectedValueOnce(new Error('PAY_OUT exceeds available cash; approval password required'))
      .mockResolvedValueOnce({
        id: 'evt-2',
        shiftId: 'shift-1',
        type: 'PAY_OUT',
        amount: 120,
        reason: 'Cash withdrawal to safe',
        createdAt: '2026-07-16T13:00:00Z',
      })

    render(<DrawerEventModal open onClose={onClose} initialType="PAY_OUT" />)

    await user.type(screen.getByTestId('drawer-amount'), '120')
    await user.type(screen.getByTestId('drawer-reason'), 'Cash withdrawal to safe')
    await user.click(screen.getByTestId('drawer-event-submit'))

    await waitFor(() => {
      expect(screen.getByTestId('drawer-approval-password')).toBeInTheDocument()
    })

    await user.type(screen.getByTestId('drawer-approval-password'), 'cashier-pass')
    await user.click(screen.getByTestId('drawer-event-submit'))

    await waitFor(() => {
      expect(addDrawerEventRequest).toHaveBeenLastCalledWith('shift-1', {
        type: 'PAY_OUT',
        amount: 120,
        reason: 'Cash withdrawal to safe',
        approvalPassword: 'cashier-pass',
      })
    })
    expect(onClose).toHaveBeenCalled()
  })

  it('closes when Escape is pressed', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<DrawerEventModal open onClose={onClose} />)

    await user.keyboard('{Escape}')

    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
