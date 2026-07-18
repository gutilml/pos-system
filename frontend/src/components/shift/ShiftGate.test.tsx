import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ShiftGate } from '@/components/shift/ShiftGate'
import { useShiftStore } from '@/store/useShiftStore'
import type { Shift } from '@/api/shifts'

vi.mock('@/api/shifts', () => ({
  DEFAULT_STORE_ID: 'store-1',
  fetchCurrentShift: vi.fn(),
  openShiftRequest: vi.fn(),
  closeShiftRequest: vi.fn(),
}))

import { fetchCurrentShift } from '@/api/shifts'

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

describe('ShiftGate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useShiftStore.setState({
      currentShift: null,
      isLoading: true,
      error: null,
      hydrationFailed: false,
    })
  })

  it('shows a loading state while checking the current shift', () => {
    vi.mocked(fetchCurrentShift).mockImplementation(
      () => new Promise(() => undefined),
    )

    render(
      <ShiftGate>
        <div>Register Content</div>
      </ShiftGate>,
    )

    expect(screen.getByRole('status')).toHaveTextContent(/checking shift/i)
    expect(screen.queryByText('Register Content')).not.toBeInTheDocument()
  })

  it('blocks register children and shows Open Shift when no shift is active', async () => {
    vi.mocked(fetchCurrentShift).mockResolvedValue(null)

    render(
      <ShiftGate>
        <div>Register Content</div>
      </ShiftGate>,
    )

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    expect(screen.getByRole('heading', { name: /open shift/i })).toBeInTheDocument()
    expect(screen.queryByText('Register Content')).not.toBeInTheDocument()
  })

  it('renders children when an open shift exists', async () => {
    vi.mocked(fetchCurrentShift).mockResolvedValue(openShift)

    render(
      <ShiftGate>
        <div>Register Content</div>
      </ShiftGate>,
    )

    await waitFor(() => {
      expect(screen.getByText('Register Content')).toBeInTheDocument()
    })

    expect(screen.queryByRole('heading', { name: /open shift/i })).not.toBeInTheDocument()
  })

  it('shows error and Retry on hydration failure instead of Open Shift', async () => {
    const user = userEvent.setup()
    vi.mocked(fetchCurrentShift)
      .mockRejectedValueOnce(new Error('Backend unreachable'))
      .mockResolvedValueOnce(openShift)

    render(
      <ShiftGate>
        <div>Register Content</div>
      </ShiftGate>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('shift-hydration-error')).toBeInTheDocument()
    })

    expect(screen.getByRole('alert')).toHaveTextContent(/backend unreachable/i)
    expect(screen.queryByRole('heading', { name: /open shift/i })).not.toBeInTheDocument()
    expect(screen.queryByText('Register Content')).not.toBeInTheDocument()

    await user.click(screen.getByTestId('retry-shift-check'))

    await waitFor(() => {
      expect(screen.getByText('Register Content')).toBeInTheDocument()
    })
    expect(fetchCurrentShift).toHaveBeenCalledTimes(2)
  })
})
