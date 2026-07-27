import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  buildReimbursePayload,
  getTransaction,
  listTransactions,
  reimburseTransaction,
  transactionHasCard,
  type ReimburseLineSelection,
  type TransactionItemResponse,
  type TransactionResponse,
} from '@/api/transactions'
import { getErrorStatus } from '@/api/http'
import { useT } from '@/i18n/useT'
import { formatMoney } from '@/lib/money'
import { requestRegisterSearchFocus } from '@/lib/registerSearchFocus'
import { useAuthStore } from '@/store/useAuthStore'

type ClosedTicketsModalProps = {
  open: boolean
  onClose: () => void
}

type View = 'list' | 'detail'

function shortId(id: string): string {
  return id.length > 8 ? id.slice(0, 8) : id
}

function formatTicketWhen(iso: string, locale: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleString(locale === 'es' ? 'es' : 'en', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

type TFn = ReturnType<typeof useT>

function tenderLabel(method: string, t: TFn): string {
  if (method === 'CASH') return t('tender.cash')
  if (method === 'CARD') return t('tender.card')
  if (method === 'CREDIT') return t('tender.credit')
  return method
}

function defaultSelections(items: TransactionItemResponse[]): ReimburseLineSelection[] {
  return items
    .filter((item) => item.returnableQuantity > 0)
    .map((item) => ({
      transactionItemId: item.id,
      quantity: item.returnableQuantity,
      selected: true,
    }))
}

export function ClosedTicketsModal({ open, onClose }: ClosedTicketsModalProps) {
  const t = useT()
  const storeId = useAuthStore((s) => s.user?.storeId)
  const locale = useAuthStore((s) => s.user?.uiLocale ?? 'en')
  const role = useAuthStore((s) => s.user?.role)
  const isCashier = role === 'CASHIER'

  const [view, setView] = useState<View>('list')
  const [tickets, setTickets] = useState<TransactionResponse[]>([])
  const [detail, setDetail] = useState<TransactionResponse | null>(null)
  const [selections, setSelections] = useState<ReimburseLineSelection[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const reset = useCallback(() => {
    setView('list')
    setTickets([])
    setDetail(null)
    setSelections([])
    setLoading(false)
    setSubmitting(false)
    setError(null)
    setSuccess(null)
  }, [])

  const close = useCallback(() => {
    reset()
    onClose()
    requestRegisterSearchFocus()
  }, [onClose, reset])

  useEffect(() => {
    if (!open) return

    let cancelled = false
    setLoading(true)
    setError(null)
    setSuccess(null)
    setView('list')
    setDetail(null)

    void listTransactions(storeId)
      .then((rows) => {
        if (!cancelled) setTickets(rows)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : t('closedTickets.loadFailed'))
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [open, storeId, t])

  const cardBlocked = useMemo(
    () => (detail ? transactionHasCard(detail) : false),
    [detail],
  )

  const canConfirm = useMemo(() => {
    if (!detail || cardBlocked || submitting) return false
    return selections.some((line) => line.selected && line.quantity > 0)
  }, [cardBlocked, detail, selections, submitting])

  async function openDetail(id: string) {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const tx = await getTransaction(id)
      setDetail(tx)
      setSelections(defaultSelections(tx.items))
      setView('detail')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('closedTickets.loadFailed'))
    } finally {
      setLoading(false)
    }
  }

  function updateSelection(
    transactionItemId: string,
    patch: Partial<Pick<ReimburseLineSelection, 'selected' | 'quantity'>>,
  ) {
    setSelections((prev) =>
      prev.map((line) =>
        line.transactionItemId === transactionItemId ? { ...line, ...patch } : line,
      ),
    )
  }

  async function confirmReimburse() {
    if (!detail || !canConfirm) return
    setSubmitting(true)
    setError(null)
    setSuccess(null)
    try {
      const payload = buildReimbursePayload(selections)
      const updated = await reimburseTransaction(detail.id, payload)
      setDetail(updated)
      setSelections(defaultSelections(updated.items))
      setSuccess(t('closedTickets.success'))
      setTickets((prev) => prev.map((row) => (row.id === updated.id ? updated : row)))
    } catch (err: unknown) {
      if (getErrorStatus(err) === 403) {
        setError(t('closedTickets.reimburseForbidden'))
      } else {
        setError(err instanceof Error ? err.message : t('closedTickets.reimburseFailed'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="closed-tickets-title"
      data-testid="closed-tickets-modal"
    >
      <div className="flex max-h-[90dvh] w-full max-w-lg flex-col rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="closed-tickets-title" className="text-lg font-semibold text-slate-900">
              {view === 'list' ? t('closedTickets.title') : t('closedTickets.detailTitle')}
            </h2>
            {view === 'list' ? (
              <p
                className="mt-1 text-xs text-slate-500"
                data-testid="closed-tickets-scope-hint"
              >
                {isCashier ? t('closedTickets.ownHint') : t('closedTickets.allHint')}
              </p>
            ) : null}
          </div>
          {view === 'detail' ? (
            <button
              type="button"
              data-testid="closed-tickets-back"
              onClick={() => {
                setView('list')
                setDetail(null)
                setSelections([])
                setError(null)
                setSuccess(null)
              }}
              className="text-sm font-medium text-emerald-800 underline"
            >
              {t('closedTickets.back')}
            </button>
          ) : null}
        </div>

        {loading ? (
          <p className="mt-6 text-sm text-slate-600" data-testid="closed-tickets-loading">
            {t('closedTickets.loading')}
          </p>
        ) : null}

        {error ? (
          <p className="mt-3 text-sm text-red-600" role="alert" data-testid="closed-tickets-error">
            {error}
          </p>
        ) : null}

        {success ? (
          <p
            className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
            role="status"
            data-testid="closed-tickets-success"
          >
            {success}
          </p>
        ) : null}

        {!loading && view === 'list' ? (
          <ul className="mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto" data-testid="closed-tickets-list">
            {tickets.length === 0 ? (
              <li className="py-8 text-center text-sm text-slate-500">
                {isCashier ? t('closedTickets.emptyOwn') : t('closedTickets.empty')}
              </li>
            ) : (
              tickets.map((tx) => (
                <li key={tx.id}>
                  <button
                    type="button"
                    data-testid={`closed-ticket-row-${tx.id}`}
                    onClick={() => void openDetail(tx.id)}
                    className="flex w-full flex-col gap-1 rounded-xl border border-slate-200 px-3 py-3 text-left hover:border-emerald-500 hover:bg-emerald-50/40 active:bg-emerald-50"
                  >
                    <span className="flex justify-between gap-2 text-sm font-semibold text-slate-900">
                      <span>#{shortId(tx.id)}</span>
                      <span className="tabular-nums">{formatMoney(tx.grandTotal)}</span>
                    </span>
                    <span className="flex justify-between gap-2 text-xs text-slate-600">
                      <span>{formatTicketWhen(tx.createdAt, locale)}</span>
                      <span>{tx.payments.map((p) => tenderLabel(p.paymentMethod, t)).join(' · ')}</span>
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        ) : null}

        {!loading && view === 'detail' && detail ? (
          <div className="mt-4 min-h-0 flex-1 overflow-y-auto" data-testid="closed-ticket-detail">
            <dl className="mb-4 space-y-1 text-sm text-slate-600">
              <div className="flex justify-between gap-2">
                <dt>{t('closedTickets.ticketId')}</dt>
                <dd className="font-mono text-slate-900">{shortId(detail.id)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>{t('footer.total')}</dt>
                <dd className="tabular-nums font-semibold text-slate-900">
                  {formatMoney(detail.grandTotal)}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>{t('closedTickets.payments')}</dt>
                <dd>{detail.payments.map((p) => tenderLabel(p.paymentMethod, t)).join(' · ')}</dd>
              </div>
            </dl>

            {cardBlocked ? (
              <p
                className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950"
                role="status"
                data-testid="closed-tickets-card-blocked"
              >
                {t('closedTickets.cardNotReimbursable')}
              </p>
            ) : null}

            <ul className="space-y-3" data-testid="closed-ticket-lines">
              {detail.items.map((item) => {
                const selection = selections.find((s) => s.transactionItemId === item.id)
                const returnable = item.returnableQuantity > 0
                return (
                  <li
                    key={item.id}
                    className="rounded-xl border border-slate-200 px-3 py-3"
                    data-testid={`closed-ticket-line-${item.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id={`reimburse-line-${item.id}`}
                        data-testid={`reimburse-line-check-${item.id}`}
                        disabled={cardBlocked || !returnable || !selection}
                        checked={selection?.selected ?? false}
                        onChange={(e) =>
                          updateSelection(item.id, { selected: e.target.checked })
                        }
                        className="mt-1 h-4 w-4 accent-emerald-700"
                      />
                      <div className="min-w-0 flex-1">
                        <label
                          htmlFor={`reimburse-line-${item.id}`}
                          className="block text-sm font-medium text-slate-900"
                        >
                          {item.productName?.trim()
                            ? item.productName
                            : `${t('closedTickets.lineProduct')} #${shortId(item.productId)}`}
                        </label>
                        <p className="mt-0.5 text-xs text-slate-600">
                          {t('cart.qty')} {item.quantity} · {formatMoney(item.finalUnitPrice)} ·{' '}
                          {t('closedTickets.returnable')} {item.returnableQuantity}
                          {item.returnedQuantity > 0
                            ? ` · ${t('closedTickets.returned')} ${item.returnedQuantity}`
                            : ''}
                        </p>
                        {selection && returnable && !cardBlocked ? (
                          <label className="mt-2 flex items-center gap-2 text-sm text-slate-700">
                            <span>{t('closedTickets.returnQty')}</span>
                            <input
                              type="number"
                              inputMode="decimal"
                              min={0.0001}
                              max={item.returnableQuantity}
                              step="any"
                              data-testid={`reimburse-line-qty-${item.id}`}
                              value={selection.quantity}
                              disabled={!selection.selected}
                              onChange={(e) => {
                                const next = Number.parseFloat(e.target.value)
                                updateSelection(item.id, {
                                  quantity: Number.isFinite(next) ? next : 0,
                                })
                              }}
                              className="w-24 rounded-lg border border-slate-300 bg-slate-50 px-2 py-1 tabular-nums outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600"
                            />
                          </label>
                        ) : null}
                      </div>
                      <span className="shrink-0 tabular-nums text-sm font-medium text-slate-900">
                        {formatMoney(item.lineTotal)}
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        ) : null}

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={close}
            className="flex-1 rounded-xl border border-slate-300 px-4 py-3 font-medium text-slate-700 active:bg-slate-100"
          >
            {t('footer.cancel')}
          </button>
          {view === 'detail' ? (
            <button
              type="button"
              data-testid="confirm-reimburse"
              disabled={!canConfirm}
              onClick={() => void confirmReimburse()}
              className="flex-1 rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300 active:bg-emerald-800"
            >
              {submitting ? t('closedTickets.reimbursing') : t('closedTickets.reimburse')}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
