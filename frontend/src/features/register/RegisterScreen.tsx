import { CartItemRow } from '@/components/register/CartItemRow'
import { CheckoutFooter } from '@/components/register/CheckoutFooter'
import { SearchBar } from '@/components/register/SearchBar'
import { TicketTabs } from '@/components/register/TicketTabs'
import { WeightModal } from '@/components/register/WeightModal'
import { CashierMenu } from '@/components/shift/CashierMenu'
import { ShiftGate } from '@/components/shift/ShiftGate'
import { DEFAULT_STORE_ID } from '@/api/shifts'
import { createTransaction } from '@/api/transactions'
import {
  selectActiveAmountReceived,
  selectActiveItems,
  selectGrandTotal,
  useCartStore,
} from '@/store/useCartStore'

export function RegisterScreen() {
  const items = useCartStore(selectActiveItems)

  async function requestCardPayment(): Promise<string> {
    const state = useCartStore.getState()
    const cartItems = selectActiveItems(state)
    if (cartItems.length === 0) {
      throw new Error('Cart is empty')
    }
    const grandTotal = selectGrandTotal(cartItems, state.taxRate)
    const received = selectActiveAmountReceived(state) ?? grandTotal

    const transaction = await createTransaction({
      storeId: DEFAULT_STORE_ID,
      amountReceived: received,
      taxRate: state.taxRate || undefined,
      items: cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    })
    return transaction.id
  }

  return (
    <ShiftGate>
      <div className="flex h-dvh max-h-dvh flex-col bg-slate-100 text-slate-900">
        <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-slate-900 px-4 py-3 text-white">
          <h1 className="text-lg font-semibold tracking-tight">POS Register</h1>
          <CashierMenu />
        </header>

        <TicketTabs />
        <SearchBar />

        <section className="min-h-0 flex-1 overflow-y-auto bg-white" aria-label="Cart items">
          {items.length === 0 ? (
            <p className="px-4 py-10 text-center text-slate-500">
              Scan a barcode or search by name to start a ticket.
            </p>
          ) : (
            <ul>
              {items.map((item) => (
                <CartItemRow key={item.productId} item={item} />
              ))}
            </ul>
          )}
        </section>

        <CheckoutFooter onRequestCardPayment={requestCardPayment} />
        <WeightModal />
      </div>
    </ShiftGate>
  )
}
