import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CheckoutFooter } from '@/components/register/CheckoutFooter'
import { resetCartForTests } from '@/store/useCartStore'

vi.mock('@/api/transactions', () => ({
  createTransaction: vi.fn(),
  listTransactions: vi.fn().mockResolvedValue([]),
  getTransaction: vi.fn(),
  reimburseTransaction: vi.fn(),
  buildReimbursePayload: vi.fn(),
  transactionHasCard: vi.fn(),
}))

vi.mock('@/api/customers', () => ({
  searchCustomers: vi.fn().mockResolvedValue([]),
}))

describe('CheckoutFooter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetCartForTests({
      items: [
        {
          productId: 'p-cola',
          sku: '1001',
          name: 'Cola 12oz',
          unitPrice: 1.99,
          quantity: 1,
        },
      ],
      taxRate: 0,
    })
  })

  it('renders footer actions in locked order', () => {
    render(<CheckoutFooter />)
    const actions = screen.getByTestId('checkout-footer-actions')
    const buttons = within(actions).getAllByRole('button')
    expect(buttons.map((b) => b.getAttribute('data-testid'))).toEqual([
      'footer-clear',
      'open-global-discount',
      'open-assign-customer',
      'open-previous-tickets',
      'open-checkout',
    ])
    expect(screen.getByTestId('footer-clear').className).toMatch(/border-slate-400/)
    expect(screen.getByTestId('footer-clear').className).toMatch(/bg-slate-100/)
    expect(screen.getByTestId('open-checkout').className).toMatch(/bg-emerald-700/)
  })

  it('opens the checkout modal from Pay', async () => {
    const user = userEvent.setup()
    render(<CheckoutFooter />)

    expect(screen.queryByRole('dialog', { name: /take payment/i })).not.toBeInTheDocument()
    await user.click(screen.getByTestId('open-checkout'))
    expect(screen.getByRole('dialog', { name: /take payment/i })).toBeInTheDocument()
    expect(screen.getByTestId('checkout-grand-total')).toHaveTextContent('1.99')
  })

  it('disables Pay when the cart is empty', () => {
    resetCartForTests({ items: [] })
    render(<CheckoutFooter />)
    expect(screen.getByTestId('open-checkout')).toBeDisabled()
  })

  it('does not show a permanent global discount input', () => {
    render(<CheckoutFooter />)
    expect(screen.queryByLabelText('Global Discount %')).not.toBeInTheDocument()
    expect(screen.getByTestId('open-global-discount')).toBeInTheDocument()
  })

  it('applies global discount from the Discount button modal', async () => {
    const user = userEvent.setup()
    render(<CheckoutFooter />)
    expect(screen.queryByTestId('discount-saved')).not.toBeInTheDocument()

    await user.click(screen.getByTestId('open-global-discount'))
    expect(screen.getByTestId('global-discount-modal')).toBeInTheDocument()

    const globalInput = screen.getByLabelText('Global Discount %')
    await user.clear(globalInput)
    await user.type(globalInput, '10')
    await user.click(screen.getByTestId('apply-global-discount'))

    expect(screen.queryByTestId('global-discount-modal')).not.toBeInTheDocument()
    expect(screen.getByTestId('discount-saved')).toHaveTextContent('−0.20')
    expect(screen.getByTestId('footer-total')).toHaveTextContent('1.79')
    expect(screen.getByTestId('open-global-discount')).toHaveTextContent(/10/)
  })

  it('opens previous tickets modal', async () => {
    const user = userEvent.setup()
    render(<CheckoutFooter />)
    await user.click(screen.getByTestId('open-previous-tickets'))
    expect(screen.getByTestId('closed-tickets-modal')).toBeInTheDocument()
  })
})
