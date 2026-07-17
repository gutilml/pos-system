import { useEffect, useRef, useState, type FocusEvent, type MouseEvent } from 'react'
import { formatMoney, roundMoney } from '@/lib/money'
import {
  selectActiveAmountReceived,
  selectActiveItems,
  selectChangeDue,
  selectGrandTotal,
  selectSubtotal,
  selectTaxTotal,
  useCartStore,
} from '@/store/useCartStore'

export function CheckoutFooter() {
  const items = useCartStore(selectActiveItems)
  const taxRate = useCartStore((s) => s.taxRate)
  const amountReceived = useCartStore(selectActiveAmountReceived)
  const setAmountReceived = useCartStore((s) => s.setAmountReceived)
  const clearCart = useCartStore((s) => s.clearCart)

  const subtotal = selectSubtotal(items)
  const taxTotal = selectTaxTotal(items, taxRate)
  const grandTotal = selectGrandTotal(items, taxRate)
  const changeDue = selectChangeDue(items, taxRate, amountReceived)

  const inputRef = useRef<HTMLInputElement>(null)
  const [draft, setDraft] = useState<string | null>(null)

  // Sync amount received to cart total when the ticket total changes.
  useEffect(() => {
    setAmountReceived(grandTotal)
    setDraft(null)
  }, [grandTotal, setAmountReceived])

  function handleFocus(event: FocusEvent<HTMLInputElement>) {
    setDraft(formatMoney(amountReceived ?? grandTotal))
    event.currentTarget.select()
  }

  function handleMouseUp(event: MouseEvent<HTMLInputElement>) {
    // Prevent browsers from clearing the select on mouseup after focus.
    event.preventDefault()
  }

  function handleBlur() {
    if (draft !== null) {
      const parsed = Number.parseFloat(draft)
      setAmountReceived(Number.isFinite(parsed) ? roundMoney(parsed) : grandTotal)
    }
    setDraft(null)
  }

  const displayAmount =
    draft ?? formatMoney(amountReceived === null ? grandTotal : amountReceived)

  return (
    <footer className="shrink-0 border-t border-slate-200 bg-white px-4 py-4 shadow-[0_-4px_12px_rgba(15,23,42,0.06)]">
      <dl className="mb-4 space-y-1 text-sm text-slate-600">
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

      <div className="mb-3">
        <label htmlFor="amount-received" className="mb-1 block text-sm font-medium text-slate-700">
          Amount Received
        </label>
        <input
          ref={inputRef}
          id="amount-received"
          type="text"
          inputMode="decimal"
          value={displayAmount}
          onChange={(e) => {
            const next = e.target.value
            setDraft(next)
            const parsed = Number.parseFloat(next)
            if (Number.isFinite(parsed)) {
              setAmountReceived(parsed)
            }
          }}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onMouseUp={handleMouseUp}
          className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-xl tabular-nums text-slate-900 outline-none ring-emerald-600 focus:border-emerald-600 focus:bg-white focus:ring-2"
        />
      </div>

      <div className="mb-4 flex items-center justify-between rounded-lg bg-emerald-50 px-4 py-3">
        <span className="font-medium text-emerald-900">Change Due</span>
        <span
          className="text-2xl font-semibold tabular-nums text-emerald-900"
          data-testid="change-due"
        >
          {formatMoney(Math.max(0, changeDue))}
        </span>
      </div>

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
          className="flex-[2] rounded-lg bg-emerald-700 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300 active:bg-emerald-800"
        >
          Complete Sale
        </button>
      </div>
    </footer>
  )
}
