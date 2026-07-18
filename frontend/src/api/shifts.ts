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
}

/** Temporary default until auth/store selection exists. */
export const DEFAULT_STORE_ID = '00000000-0000-0000-0000-000000000001'

const API_BASE = '/api/v1'

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const detail = await response.text()
    throw new Error(detail || `Request failed (${response.status})`)
  }
  return response.json() as Promise<T>
}

/**
 * Returns the store's OPEN shift, or null when the API responds 404 (no open shift).
 * Other non-OK statuses throw so the gate can show Retry instead of fail-opening.
 */
export async function fetchCurrentShift(
  storeId: string = DEFAULT_STORE_ID,
): Promise<Shift | null> {
  const params = new URLSearchParams({ storeId })
  const response = await fetch(`${API_BASE}/shifts/current?${params.toString()}`)
  if (response.status === 404) {
    return null
  }
  return parseJson<Shift>(response)
}

export async function openShiftRequest(
  storeId: string,
  startingCash: number,
): Promise<Shift> {
  const response = await fetch(`${API_BASE}/shifts/open`, {
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
  const response = await fetch(`${API_BASE}/shifts/${shiftId}/close`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ actualCash }),
  })
  return parseJson<Shift>(response)
}
