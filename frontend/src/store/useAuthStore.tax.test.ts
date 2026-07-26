import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from '@/store/useAuthStore'
import { useCartStore } from '@/store/useCartStore'

vi.mock('@/api/auth', () => ({
  fetchCsrf: vi.fn().mockResolvedValue('csrf'),
  fetchMe: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
}))

vi.mock('@/api/storeSettings', () => ({
  patchStoreSettings: vi.fn(),
}))

import { fetchMe, login } from '@/api/auth'
import { patchStoreSettings } from '@/api/storeSettings'

describe('useAuthStore Feature 089 tax hydrate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({
      user: null,
      status: 'idle',
      error: null,
    })
    useCartStore.setState({ taxRate: 0 })
  })

  it('hydrates cart taxRate from /me defaultTaxRate', async () => {
    vi.mocked(fetchMe).mockResolvedValue({
      id: 'u1',
      username: 'cashier',
      role: 'CASHIER',
      storeId: 'store-1',
      storeName: 'Demo',
      active: true,
      uiLocale: 'en',
      defaultTaxRate: 0.08,
    })
    await useAuthStore.getState().bootstrap()
    expect(useCartStore.getState().taxRate).toBe(0.08)
  })

  it('hydrates cart taxRate on login', async () => {
    vi.mocked(login).mockResolvedValue({
      id: 'u1',
      username: 'cashier',
      role: 'CASHIER',
      storeId: 'store-1',
      storeName: 'Demo',
      active: true,
      uiLocale: 'en',
      defaultTaxRate: 0.16,
    })
    await useAuthStore.getState().login('cashier', 'cashier')
    expect(useCartStore.getState().taxRate).toBe(0.16)
  })

  it('setTaxRateAndPersist PATCHes preferences and cart', async () => {
    vi.mocked(patchStoreSettings).mockResolvedValue({
      storeId: 'store-1',
      storeName: 'Demo',
      features: {},
      preferences: { default_tax_rate: 0.1 },
      uiLocale: 'en',
    })
    useAuthStore.setState({
      user: {
        id: 'u1',
        username: 'cashier',
        role: 'CASHIER',
        storeId: 'store-1',
        storeName: 'Demo',
        active: true,
        uiLocale: 'en',
        defaultTaxRate: 0.08,
      },
      status: 'authenticated',
      error: null,
    })

    await useAuthStore.getState().setTaxRateAndPersist(0.1)

    expect(patchStoreSettings).toHaveBeenCalledWith('store-1', {
      preferences: { default_tax_rate: 0.1 },
    })
    expect(useAuthStore.getState().user?.defaultTaxRate).toBe(0.1)
    expect(useCartStore.getState().taxRate).toBe(0.1)
  })
})
