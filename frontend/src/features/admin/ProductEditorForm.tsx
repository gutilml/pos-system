import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  createProduct,
  getProduct,
  listProducts,
  updateProduct,
  type ProductApi,
  type ProductRequestBody,
} from '@/api/products'
import { createCategory, listCategories, type CategoryApi } from '@/api/categories'
import { useT } from '@/i18n/useT'
import type { MessageKey } from '@/i18n/messages'
import {
  childCostFromParentPreview,
  isParentPackageIncompleteError,
  marginFromCostAndPrice,
  sellingPriceFromMargin,
} from '@/lib/productPricing'
import { ParentPackageModal } from '@/features/admin/ParentPackageModal'
import { SearchableSelect } from '@/features/admin/SearchableSelect'
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

/** Fixed package-unit codes for chip picker (Feature 074 / 076). */
export const PACKAGE_UNIT_CODES = ['pc', 'kg', 'g', 'lb', 'L', 'ml'] as const

export type PackageUnitCode = (typeof PACKAGE_UNIT_CODES)[number]

const UNIT_LABEL_KEYS: Record<PackageUnitCode, MessageKey> = {
  pc: 'admin.unit.pc',
  kg: 'admin.unit.kg',
  g: 'admin.unit.g',
  lb: 'admin.unit.lb',
  L: 'admin.unit.L',
  ml: 'admin.unit.ml',
}

export function normalizePackageUnit(raw: string | null | undefined): string {
  if (!raw) return ''
  const trimmed = raw.trim()
  const match = PACKAGE_UNIT_CODES.find((c) => c.toLowerCase() === trimmed.toLowerCase())
  if (match) return match
  // Spanish chip label sometimes stored as pza → pc (Feature 098)
  if (trimmed.toLowerCase() === 'pza') return 'pc'
  return ''
}

/** Parent package unit is piece/count pc (Feature 098). */
export function isPiecePackageUnit(raw: string | null | undefined): boolean {
  return normalizePackageUnit(raw) === 'pc'
}

function roundPct(n: number): number {
  return Math.round(n * 100) / 100
}

