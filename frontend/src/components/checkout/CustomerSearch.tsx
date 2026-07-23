import { useEffect, useId, useState } from 'react'
import { searchCustomers, type CustomerSearchResult } from '@/api/customers'
import { translate } from '@/i18n/messages'
import { useLocale, useT } from '@/i18n/useT'
import { formatMoney, roundMoney } from '@/lib/money'
import { selectStoreId, useAuthStore } from '@/store/useAuthStore'
import type { AssignedCustomer } from '@/store/useCartStore'

type CustomerSearchProps = {
  onSelect: (customer: AssignedCustomer) => void
  autoFocus?: boolean
}

function toAssigned(customer: CustomerSearchResult): AssignedCustomer {
  return {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    creditLimit: roundMoney(Number(customer.creditLimit)),
    currentBalance: roundMoney(Number(customer.currentBalance)),
  }
}

function availableCredit(customer: CustomerSearchResult): number {
  return roundMoney(
    Math.max(0, Number(customer.creditLimit) - Number(customer.currentBalance)),
  )
}

export function CustomerSearch({ onSelect, autoFocus = false }: CustomerSearchProps) {
  const t = useT()
  const locale = useLocale()
  const inputId = useId()
  const storeId = useAuthStore(selectStoreId)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<CustomerSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 1) {
      setResults([])
      setError(null)
      setLoading(false)
      return
    }

    let cancelled = false
    const timer = window.setTimeout(() => {
      setLoading(true)
      void searchCustomers(trimmed, storeId)
        .then((rows) => {
          if (cancelled) return
          setResults(rows)
          setError(null)
        })
        .catch((err: unknown) => {
          if (cancelled) return
          setResults([])
          setError(
            err instanceof Error ? err.message : translate('customer.searchFailed', locale),
          )
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }, 250)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [query, storeId, locale])

  return (
    <div className="space-y-2" data-testid="customer-search">
      <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
        {t('customer.find')}
      </label>
      <input
        id={inputId}
        type="search"
        autoFocus={autoFocus}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t('customer.placeholder')}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-emerald-600 focus:border-emerald-600 focus:ring-2"
      />

      {loading ? (
        <p className="text-sm text-slate-500" role="status">
          {t('customer.searching')}
        </p>
      ) : null}

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      {results.length > 0 ? (
        <ul className="max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white">
          {results.map((customer) => (
            <li key={customer.id} className="border-b border-slate-100 last:border-b-0">
              <button
                type="button"
                onClick={() => onSelect(toAssigned(customer))}
                className="flex w-full flex-col gap-0.5 px-3 py-2 text-left hover:bg-emerald-50 active:bg-emerald-100"
              >
                <span className="font-medium text-slate-900">{customer.name}</span>
                <span className="text-xs text-slate-500">
                  {customer.phone ? `${customer.phone} · ` : ''}
                  {t('customer.availableCredit')} {formatMoney(availableCredit(customer))}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {!loading && !error && query.trim().length > 0 && results.length === 0 ? (
        <p className="text-sm text-slate-500">{t('customer.noneFound')}</p>
      ) : null}
    </div>
  )
}
