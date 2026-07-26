import { useEffect, useState, type FormEvent } from 'react'
import { useT } from '@/i18n/useT'
import { selectStoreId, useAuthStore } from '@/store/useAuthStore'

function taxPercentFromFraction(rate: number | null | undefined): string {
  if (rate == null || !Number.isFinite(Number(rate))) return '0'
  const pct = Number(rate) * 100
  return String(Number(pct.toFixed(4)))
}

/** Admin store config: tax rate (Feature 095). */
export function StoreSettingsWorkspace() {
  const t = useT()
  const storeId = useAuthStore(selectStoreId)
  const storeName = useAuthStore((s) => s.user?.storeName)
  const defaultTaxRate = useAuthStore((s) => s.user?.defaultTaxRate)
  const setTaxRateAndPersist = useAuthStore((s) => s.setTaxRateAndPersist)

  const [taxInput, setTaxInput] = useState(() => taxPercentFromFraction(defaultTaxRate))
  const [taxError, setTaxError] = useState<string | null>(null)
  const [savingTax, setSavingTax] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)

  useEffect(() => {
    setTaxInput(taxPercentFromFraction(defaultTaxRate))
  }, [defaultTaxRate])

  async function handleSaveTax(e: FormEvent) {
    e.preventDefault()
    if (savingTax) return
    setTaxError(null)
    setSavedFlash(false)
    const parsed = Number.parseFloat(taxInput)
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
      setTaxError(t('settings.taxRateInvalid'))
      return
    }
    setSavingTax(true)
    try {
      await setTaxRateAndPersist(parsed / 100)
      setSavedFlash(true)
    } catch (err) {
      setTaxError(err instanceof Error ? err.message : t('settings.taxRateSaveFailed'))
    } finally {
      setSavingTax(false)
    }
  }

  return (
    <section
      className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto bg-white p-4"
      data-testid="store-settings-workspace"
      aria-label={t('workspace.settings')}
    >
      <div>
        <h2 className="text-base font-semibold text-slate-900">{t('workspace.settings')}</h2>
        <p className="mt-1 text-sm text-slate-600" data-testid="settings-store-name">
          {storeName ?? storeId}
        </p>
      </div>

      <form
        onSubmit={(e) => void handleSaveTax(e)}
        className="max-w-md rounded-xl border border-slate-200 bg-slate-50 p-4"
        data-testid="tax-rate-edit"
      >
        <h3 className="text-sm font-semibold text-slate-900">{t('settings.taxRate')}</h3>
        <p className="mt-1 text-xs text-slate-600">{t('settings.taxRateHint')}</p>
        <div className="mt-3 flex items-center gap-2">
          <label className="sr-only" htmlFor="store-tax-rate">
            {t('settings.taxRate')}
          </label>
          <input
            id="store-tax-rate"
            type="text"
            inputMode="decimal"
            data-testid="tax-rate-input"
            value={taxInput}
            disabled={savingTax}
            onChange={(e) => setTaxInput(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm tabular-nums text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600 disabled:opacity-50"
          />
          <span className="shrink-0 text-sm font-medium text-slate-600">%</span>
          <button
            type="submit"
            data-testid="tax-rate-save"
            disabled={savingTax}
            className="shrink-0 rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
          >
            {savingTax ? t('settings.taxRateSaving') : t('settings.taxRateSave')}
          </button>
        </div>
        {taxError ? (
          <p className="mt-2 text-sm text-red-600" role="alert" data-testid="tax-rate-error">
            {taxError}
          </p>
        ) : null}
        {savedFlash && !taxError ? (
          <p className="mt-2 text-sm text-emerald-800" data-testid="tax-rate-saved">
            {t('settings.taxRateSaved')}
          </p>
        ) : null}
      </form>
    </section>
  )
}
