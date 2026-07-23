import { formatMoney } from '@/lib/money'
import type { PaymentMethod } from '@/store/useCartStore'

export type SaleTicketLine = {
  name: string
  quantity: number
  lineTotal: number
}

export type SaleTicketPayment = {
  method: PaymentMethod
  amount: number
}

export type SaleTicketPayload = {
  grandTotal: number
  items: SaleTicketLine[]
  payments: SaleTicketPayment[]
  customerName?: string | null
}

type SaleTicketProps = {
  sale: SaleTicketPayload
  onDone: () => void
}

export function SaleTicket({ sale, onDone }: SaleTicketProps) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/70 p-4 print:static print:inset-auto print:bg-white print:p-0"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sale-ticket-title"
      data-testid="sale-ticket"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl print:max-w-none print:rounded-none print:shadow-none">
        <div className="print:block">
          <h2 id="sale-ticket-title" className="text-xl font-semibold text-slate-900">
            Sale Ticket
          </h2>
          {sale.customerName ? (
            <p className="mt-1 text-sm text-slate-600">Customer: {sale.customerName}</p>
          ) : null}

          <ul className="mt-4 space-y-2 border-b border-slate-200 pb-3 text-sm">
            {sale.items.map((line, index) => (
              <li key={`${line.name}-${index}`} className="flex justify-between gap-3">
                <span>
                  {line.name}{' '}
                  <span className="tabular-nums text-slate-500">×{line.quantity}</span>
                </span>
                <span className="tabular-nums font-medium">{formatMoney(line.lineTotal)}</span>
              </li>
            ))}
          </ul>

          <dl className="mt-3 space-y-1 text-sm text-slate-700">
            {sale.payments.map((payment, index) => (
              <div key={`${payment.method}-${index}`} className="flex justify-between gap-4">
                <dt>{payment.method}</dt>
                <dd className="tabular-nums text-slate-900">{formatMoney(payment.amount)}</dd>
              </div>
            ))}
            <div className="flex justify-between gap-4 border-t border-slate-200 pt-2 text-base font-semibold text-slate-900">
              <dt>Total</dt>
              <dd className="tabular-nums" data-testid="sale-ticket-total">
                {formatMoney(sale.grandTotal)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-6 flex gap-2 print:hidden">
          <button
            type="button"
            data-testid="print-sale-ticket"
            onClick={() => window.print()}
            className="flex-1 rounded-xl border border-slate-300 px-4 py-3 font-medium text-slate-700 active:bg-slate-100"
          >
            Print
          </button>
          <button
            type="button"
            data-testid="dismiss-sale-ticket"
            onClick={onDone}
            className="flex-[2] rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white active:bg-emerald-800"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
