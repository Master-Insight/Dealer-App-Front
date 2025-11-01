// src/features/products/services/product-service.ts
import type {
  CreateProductInput,
  Product,
  ProductStatus,
  UpdateProductInput,
} from '@/features/products/types/product'

const STORAGE_KEY = 'dealerapp.products'

function generateId(prefix: string) {
  return typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${prefix}-${Math.random().toString(36).slice(2)}`
}

// TODO MOCK PRODUCTS
const seedProducts: Array<Product> = [
  {
    id: 'pd-001',
    name: 'SUV Atlas',
    model: 'Atlas 2.0 TSI',
    price: 46800000,
    status: 'available',
    description: 'Demo 0 km con paquete tecnología',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: 'pd-002',
    name: 'Sedán Nova',
    model: 'Nova 1.8 AT',
    price: 32250000,
    status: 'reserved',
    description: 'Reservado por cliente corporativo',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: 'pd-003',
    name: 'Pick-up Andina',
    model: 'Andina 4x4 Limited',
    price: 58990000,
    status: 'sold',
    description: 'Vendida con accesorios off-road',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
]

let memoryStore: Array<Product> = [...seedProducts]

function cloneProducts(products: Array<Product>) {
  return products.map((product) => ({ ...product }))
}

function readFromStorage(): Array<Product> {
  if (typeof window === 'undefined' || !('localStorage' in window)) {
    return cloneProducts(memoryStore)
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryStore))
      return cloneProducts(memoryStore)
    }

    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      const restored = parsed
        .filter(
          (candidate): candidate is Partial<Product> =>
            typeof candidate === 'object' && candidate !== null,
        )
        .map((product, index) => ({
          id:
            typeof product.id === 'string'
              ? product.id
              : generateId(`pd-${index}`),
          name:
            typeof product.name === 'string'
              ? product.name
              : 'Producto sin nombre',
          model: typeof product.model === 'string' ? product.model : null,
          price:
            typeof product.price === 'number'
              ? product.price
              : typeof product.price === 'string'
                ? Number.parseFloat(product.price)
                : null,
          status: (product.status as ProductStatus) ?? 'available',
          description:
            typeof product.description === 'string'
              ? product.description
              : null,
          createdAt:
            typeof product.createdAt === 'string'
              ? product.createdAt
              : new Date().toISOString(),
          updatedAt:
            typeof product.updatedAt === 'string'
              ? product.updatedAt
              : new Date().toISOString(),
        }))

      if (restored.length > 0) {
        memoryStore = restored
      }
    }
  } catch (error) {
    console.error('No se pudo leer la base local de productos', error)
  }

  return cloneProducts(memoryStore)
}

function writeToStorage(products: Array<Product>) {
  memoryStore = cloneProducts(products)

  if (typeof window === 'undefined' || !('localStorage' in window)) {
    return
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryStore))
  } catch (error) {
    console.warn('No se pudo guardar la base local de productos', error)
  }
}

export function listProducts(): Promise<Array<Product>> {
  const products = readFromStorage()
  const sorted = [...products].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )
  return Promise.resolve(sorted)
}

export function searchProducts(term: string): Promise<Array<Product>> {
  const normalized = term.trim().toLowerCase()
  if (!normalized) {
    return listProducts()
  }

  const products = readFromStorage()
  return Promise.resolve(
    products.filter((product) => {
      const matchesName = product.name.toLowerCase().includes(normalized)
      const matchesModel = product.model?.toLowerCase().includes(normalized)
      return matchesName || !!matchesModel
    }),
  )
}

export function createProduct(input: CreateProductInput): Promise<Product> {
  const products = readFromStorage()
  const now = new Date().toISOString()

  const product: Product = {
    id: generateId('product'),
    name: input.name.trim(),
    model: input.model?.trim() || null,
    price: typeof input.price === 'number' ? input.price : null,
    status: input.status ?? 'available',
    description: input.description?.trim() || null,
    createdAt: now,
    updatedAt: now,
  }

  const next = [product, ...products]
  writeToStorage(next)
  return Promise.resolve(product)
}

export function updateProduct(input: UpdateProductInput): Promise<Product> {
  const products = readFromStorage()
  const index = products.findIndex((product) => product.id === input.id)
  if (index === -1) {
    throw new Error('No se encontró el producto solicitado.')
  }

  const previous = products[index]
  const updated: Product = {
    ...previous,
    ...('name' in input ? { name: input.name?.trim() || previous.name } : {}),
    ...('model' in input ? { model: input.model?.trim() || null } : {}),
    ...('description' in input
      ? { description: input.description?.trim() || null }
      : {}),
    ...('price' in input
      ? {
          price:
            typeof input.price === 'number'
              ? input.price
              : input.price === null
                ? null
                : previous.price,
        }
      : {}),
    ...('status' in input ? { status: input.status ?? previous.status } : {}),
    updatedAt: new Date().toISOString(),
  }

  const next = [...products]
  next.splice(index, 1, updated)
  writeToStorage(next)
  return Promise.resolve(updated)
}

export function getProductServiceHelpers() {
  return {
    generateId,
  }
}
