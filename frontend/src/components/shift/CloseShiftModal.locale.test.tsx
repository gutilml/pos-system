import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { CloseShiftModal } from '@/components/shift/CloseShiftModal'
import { useAuthStore } from '@/store/useAuthStore'
import { useShiftStore } from '@/store/useShiftStore'

describe('CloseShiftModal locale', () => {
  beforeEach(() => {
    useShiftStore.setState({
      currentShift: {
        id: 'shift-1',
        storeId: 'store-1',
        status: 'OPEN',
        startingCash: 100,
        expectedCash: null,
        actualCash: null,
        discrepancy: null,
        openedAt: new Date().toISOString(),
        closedAt: null,
      },
      lastClosedShift: null,
      isLoading: false,
      error: null,
      hydrationFailed: false,
    })
    useAuthStore.setState({
      user: {
        id: 'u1',
        username: 'cashier',
        role: 'CASHIER',
        storeId: 'store-1',
        storeName: 'Demo',
        active: true,
        uiLocale: 'es',
      },
      status: 'authenticated',
      error: null,
    })
  })

  it('renders Spanish close-shift chrome when locale is es', () => {
    render(<CloseShiftModal open onClose={() => undefined} />)
    expect(screen.getByRole('heading', { name: /Cerrar turno/i })).toBeInTheDocument()
    expect(screen.getByLabelText('Efectivo contado')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cerrar turno' })).toBeInTheDocument()
  })
})
