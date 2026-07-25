import { useMemo, useState } from 'react'

export type SearchableOption = {
  id: string
  label: string
  searchText?: string
}

type SearchableSelectProps = {
  label: string
  value: string
  options: SearchableOption[]
  noneLabel: string
  searchPlaceholder: string
  testId: string
  onChange: (id: string) => void
  /** Trailing action shown as last row (e.g. Add category). */
  actionLabel?: string
  actionTestId?: string
  onAction?: () => void
}

/**
 * Compact searchable single-select for admin forms (Feature 076).
 */
export function SearchableSelect({
  label,
  value,
  options,
  noneLabel,
  searchPlaceholder,
  testId,
  onChange,
  actionLabel,
  actionTestId,
  onAction,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const selected = options.find((o) => o.id === value)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((o) => {
      const hay = (o.searchText ?? o.label).toLowerCase()
      return hay.includes(q)
    })
  }, [options, query])

  function pick(id: string) {
    onChange(id)
    setOpen(false)
    setQuery('')
  }

  return (
    <div className="relative block text-sm font-medium text-slate-700">
      <span>{label}</span>
      <button
        type="button"
        data-testid={testId}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="mt-1 flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-left font-normal text-slate-900"
      >
        <span className="truncate">{selected ? selected.label : noneLabel}</span>
        <span className="text-slate-400" aria-hidden>
          ▾
        </span>
      </button>

      {open ? (
        <div
          className="absolute z-20 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg"
          data-testid={`${testId}-menu`}
        >
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            data-testid={`${testId}-search`}
            className="w-full border-b border-slate-200 px-3 py-2 text-sm font-normal outline-none"
            autoFocus
          />
          <ul className="max-h-48 overflow-y-auto py-1 text-sm font-normal">
            <li>
              <button
                type="button"
                className="w-full px-3 py-2 text-left hover:bg-slate-50"
                onClick={() => pick('')}
              >
                {noneLabel}
              </button>
            </li>
            {filtered.map((o) => (
              <li key={o.id}>
                <button
                  type="button"
                  className={`w-full px-3 py-2 text-left hover:bg-slate-50 ${
                    o.id === value ? 'bg-emerald-50 text-emerald-900' : ''
                  }`}
                  onClick={() => pick(o.id)}
                >
                  {o.label}
                </button>
              </li>
            ))}
            {actionLabel && onAction ? (
              <li className="border-t border-slate-100">
                <button
                  type="button"
                  data-testid={actionTestId}
                  className="w-full px-3 py-2 text-left font-medium text-emerald-800 hover:bg-emerald-50"
                  onClick={() => {
                    setOpen(false)
                    setQuery('')
                    onAction()
                  }}
                >
                  {actionLabel}
                </button>
              </li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
