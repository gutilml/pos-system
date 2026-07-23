import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CheckoutFooter } from '@/components/register/CheckoutFooter'
import { resetCartForTests } from '@/store/useCartStore'

vi.mock('@/api/transactions', () => ({
  createTransaction: vi.fn(),
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

  it('does not show a footer Card shortcut', () => {
    render(<CheckoutFooter />)
    expect(screen.queryByTestId('card-payment')).not.toBeInTheDocument()
  })

  it('shows discount saved and reduced total when global discount applies', async () => {
    const user = userEvent.setup()
    render(<CheckoutFooter />)
    expect(screen.queryByTestId('discount-saved')).not.toBeInTheDocument()

    const globalInput = screen.getByLabelText('Global Discount %')
    await user.clear(globalInput)
    await user.type(globalInput, '10')
    await user.tab()

    expect(screen.getByTestId('discount-saved')).toHaveTextContent('−0.20')
    expect(screen.getByText('Total').nextElementSibling).toHaveTextContent('1.79')
  })
})
