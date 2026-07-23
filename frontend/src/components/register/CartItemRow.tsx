import { useState } from 'react'
import { fractionToDisplayPercent, parseDisplayPercentToFraction } from '@/lib/discountPricing'
import { formatMoney, roundMoney } from '@/lib/money'
import { requestRegisterSearchFocus } from '@/lib/registerSearchFocus'
import { useT } from '@/i18n/useT'
import {
  selectActiveGlobalDiscountPercentage,
  selectItemPricedLine,
  useCartStore,
} from '@/store/useCartStore'
import type { CartItem } from '@/types/cart'

/** Shared cart columns (Features 038 / 043). Fixed tracks so header and rows stay aligned. */
export const CART_ROW_GRID =
  'grid grid-cols-[minmax(0,1fr)_9.5rem_5.5rem_6.5rem_4.5rem] items-center gap-x-3'

export const CART_ROW_GRID_WITH_STOCK =
  'grid grid-cols-[minmax(0,1fr)_9.5rem_4.5rem_5.5rem_6.5rem_4.5rem] items-center gap-x-3'

export function formatCartStockDisplay(item: CartItem): string {
  if (item.trackInventory !== true) return '—'
  return String(roundMoney((item.currentStock ?? 0) - item.quantity))
}

type CartItemRowProps = {
  item: CartItem
  /** When true, reserve/render Stock cell — Feature 043. */
  showStock?: boolean
  stockDisplay?: string
}

export function CartItemRow({ item, showStock = false, stockDisplay }: CartItemRowProps) {
  const t = useT()
  const globalDiscount = useCartStore(selectActiveGlobalDiscountPercentage)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const setItemDiscountPercentage = useCartStore((s) => s.setItemDiscountPercentage)

  const priced = selectItemPricedLine(item, globalDiscount)
  const hasDiscount = priced.lineDiscountAmount > 0
  const originalLineTotal = formatMoney(priced.originalUnitPrice * item.quantity)
  const resolvedStock = stockDisplay ?? formatCartStockDisplay(item)

  const [draftPct, setDraftPct] = useState<string | null>(null)
  const displayPct =
    draftPct ?? fractionToDisplayPercent(item.itemDiscountPercentage ?? 0)

  function commitItemDiscount() {
    if (draftPct === null) return
    setItemDiscountPercentage(item.productId, parseDisplayPercentToFraction(draftPct))
    setDraftPct(null)
  }

  const gridClass = showStock ? CART_ROW_GRID_WITH_STOCK : CART_ROW_GRID

  return (
    <li
      className={`${gridClass} border-b border-slate-100 px-4 py-3`}
      data-register-editable
      data-testid={`cart-row-${item.productId}`}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-medium text-slate-900" data-testid={`cart-product-name-${item.productId}`}>
            {item.name}
          </p>
          {item.excludeFromGlobalDiscounts ? (
            <span
              className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900"
              data-testid={`no-global-badge-${item.productId}`}
            >
              {t('cart.noGlobal')}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-2 justify-self-center">
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

      {showStock ? (
        <p
          className="justify-self-end text-sm tabular-nums text-slate-700"
          data-testid={`cart-stock-${item.productId}`}
        >
          {resolvedStock}
        </p>
      ) : null}

      <div className="justify-self-stretch">
        <label className="sr-only" htmlFor={`item-discount-${item.productId}`}>
          Item discount percent for {item.name}
        </label>
        <input
          id={`item-discount-${item.productId}`}
          type="text"
          inputMode="decimal"
          aria-label={`Item discount percent for ${item.name}`}
          value={displayPct}
          onChange={(e) => setDraftPct(e.target.value)}
          onBlur={() => {
            commitItemDiscount()
            requestRegisterSearchFocus()
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              commitItemDiscount()
              ;(e.target as HTMLInputElement).blur()
            }
          }}
          placeholder="%"
          className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm tabular-nums text-slate-900"
          data-testid={`item-discount-${item.productId}`}
        />
      </div>

      <div className="justify-self-end text-right">
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
        {t('cart.remove')}
      </button>
    </li>
  )
}

type CartListHeaderProps = {
  showStock?: boolean
}

export function CartListHeader({ showStock = false }: CartListHeaderProps) {
  const t = useT()
  const gridClass = showStock ? CART_ROW_GRID_WITH_STOCK : CART_ROW_GRID

  return (
    <div
      className={`${gridClass} border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500`}
      data-testid="cart-list-header"
      role="row"
    >
      <span>{t('cart.product')}</span>
      <span className="justify-self-center text-center">{t('cart.qty')}</span>
      {showStock ? <span className="justify-self-end text-right">{t('cart.stock')}</span> : null}
      <span className="text-left">{t('cart.discount')}</span>
      <span className="justify-self-end text-right">{t('cart.subtotal')}</span>
      <span className="sr-only">Actions</span>
    </div>
  )
}
