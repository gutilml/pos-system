import { create } from 'zustand'
import {
  fetchCsrf,
  fetchMe,
  login as loginRequest,
  logout as logoutRequest,
  type AuthUser,
} from '@/api/auth'
import { DEFAULT_STORE_ID } from '@/api/shifts'
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
}

export function selectStoreId(state: AuthState): string {
  return state.user?.storeId ?? DEFAULT_STORE_ID
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'idle',
  error: null,

  clearError: () => set({ error: null }),

  bootstrap: async () => {
    set({ status: 'loading', error: null })
    try {
      await fetchCsrf()
      const user = await fetchMe()
      set({ user, status: 'authenticated', error: null })
    } catch {
      set({ user: null, status: 'unauthenticated', error: null })
    }
  },

  login: async (username, password) => {
    set({ error: null })
    try {
      const user = await loginRequest(username, password)
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
    set({ user: null, status: 'unauthenticated' })
  },
}))
