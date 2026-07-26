import { useEffect, useState } from 'react'
import { formatMoney, roundMoneyDisplay } from '@/lib/money'
import { useT } from '@/i18n/useT'
import type { PaymentMethod, PaymentTender } from '@/store/useCartStore'

type TenderAmountFieldsProps = {
  payments: PaymentTender[]
  onUpsert: (method: PaymentMethod, amount: number) => boolean
  onCreditBlur: (amount: number) => void
  disabled?: boolean
}

const METHODS: PaymentMethod[] = ['CASH', 'CARD', 'CREDIT']

function amountFor(payments: PaymentTender[], method: PaymentMethod): number {
  return payments.find((payment) => payment.method === method)?.amount ?? 0
}

function draftsFromPayments(payments: PaymentTender[]): Record<PaymentMethod, string> {
  return {
    CASH: amountFor(payments, 'CASH') > 0 ? formatMoney(amountFor(payments, 'CASH')) : '',
    CARD: amountFor(payments, 'CARD') > 0 ? formatMoney(amountFor(payments, 'CARD')) : '',
    CREDIT: amountFor(payments, 'CREDIT') > 0 ? formatMoney(amountFor(payments, 'CREDIT')) : '',
  }
}

export function TenderAmountFields({
  payments,
  onUpsert,
  onCreditBlur,
  disabled = false,
}: TenderAmountFieldsProps) {
  const t = useT()
  const [drafts, setDrafts] = useState(() => draftsFromPayments(payments))
  const [fieldError, setFieldError] = useState<PaymentMethod | null>(null)

  const allCleared = METHODS.every((method) => amountFor(payments, method) === 0)

  useEffect(() => {
    if (allCleared) {
      setDrafts({ CASH: '', CARD: '', CREDIT: '' })
      setFieldError(null)
    }
  }, [allCleared])

  function commit(method: PaymentMethod, raw: string): boolean {
    const trimmed = raw.trim()
    if (trimmed === '') {
      setFieldError(null)
      return onUpsert(method, 0)
    }
    const parsed = Number.parseFloat(trimmed)
    if (!Number.isFinite(parsed) || parsed < 0) {
      return false
    }
    const amount = roundMoneyDisplay(parsed)
    const ok = onUpsert(method, amount)
    if (!ok) {
      setFieldError(method)
      return false
    }
    setFieldError(null)
    return true
  }

  function handleChange(method: PaymentMethod, value: string) {
    setDrafts((prev) => ({ ...prev, [method]: value }))
    const trimmed = value.trim()
    if (trimmed === '') {
      commit(method, '')
      return
    }
    const parsed = Number.parseFloat(trimmed)
    if (!Number.isFinite(parsed)) {
      return
    }
    commit(method, value)
  }

  function handleBlur(method: PaymentMethod) {
    const raw = drafts[method]
    const ok = commit(method, raw)
    if (ok) {
      const trimmed = raw.trim()
      if (trimmed === '') {
        setDrafts((prev) => ({ ...prev, [method]: '' }))
      } else {
        const parsed = Number.parseFloat(trimmed)
        if (Number.isFinite(parsed) && parsed > 0) {
          setDrafts((prev) => ({ ...prev, [method]: formatMoney(roundMoneyDisplay(parsed)) }))
        }
      }
    }
    if (method !== 'CREDIT') return
    const trimmed = raw.trim()
    if (trimmed === '') {
      onCreditBlur(0)
      return
    }
    const parsed = Number.parseFloat(trimmed)
    if (!Number.isFinite(parsed)) return
    onCreditBlur(roundMoneyDisplay(parsed))
  }

  return (
    <div className="space-y-3" data-testid="tender-amount-fields">
      {METHODS.map((method) => {
        const inputId = `tender-${method.toLowerCase()}`
        const label =
          method === 'CASH' ? t('tender.cash') : method === 'CARD' ? t('tender.card') : t('tender.credit')
        return (
          <div key={method}>
            <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-slate-700">
              {label}
            </label>
            <input
              id={inputId}
              type="text"
              inputMode="decimal"
              aria-label={method}
              disabled={disabled}
              value={drafts[method]}
              placeholder="0.00"
              onChange={(e) => handleChange(method, e.target.value)}
              onBlur={() => handleBlur(method)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-xl tabular-nums text-slate-900 outline-none ring-emerald-600 focus:border-emerald-600 focus:bg-white focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {fieldError === method ? (
              <p className="mt-1 text-sm text-red-600" role="alert" data-testid="tender-amount-error">
                {t('checkout.overpay')}
              </p>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
