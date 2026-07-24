import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { listProducts, type ProductApi } from '@/api/products'
import { CategoryPanel } from '@/features/admin/CategoryPanel'
import { ProductEditorForm } from '@/features/admin/ProductEditorForm'
import { useT } from '@/i18n/useT'
import { useAuthStore } from '@/store/useAuthStore'

type ProductsSubTab = 'product' | 'category'

export function ProductsWorkspace() {
  const t = useT()
  const enableInventory = useAuthStore((s) => s.user?.enableInventory === true)
  const [subTab, setSubTab] = useState<ProductsSubTab>('product')
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
    void reload()
  }, [reload])

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

  return (
    <section
      className="flex min-h-0 flex-1 flex-col bg-white"
      data-testid="products-workspace"
      aria-label={t('workspace.products')}
    >
      <div
        className="flex shrink-0 items-stretch gap-1 overflow-x-auto border-b border-slate-200 bg-slate-200/80 px-2 pt-2"
        role="tablist"
        aria-label={t('products.subNavAria')}
      >
        <SubTabButton
          active={subTab === 'product'}
          testId="products-tab-product"
          onClick={() => setSubTab('product')}
        >
          {t('admin.productsTab')}
        </SubTabButton>
        <SubTabButton
          active={subTab === 'category'}
          testId="products-tab-category"
          onClick={() => setSubTab('category')}
        >
          {t('admin.categoriesTab')}
        </SubTabButton>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {subTab === 'category' ? (
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
          <div className="mx-auto max-w-3xl space-y-3">
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
    </section>
  )
}

function SubTabButton({
  active,
  onClick,
  children,
  testId,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
  testId: string
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      data-testid={testId}
      onClick={onClick}
      className={`rounded-t-lg border border-b-0 px-3 py-2 text-sm font-medium ${
        active
          ? 'border-slate-300 bg-white text-slate-900'
          : 'border-transparent bg-slate-300/60 text-slate-600 hover:bg-slate-100'
      }`}
    >
      {children}
    </button>
  )
}
