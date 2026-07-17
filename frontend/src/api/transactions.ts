const API_BASE = '/api/v1'

export type PaymentMethodPayload = 'CASH' | 'CARD' | 'CREDIT'

export type CreateTransactionPayment = {
  paymentMethod: PaymentMethodPayload
  amount: number
}

export type CreateTransactionItem = {
  productId: string
  quantity: number
  /** Decimal fraction (0.10 = 10%). */
  itemDiscountPercentage?: number
}

export type CreateTransactionRequest = {
  storeId?: string
  taxRate?: number
  customerId?: string
  /** Decimal fraction (0.10 = 10%). */
  globalDiscountPercentage?: number
  items: CreateTransactionItem[]
  payments: CreateTransactionPayment[]
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
 * Persists the current ticket as a backend transaction.
 * Payload matches Feature 013 payments[] + Feature 015 discount fields.
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
