import { roundMoney } from '@/lib/money'

/**
 * Weighted average money (Feature 062 / 094), matching backend InventoryAdminService.weightedAverage.
 */
export function weightedAverageMoney(
  oldValue: number,
  qtyBefore: number,
  incomingValue: number,
  incomingQty: number,
): number {
  const totalQty = qtyBefore + incomingQty
  if (!(totalQty > 0)) {
    return roundMoney(incomingValue)
  }
  return roundMoney((oldValue * qtyBefore + incomingValue * incomingQty) / totalQty)
}

/**
 * Invert WAC so the API still receives lot unit values when the UI shows blended product prices (Feature 103).
 * displayed ≈ (before * qtyBefore + lot * incomingQty) / (qtyBefore + incomingQty)
 */
export function reverseIncomingUnit(
  displayed: number,
  before: number,
  qtyBefore: number,
  incomingQty: number,
): number {
  if (!(incomingQty > 0) || !Number.isFinite(incomingQty)) {
    return roundMoney(displayed)
  }
  if (!(qtyBefore > 0) || !Number.isFinite(qtyBefore)) {
    return roundMoney(displayed)
  }
  const totalQty = qtyBefore + incomingQty
  return roundMoney((displayed * totalQty - before * qtyBefore) / incomingQty)
}

export type ReceiveBlendPreview = {
  cost: number
  selling: number
  wholesale: number
}

/**
 * Post-receive product prices matching BE blend rules:
 * - cost changed → WAC blend of current + lot prices
 * - cost unchanged → keep current product prices
 */
export function previewReceiveBlend(args: {
  qtyBefore: number
  costBefore: number
  sellingBefore: number
  wholesaleBefore: number
  incomingQty: number
  incomingCost: number
  incomingSelling: number
  incomingWholesale: number
}): ReceiveBlendPreview | null {
  const {
    qtyBefore,
    costBefore,
    sellingBefore,
    wholesaleBefore,
    incomingQty,
    incomingCost,
    incomingSelling,
    incomingWholesale,
  } = args

  if (!(incomingQty > 0) || !Number.isFinite(incomingQty)) {
    return null
  }
  if (!Number.isFinite(incomingCost) || incomingCost < 0) {
    return null
  }
  if (!Number.isFinite(incomingSelling) || incomingSelling < 0) {
    return null
  }
  if (!Number.isFinite(incomingWholesale) || incomingWholesale < 0) {
    return null
  }

  const costChanged = Math.abs(incomingCost - costBefore) > 0.00005
  if (!costChanged) {
    return {
      cost: roundMoney(costBefore),
      selling: roundMoney(sellingBefore),
      wholesale: roundMoney(wholesaleBefore),
    }
  }

  return {
    cost: weightedAverageMoney(costBefore, qtyBefore, incomingCost, incomingQty),
    selling: weightedAverageMoney(sellingBefore, qtyBefore, incomingSelling, incomingQty),
    wholesale: weightedAverageMoney(wholesaleBefore, qtyBefore, incomingWholesale, incomingQty),
  }
}
