import { useEffect, useRef, useState } from 'react'
import { CloseShiftModal } from '@/components/shift/CloseShiftModal'
import { useAuthStore } from '@/store/useAuthStore'

export function CashierMenu() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [closeModalOpen, setCloseModalOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const logout = useAuthStore((s) => s.logout)
  const username = useAuthStore((s) => s.user?.username)

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
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setMenuOpen(false)
              setCloseModalOpen(true)
            }}
            className="block w-full px-4 py-2 text-left text-sm text-slate-800 hover:bg-slate-100"
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

      <CloseShiftModal open={closeModalOpen} onClose={() => setCloseModalOpen(false)} />
    </div>
  )
}
