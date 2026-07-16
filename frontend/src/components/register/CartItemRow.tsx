import { formatMoney } from '@/lib/money'
import {
  selectItemLineTotal,
  useCartStore,
} from '@/store/useCartStore'
import type { CartItem } from '@/types/cart'

type CartItemRowProps = {
  item: CartItem
}

export function CartItemRow({ item }: CartItemRowProps) {
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const total = selectItemLineTotal(item)

  return (
    <li className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-slate-900">{item.name}</p>
        <p className="text-sm text-slate-500">
          {item.sku} · {formatMoney(item.unitPrice)}
        </p>
      </div>

      <div className="flex items-center gap-2">
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

      <p className="w-24 text-right text-lg font-semibold tabular-nums text-slate-900">
        {formatMoney(total)}
      </p>

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
