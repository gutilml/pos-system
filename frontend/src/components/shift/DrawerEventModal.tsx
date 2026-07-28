import { useEffect, useState, type FormEvent } from 'react'
import type { CashDrawerEventType } from '@/api/shifts'
import { useT } from '@/i18n/useT'
import { useShiftStore } from '@/store/useShiftStore'

type DrawerEventModalProps = {
  open: boolean
  onClose: () => void
  /** Preselect type when opened from a specific menu item. */
  initialType?: CashDrawerEventType
}

export function DrawerEventModal({
  open,
  onClose,
  initialType = 'PAY_IN',
}: DrawerEventModalProps) {
  const t = useT()
  const addDrawerEvent = useShiftStore((s) => s.addDrawerEvent)
  const isLoading = useShiftStore((s) => s.isLoading)
  const error = useShiftStore((s) => s.error)
  const clearError = useShiftStore((s) => s.clearError)

  const [type, setType] = useState<CashDrawerEventType>(initialType)
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [approvalPassword, setApprovalPassword] = useState('')
  const [requiresApproval, setRequiresApproval] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setType(initialType)
    setAmount('')
    setReason('')
    setApprovalPassword('')
    setRequiresApproval(false)
    setLocalError(null)
    clearError()
  }, [open, initialType, clearError])

  if (!open) {
    return null
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    clearError()
    setLocalError(null)

    const parsed = Number.parseFloat(amount)
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setLocalError(t('drawer.amountInvalid'))
      return
    }

    const trimmedReason = reason.trim()
    if (!trimmedReason) {
      setLocalError(t('drawer.reasonRequired'))
      return
    }
    if (requiresApproval && approvalPassword.trim().length === 0) {
      setLocalError(t('drawer.approvalPasswordRequired'))
      return
    }

    const body = {
      type,
      amount: parsed,
      reason: trimmedReason,
      ...(requiresApproval ? { approvalPassword } : {}),
    }

    try {
      await addDrawerEvent(body)
      setAmount('')
      setReason('')
      setApprovalPassword('')
      setRequiresApproval(false)
      onClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : ''
      if (message.toLowerCase().includes('approval password required')) {
        setRequiresApproval(true)
        setLocalError(t('drawer.approvalRequired'))
      }
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-event-title"
      data-testid="drawer-event-modal"
    >
      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 id="drawer-event-title" className="text-xl font-semibold text-slate-900">
          {t('drawer.title')}
        </h2>
        <p className="mt-2 text-sm text-slate-600">{t('drawer.hint')}</p>

        <fieldset className="mt-5">
          <legend className="mb-2 text-sm font-medium text-slate-700">{t('drawer.type')}</legend>
          <div className="flex gap-2">
            <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 has-[:checked]:border-emerald-600 has-[:checked]:bg-emerald-50">
              <input
                type="radio"
                name="drawer-event-type"
                value="PAY_IN"
                checked={type === 'PAY_IN'}
                onChange={() => setType('PAY_IN')}
                data-testid="drawer-type-pay-in"
              />
              {t('cashier.payIn')}
            </label>
            <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 has-[:checked]:border-emerald-600 has-[:checked]:bg-emerald-50">
              <input
                type="radio"
                name="drawer-event-type"
                value="PAY_OUT"
                checked={type === 'PAY_OUT'}
                onChange={() => setType('PAY_OUT')}
                data-testid="drawer-type-pay-out"
              />
              {t('cashier.payOut')}
            </label>
          </div>
        </fieldset>

        <label htmlFor="drawer-amount" className="mt-4 mb-1 block text-sm font-medium text-slate-700">
          {t('drawer.amount')}
        </label>
        <input
          id="drawer-amount"
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-xl tabular-nums text-slate-900 outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600"
          autoFocus
          data-testid="drawer-amount"
        />

        {requiresApproval ? (
          <>
            <label
              htmlFor="drawer-approval-password"
              className="mt-4 mb-1 block text-sm font-medium text-slate-700"
            >
              {t('drawer.approvalPassword')}
            </label>
            <input
              id="drawer-approval-password"
              type="password"
              value={approvalPassword}
              onChange={(e) => setApprovalPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600"
              data-testid="drawer-approval-password"
            />
          </>
        ) : null}

        <label htmlFor="drawer-reason" className="mt-4 mb-1 block text-sm font-medium text-slate-700">
          {t('drawer.reason')}
        </label>
        <input
          id="drawer-reason"
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={255}
          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600"
          data-testid="drawer-reason"
        />

        {(localError || error) && (
          <p className="mt-2 text-sm text-red-600" role="alert" data-testid="drawer-event-error">
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
            data-testid="drawer-event-submit"
            className="flex-[2] rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300 active:bg-emerald-800"
          >
            {isLoading ? t('drawer.saving') : t('drawer.save')}
          </button>
        </div>
      </form>
    </div>
  )
}
