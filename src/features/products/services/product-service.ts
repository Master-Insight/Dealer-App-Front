// src/features/products/services/product-service.ts
import type {
  CreateProductInput,
  Product,
  ProductStatus,
  ProductTypes,
  UpdateProductInput,
} from '@/features/products/types/product'
import { apiClient } from '@/api/clients'
import { env } from '@/env'

interface ProductServiceOptions {
  accessToken: string
}

type ProductStatusApi = 'available' | 'reserved' | 'sold' | 'archived'

interface ProductApiModel {
  id: string
  company_id?: string | null
  brand: string
  model: string
  variant?: string | null
  year?: number | null
  mileage?: number | null
  fuel_type?: Product['fuel_type']
  transmission?: Product['transmission']
  color?: string | null
  doors?: number | null
  location?: string | null
  state: ProductStatusApi
  description?: string | null
  active?: boolean
  price?: number | null
  labels?: string | null
  vehicle_type: ProductTypes | null
  created_at: string
  updated_at: string
}

interface ProductsCollectionResponse {
  success: boolean
  message: string
  data: Array<ProductApiModel>
}

const PRODUCT_STATUS_TO_API: Record<ProductStatus, ProductStatusApi> = {
  disponible: 'available',
  reservado: 'reserved',
  vendido: 'sold',
  baja: 'archived',
}

const PRODUCT_STATUS_FROM_API: Record<ProductStatusApi, ProductStatus> = {
  available: 'disponible',
  reserved: 'reservado',
  sold: 'vendido',
  archived: 'baja',
}

const seedProducts: Array<Product> = [
  {
    id: '1b802216-6d1a-4ce7-b75f-88f3a5cd2c26',
    brand: 'Volkswagen',
    model: 'Taos',
    variant: 'Comfortline 250 TSI',
    year: 2024,
    mileage: 1250,
    fuel_type: 'Nafta',
    transmission: 'Automática',
    color: 'Gris Platinum',
    doors: 5,
    location: 'Córdoba Capital',
    state: 'disponible',
    description: 'SUV compacto con paquete tecnología full.',
    active: true,
    price: 28900000,
    labels: '0km',
    vehicle_type: 'Auto',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'c7f5b2da-7a70-4df0-82bc-bce094716fd2',
    brand: 'Renault',
    model: 'Kangoo',
    variant: 'Express 1.6 SCe',
    year: 2023,
    mileage: 18500,
    fuel_type: 'Nafta',
    transmission: 'Manual',
    color: 'Blanco Glaciar',
    doors: 4,
    location: 'Villa María',
    state: 'reservado',
    description: 'Utilitario para flota corporativa con mantenimiento al día.',
    active: true,
    price: 18500000,
    labels: 'Flota',
    vehicle_type: 'Camioneta',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: 'f1f65e79-3d2c-49b8-9d36-ec973c4d6ba3',
    brand: 'Chevrolet',
    model: 'S10',
    variant: 'High Country 4x4',
    year: 2022,
    mileage: 32500,
    fuel_type: 'Diesel',
    transmission: 'Automática',
    color: 'Azul Eclipse',
    doors: 4,
    location: 'Río Cuarto',
    state: 'vendido',
    description: 'Pick-up equipada con accesorios off-road.',
    active: true,
    price: 34250000,
    labels: 'Usado',
    vehicle_type: 'Camioneta',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
]

let mockProducts: Array<Product> = [...seedProducts]

function ensureAccessToken(options?: ProductServiceOptions) {
  if (!options?.accessToken) {
    throw new Error('Se requiere una sesión activa para operar con productos.')
  }
  return options.accessToken
}

function mapProductStatusFromApi(status: ProductStatusApi): ProductStatus {
  if (!Object.prototype.hasOwnProperty.call(PRODUCT_STATUS_FROM_API, status)) {
    return 'disponible'
  }
  return PRODUCT_STATUS_FROM_API[status]
}

function mapProductStatusToApi(status: ProductStatus): ProductStatusApi {
  return PRODUCT_STATUS_TO_API[status]
}

function mapProduct(product: ProductApiModel): Product {
  return {
    id: product.id,
    brand: product.brand,
    model: product.model,
    variant: product.variant ?? null,
    year: product.year ?? null,
    mileage: product.mileage ?? null,
    fuel_type: product.fuel_type ?? null,
    transmission: product.transmission ?? null,
    color: product.color ?? null,
    doors: product.doors ?? null,
    location: product.location ?? null,
    state: mapProductStatusFromApi(product.state),
    description: product.description ?? null,
    active: product.active ?? true,
    price: typeof product.price === 'number' ? product.price : null,
    labels: product.labels ?? null,
    vehicle_type: product.vehicle_type,
    created_at: product.created_at,
    updated_at: product.updated_at,
  }
}

function sanitizeProductInput(input: CreateProductInput | UpdateProductInput) {
  return {
    company_id: input.company_id ?? '227fb964-9641-465a-b718-4ba1bc51f803',
    brand: input.brand.trim(),
    model: input.model.trim(),
    variant: input.variant?.trim() || null,
    year: input.year ?? null,
    mileage: input.mileage ?? null,
    fuel_type: input.fuel_type ?? null,
    transmission: input.transmission ?? null,
    color: input.color?.trim() || null,
    doors: input.doors ?? null,
    location: input.location?.trim() || null,
    state: mapProductStatusToApi(input.state),
    description: input.description?.trim() || null,
    active: input.active ?? true,
    price: input.price ?? null,
    labels: input.labels?.trim() || null,
    vehicle_type: input.vehicle_type,
  }
}

async function listProductsApi(
  options?: ProductServiceOptions,
): Promise<Array<Product>> {
  const accessToken = ensureAccessToken(options)

  const response = await apiClient.request<ProductsCollectionResponse>(
    '/products',
    {
      method: 'GET',
      accessToken,
      query: { page_size: 100 },
    },
  )

  return response.data
    .map(mapProduct)
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    )
}

