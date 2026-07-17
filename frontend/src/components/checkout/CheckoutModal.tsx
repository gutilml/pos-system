import { useEffect, useState } from 'react'
import { DEFAULT_STORE_ID } from '@/api/shifts'
import { createTransaction } from '@/api/transactions'
import { CustomerSearch } from '@/components/checkout/CustomerSearch'
import { PaymentTenderList } from '@/components/checkout/PaymentTenderList'
import { TenderInputArea } from '@/components/checkout/TenderInputArea'
import { formatMoney } from '@/lib/money'
import {
  selectActiveCustomer,
  selectActiveItems,
  selectActivePayments,
  selectAvailableCredit,
  selectBalanceDue,
  selectCanCompleteSale,
  selectGrandTotal,
  selectTenderChangeDue,
  selectTotalTendered,
  useCartStore,
  type AssignedCustomer,
  type PaymentMethod,
} from '@/store/useCartStore'

type CheckoutModalProps = {
  open: boolean
  onClose: () => void
  onCompleted?: () => void
}

export function CheckoutModal({ open, onClose, onCompleted }: CheckoutModalProps) {
  const items = useCartStore(selectActiveItems)
  const taxRate = useCartStore((s) => s.taxRate)
  const payments = useCartStore(selectActivePayments)
  const customer = useCartStore(selectActiveCustomer)
  const activeTicketId = useCartStore((s) => s.activeTicketId)
  const addPayment = useCartStore((s) => s.addPayment)
  const removePayment = useCartStore((s) => s.removePayment)
  const clearPayments = useCartStore((s) => s.clearPayments)
  const setCustomer = useCartStore((s) => s.setCustomer)
  const closeTicket = useCartStore((s) => s.closeTicket)

  const [requireCustomer, setRequireCustomer] = useState(false)
  const [pendingCreditAmount, setPendingCreditAmount] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const grandTotal = selectGrandTotal(items, taxRate)
  const totalTendered = selectTotalTendered(payments)
  const balanceDue = selectBalanceDue(items, taxRate, payments)
  const changeDue = selectTenderChangeDue(items, taxRate, payments)
  const canComplete = selectCanCompleteSale(items, taxRate, payments, customer)

  useEffect(() => {
    if (!open) {
      setRequireCustomer(false)
      setPendingCreditAmount(null)
      setSubmitting(false)
      setError(null)
    }
  }, [open])

  if (!open) return null

  function requestCreditGate(amount?: number) {
    if (customer) return false
    setRequireCustomer(true)
    if (amount !== undefined) {
      setPendingCreditAmount(amount)
    }
    return true
  }

  function handleAddTender(method: PaymentMethod, amount: number) {
    setError(null)
    if (method === 'CREDIT' && requestCreditGate(amount)) {
      return
    }
    addPayment(method, amount)
  }

  function handleCustomerAssigned(next: AssignedCustomer) {
    setCustomer(next)
    setRequireCustomer(false)
    if (pendingCreditAmount !== null && pendingCreditAmount > 0) {
      addPayment('CREDIT', pendingCreditAmount)
      setPendingCreditAmount(null)
    }
  }

  async function handleComplete() {
    if (!canComplete || submitting) return
    setSubmitting(true)
    setError(null)

    try {
      await createTransaction({
        storeId: DEFAULT_STORE_ID,
        taxRate: taxRate || undefined,
        customerId: customer?.id,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        payments: payments.map((payment) => ({
          paymentMethod: payment.method,
          amount: payment.amount,
        })),
      })
      closeTicket(activeTicketId)
      onCompleted?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed')
    } finally {
      setSubmitting(false)
    }
  }

  function handleClose() {
    if (submitting) return
    clearPayments()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-modal-title"
    >
      <div className="flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 id="checkout-modal-title" className="text-xl font-semibold text-slate-900">
            Take payment
          </h2>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-lg bg-slate-50 px-3 py-2">
              <dt className="text-slate-500">Grand total</dt>
              <dd className="text-lg font-semibold tabular-nums text-slate-900" data-testid="checkout-grand-total">
                {formatMoney(grandTotal)}
              </dd>
            </div>
            <div className="rounded-lg bg-amber-50 px-3 py-2">
              <dt className="text-amber-800">Remaining</dt>
              <dd
                className="text-lg font-semibold tabular-nums text-amber-900"
                data-testid="checkout-balance-due"
              >
                {formatMoney(balanceDue)}
              </dd>
            </div>
          </dl>
          <p className="mt-2 text-sm text-slate-600">
            Tendered{' '}
            <span className="font-medium tabular-nums text-slate-900" data-testid="checkout-tendered">
              {formatMoney(totalTendered)}
            </span>
            {changeDue > 0 ? (
              <>
                {' '}
                · Change{' '}
                <span className="font-medium tabular-nums text-emerald-800" data-testid="checkout-change">
                  {formatMoney(changeDue)}
                </span>
              </>
            ) : null}
          </p>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {customer ? (
            <div
              className="flex items-start justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2"
              data-testid="assigned-customer"
            >
              <div>
                <p className="font-medium text-emerald-950">{customer.name}</p>
                <p className="text-xs text-emerald-800">
                  Available credit {formatMoney(selectAvailableCredit(customer))}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCustomer(null)}
                className="text-xs font-medium text-emerald-900 underline"
              >
                Clear
              </button>
            </div>
          ) : null}

          {requireCustomer || (!customer && payments.some((p) => p.method === 'CREDIT')) ? (
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-3">
              <p className="mb-2 text-sm font-medium text-amber-950">
                Assign a customer before charging store credit.
              </p>
              <CustomerSearch autoFocus onSelect={handleCustomerAssigned} />
            </div>
          ) : null}

          <PaymentTenderList payments={payments} onRemove={removePayment} />
          <TenderInputArea
            remainingBalance={balanceDue}
            onAdd={handleAddTender}
            onRequestCredit={() => {
              requestCreditGate()
            }}
            disabled={submitting}
          />

          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex gap-3 border-t border-slate-200 px-5 py-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="flex-1 rounded-xl border border-slate-300 px-4 py-3 font-medium text-slate-700 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canComplete || submitting}
            onClick={() => void handleComplete()}
            data-testid="complete-transaction"
            className="flex-[2] rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300 active:bg-emerald-800"
          >
            {submitting ? 'Saving…' : 'Complete Transaction'}
          </button>
        </div>
      </div>
    </div>
  )
}
