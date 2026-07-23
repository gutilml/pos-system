import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CashierMenu } from '@/components/shift/CashierMenu'
import { useAuthStore } from '@/store/useAuthStore'
import { useShiftStore } from '@/store/useShiftStore'

vi.mock('@/api/storeSettings', () => ({
  patchStoreSettings: vi.fn(),
}))

import { patchStoreSettings } from '@/api/storeSettings'

describe('CashierMenu language', () => {
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
  })

  it('PATCHes store preferences when switching to Spanish', async () => {
    const user = userEvent.setup()
    vi.mocked(patchStoreSettings).mockResolvedValue({
      storeId: 'store-1',
      storeName: 'Demo',
      features: {},
      preferences: { ui_locale: 'es' },
      uiLocale: 'es',
    })

    render(<CashierMenu />)
    await user.click(screen.getByRole('button', { name: /Cashier/ }))
    await user.click(screen.getByTestId('lang-es'))

    expect(patchStoreSettings).toHaveBeenCalledWith('store-1', {
      preferences: { ui_locale: 'es' },
    })
    expect(useAuthStore.getState().user?.uiLocale).toBe('es')
    expect(screen.getByRole('button', { name: /Cajero/ })).toBeInTheDocument()
  })
})
