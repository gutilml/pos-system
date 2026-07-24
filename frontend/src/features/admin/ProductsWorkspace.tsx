import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { searchProducts, type ProductApi } from '@/api/products'
import { CategoryPanel } from '@/features/admin/CategoryPanel'
import { ProductEditorForm } from '@/features/admin/ProductEditorForm'
import { useT } from '@/i18n/useT'
import { looksLikeBarcode, pickBestProductMatch } from '@/lib/productPricing'
import { useAuthStore } from '@/store/useAuthStore'

type ProductsSubTab = 'product' | 'category'

type EditorSession =
  | { mode: 'idle' }
  | {
      mode: 'edit' | 'create'
      productId: string | null
      initialName: string
      initialSkusText: string
      key: string
    }

export function ProductsWorkspace() {
  const t = useT()
  const enableInventory = useAuthStore((s) => s.user?.enableInventory === true)
  const [subTab, setSubTab] = useState<ProductsSubTab>('product')
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [lookupError, setLookupError] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<ProductApi[]>([])
  const [editor, setEditor] = useState<EditorSession>({ mode: 'idle' })
  const inputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const listboxId = useId()

  useEffect(() => {
    if (subTab !== 'product' || editor.mode !== 'idle') return
    inputRef.current?.focus()
  }, [subTab, editor.mode])

  useEffect(() => {
    const trimmed = query.trim()
    abortRef.current?.abort()
    abortRef.current = null

    if (editor.mode !== 'idle' || trimmed.length < 3) {
      setSuggestions([])
      return
    }

    const controller = new AbortController()
    abortRef.current = controller
    let cancelled = false

    void (async () => {
      try {
        const rows = await searchProducts(trimmed, controller.signal)
        if (cancelled || controller.signal.aborted) return
        setSuggestions(rows.slice(0, 10))
      } catch {
        if (cancelled || controller.signal.aborted) return
        setSuggestions([])
      }
    })()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [query, editor.mode])

  function resetToLookup() {
    setEditor({ mode: 'idle' })
    setQuery('')
    setSuggestions([])
    setLookupError(null)
  }

  function openEdit(product: ProductApi) {
    setEditor({
      mode: 'edit',
      productId: product.id,
      initialName: '',
      initialSkusText: '',
      key: `edit-${product.id}`,
    })
    setSuggestions([])
    setLookupError(null)
  }

  function openCreate(rawQuery: string) {
    const trimmed = rawQuery.trim()
    const barcode = looksLikeBarcode(trimmed)
    setEditor({
      mode: 'create',
      productId: null,
      initialName: barcode ? '' : trimmed,
      initialSkusText: barcode ? trimmed : '',
      key: `create-${trimmed}-${Date.now()}`,
    })
    setSuggestions([])
    setLookupError(null)
  }

  async function submitLookup(raw: string) {
    const trimmed = raw.trim()
    if (!trimmed || searching) return
    setSearching(true)
    setLookupError(null)
    try {
      const rows = await searchProducts(trimmed)
      const best = pickBestProductMatch(trimmed, rows)
      if (best) {
        openEdit(best)
      } else {
        openCreate(trimmed)
      }
      setQuery('')
    } catch (err) {
      setLookupError(err instanceof Error ? err.message : t('admin.loadFailed'))
    } finally {
      setSearching(false)
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    void submitLookup(query)
  }

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
          <CategoryPanel />
        ) : (
          <div className="mx-auto max-w-3xl space-y-4">
            {editor.mode === 'idle' ? (
              <form onSubmit={handleSubmit} className="space-y-2" data-testid="product-lookup">
                <label className="block text-sm font-medium text-slate-700" htmlFor="product-lookup-input">
                  {t('products.lookupLabel')}
                </label>
                <input
                  id="product-lookup-input"
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('products.lookupPlaceholder')}
                  autoComplete="off"
                  role="combobox"
                  aria-expanded={suggestions.length > 0}
                  aria-controls={listboxId}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-base text-slate-900 outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600"
                />
                <p className="text-xs text-slate-500">{t('products.lookupHint')}</p>
                {lookupError ? (
                  <p className="text-sm text-red-600" role="alert">
                    {lookupError}
                  </p>
                ) : null}
                {suggestions.length > 0 ? (
                  <ul
                    id={listboxId}
                    role="listbox"
                    className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
                  >
                    {suggestions.map((row) => (
                      <li key={row.id}>
                        <button
                          type="button"
                          role="option"
                          className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm hover:bg-slate-50"
                          onClick={() => openEdit(row)}
                        >
                          <span className="min-w-0 truncate font-medium text-slate-900">{row.name}</span>
                          <span className="shrink-0 text-xs text-slate-500">
                            {row.primarySku ?? row.sku ?? t('admin.noBarcode')}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
                <button
                  type="submit"
                  disabled={searching || !query.trim()}
                  className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {searching ? t('common.loading') : t('products.lookupSubmit')}
                </button>
              </form>
            ) : (
              <>
                <p className="text-sm text-slate-600" data-testid="product-editor-banner">
                  {editor.mode === 'create'
                    ? t('products.creatingFromLookup')
                    : t('products.editingFromLookup')}
                </p>
                <ProductEditorForm
                  key={editor.key}
                  productId={editor.productId}
                  enableInventory={enableInventory}
                  initialName={editor.initialName}
                  initialSkusText={editor.initialSkusText}
                  onCancel={resetToLookup}
                  onSaved={resetToLookup}
                />
              </>
            )}
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
