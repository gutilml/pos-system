import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { InventoryWorkspace } from '@/features/admin/InventoryWorkspace'
import { useAuthStore } from '@/store/useAuthStore'

vi.mock('@/api/inventory', () => ({
  listInventoryProducts: vi.fn(),
  createStockMovement: vi.fn(),
}))

import { createStockMovement, listInventoryProducts } from '@/api/inventory'

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

  it('opens receive modal and focuses quantity', async () => {
    const user = userEvent.setup()
    render(<InventoryWorkspace />)
    expect(await screen.findByText('Water')).toBeInTheDocument()
    await user.click(screen.getByTestId('inventory-receive-p1'))
    expect(screen.getByTestId('inventory-movement-modal')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByTestId('inventory-qty')).toHaveFocus()
    })
  })

  it('blends cost into Cost field and keeps Price editable', async () => {
    vi.mocked(listInventoryProducts).mockResolvedValue([
      {
        productId: 'p1',
        name: 'portem',
        primarySku: '750',
        stockedProductId: 'p1',
        parentProductId: null,
        trackInventory: true,
        currentStock: 10,
        lowStockThreshold: 10,
        lowStock: false,
        costPrice: 35,
        sellingPrice: 58.3333,
        wholesalePrice: 0,
        targetMargin: 0.4,
        wholesaleMargin: null,
      },
    ])

    const user = userEvent.setup()
    render(<InventoryWorkspace />)
    expect(await screen.findByText('portem')).toBeInTheDocument()
    await user.click(screen.getByTestId('inventory-receive-p1'))

    await user.type(screen.getByTestId('inventory-qty'), '10')
    const cost = screen.getByTestId('inventory-unit-cost')
    await user.clear(cost)
    await user.type(cost, '40')
    await user.tab()

    expect(cost).toHaveValue(37.5)
    expect(screen.getByTestId('inventory-selling')).toHaveValue(62.5)
    expect(screen.queryByTestId('inventory-receive-preview')).not.toBeInTheDocument()
    expect(screen.getByLabelText(/^Cost$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Price$/i)).toBeInTheDocument()

    await user.clear(screen.getByTestId('inventory-selling'))
    await user.type(screen.getByTestId('inventory-selling'), '70')
    expect(screen.getByTestId('inventory-selling')).toHaveValue(70)
  })

  it('saves lot unit cost not blended cost', async () => {
    vi.mocked(listInventoryProducts).mockResolvedValue([
      {
        productId: 'p1',
        name: 'portem',
        primarySku: '750',
        stockedProductId: 'p1',
        parentProductId: null,
        trackInventory: true,
        currentStock: 10,
        lowStockThreshold: 10,
        lowStock: false,
        costPrice: 35,
        sellingPrice: 58.3333,
        wholesalePrice: 0,
        targetMargin: 0.4,
        wholesaleMargin: null,
      },
    ])
    vi.mocked(createStockMovement).mockResolvedValue({
      id: 'm1',
      productId: 'p1',
      type: 'RECEIVING',
      quantity: 10,
    } as never)

    const user = userEvent.setup()
    render(<InventoryWorkspace />)
    expect(await screen.findByText('portem')).toBeInTheDocument()
    await user.click(screen.getByTestId('inventory-receive-p1'))
    await user.type(screen.getByTestId('inventory-qty'), '10')
    const cost = screen.getByTestId('inventory-unit-cost')
    await user.clear(cost)
    await user.type(cost, '40')
    await user.tab()
    await user.click(screen.getByTestId('inventory-save'))

    await waitFor(() => expect(createStockMovement).toHaveBeenCalled())
    expect(vi.mocked(createStockMovement).mock.calls[0][0]).toMatchObject({
      type: 'RECEIVING',
      quantity: 10,
      unitCost: 40,
      sellingPrice: 66.6667,
    })
  })
})