async function searchProductsApi(
  term: string,
  options?: ProductServiceOptions,
): Promise<Array<Product>> {
  const accessToken = ensureAccessToken(options)
  const normalized = term.trim()

  const response = await apiClient.request<ProductsCollectionResponse>(
    '/products',
    {
      method: 'GET',
      accessToken,
      query: {
        page_size: 100,
        ...(normalized ? { search: normalized } : {}),
      },
    },
  )

  const products = response.data.map(mapProduct)
  if (!normalized) {
    return products
  }

  const lower = normalized.toLowerCase()
  return products.filter((product) => {
    const matchesBrand = product.brand.toLowerCase().includes(lower)
    const matchesModel = product.model.toLowerCase().includes(lower)
    const matchesVariant = product.variant?.toLowerCase().includes(lower)
    return matchesBrand || matchesModel || !!matchesVariant
  })
}

async function createProductApi(
  input: CreateProductInput,
  options?: ProductServiceOptions,
): Promise<Product> {
  const accessToken = ensureAccessToken(options)
  const payload = sanitizeProductInput(input)

  const response = await apiClient.request<
    { success?: boolean; data?: ProductApiModel } | ProductApiModel
  >('/products', {
    method: 'POST',
    accessToken,
    body: payload,
  })

  const product = 'data' in response ? response.data : response
  if (!product) {
    throw new Error('No se pudo registrar el producto.')
  }

  return mapProduct(product)
}

async function updateProductApi(
  input: UpdateProductInput,
  options?: ProductServiceOptions,
): Promise<Product> {
  const accessToken = ensureAccessToken(options)
  const payload = sanitizeProductInput(input)

  const response = await apiClient.request<
    { success?: boolean; data?: ProductApiModel } | ProductApiModel
  >(`/products/${input.id}`, {
    method: 'PATCH',
    accessToken,
    body: payload,
  })

  const product = 'data' in response ? response.data : response
  if (!product) {
    throw new Error('No se pudo actualizar el producto.')
  }

  return mapProduct(product)
}

function listProductsMock(): Promise<Array<Product>> {
  return Promise.resolve(
    [...mockProducts].sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    ),
  )
}

function searchProductsMock(term: string): Promise<Array<Product>> {
  const normalized = term.trim().toLowerCase()
  if (!normalized) {
    return listProductsMock()
  }

  return Promise.resolve(
    mockProducts.filter((product) => {
      const matchesBrand = product.brand.toLowerCase().includes(normalized)
      const matchesModel = product.model.toLowerCase().includes(normalized)
      const matchesVariant = product.variant?.toLowerCase().includes(normalized)
      return matchesBrand || matchesModel || !!matchesVariant
    }),
  )
}

function createProductMock(input: CreateProductInput): Promise<Product> {
  const now = new Date().toISOString()
  const product: Product = {
    id: `mock-product-${Math.random().toString(36).slice(2, 10)}`,
    brand: input.brand,
    model: input.model,
    variant: input.variant ?? null,
    year: input.year ?? null,
    mileage: input.mileage ?? null,
    fuel_type: input.fuel_type ?? null,
    transmission: input.transmission ?? null,
    color: input.color ?? null,
    doors: input.doors ?? null,
    location: input.location ?? null,
    state: input.state,
    description: input.description ?? null,
    active: input.active ?? true,
    price: input.price ?? null,
    labels: input.labels ?? null,
    vehicle_type: input.vehicle_type,
    created_at: now,
    updated_at: now,
  }

  mockProducts = [product, ...mockProducts]
  return Promise.resolve(product)
}

function updateProductMock(input: UpdateProductInput): Promise<Product> {
  const index = mockProducts.findIndex((product) => product.id === input.id)
  if (index === -1) {
    throw new Error('No se encontró el producto solicitado.')
  }

  const previous = mockProducts[index]
  const next: Product = {
    ...previous,
    brand: input.brand,
    model: input.model,
    variant: input.variant ?? null,
    year: input.year ?? null,
    mileage: input.mileage ?? null,
    fuel_type: input.fuel_type ?? null,
    transmission: input.transmission ?? null,
    color: input.color ?? null,
    doors: input.doors ?? null,
    location: input.location ?? null,
    state: input.state,
    description: input.description ?? null,
    active: input.active ?? previous.active,
    price: input.price ?? null,
    labels: input.labels ?? null,
    vehicle_type: input.vehicle_type,
    updated_at: new Date().toISOString(),
  }

  mockProducts = [
    ...mockProducts.slice(0, index),
    next,
    ...mockProducts.slice(index + 1),
  ]

  return Promise.resolve(next)
}

const isMock = env.VITE_DATA_SOURCE_PRODUCTS === 'mock'

export const listProducts = isMock ? listProductsMock : listProductsApi
export const searchProducts = isMock ? searchProductsMock : searchProductsApi
export const createProduct = isMock ? createProductMock : createProductApi
export const updateProduct = isMock ? updateProductMock : updateProductApi

export function getProductServiceHelpers() {
  return {
    mapProductStatusFromApi,
    mapProductStatusToApi,
  }
}
