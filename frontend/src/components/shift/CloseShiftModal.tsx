import { useEffect, useState, type FormEvent } from 'react'
import { useT } from '@/i18n/useT'
import { useShiftStore } from '@/store/useShiftStore'

type CloseShiftModalProps = {
  open: boolean
  onClose: () => void
}

export function CloseShiftModal({ open, onClose }: CloseShiftModalProps) {
  const t = useT()
  const closeShift = useShiftStore((s) => s.closeShift)
  const isLoading = useShiftStore((s) => s.isLoading)
  const error = useShiftStore((s) => s.error)
  const clearError = useShiftStore((s) => s.clearError)

  const [amount, setAmount] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      event.preventDefault()
      clearError()
      setLocalError(null)
      onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, clearError, onClose])

  if (!open) {
    return null
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    clearError()
    setLocalError(null)

    const parsed = Number.parseFloat(amount)
    if (!Number.isFinite(parsed) || parsed < 0) {
      setLocalError(t('shift.actualCashInvalid'))
      return
    }

    try {
      await closeShift(parsed)
      setAmount('')
      onClose()
    } catch {
      // error surfaced via store
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="close-shift-title"
      data-testid="close-shift-modal"
    >
      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 id="close-shift-title" className="text-xl font-semibold text-slate-900">
          {t('shift.closeTitle')}
        </h2>
        <p className="mt-2 text-sm text-slate-600">{t('shift.closeHint')}</p>

        <label htmlFor="actual-cash" className="mt-5 mb-1 block text-sm font-medium text-slate-700">
          {t('shift.actualCash')}
        </label>
        <input
          id="actual-cash"
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

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => {
              clearError()
              setLocalError(null)
              onClose()
            }}
            className="flex-1 rounded-xl border border-slate-300 px-4 py-3 font-medium text-slate-700 active:bg-slate-100"
          >
            {t('footer.cancel')}
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-[2] rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300 active:bg-emerald-800"
          >
            {isLoading ? t('shift.closing') : t('cashier.closeShift')}
          </button>
        </div>
      </form>
    </div>
  )
}
