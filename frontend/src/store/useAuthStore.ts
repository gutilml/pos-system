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
}

export function selectStoreId(state: AuthState): string {
  return state.user?.storeId ?? DEFAULT_STORE_ID
}

function applyDocumentLang(user: AuthUser | null) {
  if (typeof document === 'undefined') return
  document.documentElement.lang = normalizeLocale(user?.uiLocale)
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
}))
