import { CartItemRow } from '@/components/register/CartItemRow'
import { CheckoutFooter } from '@/components/register/CheckoutFooter'
import { SearchBar } from '@/components/register/SearchBar'
import { useCartStore } from '@/store/useCartStore'

export function RegisterScreen() {
  const items = useCartStore((s) => s.items)

  return (
    <div className="flex h-dvh max-h-dvh flex-col bg-slate-100 text-slate-900">
      <header className="shrink-0 border-b border-slate-200 bg-slate-900 px-4 py-3 text-white">
        <h1 className="text-lg font-semibold tracking-tight">POS Register</h1>
      </header>

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

      <CheckoutFooter />
    </div>
  )
}
