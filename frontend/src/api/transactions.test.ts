import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  buildReimbursePayload,
  getTransaction,
  listTransactions,
  reimburseTransaction,
  transactionHasCard,
  type TransactionResponse,
} from '@/api/transactions'

function sampleTx(overrides: Partial<TransactionResponse> = {}): TransactionResponse {
  return {
    id: 'tx-1',
    storeId: '00000000-0000-0000-0000-000000000001',
    shiftId: 'shift-1',
    customerId: null,
    status: 'COMPLETED',
    subtotal: 10,
    taxTotal: 0,
    grandTotal: 10,
    globalDiscountPercentage: 0,
    totalDiscountAmount: 0,
    amountReceived: 10,
    changeGiven: 0,
    payments: [{ id: 'pay-1', paymentMethod: 'CASH', amount: 10 }],
    items: [
      {
        id: 'item-1',
        productId: 'prod-1',
        quantity: 2,
        priceAtTime: 5,
        originalUnitPrice: 5,
        itemDiscountPercentage: 0,
        finalUnitPrice: 5,
        lineTotal: 10,
        returnedQuantity: 0,
        returnableQuantity: 2,
      },
    ],
    createdAt: '2026-07-25T12:00:00Z',
    ...overrides,
  }
}

describe('transactions API (073)', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('lists transactions by storeId', async () => {
    const payload = [sampleTx()]
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const rows = await listTransactions()
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/transactions?storeId=00000000-0000-0000-0000-000000000001',
      expect.objectContaining({ credentials: 'include' }),
    )
    expect(rows[0].items[0].returnableQuantity).toBe(2)
  })

  it('gets a transaction by id', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(sampleTx()), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await getTransaction('tx-1')
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/transactions/tx-1',
      expect.objectContaining({ credentials: 'include' }),
    )
  })

  it('posts reimburse with selected lines', async () => {
    document.cookie = 'XSRF-TOKEN=csrf-test'
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(sampleTx()), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await reimburseTransaction('tx-1', {
      lines: [{ transactionItemId: 'item-1', quantity: 1 }],
    })

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/transactions/tx-1/reimburse',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ lines: [{ transactionItemId: 'item-1', quantity: 1 }] }),
      }),
    )
  })

  it('buildReimbursePayload includes only selected positive qty lines', () => {
    expect(
      buildReimbursePayload([
        { transactionItemId: 'a', quantity: 1, selected: true },
        { transactionItemId: 'b', quantity: 2, selected: false },
        { transactionItemId: 'c', quantity: 0, selected: true },
        { transactionItemId: 'd', quantity: 1.5, selected: true },
      ]),
    ).toEqual({
      lines: [
        { transactionItemId: 'a', quantity: 1 },
        { transactionItemId: 'd', quantity: 1.5 },
      ],
    })
  })

  it('detects CARD payments', () => {
    expect(transactionHasCard(sampleTx())).toBe(false)
    expect(
      transactionHasCard(
        sampleTx({
          payments: [
            { id: 'p1', paymentMethod: 'CASH', amount: 5 },
            { id: 'p2', paymentMethod: 'CARD', amount: 5 },
          ],
        }),
      ),
    ).toBe(true)
  })
})
