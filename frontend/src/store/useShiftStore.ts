import { create } from 'zustand'
import {
  closeShiftRequest,
  DEFAULT_STORE_ID,
  fetchCurrentShift,
  openShiftRequest,
  type Shift,
} from '@/api/shifts'
import { useCartStore } from '@/store/useCartStore'

type ShiftState = {
  currentShift: Shift | null
  isLoading: boolean
  error: string | null
  /** True when the last hydration request failed (distinct from “no open shift”). */
  hydrationFailed: boolean
  checkCurrentShift: (storeId?: string) => Promise<void>
  openShift: (startingCash: number, storeId?: string) => Promise<void>
  closeShift: (actualCash: number) => Promise<void>
  clearError: () => void
}

export const useShiftStore = create<ShiftState>((set, get) => ({
  currentShift: null,
  isLoading: true,
  error: null,
  hydrationFailed: false,

  clearError: () => set({ error: null }),

  checkCurrentShift: async (storeId = DEFAULT_STORE_ID) => {
    set({ isLoading: true, error: null, hydrationFailed: false })
    try {
      const shift = await fetchCurrentShift(storeId)
      set({
        currentShift: shift?.status === 'OPEN' ? shift : null,
        isLoading: false,
        hydrationFailed: false,
        error: null,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load shift'
      set({
        currentShift: null,
        isLoading: false,
        hydrationFailed: true,
        error: message,
      })
    }
  },

  openShift: async (startingCash, storeId = DEFAULT_STORE_ID) => {
    set({ isLoading: true, error: null })
    try {
      const shift = await openShiftRequest(storeId, startingCash)
      set({ currentShift: shift, isLoading: false, hydrationFailed: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to open shift'
      set({ isLoading: false, error: message })
      throw error
    }
  },

  closeShift: async (actualCash) => {
    const shift = get().currentShift
    if (!shift) {
      throw new Error('No open shift to close')
    }

    set({ isLoading: true, error: null })
    try {
      await closeShiftRequest(shift.id, actualCash)
      useCartStore.getState().resetAllTickets()
      set({ currentShift: null, isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to close shift'
      set({ isLoading: false, error: message })
      throw error
    }
  },
}))
