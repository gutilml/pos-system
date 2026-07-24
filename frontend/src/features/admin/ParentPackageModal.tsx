import { useEffect, useState, type FormEvent } from 'react'
import { getProduct, updateProduct } from '@/api/products'
import { useT } from '@/i18n/useT'

type ParentPackageModalProps = {
  open: boolean
  parentId: string | null
  onClose: () => void
  onSaved: () => void | Promise<void>
}

export function ParentPackageModal({
  open,
  parentId,
  onClose,
  onSaved,
}: ParentPackageModalProps) {
  const t = useT()
  const [qty, setQty] = useState('')
  const [unit, setUnit] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open || !parentId) return
    const ac = new AbortController()
    void (async () => {
      try {
        const parent = await getProduct(parentId, ac.signal)
        setName(parent.name)
        setQty(parent.qtyPerPackage != null ? String(parent.qtyPerPackage) : '')
        setUnit(parent.packageUnit ?? parent.unitOfMeasure ?? '')
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : t('admin.loadFailed'))
      }
    })()
    return () => ac.abort()
  }, [open, parentId, t])

  if (!open || !parentId) return null

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const qtyNum = Number(qty)
    if (!Number.isFinite(qtyNum) || qtyNum <= 0 || !unit.trim()) {
      setError(t('admin.parentPackageInvalid'))
      return
    }
    setSaving(true)
    setError(null)
    try {
      const parent = await getProduct(parentId)
      await updateProduct(parentId, {
        name: parent.name,
        description: parent.description ?? null,
        skus: parent.skus ?? [],
        categoryId: parent.categoryIds?.[0] ?? null,
        sellByWeight: parent.sellByWeight === true,
        unitOfMeasure: parent.unitOfMeasure ?? null,
        qtyPerPackage: qtyNum,
        packageUnit: unit.trim(),
        costPrice: parent.costPrice ?? null,
        sellingPrice: parent.sellingPrice,
        wholesalePrice: parent.wholesalePrice ?? 0,
        targetMargin: parent.targetMargin ?? null,
        trackInventory: parent.trackInventory === true,
        currentStock: parent.currentStock ?? null,
        lowStockThreshold: parent.lowStockThreshold ?? null,
        active: parent.active !== false,
      })
      await onSaved()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('admin.saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="parent-package-title"
      data-testid="parent-package-modal"
    >
      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 id="parent-package-title" className="text-lg font-semibold text-slate-900">
          {t('admin.parentPackageTitle')}
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          {t('admin.parentPackageHint')} {name ? `(${name})` : null}
        </p>

        <label className="mt-4 block text-sm font-medium text-slate-700">
          {t('admin.qtyPerPackage')}
          <input
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            inputMode="decimal"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            autoFocus
          />
        </label>
        <label className="mt-3 block text-sm font-medium text-slate-700">
          {t('admin.packageUnit')}
          <input
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

        {error ? (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium"
          >
            {t('footer.cancel')}
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? t('common.loading') : t('admin.save')}
          </button>
        </div>
      </form>
    </div>
  )
}
