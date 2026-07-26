import { useEffect, useState } from 'react'
import { createTransaction } from '@/api/transactions'
import { CustomerSearch } from '@/components/checkout/CustomerSearch'
import { SaleTicket, type SaleTicketPayload } from '@/components/checkout/SaleTicket'
import { TenderAmountFields } from '@/components/checkout/TenderAmountFields'
import { formatMoney } from '@/lib/money'
import { useT } from '@/i18n/useT'
import { selectStoreId, useAuthStore } from '@/store/useAuthStore'
import {
  selectActiveCustomer,
  selectActiveGlobalDiscountPercentage,
  selectActiveItems,
  selectActivePayments,
  selectAvailableCredit,
  selectBalanceDue,
  selectCanCompleteSale,
  selectGrandTotal,
  selectItemPricedLine,
  selectPayableGrandTotal,
  selectTotalTendered,
  paymentsForApi,
  useCartStore,
  type AssignedCustomer,
} from '@/store/useCartStore'

type CheckoutModalProps = {
  open: boolean
  onClose: () => void
  onCompleted?: () => void
}

export function CheckoutModal({ open, onClose, onCompleted }: CheckoutModalProps) {
  const t = useT()
  const items = useCartStore(selectActiveItems)
  const taxRate = useCartStore((s) => s.taxRate)
  const globalDiscount = useCartStore(selectActiveGlobalDiscountPercentage)
  const payments = useCartStore(selectActivePayments)
  const customer = useCartStore(selectActiveCustomer)
  const activeTicketId = useCartStore((s) => s.activeTicketId)
  const upsertPayment = useCartStore((s) => s.upsertPayment)
  const clearPayments = useCartStore((s) => s.clearPayments)
  const setCustomer = useCartStore((s) => s.setCustomer)
  const closeTicket = useCartStore((s) => s.closeTicket)
  const storeId = useAuthStore(selectStoreId)

  const [requireCustomer, setRequireCustomer] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saleReceipt, setSaleReceipt] = useState<SaleTicketPayload | null>(null)

  const grandTotal = selectPayableGrandTotal(items, taxRate, globalDiscount)
  const internalGrandTotal = selectGrandTotal(items, taxRate, globalDiscount)
  const totalTendered = selectTotalTendered(payments)
  const balanceDue = selectBalanceDue(items, taxRate, payments, globalDiscount)
  const canComplete = selectCanCompleteSale(items, taxRate, payments, customer, globalDiscount)
  const hasCreditTender = payments.some((payment) => payment.method === 'CREDIT')

  useEffect(() => {
    if (!open) {
      setRequireCustomer(false)
      setSubmitting(false)
      setError(null)
      setSaleReceipt(null)
    }
  }, [open])

  if (!open && !saleReceipt) return null

  function abandonCreditPath() {
    setRequireCustomer(false)
    setError(null)
  }

  function handleUpsert(method: Parameters<typeof upsertPayment>[0], amount: number): boolean {
    setError(null)
    return upsertPayment(method, amount)
  }

  function handleCreditBlur(amount: number) {
    if (amount > 0 && !customer) {
      setRequireCustomer(true)
    }
  }

  function handleClearCustomer() {
    setCustomer(null)
    if (hasCreditTender) {
      setRequireCustomer(true)
    }
  }

  function handleCustomerAssigned(next: AssignedCustomer) {
    setCustomer(next)
    setRequireCustomer(false)
  }

  function buildReceiptSnapshot(): SaleTicketPayload {
    return {
      grandTotal,
      customerName: customer?.name ?? null,
      items: items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        lineTotal: selectItemPricedLine(item, globalDiscount).lineTotal,
      })),
      payments: payments.map((payment) => ({
        method: payment.method,
        amount: payment.amount,
      })),
    }
  }

  async function completeSale(options: { print: boolean }) {
    if (!canComplete || submitting) return
    setSubmitting(true)
    setError(null)

    const receipt = buildReceiptSnapshot()
    const apiPayments = paymentsForApi(payments, internalGrandTotal)

    try {
      await createTransaction({
        storeId,
        taxRate: taxRate || undefined,
        customerId: customer?.id,
        globalDiscountPercentage: globalDiscount > 0 ? globalDiscount : undefined,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          itemDiscountPercentage:
            (item.itemDiscountPercentage ?? 0) > 0 ? item.itemDiscountPercentage : undefined,
        })),
        payments: apiPayments.map((payment) => ({
          paymentMethod: payment.method,
          amount: payment.amount,
        })),
      })
      closeTicket(activeTicketId)
      onCompleted?.()
      if (options.print) {
        setSaleReceipt(receipt)
        onClose()
        requestAnimationFrame(() => window.print())
      } else {
        onClose()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('checkout.failed'))
    } finally {
      setSubmitting(false)
    }
  }

  function handleClose() {
    if (submitting) return
    clearPayments()
    abandonCreditPath()
    onClose()
  }

  if (saleReceipt) {
    return (
      <SaleTicket
        sale={saleReceipt}
        onDone={() => {
          setSaleReceipt(null)
        }}
      />
    )
  }

  if (!open) return null

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
            {t('checkout.title')}
          </h2>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-slate-50 px-3 py-3">
              <dt className="text-slate-500">{t('checkout.grandTotal')}</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums text-slate-900" data-testid="checkout-grand-total">
                {formatMoney(grandTotal)}
              </dd>
            </div>
            <div className="rounded-xl bg-amber-50 px-3 py-3 ring-1 ring-amber-200">
              <dt className="font-medium text-amber-800">{t('checkout.remaining')}</dt>
              <dd
                className="mt-1 text-2xl font-semibold tabular-nums text-amber-950"
                data-testid="checkout-balance-due"
              >
                {formatMoney(balanceDue)}
              </dd>
            </div>
          </dl>
          <p className="mt-2 text-sm text-slate-600">
            {t('checkout.tendered')}{' '}
            <span className="font-medium tabular-nums text-slate-900" data-testid="checkout-tendered">
              {formatMoney(totalTendered)}
            </span>
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
                  {t('customer.availableCredit')} {formatMoney(selectAvailableCredit(customer))}
                </p>
              </div>
              <button
                type="button"
                onClick={handleClearCustomer}
                className="text-xs font-medium text-emerald-900 underline"
              >
                {t('footer.clear')}
              </button>
            </div>
          ) : null}

          {requireCustomer ? (
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-3" data-testid="credit-customer-gate">
              <p className="mb-2 text-sm font-medium text-amber-950">{t('checkout.creditGate')}</p>
              <CustomerSearch autoFocus onSelect={handleCustomerAssigned} />
              <button
                type="button"
                data-testid="abandon-credit-path"
                onClick={abandonCreditPath}
                className="mt-2 text-sm font-medium text-amber-950 underline"
              >
                {t('checkout.abandonCredit')}
              </button>
            </div>
          ) : null}

          <TenderAmountFields
            payments={payments}
            onUpsert={handleUpsert}
            onCreditBlur={handleCreditBlur}
            disabled={submitting}
          />

          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2 border-t border-slate-200 px-5 py-4 sm:flex-row">
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="rounded-xl border border-slate-300 px-4 py-3 font-medium text-slate-700 disabled:opacity-50 sm:flex-1"
          >
            {t('checkout.cancel')}
          </button>
          <button
            type="button"
            disabled={!canComplete || submitting}
            onClick={() => void completeSale({ print: true })}
            data-testid="print-and-pay"
            className="rounded-xl border border-emerald-700 px-4 py-3 text-sm font-semibold text-emerald-900 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400 sm:flex-1"
          >
            {t('checkout.printAndPay')}
          </button>
          <button
            type="button"
            disabled={!canComplete || submitting}
            onClick={() => void completeSale({ print: false })}
            data-testid="complete-transaction"
            className="rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300 active:bg-emerald-800 sm:flex-[2]"
          >
            {submitting ? t('common.loading') : t('checkout.pay')}
          </button>
        </div>
      </div>
    </div>
  )
}
