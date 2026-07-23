import { DEFAULT_STORE_ID } from '@/api/shifts'
import { apiFetch, parseJson } from '@/api/http'

const API_BASE = '/api/v1'

export type CustomerSearchResult = {
  id: string
  storeId: string
  name: string
  phone: string | null
  creditLimit: number
  currentBalance: number
  createdAt?: string
}

/**
 * Looks up store-tab customers by name or phone.
 * Backend: GET /api/v1/customers/search?storeId=&q= (Feature 019).
 */
export async function searchCustomers(
  query: string,
  storeId: string = DEFAULT_STORE_ID,
): Promise<CustomerSearchResult[]> {
  const trimmed = query.trim()
  if (!trimmed) return []

  const params = new URLSearchParams({ storeId, q: trimmed })
  const response = await apiFetch(`${API_BASE}/customers/search?${params.toString()}`)
  return parseJson<CustomerSearchResult[]>(response)
}
