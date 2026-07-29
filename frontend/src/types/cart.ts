export type CartProduct = {
  id: string
  sku: string
  name: string
  sellingPrice: number
  sellByWeight?: boolean
  unitOfMeasure?: string
  excludeFromGlobalDiscounts?: boolean
  trackInventory?: boolean
  currentStock?: number
  /** Feature 112 — parent (or self) whose stock backs Inv display. */
  stockedProductId?: string | null
}

export type CartItem = {
  productId: string
  sku: string
  name: string
  unitPrice: number
  quantity: number
  /** Decimal fraction (0.10 = 10% off this line). */
  itemDiscountPercentage?: number
  excludeFromGlobalDiscounts?: boolean
  /** Snapshot from product at first add (Feature 043 / 112). */
  trackInventory?: boolean
  currentStock?: number
  stockedProductId?: string | null
}
