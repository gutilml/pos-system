import { useCallback, useEffect, useState } from 'react'
import { useT } from '@/i18n/useT'
import {
  SCALE_BANNER_DISMISS_KEY,
  hasGrantedScalePort,
  isMockScaleEnabled,
  isWebSerialSupported,
  MOCK_SCALE_CHANGE_EVENT,
  pairScalePort,
} from '@/utils/serialScaleHelper'

type ScaleConnectBannerProps = {
  /** When true, always show the panel (Settings). When false, only if unpaired and not dismissed. */
  alwaysShow?: boolean
}

/** Early scale pairing CTA (Feature 099). */
export function ScaleConnectBanner({ alwaysShow = false }: ScaleConnectBannerProps) {
  const t = useT()
  const [supported] = useState(() => isWebSerialSupported())
  const [mockEnabled, setMockEnabled] = useState(() => isMockScaleEnabled())
  const [paired, setPaired] = useState<boolean | null>(null)
  const [dismissed, setDismissed] = useState(() => {
    if (typeof sessionStorage === 'undefined') return false
    return sessionStorage.getItem(SCALE_BANNER_DISMISS_KEY) === '1'
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!isWebSerialSupported()) {
      setPaired(false)
      return
    }
    setPaired(await hasGrantedScalePort())
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    function onMockChange() {
      setMockEnabled(isMockScaleEnabled())
    }
    window.addEventListener(MOCK_SCALE_CHANGE_EVENT, onMockChange)
    window.addEventListener('storage', onMockChange)
    return () => {
      window.removeEventListener(MOCK_SCALE_CHANGE_EVENT, onMockChange)
      window.removeEventListener('storage', onMockChange)
    }
  }, [])

  // Register: suppress pairing CTA while mock scale is on (Feature 100).
  if (!alwaysShow && mockEnabled) {
    return null
  }

  if (!supported) {
    if (!alwaysShow) return null
    return (
      <div
        className="shrink-0 border-b border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600"
        data-testid="scale-connect-unsupported"
      >
        {t('weight.serialUnavailable')}
      </div>
    )
  }

  if (paired === null) return null

  if (!alwaysShow && (paired || dismissed)) return null

  async function handleConnect() {
    setBusy(true)
    setError(null)
    try {
      await pairScalePort()
      setPaired(true)
      sessionStorage.removeItem(SCALE_BANNER_DISMISS_KEY)
      setDismissed(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('scale.connectFailed'))
    } finally {
      setBusy(false)
    }
  }

  function handleDismiss() {
    sessionStorage.setItem(SCALE_BANNER_DISMISS_KEY, '1')
    setDismissed(true)
  }

  return (
    <div
      className={
        alwaysShow
          ? 'max-w-md rounded-xl border border-slate-200 bg-slate-50 p-4'
          : 'flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2'
      }
      data-testid="scale-connect-banner"
      role="status"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-900">
          {paired ? t('scale.connected') : t('scale.notConnected')}
        </p>
        {!paired ? <p className="text-xs text-slate-600">{t('scale.connectHint')}</p> : null}
        {error ? (
          <p className="mt-1 text-xs text-red-600" role="alert">
            {error}
          </p>
        ) : null}
      </div>
      <div className="flex shrink-0 gap-2">
        {!alwaysShow && !paired ? (
          <button
            type="button"
            data-testid="scale-banner-dismiss"
            onClick={handleDismiss}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700"
          >
            {t('scale.dismiss')}
          </button>
        ) : null}
        <button
          type="button"
          data-testid="scale-connect-button"
          disabled={busy}
          onClick={() => void handleConnect()}
          className="rounded-lg bg-emerald-700 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {busy ? t('scale.connecting') : paired ? t('scale.reconnect') : t('scale.connect')}
        </button>
      </div>
    </div>
  )
}
