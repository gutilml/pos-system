import { useState } from 'react'
import { CustomerSearch } from '@/components/checkout/CustomerSearch'
import { useT } from '@/i18n/useT'
import { formatMoney } from '@/lib/money'
import { requestRegisterSearchFocus } from '@/lib/registerSearchFocus'
import {
  selectActiveCustomer,
  selectAvailableCredit,
  useCartStore,
} from '@/store/useCartStore'

export function AssignCustomerControl() {
  const t = useT()
  const customer = useCartStore(selectActiveCustomer)
  const setCustomer = useCartStore((s) => s.setCustomer)
  const [open, setOpen] = useState(false)

  function close() {
    setOpen(false)
    requestRegisterSearchFocus()
  }

  return (
    <>
      <div className="flex items-center gap-2" data-testid="assign-customer-control">
        {customer ? (
          <p className="hidden max-w-[12rem] truncate text-sm text-slate-200 sm:block" data-testid="header-customer">
            {customer.name}
          </p>
        ) : null}
        <button
          type="button"
          data-testid="open-assign-customer"
          onClick={() => setOpen(true)}
          className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
        >
          {customer ? t('customer.change') : t('footer.customer')}
        </button>
      </div>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="assign-customer-title"
          data-testid="assign-customer-modal"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h2 id="assign-customer-title" className="text-lg font-semibold text-slate-900">
              {t('customer.assignTitle')}
            </h2>
            <p className="mt-1 text-sm text-slate-600">{t('customer.assignHint')}</p>

            {customer ? (
              <div
                className="mt-4 flex items-start justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2"
                data-testid="assign-modal-current-customer"
              >
                <div>
                  <p className="font-medium text-emerald-950">{customer.name}</p>
                  <p className="text-xs text-emerald-800">
                    {t('customer.availableCredit')} {formatMoney(selectAvailableCredit(customer))}
                  </p>
                </div>
                <button
                  type="button"
                  data-testid="clear-assigned-customer"
                  onClick={() => {
                    setCustomer(null)
                    close()
                  }}
                  className="text-xs font-medium text-emerald-900 underline"
                >
                  {t('footer.clear')}
                </button>
              </div>
            ) : null}

            <div className="mt-4">
              <CustomerSearch
                autoFocus
                onSelect={(next) => {
                  setCustomer(next)
                  close()
                }}
              />
            </div>

            <button
              type="button"
              onClick={close}
              className="mt-4 w-full rounded-xl border border-slate-300 px-4 py-3 font-medium text-slate-700 active:bg-slate-100"
            >
              {t('footer.cancel')}
            </button>
          </div>
        </div>
      ) : null}
    </>
  )
}
