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

describe('SearchBar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetCartForTests({ items: [] })
  })

  it('adds the first search hit including register flags', async () => {
    const user = userEvent.setup()
    vi.mocked(searchProducts).mockResolvedValue([
      {
        id: 'p-special',
        sku: '3001',
        primarySku: '3001',
        skus: ['3001', 'ALT-3001'],
        name: 'Daily Special',
        sellingPrice: 2.5,
        sellByWeight: false,
        excludeFromGlobalDiscounts: true,
      },
    ])

    render(<SearchBar autoFocus={false} />)
    await user.type(screen.getByLabelText(/search or scan/i), '3001')
    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(selectActiveItems(useCartStore.getState())).toHaveLength(1)
    })

    const item = selectActiveItems(useCartStore.getState())[0]
    expect(item.productId).toBe('p-special')
    expect(item.sku).toBe('3001')
    expect(item.excludeFromGlobalDiscounts).toBe(true)
    expect(searchProducts).toHaveBeenCalledWith('3001')
  })

  it('maps primarySku when transitional sku is absent', async () => {
    const user = userEvent.setup()
    vi.mocked(searchProducts).mockResolvedValue([
      {
        id: 'p-cola',
        primarySku: '7501000000028',
        skus: ['7501000000028', '7501000001025'],
        name: 'Cola 355ml',
        sellingPrice: 14,
      },
    ])

    render(<SearchBar autoFocus={false} />)
    await user.type(screen.getByLabelText(/search or scan/i), '7501000001025')
    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(selectActiveItems(useCartStore.getState())).toHaveLength(1)
    })
    expect(selectActiveItems(useCartStore.getState())[0].sku).toBe('7501000000028')
  })

  it('shows not found when the API returns no rows', async () => {
    const user = userEvent.setup()
    vi.mocked(searchProducts).mockResolvedValue([])

    render(<SearchBar autoFocus={false} />)
    await user.type(screen.getByLabelText(/search or scan/i), 'missing')
    await user.keyboard('{Enter}')

    expect(await screen.findByRole('alert')).toHaveTextContent(/no product found/i)
    expect(selectActiveItems(useCartStore.getState())).toHaveLength(0)
  })

  it('shows API errors', async () => {
    const user = userEvent.setup()
    vi.mocked(searchProducts).mockRejectedValue(new Error('Backend down'))

    render(<SearchBar autoFocus={false} />)
    await user.type(screen.getByLabelText(/search or scan/i), '1001')
    await user.keyboard('{Enter}')

    expect(await screen.findByRole('alert')).toHaveTextContent(/backend down/i)
  })
})
