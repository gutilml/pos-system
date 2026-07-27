import { useCallback, useEffect, useState, type ReactNode } from 'react'
import {
  getShiftDetail,
  listShifts,
  type CashDrawerEvent,
  type Shift,
  type ShiftDetail,
} from '@/api/shifts'
import { useT } from '@/i18n/useT'
import { formatMoney } from '@/lib/money'
import { requestRegisterSearchFocus } from '@/lib/registerSearchFocus'
import { useAuthStore } from '@/store/useAuthStore'

type ShiftHistoryModalProps = {
  open: boolean
  onClose: () => void
}

type View = 'list' | 'detail'

function shortId(id: string): string {
  return id.length > 8 ? id.slice(0, 8) : id
}

function formatWhen(iso: string | null, locale: string): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleString(locale === 'es' ? 'es' : 'en', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

function moneyOrDash(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return '—'
  return formatMoney(value)
}

export function ShiftHistoryModal({ open, onClose }: ShiftHistoryModalProps) {
  const t = useT()
  const storeId = useAuthStore((s) => s.user?.storeId)
  const locale = useAuthStore((s) => s.user?.uiLocale ?? 'en')

  const [view, setView] = useState<View>('list')
  const [shifts, setShifts] = useState<Shift[]>([])
  const [detail, setDetail] = useState<ShiftDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setView('list')
    setShifts([])
    setDetail(null)
    setLoading(false)
    setError(null)
  }, [])

  const close = useCallback(() => {
    reset()
    onClose()
    requestRegisterSearchFocus()
  }, [onClose, reset])

  useEffect(() => {
    if (!open || !storeId) return

    let cancelled = false
    setLoading(true)
    setError(null)
    setView('list')
    setDetail(null)

    void listShifts(storeId)
      .then((rows) => {
        if (!cancelled) setShifts(rows)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : t('shiftHistory.loadFailed'))
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [open, storeId, t])

  async function openDetail(id: string) {
    setLoading(true)
    setError(null)
    try {
      const row = await getShiftDetail(id)
      setDetail(row)
      setView('detail')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('shiftHistory.loadFailed'))
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shift-history-title"
      data-testid="shift-history-modal"
    >
      <div className="flex max-h-[90dvh] w-full max-w-lg flex-col rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <h2 id="shift-history-title" className="text-lg font-semibold text-slate-900">
            {view === 'list' ? t('shiftHistory.title') : t('shiftHistory.detailTitle')}
          </h2>
          {view === 'detail' ? (
            <button
              type="button"
              data-testid="shift-history-back"
              onClick={() => {
                setView('list')
                setDetail(null)
                setError(null)
              }}
              className="text-sm font-medium text-emerald-800 underline"
            >
              {t('shiftHistory.back')}
            </button>
          ) : null}
        </div>

        {loading ? (
          <p className="mt-6 text-sm text-slate-600" data-testid="shift-history-loading">
            {t('shiftHistory.loading')}
          </p>
        ) : null}

        {error ? (
          <p className="mt-3 text-sm text-red-600" role="alert" data-testid="shift-history-error">
            {error}
          </p>
        ) : null}

        {!loading && view === 'list' ? (
          <ul className="mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto" data-testid="shift-history-list">
            {shifts.length === 0 ? (
              <li className="py-8 text-center text-sm text-slate-500">{t('shiftHistory.empty')}</li>
            ) : (
              shifts.map((shift) => (
                <li key={shift.id}>
                  <button
                    type="button"
                    data-testid={`shift-history-row-${shift.id}`}
                    onClick={() => void openDetail(shift.id)}
                    className="flex w-full flex-col gap-1 rounded-xl border border-slate-200 px-3 py-3 text-left hover:border-emerald-500 hover:bg-emerald-50/40 active:bg-emerald-50"
                  >
                    <span className="flex justify-between gap-2 text-sm font-semibold text-slate-900">
                      <span>#{shortId(shift.id)}</span>
                      <span>
                        {shift.status === 'OPEN'
                          ? t('shiftHistory.statusOpen')
                          : t('shiftHistory.statusClosed')}
                      </span>
                    </span>
                    <span className="flex justify-between gap-2 text-xs text-slate-600">
                      <span>{formatWhen(shift.openedAt, locale)}</span>
                      <span className="tabular-nums">
                        {t('shiftHistory.startingCash')} {formatMoney(shift.startingCash)}
                      </span>
                    </span>
                    {shift.status === 'CLOSED' ? (
                      <span className="flex justify-between gap-2 text-xs text-slate-600">
                        <span>
                          {t('shiftHistory.expectedCash')} {moneyOrDash(shift.expectedCash)}
                        </span>
                        <span>
                          {t('shiftHistory.actualCash')} {moneyOrDash(shift.actualCash)}
                        </span>
                      </span>
                    ) : null}
                  </button>
                </li>
              ))
            )}
          </ul>
        ) : null}

        {!loading && view === 'detail' && detail ? (
          <div className="mt-4 min-h-0 flex-1 overflow-y-auto" data-testid="shift-history-detail">
            <dl className="mb-4 space-y-1 text-sm text-slate-600">
              <DetailRow label={t('shiftHistory.status')}>
                {detail.status === 'OPEN'
                  ? t('shiftHistory.statusOpen')
                  : t('shiftHistory.statusClosed')}
              </DetailRow>
              <DetailRow label={t('shiftHistory.openedAt')}>
                {formatWhen(detail.openedAt, locale)}
              </DetailRow>
              <DetailRow label={t('shiftHistory.openedBy')}>
                <span data-testid="shift-history-opened-by">
                  {detail.openedByUsername?.trim() ? detail.openedByUsername : '—'}
                </span>
              </DetailRow>
              <DetailRow label={t('shiftHistory.closedAt')}>
                {formatWhen(detail.closedAt, locale)}
              </DetailRow>
              <DetailRow label={t('shiftHistory.closedBy')}>
                <span data-testid="shift-history-closed-by">
                  {detail.closedByUsername?.trim() ? detail.closedByUsername : '—'}
                </span>
              </DetailRow>
              <DetailRow label={t('shiftHistory.startingCash')}>
                {formatMoney(detail.startingCash)}
              </DetailRow>
              <DetailRow label={t('shiftHistory.expectedCash')}>
                {moneyOrDash(detail.expectedCash)}
              </DetailRow>
              <DetailRow label={t('shiftHistory.actualCash')}>
                {moneyOrDash(detail.actualCash)}
              </DetailRow>
              <DetailRow label={t('shiftHistory.discrepancy')}>
                {moneyOrDash(detail.discrepancy)}
              </DetailRow>
              {detail.totalCashPayments != null ? (
                <DetailRow label={t('shiftHistory.totalCash')}>
                  {formatMoney(detail.totalCashPayments)}
                </DetailRow>
              ) : null}
              {detail.totalCardPayments != null ? (
                <DetailRow label={t('shiftHistory.totalCard')}>
                  {formatMoney(detail.totalCardPayments)}
                </DetailRow>
              ) : null}
              {detail.totalCreditPayments != null ? (
                <DetailRow label={t('shiftHistory.totalCredit')}>
                  {formatMoney(detail.totalCreditPayments)}
                </DetailRow>
              ) : null}
              {detail.totalSalesGrandTotal != null ? (
                <DetailRow label={t('shiftHistory.totalSales')}>
                  {formatMoney(detail.totalSalesGrandTotal)}
                </DetailRow>
              ) : null}
            </dl>

            <h3 className="mb-2 text-sm font-semibold text-slate-900">{t('shiftHistory.events')}</h3>
            <EventsList events={detail.events} locale={locale} emptyLabel={t('shiftHistory.noEvents')} />
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
        </div>
      </div>
    </div>
  )
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex justify-between gap-2">
      <dt>{label}</dt>
      <dd className="tabular-nums font-medium text-slate-900">{children}</dd>
    </div>
  )
}

function EventsList({
  events,
  locale,
  emptyLabel,
}: {
  events: CashDrawerEvent[]
  locale: string
  emptyLabel: string
}) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-slate-500" data-testid="shift-history-no-events">
        {emptyLabel}
      </p>
    )
  }

  return (
    <ul className="space-y-2" data-testid="shift-history-events">
      {events.map((event) => (
        <li
          key={event.id}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          data-testid={`shift-history-event-${event.id}`}
        >
          <div className="flex justify-between gap-2 font-medium text-slate-900">
            <span>{event.type === 'PAY_IN' ? 'PAY IN' : 'PAY OUT'}</span>
            <span className="tabular-nums">{formatMoney(event.amount)}</span>
          </div>
          <p className="mt-0.5 text-xs text-slate-600">{event.reason}</p>
          <p className="mt-0.5 text-xs text-slate-500">{formatWhen(event.createdAt, locale)}</p>
        </li>
      ))}
    </ul>
  )
}
