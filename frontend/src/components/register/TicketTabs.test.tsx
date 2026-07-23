import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { TicketTabs } from '@/components/register/TicketTabs'
import { useAuthStore } from '@/store/useAuthStore'
import { resetCartForTests, selectActiveItems, useCartStore } from '@/store/useCartStore'

describe('TicketTabs', () => {
  beforeEach(() => {
    localStorage.clear()
    resetCartForTests()
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

  it('creates a new ticket and switches the active cart', async () => {
    const user = userEvent.setup()
    useCartStore.getState().addItem({
      id: 'p-cola',
      sku: '1001',
      name: 'Cola 12oz',
      sellingPrice: 1.99,
    })

    render(<TicketTabs />)

    expect(screen.getByRole('tab', { name: /ticket 1/i })).toHaveAttribute(
      'aria-selected',
      'true',
    )

    await user.click(screen.getByRole('button', { name: /new ticket/i }))

    expect(useCartStore.getState().ticketOrder).toHaveLength(2)
    expect(selectActiveItems(useCartStore.getState())).toHaveLength(0)
    expect(screen.getByRole('tab', { name: /ticket 2/i })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  it('switches back to a previous ticket without losing items', async () => {
    const user = userEvent.setup()
    useCartStore.getState().addItem({
      id: 'p-cola',
      sku: '1001',
      name: 'Cola 12oz',
      sellingPrice: 1.99,
    })
    const firstId = useCartStore.getState().activeTicketId

    render(<TicketTabs />)
    await user.click(screen.getByRole('button', { name: /new ticket/i }))
    await user.click(screen.getByRole('tab', { name: /ticket 1/i }))

    expect(useCartStore.getState().activeTicketId).toBe(firstId)
    expect(selectActiveItems(useCartStore.getState())[0].sku).toBe('1001')
  })

  it('shows Ticket nuevo when UI locale is Spanish', () => {
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

    render(<TicketTabs />)
    expect(screen.getByRole('button', { name: 'Ticket nuevo' })).toHaveTextContent(
      '+ Ticket nuevo',
    )
  })
})
