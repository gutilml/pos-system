import { describe, expect, it } from 'vitest'
import { previewReceiveBlend, weightedAverageMoney } from '@/lib/inventoryPricing'

describe('inventoryPricing', () => {
  it('weightedAverageMoney matches BE WAC (user receive case)', () => {
    expect(weightedAverageMoney(35, 10, 40, 10)).toBe(37.5)
    // prior selling ≈ 35 / (1 - 0.4) = 58.3333; lot 66.6667 → 62.5
    expect(weightedAverageMoney(58.3333, 10, 66.6667, 10)).toBe(62.5)
  })

  it('previewReceiveBlend blends when cost changes', () => {
    const preview = previewReceiveBlend({
      qtyBefore: 10,
      costBefore: 35,
      sellingBefore: 58.3333,
      wholesaleBefore: 0,
      incomingQty: 10,
      incomingCost: 40,
      incomingSelling: 66.6667,
      incomingWholesale: 0,
    })
    expect(preview).toEqual({ cost: 37.5, selling: 62.5, wholesale: 0 })
  })

  it('previewReceiveBlend keeps product prices when cost unchanged', () => {
    const preview = previewReceiveBlend({
      qtyBefore: 10,
      costBefore: 35,
      sellingBefore: 58.3333,
      wholesaleBefore: 1,
      incomingQty: 5,
      incomingCost: 35,
      incomingSelling: 99,
      incomingWholesale: 99,
    })
    expect(preview).toEqual({ cost: 35, selling: 58.3333, wholesale: 1 })
  })

  it('previewReceiveBlend returns null for invalid qty', () => {
    expect(
      previewReceiveBlend({
        qtyBefore: 10,
        costBefore: 35,
        sellingBefore: 50,
        wholesaleBefore: 0,
        incomingQty: 0,
        incomingCost: 40,
        incomingSelling: 66.6667,
        incomingWholesale: 0,
      }),
    ).toBeNull()
  })
})
