import { useState, type FormEvent } from 'react'
import { useT } from '@/i18n/useT'
import { selectStoreId, useAuthStore } from '@/store/useAuthStore'
import { useShiftStore } from '@/store/useShiftStore'

export function OpenShiftModal() {
  const t = useT()
  const openShift = useShiftStore((s) => s.openShift)
  const isLoading = useShiftStore((s) => s.isLoading)
  const error = useShiftStore((s) => s.error)
  const clearError = useShiftStore((s) => s.clearError)
  const storeId = useAuthStore(selectStoreId)

  const [amount, setAmount] = useState('100.00')
  const [localError, setLocalError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    clearError()
    setLocalError(null)

    const parsed = Number.parseFloat(amount)
    if (!Number.isFinite(parsed) || parsed < 0) {
      setLocalError('Enter a valid starting cash amount')
      return
    }

    try {
      await openShift(parsed, storeId)
    } catch {
      // error surfaced via store
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="open-shift-title"
    >
      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 id="open-shift-title" className="text-xl font-semibold text-slate-900">
          {t('shift.openTitle')}
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Enter the starting cash float before using the register.
        </p>

        <label htmlFor="starting-cash" className="mt-5 mb-1 block text-sm font-medium text-slate-700">
          {t('shift.startingCash')}
        </label>
        <input
          id="starting-cash"
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-xl tabular-nums text-slate-900 outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600"
          autoFocus
        />

        {(localError || error) && (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {localError ?? error}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="mt-5 w-full rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300 active:bg-emerald-800"
        >
          {isLoading ? t('common.loading') : t('shift.openAction')}
        </button>
      </form>
    </div>
  )
}
