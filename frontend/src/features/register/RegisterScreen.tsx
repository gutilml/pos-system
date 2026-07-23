import { useEffect } from 'react'
import { AuthGate } from '@/components/auth/AuthGate'
import { AssignCustomerControl } from '@/components/register/AssignCustomerControl'
import { CartItemRow, CartListHeader } from '@/components/register/CartItemRow'
import { CheckoutFooter } from '@/components/register/CheckoutFooter'
import { SearchBar } from '@/components/register/SearchBar'
import { TicketTabs } from '@/components/register/TicketTabs'
import { WeightModal } from '@/components/register/WeightModal'
import { CashierMenu } from '@/components/shift/CashierMenu'
import { ShiftGate } from '@/components/shift/ShiftGate'
import { requestRegisterSearchFocus } from '@/lib/registerSearchFocus'
import { useAuthStore } from '@/store/useAuthStore'
import { useT } from '@/i18n/useT'
import { selectActiveItems, useCartStore } from '@/store/useCartStore'

export function RegisterScreen() {
  const t = useT()
  const items = useCartStore(selectActiveItems)
  const pendingWeight = useCartStore((s) => s.pendingWeightProduct)
  const showStock = useAuthStore((s) => s.user?.enableInventory === true)

  useEffect(() => {
    if (!pendingWeight) {
      requestRegisterSearchFocus()
    }
  }, [pendingWeight])

  return (
    <AuthGate>
      <ShiftGate>
        <div className="flex h-dvh max-h-dvh flex-col bg-slate-100 text-slate-900">
          <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-slate-900 px-4 py-3 text-white">
            <h1 className="text-lg font-semibold tracking-tight">{t('register.title')}</h1>
            <div className="flex items-center gap-2">
              <AssignCustomerControl />
              <CashierMenu />
            </div>
          </header>

          <TicketTabs />
          <SearchBar />

          <section className="min-h-0 flex-1 overflow-y-auto bg-white" aria-label="Cart items">
            {items.length === 0 ? (
              <p className="px-4 py-10 text-center text-slate-500">{t('register.emptyCart')}</p>
            ) : (
              <>
                <CartListHeader showStock={showStock} />
                <ul>
                  {items.map((item) => (
                    <CartItemRow key={item.productId} item={item} showStock={showStock} />
                  ))}
                </ul>
              </>
            )}
          </section>

          <CheckoutFooter />
          <WeightModal />
        </div>
      </ShiftGate>
    </AuthGate>
  )
}
