import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { CartItemRow, CartListHeader } from '@/components/register/CartItemRow'
import { resetCartForTests, selectActiveItems, useCartStore } from '@/store/useCartStore'

describe('CartItemRow', () => {
  beforeEach(() => {
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
        {
          productId: 'p-special',
          sku: '3001',
          name: 'Daily Special',
          unitPrice: 2.5,
          quantity: 1,
          excludeFromGlobalDiscounts: true,
        },
      ],
    })
  })

  it('hides SKU and unit price from the sell list', () => {
    render(
      <ul>
        <CartItemRow
          item={{
            productId: 'p-cola',
            sku: '1001',
            name: 'Cola 12oz',
            unitPrice: 1.99,
            quantity: 1,
            itemDiscountPercentage: 0.1,
          }}
        />
      </ul>,
    )

    expect(screen.getByTestId('cart-product-name-p-cola')).toHaveTextContent('Cola 12oz')
    expect(screen.queryByText('1001')).not.toBeInTheDocument()
    expect(screen.getByTestId('original-total-p-cola')).toHaveTextContent('1.99')
    expect(screen.getByTestId('line-total-p-cola')).toHaveTextContent('1.79')
  })

  it('shows No Global % badge for excluded products', () => {
    render(
      <ul>
        <CartItemRow
          item={{
            productId: 'p-special',
            sku: '3001',
            name: 'Daily Special',
            unitPrice: 2.5,
            quantity: 1,
            excludeFromGlobalDiscounts: true,
          }}
        />
      </ul>,
    )

    expect(screen.getByTestId('no-global-badge-p-special')).toHaveTextContent('No Global %')
  })

  it('renders Product Qty Discount Subtotal headers without Stock', () => {
    render(<CartListHeader />)
    const header = screen.getByTestId('cart-list-header')
    expect(header).toHaveTextContent('Product')
    expect(header).toHaveTextContent('Qty')
    expect(header).toHaveTextContent('Discount')
    expect(header).toHaveTextContent('Subtotal')
    expect(header).not.toHaveTextContent('Stock')
  })

  it('inserts Inv header between Qty and Discount when inventory is on', () => {
    render(<CartListHeader showStock />)
    const header = screen.getByTestId('cart-list-header')
    expect(header.textContent).toMatch(/Product.*Qty.*Inv.*Discount.*Subtotal/)
  })

  it('shows remaining stock as currentStock minus quantity for tracked products', async () => {
    const user = userEvent.setup()
    resetCartForTests({
      items: [
        {
          productId: 'p-cola',
          sku: '1001',
          name: 'Cola 12oz',
          unitPrice: 1.99,
          quantity: 2,
          trackInventory: true,
          currentStock: 12,
        },
      ],
    })

    const { rerender } = render(
      <ul>
        <CartItemRow
          showStock
          item={selectActiveItems(useCartStore.getState())[0]}
        />
      </ul>,
    )

    expect(screen.getByTestId('cart-stock-p-cola')).toHaveTextContent('10')

    await user.click(screen.getByRole('button', { name: 'Increase quantity of Cola 12oz' }))
    rerender(
      <ul>
        <CartItemRow
          showStock
          item={selectActiveItems(useCartStore.getState())[0]}
        />
      </ul>,
    )
    expect(screen.getByTestId('cart-stock-p-cola')).toHaveTextContent('9')
  })

  it('shows em dash for non-tracked products when Stock column is visible', () => {
    render(
      <ul>
        <CartItemRow
          showStock
          item={{
            productId: 'p-svc',
            sku: '',
            name: 'Service Fee',
            unitPrice: 10,
            quantity: 1,
            trackInventory: false,
            currentStock: 0,
          }}
        />
      </ul>,
    )

    expect(screen.getByTestId('cart-stock-p-svc')).toHaveTextContent('—')
  })

  it('updates item discount percentage on blur from the Discount column', async () => {
    const user = userEvent.setup()
    render(
      <ul>
        <CartItemRow
          item={{
            productId: 'p-cola',
            sku: '1001',
            name: 'Cola 12oz',
            unitPrice: 1.99,
            quantity: 1,
            itemDiscountPercentage: 0,
          }}
        />
      </ul>,
    )

    const input = screen.getByLabelText('Item discount percent for Cola 12oz')
    await user.clear(input)
    await user.type(input, '15')
    await user.tab()

    expect(selectActiveItems(useCartStore.getState())[0].itemDiscountPercentage).toBe(0.15)
  })
})
