import { useState } from 'react'
import { CheckoutModal } from '@/components/checkout/CheckoutModal'
import { StripePaymentModal } from '@/components/checkout/StripePaymentModal'
import { fractionToDisplayPercent, parseDisplayPercentToFraction } from '@/lib/discountPricing'
import { formatMoney } from '@/lib/money'
import {
  selectActiveCustomer,
  selectActiveGlobalDiscountPercentage,
  selectActiveItems,
  selectGrandTotal,
  selectSubtotal,
  selectTaxTotal,
  selectTotalDiscountAmount,
  useCartStore,
} from '@/store/useCartStore'

type CheckoutFooterProps = {
  /**
   * Prepares (or looks up) an IN_PROGRESS transaction and returns its id
   * so the Stripe QR modal can create a Checkout Session.
   */
  onRequestCardPayment?: () => Promise<string>
}

export function CheckoutFooter({ onRequestCardPayment }: CheckoutFooterProps = {}) {
  const items = useCartStore(selectActiveItems)
  const taxRate = useCartStore((s) => s.taxRate)
  const globalDiscount = useCartStore(selectActiveGlobalDiscountPercentage)
  const customer = useCartStore(selectActiveCustomer)
  const clearCart = useCartStore((s) => s.clearCart)
  const setGlobalDiscountPercentage = useCartStore((s) => s.setGlobalDiscountPercentage)

  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [cardModalOpen, setCardModalOpen] = useState(false)
  const [activeCardTxId, setActiveCardTxId] = useState<string | null>(null)
  const [cardError, setCardError] = useState<string | null>(null)
  const [cardStarting, setCardStarting] = useState(false)
  const [globalDraft, setGlobalDraft] = useState<string | null>(null)

  const subtotal = selectSubtotal(items, globalDiscount)
  const taxTotal = selectTaxTotal(items, taxRate, globalDiscount)
  const grandTotal = selectGrandTotal(items, taxRate, globalDiscount)
  const discountSaved = selectTotalDiscountAmount(items, globalDiscount)

  const displayGlobalPct =
    globalDraft ?? fractionToDisplayPercent(globalDiscount)

  function commitGlobalDiscount() {
    if (globalDraft === null) return
    setGlobalDiscountPercentage(parseDisplayPercentToFraction(globalDraft))
    setGlobalDraft(null)
  }

  async function handleCardPayment() {
    setCardError(null)
    if (!onRequestCardPayment) {
      setCardError('Card payment is not configured for this register.')
      return
    }

    setCardStarting(true)
    try {
      const transactionId = await onRequestCardPayment()
      setActiveCardTxId(transactionId)
      setCardModalOpen(true)
    } catch (err) {
      setCardError(err instanceof Error ? err.message : 'Unable to start card payment')
    } finally {
      setCardStarting(false)
    }
  }

  return (
    <>
      <footer className="shrink-0 border-t border-slate-200 bg-white px-4 py-4 shadow-[0_-4px_12px_rgba(15,23,42,0.06)]">
        <div className="mb-3">
          <label
            htmlFor="global-discount"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Global Discount %
          </label>
          <input
            id="global-discount"
            type="text"
            inputMode="decimal"
            value={displayGlobalPct}
            onChange={(e) => setGlobalDraft(e.target.value)}
            onBlur={commitGlobalDiscount}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                commitGlobalDiscount()
                ;(e.target as HTMLInputElement).blur()
              }
            }}
            placeholder="0"
            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm tabular-nums text-slate-900 outline-none ring-emerald-600 focus:border-emerald-600 focus:bg-white focus:ring-2"
          />
        </div>

        <dl className="mb-4 space-y-1 text-sm text-slate-600">
          {discountSaved > 0 ? (
            <div className="flex justify-between text-emerald-800">
              <dt>Discount saved</dt>
              <dd className="tabular-nums font-medium" data-testid="discount-saved">
                −{formatMoney(discountSaved)}
              </dd>
            </div>
          ) : null}
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd className="tabular-nums text-slate-900">{formatMoney(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Tax</dt>
            <dd className="tabular-nums text-slate-900">{formatMoney(taxTotal)}</dd>
          </div>
          <div className="flex justify-between text-base font-semibold text-slate-900">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatMoney(grandTotal)}</dd>
          </div>
        </dl>

        {customer ? (
          <p className="mb-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900" data-testid="footer-customer">
            Customer: <span className="font-semibold">{customer.name}</span>
          </p>
        ) : null}

        {cardError ? (
          <p className="mb-3 text-sm text-red-600" role="alert">
            {cardError}
          </p>
        ) : null}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => clearCart()}
            className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 font-medium text-slate-700 active:bg-slate-100"
          >
            Clear
          </button>
          <button
            type="button"
            disabled={items.length === 0 || cardStarting}
            onClick={() => void handleCardPayment()}
            className="flex-1 rounded-lg border border-emerald-700 bg-white px-4 py-3 font-semibold text-emerald-800 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400 active:bg-emerald-50"
          >
            {cardStarting ? 'Starting…' : 'Card'}
          </button>
          <button
            type="button"
            disabled={items.length === 0}
            onClick={() => setCheckoutOpen(true)}
            data-testid="open-checkout"
            className="flex-[2] rounded-lg bg-emerald-700 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300 active:bg-emerald-800"
          >
            Pay
          </button>
        </div>
      </footer>

      <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />

      <StripePaymentModal
        open={cardModalOpen}
        transactionId={activeCardTxId}
        onClose={() => {
          setCardModalOpen(false)
          setActiveCardTxId(null)
        }}
      />
    </>
  )
}
