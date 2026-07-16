import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CheckoutFooter } from '@/components/register/CheckoutFooter'
import { useCartStore } from '@/store/useCartStore'

describe('CheckoutFooter', () => {
  beforeEach(() => {
    useCartStore.setState({
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
      amountReceived: null,
    })
  })

  it('defaults amount received to the grand total', () => {
    render(<CheckoutFooter />)
    const input = screen.getByLabelText('Amount Received') as HTMLInputElement
    expect(input.value).toBe('1.9900')
    expect(screen.getByTestId('change-due')).toHaveTextContent('0.0000')
  })

  it('selects all text when the amount received field is focused', async () => {
    const user = userEvent.setup()
    render(<CheckoutFooter />)
    const input = screen.getByLabelText('Amount Received') as HTMLInputElement

    const selectSpy = vi.spyOn(input, 'select')
    await user.click(input)

    expect(selectSpy).toHaveBeenCalled()
  })

  it('updates change due when amount received changes', async () => {
    const user = userEvent.setup()
    render(<CheckoutFooter />)
    const input = screen.getByLabelText('Amount Received')

    await user.click(input)
    await user.keyboard('{Control>}a{/Control}5')

    expect(screen.getByTestId('change-due')).toHaveTextContent('3.0100')
  })
})
