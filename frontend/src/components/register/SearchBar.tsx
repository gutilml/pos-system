import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { findMockProduct } from '@/data/mockProducts'
import { useCartStore } from '@/store/useCartStore'

type SearchBarProps = {
  autoFocus?: boolean
}

export function SearchBar({ autoFocus = true }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const addItem = useCartStore((s) => s.addItem)

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus()
    }
  }, [autoFocus])

  function submitQuery(raw: string) {
    const product = findMockProduct(raw)
    if (!product) {
      setError('No product found')
      return
    }

    addItem(product)
    setQuery('')
    setError(null)
    inputRef.current?.focus()
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    submitQuery(query)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    // Barcode scanners typically end with Enter
    if (event.key === 'Enter') {
      event.preventDefault()
      submitQuery(query)
    }
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
        placeholder="Search / Scan Barcode"
        autoComplete="off"
        className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-lg text-slate-900 outline-none ring-emerald-600 focus:border-emerald-600 focus:bg-white focus:ring-2"
      />
      {error ? (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  )
}
