import { useState } from 'react'
import { fractionToDisplayPercent, parseDisplayPercentToFraction } from '@/lib/discountPricing'
import { formatMoney } from '@/lib/money'
import {
  selectActiveGlobalDiscountPercentage,
  selectItemPricedLine,
  useCartStore,
} from '@/store/useCartStore'
import type { CartItem } from '@/types/cart'

type CartItemRowProps = {
  item: CartItem
}

export function CartItemRow({ item }: CartItemRowProps) {
  const globalDiscount = useCartStore(selectActiveGlobalDiscountPercentage)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const setItemDiscountPercentage = useCartStore((s) => s.setItemDiscountPercentage)

  const priced = selectItemPricedLine(item, globalDiscount)
  const hasDiscount = priced.lineDiscountAmount > 0
  const originalLineTotal = formatMoney(priced.originalUnitPrice * item.quantity)

  const [draftPct, setDraftPct] = useState<string | null>(null)
  const displayPct =
    draftPct ?? fractionToDisplayPercent(item.itemDiscountPercentage ?? 0)

  function commitItemDiscount() {
    if (draftPct === null) return
    setItemDiscountPercentage(item.productId, parseDisplayPercentToFraction(draftPct))
    setDraftPct(null)
  }

  return (
    <li className="flex items-start gap-3 border-b border-slate-100 px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-medium text-slate-900">{item.name}</p>
          {item.excludeFromGlobalDiscounts ? (
            <span
              className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900"
              data-testid={`no-global-badge-${item.productId}`}
            >
              No Global %
            </span>
          ) : null}
        </div>
        <p className="text-sm text-slate-500">
          {item.sku} · {formatMoney(item.unitPrice)}
        </p>
        <label className="mt-2 flex items-center gap-1 text-xs text-slate-600">
          <span>Item %</span>
          <input
            type="text"
            inputMode="decimal"
            aria-label={`Item discount percent for ${item.name}`}
            value={displayPct}
            onChange={(e) => setDraftPct(e.target.value)}
            onBlur={commitItemDiscount}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                commitItemDiscount()
                ;(e.target as HTMLInputElement).blur()
              }
            }}
            placeholder="0"
            className="w-14 rounded border border-slate-300 px-1.5 py-0.5 text-sm tabular-nums text-slate-900"
          />
        </label>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          aria-label={`Decrease quantity of ${item.name}`}
          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-xl text-slate-800 active:bg-slate-100"
        >
          −
        </button>
        <span className="w-12 text-center text-lg tabular-nums text-slate-900" aria-live="polite">
          {item.quantity}
        </span>
        <button
          type="button"
          aria-label={`Increase quantity of ${item.name}`}
          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-xl text-slate-800 active:bg-slate-100"
        >
          +
        </button>
      </div>

      <div className="w-28 pt-1 text-right">
        {hasDiscount ? (
          <p
            className="text-sm tabular-nums text-slate-400 line-through"
            data-testid={`original-total-${item.productId}`}
          >
            {originalLineTotal}
          </p>
        ) : null}
        <p
          className="text-lg font-semibold tabular-nums text-slate-900"
          data-testid={`line-total-${item.productId}`}
        >
          {formatMoney(priced.lineTotal)}
        </p>
      </div>

      <button
        type="button"
        aria-label={`Remove ${item.name}`}
        onClick={() => removeItem(item.productId)}
        className="rounded-lg px-2 py-2 text-sm text-slate-500 hover:bg-slate-100 hover:text-red-600"
      >
        Remove
      </button>
    </li>
  )
}
