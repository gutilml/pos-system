import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ProductsWorkspace } from '@/features/admin/ProductsWorkspace'
import { useAuthStore } from '@/store/useAuthStore'

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

describe('ProductsWorkspace', () => {
  beforeEach(() => {
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

  it('defaults to Product sub-tab and can switch to Category', async () => {
    const user = userEvent.setup()
    render(<ProductsWorkspace />)

    expect(screen.getByTestId('products-tab-product')).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByTestId('admin-new-product')).toBeInTheDocument()

    await user.click(screen.getByTestId('products-tab-category'))
    expect(screen.getByTestId('products-tab-category')).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByTestId('category-panel')).toBeInTheDocument()
  })
})
