import { useEffect, useMemo, useState } from 'react'
import { AuthGate } from '@/components/auth/AuthGate'
import { CartItemRow, CartListHeader, formatCartStockDisplay } from '@/components/register/CartItemRow'
import { CheckoutFooter } from '@/components/register/CheckoutFooter'
import { SearchBar } from '@/components/register/SearchBar'
import { TicketTabs } from '@/components/register/TicketTabs'
import { WorkspaceNav } from '@/components/register/WorkspaceNav'
import { WeightModal } from '@/components/register/WeightModal'
import { CashierMenu } from '@/components/shift/CashierMenu'
import { ShiftGate } from '@/components/shift/ShiftGate'
import { ProductsWorkspace } from '@/features/admin/ProductsWorkspace'
import { CustomersWorkspace } from '@/features/admin/CustomersWorkspace'
import { InventoryWorkspace } from '@/features/admin/InventoryWorkspace'
import type { WorkspaceId } from '@/features/workspace/workspaceIds'
import { requestRegisterSearchFocus } from '@/lib/registerSearchFocus'
import { useAuthStore } from '@/store/useAuthStore'
import { useT } from '@/i18n/useT'
import { selectActiveItems, useCartStore } from '@/store/useCartStore'

export function RegisterScreen() {
  const t = useT()
  const items = useCartStore(selectActiveItems)
  const pendingWeight = useCartStore((s) => s.pendingWeightProduct)
  const showStock = useAuthStore((s) => s.user?.enableInventory === true)
  const [workspace, setWorkspace] = useState<WorkspaceId>('sell')

  const hasNegativeStock = useMemo(
    () =>
      showStock &&
      items.some((item) => {
        if (item.trackInventory !== true) return false
        const remaining = (item.currentStock ?? 0) - item.quantity
        return remaining < 0
      }),
    [items, showStock],
  )

  useEffect(() => {
    if (workspace === 'sell' && !pendingWeight) {
      requestRegisterSearchFocus()
    }
  }, [pendingWeight, workspace])

  return (
    <AuthGate>
      <ShiftGate>
        <div className="flex h-dvh max-h-dvh flex-col bg-slate-100 text-slate-900">
          <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-slate-900 px-4 py-3 text-white">
            <h1 className="text-lg font-semibold tracking-tight">{t('register.title')}</h1>
            <CashierMenu />
          </header>

          <WorkspaceNav active={workspace} onChange={setWorkspace} />

          {workspace === 'sell' ? (
            <>
              <TicketTabs />
              <SearchBar />

              {hasNegativeStock ? (
                <p
                  className="shrink-0 border-b border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-950"
                  role="status"
                  data-testid="register-negative-stock-warning"
                >
                  {t('register.negativeStockWarning')}
                </p>
              ) : null}

              <section className="min-h-0 flex-1 overflow-y-auto bg-white" aria-label="Cart items">
                {items.length === 0 ? (
                  <p className="px-4 py-10 text-center text-slate-500">{t('register.emptyCart')}</p>
                ) : (
                  <>
                    <CartListHeader showStock={showStock} />
                    <ul>
                      {items.map((item) => (
                        <CartItemRow
                          key={item.productId}
                          item={item}
                          showStock={showStock}
                          stockDisplay={formatCartStockDisplay(item)}
                        />
                      ))}
                    </ul>
                  </>
                )}
              </section>

              <CheckoutFooter />
              <WeightModal />
            </>
          ) : null}

          {workspace === 'products' ? <ProductsWorkspace /> : null}

          {workspace === 'customers' ? <CustomersWorkspace /> : null}

          {workspace === 'inventory' ? <InventoryWorkspace /> : null}
        </div>
      </ShiftGate>
    </AuthGate>
  )
}
