import { useEffect, useState, type FormEvent } from 'react'
import {
  createProduct,
  getProduct,
  listProducts,
  updateProduct,
  type ProductApi,
  type ProductRequestBody,
} from '@/api/products'
import { listCategories, type CategoryApi } from '@/api/categories'
import { useT } from '@/i18n/useT'
import {
  isParentPackageIncompleteError,
  marginFromCostAndPrice,
  sellingPriceFromMargin,
} from '@/lib/productPricing'
import { ParentPackageModal } from '@/features/admin/ParentPackageModal'
import { isAbortError } from '@/lib/fetchAbort'

type ProductEditorProps = {
  productId: string | null
  enableInventory: boolean
  /** Create-mode prefill (Feature 056). */
  initialName?: string
  initialSkusText?: string
  onSaved: () => void
  onCancel: () => void
}

function parseSkus(raw: string): string[] {
  return raw
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function numOrNull(raw: string): number | null {
  const t = raw.trim()
  if (!t) return null
  const n = Number(t)
  return Number.isFinite(n) ? n : null
}

/** Fixed package-unit codes for chip picker (Feature 074). */
export const PACKAGE_UNIT_CODES = ['pc', 'kg', 'g', 'lb', 'L', 'ml'] as const

export type PackageUnitCode = (typeof PACKAGE_UNIT_CODES)[number]

export function normalizePackageUnit(raw: string | null | undefined): string {
  if (!raw) return ''
  const trimmed = raw.trim()
  const match = PACKAGE_UNIT_CODES.find((c) => c.toLowerCase() === trimmed.toLowerCase())
  return match ?? ''
}

function roundPct(n: number): number {
  return Math.round(n * 100) / 100
}

export function ProductEditorForm({
  productId,
  enableInventory,
  initialName = '',
  initialSkusText = '',
  onSaved,
  onCancel,
}: ProductEditorProps) {
  const t = useT()
  const [loading, setLoading] = useState(Boolean(productId))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<CategoryApi[]>([])
  const [parents, setParents] = useState<ProductApi[]>([])

  const [name, setName] = useState(initialName)
  const [description, setDescription] = useState('')
  const [skusText, setSkusText] = useState(initialSkusText)
  const [categoryId, setCategoryId] = useState('')
  const [sellByWeight, setSellByWeight] = useState(false)
  const [parentProductId, setParentProductId] = useState('')
  const [qtyPerPackage, setQtyPerPackage] = useState('')
  const [packageUnit, setPackageUnit] = useState('')
  const [costPrice, setCostPrice] = useState('')
  const [targetMarginPct, setTargetMarginPct] = useState('')
  const [sellingPrice, setSellingPrice] = useState('')
  const [wholesalePrice, setWholesalePrice] = useState('0')
  const [trackInventory, setTrackInventory] = useState(false)
  const [currentStock, setCurrentStock] = useState('')
  const [lowStockThreshold, setLowStockThreshold] = useState('')
  const [active, setActive] = useState(true)
  const [costReadOnly, setCostReadOnly] = useState(false)

  const [parentFixId, setParentFixId] = useState<string | null>(null)
  const [pendingRetry, setPendingRetry] = useState(false)

  function recalcSellingFromCostAndMargin(costRaw: string, marginPctRaw: string) {
    const cost = numOrNull(costRaw)
    const pct = numOrNull(marginPctRaw)
    if (pct == null || cost == null || cost < 0) return
    try {
      setSellingPrice(String(sellingPriceFromMargin(cost, pct / 100)))
    } catch {
      // leave selling while typing invalid values
    }
  }

  function onCategoryChange(nextId: string) {
    setCategoryId(nextId)
    if (!nextId) return
    const cat = categories.find((c) => c.id === nextId)
    if (!cat) return
    const pct = String(roundPct(cat.targetMargin * 100))
    setTargetMarginPct(pct)
    recalcSellingFromCostAndMargin(costPrice, pct)
  }

  function onCostChange(raw: string) {
    setCostPrice(raw)
    recalcSellingFromCostAndMargin(raw, targetMarginPct)
  }

  useEffect(() => {
    const ac = new AbortController()
    let active = true
    setLoading(Boolean(productId))
    setError(null)

    void (async () => {
      try {
        const [cats, products] = await Promise.all([
          listCategories(ac.signal),
          listProducts(ac.signal),
        ])
        if (!active || ac.signal.aborted) return
        setCategories(cats)
        setParents(products)
        if (productId) {
          const p = await getProduct(productId, ac.signal)
          if (!active || ac.signal.aborted) return
          setName(p.name)
          setDescription(p.description ?? '')
          setSkusText((p.skus ?? []).join('\n'))
          setCategoryId(p.categoryIds?.[0] ?? '')
          setSellByWeight(p.sellByWeight === true)
          setParentProductId(p.parentProductId ?? '')
          setQtyPerPackage(
            p.qtyPerPackage != null && Number.isFinite(Number(p.qtyPerPackage))
              ? String(p.qtyPerPackage)
              : '',
          )
          setPackageUnit(normalizePackageUnit(p.packageUnit ?? p.unitOfMeasure))
          setCostPrice(p.costPrice != null ? String(p.costPrice) : '')
          setCostReadOnly(Boolean(p.parentProductId))
          setTargetMarginPct(
            p.targetMargin != null ? String(roundPct(p.targetMargin * 100)) : '',
          )
          setSellingPrice(String(p.sellingPrice))
          setWholesalePrice(p.wholesalePrice != null ? String(p.wholesalePrice) : '0')
          setTrackInventory(p.trackInventory === true)
          setCurrentStock(p.currentStock != null ? String(p.currentStock) : '')
          setLowStockThreshold(
            p.lowStockThreshold != null ? String(p.lowStockThreshold) : '',
          )
          setActive(p.active !== false)
        } else {
          setName(initialName)
          setSkusText(initialSkusText)
          setDescription('')
          setCategoryId('')
          setSellByWeight(false)
          setParentProductId('')
          setQtyPerPackage('')
          setPackageUnit('')
          setCostPrice('')
          setCostReadOnly(false)
          setTargetMarginPct('')
          setSellingPrice('')
          setWholesalePrice('0')
          setTrackInventory(false)
          setCurrentStock('')
          setLowStockThreshold('')
          setActive(true)
        }
        setError(null)
      } catch (err) {
        if (!active || ac.signal.aborted || isAbortError(err)) return
        setError(err instanceof Error ? err.message : 'Failed to load catalog')
      } finally {
        if (active && !ac.signal.aborted) {
          setLoading(false)
        }
      }
    })()
    return () => {
      active = false
      ac.abort()
    }
  }, [productId, initialName, initialSkusText])

  function onMarginChange(raw: string) {
    setTargetMarginPct(raw)
    recalcSellingFromCostAndMargin(costPrice, raw)
  }

  function onSellingChange(raw: string) {
    setSellingPrice(raw)
    const sell = numOrNull(raw)
    const cost = numOrNull(costPrice)
    if (sell == null || cost == null || cost <= 0) return
    try {
      setTargetMarginPct(String(roundPct(marginFromCostAndPrice(cost, sell) * 100)))
    } catch {
      // ignore while typing
    }
  }

  function buildBody(): ProductRequestBody {
    const marginPct = numOrNull(targetMarginPct)
    return {
      name: name.trim(),
      description: description.trim() || null,
      skus: parseSkus(skusText),
      categoryId: categoryId || null,
      sellByWeight,
      unitOfMeasure: null,
      parentProductId: parentProductId || null,
      qtyPerPackage: parentProductId ? null : numOrNull(qtyPerPackage),
      packageUnit: parentProductId ? null : packageUnit.trim() || null,
      costPrice: costReadOnly ? null : numOrNull(costPrice),
      targetMargin: marginPct != null ? marginPct / 100 : null,
      sellingPrice: numOrNull(sellingPrice),
      wholesalePrice: numOrNull(wholesalePrice) ?? 0,
      trackInventory: enableInventory ? trackInventory : false,
      currentStock: enableInventory && trackInventory ? numOrNull(currentStock) : null,
      lowStockThreshold:
        enableInventory && trackInventory ? numOrNull(lowStockThreshold) : null,
      active,
    }
  }

  async function persist() {
    setSaving(true)
    setError(null)
    try {
      const body = buildBody()
      if (productId) {
        await updateProduct(productId, body)
      } else {
        await createProduct(body)
      }
      onSaved()
    } catch (err) {
      const message = err instanceof Error ? err.message : t('admin.saveFailed')
      if (isParentPackageIncompleteError(message) && parentProductId) {
        setParentFixId(parentProductId)
        setPendingRetry(true)
      } else {
        setError(message)
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    await persist()
  }

  if (loading) {
    return <p className="text-sm text-slate-600">{t('common.loading')}</p>
  }

  return (
    <>
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3" data-testid="product-editor">
        <label className="block text-sm font-medium text-slate-700">
          {t('admin.name')}
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          {t('admin.description')}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          {t('admin.barcodes')}
          <textarea
            value={skusText}
            onChange={(e) => setSkusText(e.target.value)}
            rows={2}
            placeholder={t('admin.barcodesHint')}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          {t('admin.category')}
          <select
            value={categoryId}
            onChange={(e) => onCategoryChange(e.target.value)}
            data-testid="product-category"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="">{t('admin.none')}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({roundPct(c.targetMargin * 100)}%)
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-wrap gap-4 text-sm">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={sellByWeight}
              onChange={(e) => setSellByWeight(e.target.checked)}
            />
            {t('admin.sellByWeight')}
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
            />
            {t('admin.active')}
          </label>
        </div>

        <label className="block text-sm font-medium text-slate-700">
          {t('admin.parentProduct')}
          <select
            value={parentProductId}
            onChange={(e) => {
              const next = e.target.value
              setParentProductId(next)
              setCostReadOnly(Boolean(next))
            }}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="">{t('admin.none')}</option>
            {parents
              .filter((p) => p.id !== productId)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
          </select>
        </label>

        {!parentProductId ? (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">
              {t('admin.qtyPerPackage')}
              <input
                value={qtyPerPackage}
                onChange={(e) => setQtyPerPackage(e.target.value)}
                inputMode="decimal"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-slate-700">{t('admin.packageUnit')}</legend>
              <div className="flex flex-wrap gap-2" data-testid="package-unit-chips">
                {PACKAGE_UNIT_CODES.map((code) => (
                  <label
                    key={code}
                    className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm ${
                      packageUnit === code
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                        : 'border-slate-300 text-slate-800'
                    }`}
                  >
                    <input
                      type="radio"
                      name="package-unit"
                      value={code}
                      checked={packageUnit === code}
                      onChange={() => setPackageUnit(code)}
                      data-testid={`package-unit-${code}`}
                      className="sr-only"
                    />
                    {t(
                      (
                        {
                          pc: 'admin.unit.pc',
                          kg: 'admin.unit.kg',
                          g: 'admin.unit.g',
                          lb: 'admin.unit.lb',
                          L: 'admin.unit.L',
                          ml: 'admin.unit.ml',
                        } as const
                      )[code],
                    )}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <label className="block text-sm font-medium text-slate-700">
            {t('admin.cost')}
            <input
              value={costPrice}
              onChange={(e) => onCostChange(e.target.value)}
              inputMode="decimal"
              readOnly={costReadOnly}
              data-testid="product-cost"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 read-only:bg-slate-100"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            {t('admin.marginPct')}
            <input
              value={targetMarginPct}
              onChange={(e) => onMarginChange(e.target.value)}
              inputMode="decimal"
              data-testid="product-margin"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            {t('admin.retail')}
            <input
              value={sellingPrice}
              onChange={(e) => onSellingChange(e.target.value)}
              inputMode="decimal"
              data-testid="product-retail"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            {t('admin.wholesale')}
            <input
              value={wholesalePrice}
              onChange={(e) => setWholesalePrice(e.target.value)}
              inputMode="decimal"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
        </div>

        {enableInventory ? (
          <fieldset className="rounded-lg border border-slate-200 p-3">
            <legend className="px-1 text-sm font-semibold text-slate-700">
              {t('admin.inventory')}
            </legend>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={trackInventory}
                onChange={(e) => setTrackInventory(e.target.checked)}
              />
              {t('admin.trackInventory')}
            </label>
            {trackInventory ? (
              <div className="mt-2 grid grid-cols-2 gap-3">
                <label className="block text-sm font-medium text-slate-700">
                  {t('admin.stock')}
                  <input
                    value={currentStock}
                    onChange={(e) => setCurrentStock(e.target.value)}
                    inputMode="decimal"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  {t('admin.minStock')}
                  <input
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(e.target.value)}
                    inputMode="decimal"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </label>
              </div>
            ) : null}
          </fieldset>
        ) : null}

        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
          >
            {t('footer.cancel')}
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? t('common.loading') : t('admin.save')}
          </button>
        </div>
      </form>

      <ParentPackageModal
        open={Boolean(parentFixId)}
        parentId={parentFixId}
        onClose={() => {
          setParentFixId(null)
          setPendingRetry(false)
        }}
        onSaved={async () => {
          setParentFixId(null)
          if (pendingRetry) {
            setPendingRetry(false)
            await persist()
          }
        }}
      />
    </>
  )
}
