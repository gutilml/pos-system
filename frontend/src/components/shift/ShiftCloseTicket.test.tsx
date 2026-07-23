import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ShiftCloseTicket } from '@/components/shift/ShiftCloseTicket'
import { useShiftStore } from '@/store/useShiftStore'
import type { Shift } from '@/api/shifts'

const closedShift: Shift = {
  id: 'shift-abcdef12',
  storeId: 'store-1',
  status: 'CLOSED',
  startingCash: 100,
  expectedCash: 150,
  actualCash: 148.5,
  discrepancy: -1.5,
  openedAt: '2026-07-16T12:00:00Z',
  closedAt: '2026-07-16T20:00:00Z',
  totalCashPayments: 50,
  totalCardPayments: 25,
  totalCreditPayments: 10,
  totalSalesGrandTotal: 85,
}

describe('ShiftCloseTicket', () => {
  beforeEach(() => {
    useShiftStore.setState({
      currentShift: null,
      lastClosedShift: closedShift,
      isLoading: false,
      error: null,
      hydrationFailed: false,
    })
  })

  it('renders expected, actual, and discrepancy from the closed shift', () => {
    render(<ShiftCloseTicket shift={closedShift} />)

    expect(screen.getByTestId('ticket-expected-cash')).toHaveTextContent('150.0000')
    expect(screen.getByTestId('ticket-actual-cash')).toHaveTextContent('148.5000')
    expect(screen.getByTestId('ticket-discrepancy')).toHaveTextContent('-1.5000')
    expect(screen.getByTestId('ticket-discrepancy-label')).toHaveTextContent(/shortage/i)
  })

  it('renders CARD, CREDIT, CASH, and sales grand total from the API', () => {
    render(<ShiftCloseTicket shift={closedShift} />)

    expect(screen.getByText(/sales summary/i)).toBeInTheDocument()
    expect(screen.getByTestId('ticket-total-cash')).toHaveTextContent('50.0000')
    expect(screen.getByTestId('ticket-total-card')).toHaveTextContent('25.0000')
    expect(screen.getByTestId('ticket-total-credit')).toHaveTextContent('10.0000')
    expect(screen.getByTestId('ticket-sales-grand-total')).toHaveTextContent('85.0000')
    expect(screen.getByText(/credit \(store tab\)/i)).toBeInTheDocument()
  })

  it('invokes window.print when Print is clicked', async () => {
    const user = userEvent.setup()
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => undefined)

    render(<ShiftCloseTicket shift={closedShift} />)
    await user.click(screen.getByTestId('print-close-ticket'))

    expect(printSpy).toHaveBeenCalledTimes(1)
    printSpy.mockRestore()
  })

  it('clears lastClosedShift when Done is clicked', async () => {
    const user = userEvent.setup()
    render(<ShiftCloseTicket shift={closedShift} />)

    await user.click(screen.getByTestId('dismiss-close-ticket'))

    expect(useShiftStore.getState().lastClosedShift).toBeNull()
  })
})
