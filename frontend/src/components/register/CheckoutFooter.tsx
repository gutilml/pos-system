import { useState } from 'react'
import { CheckoutModal } from '@/components/checkout/CheckoutModal'
import { fractionToDisplayPercent, parseDisplayPercentToFraction } from '@/lib/discountPricing'
import { formatMoney } from '@/lib/money'
import { requestRegisterSearchFocus } from '@/lib/registerSearchFocus'
import {
  selectActiveCustomer,
  selectActiveGlobalDiscountPercentage,
  selectActiveItems,
  selectGrandTotal,
  selectTotalDiscountAmount,
  useCartStore,
} from '@/store/useCartStore'

/**
 * Pay opens the checkout modal (CASH / CARD / CREDIT). Footer Card shortcut removed (Feature 036).
 */
export function CheckoutFooter() {
  const items = useCartStore(selectActiveItems)
  const taxRate = useCartStore((s) => s.taxRate)
  const globalDiscount = useCartStore(selectActiveGlobalDiscountPercentage)
  const customer = useCartStore(selectActiveCustomer)
  const clearCart = useCartStore((s) => s.clearCart)
  const setGlobalDiscountPercentage = useCartStore((s) => s.setGlobalDiscountPercentage)

  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [globalDraft, setGlobalDraft] = useState<string | null>(null)

  const grandTotal = selectGrandTotal(items, taxRate, globalDiscount)
  const discountSaved = selectTotalDiscountAmount(items, globalDiscount)

  const displayGlobalPct =
    globalDraft ?? fractionToDisplayPercent(globalDiscount)

  function commitGlobalDiscount() {
    if (globalDraft === null) return
    setGlobalDiscountPercentage(parseDisplayPercentToFraction(globalDraft))
    setGlobalDraft(null)
  }

  return (
    <>
      <footer className="shrink-0 border-t border-slate-200 bg-white px-4 py-4 shadow-[0_-4px_12px_rgba(15,23,42,0.06)]">
        <div className="mb-3" data-register-editable>
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
            onBlur={() => {
              commitGlobalDiscount()
              requestRegisterSearchFocus()
            }}
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
          <div className="flex justify-between text-base font-semibold text-slate-900">
            <dt>Total</dt>
            <dd className="tabular-nums" data-testid="footer-total">
              {formatMoney(grandTotal)}
            </dd>
          </div>
        </dl>

        {customer ? (
          <p className="mb-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900" data-testid="footer-customer">
            Customer: <span className="font-semibold">{customer.name}</span>
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
            disabled={items.length === 0}
            onClick={() => setCheckoutOpen(true)}
            data-testid="open-checkout"
            className="flex-[2] rounded-lg bg-emerald-700 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300 active:bg-emerald-800"
          >
            Pay
          </button>
        </div>
      </footer>

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => {
          setCheckoutOpen(false)
          requestRegisterSearchFocus()
        }}
      />
    </>
  )
}
