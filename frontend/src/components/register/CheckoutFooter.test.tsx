import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CheckoutFooter } from '@/components/register/CheckoutFooter'
import { resetCartForTests, useCartStore } from '@/store/useCartStore'

vi.mock('@/api/transactions', () => ({
  createTransaction: vi.fn(),
}))

vi.mock('@/api/paymentApi', () => ({
  createCheckoutSession: vi.fn(),
  getTransactionStatus: vi.fn(),
}))

import { createTransaction } from '@/api/transactions'
import { createCheckoutSession } from '@/api/paymentApi'

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

  it('records an external-terminal CARD sale without Stripe', async () => {
    const user = userEvent.setup()
    vi.mocked(createTransaction).mockResolvedValue({ id: 'tx-card-1', status: 'COMPLETED' })
    const ticketId = useCartStore.getState().activeTicketId

    render(<CheckoutFooter />)
    await user.click(screen.getByTestId('card-payment'))

    await waitFor(() => {
      expect(createTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          payments: [{ paymentMethod: 'CARD', amount: 1.99 }],
        }),
      )
    })
    expect(createCheckoutSession).not.toHaveBeenCalled()
    expect(useCartStore.getState().activeTicketId).not.toBe(ticketId)
  })

  it('shows discount saved and reduced total when global discount applies', async () => {
    const user = userEvent.setup()
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
