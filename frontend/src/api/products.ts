import type { CartProduct } from '@/types/cart'
import { apiFetch, parseJson } from '@/api/http'

const API_BASE = '/api/v1'

export type ProductApi = {
  id: string
  sku: string
  name: string
  description?: string | null
  costPrice?: number
  sellingPrice: number
  active?: boolean
  categoryIds?: string[]
  sellByWeight?: boolean
  unitOfMeasure?: string | null
  excludeFromGlobalDiscounts?: boolean
}

export function toCartProduct(dto: ProductApi): CartProduct {
  return {
    id: dto.id,
    sku: dto.sku,
    name: dto.name,
    sellingPrice: Number(dto.sellingPrice),
    sellByWeight: dto.sellByWeight === true,
    unitOfMeasure: dto.unitOfMeasure ?? undefined,
    excludeFromGlobalDiscounts: dto.excludeFromGlobalDiscounts === true,
  }
}

/**
 * Register catalog lookup — exact SKU preferred on the backend (Feature 021).
 */
export async function searchProducts(query: string): Promise<ProductApi[]> {
  const trimmed = query.trim()
  if (!trimmed) return []

  const params = new URLSearchParams({ q: trimmed })
  const response = await apiFetch(`${API_BASE}/products/search?${params.toString()}`)
  return parseJson<ProductApi[]>(response)
}
