import { useEffect, type ReactNode } from 'react'
import { OpenShiftModal } from '@/components/shift/OpenShiftModal'
import { ShiftCloseTicket } from '@/components/shift/ShiftCloseTicket'
import { useT } from '@/i18n/useT'
import { selectStoreId, useAuthStore } from '@/store/useAuthStore'
import { useShiftStore } from '@/store/useShiftStore'

type ShiftGateProps = {
  children: ReactNode
}

export function ShiftGate({ children }: ShiftGateProps) {
  const t = useT()
  const currentShift = useShiftStore((s) => s.currentShift)
  const lastClosedShift = useShiftStore((s) => s.lastClosedShift)
  const isLoading = useShiftStore((s) => s.isLoading)
  const hydrationFailed = useShiftStore((s) => s.hydrationFailed)
  const error = useShiftStore((s) => s.error)
  const checkCurrentShift = useShiftStore((s) => s.checkCurrentShift)
  const storeId = useAuthStore(selectStoreId)

  useEffect(() => {
    void checkCurrentShift(storeId)
  }, [checkCurrentShift, storeId])

  if (lastClosedShift) {
    return <ShiftCloseTicket shift={lastClosedShift} />
  }

  if (isLoading && currentShift === null && !hydrationFailed) {
    return (
      <div
        className="flex h-dvh items-center justify-center bg-slate-100 text-slate-700"
        role="status"
        aria-live="polite"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-emerald-700" />
          <p className="text-sm font-medium">{t('shift.checking')}</p>
        </div>
      </div>
    )
  }

  if (hydrationFailed) {
    return (
      <div
        className="flex h-dvh items-center justify-center bg-slate-100 px-4 text-slate-800"
        data-testid="shift-hydration-error"
      >
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
          <h1 className="text-xl font-semibold text-slate-900">{t('shift.checkFailedTitle')}</h1>
          <p className="mt-2 text-sm text-slate-600" role="alert">
            {error ?? t('shift.checkFailedBody')}
          </p>
          <button
            type="button"
            data-testid="retry-shift-check"
            onClick={() => void checkCurrentShift(storeId)}
            className="mt-5 w-full rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white active:bg-emerald-800"
          >
            {t('common.retry')}
          </button>
        </div>
      </div>
    )
  }

  if (!currentShift) {
    return <OpenShiftModal />
  }

  return <>{children}</>
}
