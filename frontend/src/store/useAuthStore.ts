import { create } from 'zustand'
import {
  fetchCsrf,
  fetchMe,
  login as loginRequest,
  logout as logoutRequest,
  type AuthUser,
} from '@/api/auth'
import { DEFAULT_STORE_ID } from '@/api/shifts'
import { patchStoreSettings } from '@/api/storeSettings'
import { normalizeLocale, type Locale } from '@/i18n/locale'
import { useCartStore } from '@/store/useCartStore'
import { useShiftStore } from '@/store/useShiftStore'

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated'

type AuthState = {
  user: AuthUser | null
  status: AuthStatus
  error: string | null
  bootstrap: () => Promise<void>
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
  setLocaleAndPersist: (locale: Locale) => Promise<void>
  /** Persist store `preferences.default_tax_rate` (fraction 0–1) and hydrate cart. */
  setTaxRateAndPersist: (taxRateFraction: number) => Promise<void>
}

export function selectStoreId(state: AuthState): string {
  return state.user?.storeId ?? DEFAULT_STORE_ID
}

function applyDocumentLang(user: AuthUser | null) {
  if (typeof document === 'undefined') return
  document.documentElement.lang = normalizeLocale(user?.uiLocale)
}

/** Feature 089: hydrate cart tax from store default on /me and login. */
function applyStoreTaxRate(user: AuthUser | null) {
  if (!user) return
  const rate = user.defaultTaxRate
  if (rate == null || !Number.isFinite(Number(rate))) return
  useCartStore.getState().setTaxRate(Math.max(0, Number(rate)))
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  status: 'idle',
  error: null,

  clearError: () => set({ error: null }),

  bootstrap: async () => {
    set({ status: 'loading', error: null })
    try {
      await fetchCsrf()
      const user = await fetchMe()
      applyDocumentLang(user)
      applyStoreTaxRate(user)
      set({ user, status: 'authenticated', error: null })
    } catch {
      applyDocumentLang(null)
      set({ user: null, status: 'unauthenticated', error: null })
    }
  },

  login: async (username, password) => {
    set({ error: null })
    try {
      const user = await loginRequest(username, password)
      applyDocumentLang(user)
      applyStoreTaxRate(user)
      set({ user, status: 'authenticated', error: null })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed'
      set({ user: null, status: 'unauthenticated', error: message })
      throw error
    }
  },

  logout: async () => {
    set({ error: null })
    try {
      await logoutRequest()
    } catch {
      // Still clear local session if the network call fails.
    }
    useShiftStore.setState({
      currentShift: null,
      lastClosedShift: null,
      isLoading: false,
      error: null,
      hydrationFailed: false,
    })
    useCartStore.getState().resetAllTickets()
    applyDocumentLang(null)
    set({ user: null, status: 'unauthenticated' })
  },

  setLocaleAndPersist: async (locale) => {
    const { user } = get()
    const storeId = user?.storeId
    if (!user || !storeId) {
      throw new Error('Not authenticated')
    }
    const previous = user
    const optimistic = { ...user, uiLocale: locale }
    applyDocumentLang(optimistic)
    set({ user: optimistic, error: null })
    try {
      const updated = await patchStoreSettings(storeId, {
        preferences: { ui_locale: locale },
      })
      const nextUser = { ...user, uiLocale: normalizeLocale(updated.uiLocale) }
      applyDocumentLang(nextUser)
      set({ user: nextUser })
    } catch (error) {
      applyDocumentLang(previous)
      set({ user: previous })
      throw error
    }
  },

  setTaxRateAndPersist: async (taxRateFraction) => {
    const { user } = get()
    const storeId = user?.storeId
    if (!user || !storeId) {
      throw new Error('Not authenticated')
    }
    if (!Number.isFinite(taxRateFraction) || taxRateFraction < 0 || taxRateFraction > 1) {
      throw new Error('Invalid tax rate')
    }
    const previous = user
    const previousCartRate = useCartStore.getState().taxRate
    const optimistic = { ...user, defaultTaxRate: taxRateFraction }
    set({ user: optimistic, error: null })
    useCartStore.getState().setTaxRate(taxRateFraction)
    try {
      const updated = await patchStoreSettings(storeId, {
        preferences: { default_tax_rate: taxRateFraction },
      })
      const raw = updated.preferences?.default_tax_rate
      const nextRate =
        raw != null && Number.isFinite(Number(raw))
          ? Math.max(0, Number(raw))
          : taxRateFraction
      set({ user: { ...user, defaultTaxRate: nextRate } })
      useCartStore.getState().setTaxRate(nextRate)
    } catch (error) {
      set({ user: previous })
      useCartStore.getState().setTaxRate(previousCartRate)
      throw error
    }
  },
}))
