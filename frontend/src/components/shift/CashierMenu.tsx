import { useEffect, useRef, useState } from 'react'
import type { CashDrawerEventType } from '@/api/shifts'
import { CloseShiftModal } from '@/components/shift/CloseShiftModal'
import { DrawerEventModal } from '@/components/shift/DrawerEventModal'
import { CatalogAdminModal } from '@/features/admin/CatalogAdminModal'
import { useLocale, useT } from '@/i18n/useT'
import type { Locale } from '@/i18n/locale'
import { requestRegisterSearchFocus } from '@/lib/registerSearchFocus'
import { useAuthStore } from '@/store/useAuthStore'
import { useShiftStore } from '@/store/useShiftStore'

export function CashierMenu() {
  const t = useT()
  const locale = useLocale()
  const [menuOpen, setMenuOpen] = useState(false)
  const [closeModalOpen, setCloseModalOpen] = useState(false)
  const [drawerModalOpen, setDrawerModalOpen] = useState(false)
  const [catalogOpen, setCatalogOpen] = useState(false)
  const [drawerInitialType, setDrawerInitialType] =
    useState<CashDrawerEventType>('PAY_IN')
  const [loggingOut, setLoggingOut] = useState(false)
  const [localeError, setLocaleError] = useState<string | null>(null)
  const [savingLocale, setSavingLocale] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const logout = useAuthStore((s) => s.logout)
  const setLocaleAndPersist = useAuthStore((s) => s.setLocaleAndPersist)
  const username = useAuthStore((s) => s.user?.username)
  const currentShift = useShiftStore((s) => s.currentShift)
  const hasOpenShift = currentShift?.status === 'OPEN'

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
          className="absolute right-0 z-40 mt-2 w-52 rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
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
          <button
            type="button"
            role="menuitem"
            data-testid="catalog-menu-item"
            onClick={() => {
              setMenuOpen(false)
              setCatalogOpen(true)
            }}
            className="block w-full px-4 py-2 text-left text-sm text-slate-800 hover:bg-slate-100"
          >
            {t('cashier.catalog')}
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
      <CatalogAdminModal open={catalogOpen} onClose={() => setCatalogOpen(false)} />
    </div>
  )
}
