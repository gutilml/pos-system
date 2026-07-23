import { useEffect, useRef, useState } from 'react'
import type { CashDrawerEventType } from '@/api/shifts'
import { CloseShiftModal } from '@/components/shift/CloseShiftModal'
import { DrawerEventModal } from '@/components/shift/DrawerEventModal'
import { requestRegisterSearchFocus } from '@/lib/registerSearchFocus'
import { useAuthStore } from '@/store/useAuthStore'
import { useShiftStore } from '@/store/useShiftStore'

export function CashierMenu() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [closeModalOpen, setCloseModalOpen] = useState(false)
  const [drawerModalOpen, setDrawerModalOpen] = useState(false)
  const [drawerInitialType, setDrawerInitialType] =
    useState<CashDrawerEventType>('PAY_IN')
  const [loggingOut, setLoggingOut] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const logout = useAuthStore((s) => s.logout)
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

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
        className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
      >
        {username ? `Cashier (${username})` : 'Cashier'}
      </button>

      {menuOpen ? (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 w-44 rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
        >
          {hasOpenShift ? (
            <>
              <button
                type="button"
                role="menuitem"
                data-testid="pay-in-menu-item"
                onClick={() => openDrawer('PAY_IN')}
                className="block w-full px-4 py-2 text-left text-sm text-slate-800 hover:bg-slate-100"
              >
                Pay in
              </button>
              <button
                type="button"
                role="menuitem"
                data-testid="pay-out-menu-item"
                onClick={() => openDrawer('PAY_OUT')}
                className="block w-full px-4 py-2 text-left text-sm text-slate-800 hover:bg-slate-100"
              >
                Pay out
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
            Close Shift
          </button>
          <button
            type="button"
            role="menuitem"
            data-testid="logout-menu-item"
            disabled={loggingOut}
            onClick={() => void handleLogout()}
            className="block w-full px-4 py-2 text-left text-sm text-slate-800 hover:bg-slate-100 disabled:text-slate-400"
          >
            {loggingOut ? 'Logging out…' : 'Log out'}
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
    </div>
  )
}
