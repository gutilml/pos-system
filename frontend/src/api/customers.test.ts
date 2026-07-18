import { afterEach, describe, expect, it, vi } from 'vitest'
import { searchCustomers } from '@/api/customers'

describe('searchCustomers', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('returns empty array for blank query without fetching', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    await expect(searchCustomers('   ')).resolves.toEqual([])
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('calls search with storeId and q', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: 'cust-1',
          storeId: '00000000-0000-0000-0000-000000000001',
          name: 'Dana Tab',
          phone: '555-0100',
          creditLimit: 500,
          currentBalance: 50,
        },
      ],
    })
    vi.stubGlobal('fetch', fetchMock)

    const rows = await searchCustomers('Dana')

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/customers/search?storeId=00000000-0000-0000-0000-000000000001&q=Dana',
    )
    expect(rows[0].name).toBe('Dana Tab')
    expect(rows[0].creditLimit).toBe(500)
  })
})
