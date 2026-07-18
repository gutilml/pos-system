import { describe, expect, it } from 'vitest'
import { toCartProduct } from '@/api/products'

describe('toCartProduct', () => {
  it('maps API DTO fields used by cart / weight / discounts', () => {
    const product = toCartProduct({
      id: 'p-ham',
      sku: '2001',
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
})
