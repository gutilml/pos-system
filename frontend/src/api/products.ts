import type { CartProduct } from '@/types/cart'
import { apiFetch, parseJson } from '@/api/http'

const API_BASE = '/api/v1'

export type ProductApi = {
  id: string
  /** Transitional alias of primarySku (Feature 027). */
  sku?: string | null
  primarySku?: string | null
  skus?: string[]
  name: string
  description?: string | null
  costPrice?: number
  sellingPrice: number
  active?: boolean
  categoryIds?: string[]
  sellByWeight?: boolean
  unitOfMeasure?: string | null
  excludeFromGlobalDiscounts?: boolean
  trackInventory?: boolean
  currentStock?: number
}

export function toCartProduct(dto: ProductApi): CartProduct {
  return {
    id: dto.id,
    sku: dto.primarySku ?? dto.sku ?? '',
    name: dto.name,
    sellingPrice: Number(dto.sellingPrice),
    sellByWeight: dto.sellByWeight === true,
    unitOfMeasure: dto.unitOfMeasure ?? undefined,
    excludeFromGlobalDiscounts: dto.excludeFromGlobalDiscounts === true,
    trackInventory: dto.trackInventory === true,
    currentStock: Number.isFinite(Number(dto.currentStock)) ? Number(dto.currentStock) : 0,
  }
}

/**
 * Register catalog lookup — exact code preferred on the backend (Features 021 / 027).
 */
export async function searchProducts(
  query: string,
  signal?: AbortSignal,
): Promise<ProductApi[]> {
  const trimmed = query.trim()
  if (!trimmed) return []

  const params = new URLSearchParams({ q: trimmed })
  const response = await apiFetch(`${API_BASE}/products/search?${params.toString()}`, {
    signal,
  })
  return parseJson<ProductApi[]>(response)
}
