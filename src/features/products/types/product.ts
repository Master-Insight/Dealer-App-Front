// src/features/products/types/product.ts
export type ProductFuelType = 'Nafta' | 'Gas' | 'Diesel' | 'Eléctrico'
export type ProductTransmision = 'Manual' | 'Automática'
export type ProductTypes = 'Auto' | 'Moto' | 'Camioneta' | 'Camión'
export type ProductStatus = 'disponible' | 'reservado' | 'vendido' | 'baja'

export interface Product {
  id: string
  brand: string
  model: string
  variant?: string | null
  year?: number | null
  mileage?: number | null
  fuel_type?: ProductFuelType | null
  transmission?: ProductTransmision | null
  color?: string | null
  doors?: number | null
  location?: string | null
  state: ProductStatus
  description?: string | null
  active?: boolean | true
  price?: number | null
  labels?: string | null
  vehicle_type: ProductTypes | null
  created_at: string
  updated_at: string
}

export interface CreateProductInput {
  company_id?: string | null
  brand: string
  model: string
  variant?: string | null
  year?: number | null
  mileage?: number | null
  fuel_type?: ProductFuelType | null
  transmission?: ProductTransmision | null
  color?: string | null
  doors?: number | null
  location?: string | null
  state: ProductStatus
  description?: string | null
  active?: boolean | true
  price?: number | null
  labels?: string | null
  vehicle_type: ProductTypes | null
}

export interface UpdateProductInput {
  company_id?: string | null
  id: string
  brand: string
  model: string
  variant?: string | null
  year?: number | null
  mileage?: number | null
  fuel_type?: ProductFuelType | null
  transmission?: ProductTransmision | null
  color?: string | null
  doors?: number | null
  location?: string | null
  state: ProductStatus
  description?: string | null
  active?: boolean | true
  price?: number | null
  labels?: string | null
  vehicle_type: ProductTypes | null
}
