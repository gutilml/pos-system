import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiFetch, formatApiErrorBody, getErrorStatus, parseJson, readCookie } from '@/api/http'

describe('http helpers', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    document.cookie = 'XSRF-TOKEN=; Max-Age=0; path=/'
  })

  it('readCookie returns the named cookie value', () => {
    document.cookie = 'XSRF-TOKEN=csrf-abc; path=/'
    expect(readCookie('XSRF-TOKEN')).toBe('csrf-abc')
  })

  it('apiFetch always sends credentials and adds CSRF on POST', async () => {
    document.cookie = 'XSRF-TOKEN=token-1; path=/'
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    await apiFetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(init.credentials).toBe('include')
    expect(new Headers(init.headers).get('X-XSRF-TOKEN')).toBe('token-1')
  })

  it('apiFetch does not force CSRF on GET', async () => {
    document.cookie = 'XSRF-TOKEN=token-1; path=/'
    const fetchMock = vi.fn().mockResolvedValue(new Response('[]', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    await apiFetch('/api/v1/products')

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(init.credentials).toBe('include')
    expect(new Headers(init.headers).get('X-XSRF-TOKEN')).toBeNull()
  })

  it('parseJson allows empty 204 bodies', async () => {
    const response = new Response(null, { status: 204 })
    await expect(parseJson<void>(response)).resolves.toBeUndefined()
  })

  it('formatApiErrorBody prefers Problem Details detail', () => {
    expect(
      formatApiErrorBody(
        '{"type":"about:blank","title":"Unauthorized","status":401,"detail":"Invalid credentials","instance":"/api/v1/auth/login"}',
      ),
    ).toBe('Invalid credentials')
  })

  it('parseJson throws Problem Details detail on error responses', async () => {
    const response = new Response(
      JSON.stringify({
        title: 'Unauthorized',
        status: 401,
        detail: 'Invalid credentials',
      }),
      { status: 401 },
    )
    await expect(parseJson(response)).rejects.toThrow('Invalid credentials')
  })

  it('parseJson attaches HTTP status on error', async () => {
    const response = new Response(
      JSON.stringify({ detail: 'You can only reimburse your own tickets' }),
      { status: 403 },
    )
    try {
      await parseJson(response)
      expect.unreachable('expected throw')
    } catch (err) {
      expect(err).toBeInstanceOf(Error)
      expect(getErrorStatus(err)).toBe(403)
    }
  })
})