function UnitChips({
  name,
  value,
  onChange,
  testId,
  legend,
}: {
  name: string
  value: string
  onChange: (code: string) => void
  testId: string
  legend: string
}) {
  const t = useT()
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-slate-700">{legend}</legend>
      <div className="flex flex-wrap gap-2" data-testid={testId}>
        {PACKAGE_UNIT_CODES.map((code) => (
          <label
            key={code}
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm ${
              value === code
                ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                : 'border-slate-300 text-slate-800'
            }`}
          >
            <input
              type="radio"
              name={name}
              value={code}
              checked={value === code}
              onChange={() => onChange(code)}
              data-testid={`${testId}-${code}`}
              className="sr-only"
            />
            {t(UNIT_LABEL_KEYS[code])}
          </label>
        ))}
      </div>
    </fieldset>
  )
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
  const [unitOfMeasure, setUnitOfMeasure] = useState('')
  const [costPrice, setCostPrice] = useState('')
  const [targetMarginPct, setTargetMarginPct] = useState('')
  const [sellingPrice, setSellingPrice] = useState('')
  const [wholesalePrice, setWholesalePrice] = useState('0')
  const [trackInventory, setTrackInventory] = useState(false)
  const [currentStock, setCurrentStock] = useState('')
  const [lowStockThreshold, setLowStockThreshold] = useState('')
  const [active, setActive] = useState(true)
  const [costReadOnly, setCostReadOnly] = useState(false)

  const [addingCategory, setAddingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryMarginPct, setNewCategoryMarginPct] = useState('30')
  const [categoryCreateError, setCategoryCreateError] = useState<string | null>(null)
  const [creatingCategory, setCreatingCategory] = useState(false)

  const [parentFixId, setParentFixId] = useState<string | null>(null)
  const [pendingRetry, setPendingRetry] = useState(false)

  const categoryOptions = useMemo(
    () =>
      categories.map((c) => ({
        id: c.id,
        label: `${c.name} (${roundPct(c.targetMargin * 100)}%)`,
        searchText: c.name,
      })),
    [categories],
  )

  const parentOptions = useMemo(
    () =>
      parents
        .filter((p) => p.id !== productId)
        .map((p) => ({
          id: p.id,
          label: p.name,
          searchText: `${p.name} ${p.primarySku ?? p.sku ?? ''} ${(p.skus ?? []).join(' ')}`,
        })),
    [parents, productId],
  )

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

  function applyDerivedCostFromParent(
    parentId: string,
    childUnit: string,
    marginPctRaw: string,
  ) {
    const parent = parents.find((p) => p.id === parentId)
    if (!parent) return
    const qty = parent.qtyPerPackage
    const parentCost = parent.costPrice
    if (qty == null || parentCost == null) return
    const parentUnit = parent.packageUnit ?? parent.unitOfMeasure ?? ''
    const derived = childCostFromParentPreview(parentCost, qty, parentUnit, childUnit || parentUnit)
    if (derived == null) return
    const costRaw = String(derived)
    setCostPrice(costRaw)
    recalcSellingFromCostAndMargin(costRaw, marginPctRaw)
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

  function onParentChange(nextId: string) {
    setParentProductId(nextId)
    setCostReadOnly(Boolean(nextId))
    if (!nextId) {
      setCostReadOnly(false)
      return
    }
    setTrackInventory(false)
    setCurrentStock('')
    setLowStockThreshold('')
    const parent = parents.find((p) => p.id === nextId)
    if (!parent) return

    let marginForCost = targetMarginPct
    const parentCat = parent.categoryIds?.[0]
    if (parentCat) {
      setCategoryId(parentCat)
      const cat = categories.find((c) => c.id === parentCat)
      if (cat) {
        marginForCost = String(roundPct(cat.targetMargin * 100))
        setTargetMarginPct(marginForCost)
      }
    }

    const parentPc = isPiecePackageUnit(parent.packageUnit ?? parent.unitOfMeasure)
    let nextUom = unitOfMeasure
    if (parentPc) {
      setSellByWeight(false)
      nextUom = ''
      setUnitOfMeasure('')
    } else if (sellByWeight) {
      const pref = normalizePackageUnit(parent.packageUnit ?? parent.unitOfMeasure)
      if (pref) {
        nextUom = pref
        setUnitOfMeasure(pref)
      }
    }
    applyDerivedCostFromParent(nextId, nextUom || packageUnit, marginForCost)
  }

  function onSellByWeightChange(checked: boolean) {
    if (checked && parentProductId) {
      const parent = parents.find((p) => p.id === parentProductId)
      if (parent && isPiecePackageUnit(parent.packageUnit ?? parent.unitOfMeasure)) {
        return
      }
    }
    setSellByWeight(checked)
    if (checked && parentProductId) {
      const parent = parents.find((p) => p.id === parentProductId)
      if (parent) {
        const pref = normalizePackageUnit(parent.packageUnit ?? parent.unitOfMeasure)
        if (pref) setUnitOfMeasure(pref)
      }
    }
  }

  const selectedParent = parents.find((p) => p.id === parentProductId)
  const parentBlocksWeight = Boolean(
    selectedParent && isPiecePackageUnit(selectedParent.packageUnit ?? selectedParent.unitOfMeasure),
  )

  function onUnitOfMeasureChange(code: string) {
    setUnitOfMeasure(code)
    if (parentProductId) {
      applyDerivedCostFromParent(parentProductId, code, targetMarginPct)
    }
  }

  function onCostChange(raw: string) {
    setCostPrice(raw)
    recalcSellingFromCostAndMargin(raw, targetMarginPct)
  }

  useEffect(() => {
    const ac = new AbortController()
    let activeLoad = true
    setLoading(Boolean(productId))
    setError(null)

    void (async () => {
      try {
        const [cats, products] = await Promise.all([
          listCategories(ac.signal),
          listProducts(ac.signal),
        ])
        if (!activeLoad || ac.signal.aborted) return
        setCategories(cats)
        setParents(products)
        if (productId) {
          const p = await getProduct(productId, ac.signal)
          if (!activeLoad || ac.signal.aborted) return
          setName(p.name)
          setDescription(p.description ?? '')
          setSkusText((p.skus ?? []).join('\n'))
          setCategoryId(p.categoryIds?.[0] ?? '')
          setParentProductId(p.parentProductId ?? '')
          const linkedParent = p.parentProductId
            ? products.find((x) => x.id === p.parentProductId)
            : undefined
          const blockWeight =
            linkedParent != null &&
            isPiecePackageUnit(linkedParent.packageUnit ?? linkedParent.unitOfMeasure)
          setSellByWeight(blockWeight ? false : p.sellByWeight === true)
          setQtyPerPackage(
            p.qtyPerPackage != null && Number.isFinite(Number(p.qtyPerPackage))
              ? String(p.qtyPerPackage)
              : '',
          )
          setPackageUnit(normalizePackageUnit(p.packageUnit))
          setUnitOfMeasure(normalizePackageUnit(p.unitOfMeasure ?? p.packageUnit))
          setCostPrice(p.costPrice != null ? String(p.costPrice) : '')
          setCostReadOnly(Boolean(p.parentProductId))
          setTargetMarginPct(
            p.targetMargin != null ? String(roundPct(p.targetMargin * 100)) : '',
          )
          setSellingPrice(String(p.sellingPrice))
          setWholesalePrice(p.wholesalePrice != null ? String(p.wholesalePrice) : '0')
          setTrackInventory(p.parentProductId ? false : p.trackInventory === true)
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
          setUnitOfMeasure('')
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
        setAddingCategory(false)
        setError(null)
      } catch (err) {
        if (!activeLoad || ac.signal.aborted || isAbortError(err)) return
        setError(err instanceof Error ? err.message : 'Failed to load catalog')
      } finally {
        if (activeLoad && !ac.signal.aborted) {
          setLoading(false)
        }
      }
    })()
    return () => {
      activeLoad = false
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

  async function handleCreateCategory(e: FormEvent) {
    e.preventDefault()
    const margin = Number(newCategoryMarginPct) / 100
    if (!newCategoryName.trim() || !Number.isFinite(margin) || margin < 0 || margin >= 1) {
      setCategoryCreateError(t('admin.categoryInvalid'))
      return
    }
    setCreatingCategory(true)
    setCategoryCreateError(null)
    try {
      const created = await createCategory({
        name: newCategoryName.trim(),
        targetMargin: margin,
      })
      setCategories((prev) => [...prev, created])
      setAddingCategory(false)
      setNewCategoryName('')
      setNewCategoryMarginPct('30')
      const pct = String(roundPct(created.targetMargin * 100))
      setCategoryId(created.id)
      setTargetMarginPct(pct)
      recalcSellingFromCostAndMargin(costPrice, pct)
    } catch (err) {
      setCategoryCreateError(err instanceof Error ? err.message : t('admin.saveFailed'))
    } finally {
      setCreatingCategory(false)
    }
  }

  function buildBody(): ProductRequestBody {
    const marginPct = numOrNull(targetMarginPct)
    const hasParent = Boolean(parentProductId)
    const track = enableInventory && !hasParent && trackInventory
    return {
      name: name.trim(),
      description: description.trim() || null,
      skus: parseSkus(skusText),
      categoryId: categoryId || null,
      sellByWeight,
      unitOfMeasure: sellByWeight ? unitOfMeasure.trim() || null : null,
      parentProductId: parentProductId || null,
      qtyPerPackage: hasParent ? null : numOrNull(qtyPerPackage),
      packageUnit: hasParent ? null : packageUnit.trim() || null,
      costPrice: costReadOnly ? null : numOrNull(costPrice),
      targetMargin: marginPct != null ? marginPct / 100 : null,
      sellingPrice: numOrNull(sellingPrice),
      wholesalePrice: numOrNull(wholesalePrice) ?? 0,
      trackInventory: track,
      currentStock: track ? numOrNull(currentStock) : null,
      lowStockThreshold: track ? numOrNull(lowStockThreshold) : null,
      active,
    }
  }

  async function persist() {
    if (parentBlocksWeight && sellByWeight) {
      setError(t('admin.parentPcNoWeight'))
      return
    }
    if (sellByWeight && !unitOfMeasure.trim()) {
      setError(t('admin.unitOfMeasureRequired'))
      return
    }
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

        <SearchableSelect
          label={t('admin.parentProduct')}
          value={parentProductId}
          options={parentOptions}
          noneLabel={t('admin.none')}
          searchPlaceholder={t('admin.searchParent')}
          testId="product-parent"
          onChange={onParentChange}
        />

        {addingCategory ? (
          <div
            className="space-y-2 rounded-lg border border-emerald-200 bg-emerald-50/50 p-3"
            data-testid="inline-category-create"
          >
            <p className="text-sm font-semibold text-slate-800">{t('admin.addCategory')}</p>
            <label className="block text-sm font-medium text-slate-700">
              {t('admin.categoryName')}
              <input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                data-testid="inline-category-name"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              {t('admin.marginPct')}
              <input
                value={newCategoryMarginPct}
                onChange={(e) => setNewCategoryMarginPct(e.target.value)}
                inputMode="decimal"
                data-testid="inline-category-margin"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>
            {categoryCreateError ? (
              <p className="text-sm text-red-600" role="alert">
                {categoryCreateError}
              </p>
            ) : null}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setAddingCategory(false)
                  setCategoryCreateError(null)
                }}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
              >
                {t('footer.cancel')}
              </button>
              <button
                type="button"
                data-testid="inline-category-save"
                disabled={creatingCategory}
                onClick={(e) => void handleCreateCategory(e)}
                className="rounded-lg bg-emerald-700 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
              >
                {creatingCategory ? t('common.loading') : t('admin.save')}
              </button>
            </div>
          </div>
        ) : (
          <SearchableSelect
            label={t('admin.category')}
            value={categoryId}
            options={categoryOptions}
            noneLabel={t('admin.none')}
            searchPlaceholder={t('admin.searchCategory')}
            testId="product-category"
            onChange={onCategoryChange}
            actionLabel={t('admin.addCategoryOption')}
            actionTestId="category-add-option"
            onAction={() => {
              setAddingCategory(true)
              setNewCategoryName('')
              setNewCategoryMarginPct('30')
              setCategoryCreateError(null)
            }}
          />
        )}

        <div className="flex flex-wrap gap-4 text-sm">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={sellByWeight}
              disabled={parentBlocksWeight}
              onChange={(e) => onSellByWeightChange(e.target.checked)}
              data-testid="product-sell-by-weight"
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
            <UnitChips
              name="package-unit"
              value={packageUnit}
              onChange={setPackageUnit}
              testId="package-unit-chips"
              legend={t('admin.packageUnit')}
            />
          </div>
        ) : null}

        {sellByWeight ? (
          <UnitChips
            name="sell-unit"
            value={unitOfMeasure}
            onChange={onUnitOfMeasureChange}
            testId="unit-of-measure-chips"
            legend={t('admin.unitOfMeasure')}
          />
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
                disabled={Boolean(parentProductId)}
                onChange={(e) => setTrackInventory(e.target.checked)}
                data-testid="product-track-inventory"
              />
              {t('admin.trackInventory')}
            </label>
            {trackInventory && !parentProductId ? (
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
          <p className="text-sm text-red-600" role="alert" data-testid="product-editor-error">
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
            data-testid="product-save"
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
