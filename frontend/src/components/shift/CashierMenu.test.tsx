import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CashierMenu } from '@/components/shift/CashierMenu'
import { useAuthStore } from '@/store/useAuthStore'
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

describe('CashierMenu', () => {
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
      },
      status: 'authenticated',
      error: null,
    })
    useShiftStore.setState({
      currentShift: openShift,
      lastClosedShift: null,
      isLoading: false,
      error: null,
      hydrationFailed: false,
    })
  })

  it('shows Pay in / Pay out when a shift is open and opens the drawer modal', async () => {
    const user = userEvent.setup()
    render(<CashierMenu />)

    await user.click(screen.getByRole('button', { name: /cashier/i }))
    expect(screen.getByTestId('pay-in-menu-item')).toBeInTheDocument()
    expect(screen.getByTestId('pay-out-menu-item')).toBeInTheDocument()

    await user.click(screen.getByTestId('pay-out-menu-item'))
    expect(screen.getByTestId('drawer-event-modal')).toBeInTheDocument()
    expect(screen.getByTestId('drawer-type-pay-out')).toBeChecked()
  })

  it('hides Pay in / Pay out when there is no open shift', async () => {
    const user = userEvent.setup()
    useShiftStore.setState({ currentShift: null })
    render(<CashierMenu />)

    await user.click(screen.getByRole('button', { name: /cashier/i }))
    expect(screen.queryByTestId('pay-in-menu-item')).not.toBeInTheDocument()
    expect(screen.queryByTestId('pay-out-menu-item')).not.toBeInTheDocument()
    expect(screen.getByTestId('close-shift-menu-item')).toBeDisabled()
  })
})
