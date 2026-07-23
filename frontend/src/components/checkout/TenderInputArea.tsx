import { useEffect, useState } from 'react'
import { formatMoney, roundMoney } from '@/lib/money'
import type { PaymentMethod } from '@/store/useCartStore'

type TenderInputAreaProps = {
  remainingBalance: number
  onAdd: (method: PaymentMethod, amount: number) => void
  onRequestCredit: () => void
  disabled?: boolean
}

const METHODS: PaymentMethod[] = ['CASH', 'CARD', 'CREDIT']

export function TenderInputArea({
  remainingBalance,
  onAdd,
  onRequestCredit,
  disabled = false,
}: TenderInputAreaProps) {
  const [method, setMethod] = useState<PaymentMethod>('CASH')
  const [draft, setDraft] = useState(() => formatMoney(Math.max(0, remainingBalance)))
  const [localError, setLocalError] = useState<string | null>(null)

  useEffect(() => {
    setDraft(formatMoney(Math.max(0, remainingBalance)))
    setLocalError(null)
  }, [remainingBalance])

  function handleMethodChange(next: PaymentMethod) {
    setMethod(next)
    setLocalError(null)
    if (next === 'CREDIT') {
      onRequestCredit()
    }
  }

  function handleAdd() {
    const parsed = Number.parseFloat(draft)
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setLocalError('Enter an amount greater than zero')
      return
    }
    const amount = roundMoney(parsed)
    const max = roundMoney(Math.max(0, remainingBalance))
    if (amount > max) {
      setLocalError('Amount cannot exceed remaining balance')
      return
    }
    setLocalError(null)
    onAdd(method, amount)
  }

  return (
    <div className="space-y-3" data-testid="tender-input">
      <div className="flex gap-2">
        {METHODS.map((option) => (
          <button
            key={option}
            type="button"
            disabled={disabled}
            onClick={() => handleMethodChange(option)}
            className={`flex-1 rounded-lg border px-2 py-2 text-sm font-semibold ${
              method === option
                ? 'border-emerald-700 bg-emerald-50 text-emerald-900'
                : 'border-slate-300 bg-white text-slate-700'
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {option}
          </button>
        ))}
      </div>

      <div>
        <label htmlFor="tender-amount" className="mb-1 block text-sm font-medium text-slate-700">
          Tender amount
        </label>
        <input
          id="tender-amount"
          type="text"
          inputMode="decimal"
          disabled={disabled}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value)
            setLocalError(null)
          }}
          onFocus={() => setDraft(formatMoney(Math.max(0, remainingBalance)))}
          className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-lg tabular-nums text-slate-900 outline-none ring-emerald-600 focus:border-emerald-600 focus:bg-white focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
        {localError ? (
          <p className="mt-1 text-sm text-red-600" role="alert" data-testid="tender-amount-error">
            {localError}
          </p>
        ) : null}
      </div>

      <button
        type="button"
        disabled={disabled || remainingBalance <= 0}
        onClick={handleAdd}
        className="w-full rounded-lg bg-slate-900 px-4 py-2.5 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300 active:bg-slate-800"
      >
        Add tender
      </button>
    </div>
  )
}
