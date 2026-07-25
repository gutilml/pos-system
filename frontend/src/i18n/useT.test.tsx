import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useAuthStore } from '@/store/useAuthStore'
import { useT } from '@/i18n/useT'

describe('useT', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: {
        id: 'u1',
        username: 'admin',
        role: 'ADMIN',
        storeId: '00000000-0000-0000-0000-000000000001',
        uiLocale: 'en',
        enableInventory: true,
        enableCustomerCredit: true,
      },
      status: 'authenticated',
      error: null,
    })
  })

  it('returns a stable function when locale is unchanged', () => {
    const { result, rerender } = renderHook(() => useT())
    const first = result.current
    rerender()
    expect(result.current).toBe(first)
  })

  it('returns a new function when locale changes', () => {
    const { result, rerender } = renderHook(() => useT())
    const first = result.current
    useAuthStore.setState({
      user: {
        ...useAuthStore.getState().user!,
        uiLocale: 'es',
      },
    })
    rerender()
    expect(result.current).not.toBe(first)
    expect(result.current('common.loading')).toBe('Cargando…')
  })
})
