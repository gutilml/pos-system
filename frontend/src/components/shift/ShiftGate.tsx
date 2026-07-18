import { useEffect, type ReactNode } from 'react'
import { OpenShiftModal } from '@/components/shift/OpenShiftModal'
import { useShiftStore } from '@/store/useShiftStore'

type ShiftGateProps = {
  children: ReactNode
}

export function ShiftGate({ children }: ShiftGateProps) {
  const currentShift = useShiftStore((s) => s.currentShift)
  const isLoading = useShiftStore((s) => s.isLoading)
  const hydrationFailed = useShiftStore((s) => s.hydrationFailed)
  const error = useShiftStore((s) => s.error)
  const checkCurrentShift = useShiftStore((s) => s.checkCurrentShift)

  useEffect(() => {
    void checkCurrentShift()
  }, [checkCurrentShift])

  if (isLoading && currentShift === null && !hydrationFailed) {
    return (
      <div
        className="flex h-dvh items-center justify-center bg-slate-100 text-slate-700"
        role="status"
        aria-live="polite"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-emerald-700" />
          <p className="text-sm font-medium">Checking shift status…</p>
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
          <h1 className="text-xl font-semibold text-slate-900">Unable to check shift</h1>
          <p className="mt-2 text-sm text-slate-600" role="alert">
            {error ?? 'Something went wrong while loading shift status.'}
          </p>
          <button
            type="button"
            data-testid="retry-shift-check"
            onClick={() => void checkCurrentShift()}
            className="mt-5 w-full rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white active:bg-emerald-800"
          >
            Retry
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
