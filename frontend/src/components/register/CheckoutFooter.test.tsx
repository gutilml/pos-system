import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CheckoutFooter } from '@/components/register/CheckoutFooter'
import { resetCartForTests } from '@/store/useCartStore'

describe('CheckoutFooter', () => {
  beforeEach(() => {
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
    expect(screen.getByTestId('checkout-grand-total')).toHaveTextContent('1.9900')
  })

  it('disables Pay when the cart is empty', () => {
    resetCartForTests({ items: [] })
    render(<CheckoutFooter />)
    expect(screen.getByTestId('open-checkout')).toBeDisabled()
  })

  it('starts card payment via the provided callback', async () => {
    const user = userEvent.setup()
    const onRequestCardPayment = vi.fn().mockResolvedValue('tx-card-1')
    render(<CheckoutFooter onRequestCardPayment={onRequestCardPayment} />)

    await user.click(screen.getByRole('button', { name: 'Card' }))
    expect(onRequestCardPayment).toHaveBeenCalled()
  })
})
