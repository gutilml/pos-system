import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { CashierMenu } from '@/components/shift/CashierMenu'
import { useAuthStore } from '@/store/useAuthStore'
import { useShiftStore } from '@/store/useShiftStore'

describe('CashierMenu without Catalog', () => {
  beforeEach(() => {
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

  it('does not offer Catalog menu item after Products workspace', async () => {
    const user = userEvent.setup()
    render(<CashierMenu />)
    await user.click(screen.getByRole('button', { name: /Cashier/ }))
    expect(screen.queryByTestId('catalog-menu-item')).not.toBeInTheDocument()
  })
})
