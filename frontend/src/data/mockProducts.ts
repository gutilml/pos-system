import type { CartProduct } from '@/types/cart'

/** Local mock catalog for scanner/search until live API wiring. */
export const MOCK_PRODUCTS: CartProduct[] = [
  { id: 'p-cola', sku: '1001', name: 'Cola 12oz', sellingPrice: 1.99 },
  { id: 'p-chips', sku: '1002', name: 'Chips', sellingPrice: 2.5 },
  {
    id: 'p-special',
    sku: '3001',
    name: 'Daily Special',
    sellingPrice: 2.5,
    excludeFromGlobalDiscounts: true,
  },
  { id: 'p-water', sku: '1003', name: 'Water 500ml', sellingPrice: 1.25 },
  { id: 'p-coffee', sku: '1004', name: 'Coffee', sellingPrice: 3.75 },
  {
    id: 'p-ham',
    sku: '2001',
    name: 'Deli Ham',
    sellingPrice: 0.0125,
    sellByWeight: true,
    unitOfMeasure: 'gr',
  },
]

export function findMockProduct(query: string): CartProduct | undefined {
  const q = query.trim().toLowerCase()
  if (!q) return undefined

  return MOCK_PRODUCTS.find(
    (p) => p.sku.toLowerCase() === q || p.name.toLowerCase() === q,
  )
}
