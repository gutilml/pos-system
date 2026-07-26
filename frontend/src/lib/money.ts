/** Internal money math aligned with backend DECIMAL(12,4) scale. */
export const MONEY_SCALE = 4

/** Display / payable scale for currency amounts in the UI (Feature 093; was 3 in 071). */
export const MONEY_DISPLAY_SCALE = 2

export function roundMoney(value: number): number {
  const factor = 10 ** MONEY_SCALE
  return Math.round((value + Number.EPSILON) * factor) / factor
}

/** Half-up round to display/payable scale (e.g. 58.428 → 58.43). */
export function roundMoneyDisplay(value: number): number {
  const factor = 10 ** MONEY_DISPLAY_SCALE
  return Math.round((value + Number.EPSILON) * factor) / factor
}

export function lineTotal(unitPrice: number, quantity: number): number {
  return roundMoney(unitPrice * quantity)
}

/** Format a money amount for display (2 decimal places). */
export function formatMoney(value: number): string {
  return roundMoneyDisplay(value).toFixed(MONEY_DISPLAY_SCALE)
}
