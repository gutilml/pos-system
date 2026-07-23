import type { Shift } from '@/api/shifts'
import { useT } from '@/i18n/useT'
import type { MessageKey } from '@/i18n/messages'
import { formatMoney } from '@/lib/money'
import { useShiftStore } from '@/store/useShiftStore'

type ShiftCloseTicketProps = {
  shift: Shift
}

function discrepancyKey(discrepancy: number): MessageKey {
  if (discrepancy > 0) return 'shiftTicket.overage'
  if (discrepancy < 0) return 'shiftTicket.shortage'
  return 'shiftTicket.balanced'
}

function formatTimestamp(value: string | null): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

function moneyOrDash(value: number | null | undefined): string {
  if (value == null) return '—'
  return formatMoney(value)
}

export function ShiftCloseTicket({ shift }: ShiftCloseTicketProps) {
  const t = useT()
  const clearLastClosedShift = useShiftStore((s) => s.clearLastClosedShift)

  const expected = shift.expectedCash ?? 0
  const actual = shift.actualCash ?? 0
  const discrepancy = shift.discrepancy ?? 0
  const shortId = shift.id.length > 8 ? shift.id.slice(0, 8) : shift.id

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 print:static print:inset-auto print:bg-white print:p-0"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shift-close-ticket-title"
      data-testid="shift-close-ticket"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl print:max-w-none print:rounded-none print:shadow-none">
        <div className="print:block">
          <h2
            id="shift-close-ticket-title"
            className="text-xl font-semibold text-slate-900"
          >
            {t('shiftTicket.title')}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {t('shiftTicket.shift')} <span className="font-mono tabular-nums">{shortId}</span>
          </p>

          <dl className="mt-5 space-y-2 text-sm text-slate-700">
            <div className="flex justify-between gap-4">
              <dt>{t('shiftTicket.opened')}</dt>
              <dd className="tabular-nums text-slate-900" data-testid="ticket-opened-at">
                {formatTimestamp(shift.openedAt)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>{t('shiftTicket.closed')}</dt>
              <dd className="tabular-nums text-slate-900" data-testid="ticket-closed-at">
                {formatTimestamp(shift.closedAt)}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-slate-200 pt-3">
              <dt>{t('shiftTicket.expectedCash')}</dt>
              <dd className="tabular-nums font-medium text-slate-900" data-testid="ticket-expected-cash">
                {formatMoney(expected)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>{t('shiftTicket.countedCash')}</dt>
              <dd className="tabular-nums font-medium text-slate-900" data-testid="ticket-actual-cash">
                {formatMoney(actual)}
              </dd>
            </div>
            <div className="flex justify-between gap-4 text-base font-semibold text-slate-900">
              <dt>
                {t('shiftTicket.discrepancy')}
                <span className="ml-2 text-sm font-medium text-slate-600" data-testid="ticket-discrepancy-label">
                  ({t(discrepancyKey(discrepancy))})
                </span>
              </dt>
              <dd className="tabular-nums" data-testid="ticket-discrepancy">
                {formatMoney(discrepancy)}
              </dd>
            </div>

            <div className="border-t border-slate-200 pt-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t('shiftTicket.salesSummary')}
              </p>
              <div className="flex justify-between gap-4">
                <dt>{t('shiftTicket.cashPayments')}</dt>
                <dd className="tabular-nums text-slate-900" data-testid="ticket-total-cash">
                  {moneyOrDash(shift.totalCashPayments)}
                </dd>
              </div>
              <div className="mt-2 flex justify-between gap-4">
                <dt>{t('shiftTicket.card')}</dt>
                <dd className="tabular-nums text-slate-900" data-testid="ticket-total-card">
                  {moneyOrDash(shift.totalCardPayments)}
                </dd>
              </div>
              <div className="mt-2 flex justify-between gap-4">
                <dt>{t('shiftTicket.credit')}</dt>
                <dd className="tabular-nums text-slate-900" data-testid="ticket-total-credit">
                  {moneyOrDash(shift.totalCreditPayments)}
                </dd>
              </div>
              <div className="mt-2 flex justify-between gap-4">
                <dt>{t('shiftTicket.salesGrandTotal')}</dt>
                <dd className="tabular-nums text-slate-900" data-testid="ticket-sales-grand-total">
                  {moneyOrDash(shift.totalSalesGrandTotal)}
                </dd>
              </div>
            </div>
          </dl>
        </div>

        <div className="mt-6 flex gap-2 print:hidden">
          <button
            type="button"
            data-testid="print-close-ticket"
            onClick={() => window.print()}
            className="flex-1 rounded-xl border border-slate-300 px-4 py-3 font-medium text-slate-700 active:bg-slate-100"
          >
            {t('common.print')}
          </button>
          <button
            type="button"
            data-testid="dismiss-close-ticket"
            onClick={() => clearLastClosedShift()}
            className="flex-[2] rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white active:bg-emerald-800"
          >
            {t('common.done')}
          </button>
        </div>
      </div>
    </div>
  )
}
