import { formatMoney } from '@/lib/money'
import { useT } from '@/i18n/useT'
import type { PaymentTender } from '@/store/useCartStore'

type PaymentTenderListProps = {
  payments: PaymentTender[]
  onRemove: (paymentId: string) => void
}

export function PaymentTenderList({ payments, onRemove }: PaymentTenderListProps) {
  const t = useT()
  if (payments.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-300 px-3 py-4 text-center text-sm text-slate-500">
        {t('checkout.noTenders')}
      </p>
    )
  }

  return (
    <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200" data-testid="tender-list">
      {payments.map((payment) => (
        <li key={payment.id} className="flex items-center justify-between gap-3 px-3 py-2">
          <div>
            <p className="text-sm font-semibold text-slate-900">{payment.method}</p>
            <p className="tabular-nums text-sm text-slate-600">{formatMoney(payment.amount)}</p>
          </div>
          <button
            type="button"
            onClick={() => onRemove(payment.id)}
            className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
            aria-label={`Remove ${payment.method} tender`}
          >
            Remove
          </button>
        </li>
      ))}
    </ul>
  )
}
