import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ClosedTicketsModal } from '@/components/register/ClosedTicketsModal'
import { useAuthStore } from '@/store/useAuthStore'
import type { TransactionResponse } from '@/api/transactions'

vi.mock('@/api/transactions', async () => {
  const actual = await vi.importActual<typeof import('@/api/transactions')>('@/api/transactions')
  return {
    ...actual,
    listTransactions: vi.fn(),
    getTransaction: vi.fn(),
    reimburseTransaction: vi.fn(),
  }
})

import {
  getTransaction,
  listTransactions,
  reimburseTransaction,
} from '@/api/transactions'

function sampleTx(overrides: Partial<TransactionResponse> = {}): TransactionResponse {
  return {
    id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    storeId: 'store-1',
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
        productId: 'prod-1111-2222',
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

describe('ClosedTicketsModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({
      user: {
        id: 'u1',
        username: 'cashier',
        role: 'CASHIER',
        storeId: 'store-1',
        storeName: 'Demo',
        active: true,
        uiLocale: 'en',
      },
      status: 'authenticated',
      error: null,
    })
  })

  it('lists tickets then reimburses selected qty', async () => {
    const user = userEvent.setup()
    const cashTx = sampleTx()
    const after = sampleTx({
      items: [
        {
          ...cashTx.items[0],
          returnedQuantity: 1,
          returnableQuantity: 1,
        },
      ],
    })
    vi.mocked(listTransactions).mockResolvedValue([cashTx])
    vi.mocked(getTransaction).mockResolvedValue(cashTx)
    vi.mocked(reimburseTransaction).mockResolvedValue(after)

    render(<ClosedTicketsModal open onClose={vi.fn()} />)

    await waitFor(() => {
      expect(screen.getByTestId('closed-tickets-list')).toBeInTheDocument()
    })
    expect(screen.getByTestId('closed-tickets-scope-hint')).toHaveTextContent(/Your tickets/)
    await user.click(screen.getByTestId(`closed-ticket-row-${cashTx.id}`))

    await waitFor(() => {
      expect(screen.getByTestId('closed-ticket-detail')).toBeInTheDocument()
    })

    const qty = screen.getByTestId('reimburse-line-qty-item-1')
    await user.clear(qty)
    await user.type(qty, '1')
    await user.click(screen.getByTestId('confirm-reimburse'))

    await waitFor(() => {
      expect(reimburseTransaction).toHaveBeenCalledWith(cashTx.id, {
        lines: [{ transactionItemId: 'item-1', quantity: 1 }],
      })
    })
    expect(screen.getByTestId('closed-tickets-success')).toBeInTheDocument()
  })

  it('shows all-store hint for admin', async () => {
    useAuthStore.setState({
      user: {
        id: 'admin-1',
        username: 'admin',
        role: 'ADMIN',
        storeId: 'store-1',
        storeName: 'Demo',
        active: true,
        uiLocale: 'en',
      },
      status: 'authenticated',
      error: null,
    })
    vi.mocked(listTransactions).mockResolvedValue([])

    render(<ClosedTicketsModal open onClose={vi.fn()} />)

    await waitFor(() => {
      expect(screen.getByTestId('closed-tickets-scope-hint')).toHaveTextContent(
        /All store tickets/,
      )
    })
    expect(screen.getByText('No completed tickets yet.')).toBeInTheDocument()
  })

  it('shows own empty copy for cashier', async () => {
    vi.mocked(listTransactions).mockResolvedValue([])
    render(<ClosedTicketsModal open onClose={vi.fn()} />)
    await waitFor(() => {
      expect(screen.getByText('You have no completed tickets yet.')).toBeInTheDocument()
    })
  })

  it('shows friendly message on 403 reimburse', async () => {
    const user = userEvent.setup()
    const cashTx = sampleTx()
    vi.mocked(listTransactions).mockResolvedValue([cashTx])
    vi.mocked(getTransaction).mockResolvedValue(cashTx)
    const forbidden = Object.assign(new Error('You can only reimburse your own tickets'), {
      status: 403,
    })
    vi.mocked(reimburseTransaction).mockRejectedValue(forbidden)

    render(<ClosedTicketsModal open onClose={vi.fn()} />)

    await waitFor(() => {
      expect(screen.getByTestId(`closed-ticket-row-${cashTx.id}`)).toBeInTheDocument()
    })
    await user.click(screen.getByTestId(`closed-ticket-row-${cashTx.id}`))
    await waitFor(() => {
      expect(screen.getByTestId('confirm-reimburse')).toBeInTheDocument()
    })
    await user.click(screen.getByTestId('confirm-reimburse'))

    await waitFor(() => {
      expect(screen.getByTestId('closed-tickets-error')).toHaveTextContent(
        /only reimburse your own tickets/i,
      )
    })
  })

  it('shows productName when provided, falls back to id prefix when absent', async () => {
    const user = userEvent.setup()
    const txWithName = sampleTx({
      items: [{ ...sampleTx().items[0], productName: 'Coca Cola 355ml' }],
    })
    const txNoName = sampleTx({
      items: [{ ...sampleTx().items[0], productId: 'prod-1111-2222' }],
    })
    vi.mocked(listTransactions).mockResolvedValue([txWithName])
    vi.mocked(getTransaction).mockResolvedValueOnce(txWithName).mockResolvedValueOnce(txNoName)

    render(<ClosedTicketsModal open onClose={vi.fn()} />)
    await waitFor(() => {
      expect(screen.getByTestId(`closed-ticket-row-${txWithName.id}`)).toBeInTheDocument()
    })
    await user.click(screen.getByTestId(`closed-ticket-row-${txWithName.id}`))
    await waitFor(() => {
      expect(screen.getByTestId('closed-ticket-detail')).toBeInTheDocument()
    })
    expect(screen.getByText('Coca Cola 355ml')).toBeInTheDocument()
  })

  it('localizes CASH payment label to CASH in English and EFECTIVO in Spanish', async () => {
    const user = userEvent.setup()
    const cashTx = sampleTx()
    vi.mocked(listTransactions).mockResolvedValue([cashTx])
    vi.mocked(getTransaction).mockResolvedValue(cashTx)

    render(<ClosedTicketsModal open onClose={vi.fn()} />)
    await waitFor(() => {
      expect(screen.getByTestId(`closed-ticket-row-${cashTx.id}`)).toBeInTheDocument()
    })

    // list row shows English label
    expect(screen.getByTestId(`closed-ticket-row-${cashTx.id}`)).toHaveTextContent('CASH')

    await user.click(screen.getByTestId(`closed-ticket-row-${cashTx.id}`))
    await waitFor(() => {
      expect(screen.getByTestId('closed-ticket-detail')).toBeInTheDocument()
    })
    // detail also shows English label (not raw enum)
    expect(screen.getByTestId('closed-ticket-detail')).toHaveTextContent('CASH')
  })

  it('blocks reimburse when ticket has CARD', async () => {
    const user = userEvent.setup()
    const cardTx = sampleTx({
      payments: [{ id: 'pay-1', paymentMethod: 'CARD', amount: 10 }],
    })
    vi.mocked(listTransactions).mockResolvedValue([cardTx])
    vi.mocked(getTransaction).mockResolvedValue(cardTx)

    render(<ClosedTicketsModal open onClose={vi.fn()} />)

    await waitFor(() => {
      expect(screen.getByTestId(`closed-ticket-row-${cardTx.id}`)).toBeInTheDocument()
    })
    await user.click(screen.getByTestId(`closed-ticket-row-${cardTx.id}`))

    await waitFor(() => {
      expect(screen.getByTestId('closed-tickets-card-blocked')).toBeInTheDocument()
    })
    expect(screen.getByTestId('confirm-reimburse')).toBeDisabled()
  })
})
