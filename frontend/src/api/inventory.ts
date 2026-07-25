import { DEFAULT_STORE_ID } from '@/api/shifts'
import { apiFetch, parseJson } from '@/api/http'

const API_BASE = '/api/v1'

export type InventoryProduct = {
  productId: string
  name: string
  primarySku: string | null
  stockedProductId: string
  parentProductId: string | null
  trackInventory: boolean
  currentStock: number
  lowStockThreshold: number
  lowStock: boolean
  costPrice: number
  sellingPrice: number
  wholesalePrice: number
  targetMargin: number | null
  wholesaleMargin: number | null
}

export type StockMovementType = 'RECEIVING' | 'ADJUSTMENT' | 'SALE'

export type StockMovement = {
  id: string
  storeId: string
  productId: string
  type: StockMovementType
  quantityDelta: number
  quantityAfter: number
  unitCostBefore: number | null
  unitCostAfter: number | null
  sellingBefore: number | null
  sellingAfter: number | null
  wholesaleBefore: number | null
  wholesaleAfter: number | null
  reason: string | null
  createdAt: string
}

export type StockMovementRequest = {
  storeId: string
  productId: string
  type: 'RECEIVING' | 'ADJUSTMENT'
  quantity: number
  reason?: string | null
  unitCost?: number | null
  sellingPrice?: number | null
  wholesalePrice?: number | null
}

export async function listInventoryProducts(
  storeId: string = DEFAULT_STORE_ID,
  query = '',
  lowStockOnly = false,
): Promise<InventoryProduct[]> {
  const params = new URLSearchParams({
    storeId,
    q: query.trim(),
    lowStockOnly: String(lowStockOnly),
  })
  const response = await apiFetch(`${API_BASE}/inventory/products?${params.toString()}`)
  return parseJson<InventoryProduct[]>(response)
}

export async function listStockMovements(productId: string): Promise<StockMovement[]> {
  const response = await apiFetch(`${API_BASE}/inventory/products/${productId}/movements`)
  return parseJson<StockMovement[]>(response)
}

export async function createStockMovement(
  body: StockMovementRequest,
): Promise<StockMovement> {
  const response = await apiFetch(`${API_BASE}/inventory/movements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return parseJson<StockMovement>(response)
}
