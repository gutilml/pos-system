import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { searchProducts, toCartProduct, type ProductApi } from '@/api/products'
import {
  isRegisterModalOpen,
  REGISTER_SEARCH_FOCUS_EVENT,
  requestRegisterSearchFocus,
} from '@/lib/registerSearchFocus'
import { useCartStore } from '@/store/useCartStore'

type SearchBarProps = {
  autoFocus?: boolean
}

const TYPEAHEAD_MIN_CHARS = 3
const TYPEAHEAD_MAX_RESULTS = 10

export function SearchBar({ autoFocus = true }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [searching, setSearching] = useState(false)
  const [suggestions, setSuggestions] = useState<ProductApi[]>([])
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const listboxId = useId()
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

  useEffect(() => {
    const trimmed = query.trim()
    abortRef.current?.abort()
    abortRef.current = null

    if (trimmed.length < TYPEAHEAD_MIN_CHARS) {
      setSuggestions([])
      setHighlightIndex(-1)
      return
    }

    const controller = new AbortController()
    abortRef.current = controller
    let cancelled = false

    void (async () => {
      try {
        const rows = await searchProducts(trimmed, controller.signal)
        if (cancelled || controller.signal.aborted) return
        setSuggestions(rows.slice(0, TYPEAHEAD_MAX_RESULTS))
        setHighlightIndex(-1)
      } catch (err) {
        if (cancelled || controller.signal.aborted) return
        if (err instanceof DOMException && err.name === 'AbortError') return
        setSuggestions([])
      }
    })()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [query])

  function clearSuggestions() {
    setSuggestions([])
    setHighlightIndex(-1)
  }

  function addProduct(row: ProductApi) {
    addItem(toCartProduct(row))
    setQuery('')
    clearSuggestions()
    setError(null)
    requestRegisterSearchFocus()
  }

  async function submitQuery(raw: string) {
    const trimmed = raw.trim()
    if (!trimmed || searching) return

    if (highlightIndex >= 0 && suggestions[highlightIndex]) {
      addProduct(suggestions[highlightIndex])
      return
    }

    setSearching(true)
    setError(null)
    try {
      const rows = await searchProducts(trimmed)
      if (rows.length === 0) {
        setError('No product found')
        clearSuggestions()
        return
      }

      addProduct(rows[0])
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
    if (event.key === 'ArrowDown' && suggestions.length > 0) {
      event.preventDefault()
      setHighlightIndex((i) => (i + 1) % suggestions.length)
      return
    }
    if (event.key === 'ArrowUp' && suggestions.length > 0) {
      event.preventDefault()
      setHighlightIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1))
      return
    }
    if (event.key === 'Escape') {
      clearSuggestions()
      return
    }
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
      if (active instanceof HTMLElement && active.closest('[data-testid="search-suggestions"]')) {
        return
      }
      if (active === inputRef.current) return
      inputRef.current?.focus()
    }, 0)
  }

  const activeDescendant =
    highlightIndex >= 0 ? `${listboxId}-option-${highlightIndex}` : undefined

  return (
    <form
      onSubmit={handleSubmit}
      className="relative shrink-0 border-b border-slate-200 bg-white px-4 py-3"
    >
      <label htmlFor="register-search" className="sr-only">
        Search or scan barcode
      </label>
      <input
        ref={inputRef}
        id="register-search"
        type="text"
        role="combobox"
        aria-expanded={suggestions.length > 0}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={activeDescendant}
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
      {suggestions.length > 0 ? (
        <ul
          id={listboxId}
          role="listbox"
          data-testid="search-suggestions"
          className="absolute left-4 right-4 z-30 mt-1 max-h-72 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg"
        >
          {suggestions.map((row, index) => {
            const code = row.primarySku ?? row.sku ?? ''
            const selected = index === highlightIndex
            return (
              <li key={row.id} role="presentation">
                <button
                  type="button"
                  id={`${listboxId}-option-${index}`}
                  role="option"
                  aria-selected={selected}
                  data-testid={`search-suggestion-${row.id}`}
                  className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm ${
                    selected ? 'bg-emerald-50 text-emerald-950' : 'text-slate-800 hover:bg-slate-50'
                  }`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => addProduct(row)}
                >
                  <span className="truncate font-medium">{row.name}</span>
                  <span className="shrink-0 tabular-nums text-slate-500">{code}</span>
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
      {error ? (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  )
}
