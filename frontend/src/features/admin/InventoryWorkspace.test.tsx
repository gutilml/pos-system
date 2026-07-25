import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { InventoryWorkspace } from '@/features/admin/InventoryWorkspace'
import { useAuthStore } from '@/store/useAuthStore'

vi.mock('@/api/inventory', () => ({
  listInventoryProducts: vi.fn(),
  listStockMovements: vi.fn(),
  createStockMovement: vi.fn(),
}))

import { listInventoryProducts, listStockMovements } from '@/api/inventory'

describe('InventoryWorkspace', () => {
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
        enableInventory: true,
        uiLocale: 'en',
      },
      status: 'authenticated',
      error: null,
    })
    vi.mocked(listInventoryProducts).mockResolvedValue([
      {
        productId: 'p1',
        name: 'Water',
        primarySku: '750',
        stockedProductId: 'p1',
        parentProductId: null,
        trackInventory: true,
        currentStock: 5,
        lowStockThreshold: 10,
        lowStock: true,
        costPrice: 2,
        sellingPrice: 4,
        wholesalePrice: 3,
        targetMargin: 0.5,
        wholesaleMargin: 0.33,
      },
    ])
    vi.mocked(listStockMovements).mockResolvedValue([])
  })

  it('loads inventory list on mount', async () => {
    render(<InventoryWorkspace />)
    await waitFor(() => {
      expect(listInventoryProducts).toHaveBeenCalledWith('store-1', '', false)
    })
    expect(await screen.findByText('Water')).toBeInTheDocument()
    expect(screen.getByTestId('inventory-receive-p1')).toBeInTheDocument()
  })

  it('is read-only when enableInventory is false', async () => {
    useAuthStore.setState({
      user: {
        id: 'u1',
        username: 'cashier',
        role: 'CASHIER',
        storeId: 'store-1',
        storeName: 'Demo',
        active: true,
        enableInventory: false,
        uiLocale: 'en',
      },
      status: 'authenticated',
      error: null,
    })
    render(<InventoryWorkspace />)
    expect(await screen.findByTestId('inventory-readonly-banner')).toBeInTheDocument()
    expect(screen.queryByTestId('inventory-receive-p1')).not.toBeInTheDocument()
  })

  it('opens receive modal', async () => {
    const user = userEvent.setup()
    render(<InventoryWorkspace />)
    expect(await screen.findByText('Water')).toBeInTheDocument()
    await user.click(screen.getByTestId('inventory-receive-p1'))
    expect(screen.getByTestId('inventory-movement-modal')).toBeInTheDocument()
  })

  it('updates selling and wholesale when receive cost changes', async () => {
    const user = userEvent.setup()
    render(<InventoryWorkspace />)
    expect(await screen.findByText('Water')).toBeInTheDocument()
    await user.click(screen.getByTestId('inventory-receive-p1'))

    const cost = screen.getByTestId('inventory-unit-cost')
    await user.clear(cost)
    await user.type(cost, '4')

    expect(screen.getByTestId('inventory-selling')).toHaveValue(8)
    const wholesale = screen.getByTestId('inventory-wholesale') as HTMLInputElement
    expect(Number(wholesale.value)).toBeCloseTo(4 / (1 - 0.33), 3)
  })
})
