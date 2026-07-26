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
