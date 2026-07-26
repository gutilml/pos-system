import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { StoreSettingsWorkspace } from '@/features/admin/StoreSettingsWorkspace'
import { useAuthStore } from '@/store/useAuthStore'
import { useCartStore } from '@/store/useCartStore'

vi.mock('@/api/storeSettings', () => ({
  patchStoreSettings: vi.fn(),
}))

import { patchStoreSettings } from '@/api/storeSettings'

describe('StoreSettingsWorkspace tax rate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useCartStore.setState({ taxRate: 0.08 })
    useAuthStore.setState({
      user: {
        id: 'u1',
        username: 'admin',
        role: 'ADMIN',
        storeId: 'store-1',
        storeName: 'Demo',
        active: true,
        uiLocale: 'en',
        defaultTaxRate: 0.08,
      },
      status: 'authenticated',
      error: null,
    })
  })

  it('PATCHes default_tax_rate and updates cart', async () => {
    const user = userEvent.setup()
    vi.mocked(patchStoreSettings).mockResolvedValue({
      storeId: 'store-1',
      storeName: 'Demo',
      features: {},
      preferences: { default_tax_rate: 0.16 },
      uiLocale: 'en',
    })

    render(<StoreSettingsWorkspace />)

    const input = screen.getByTestId('tax-rate-input')
    expect(input).toHaveValue('8')
    await user.clear(input)
    await user.type(input, '16')
    await user.click(screen.getByTestId('tax-rate-save'))

    expect(patchStoreSettings).toHaveBeenCalledWith('store-1', {
      preferences: { default_tax_rate: 0.16 },
    })
    expect(useAuthStore.getState().user?.defaultTaxRate).toBe(0.16)
    expect(useCartStore.getState().taxRate).toBe(0.16)
    expect(screen.getByTestId('tax-rate-saved')).toBeInTheDocument()
  })
})
