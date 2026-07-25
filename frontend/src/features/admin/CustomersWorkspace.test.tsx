import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CustomersWorkspace } from '@/features/admin/CustomersWorkspace'
import { useAuthStore } from '@/store/useAuthStore'

vi.mock('@/api/customers', () => ({
  searchCustomers: vi.fn(),
  createCustomer: vi.fn(),
  updateCustomer: vi.fn(),
  deleteCustomer: vi.fn(),
  getCustomerLedger: vi.fn(),
  payCustomerBalance: vi.fn(),
  getCustomer: vi.fn(),
}))

import {
  getCustomerLedger,
  payCustomerBalance,
  searchCustomers,
} from '@/api/customers'

describe('CustomersWorkspace', () => {
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
        enableCustomerCredit: true,
        uiLocale: 'en',
      },
      status: 'authenticated',
      error: null,
    })
    vi.mocked(searchCustomers).mockResolvedValue([
      {
        id: 'cust-1',
        storeId: 'store-1',
        name: 'Ana',
        phone: '555-0100',
        creditLimit: 100,
        currentBalance: 40,
      },
    ])
    vi.mocked(getCustomerLedger).mockResolvedValue([])
  })

  it('loads customers on mount and opens detail on row click', async () => {
    const user = userEvent.setup()
    render(<CustomersWorkspace />)

    await waitFor(() => {
      expect(searchCustomers).toHaveBeenCalledWith('', 'store-1')
    })
    expect(await screen.findByText('Ana')).toBeInTheDocument()

    await user.click(screen.getByTestId('customer-row-cust-1'))
    expect(await screen.findByTestId('customer-name')).toHaveValue('Ana')
    expect(screen.getByTestId('customers-credit-section')).toBeInTheDocument()
  })

  it('hides credit section when enableCustomerCredit is false', async () => {
    const user = userEvent.setup()
    useAuthStore.setState({
      user: {
        id: 'u1',
        username: 'cashier',
        role: 'CASHIER',
        storeId: 'store-1',
        storeName: 'Demo',
        active: true,
        enableCustomerCredit: false,
        uiLocale: 'en',
      },
      status: 'authenticated',
      error: null,
    })

    render(<CustomersWorkspace />)
    expect(await screen.findByText('Ana')).toBeInTheDocument()
    await user.click(screen.getByTestId('customer-row-cust-1'))
    expect(await screen.findByTestId('customer-name')).toHaveValue('Ana')
    expect(screen.queryByTestId('customers-credit-section')).not.toBeInTheDocument()
    expect(screen.queryByTestId('customer-credit-limit')).not.toBeInTheDocument()
    expect(getCustomerLedger).not.toHaveBeenCalled()
  })

  it('filters list when typing in search', async () => {
    const user = userEvent.setup()
    render(<CustomersWorkspace />)
    await waitFor(() => expect(searchCustomers).toHaveBeenCalled())

    vi.mocked(searchCustomers).mockResolvedValue([])
    await user.type(screen.getByTestId('customers-filter'), 'zzz')

    await waitFor(() => {
      expect(searchCustomers).toHaveBeenCalledWith('zzz', 'store-1')
    })
  })

  it('opens pay modal and submits CASH payment', async () => {
    const user = userEvent.setup()
    vi.mocked(payCustomerBalance).mockResolvedValue({
      id: 'cust-1',
      storeId: 'store-1',
      name: 'Ana',
      phone: '555-0100',
      creditLimit: 100,
      currentBalance: 30,
    })

    render(<CustomersWorkspace />)
    expect(await screen.findByText('Ana')).toBeInTheDocument()
    await user.click(screen.getByTestId('customer-row-cust-1'))
    await user.click(screen.getByTestId('customers-pay'))

    expect(screen.getByTestId('customer-payment-modal')).toBeInTheDocument()
    expect(screen.queryByTestId('customer-pay-method-credit')).not.toBeInTheDocument()

    await user.type(screen.getByTestId('customer-pay-modal-amount'), '10')
    await user.click(screen.getByTestId('customer-pay-modal-submit'))

    await waitFor(() => {
      expect(payCustomerBalance).toHaveBeenCalledWith('cust-1', 10, 'CASH')
    })
  })

  it('gates credit limit behind has-credit checkbox on create', async () => {
    const user = userEvent.setup()
    render(<CustomersWorkspace />)
    await user.click(screen.getByTestId('customers-new'))
    expect(screen.getByTestId('customer-has-credit')).not.toBeChecked()
    expect(screen.queryByTestId('customer-credit-limit')).not.toBeInTheDocument()
    await user.click(screen.getByTestId('customer-has-credit'))
    expect(screen.getByTestId('customer-credit-limit')).toBeInTheDocument()
  })
})
