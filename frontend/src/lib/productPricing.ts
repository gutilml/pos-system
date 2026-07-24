/** Margin ↔ retail helpers (Feature 053). Fractions 0–1, money 4 dp preview. */

export function sellingPriceFromMargin(cost: number, margin: number): number {
  if (!Number.isFinite(cost) || !Number.isFinite(margin)) {
    throw new Error('cost and margin required')
  }
  if (margin < 0 || margin >= 1) {
    throw new Error('margin must be in [0, 1)')
  }
  const divisor = 1 - margin
  return round4(cost / divisor)
}

export function marginFromCostAndPrice(cost: number, selling: number): number {
  if (!Number.isFinite(cost) || !Number.isFinite(selling) || selling <= 0) {
    throw new Error('cost and positive selling required')
  }
  if (cost < 0) {
    throw new Error('cost cannot be negative')
  }
  const margin = 1 - cost / selling
  if (margin < 0 || margin >= 1) {
    throw new Error('computed margin out of range')
  }
  return round4(margin)
}

export function round4(n: number): number {
  return Math.round(n * 10000) / 10000
}

export function isParentPackageIncompleteError(message: string): boolean {
  return message.includes('PARENT_PACKAGE_INCOMPLETE')
}
