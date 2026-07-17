const API_BASE = '/api/v1'

export type CreateTransactionRequest = {
  storeId?: string
  amountReceived: number
  taxRate?: number
  items: Array<{ productId: string; quantity: number }>
}

export type CreateTransactionResponse = {
  id: string
  status: string
}

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const detail = await response.text()
    throw new Error(detail || `Request failed (${response.status})`)
  }
  return response.json() as Promise<T>
}

/**
 * Persists the current ticket as a backend transaction so Stripe checkout can attach to it.
 * Backend should return IN_PROGRESS for card flows (Feature 010 follow-up).
 */
export async function createTransaction(
  request: CreateTransactionRequest,
): Promise<CreateTransactionResponse> {
  const response = await fetch(`${API_BASE}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  return parseJson<CreateTransactionResponse>(response)
}
