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

export type CreditLedgerEntry = {
  id: string
  customerId: string
  transactionId: string | null
  amount: number
  type: 'CHARGE' | 'PAYMENT'
  createdAt: string
}

export type CreateCustomerRequest = {
  storeId: string
  name: string
  phone?: string | null
  creditLimit: number
}

export type UpdateCustomerRequest = {
  name: string
  phone?: string | null
  creditLimit: number
}

/**
 * Store customers by name/phone. Empty `q` returns up to 20 customers (Feature 060).
 */
export async function searchCustomers(
  query: string,
  storeId: string = DEFAULT_STORE_ID,
): Promise<CustomerSearchResult[]> {
  const params = new URLSearchParams({ storeId, q: query.trim() })
  const response = await apiFetch(`${API_BASE}/customers/search?${params.toString()}`)
  return parseJson<CustomerSearchResult[]>(response)
}

export async function getCustomer(id: string): Promise<CustomerSearchResult> {
  const response = await apiFetch(`${API_BASE}/customers/${id}`)
  return parseJson<CustomerSearchResult>(response)
}

export async function createCustomer(
  body: CreateCustomerRequest,
): Promise<CustomerSearchResult> {
  const response = await apiFetch(`${API_BASE}/customers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return parseJson<CustomerSearchResult>(response)
}

export async function updateCustomer(
  id: string,
  body: UpdateCustomerRequest,
): Promise<CustomerSearchResult> {
  const response = await apiFetch(`${API_BASE}/customers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return parseJson<CustomerSearchResult>(response)
}

export async function deleteCustomer(id: string): Promise<void> {
  const response = await apiFetch(`${API_BASE}/customers/${id}`, {
    method: 'DELETE',
  })
  await parseJson<void>(response)
}

export async function getCustomerLedger(id: string): Promise<CreditLedgerEntry[]> {
  const response = await apiFetch(`${API_BASE}/customers/${id}/ledger`)
  return parseJson<CreditLedgerEntry[]>(response)
}

export async function payCustomerBalance(
  id: string,
  amount: number,
): Promise<CustomerSearchResult> {
  const response = await apiFetch(`${API_BASE}/customers/${id}/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount }),
  })
  return parseJson<CustomerSearchResult>(response)
}
