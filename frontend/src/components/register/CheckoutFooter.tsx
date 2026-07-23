import { useState } from 'react'
import { CheckoutModal } from '@/components/checkout/CheckoutModal'
import { fractionToDisplayPercent, parseDisplayPercentToFraction } from '@/lib/discountPricing'
import { formatMoney } from '@/lib/money'
import { requestRegisterSearchFocus } from '@/lib/registerSearchFocus'
import { useT } from '@/i18n/useT'
import {
  selectActiveCustomer,
  selectActiveGlobalDiscountPercentage,
  selectActiveItems,
  selectGrandTotal,
  selectTotalDiscountAmount,
  useCartStore,
} from '@/store/useCartStore'

/**
 * Pay opens the checkout modal. Global discount is a button between Clear and Pay (Feature 040).
 */
export function CheckoutFooter() {
  const t = useT()
  const items = useCartStore(selectActiveItems)
  const taxRate = useCartStore((s) => s.taxRate)
  const globalDiscount = useCartStore(selectActiveGlobalDiscountPercentage)
  const customer = useCartStore(selectActiveCustomer)
  const clearCart = useCartStore((s) => s.clearCart)
  const setGlobalDiscountPercentage = useCartStore((s) => s.setGlobalDiscountPercentage)

  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [discountOpen, setDiscountOpen] = useState(false)
  const [globalDraft, setGlobalDraft] = useState(() => fractionToDisplayPercent(globalDiscount))

  const grandTotal = selectGrandTotal(items, taxRate, globalDiscount)
  const discountSaved = selectTotalDiscountAmount(items, globalDiscount)
  const activePctLabel = fractionToDisplayPercent(globalDiscount)

  function openDiscount() {
    setGlobalDraft(fractionToDisplayPercent(globalDiscount))
    setDiscountOpen(true)
  }

  function closeDiscount() {
    setDiscountOpen(false)
    requestRegisterSearchFocus()
  }

  function applyDiscount() {
    setGlobalDiscountPercentage(parseDisplayPercentToFraction(globalDraft))
    closeDiscount()
  }

  return (
    <>
      <footer className="shrink-0 border-t border-slate-200 bg-white px-4 py-4 shadow-[0_-4px_12px_rgba(15,23,42,0.06)]">
        <dl className="mb-4 space-y-1 text-sm text-slate-600">
          {discountSaved > 0 ? (
            <div className="flex justify-between text-emerald-800">
              <dt>{t('footer.discountSaved')}</dt>
              <dd className="tabular-nums font-medium" data-testid="discount-saved">
                −{formatMoney(discountSaved)}
              </dd>
            </div>
          ) : null}
          <div className="flex justify-between text-base font-semibold text-slate-900">
            <dt>{t('footer.total')}</dt>
            <dd className="tabular-nums" data-testid="footer-total">
              {formatMoney(grandTotal)}
            </dd>
          </div>
        </dl>

        {customer ? (
          <p className="mb-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900" data-testid="footer-customer">
            {t('footer.customer')}: <span className="font-semibold">{customer.name}</span>
          </p>
        ) : null}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => clearCart()}
            className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 font-medium text-slate-700 active:bg-slate-100"
          >
            {t('footer.clear')}
          </button>
          <button
            type="button"
            data-testid="open-global-discount"
            onClick={openDiscount}
            className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 font-medium text-slate-700 active:bg-slate-100"
          >
            {globalDiscount > 0 ? `${t('footer.discount')} ${activePctLabel}%` : t('footer.discount')}
          </button>
          <button
            type="button"
            disabled={items.length === 0}
            onClick={() => setCheckoutOpen(true)}
            data-testid="open-checkout"
            className="flex-[2] rounded-lg bg-emerald-700 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300 active:bg-emerald-800"
          >
            {t('footer.pay')}
          </button>
        </div>
      </footer>

      {discountOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="global-discount-title"
          data-testid="global-discount-modal"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl" data-register-editable>
            <h2 id="global-discount-title" className="text-lg font-semibold text-slate-900">
              {t('footer.discount')}
            </h2>
            <label htmlFor="global-discount" className="mt-4 mb-1 block text-sm font-medium text-slate-700">
              {t('footer.globalDiscountLabel')}
            </label>
            <input
              id="global-discount"
              type="text"
              inputMode="decimal"
              autoFocus
              value={globalDraft}
              onChange={(e) => setGlobalDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') applyDiscount()
                if (e.key === 'Escape') closeDiscount()
              }}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm tabular-nums text-slate-900 outline-none ring-emerald-600 focus:border-emerald-600 focus:bg-white focus:ring-2"
            />
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={closeDiscount}
                className="flex-1 rounded-xl border border-slate-300 px-4 py-3 font-medium text-slate-700"
              >
                {t('footer.cancel')}
              </button>
              <button
                type="button"
                data-testid="apply-global-discount"
                onClick={applyDiscount}
                className="flex-[2] rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white"
              >
                {t('footer.applyDiscount')}
              </button>
            </div>
          </div>
        </div>
      ) : null}

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
