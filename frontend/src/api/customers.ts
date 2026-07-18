import { DEFAULT_STORE_ID } from '@/api/shifts'

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

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const detail = await response.text()
    throw new Error(detail || `Request failed (${response.status})`)
  }
  return response.json() as Promise<T>
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
  const response = await fetch(`${API_BASE}/customers/search?${params.toString()}`)
  return parseJson<CustomerSearchResult[]>(response)
}
