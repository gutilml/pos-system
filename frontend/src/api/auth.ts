import { apiFetch, parseJson } from '@/api/http'

const API_BASE = '/api/v1'

export type AuthRole = 'ADMIN' | 'CASHIER'

export type AuthUser = {
  id: string
  username: string
  role: AuthRole
  storeId: string | null
  storeName: string | null
  active: boolean
  /** Store `features.enable_inventory` from Feature 042. */
  enableInventory?: boolean
  /** Store `features.enable_customer_credit` from Feature 060. */
  enableCustomerCredit?: boolean
  /** Store `preferences.ui_locale` from Feature 045 (`en` | `es`). */
  uiLocale?: string
}

export async function fetchCsrf(): Promise<string> {
  const response = await apiFetch(`${API_BASE}/auth/csrf`)
  const body = await parseJson<{ csrfToken: string }>(response)
  return body.csrfToken
}

export async function login(username: string, password: string): Promise<AuthUser> {
  await fetchCsrf()
  const response = await apiFetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  return parseJson<AuthUser>(response)
}

export async function logout(): Promise<void> {
  await fetchCsrf()
  const response = await apiFetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
  })
  await parseJson<void>(response)
}

export async function fetchMe(): Promise<AuthUser> {
  const response = await apiFetch(`${API_BASE}/auth/me`)
  return parseJson<AuthUser>(response)
}
