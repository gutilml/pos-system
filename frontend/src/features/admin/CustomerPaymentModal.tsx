import { useEffect, useState, type FormEvent } from 'react'
import { useT } from '@/i18n/useT'
import { roundMoney } from '@/lib/money'

export type CustomerPaymentMethod = 'CASH' | 'CARD'

type CustomerPaymentModalProps = {
  open: boolean
  customerName: string
  balance: number
  submitting: boolean
  onClose: () => void
  onSubmit: (amount: number, method: CustomerPaymentMethod) => Promise<void>
}

export function CustomerPaymentModal({
  open,
  customerName,
  balance,
  submitting,
  onClose,
  onSubmit,
}: CustomerPaymentModalProps) {
  const t = useT()
  const [method, setMethod] = useState<CustomerPaymentMethod>('CASH')
  const [amount, setAmount] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setMethod('CASH')
    setAmount('')
    setLocalError(null)
  }, [open])

  if (!open) {
    return null
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setLocalError(null)
    const parsed = roundMoney(Number(amount))
    if (!(parsed > 0)) {
      setLocalError(t('customers.payAmountInvalid'))
      return
    }
    if (parsed > roundMoney(balance) + 0.00005) {
      setLocalError(t('customers.payExceedsBalance'))
      return
    }
    try {
      await onSubmit(parsed, method)
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : t('customers.payFailed'))
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="customer-pay-title"
      data-testid="customer-payment-modal"
    >
      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 id="customer-pay-title" className="text-xl font-semibold text-slate-900">
          {t('customers.payModalTitle')}
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          {customerName} · {t('customers.balance')}: {balance.toFixed(2)}
        </p>

        <fieldset className="mt-5">
          <legend className="mb-2 text-sm font-medium text-slate-700">{t('customers.payMethod')}</legend>
          <div className="flex gap-2">
            <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 has-[:checked]:border-emerald-600 has-[:checked]:bg-emerald-50">
              <input
                type="radio"
                name="customer-pay-method"
                value="CASH"
                checked={method === 'CASH'}
                onChange={() => setMethod('CASH')}
                data-testid="customer-pay-method-cash"
              />
              {t('tender.cash')}
            </label>
            <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 has-[:checked]:border-emerald-600 has-[:checked]:bg-emerald-50">
              <input
                type="radio"
                name="customer-pay-method"
                value="CARD"
                checked={method === 'CARD'}
                onChange={() => setMethod('CARD')}
                data-testid="customer-pay-method-card"
              />
              {t('tender.card')}
            </label>
          </div>
        </fieldset>

        <label className="mt-4 mb-1 block text-sm font-medium text-slate-700" htmlFor="customer-pay-modal-amount">
          {t('customers.payAmount')}
        </label>
        <input
          id="customer-pay-modal-amount"
          data-testid="customer-pay-modal-amount"
          type="number"
          step="0.01"
          min="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
          autoFocus
        />

        {localError ? (
          <p className="mt-2 text-sm text-red-600" role="alert" data-testid="customer-pay-modal-error">
            {localError}
          </p>
        ) : null}

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            data-testid="customer-pay-modal-cancel"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            data-testid="customer-pay-modal-submit"
            disabled={submitting}
            className="flex-1 rounded-xl bg-emerald-700 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {submitting ? t('customers.paying') : t('customers.pay')}
          </button>
        </div>
      </form>
    </div>
  )
}
