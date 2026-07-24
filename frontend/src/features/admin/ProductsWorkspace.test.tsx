import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ProductsWorkspace } from '@/features/admin/ProductsWorkspace'
import { useAuthStore } from '@/store/useAuthStore'
import { searchProducts } from '@/api/products'

vi.mock('@/api/products', () => ({
  listProducts: vi.fn(async () => []),
  getProduct: vi.fn(),
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  searchProducts: vi.fn(),
}))

vi.mock('@/api/categories', () => ({
  listCategories: vi.fn(async () => []),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
}))

describe('ProductsWorkspace lookup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({
      user: {
        id: 'u1',
        username: 'cashier',
        role: 'CASHIER',
        storeId: 'store-1',
        storeName: 'Demo',
        active: true,
        uiLocale: 'en',
        enableInventory: false,
      },
      status: 'authenticated',
      error: null,
    })
  })

  it('defaults to Product sub-tab with lookup field', () => {
    render(<ProductsWorkspace />)
    expect(screen.getByTestId('products-tab-product')).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByTestId('product-lookup')).toBeInTheDocument()
  })

  it('can switch to Category tab', async () => {
    const user = userEvent.setup()
    render(<ProductsWorkspace />)
    await user.click(screen.getByTestId('products-tab-category'))
    expect(screen.getByTestId('category-panel')).toBeInTheDocument()
  })

  it('opens create with barcode prefill when lookup finds nothing', async () => {
    const user = userEvent.setup()
    vi.mocked(searchProducts).mockResolvedValue([])
    render(<ProductsWorkspace />)

    await user.type(screen.getByLabelText(/scan|barcode|name/i), '7501000000028')
    await user.click(screen.getByRole('button', { name: /find|lookup|search|enter/i }))

    await waitFor(() => {
      expect(screen.getByTestId('product-editor')).toBeInTheDocument()
    })
    expect(screen.getByTestId('product-editor-banner')).toHaveTextContent(/new|create/i)
    expect(screen.getByLabelText(/^Barcodes$/i)).toHaveValue('7501000000028')
  })

  it('opens edit when lookup finds a product', async () => {
    const user = userEvent.setup()
    vi.mocked(searchProducts).mockResolvedValue([
      {
        id: 'p1',
        name: 'Cola',
        primarySku: '1001',
        skus: ['1001'],
        sellingPrice: 1.99,
      },
    ])
    const { getProduct } = await import('@/api/products')
    vi.mocked(getProduct).mockResolvedValue({
      id: 'p1',
      name: 'Cola',
      primarySku: '1001',
      skus: ['1001'],
      sellingPrice: 1.99,
      costPrice: 1,
    })

    render(<ProductsWorkspace />)
    await user.type(screen.getByLabelText(/scan|barcode|name/i), '1001')
    await user.click(screen.getByRole('button', { name: /find|lookup|search|enter/i }))

    await waitFor(() => {
      expect(screen.getByTestId('product-editor')).toBeInTheDocument()
    })
    expect(screen.getByLabelText(/^Name$/i)).toHaveValue('Cola')
  })

  it('ArrowDown + Enter selects highlighted suggestion for edit', async () => {
    const user = userEvent.setup()
    vi.mocked(searchProducts).mockResolvedValue([
      {
        id: 'p1',
        name: 'Cola',
        primarySku: '1001',
        skus: ['1001'],
        sellingPrice: 1.99,
      },
      {
        id: 'p2',
        name: 'Chips',
        primarySku: '2002',
        skus: ['2002'],
        sellingPrice: 2.5,
      },
    ])
    const { getProduct } = await import('@/api/products')
    vi.mocked(getProduct).mockResolvedValue({
      id: 'p2',
      name: 'Chips',
      primarySku: '2002',
      skus: ['2002'],
      sellingPrice: 2.5,
      costPrice: 1,
    })

    render(<ProductsWorkspace />)
    const input = screen.getByLabelText(/scan|barcode|name/i)
    await user.type(input, 'chi')

    await waitFor(() => {
      expect(screen.getByTestId('product-lookup-suggestions')).toBeInTheDocument()
    })

    await user.keyboard('{ArrowDown}')
    await user.keyboard('{ArrowDown}')
    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(screen.getByTestId('product-editor')).toBeInTheDocument()
    })
    expect(getProduct).toHaveBeenCalledWith('p2', expect.any(AbortSignal))
    expect(screen.getByLabelText(/^Name$/i)).toHaveValue('Chips')
  })
})
