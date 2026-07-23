import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { searchProducts, toCartProduct } from '@/api/products'
import {
  isRegisterModalOpen,
  REGISTER_SEARCH_FOCUS_EVENT,
  requestRegisterSearchFocus,
} from '@/lib/registerSearchFocus'
import { useCartStore } from '@/store/useCartStore'

type SearchBarProps = {
  autoFocus?: boolean
}

export function SearchBar({ autoFocus = true }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [searching, setSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const addItem = useCartStore((s) => s.addItem)

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus()
    }
  }, [autoFocus])

  useEffect(() => {
    function onRequestFocus() {
      if (isRegisterModalOpen()) return
      inputRef.current?.focus()
    }
    window.addEventListener(REGISTER_SEARCH_FOCUS_EVENT, onRequestFocus)
    return () => window.removeEventListener(REGISTER_SEARCH_FOCUS_EVENT, onRequestFocus)
  }, [])

  async function submitQuery(raw: string) {
    const trimmed = raw.trim()
    if (!trimmed || searching) return

    setSearching(true)
    setError(null)
    try {
      const rows = await searchProducts(trimmed)
      if (rows.length === 0) {
        setError('No product found')
        return
      }

      addItem(toCartProduct(rows[0]))
      setQuery('')
      requestRegisterSearchFocus()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Product search failed')
    } finally {
      setSearching(false)
      requestRegisterSearchFocus()
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    void submitQuery(query)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    // Barcode scanners typically end with Enter
    if (event.key === 'Enter') {
      event.preventDefault()
      void submitQuery(query)
    }
  }

  function handleBlur() {
    window.setTimeout(() => {
      if (isRegisterModalOpen()) return
      const active = document.activeElement
      if (active instanceof HTMLElement && active.closest('[data-register-editable]')) {
        return
      }
      if (active === inputRef.current) return
      inputRef.current?.focus()
    }, 0)
  }

  return (
    <form onSubmit={handleSubmit} className="shrink-0 border-b border-slate-200 bg-white px-4 py-3">
      <label htmlFor="register-search" className="sr-only">
        Search or scan barcode
      </label>
      <input
        ref={inputRef}
        id="register-search"
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          if (error) setError(null)
        }}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder="Search / Scan Barcode"
        autoComplete="off"
        disabled={searching}
        className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-lg text-slate-900 outline-none ring-emerald-600 focus:border-emerald-600 focus:bg-white focus:ring-2 disabled:opacity-60"
      />
      {error ? (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  )
}
