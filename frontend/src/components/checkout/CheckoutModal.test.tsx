import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CheckoutModal } from '@/components/checkout/CheckoutModal'
import {
  resetCartForTests,
  selectActivePayments,
  useCartStore,
} from '@/store/useCartStore'

vi.mock('@/api/transactions', () => ({
  createTransaction: vi.fn(),
}))

vi.mock('@/api/customers', () => ({
  searchCustomers: vi.fn(),
}))

import { createTransaction } from '@/api/transactions'
import { searchCustomers } from '@/api/customers'

describe('CheckoutModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetCartForTests({
      items: [
        {
          productId: 'p-cola',
          sku: '1001',
          name: 'Cola 12oz',
          unitPrice: 1.99,
          quantity: 2,
        },
        {
          productId: 'p-chips',
          sku: '1002',
          name: 'Chips',
          unitPrice: 2.5,
          quantity: 1,
        },
      ],
      taxRate: 0,
    })
  })

  it('disables Complete Transaction until tenders cover the grand total', async () => {
    const user = userEvent.setup()
    render(<CheckoutModal open onClose={() => undefined} />)

    expect(screen.getByTestId('checkout-grand-total')).toHaveTextContent('6.4800')
    expect(screen.getByTestId('checkout-balance-due')).toHaveTextContent('6.4800')
    expect(screen.getByTestId('complete-transaction')).toBeDisabled()

    const amount = screen.getByLabelText('Tender amount')
    await user.clear(amount)
    await user.type(amount, '2.4800')
    await user.click(screen.getByRole('button', { name: 'Add tender' }))

    expect(screen.getByTestId('checkout-balance-due')).toHaveTextContent('4.0000')
    expect(screen.getByTestId('complete-transaction')).toBeDisabled()

    await user.clear(screen.getByLabelText('Tender amount'))
    await user.type(screen.getByLabelText('Tender amount'), '4.0000')
    await user.click(screen.getByRole('button', { name: 'Add tender' }))

    expect(screen.getByTestId('checkout-balance-due')).toHaveTextContent('0.0000')
    expect(screen.getByTestId('checkout-tendered')).toHaveTextContent('6.4800')
    expect(screen.getByTestId('complete-transaction')).toBeEnabled()
  })

  it('intercepts CREDIT tenders and requires a customer before adding', async () => {
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

    render(<CheckoutModal open onClose={() => undefined} />)

    await user.click(screen.getByRole('button', { name: 'CREDIT' }))
    expect(screen.getByTestId('customer-search')).toBeInTheDocument()

    await user.clear(screen.getByLabelText('Tender amount'))
    await user.type(screen.getByLabelText('Tender amount'), '4.0000')
    await user.click(screen.getByRole('button', { name: 'Add tender' }))

    // Still blocked — no customer assigned yet.
    expect(selectActivePayments(useCartStore.getState())).toHaveLength(0)
    expect(screen.getByTestId('complete-transaction')).toBeDisabled()

    await user.type(screen.getByLabelText('Find customer'), 'Dana')
    await waitFor(() => {
      expect(searchCustomers).toHaveBeenCalledWith('Dana')
    })
    await user.click(await screen.findByRole('button', { name: /Dana Tab/ }))

    expect(screen.getByTestId('assigned-customer')).toHaveTextContent('Dana Tab')
    expect(screen.getByTestId('assigned-customer')).toHaveTextContent('450.0000')

    await waitFor(() => {
      expect(selectActivePayments(useCartStore.getState())).toHaveLength(1)
    })
    expect(selectActivePayments(useCartStore.getState())[0].method).toBe('CREDIT')
    expect(selectActivePayments(useCartStore.getState())[0].amount).toBe(4)
  })

  it('posts payments[] payload and closes the ticket on success', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    vi.mocked(createTransaction).mockResolvedValue({ id: 'tx-1', status: 'COMPLETED' })

    useCartStore.getState().setCustomer({
      id: 'cust-1',
      name: 'Dana Tab',
      phone: null,
      creditLimit: 500,
      currentBalance: 0,
    })
    useCartStore.getState().addPayment('CASH', 2.48)
    useCartStore.getState().addPayment('CREDIT', 4)

    const ticketId = useCartStore.getState().activeTicketId
    render(<CheckoutModal open onClose={onClose} />)

    expect(screen.getByTestId('complete-transaction')).toBeEnabled()
    await user.click(screen.getByTestId('complete-transaction'))

    await waitFor(() => {
      expect(createTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          customerId: 'cust-1',
          payments: [
            { paymentMethod: 'CASH', amount: 2.48 },
            { paymentMethod: 'CREDIT', amount: 4 },
          ],
          items: expect.arrayContaining([
            expect.objectContaining({ productId: 'p-cola', quantity: 2 }),
          ]),
        }),
      )
    })
    expect(onClose).toHaveBeenCalled()
    expect(useCartStore.getState().activeTicketId).not.toBe(ticketId)
  })

  it('includes discount percentages in the checkout payload', async () => {
    const user = userEvent.setup()
    vi.mocked(createTransaction).mockResolvedValue({ id: 'tx-2', status: 'COMPLETED' })

    resetCartForTests({
      items: [
        {
          productId: 'p-cola',
          sku: '1001',
          name: 'Cola 12oz',
          unitPrice: 1.99,
          quantity: 1,
          itemDiscountPercentage: 0.1,
        },
      ],
      taxRate: 0,
      globalDiscountPercentage: 0.05,
    })
    useCartStore.getState().addPayment('CASH', 1.791)

    render(<CheckoutModal open onClose={() => undefined} />)
    await user.click(screen.getByTestId('complete-transaction'))

    await waitFor(() => {
      expect(createTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          globalDiscountPercentage: 0.05,
          items: [
            expect.objectContaining({
              productId: 'p-cola',
              quantity: 1,
              itemDiscountPercentage: 0.1,
            }),
          ],
        }),
      )
    })
  })
})
