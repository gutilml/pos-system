import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SearchBar } from '@/components/register/SearchBar'
import { resetCartForTests, selectActiveItems, useCartStore } from '@/store/useCartStore'

vi.mock('@/api/products', async () => {
  const actual = await vi.importActual<typeof import('@/api/products')>('@/api/products')
  return {
    ...actual,
    searchProducts: vi.fn(),
  }
})

import { searchProducts } from '@/api/products'

function product(id: string, name: string, sku: string) {
  return {
    id,
    sku,
    primarySku: sku,
    skus: [sku],
    name,
    sellingPrice: 1,
  }
}

describe('SearchBar typeahead', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetCartForTests({ items: [] })
  })

  it('does not search for typeahead under 3 characters', async () => {
    const user = userEvent.setup()
    render(<SearchBar autoFocus={false} />)
    await user.type(screen.getByLabelText(/scan or search/i), 'ab')
    expect(searchProducts).not.toHaveBeenCalled()
    expect(screen.queryByTestId('search-suggestions')).not.toBeInTheDocument()
  })

  it('shows at most 10 suggestions and adds on click', async () => {
    const user = userEvent.setup()
    const many = Array.from({ length: 12 }, (_, i) =>
      product(`p-${i}`, `Item ${i}`, `SKU${i}`),
    )
    vi.mocked(searchProducts).mockResolvedValue(many)

    render(<SearchBar autoFocus={false} />)
    await user.type(screen.getByLabelText(/scan or search/i), 'ite')

    await waitFor(() => {
      expect(screen.getByTestId('search-suggestions')).toBeInTheDocument()
    })
    expect(screen.getAllByRole('option')).toHaveLength(10)

    await user.click(screen.getByTestId('search-suggestion-p-2'))
    expect(selectActiveItems(useCartStore.getState())[0].productId).toBe('p-2')
    expect(screen.getByLabelText(/scan or search/i)).toHaveValue('')
  })

  it('Enter with highlight adds that suggestion', async () => {
    const user = userEvent.setup()
    vi.mocked(searchProducts).mockResolvedValue([
      product('p-a', 'Alpha', 'A1'),
      product('p-b', 'Beta', 'B1'),
    ])

    render(<SearchBar autoFocus={false} />)
    await user.type(screen.getByLabelText(/scan or search/i), 'alp')
    await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(2))
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}')

    await waitFor(() => {
      expect(selectActiveItems(useCartStore.getState())[0].productId).toBe('p-b')
    })
  })

  it('Enter without highlight still adds the first API hit (barcode path)', async () => {
    const user = userEvent.setup()
    vi.mocked(searchProducts).mockResolvedValue([
      product('p-cola', 'Cola', '7501000000028'),
    ])

    render(<SearchBar autoFocus={false} />)
    await user.type(screen.getByLabelText(/scan or search/i), '7501000000028')
    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(selectActiveItems(useCartStore.getState())).toHaveLength(1)
    })
    expect(selectActiveItems(useCartStore.getState())[0].sku).toBe('7501000000028')
  })
})
