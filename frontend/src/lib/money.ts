/** Money helpers aligned with backend DECIMAL(12,4) scale. */
export const MONEY_SCALE = 4

export function roundMoney(value: number): number {
  const factor = 10 ** MONEY_SCALE
  return Math.round((value + Number.EPSILON) * factor) / factor
}

export function lineTotal(unitPrice: number, quantity: number): number {
  return roundMoney(unitPrice * quantity)
}

export function formatMoney(value: number): string {
  return value.toFixed(MONEY_SCALE)
}
