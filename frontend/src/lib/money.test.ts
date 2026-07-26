import { describe, expect, it } from 'vitest'
import {
  formatMoney,
  MONEY_DISPLAY_SCALE,
  MONEY_SCALE,
  roundMoney,
  roundMoneyDisplay,
} from '@/lib/money'

describe('money helpers', () => {
  it('keeps internal rounding at 4-scale', () => {
    expect(MONEY_SCALE).toBe(4)
    expect(roundMoney(1.23456)).toBe(1.2346)
  })

  it('rounds payable/display amounts half-up to 2 decimals', () => {
    expect(MONEY_DISPLAY_SCALE).toBe(2)
    expect(roundMoneyDisplay(58.428)).toBe(58.43)
    expect(roundMoneyDisplay(58.424)).toBe(58.42)
    expect(roundMoneyDisplay(1.005)).toBe(1.01)
  })

  it('formats money for display with 2 decimals', () => {
    expect(formatMoney(150)).toBe('150.00')
    expect(formatMoney(148.5)).toBe('148.50')
    expect(formatMoney(58.428)).toBe('58.43')
    expect(formatMoney(1.999)).toBe('2.00')
  })
})
