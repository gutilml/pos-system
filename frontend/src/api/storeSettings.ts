import { apiFetch, parseJson } from '@/api/http'

const API_BASE = '/api/v1'

export type StoreSettingsApi = {
  storeId: string
  storeName: string
  features: Record<string, boolean>
  preferences: Record<string, unknown>
  uiLocale: string
}

export type PatchStoreSettingsBody = {
  features?: Record<string, boolean>
  preferences?: Record<string, unknown>
}

export async function fetchStoreSettings(storeId: string): Promise<StoreSettingsApi> {
  const response = await apiFetch(`${API_BASE}/stores/${storeId}/settings`)
  return parseJson<StoreSettingsApi>(response)
}

export async function patchStoreSettings(
  storeId: string,
  body: PatchStoreSettingsBody,
): Promise<StoreSettingsApi> {
  const response = await apiFetch(`${API_BASE}/stores/${storeId}/settings`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return parseJson<StoreSettingsApi>(response)
}
