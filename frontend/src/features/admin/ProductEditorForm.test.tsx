import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ProductEditorForm } from '@/features/admin/ProductEditorForm'

vi.mock('@/api/categories', () => ({
  listCategories: vi.fn(),
  createCategory: vi.fn(),
}))
vi.mock('@/api/products', () => ({
  listProducts: vi.fn(),
  getProduct: vi.fn(),
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
}))

import { createCategory, listCategories } from '@/api/categories'
import { createProduct, listProducts } from '@/api/products'

describe('ProductEditorForm Feature 076', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(listCategories).mockResolvedValue([
      { id: 'cat-1', name: 'Drinks', targetMargin: 0.3 },
      { id: 'cat-2', name: 'Botana a granel', targetMargin: 0.35 },
    ])
    vi.mocked(listProducts).mockResolvedValue([
      {
        id: 'parent-1',
        name: 'Goma Luky osito',
        sellingPrice: 50,
        costPrice: 24,
        qtyPerPackage: 24,
        packageUnit: 'pc',
        primarySku: '7501',
      },
    ])
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
    await user.click(screen.getByTestId('product-category'))
    await user.click(screen.getByText(/Drinks \(30%\)/))
    expect(screen.getByTestId('product-margin')).toHaveValue('30')

    const cost = screen.getByTestId('product-cost')
    await user.clear(cost)
    await user.type(cost, '70')
    await waitFor(() => {
      expect(screen.getByTestId('product-retail')).toHaveValue('100')
    })
  })

  it('shows package unit chips and category add option', async () => {
    const user = userEvent.setup()
    render(
      <ProductEditorForm
        productId={null}
        enableInventory={false}
        onSaved={() => undefined}
        onCancel={() => undefined}
      />,
    )
    await waitFor(() => expect(screen.getByTestId('package-unit-chips')).toBeInTheDocument())
    expect(screen.getByTestId('package-unit-chips-kg')).toBeInTheDocument()
    expect(screen.queryByLabelText(/unit of measure/i)).not.toBeInTheDocument()

    await user.click(screen.getByTestId('product-category'))
    expect(screen.getByTestId('category-add-option')).toBeInTheDocument()
  })

  it('creates category inline and selects it', async () => {
    const user = userEvent.setup()
    vi.mocked(createCategory).mockResolvedValue({
      id: 'cat-new',
      name: 'Snacks',
      targetMargin: 0.4,
    })
    render(
      <ProductEditorForm
        productId={null}
        enableInventory={false}
        onSaved={() => undefined}
        onCancel={() => undefined}
      />,
    )
    await waitFor(() => expect(listCategories).toHaveBeenCalled())
    await user.click(screen.getByTestId('product-category'))
    await user.click(screen.getByTestId('category-add-option'))
    expect(screen.getByTestId('inline-category-create')).toBeInTheDocument()
    await user.type(screen.getByTestId('inline-category-name'), 'Snacks')
    await user.clear(screen.getByTestId('inline-category-margin'))
    await user.type(screen.getByTestId('inline-category-margin'), '40')
    await user.click(screen.getByTestId('inline-category-save'))
    await waitFor(() => expect(createCategory).toHaveBeenCalled())
    expect(screen.getByTestId('product-margin')).toHaveValue('40')
    expect(screen.getByTestId('product-category')).toHaveTextContent(/Snacks/)
  })

  it('derives cost from parent and disables inventory', async () => {
    const user = userEvent.setup()
    render(
      <ProductEditorForm
        productId={null}
        enableInventory
        onSaved={() => undefined}
        onCancel={() => undefined}
      />,
    )
    await waitFor(() => expect(listProducts).toHaveBeenCalled())
    await user.click(screen.getByTestId('product-parent'))
    await user.click(within(screen.getByTestId('product-parent-menu')).getByText('Goma Luky osito'))
    await waitFor(() => {
      expect(screen.getByTestId('product-cost')).toHaveValue('1')
    })
    expect(screen.getByTestId('product-cost')).toHaveAttribute('readonly')
    expect(screen.getByTestId('product-track-inventory')).toBeDisabled()
    expect(screen.getByTestId('product-track-inventory')).not.toBeChecked()
  })

  it('sends unitOfMeasure when sell by weight on save', async () => {
    const user = userEvent.setup()
    vi.mocked(createProduct).mockResolvedValue({
      id: 'p-new',
      name: 'Bulk',
      sellingPrice: 10,
    })
    const onSaved = vi.fn()
    render(
      <ProductEditorForm
        productId={null}
        enableInventory={false}
        onSaved={onSaved}
        onCancel={() => undefined}
      />,
    )
    await waitFor(() => expect(listCategories).toHaveBeenCalled())
    await user.type(screen.getByLabelText(/^Name$/i), 'Bulk candy')
    await user.click(screen.getByTestId('product-sell-by-weight'))
    expect(screen.getByTestId('unit-of-measure-chips')).toBeInTheDocument()
    await user.click(screen.getByTestId('unit-of-measure-chips-kg'))
    await user.clear(screen.getByTestId('product-cost'))
    await user.type(screen.getByTestId('product-cost'), '70')
    await user.clear(screen.getByTestId('product-margin'))
    await user.type(screen.getByTestId('product-margin'), '30')
    await user.click(screen.getByTestId('product-save'))
    await waitFor(() => expect(createProduct).toHaveBeenCalled())
    expect(vi.mocked(createProduct).mock.calls[0][0]).toMatchObject({
      sellByWeight: true,
      unitOfMeasure: 'kg',
    })
  })
})
