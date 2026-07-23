import { render, screen } from '@testing-library/react'
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
})
