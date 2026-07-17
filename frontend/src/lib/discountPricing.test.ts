import { describe, expect, it } from 'vitest'
import { priceLine } from '@/lib/discountPricing'

describe('discountPricing', () => {
  it('skips global when line has item discount', () => {
    const line = priceLine(100, 1, 0.1, 0.1, false)
    expect(line.finalUnitPrice).toBe(90)
    expect(line.lineDiscountAmount).toBe(10)
  })

  it('applies global only when no item discount and not excluded', () => {
    const eligible = priceLine(10, 1, 0, 0.1, false)
    const excluded = priceLine(10, 1, 0, 0.1, true)
    expect(eligible.finalUnitPrice).toBe(9)
    expect(excluded.finalUnitPrice).toBe(10)
  })

  it('mixed cart matches backend DiscountPricingTest', () => {
    const cola = priceLine(1.99, 1, 0.1, 0.1, false)
    const chips = priceLine(2.5, 1, 0, 0.1, false)
    const special = priceLine(2.5, 1, 0, 0.1, true)

    expect(cola.finalUnitPrice).toBe(1.791)
    expect(chips.finalUnitPrice).toBe(2.25)
    expect(special.finalUnitPrice).toBe(2.5)

    const subtotal = cola.lineTotal + chips.lineTotal + special.lineTotal
    const totalDiscount =
      cola.lineDiscountAmount + chips.lineDiscountAmount + special.lineDiscountAmount

    expect(subtotal).toBe(6.541)
    expect(totalDiscount).toBe(0.449)
  })
})
