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

type ProductEditorProps = {
  productId: string | null
  enableInventory: boolean
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

export function ProductEditorForm({
  productId,
  enableInventory,
  onSaved,
  onCancel,
}: ProductEditorProps) {
  const t = useT()
  const [loading, setLoading] = useState(Boolean(productId))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<CategoryApi[]>([])
  const [parents, setParents] = useState<ProductApi[]>([])

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [skusText, setSkusText] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [sellByWeight, setSellByWeight] = useState(false)
  const [unitOfMeasure, setUnitOfMeasure] = useState('')
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

  useEffect(() => {
    const ac = new AbortController()
    void (async () => {
      try {
        const [cats, products] = await Promise.all([
          listCategories(ac.signal),
          listProducts(ac.signal),
        ])
        setCategories(cats)
        setParents(products)
        if (productId) {
          const p = await getProduct(productId, ac.signal)
          setName(p.name)
          setDescription(p.description ?? '')
          setSkusText((p.skus ?? []).join('\n'))
          setCategoryId(p.categoryIds?.[0] ?? '')
          setSellByWeight(p.sellByWeight === true)
          setUnitOfMeasure(p.unitOfMeasure ?? '')
          setParentProductId(p.parentProductId ?? '')
          setQtyPerPackage(
            p.qtyPerPackage != null && Number.isFinite(Number(p.qtyPerPackage))
              ? String(p.qtyPerPackage)
              : '',
          )
          setPackageUnit(p.packageUnit ?? p.unitOfMeasure ?? '')
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
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t('admin.loadFailed'))
      } finally {
        setLoading(false)
      }
    })()
    return () => ac.abort()
  }, [productId, t])

  function onMarginChange(raw: string) {
    setTargetMarginPct(raw)
    const pct = numOrNull(raw)
    const cost = numOrNull(costPrice)
    if (pct == null || cost == null) return
    try {
      setSellingPrice(String(sellingPriceFromMargin(cost, pct / 100)))
    } catch {
      // leave selling as-is while typing invalid margin
    }
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
      unitOfMeasure: unitOfMeasure.trim() || null,
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
            onChange={(e) => setCategoryId(e.target.value)}
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
          {t('admin.unitOfMeasure')}
          <input
            value={unitOfMeasure}
            onChange={(e) => setUnitOfMeasure(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

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
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm font-medium text-slate-700">
              {t('admin.qtyPerPackage')}
              <input
                value={qtyPerPackage}
                onChange={(e) => setQtyPerPackage(e.target.value)}
                inputMode="decimal"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              {t('admin.packageUnit')}
              <input
                value={packageUnit}
                onChange={(e) => setPackageUnit(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <label className="block text-sm font-medium text-slate-700">
            {t('admin.cost')}
            <input
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
              inputMode="decimal"
              readOnly={costReadOnly}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 read-only:bg-slate-100"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            {t('admin.marginPct')}
            <input
              value={targetMarginPct}
              onChange={(e) => onMarginChange(e.target.value)}
              inputMode="decimal"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            {t('admin.retail')}
            <input
              value={sellingPrice}
              onChange={(e) => onSellingChange(e.target.value)}
              inputMode="decimal"
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

function roundPct(n: number): number {
  return Math.round(n * 100) / 100
}
