import { useCallback, useEffect, useState, type FormEvent } from 'react'
import {
  createCustomer,
  deleteCustomer,
  getCustomerLedger,
  payCustomerBalance,
  searchCustomers,
  updateCustomer,
  type CreditLedgerEntry,
  type CustomerSearchResult,
} from '@/api/customers'
import { CustomerPaymentModal, type CustomerPaymentMethod } from '@/features/admin/CustomerPaymentModal'
import { useT } from '@/i18n/useT'
import { formatMoney, roundMoney } from '@/lib/money'
import { selectStoreId, useAuthStore } from '@/store/useAuthStore'

type DetailMode = 'idle' | 'create' | 'edit'

export function CustomersWorkspace() {
  const t = useT()
  const storeId = useAuthStore(selectStoreId)
  const enableCredit = useAuthStore((s) => s.user?.enableCustomerCredit === true)

  const [query, setQuery] = useState('')
  const [rows, setRows] = useState<CustomerSearchResult[]>([])
  const [loadingList, setLoadingList] = useState(false)
  const [listError, setListError] = useState<string | null>(null)

  const [mode, setMode] = useState<DetailMode>('idle')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [creditLimit, setCreditLimit] = useState('0')
  const [hasCredit, setHasCredit] = useState(false)
  const [balance, setBalance] = useState(0)
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [ledger, setLedger] = useState<CreditLedgerEntry[]>([])
  const [ledgerNewestFirst, setLedgerNewestFirst] = useState(true)
  const [payModalOpen, setPayModalOpen] = useState(false)
  const [paying, setPaying] = useState(false)

  const refreshList = useCallback(
    async (q: string) => {
      setLoadingList(true)
      setListError(null)
      try {
        const next = await searchCustomers(q, storeId)
        setRows(next)
      } catch (err) {
        setRows([])
        setListError(err instanceof Error ? err.message : t('customers.loadFailed'))
      } finally {
        setLoadingList(false)
      }
    },
    [storeId, t],
  )

  useEffect(() => {
    const trimmed = query.trim()
    const timer = window.setTimeout(() => {
      void refreshList(trimmed)
    }, trimmed.length === 0 ? 0 : 250)
    return () => window.clearTimeout(timer)
  }, [query, refreshList])

  function resetForm() {
    setName('')
    setPhone('')
    setCreditLimit('0')
    setHasCredit(false)
    setBalance(0)
    setFormError(null)
    setLedger([])
    setPayModalOpen(false)
    setLedgerNewestFirst(true)
  }

  function startCreate() {
    setMode('create')
    setSelectedId(null)
    resetForm()
  }

  async function selectCustomer(customer: CustomerSearchResult) {
    setMode('edit')
    setSelectedId(customer.id)
    setName(customer.name)
    setPhone(customer.phone ?? '')
    const bal = Number(customer.currentBalance)
    const limit = Number(customer.creditLimit)
    setCreditLimit(String(customer.creditLimit))
    setHasCredit(limit > 0 || bal > 0)
    setBalance(bal)
    setFormError(null)
    setPayModalOpen(false)
    setLedgerNewestFirst(true)
    if (enableCredit && (limit > 0 || bal > 0)) {
      try {
        const entries = await getCustomerLedger(customer.id)
        setLedger(entries)
      } catch (err) {
        setLedger([])
        setFormError(err instanceof Error ? err.message : t('customers.ledgerFailed'))
      }
    } else {
      setLedger([])
    }
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) {
      setFormError(t('customers.nameRequired'))
      return
    }
    if (enableCredit && !hasCredit && balance > 0) {
      setFormError(t('customers.cannotDisableCreditWithBalance'))
      return
    }
    const limit =
      enableCredit && hasCredit ? roundMoney(Number(creditLimit) || 0) : 0
    setSaving(true)
    setFormError(null)
    try {
      if (mode === 'create') {
        const created = await createCustomer({
          storeId,
          name: trimmedName,
          phone: phone.trim() || null,
          creditLimit: limit,
        })
        await refreshList(query.trim())
        await selectCustomer(created)
      } else if (mode === 'edit' && selectedId) {
        const updated = await updateCustomer(selectedId, {
          name: trimmedName,
          phone: phone.trim() || null,
          creditLimit: limit,
        })
        await refreshList(query.trim())
        await selectCustomer(updated)
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t('customers.saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!selectedId || mode !== 'edit') return
    if (!window.confirm(t('customers.deleteConfirm'))) return
    setSaving(true)
    setFormError(null)
    try {
      await deleteCustomer(selectedId)
      setMode('idle')
      setSelectedId(null)
      resetForm()
      await refreshList(query.trim())
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t('customers.deleteFailed'))
    } finally {
      setSaving(false)
    }
  }

  async function handlePay(amount: number, method: CustomerPaymentMethod) {
    if (!selectedId || !enableCredit) return
    setPaying(true)
    setFormError(null)
    try {
      const updated = await payCustomerBalance(selectedId, amount, method)
      setPayModalOpen(false)
      await refreshList(query.trim())
      await selectCustomer(updated)
    } catch (err) {
      const message = err instanceof Error ? err.message : t('customers.payFailed')
      setFormError(message)
      throw err instanceof Error ? err : new Error(message)
    } finally {
      setPaying(false)
    }
  }

  const displayedLedger = ledgerNewestFirst ? ledger : [...ledger].reverse()

  return (
    <section
      className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden bg-white p-4"
      data-testid="customers-workspace"
      aria-label={t('workspace.customers')}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-slate-900">{t('workspace.customers')}</h2>
        <button
          type="button"
          data-testid="customers-new"
          onClick={startCreate}
          className="rounded-lg bg-emerald-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-800"
        >
          {t('customers.new')}
        </button>
      </div>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-2">
        <div className="flex min-h-0 flex-col gap-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="customers-filter">
            {t('customers.filter')}
          </label>
          <input
            id="customers-filter"
            data-testid="customers-filter"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('customers.filterPlaceholder')}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-600 focus:border-emerald-600 focus:ring-2"
          />
          {loadingList ? (
            <p className="text-sm text-slate-500" role="status">
              {t('common.loading')}
            </p>
          ) : null}
          {listError ? (
            <p className="text-sm text-red-600" role="alert">
              {listError}
            </p>
          ) : null}
          <ul
            className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-slate-200"
            data-testid="customers-list"
          >
            {rows.map((customer) => (
              <li key={customer.id} className="border-b border-slate-100 last:border-b-0">
                <button
                  type="button"
                  data-testid={`customer-row-${customer.id}`}
                  onClick={() => void selectCustomer(customer)}
                  className={`flex w-full flex-col gap-0.5 px-3 py-2 text-left hover:bg-emerald-50 ${
                    selectedId === customer.id ? 'bg-emerald-50' : ''
                  }`}
                >
                  <span className="font-medium text-slate-900">{customer.name}</span>
                  <span className="text-xs text-slate-500">
                    {customer.phone ? customer.phone : t('customers.noPhone')}
                    {enableCredit
                      ? ` · ${t('customers.balance')} ${formatMoney(Number(customer.currentBalance))}`
                      : ''}
                  </span>
                </button>
              </li>
            ))}
            {!loadingList && rows.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-slate-500">{t('customers.none')}</li>
            ) : null}
          </ul>
        </div>

        <div className="min-h-0 overflow-y-auto rounded-lg border border-slate-200 p-4">
          {mode === 'idle' ? (
            <p className="text-sm text-slate-500" data-testid="customers-detail-idle">
              {t('customers.selectHint')}
            </p>
          ) : (
            <form className="space-y-3" onSubmit={(e) => void handleSave(e)} data-testid="customers-form">
              <h3 className="text-sm font-semibold text-slate-900">
                {mode === 'create' ? t('customers.new') : t('customers.edit')}
              </h3>
              <div>
                <label className="text-sm font-medium text-slate-700" htmlFor="customer-name">
                  {t('customers.name')}
                </label>
                <input
                  id="customer-name"
                  data-testid="customer-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700" htmlFor="customer-phone">
                  {t('customers.phone')}
                </label>
                <input
                  id="customer-phone"
                  data-testid="customer-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              {enableCredit ? (
                <>
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      data-testid="customer-has-credit"
                      checked={hasCredit}
                      onChange={(e) => {
                        const next = e.target.checked
                        if (!next && balance > 0) {
                          setFormError(t('customers.cannotDisableCreditWithBalance'))
                          return
                        }
                        setHasCredit(next)
                        if (!next) setCreditLimit('0')
                        setFormError(null)
                      }}
                    />
                    {t('customers.hasCredit')}
                  </label>
                  {hasCredit ? (
                    <div>
                      <label className="text-sm font-medium text-slate-700" htmlFor="customer-credit-limit">
                        {t('customers.creditLimit')}
                      </label>
                      <input
                        id="customer-credit-limit"
                        data-testid="customer-credit-limit"
                        type="number"
                        step="0.01"
                        min="0"
                        value={creditLimit}
                        onChange={(e) => setCreditLimit(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      />
                    </div>
                  ) : null}
                  {mode === 'edit' && hasCredit ? (
                    <p className="text-sm text-slate-700" data-testid="customer-balance">
                      {t('customers.balance')}: <span className="font-semibold">{formatMoney(balance)}</span>
                    </p>
                  ) : null}
                </>
              ) : null}

              {formError ? (
                <p className="text-sm text-red-600" role="alert" data-testid="customers-form-error">
                  {formError}
                </p>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  data-testid="customers-save"
                  disabled={saving}
                  className="rounded-lg bg-emerald-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
                >
                  {saving ? t('customers.saving') : t('admin.save')}
                </button>
                {mode === 'edit' ? (
                  <button
                    type="button"
                    data-testid="customers-delete"
                    disabled={saving}
                    onClick={() => void handleDelete()}
                    className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
                  >
                    {t('admin.delete')}
                  </button>
                ) : null}
              </div>

              {enableCredit && hasCredit && mode === 'edit' && selectedId ? (
                <div className="space-y-3 border-t border-slate-200 pt-3" data-testid="customers-credit-section">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold text-slate-900">{t('customers.ledger')}</h4>
                    <button
                      type="button"
                      data-testid="customers-ledger-sort"
                      onClick={() => setLedgerNewestFirst((v) => !v)}
                      className="rounded border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700"
                    >
                      {ledgerNewestFirst ? t('customers.sortNewest') : t('customers.sortOldest')}
                    </button>
                  </div>
                  <ul className="max-h-40 overflow-y-auto rounded border border-slate-200 text-sm" data-testid="customers-ledger">
                    {displayedLedger.map((entry) => (
                      <li key={entry.id} className="flex justify-between gap-2 border-b border-slate-100 px-2 py-1 last:border-b-0">
                        <span>
                          {entry.description} · {new Date(entry.createdAt).toLocaleString()}
                        </span>
                        <span className="font-medium">{formatMoney(Number(entry.amount))}</span>
                      </li>
                    ))}
                    {displayedLedger.length === 0 ? (
                      <li className="px-2 py-3 text-slate-500">{t('customers.ledgerEmpty')}</li>
                    ) : null}
                  </ul>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      data-testid="customers-pay"
                      disabled={paying || balance <= 0}
                      onClick={() => setPayModalOpen(true)}
                      className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-white hover:bg-slate-900 disabled:opacity-60"
                    >
                      {t('customers.pay')}
                    </button>
                  </div>
                </div>
              ) : null}
            </form>
          )}
        </div>
      </div>

      <CustomerPaymentModal
        open={payModalOpen && !!selectedId}
        customerName={name}
        balance={balance}
        submitting={paying}
        onClose={() => setPayModalOpen(false)}
        onSubmit={handlePay}
      />
    </section>
  )
}
