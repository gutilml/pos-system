export type CartProduct = {
  id: string
  sku: string
  name: string
  sellingPrice: number
  sellByWeight?: boolean
  unitOfMeasure?: string
}

export type CartItem = {
  productId: string
  sku: string
  name: string
  unitPrice: number
  quantity: number
}
