import { useEffect, useRef, useState } from 'react'
import type { CashDrawerEventType } from '@/api/shifts'
import { CloseShiftModal } from '@/components/shift/CloseShiftModal'
import { DrawerEventModal } from '@/components/shift/DrawerEventModal'
import { ShiftHistoryModal } from '@/components/shift/ShiftHistoryModal'
import { useLocale, useT } from '@/i18n/useT'
import type { Locale } from '@/i18n/locale'
import { requestRegisterSearchFocus } from '@/lib/registerSearchFocus'
import { useAuthStore } from '@/store/useAuthStore'
import { useShiftStore } from '@/store/useShiftStore'

function taxPercentFromFraction(rate: number | null | undefined): string {
  if (rate == null || !Number.isFinite(Number(rate))) return '0'
  const pct = Number(rate) * 100
  // Trim trailing zeros for cleaner display (8, 8.5, 16.25).
  return String(Number(pct.toFixed(4)))
}

export function CashierMenu() {
  const t = useT()
  const locale = useLocale()
  const [menuOpen, setMenuOpen] = useState(false)
  const [closeModalOpen, setCloseModalOpen] = useState(false)
  const [drawerModalOpen, setDrawerModalOpen] = useState(false)
  const [historyModalOpen, setHistoryModalOpen] = useState(false)
  const [drawerInitialType, setDrawerInitialType] =
    useState<CashDrawerEventType>('PAY_IN')
  const [loggingOut, setLoggingOut] = useState(false)
  const [localeError, setLocaleError] = useState<string | null>(null)
  const [savingLocale, setSavingLocale] = useState(false)
  const [taxInput, setTaxInput] = useState('0')
  const [taxError, setTaxError] = useState<string | null>(null)
  const [savingTax, setSavingTax] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const logout = useAuthStore((s) => s.logout)
  const setLocaleAndPersist = useAuthStore((s) => s.setLocaleAndPersist)
  const setTaxRateAndPersist = useAuthStore((s) => s.setTaxRateAndPersist)
  const username = useAuthStore((s) => s.user?.username)
  const defaultTaxRate = useAuthStore((s) => s.user?.defaultTaxRate)
  const currentShift = useShiftStore((s) => s.currentShift)
  const hasOpenShift = currentShift?.status === 'OPEN'

  useEffect(() => {
    setTaxInput(taxPercentFromFraction(defaultTaxRate))
  }, [defaultTaxRate])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleLogout() {
    setMenuOpen(false)
    setLoggingOut(true)
    try {
      await logout()
    } finally {
      setLoggingOut(false)
    }
  }

  function openDrawer(type: CashDrawerEventType) {
    setMenuOpen(false)
    setDrawerInitialType(type)
    setDrawerModalOpen(true)
  }

  async function handleLocale(next: Locale) {
    if (next === locale || savingLocale) return
    setLocaleError(null)
    setSavingLocale(true)
    try {
      await setLocaleAndPersist(next)
    } catch (err) {
      setLocaleError(err instanceof Error ? err.message : t('cashier.languageSaveFailed'))
    } finally {
      setSavingLocale(false)
    }
  }

  async function handleSaveTax() {
    if (savingTax) return
    setTaxError(null)
    const parsed = Number.parseFloat(taxInput)
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
      setTaxError(t('cashier.taxRateInvalid'))
      return
    }
    setSavingTax(true)
    try {
      await setTaxRateAndPersist(parsed / 100)
    } catch (err) {
      setTaxError(err instanceof Error ? err.message : t('cashier.taxRateSaveFailed'))
    } finally {
      setSavingTax(false)
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
        className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
      >
        {username ? `${t('cashier.menu')} (${username})` : t('cashier.menu')}
      </button>

      {menuOpen ? (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 w-60 rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
        >
          <div className="border-b border-slate-100 px-4 py-2" data-testid="language-toggle">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {t('cashier.language')}
            </p>
            <div className="flex gap-1">
              <button
                type="button"
                role="menuitem"
                data-testid="lang-en"
                disabled={savingLocale}
                onClick={() => void handleLocale('en')}
                className={`flex-1 rounded px-2 py-1.5 text-sm font-semibold ${
                  locale === 'en'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                } disabled:opacity-50`}
              >
                EN
              </button>
              <button
                type="button"
                role="menuitem"
                data-testid="lang-es"
                disabled={savingLocale}
                onClick={() => void handleLocale('es')}
                className={`flex-1 rounded px-2 py-1.5 text-sm font-semibold ${
                  locale === 'es'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                } disabled:opacity-50`}
              >
                ES
              </button>
            </div>
            {localeError ? (
              <p className="mt-1 text-xs text-red-600" role="alert">
                {localeError}
              </p>
            ) : null}
          </div>
          <div className="border-b border-slate-100 px-4 py-2" data-testid="tax-rate-edit">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {t('cashier.taxRate')}
            </p>
            <div className="flex items-center gap-1">
              <input
                type="text"
                inputMode="decimal"
                data-testid="tax-rate-input"
                value={taxInput}
                disabled={savingTax}
                onChange={(e) => setTaxInput(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="w-full rounded border border-slate-300 bg-slate-50 px-2 py-1.5 text-sm tabular-nums text-slate-900 outline-none focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 disabled:opacity-50"
              />
              <span className="shrink-0 text-sm font-medium text-slate-600">%</span>
              <button
                type="button"
                role="menuitem"
                data-testid="tax-rate-save"
                disabled={savingTax}
                onClick={() => void handleSaveTax()}
                className="shrink-0 rounded bg-emerald-700 px-2 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
              >
                {savingTax ? t('cashier.taxRateSaving') : t('cashier.taxRateSave')}
              </button>
            </div>
            {taxError ? (
              <p className="mt-1 text-xs text-red-600" role="alert" data-testid="tax-rate-error">
                {taxError}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            role="menuitem"
            data-testid="shift-history-menu-item"
            onClick={() => {
              setMenuOpen(false)
              setHistoryModalOpen(true)
            }}
            className="block w-full px-4 py-2 text-left text-sm text-slate-800 hover:bg-slate-100"
          >
            {t('cashier.shiftHistory')}
          </button>
          {hasOpenShift ? (
            <>
              <button
                type="button"
                role="menuitem"
                data-testid="pay-in-menu-item"
                onClick={() => openDrawer('PAY_IN')}
                className="block w-full px-4 py-2 text-left text-sm text-slate-800 hover:bg-slate-100"
              >
                {t('cashier.payIn')}
              </button>
              <button
                type="button"
                role="menuitem"
                data-testid="pay-out-menu-item"
                onClick={() => openDrawer('PAY_OUT')}
                className="block w-full px-4 py-2 text-left text-sm text-slate-800 hover:bg-slate-100"
              >
                {t('cashier.payOut')}
              </button>
            </>
          ) : null}
          <button
            type="button"
            role="menuitem"
            data-testid="close-shift-menu-item"
            disabled={!hasOpenShift}
            onClick={() => {
              if (!hasOpenShift) return
              setMenuOpen(false)
              setCloseModalOpen(true)
            }}
            className="block w-full px-4 py-2 text-left text-sm text-slate-800 hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400"
          >
            {t('cashier.closeShift')}
          </button>
          <button
            type="button"
            role="menuitem"
            data-testid="logout-menu-item"
            disabled={loggingOut}
            onClick={() => void handleLogout()}
            className="block w-full px-4 py-2 text-left text-sm text-slate-800 hover:bg-slate-100 disabled:text-slate-400"
          >
            {loggingOut ? t('cashier.loggingOut') : t('cashier.logOut')}
          </button>
        </div>
      ) : null}

      <CloseShiftModal
        open={closeModalOpen}
        onClose={() => {
          setCloseModalOpen(false)
          requestRegisterSearchFocus()
        }}
      />
      <DrawerEventModal
        open={drawerModalOpen}
        initialType={drawerInitialType}
        onClose={() => {
          setDrawerModalOpen(false)
          requestRegisterSearchFocus()
        }}
      />
      <ShiftHistoryModal
        open={historyModalOpen}
        onClose={() => {
          setHistoryModalOpen(false)
          requestRegisterSearchFocus()
        }}
      />
    </div>
  )
}
