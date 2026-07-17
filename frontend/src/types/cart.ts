export type CartProduct = {
  id: string
  sku: string
  name: string
  sellingPrice: number
  sellByWeight?: boolean
  unitOfMeasure?: string
  excludeFromGlobalDiscounts?: boolean
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
}
