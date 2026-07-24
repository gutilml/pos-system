import { describe, expect, it } from 'vitest'
import {
  isParentPackageIncompleteError,
  marginFromCostAndPrice,
  sellingPriceFromMargin,
} from '@/lib/productPricing'

describe('productPricing', () => {
  it('sellingPriceFromMargin uses retail formula', () => {
    expect(sellingPriceFromMargin(70, 0.3)).toBe(100)
  })

  it('marginFromCostAndPrice is inverse', () => {
    expect(marginFromCostAndPrice(70, 100)).toBe(0.3)
  })

  it('detects parent package incomplete API errors', () => {
    expect(
      isParentPackageIncompleteError(
        'PARENT_PACKAGE_INCOMPLETE: Parent product is missing qtyPerPackage',
      ),
    ).toBe(true)
    expect(isParentPackageIncompleteError('SKU already in use')).toBe(false)
  })
})
