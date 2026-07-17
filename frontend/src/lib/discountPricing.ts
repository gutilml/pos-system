import { roundMoney } from '@/lib/money'
import type { CartItem } from '@/types/cart'

export type PricedLine = {
  originalUnitPrice: number
  itemDiscountPercentage: number
  finalUnitPrice: number
  lineTotal: number
  lineDiscountAmount: number
}

export function normalizeDiscountFraction(fraction: number | undefined | null): number {
  if (fraction == null || fraction <= 0) return 0
  return roundMoney(fraction)
}

export function applyDiscount(amount: number, discountFraction: number): number {
  const base = roundMoney(amount)
  const pct = normalizeDiscountFraction(discountFraction)
  if (pct <= 0) return base
  const discountAmount = roundMoney(base * pct)
  return roundMoney(base - discountAmount)
}

/** Mirrors backend `DiscountPricing.priceLine` (Feature 015). */
export function priceLine(
  originalUnitPrice: number,
  quantity: number,
  itemDiscountPercentage: number,
  globalDiscountPercentage: number,
  excludeFromGlobalDiscounts: boolean,
): PricedLine {
  const original = roundMoney(originalUnitPrice)
  const qty = roundMoney(quantity)
  const itemPct = normalizeDiscountFraction(itemDiscountPercentage)

  const afterItemDiscount = applyDiscount(original, itemPct)

  const skipGlobal = excludeFromGlobalDiscounts || itemPct > 0
  const globalPct = normalizeDiscountFraction(globalDiscountPercentage)

  const finalUnitPrice =
    skipGlobal || globalPct <= 0
      ? afterItemDiscount
      : applyDiscount(afterItemDiscount, globalPct)

  const originalLineTotal = roundMoney(original * qty)
  const lineTotal = roundMoney(finalUnitPrice * qty)
  const lineDiscountAmount = roundMoney(originalLineTotal - lineTotal)

  return {
    originalUnitPrice: original,
    itemDiscountPercentage: itemPct,
    finalUnitPrice,
    lineTotal,
    lineDiscountAmount,
  }
}

export function priceCartLine(
  item: CartItem,
  globalDiscountPercentage: number,
): PricedLine {
  return priceLine(
    item.unitPrice,
    item.quantity,
    item.itemDiscountPercentage ?? 0,
    globalDiscountPercentage,
    item.excludeFromGlobalDiscounts === true,
  )
}

/** Cashier enters whole percents (e.g. "10"); store/API use decimal fractions (0.10). */
export function parseDisplayPercentToFraction(display: string): number {
  const trimmed = display.trim()
  if (!trimmed) return 0
  const parsed = Number.parseFloat(trimmed)
  if (!Number.isFinite(parsed) || parsed <= 0) return 0
  return roundMoney(Math.min(100, parsed) / 100)
}

export function fractionToDisplayPercent(fraction: number): string {
  if (fraction <= 0) return ''
  return String(roundMoney(fraction * 100))
}
