const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

export function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const encoded = `${encodeURIComponent(name)}=`
  const parts = document.cookie.split(';')
  for (const part of parts) {
    const trimmed = part.trim()
    if (trimmed.startsWith(encoded)) {
      return decodeURIComponent(trimmed.slice(encoded.length))
    }
  }
  return null
}

/** Prefer RFC 7807 `detail`, then `title`, else the raw body (Feature 065). */
export function formatApiErrorBody(body: string): string {
  const trimmed = body.trim()
  if (!trimmed) return ''
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed) as { detail?: unknown; title?: unknown }
      if (typeof parsed.detail === 'string' && parsed.detail.trim()) {
        return parsed.detail.trim()
      }
      if (typeof parsed.title === 'string' && parsed.title.trim()) {
        return parsed.title.trim()
      }
    } catch {
      // fall through to raw body
    }
  }
  return trimmed
}

export async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const detail = await response.text()
    throw new Error(formatApiErrorBody(detail) || `Request failed (${response.status})`)
  }
  if (response.status === 204 || response.status === 205) {
    return undefined as T
  }
  const text = await response.text()
  if (!text) {
    return undefined as T
  }
  return JSON.parse(text) as T
}

/**
 * Shared fetch for SPA ↔ API: always sends cookies; mutating methods attach CSRF.
 */
export async function apiFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  const method = (init.method ?? 'GET').toUpperCase()
  const headers = new Headers(init.headers)

  if (MUTATING.has(method) && !headers.has('X-XSRF-TOKEN')) {
    const csrf = readCookie('XSRF-TOKEN')
    if (csrf) {
      headers.set('X-XSRF-TOKEN', csrf)
    }
  }

  return fetch(input, {
    ...init,
    method,
    headers,
    credentials: 'include',
  })
}
