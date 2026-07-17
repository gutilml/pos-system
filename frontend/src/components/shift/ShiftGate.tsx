import { useEffect, type ReactNode } from 'react'
import { OpenShiftModal } from '@/components/shift/OpenShiftModal'
import { useShiftStore } from '@/store/useShiftStore'

type ShiftGateProps = {
  children: ReactNode
}

export function ShiftGate({ children }: ShiftGateProps) {
  const currentShift = useShiftStore((s) => s.currentShift)
  const isLoading = useShiftStore((s) => s.isLoading)
  const checkCurrentShift = useShiftStore((s) => s.checkCurrentShift)

  useEffect(() => {
    void checkCurrentShift()
  }, [checkCurrentShift])

  if (isLoading && currentShift === null) {
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

  if (!currentShift) {
    return <OpenShiftModal />
  }

  return <>{children}</>
}
