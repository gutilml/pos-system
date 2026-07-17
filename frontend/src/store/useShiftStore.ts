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
  checkCurrentShift: () => Promise<void>
  openShift: (startingCash: number, storeId?: string) => Promise<void>
  closeShift: (actualCash: number) => Promise<void>
  clearError: () => void
}

export const useShiftStore = create<ShiftState>((set, get) => ({
  currentShift: null,
  isLoading: true,
  error: null,

  clearError: () => set({ error: null }),

  checkCurrentShift: async () => {
    set({ isLoading: true, error: null })
    try {
      const shift = await fetchCurrentShift()
      set({
        currentShift: shift?.status === 'OPEN' ? shift : null,
        isLoading: false,
      })
    } catch (error) {
      // Network/backend unavailable: treat as no open shift so Open Shift gate still works.
      const message = error instanceof Error ? error.message : 'Failed to load shift'
      set({ currentShift: null, isLoading: false, error: message })
    }
  },

  openShift: async (startingCash, storeId = DEFAULT_STORE_ID) => {
    set({ isLoading: true, error: null })
    try {
      const shift = await openShiftRequest(storeId, startingCash)
      set({ currentShift: shift, isLoading: false })
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
