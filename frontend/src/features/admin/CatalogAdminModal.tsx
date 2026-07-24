import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { listProducts, type ProductApi } from '@/api/products'
import { useT } from '@/i18n/useT'
import { useAuthStore } from '@/store/useAuthStore'
import { CategoryPanel } from '@/features/admin/CategoryPanel'
import { ProductEditorForm } from '@/features/admin/ProductEditorForm'
import { requestRegisterSearchFocus } from '@/lib/registerSearchFocus'

type CatalogAdminModalProps = {
  open: boolean
  onClose: () => void
}

type Tab = 'products' | 'categories'

export function CatalogAdminModal({ open, onClose }: CatalogAdminModalProps) {
  const t = useT()
  const enableInventory = useAuthStore((s) => s.user?.enableInventory === true)
  const [tab, setTab] = useState<Tab>('products')
  const [products, setProducts] = useState<ProductApi[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [filter, setFilter] = useState('')

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setProducts(await listProducts())
    } catch (err) {
      setError(err instanceof Error ? err.message : t('admin.loadFailed'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    if (!open) return
    void reload()
  }, [open, reload])

  if (!open) return null

  const filtered = products.filter((p) => {
    const q = filter.trim().toLowerCase()
    if (!q) return true
    return (
      p.name.toLowerCase().includes(q) ||
      (p.primarySku ?? p.sku ?? '').toLowerCase().includes(q) ||
      (p.skus ?? []).some((s) => s.toLowerCase().includes(q))
    )
  })

  const showEditor = creating || editingId != null

  function handleClose() {
    setCreating(false)
    setEditingId(null)
    onClose()
    requestRegisterSearchFocus()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="catalog-admin-title"
      data-testid="catalog-admin-modal"
    >
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 id="catalog-admin-title" className="text-xl font-semibold text-slate-900">
            {t('admin.title')}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            {t('common.done')}
          </button>
        </div>

        <div className="flex gap-2 border-b border-slate-100 px-5 pt-3">
          <TabButton active={tab === 'products'} onClick={() => setTab('products')}>
            {t('admin.productsTab')}
          </TabButton>
          <TabButton active={tab === 'categories'} onClick={() => setTab('categories')}>
            {t('admin.categoriesTab')}
          </TabButton>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {tab === 'categories' ? (
            <CategoryPanel onChanged={() => void reload()} />
          ) : showEditor ? (
            <ProductEditorForm
              productId={editingId}
              enableInventory={enableInventory}
              onCancel={() => {
                setCreating(false)
                setEditingId(null)
              }}
              onSaved={() => {
                setCreating(false)
                setEditingId(null)
                void reload()
              }}
            />
          ) : (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <input
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder={t('admin.filterProducts')}
                  className="min-w-[12rem] flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  data-testid="admin-new-product"
                  onClick={() => setCreating(true)}
                  className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white"
                >
                  {t('admin.newProduct')}
                </button>
              </div>

              {loading ? <p className="text-sm text-slate-600">{t('common.loading')}</p> : null}
              {error ? (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              ) : null}

              <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                {filtered.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => setEditingId(p.id)}
                      className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-slate-50"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-slate-900">{p.name}</span>
                        <span className="block truncate text-xs text-slate-500">
                          {p.primarySku ?? p.sku ?? t('admin.noBarcode')}
                        </span>
                      </span>
                      <span className="shrink-0 tabular-nums text-sm text-slate-700">
                        {Number(p.sellingPrice).toFixed(2)}
                      </span>
                    </button>
                  </li>
                ))}
                {!loading && filtered.length === 0 ? (
                  <li className="px-3 py-6 text-center text-sm text-slate-500">
                    {t('admin.noProducts')}
                  </li>
                ) : null}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border-b-2 px-3 pb-2 text-sm font-semibold ${
        active
          ? 'border-emerald-700 text-emerald-800'
          : 'border-transparent text-slate-500 hover:text-slate-800'
      }`}
    >
      {children}
    </button>
  )
}
