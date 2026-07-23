import { describe, expect, it } from 'vitest'
import { toCartProduct } from '@/api/products'

describe('toCartProduct', () => {
  it('maps API DTO fields used by cart / weight / discounts', () => {
    const product = toCartProduct({
      id: 'p-ham',
      sku: '2001',
      primarySku: '2001',
      skus: ['2001'],
      name: 'Deli Ham',
      sellingPrice: 8.99,
      sellByWeight: true,
      unitOfMeasure: 'lb',
      excludeFromGlobalDiscounts: false,
    })

    expect(product).toEqual({
      id: 'p-ham',
      sku: '2001',
      name: 'Deli Ham',
      sellingPrice: 8.99,
      sellByWeight: true,
      unitOfMeasure: 'lb',
      excludeFromGlobalDiscounts: false,
    })
  })

  it('prefers primarySku over transitional sku alias', () => {
    const product = toCartProduct({
      id: 'p-cola',
      sku: 'legacy',
      primarySku: '7501000000028',
      skus: ['7501000000028', '7501000001025'],
      name: 'Cola',
      sellingPrice: 14,
    })

    expect(product.sku).toBe('7501000000028')
  })

  it('uses empty sku for name-only products', () => {
    const product = toCartProduct({
      id: 'p-svc',
      sku: null,
      primarySku: null,
      skus: [],
      name: 'Service Fee',
      sellingPrice: 10,
    })

    expect(product.sku).toBe('')
  })
})
