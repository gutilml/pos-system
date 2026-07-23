import { useEffect, type ReactNode } from 'react'
import { LoginForm } from '@/components/auth/LoginForm'
import { useT } from '@/i18n/useT'
import { useAuthStore } from '@/store/useAuthStore'

type AuthGateProps = {
  children: ReactNode
}

export function AuthGate({ children }: AuthGateProps) {
  const t = useT()
  const status = useAuthStore((s) => s.status)
  const bootstrap = useAuthStore((s) => s.bootstrap)

  useEffect(() => {
    if (status === 'idle') {
      void bootstrap()
    }
  }, [status, bootstrap])

  if (status === 'idle' || status === 'loading') {
    return (
      <div
        className="flex h-dvh items-center justify-center bg-slate-100 text-slate-700"
        role="status"
        aria-live="polite"
        data-testid="auth-loading"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-emerald-700" />
          <p className="text-sm font-medium">{t('auth.checkingSession')}</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return <LoginForm />
  }

  return <>{children}</>
}
