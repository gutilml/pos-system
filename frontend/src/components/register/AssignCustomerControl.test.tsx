import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AssignCustomerControl } from '@/components/register/AssignCustomerControl'
import { useAuthStore } from '@/store/useAuthStore'
import { resetCartForTests, selectActiveCustomer, useCartStore } from '@/store/useCartStore'

vi.mock('@/api/customers', () => ({
  searchCustomers: vi.fn(),
}))

import { searchCustomers } from '@/api/customers'

describe('AssignCustomerControl', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetCartForTests()
    useCartStore.getState().setCustomer(null)
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

  it('assigns a customer from the selling screen without opening Pay', async () => {
    const user = userEvent.setup()
    vi.mocked(searchCustomers).mockResolvedValue([
      {
        id: 'cust-1',
        storeId: 'store-1',
        name: 'Dana Tab',
        phone: '555-0100',
        creditLimit: 500,
        currentBalance: 50,
      },
    ])

    render(<AssignCustomerControl />)
    expect(screen.queryByTestId('open-checkout')).not.toBeInTheDocument()
    expect(screen.getByTestId('open-assign-customer')).toHaveTextContent('Assign customer')

    await user.click(screen.getByTestId('open-assign-customer'))
    expect(screen.getByTestId('assign-customer-modal')).toBeInTheDocument()

    await user.type(screen.getByLabelText('Find customer'), 'Dana')
    await waitFor(() => {
      expect(searchCustomers).toHaveBeenCalled()
    })
    await user.click(await screen.findByRole('button', { name: /Dana Tab/ }))

    expect(selectActiveCustomer(useCartStore.getState())?.id).toBe('cust-1')
    expect(screen.queryByTestId('assign-customer-modal')).not.toBeInTheDocument()
    expect(screen.getByTestId('header-customer')).toHaveTextContent('Dana Tab')
  })

  it('clears the assigned customer from the selling screen', async () => {
    const user = userEvent.setup()
    useCartStore.getState().setCustomer({
      id: 'cust-1',
      name: 'Dana Tab',
      phone: null,
      creditLimit: 500,
      currentBalance: 50,
    })

    render(<AssignCustomerControl />)
    await user.click(screen.getByTestId('open-assign-customer'))
    await user.click(screen.getByTestId('clear-assigned-customer'))

    expect(selectActiveCustomer(useCartStore.getState())).toBeNull()
    expect(screen.queryByTestId('assign-customer-modal')).not.toBeInTheDocument()
  })

  it('renders Spanish customer chrome when locale is es', async () => {
    const user = userEvent.setup()
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

    render(<AssignCustomerControl />)
    expect(screen.getByTestId('open-assign-customer')).toHaveTextContent('Asignar cliente')

    await user.click(screen.getByTestId('open-assign-customer'))
    expect(screen.getByRole('heading', { name: 'Asignar cliente' })).toBeInTheDocument()
    expect(screen.getByLabelText('Buscar cliente')).toBeInTheDocument()
  })
})
