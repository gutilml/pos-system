import { useState, type FormEvent } from 'react'
import { useT } from '@/i18n/useT'
import { useAuthStore } from '@/store/useAuthStore'

export function LoginForm() {
  const t = useT()
  const login = useAuthStore((s) => s.login)
  const error = useAuthStore((s) => s.error)
  const clearError = useAuthStore((s) => s.clearError)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    clearError()
    setLocalError(null)

    if (!username.trim() || !password) {
      setLocalError(t('login.missingCredentials'))
      return
    }

    setSubmitting(true)
    try {
      await login(username.trim(), password)
    } catch {
      // error surfaced via store
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4"
      data-testid="login-form"
    >
      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        aria-labelledby="login-title"
      >
        <h1 id="login-title" className="text-xl font-semibold text-slate-900">
          {t('login.title')}
        </h1>
        <p className="mt-2 text-sm text-slate-600">{t('login.subtitle')}</p>

        <label htmlFor="login-username" className="mt-5 mb-1 block text-sm font-medium text-slate-700">
          {t('login.username')}
        </label>
        <input
          id="login-username"
          type="text"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600"
          autoFocus
        />

        <label htmlFor="login-password" className="mt-4 mb-1 block text-sm font-medium text-slate-700">
          {t('login.password')}
        </label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600"
        />

        {(localError || error) && (
          <p className="mt-2 text-sm text-red-600" role="alert" data-testid="login-error">
            {localError ??
              (error && /invalid credentials/i.test(error)
                ? t('login.invalidCredentials')
                : error)}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-5 w-full rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300 active:bg-emerald-800"
        >
          {submitting ? t('login.submitting') : t('login.submit')}
        </button>
      </form>
    </div>
  )
}
