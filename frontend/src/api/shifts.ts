import { apiFetch, parseJson } from '@/api/http'

export type ShiftStatus = 'OPEN' | 'CLOSED'

export type Shift = {
  id: string
  storeId: string
  status: ShiftStatus
  startingCash: number
  expectedCash: number | null
  actualCash: number | null
  discrepancy: number | null
  openedAt: string | null
  closedAt: string | null
  /** Feature 079/080 — null on legacy shifts */
  openedBy?: string | null
  closedBy?: string | null
  openedByUsername?: string | null
  closedByUsername?: string | null
  /** CLOSED only — Feature 029/030 sales summary */
  totalCashPayments?: number | null
  totalCardPayments?: number | null
  totalCreditPayments?: number | null
  totalSalesGrandTotal?: number | null
}

/** Fallback when `/me.storeId` is null; prefer auth store id in the UI. */
export const DEFAULT_STORE_ID = '00000000-0000-0000-0000-000000000001'

const API_BASE = '/api/v1'

/**
 * Returns the store's OPEN shift, or null when the API responds 404 (no open shift).
 * Other non-OK statuses throw so the gate can show Retry instead of fail-opening.
 */
export async function fetchCurrentShift(
  storeId: string = DEFAULT_STORE_ID,
): Promise<Shift | null> {
  const params = new URLSearchParams({ storeId })
  const response = await apiFetch(`${API_BASE}/shifts/current?${params.toString()}`)
  if (response.status === 404) {
    return null
  }
  return parseJson<Shift>(response)
}

export async function openShiftRequest(
  storeId: string,
  startingCash: number,
): Promise<Shift> {
  const response = await apiFetch(`${API_BASE}/shifts/open`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ storeId, startingCash }),
  })
  return parseJson<Shift>(response)
}

export async function closeShiftRequest(
  shiftId: string,
  actualCash: number,
): Promise<Shift> {
  const response = await apiFetch(`${API_BASE}/shifts/${shiftId}/close`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ actualCash }),
  })
  return parseJson<Shift>(response)
}

export type CashDrawerEventType = 'PAY_IN' | 'PAY_OUT'

export type CashDrawerEvent = {
  id: string
  shiftId: string
  type: CashDrawerEventType
  amount: number
  reason: string
  createdAt: string | null
}

export type CashDrawerEventRequest = {
  type: CashDrawerEventType
  amount: number
  reason: string
}

export async function addDrawerEventRequest(
  shiftId: string,
  body: CashDrawerEventRequest,
): Promise<CashDrawerEvent> {
  const response = await apiFetch(`${API_BASE}/shifts/${shiftId}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return parseJson<CashDrawerEvent>(response)
}

/** Feature 077/078 — list shifts for a store (newest first). */
export async function listShifts(
  storeId: string,
  status?: ShiftStatus,
): Promise<Shift[]> {
  const params = new URLSearchParams({ storeId })
  if (status) params.set('status', status)
  const response = await apiFetch(`${API_BASE}/shifts?${params.toString()}`)
  return parseJson<Shift[]>(response)
}

export type ShiftDetail = Shift & {
  events: CashDrawerEvent[]
}

export async function getShiftDetail(shiftId: string): Promise<ShiftDetail> {
  const response = await apiFetch(`${API_BASE}/shifts/${shiftId}`)
  return parseJson<ShiftDetail>(response)
}
