import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ProductEditorForm } from '@/features/admin/ProductEditorForm'

vi.mock('@/api/categories', () => ({
  listCategories: vi.fn(),
}))
vi.mock('@/api/products', () => ({
  listProducts: vi.fn(),
  getProduct: vi.fn(),
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
}))

import { listCategories } from '@/api/categories'
import { listProducts } from '@/api/products'

describe('ProductEditorForm Feature 074', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(listCategories).mockResolvedValue([
      { id: 'cat-1', name: 'Drinks', targetMargin: 0.3 },
    ])
    vi.mocked(listProducts).mockResolvedValue([])
  })

  it('fills margin from category and retail from cost', async () => {
    const user = userEvent.setup()
    render(
      <ProductEditorForm
        productId={null}
        enableInventory={false}
        onSaved={() => undefined}
        onCancel={() => undefined}
      />,
    )

    await waitFor(() => expect(listCategories).toHaveBeenCalled())
    await user.selectOptions(screen.getByTestId('product-category'), 'cat-1')
    expect(screen.getByTestId('product-margin')).toHaveValue('30')

    const cost = screen.getByTestId('product-cost')
    await user.clear(cost)
    await user.type(cost, '70')
    await waitFor(() => {
      expect(screen.getByTestId('product-retail')).toHaveValue('100')
    })
  })

  it('shows package unit chips and no unit-of-measure text field', async () => {
    render(
      <ProductEditorForm
        productId={null}
        enableInventory={false}
        onSaved={() => undefined}
        onCancel={() => undefined}
      />,
    )
    await waitFor(() => expect(screen.getByTestId('package-unit-chips')).toBeInTheDocument())
    expect(screen.getByTestId('package-unit-kg')).toBeInTheDocument()
    expect(screen.queryByLabelText(/unit of measure/i)).not.toBeInTheDocument()
  })
})
