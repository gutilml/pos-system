import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  StripePaymentModal,
  STRIPE_POLL_INTERVAL_MS,
  STRIPE_SUCCESS_DISMISS_MS,
} from '@/components/checkout/StripePaymentModal'
import { resetCartForTests, selectActiveItems, useCartStore } from '@/store/useCartStore'

vi.mock('@/api/paymentApi', () => ({
  createCheckoutSession: vi.fn(),
  getTransactionStatus: vi.fn(),
}))

import { createCheckoutSession, getTransactionStatus } from '@/api/paymentApi'

describe('StripePaymentModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ shouldAdvanceTime: true })
    resetCartForTests({
      items: [
        {
          productId: 'p-cola',
          sku: '1001',
          name: 'Cola',
          unitPrice: 1.99,
          quantity: 1,
        },
      ],
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('transitions Loading → QR → Success and closes the active ticket', async () => {
    const onClose = vi.fn()
    const ticketId = useCartStore.getState().activeTicketId

    vi.mocked(createCheckoutSession).mockResolvedValue({
      sessionId: 'cs_test',
      checkoutUrl: 'https://checkout.stripe.com/c/pay/cs_test',
    })
    vi.mocked(getTransactionStatus)
      .mockResolvedValueOnce({ id: 'tx-1', status: 'IN_PROGRESS' })
      .mockResolvedValueOnce({ id: 'tx-1', status: 'COMPLETED' })

    render(
      <StripePaymentModal open transactionId="tx-1" onClose={onClose} />,
    )

    expect(screen.getByRole('status')).toHaveTextContent(/starting stripe/i)

    await waitFor(() => {
      expect(screen.getByTestId('stripe-qr')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(STRIPE_POLL_INTERVAL_MS)
    })

    await waitFor(() => {
      expect(screen.getByTestId('payment-success')).toBeInTheDocument()
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(STRIPE_SUCCESS_DISMISS_MS)
    })

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled()
    })

    expect(useCartStore.getState().tickets[ticketId]).toBeUndefined()
    expect(selectActiveItems(useCartStore.getState())).toHaveLength(0)
  })

  it('cancel keeps the cart and closes without waiting for payment', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const onClose = vi.fn()

    vi.mocked(createCheckoutSession).mockResolvedValue({
      sessionId: 'cs_test',
      checkoutUrl: 'https://checkout.stripe.com/c/pay/cs_test',
    })
    vi.mocked(getTransactionStatus).mockResolvedValue({
      id: 'tx-1',
      status: 'IN_PROGRESS',
    })

    render(
      <StripePaymentModal open transactionId="tx-1" onClose={onClose} />,
    )

    await waitFor(() => {
      expect(screen.getByTestId('stripe-qr')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(onClose).toHaveBeenCalled()
    expect(selectActiveItems(useCartStore.getState())).toHaveLength(1)
  })
})
