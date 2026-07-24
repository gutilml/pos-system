import { apiFetch, parseJson } from '@/api/http'

const API_BASE = '/api/v1'

export type CategoryApi = {
  id: string
  name: string
  targetMargin: number
}

export type CategoryRequestBody = {
  name: string
  targetMargin: number
}

export async function listCategories(signal?: AbortSignal): Promise<CategoryApi[]> {
  const response = await apiFetch(`${API_BASE}/categories`, { signal })
  return parseJson<CategoryApi[]>(response)
}

export async function createCategory(body: CategoryRequestBody): Promise<CategoryApi> {
  const response = await apiFetch(`${API_BASE}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return parseJson<CategoryApi>(response)
}

export async function updateCategory(id: string, body: CategoryRequestBody): Promise<CategoryApi> {
  const response = await apiFetch(`${API_BASE}/categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return parseJson<CategoryApi>(response)
}

export async function deleteCategory(id: string): Promise<void> {
  const response = await apiFetch(`${API_BASE}/categories/${id}`, { method: 'DELETE' })
  await parseJson<void>(response)
}
