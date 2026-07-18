import type { CartProduct } from '@/types/cart'

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

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const detail = await response.text()
    throw new Error(detail || `Request failed (${response.status})`)
  }
  return response.json() as Promise<T>
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
  const response = await fetch(`${API_BASE}/products/search?${params.toString()}`)
  return parseJson<ProductApi[]>(response)
}
