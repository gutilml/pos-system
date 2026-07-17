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
 * Backend endpoint: GET /api/v1/customers/search?q=… (Feature 014 dependency — still pending on backend).
 */
export async function searchCustomers(query: string): Promise<CustomerSearchResult[]> {
  const trimmed = query.trim()
  if (!trimmed) return []

  const params = new URLSearchParams({ q: trimmed })
  const response = await fetch(`${API_BASE}/customers/search?${params.toString()}`)
  return parseJson<CustomerSearchResult[]>(response)
}
