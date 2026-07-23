import { apiFetch, parseJson } from '@/api/http'

const API_BASE = '/api/v1'

export type TransactionStatus =
  | 'IN_PROGRESS'
  | 'HELD'
  | 'COMPLETED'
  | 'VOIDED'

export type CheckoutSessionResponse = {
  sessionId: string
  checkoutUrl: string
}

export type TransactionStatusResponse = {
  id: string
  status: TransactionStatus
}

/** Creates a Stripe Checkout Session for an existing transaction. */
export async function createCheckoutSession(
  transactionId: string,
): Promise<CheckoutSessionResponse> {
  const response = await apiFetch(`${API_BASE}/payments/checkout/${transactionId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
  return parseJson<CheckoutSessionResponse>(response)
}

/** Polls backend for transaction status after card payment. */
export async function getTransactionStatus(
  transactionId: string,
): Promise<TransactionStatusResponse> {
  const response = await apiFetch(`${API_BASE}/transactions/${transactionId}/status`)
  return parseJson<TransactionStatusResponse>(response)
}
