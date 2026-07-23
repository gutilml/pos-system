import { beforeEach, describe, expect, it, vi } from 'vitest'
import { resetCartForTests, selectActiveItems, useCartStore } from '@/store/useCartStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useShiftStore } from '@/store/useShiftStore'
import type { AuthUser } from '@/api/auth'

vi.mock('@/api/auth', () => ({
  fetchCsrf: vi.fn(),
  fetchMe: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
}))

import { fetchCsrf, fetchMe, login, logout } from '@/api/auth'

const admin: AuthUser = {
  id: 'user-1',
  username: 'admin',
  role: 'ADMIN',
  storeId: 'store-1',
  storeName: 'Demo',
  active: true,
}

describe('useAuthStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({
      user: null,
      status: 'idle',
      error: null,
    })
    useShiftStore.setState({
      currentShift: {
        id: 'shift-1',
        storeId: 'store-1',
        status: 'OPEN',
        startingCash: 100,
        expectedCash: null,
        actualCash: null,
        discrepancy: null,
        openedAt: '2026-07-16T12:00:00Z',
        closedAt: null,
      },
      lastClosedShift: null,
      isLoading: false,
      error: null,
      hydrationFailed: false,
    })
    resetCartForTests({
      items: [
        {
          productId: 'p1',
          sku: '1001',
          name: 'Cola',
          unitPrice: 1.99,
          quantity: 1,
        },
      ],
    })
  })

  it('bootstrap authenticates when /me succeeds', async () => {
    vi.mocked(fetchCsrf).mockResolvedValue('csrf')
    vi.mocked(fetchMe).mockResolvedValue(admin)

    await useAuthStore.getState().bootstrap()

    expect(useAuthStore.getState().status).toBe('authenticated')
    expect(useAuthStore.getState().user?.username).toBe('admin')
  })

  it('bootstrap sets unauthenticated on 401', async () => {
    vi.mocked(fetchCsrf).mockResolvedValue('csrf')
    vi.mocked(fetchMe).mockRejectedValue(new Error('Unauthorized'))

    await useAuthStore.getState().bootstrap()

    expect(useAuthStore.getState().status).toBe('unauthenticated')
    expect(useAuthStore.getState().user).toBeNull()
  })

  it('login success stores the user', async () => {
    vi.mocked(login).mockResolvedValue(admin)

    await useAuthStore.getState().login('admin', 'admin')

    expect(useAuthStore.getState().status).toBe('authenticated')
    expect(useAuthStore.getState().user?.role).toBe('ADMIN')
  })

  it('login failure stays unauthenticated with error', async () => {
    vi.mocked(login).mockRejectedValue(new Error('Invalid credentials'))

    await expect(useAuthStore.getState().login('admin', 'wrong')).rejects.toThrow(/invalid/i)
    expect(useAuthStore.getState().status).toBe('unauthenticated')
    expect(useAuthStore.getState().error).toMatch(/invalid/i)
  })

  it('logout clears user, shift, and cart', async () => {
    useAuthStore.setState({ user: admin, status: 'authenticated' })
    vi.mocked(logout).mockResolvedValue(undefined)

    await useAuthStore.getState().logout()

    expect(useAuthStore.getState().status).toBe('unauthenticated')
    expect(useAuthStore.getState().user).toBeNull()
    expect(useShiftStore.getState().currentShift).toBeNull()
    expect(selectActiveItems(useCartStore.getState())).toHaveLength(0)
  })
})
