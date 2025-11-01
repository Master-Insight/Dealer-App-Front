// src/features/deals/services/deal-service.ts
import type {
  AddDealNoteInput,
  CreateDealInput,
  Deal,
  DealStatus,
  DealWithRelations,
  UpdateDealStatusInput,
} from '@/features/deals/types/deal'
import { listClients } from '@/features/clients/services/client-service'
import { listProducts } from '@/features/products/services/product-service'

const STORAGE_KEY = 'dealerapp.deals'

function generateId(prefix: string) {
  return typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${prefix}-${Math.random().toString(36).slice(2)}`
}

const seedDeals: Array<Deal> = [
  {
    id: 'dl-001',
    title: 'Entrega SUV Atlas',
    advisor: 'Ayelén Ruiz',
    clientId: 'cl-001',
    productId: 'pd-001',
    status: 'assigned',
    scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    notes: [
      {
        id: 'note-1',
        author: 'Ayelén Ruiz',
        content:
          'Cliente confirmó visita presencial para revisar financiación.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      },
    ],
  },
  {
    id: 'dl-002',
    title: 'Cotización flota corporativa',
    advisor: 'Equipo Venta Digital',
    clientId: 'cl-004',
    productId: null,
    status: 'pending',
    scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    notes: [],
  },
  {
    id: 'dl-003',
    title: 'Seguimiento post test drive',
    advisor: 'Mauro Benítez',
    clientId: 'cl-002',
    productId: 'pd-002',
    status: 'in_collection',
    scheduledAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    notes: [
      {
        id: 'note-2',
        author: 'Mauro Benítez',
        content: 'Enviada documentación a administración.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      },
    ],
  },
]

let memoryStore: Array<Deal> = [...seedDeals]

function cloneDeals(deals: Array<Deal>) {
  return deals.map((deal) => ({
    ...deal,
    notes: deal.notes.map((note) => ({ ...note })),
  }))
}

function readFromStorage(): Array<Deal> {
  if (typeof window === 'undefined' || !('localStorage' in window)) {
    return cloneDeals(memoryStore)
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryStore))
      return cloneDeals(memoryStore)
    }

    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      const restored = parsed
        .filter(
          (candidate): candidate is Partial<Deal> =>
            typeof candidate === 'object' && candidate !== null,
        )
        .map((deal, index) => ({
          id: typeof deal.id === 'string' ? deal.id : generateId(`dl-${index}`),
          title:
            typeof deal.title === 'string' ? deal.title : 'Gestión sin título',
          advisor: typeof deal.advisor === 'string' ? deal.advisor : 'Asesor',
          clientId:
            typeof deal.clientId === 'string' ? deal.clientId : 'unknown',
          productId:
            typeof deal.productId === 'string'
              ? deal.productId
              : deal.productId === null
                ? null
                : null,
          status: (deal.status as DealStatus) ?? 'pending',
          scheduledAt:
            typeof deal.scheduledAt === 'string'
              ? deal.scheduledAt
              : new Date().toISOString(),
          createdAt:
            typeof deal.createdAt === 'string'
              ? deal.createdAt
              : new Date().toISOString(),
          notes: Array.isArray(deal.notes)
            ? deal.notes
                .filter(
                  (candidate): candidate is Partial<Deal['notes'][number]> =>
                    typeof candidate === 'object' && candidate !== null,
                )
                .map((note, noteIndex) => ({
                  id:
                    typeof note.id === 'string'
                      ? note.id
                      : generateId(`note-${index}-${noteIndex}`),
                  content:
                    typeof note.content === 'string'
                      ? note.content
                      : 'Nota sin contenido',
                  author:
                    typeof note.author === 'string' ? note.author : 'Asesor',
                  createdAt:
                    typeof note.createdAt === 'string'
                      ? note.createdAt
                      : new Date().toISOString(),
                }))
            : [],
        }))

      if (restored.length > 0) {
        memoryStore = restored
      }
    }
  } catch (error) {
    console.error('No se pudo leer la base local de gestiones', error)
  }

  return cloneDeals(memoryStore)
}

function writeToStorage(deals: Array<Deal>) {
  memoryStore = cloneDeals(deals)

  if (typeof window === 'undefined' || !('localStorage' in window)) {
    return
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryStore))
  } catch (error) {
    console.warn('No se pudo guardar la base local de gestiones', error)
  }
}

export function listDeals(): Promise<Array<Deal>> {
  const deals = readFromStorage()
  const sorted = [...deals].sort(
    (a, b) =>
      new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
  )
  return Promise.resolve(sorted)
}

export async function listDealsWithRelations(): Promise<
  Array<DealWithRelations>
> {
  const [deals, clients, products] = await Promise.all([
    listDeals(),
    listClients(),
    listProducts(),
  ])

  const clientMap = new Map(clients.map((client) => [client.id, client]))
  const productMap = new Map(products.map((product) => [product.id, product]))

  return deals.map((deal) => ({
    ...deal,
    client: clientMap.get(deal.clientId),
    product: deal.productId ? (productMap.get(deal.productId) ?? null) : null,
  }))
}

export async function searchDeals(
  term: string,
): Promise<Array<DealWithRelations>> {
  const normalized = term.trim().toLowerCase()
  const deals = await listDealsWithRelations()
  if (!normalized) return deals

  return deals.filter((deal) => {
    const matchesTitle = deal.title.toLowerCase().includes(normalized)
    const matchesAdvisor = deal.advisor.toLowerCase().includes(normalized)
    const matchesClient = deal.client?.name.toLowerCase().includes(normalized)
    const matchesProduct = deal.product?.name.toLowerCase().includes(normalized)
    return matchesTitle || matchesAdvisor || !!matchesClient || !!matchesProduct
  })
}

export function createDeal(input: CreateDealInput): Promise<Deal> {
  const deals = readFromStorage()
  const now = new Date().toISOString()

  const deal: Deal = {
    id: generateId('deal'),
    title: input.title.trim(),
    advisor: input.advisor.trim(),
    clientId: input.clientId,
    productId: input.productId ?? null,
    status: input.status ?? 'pending',
    scheduledAt: input.scheduledAt,
    createdAt: now,
    notes: input.note
      ? [
          {
            id: generateId('note'),
            author: input.advisor.trim() || 'Asesor',
            content: input.note,
            createdAt: now,
          },
        ]
      : [],
  }

  const next = [deal, ...deals]
  writeToStorage(next)
  return Promise.resolve(deal)
}

export function updateDealStatus(input: UpdateDealStatusInput): Promise<Deal> {
  const deals = readFromStorage()
  const index = deals.findIndex((deal) => deal.id === input.id)
  if (index === -1) {
    throw new Error('No se encontró la gestión solicitada.')
  }

  const previous = deals[index]
  const updated: Deal = {
    ...previous,
    status: input.status,
  }

  const next = [...deals]
  next.splice(index, 1, updated)
  writeToStorage(next)
  return Promise.resolve(updated)
}

export function addDealNote(input: AddDealNoteInput): Promise<Deal> {
  const deals = readFromStorage()
  const index = deals.findIndex((deal) => deal.id === input.id)
  if (index === -1) {
    throw new Error('No se encontró la gestión solicitada.')
  }

  const note = {
    id: generateId('note'),
    content: input.content,
    author: input.author,
    createdAt: new Date().toISOString(),
  }

  const updated: Deal = {
    ...deals[index],
    notes: [note, ...deals[index].notes],
  }

  const next = [...deals]
  next.splice(index, 1, updated)
  writeToStorage(next)
  return Promise.resolve(updated)
}

export function getDealServiceHelpers() {
  return { generateId }
}
