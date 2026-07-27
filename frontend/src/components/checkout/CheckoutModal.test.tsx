import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CheckoutModal } from '@/components/checkout/CheckoutModal'
import {
  resetCartForTests,
  selectActivePayments,
  selectGrandTotal,
  selectPayableGrandTotal,
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

  it('pre-fills CASH with grand total on open and enables PAY immediately', async () => {
    const user = userEvent.setup()
    render(<CheckoutModal open onClose={() => undefined} />)

    expect(screen.getByTestId('checkout-grand-total')).toHaveTextContent('6.48')
    // CASH input must show the formatted total (not stay empty while store has the amount)
    expect(screen.getByLabelText('CASH')).toHaveValue('6.48')
    // CASH is pre-filled → balance is 0 → PAY enabled right away
    expect(screen.getByTestId('checkout-balance-due')).toHaveTextContent('0.00')
    expect(screen.getByTestId('complete-transaction')).toBeEnabled()
    expect(screen.getByTestId('complete-transaction')).toHaveTextContent('PAY')

    // Cashier can override: clear CASH, type partial, PAY disables until covered
    const cashInput = screen.getByLabelText('CASH')
    await user.clear(cashInput)
    await user.type(cashInput, '2.48')
    expect(screen.getByTestId('checkout-balance-due')).toHaveTextContent('4.00')
    expect(screen.getByTestId('complete-transaction')).toBeDisabled()

    await user.type(screen.getByLabelText('CARD'), '4.00')
    expect(screen.getByTestId('checkout-balance-due')).toHaveTextContent('0.00')
    expect(screen.getByTestId('checkout-tendered')).toHaveTextContent('6.48')
    expect(screen.getByTestId('complete-transaction')).toBeEnabled()
  })

  it('rejects CARD amounts that would overpay the remaining balance', async () => {
    const user = userEvent.setup()
    render(<CheckoutModal open onClose={() => undefined} />)

    // CASH is pre-filled with 6.48; clear it so CARD can be tested for overpay
    const cashInput = screen.getByLabelText('CASH')
    await user.clear(cashInput)
    await user.tab()

    await user.click(screen.getByLabelText('CARD'))
    await user.paste('99')

    expect(screen.getByTestId('tender-amount-error')).toHaveTextContent(/cannot exceed/i)
  })

  it('allows CASH above the total and shows change due', async () => {
    const user = userEvent.setup()
    render(<CheckoutModal open onClose={() => undefined} />)

    // Clear the pre-filled CASH and type an amount larger than the total
    const cashInput = screen.getByLabelText('CASH')
    await user.clear(cashInput)
    await user.type(cashInput, '10')
    await user.tab()

    // PAY enabled (tenders > total)
    expect(screen.getByTestId('complete-transaction')).toBeEnabled()
    // Change row appears
    expect(screen.getByTestId('change-due')).toHaveTextContent('3.52')
  })

  it('opens the customer gate on CREDIT blur when amount > 0', async () => {
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

    // Clear CASH pre-fill so there is room for CREDIT
    const cashInput = screen.getByLabelText('CASH')
    await user.clear(cashInput)
    await user.tab()

    const credit = screen.getByLabelText('CREDIT')
    await user.click(credit)
    expect(screen.queryByTestId('credit-customer-gate')).not.toBeInTheDocument()

    await user.type(credit, '4.00')
    await user.tab()

    expect(screen.getByTestId('credit-customer-gate')).toBeInTheDocument()
    expect(selectActivePayments(useCartStore.getState())).toHaveLength(1)
    expect(screen.getByTestId('complete-transaction')).toBeDisabled()

    await user.type(screen.getByLabelText('Find customer'), 'Dana')
    await waitFor(() => {
      expect(searchCustomers).toHaveBeenCalledWith('Dana', expect.any(String))
    })
    await user.click(await screen.findByRole('button', { name: /Dana Tab/ }))

    expect(screen.getByTestId('assigned-customer')).toHaveTextContent('Dana Tab')
    expect(screen.getByTestId('assigned-customer')).toHaveTextContent('450.00')
    expect(selectActivePayments(useCartStore.getState())[0].method).toBe('CREDIT')
    expect(selectActivePayments(useCartStore.getState())[0].amount).toBe(4)
  })

  it('lets cashier abandon the credit customer gate without clearing CREDIT amount', async () => {
    const user = userEvent.setup()
    render(<CheckoutModal open onClose={() => undefined} />)

    // Clear the CASH pre-fill so CREDIT can be typed without hitting the total cap
    const cashInput = screen.getByLabelText('CASH')
    await user.clear(cashInput)
    await user.tab()

    await user.type(screen.getByLabelText('CREDIT'), '4')
    await user.tab()
    expect(screen.getByTestId('credit-customer-gate')).toBeInTheDocument()
    await user.click(screen.getByTestId('abandon-credit-path'))
    expect(screen.queryByTestId('credit-customer-gate')).not.toBeInTheDocument()
    const payments = selectActivePayments(useCartStore.getState())
    expect(payments.some((p) => p.method === 'CREDIT')).toBe(true)
  })

  it('posts at most one payments[] entry per method on PAY', async () => {
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
    useCartStore.getState().upsertPayment('CASH', 2.48)
    useCartStore.getState().upsertPayment('CREDIT', 4)

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

  it('Print and pay completes the sale and calls window.print', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => undefined)
    vi.mocked(createTransaction).mockResolvedValue({ id: 'tx-print', status: 'COMPLETED' })

    useCartStore.getState().upsertPayment('CASH', 6.48)
    render(<CheckoutModal open onClose={onClose} />)

    await user.click(screen.getByTestId('print-and-pay'))

    await waitFor(() => {
      expect(createTransaction).toHaveBeenCalled()
    })
    expect(onClose).toHaveBeenCalled()
    await waitFor(() => {
      expect(printSpy).toHaveBeenCalled()
    })
    expect(await screen.findByTestId('sale-ticket')).toBeInTheDocument()
    printSpy.mockRestore()
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
    const total = selectPayableGrandTotal(
      useCartStore.getState().tickets[useCartStore.getState().activeTicketId].items,
      0,
      0.05,
    )
    useCartStore.getState().upsertPayment('CASH', total)

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

  it('remaps payable tenders to the internal 4dp total on PAY', async () => {
    const user = userEvent.setup()
    vi.mocked(createTransaction).mockResolvedValue({ id: 'tx-mills', status: 'COMPLETED' })

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
      taxRate: 0.0825,
    })

    const items = useCartStore.getState().tickets[useCartStore.getState().activeTicketId].items
    const internal = selectGrandTotal(items, 0.0825)
    const payable = selectPayableGrandTotal(items, 0.0825)
    expect(internal).toBe(7.0146)
    expect(payable).toBe(7.01)

    useCartStore.getState().upsertPayment('CARD', payable)
    render(<CheckoutModal open onClose={() => undefined} />)

    expect(screen.getByTestId('checkout-grand-total')).toHaveTextContent('7.01')
    expect(screen.getByTestId('checkout-balance-due')).toHaveTextContent('0.00')
    await user.click(screen.getByTestId('complete-transaction'))

    await waitFor(() => {
      expect(createTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          payments: [{ paymentMethod: 'CARD', amount: 7.0146 }],
        }),
      )
    })
  })
})
