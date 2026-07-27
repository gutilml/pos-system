import { DEFAULT_STORE_ID } from '@/api/shifts'
import { apiFetch, parseJson } from '@/api/http'

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

export type TransactionPaymentResponse = {
  id: string
  paymentMethod: PaymentMethodPayload
  amount: number
}

export type TransactionItemResponse = {
  id: string
  productId: string
  productName?: string | null
  quantity: number
  priceAtTime: number
  originalUnitPrice: number
  itemDiscountPercentage: number
  finalUnitPrice: number
  lineTotal: number
  returnedQuantity: number
  returnableQuantity: number
}

export type TransactionResponse = {
  id: string
  storeId: string
  shiftId: string | null
  customerId: string | null
  status: string
  subtotal: number
  taxTotal: number
  grandTotal: number
  globalDiscountPercentage: number
  totalDiscountAmount: number
  amountReceived: number
  changeGiven: number
  payments: TransactionPaymentResponse[]
  items: TransactionItemResponse[]
  createdAt: string
}

export type ReimburseLineRequest = {
  transactionItemId: string
  quantity: number
}

export type ReimburseRequest = {
  lines?: ReimburseLineRequest[]
}

export type ReimburseLineSelection = {
  transactionItemId: string
  quantity: number
  selected: boolean
}

/**
 * Persists the current ticket as a backend transaction.
 * Payload matches Feature 013 payments[] + Feature 015 discount fields.
 */
export async function createTransaction(
  request: CreateTransactionRequest,
): Promise<CreateTransactionResponse> {
  const response = await apiFetch(`${API_BASE}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  return parseJson<CreateTransactionResponse>(response)
}

/** COMPLETED tickets for the store (Feature 072/073). */
export async function listTransactions(
  storeId: string = DEFAULT_STORE_ID,
): Promise<TransactionResponse[]> {
  const params = new URLSearchParams({ storeId })
  const response = await apiFetch(`${API_BASE}/transactions?${params.toString()}`)
  return parseJson<TransactionResponse[]>(response)
}

export async function getTransaction(id: string): Promise<TransactionResponse> {
  const response = await apiFetch(`${API_BASE}/transactions/${id}`)
  return parseJson<TransactionResponse>(response)
}

/**
 * Reimburse full remaining (omit/empty lines) or selected line quantities.
 */
export async function reimburseTransaction(
  id: string,
  request: ReimburseRequest = {},
): Promise<TransactionResponse> {
  const response = await apiFetch(`${API_BASE}/transactions/${id}/reimburse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  return parseJson<TransactionResponse>(response)
}

export function transactionHasCard(transaction: TransactionResponse): boolean {
  return transaction.payments.some((p) => p.paymentMethod === 'CARD')
}

/**
 * Builds the reimburse POST body from UI line selections.
 * Only selected lines with quantity &gt; 0 are included.
 */
export function buildReimbursePayload(lines: ReimburseLineSelection[]): ReimburseRequest {
  return {
    lines: lines
      .filter((line) => line.selected && line.quantity > 0)
      .map(({ transactionItemId, quantity }) => ({ transactionItemId, quantity })),
  }
}
