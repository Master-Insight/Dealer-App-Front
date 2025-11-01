// src/features/products/types/product.ts
export type ProductStatus = 'available' | 'reserved' | 'sold' | 'retired'

export interface Product {
  id: string
  name: string
  model?: string | null
  price?: number | null
  status: ProductStatus
  description?: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateProductInput {
  name: string
  model?: string | null
  price?: number | null
  status?: ProductStatus
  description?: string | null
}

export interface UpdateProductInput {
  id: string
  name?: string
  model?: string | null
  price?: number | null
  status?: ProductStatus
  description?: string | null
}
