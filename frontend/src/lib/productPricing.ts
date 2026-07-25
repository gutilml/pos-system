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

function normalizeUnit(unit: string | null | undefined): string {
  return (unit ?? '').trim().toLowerCase()
}

function massFamily(u: string): boolean {
  return u === 'kg' || u === 'gr' || u === 'g' || u === 'lb'
}

function volumeFamily(u: string): boolean {
  return u === 'l' || u === 'lt' || u === 'ml'
}

function countFamily(u: string): boolean {
  return u === 'unit' || u === 'bottle' || u === 'ea' || u === 'each' || u === 'pc'
}

function sameFamily(a: string, b: string): boolean {
  return (
    (massFamily(a) && massFamily(b)) ||
    (volumeFamily(a) && volumeFamily(b)) ||
    (countFamily(a) && countFamily(b))
  )
}

/** 1 of this unit = N base units (g for mass, ml for volume, 1 for count). */
function toBaseFactor(unit: string): number | null {
  switch (unit) {
    case 'kg':
      return 1000
    case 'gr':
    case 'g':
      return 1
    case 'lb':
      return 453.592
    case 'l':
    case 'lt':
      return 1000
    case 'ml':
      return 1
    case 'unit':
    case 'bottle':
    case 'ea':
    case 'each':
    case 'pc':
      return 1
    default:
      return null
  }
}

/**
 * Factor to multiply a value in {@code fromUnit} to express it in {@code toUnit}.
 * Mirrors BE ProductPricing.conversionFactor.
 */
export function conversionFactor(fromUnit: string, toUnit: string): number {
  const from = normalizeUnit(fromUnit)
  const to = normalizeUnit(toUnit)
  if (!from || !to || from === to) return 1
  const fromInBase = toBaseFactor(from)
  const toInBase = toBaseFactor(to)
  if (fromInBase == null || toInBase == null || !sameFamily(from, to)) {
    throw new Error(`Cannot convert units from '${fromUnit}' to '${toUnit}'`)
  }
  return fromInBase / toInBase
}

/**
 * Child unit cost preview from parent package cost (Feature 076).
 * Same unit: parentCost / qtyPerPackage.
 * On conversion failure, falls back to same-unit divide.
 */
export function childCostFromParentPreview(
  parentCost: number,
  qtyPerPackage: number,
  parentPackageUnit: string | null | undefined,
  childSellUnit: string | null | undefined,
): number | null {
  if (!Number.isFinite(parentCost) || !Number.isFinite(qtyPerPackage) || qtyPerPackage <= 0) {
    return null
  }
  const perPackageUnit = parentCost / qtyPerPackage
  const parentUnit = parentPackageUnit?.trim() || ''
  const childUnit = childSellUnit?.trim() || parentUnit
  try {
    const factor = conversionFactor(parentUnit || childUnit, childUnit || parentUnit)
    return round4(perPackageUnit * factor)
  } catch {
    return round4(perPackageUnit)
  }
}

/** Feature 056: digit-only query with length ≥ 4 is treated as a barcode. */
export function looksLikeBarcode(query: string): boolean {
  const trimmed = query.trim()
  return trimmed.length >= 4 && /^\d+$/.test(trimmed)
}

type SkuLike = {
  primarySku?: string | null
  sku?: string | null
  skus?: string[]
}

/**
 * Prefer exact primarySku / sku / skus match (case-insensitive); otherwise first result.
 */
export function pickBestProductMatch<T extends SkuLike>(
  query: string,
  results: T[],
): T | null {
  if (results.length === 0) return null
  const q = query.trim().toLowerCase()
  const exact = results.find((p) => {
    const codes = [p.primarySku, p.sku, ...(p.skus ?? [])]
      .filter((c): c is string => Boolean(c))
      .map((c) => c.toLowerCase())
    return codes.includes(q)
  })
  return exact ?? results[0]
}

