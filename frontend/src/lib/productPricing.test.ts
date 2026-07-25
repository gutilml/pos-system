import { describe, expect, it } from 'vitest'
import {
  isParentPackageIncompleteError,
  looksLikeBarcode,
  marginFromCostAndPrice,
  pickBestProductMatch,
  sellingPriceFromMargin,
  childCostFromParentPreview,
  conversionFactor,
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

  it('looksLikeBarcode requires digit-only length >= 4', () => {
    expect(looksLikeBarcode('1234')).toBe(true)
    expect(looksLikeBarcode('7501000000028')).toBe(true)
    expect(looksLikeBarcode('123')).toBe(false)
    expect(looksLikeBarcode('cola')).toBe(false)
    expect(looksLikeBarcode('12a4')).toBe(false)
    expect(looksLikeBarcode('  9999  ')).toBe(true)
  })

  it('pickBestProductMatch prefers exact sku then first result', () => {
    const rows = [
      { id: '1', primarySku: 'AAA', skus: ['AAA'] },
      { id: '2', primarySku: 'BBB', skus: ['BBB', '7501'] },
    ]
    expect(pickBestProductMatch('7501', rows)?.id).toBe('2')
    expect(pickBestProductMatch('zzz', rows)?.id).toBe('1')
    expect(pickBestProductMatch('x', [])).toBeNull()
  })

  it('conversionFactor converts mass units', () => {
    expect(conversionFactor('kg', 'g')).toBe(1000)
    expect(conversionFactor('g', 'kg')).toBe(0.001)
    expect(conversionFactor('kg', 'kg')).toBe(1)
  })

  it('childCostFromParentPreview same unit divides by qty', () => {
    expect(childCostFromParentPreview(24, 24, 'pc', 'pc')).toBe(1)
  })

  it('childCostFromParentPreview kg parent to g child', () => {
    expect(childCostFromParentPreview(100, 1, 'kg', 'g')).toBe(100000)
  })

  it('childCostFromParentPreview falls back when units incompatible', () => {
    expect(childCostFromParentPreview(24, 12, 'pc', 'kg')).toBe(2)
  })
})
