import { useCallback, useEffect, useState, type FormEvent } from 'react'
import {
  createStockMovement,
  listInventoryProducts,
  listStockMovements,
  type InventoryProduct,
  type StockMovement,
} from '@/api/inventory'
import { useT } from '@/i18n/useT'
import { roundMoney } from '@/lib/money'
import { sellingPriceFromMargin } from '@/lib/productPricing'
import { selectStoreId, useAuthStore } from '@/store/useAuthStore'

type ModalMode = 'adjust' | 'receive'

export function InventoryWorkspace() {
  const t = useT()
  const storeId = useAuthStore(selectStoreId)
  const enableInventory = useAuthStore((s) => s.user?.enableInventory === true)
  const readOnly = !enableInventory

  const [query, setQuery] = useState('')
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const [rows, setRows] = useState<InventoryProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [modalProduct, setModalProduct] = useState<InventoryProduct | null>(null)
  const [modalMode, setModalMode] = useState<ModalMode>('receive')
  const [qty, setQty] = useState('')
  const [reason, setReason] = useState('')
  const [unitCost, setUnitCost] = useState('')
  const [sellingPrice, setSellingPrice] = useState('')
  const [wholesalePrice, setWholesalePrice] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [history, setHistory] = useState<StockMovement[]>([])

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const next = await listInventoryProducts(storeId, query, lowStockOnly)
      setRows(next)
    } catch (err) {
      setRows([])
      setError(err instanceof Error ? err.message : t('inventory.loadFailed'))
    } finally {
      setLoading(false)
    }
  }, [storeId, query, lowStockOnly, t])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh()
    }, query.trim() ? 250 : 0)
    return () => window.clearTimeout(timer)
  }, [refresh, query])

  async function openModal(product: InventoryProduct, mode: ModalMode) {
    if (readOnly) return
    setModalProduct(product)
    setModalMode(mode)
    setQty('')
    setReason('')
    setUnitCost(String(product.costPrice))
    setSellingPrice(String(product.sellingPrice))
    setWholesalePrice(String(product.wholesalePrice))
    setFormError(null)
    try {
      setHistory(await listStockMovements(product.stockedProductId))
    } catch {
      setHistory([])
    }
  }

  function closeModal() {
    setModalProduct(null)
    setFormError(null)
  }

  function onReceiveUnitCostChange(raw: string) {
    setUnitCost(raw)
    if (!modalProduct || modalMode !== 'receive') return
    const cost = Number(raw)
    if (!Number.isFinite(cost) || cost < 0) return
    const margin = modalProduct.targetMargin
    if (margin != null && margin >= 0 && margin < 1) {
      try {
        setSellingPrice(String(sellingPriceFromMargin(cost, margin)))
      } catch {
        // leave selling while typing invalid margin/cost
      }
    }
    const wholesaleMargin = modalProduct.wholesaleMargin
    if (wholesaleMargin != null && wholesaleMargin >= 0 && wholesaleMargin < 1) {
      try {
        setWholesalePrice(String(sellingPriceFromMargin(cost, wholesaleMargin)))
      } catch {
        // leave wholesale while typing
      }
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!modalProduct || readOnly) return
    const quantity = roundMoney(Number(qty))
    if (modalMode === 'receive' && !(quantity > 0)) {
      setFormError(t('inventory.qtyInvalid'))
      return
    }
    if (modalMode === 'adjust' && quantity === 0) {
      setFormError(t('inventory.qtyInvalid'))
      return
    }
    if (modalMode === 'adjust' && !reason.trim()) {
      setFormError(t('inventory.reasonRequired'))
      return
    }

    setSaving(true)
    setFormError(null)
    try {
      const costNum = unitCost.trim() === '' ? null : roundMoney(Number(unitCost))
      const costChanged =
        modalMode === 'receive' &&
        costNum != null &&
        Math.abs(costNum - Number(modalProduct.costPrice)) > 0.00005

      await createStockMovement({
        storeId,
        productId: modalProduct.productId,
        type: modalMode === 'receive' ? 'RECEIVING' : 'ADJUSTMENT',
        quantity,
        reason: modalMode === 'adjust' ? reason.trim() : null,
        unitCost: modalMode === 'receive' ? costNum : null,
        sellingPrice: costChanged ? roundMoney(Number(sellingPrice)) : null,
        wholesalePrice: costChanged ? roundMoney(Number(wholesalePrice)) : null,
      })
      closeModal()
      await refresh()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t('inventory.saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <section
      className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden bg-white p-4"
      data-testid="inventory-workspace"
      aria-label={t('workspace.inventory')}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-slate-900">{t('workspace.inventory')}</h2>
        {readOnly ? (
          <p className="text-xs text-amber-800" data-testid="inventory-readonly-banner">
            {t('inventory.readonlyBanner')}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[12rem] flex-1">
          <label className="text-sm font-medium text-slate-700" htmlFor="inventory-filter">
            {t('inventory.filter')}
          </label>
          <input
            id="inventory-filter"
            data-testid="inventory-filter"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('inventory.filterPlaceholder')}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            data-testid="inventory-low-stock"
            checked={lowStockOnly}
            onChange={(e) => setLowStockOnly(e.target.checked)}
          />
          {t('inventory.lowStockOnly')}
        </label>
      </div>

      {loading ? <p className="text-sm text-slate-500">{t('common.loading')}</p> : null}
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <ul className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-slate-200" data-testid="inventory-list">
        {rows.map((row) => (
          <li key={row.productId} className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-3 py-2 last:border-b-0">
            <div>
              <p className="font-medium text-slate-900">{row.name}</p>
              <p className="text-xs text-slate-500">
                {row.primarySku ?? t('admin.noBarcode')} · {t('inventory.stock')}:{' '}
                <span className={row.lowStock || row.currentStock < 0 ? 'font-semibold text-amber-700' : ''}>
                  {row.currentStock}
                </span>
                {row.lowStock ? ` · ${t('inventory.lowStock')}` : ''}
              </p>
            </div>
            {!readOnly ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  data-testid={`inventory-adjust-${row.productId}`}
                  onClick={() => void openModal(row, 'adjust')}
                  className="rounded border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700"
                >
                  {t('inventory.adjust')}
                </button>
                <button
                  type="button"
                  data-testid={`inventory-receive-${row.productId}`}
                  onClick={() => void openModal(row, 'receive')}
                  className="rounded bg-emerald-700 px-2 py-1 text-xs font-medium text-white"
                >
                  {t('inventory.receive')}
                </button>
              </div>
            ) : null}
          </li>
        ))}
        {!loading && rows.length === 0 ? (
          <li className="px-3 py-6 text-center text-sm text-slate-500">{t('inventory.none')}</li>
        ) : null}
      </ul>

      {modalProduct ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4"
          role="dialog"
          aria-modal="true"
          data-testid="inventory-movement-modal"
        >
          <form
            onSubmit={(e) => void handleSubmit(e)}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl"
          >
            <h3 className="text-lg font-semibold text-slate-900">
              {modalMode === 'receive' ? t('inventory.receive') : t('inventory.adjust')}: {modalProduct.name}
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              {t('inventory.stock')}: {modalProduct.currentStock}
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-700" htmlFor="inv-qty">
                  {modalMode === 'receive' ? t('inventory.qtyAdd') : t('inventory.qtyDelta')}
                </label>
                <input
                  id="inv-qty"
                  data-testid="inventory-qty"
                  type="number"
                  step="0.0001"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  required
                />
              </div>

              {modalMode === 'adjust' ? (
                <div>
                  <label className="text-sm font-medium text-slate-700" htmlFor="inv-reason">
                    {t('inventory.reason')}
                  </label>
                  <input
                    id="inv-reason"
                    data-testid="inventory-reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    required
                  />
                </div>
              ) : null}

              <div>
                <label className="text-sm font-medium text-slate-700" htmlFor="inv-cost">
                  {t('inventory.unitCost')}
                </label>
                <input
                  id="inv-cost"
                  data-testid="inventory-unit-cost"
                  type="number"
                  step="0.01"
                  value={unitCost}
                  onChange={(e) =>
                    modalMode === 'receive'
                      ? onReceiveUnitCostChange(e.target.value)
                      : setUnitCost(e.target.value)
                  }
                  readOnly={modalMode === 'adjust'}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm read-only:bg-slate-100"
                />
              </div>

              {modalMode === 'receive' ? (
                <>
                  <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="inv-selling">
                      {t('inventory.selling')}
                    </label>
                    <input
                      id="inv-selling"
                      data-testid="inventory-selling"
                      type="number"
                      step="0.01"
                      value={sellingPrice}
                      onChange={(e) => setSellingPrice(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="inv-wholesale">
                      {t('inventory.wholesale')}
                    </label>
                    <input
                      id="inv-wholesale"
                      data-testid="inventory-wholesale"
                      type="number"
                      step="0.01"
                      value={wholesalePrice}
                      onChange={(e) => setWholesalePrice(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                </>
              ) : null}

              {formError ? (
                <p className="text-sm text-red-600" role="alert" data-testid="inventory-form-error">
                  {formError}
                </p>
              ) : null}

              <div className="flex gap-2">
                <button
                  type="submit"
                  data-testid="inventory-save"
                  disabled={saving}
                  className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  {saving ? t('inventory.saving') : t('admin.save')}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
                >
                  {t('footer.cancel')}
                </button>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-900">{t('inventory.history')}</h4>
                <ul className="mt-1 max-h-32 overflow-y-auto rounded border border-slate-200 text-xs" data-testid="inventory-history">
                  {history.map((m) => (
                    <li key={m.id} className="border-b border-slate-100 px-2 py-1 last:border-b-0">
                      {m.type} · {m.quantityDelta} → {m.quantityAfter}
                      {m.reason ? ` · ${m.reason}` : ''}
                    </li>
                  ))}
                  {history.length === 0 ? (
                    <li className="px-2 py-2 text-slate-500">{t('inventory.historyEmpty')}</li>
                  ) : null}
                </ul>
              </div>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  )
}
