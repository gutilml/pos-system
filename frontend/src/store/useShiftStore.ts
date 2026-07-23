import { create } from 'zustand'
import {
  addDrawerEventRequest,
  closeShiftRequest,
  DEFAULT_STORE_ID,
  fetchCurrentShift,
  openShiftRequest,
  type CashDrawerEvent,
  type CashDrawerEventRequest,
  type Shift,
} from '@/api/shifts'
import { useCartStore } from '@/store/useCartStore'

type ShiftState = {
  currentShift: Shift | null
  /** Closed shift awaiting discrepancy ticket dismiss; cleared on Done / next open. */
  lastClosedShift: Shift | null
  isLoading: boolean
  error: string | null
  /** True when the last hydration request failed (distinct from “no open shift”). */
  hydrationFailed: boolean
  checkCurrentShift: (storeId?: string) => Promise<void>
  openShift: (startingCash: number, storeId?: string) => Promise<void>
  closeShift: (actualCash: number) => Promise<Shift>
  addDrawerEvent: (body: CashDrawerEventRequest) => Promise<CashDrawerEvent>
  clearLastClosedShift: () => void
  clearError: () => void
}

export const useShiftStore = create<ShiftState>((set, get) => ({
  currentShift: null,
  lastClosedShift: null,
  isLoading: true,
  error: null,
  hydrationFailed: false,

  clearError: () => set({ error: null }),

  clearLastClosedShift: () => set({ lastClosedShift: null }),

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
      set({
        currentShift: shift,
        lastClosedShift: null,
        isLoading: false,
        hydrationFailed: false,
      })
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
      const closed = await closeShiftRequest(shift.id, actualCash)
      useCartStore.getState().resetAllTickets()
      set({
        currentShift: null,
        lastClosedShift: closed,
        isLoading: false,
      })
      return closed
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to close shift'
      set({ isLoading: false, error: message })
      throw error
    }
  },

  addDrawerEvent: async (body) => {
    const shift = get().currentShift
    if (!shift) {
      throw new Error('No open shift for drawer event')
    }

    set({ isLoading: true, error: null })
    try {
      const event = await addDrawerEventRequest(shift.id, body)
      set({ isLoading: false })
      return event
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to record drawer event'
      set({ isLoading: false, error: message })
      throw error
    }
  },
}))
