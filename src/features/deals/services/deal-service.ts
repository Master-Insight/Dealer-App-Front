// src/features/deals/services/deal-service.ts
import type {
  AddDealNoteInput,
  CreateDealInput,
  Deal,
  DealNote,
  DealStatus,
  DealWithRelations,
  UpdateDealStatusInput,
} from '@/features/deals/types/deal'
import { apiClient } from '@/api/clients'
import { env } from '@/env'
import { listClients } from '@/features/clients/services/client-service'
import { listProducts } from '@/features/products/services/product-service'

interface DealServiceOptions {
  accessToken: string
}

type DealStatusApi =
  | 'pending'
  | 'assigned'
  | 'completed'
  | 'lost'
  | 'in_collection'

interface DealApiModel {
  id: string
  company_id?: string | null
  advisor_id?: string | null
  client_id: string
  product_id?: string | null
  scheduled_for: string
  status: DealStatusApi
  notes?: string | null
  created_at: string
  updated_at: string
}

interface DealsCollectionResponse {
  success: boolean
  message: string
  data: Array<DealApiModel>
}

interface DealNoteApiModel {
  id: string
  deal_id: string
  user_id: string
  body: string
  created_at: string
}

const DEAL_STATUS_TO_API: Record<DealStatus, DealStatusApi> = {
  pendiente: 'pending',
  asignada: 'assigned',
  realizada: 'completed',
  perdida: 'lost',
  en_cobro: 'in_collection',
}

const DEAL_STATUS_FROM_API: Record<DealStatusApi, DealStatus> = {
  pending: 'pendiente',
  assigned: 'asignada',
  completed: 'realizada',
  lost: 'perdida',
  in_collection: 'en_cobro',
}

const seedDeals: Array<Deal> = [
  {
    id: '9b3a6a59-7b3d-4c6f-9e64-28f8bf34c8c4',
    company_id: '227fb964-9641-465a-b718-4ba1bc51f803',
    advisor_id: 'f1c3cdb0-1f2c-4a3e-9ae7-933a4d5b4f11',
    client_id: '27dea078-b4f6-40f4-9cae-adb0cbf56c15',
    product_id: '1b802216-6d1a-4ce7-b75f-88f3a5cd2c26',
    scheduled_for: new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString(),
    status: 'pendiente',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    notes: [
      {
        id: 'note-1',
        deal_id: '9b3a6a59-7b3d-4c6f-9e64-28f8bf34c8c4',
        user_id: 'f1c3cdb0-1f2c-4a3e-9ae7-933a4d5b4f11',
        text: 'Confirmar documentación antes de la visita.',
        content: 'Confirmar documentación antes de la visita.',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      },
    ],
  },
  {
    id: '3f4cfb58-3d1a-4db8-8a7f-7f0b00c8f662',
    company_id: '227fb964-9641-465a-b718-4ba1bc51f803',
    advisor_id: 'c2d8a781-9a1a-4418-8f3d-1d63077d1f63',
    client_id: '62a83ce7-72e6-42ac-9cf3-eaa848b7e009',
    product_id: null,
    scheduled_for: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    status: 'asignada',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    notes: [],
  },
  {
    id: 'd27a4b6f-7fb6-4a0c-82da-74ad75e1799b',
    company_id: '227fb964-9641-465a-b718-4ba1bc51f803',
    advisor_id: 'f1c3cdb0-1f2c-4a3e-9ae7-933a4d5b4f11',
    client_id: '2025-11-01T02:55:46.296595Z',
    product_id: 'c7f5b2da-7a70-4df0-82bc-bce094716fd2',
    scheduled_for: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    status: 'en_cobro',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    notes: [
      {
        id: 'note-2',
        deal_id: 'd27a4b6f-7fb6-4a0c-82da-74ad75e1799b',
        user_id: 'c2d8a781-9a1a-4418-8f3d-1d63077d1f63',
        text: 'Cliente envió comprobante de transferencia.',
        content: 'Cliente envió comprobante de transferencia.',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      },
    ],
  },
]

let mockDeals: Array<Deal> = seedDeals.map(cloneDeal)

function cloneDeal(deal: Deal): Deal {
  return {
    ...deal,
    notes: deal.notes.map((note) => ({ ...note })),
  }
}

function ensureAccessToken(options?: DealServiceOptions) {
  if (!options?.accessToken) {
    throw new Error('Se requiere una sesión activa para operar con gestiones.')
  }
  return options.accessToken
}

function mapDealStatusFromApi(status: DealStatusApi): DealStatus {
  if (!Object.prototype.hasOwnProperty.call(DEAL_STATUS_FROM_API, status)) {
    return 'pendiente'
  }
  return DEAL_STATUS_FROM_API[status]
}

function mapDealStatusToApi(status: DealStatus): DealStatusApi {
  return DEAL_STATUS_TO_API[status]
}

function mapDealNote(note: DealNoteApiModel): DealNote {
  return {
    id: note.id,
    deal_id: note.deal_id,
    user_id: note.user_id,
    text: note.body,
    content: note.body,
    created_at: note.created_at,
  }
}

function mapDeal(deal: DealApiModel, notes: Array<DealNote>): Deal {
  return {
    id: deal.id,
    company_id: deal.company_id ?? null,
    advisor_id: deal.advisor_id ?? null,
    client_id: deal.client_id,
    product_id: deal.product_id ?? null,
    scheduled_for: deal.scheduled_for,
    status: mapDealStatusFromApi(deal.status),
    created_at: deal.created_at,
    updated_at: deal.updated_at,
    notes,
  }
}

async function fetchDealNotesApi(
  dealId: string,
  accessToken: string,
): Promise<Array<DealNote>> {
  try {
    const response = await apiClient.request<Array<DealNoteApiModel>>(
      `/deals/${dealId}/notes`,
      {
        method: 'GET',
        accessToken,
      },
    )

    return response.map(mapDealNote)
  } catch (error) {
    console.warn('No se pudieron cargar las notas de la gestión.', error)
    return []
  }
}

async function getDealApi(dealId: string, accessToken: string): Promise<Deal> {
  const response = await apiClient.request<
    { success?: boolean; data?: DealApiModel } | DealApiModel
  >(`/deals/${dealId}`, {
    method: 'GET',
    accessToken,
  })

  const deal = 'data' in response ? response.data : response
  if (!deal) {
    throw new Error('No se encontró la gestión solicitada.')
  }

  const notes = await fetchDealNotesApi(dealId, accessToken)
  return mapDeal(deal, notes)
}

async function listDealsApi(
  options?: DealServiceOptions,
): Promise<Array<Deal>> {
  const accessToken = ensureAccessToken(options)

  const response = await apiClient.request<DealsCollectionResponse>('/deals', {
    method: 'GET',
    accessToken,
    query: { page_size: 100 },
  })

  const deals = await Promise.all(
    response.data.map(async (deal) => {
      const notes = await fetchDealNotesApi(deal.id, accessToken)
      return mapDeal(deal, notes)
    }),
  )

  return deals.sort(
    (a, b) =>
      new Date(b.scheduled_for).getTime() - new Date(a.scheduled_for).getTime(),
  )
}

async function listDealsWithRelationsApi(
  options?: DealServiceOptions,
): Promise<Array<DealWithRelations>> {
  const accessToken = ensureAccessToken(options)

  const [deals, clients, products] = await Promise.all([
    listDeals({ accessToken }),
    listClients({ accessToken }),
    listProducts({ accessToken }),
  ])

  const clientMap = new Map(clients.map((client) => [client.id, client]))
  const productMap = new Map(products.map((product) => [product.id, product]))

  return deals.map((deal) => ({
    ...deal,
    client: clientMap.get(deal.client_id),
    product: deal.product_id ? (productMap.get(deal.product_id) ?? null) : null,
  }))
}

async function searchDealsApi(
  term: string,
  options?: DealServiceOptions,
): Promise<Array<DealWithRelations>> {
  const normalized = term.trim().toLowerCase()
  const deals = await listDealsWithRelationsApi(options)
  if (!normalized) {
    return deals
  }

  return deals.filter((deal) => {
    const matchesStatus = deal.status.toLowerCase().includes(normalized)
    const clientName = deal.client ? deal.client.name.toLowerCase() : ''
    const productBrand = deal.product ? deal.product.brand.toLowerCase() : ''
    const productModel = deal.product ? deal.product.model.toLowerCase() : ''
    const matchesClient = clientName.includes(normalized)
    const matchesProductBrand = productBrand.includes(normalized)
    const matchesProductModel = productModel.includes(normalized)
    const matchesNotes = deal.notes.some((note) =>
      note.text.toLowerCase().includes(normalized),
    )

    return (
      matchesStatus ||
      !!matchesClient ||
      !!matchesProductBrand ||
      !!matchesProductModel ||
      matchesNotes
    )
  })
}

async function createDealApi(
  input: CreateDealInput,
  options?: DealServiceOptions,
): Promise<Deal> {
  const accessToken = ensureAccessToken(options)
  const payload = {
    company_id: input.company_id ?? '227fb964-9641-465a-b718-4ba1bc51f803',
    advisor_id: input.advisor_id ?? null,
    client_id: input.client_id,
    product_id: input.product_id ?? null,
    scheduled_for: input.scheduled_for,
    status: mapDealStatusToApi(input.status),
    notes: input.notes ?? null,
  }

  const response = await apiClient.request<
    { success?: boolean; data?: DealApiModel } | DealApiModel
  >('/deals', {
    method: 'POST',
    accessToken,
    body: payload,
  })

  const deal = 'data' in response ? response.data : response
  if (!deal) {
    throw new Error('No se pudo registrar la gestión.')
  }

  return getDealApi(deal.id, accessToken)
}

async function updateDealStatusApi(
  input: UpdateDealStatusInput,
  options?: DealServiceOptions,
): Promise<Deal> {
  const accessToken = ensureAccessToken(options)
  const payload = {
    advisor_id: input.advisor_id ?? null,
    client_id: input.client_id ?? null,
    product_id: input.product_id ?? null,
    scheduled_for: input.scheduled_for,
    status: mapDealStatusToApi(input.status),
    notes: input.notes ?? null,
  }

  const response = await apiClient.request<
    { success?: boolean; data?: DealApiModel } | DealApiModel
  >(`/deals/${input.id}`, {
    method: 'PATCH',
    accessToken,
    body: payload,
  })

  const deal = 'data' in response ? response.data : response
  if (!deal) {
    throw new Error('No se pudo actualizar la gestión.')
  }

  return getDealApi(deal.id, accessToken)
}

async function addDealNoteApi(
  input: AddDealNoteInput,
  options?: DealServiceOptions,
): Promise<Deal> {
  const accessToken = ensureAccessToken(options)

  await apiClient.request(`/deals/${input.deal_id}/notes`, {
    method: 'POST',
    accessToken,
    body: {
      body: input.text,
      user_id: input.user_id,
    },
  })

  return getDealApi(input.deal_id, accessToken)
}

function listDealsMock(_options?: DealServiceOptions): Promise<Array<Deal>> {
  return Promise.resolve(
    [...mockDeals]
      .map(cloneDeal)
      .sort(
        (a, b) =>
          new Date(b.scheduled_for).getTime() -
          new Date(a.scheduled_for).getTime(),
      ),
  )
}

async function listDealsWithRelationsMock(
  options?: DealServiceOptions,
): Promise<Array<DealWithRelations>> {
  const [deals, clients, products] = await Promise.all([
    listDealsMock(options),
    listClients(options ? { accessToken: options.accessToken } : undefined),
    listProducts(options ? { accessToken: options.accessToken } : undefined),
  ])

  const clientMap = new Map(clients.map((client) => [client.id, client]))
  const productMap = new Map(products.map((product) => [product.id, product]))

  return deals.map((deal) => ({
    ...deal,
    client: clientMap.get(deal.client_id),
    product: deal.product_id ? (productMap.get(deal.product_id) ?? null) : null,
  }))
}

async function searchDealsMock(
  term: string,
  options?: DealServiceOptions,
): Promise<Array<DealWithRelations>> {
  const normalized = term.trim().toLowerCase()
  const deals = await listDealsWithRelationsMock(options)
  if (!normalized) {
    return deals
  }

  return deals.filter((deal) => {
    const matchesStatus = deal.status.toLowerCase().includes(normalized)
    const clientName = deal.client ? deal.client.name.toLowerCase() : ''
    const productBrand = deal.product ? deal.product.brand.toLowerCase() : ''
    const productModel = deal.product ? deal.product.model.toLowerCase() : ''
    const matchesClient = clientName.includes(normalized)
    const matchesProductBrand = productBrand.includes(normalized)
    const matchesProductModel = productModel.includes(normalized)
    const matchesNotes = deal.notes.some((note) =>
      note.text.toLowerCase().includes(normalized),
    )

    return (
      matchesStatus ||
      !!matchesClient ||
      !!matchesProductBrand ||
      !!matchesProductModel ||
      matchesNotes
    )
  })
}

function createDealMock(
  input: CreateDealInput,
  _options?: DealServiceOptions,
): Promise<Deal> {
  const now = new Date().toISOString()
  const deal: Deal = {
    id: `mock-deal-${Math.random().toString(36).slice(2, 10)}`,
    company_id: input.company_id ?? '227fb964-9641-465a-b718-4ba1bc51f803',
    advisor_id: input.advisor_id ?? null,
    client_id: input.client_id,
    product_id: input.product_id ?? null,
    scheduled_for: input.scheduled_for,
    status: input.status,
    created_at: now,
    updated_at: now,
    notes: input.notes
      ? [
          {
            id: `mock-note-${Math.random().toString(36).slice(2, 8)}`,
            deal_id: '',
            user_id: input.advisor_id ?? 'asesor-desconocido',
            text: input.notes,
            content: input.notes,
            created_at: now,
          },
        ]
      : [],
  }

  deal.notes = deal.notes.map((note) => ({ ...note, deal_id: deal.id }))
  mockDeals = [cloneDeal(deal), ...mockDeals]
  return Promise.resolve(cloneDeal(deal))
}

function updateDealStatusMock(
  input: UpdateDealStatusInput,
  _options?: DealServiceOptions,
): Promise<Deal> {
  const index = mockDeals.findIndex((deal) => deal.id === input.id)
  if (index === -1) {
    throw new Error('No se encontró la gestión solicitada.')
  }

  const previous = mockDeals[index]
  const updated: Deal = cloneDeal({
    ...previous,
    advisor_id: input.advisor_id ?? previous.advisor_id,
    client_id: input.client_id ?? previous.client_id,
    product_id: input.product_id ?? previous.product_id,
    scheduled_for: input.scheduled_for,
    status: input.status,
    updated_at: new Date().toISOString(),
  })

  if (input.notes) {
    updated.notes = [
      {
        id: `mock-note-${Math.random().toString(36).slice(2, 8)}`,
        deal_id: updated.id,
        user_id: input.advisor_id ?? 'asesor-desconocido',
        text: input.notes,
        content: input.notes,
        created_at: updated.updated_at,
      },
      ...updated.notes,
    ]
  }

  mockDeals = [
    ...mockDeals.slice(0, index),
    updated,
    ...mockDeals.slice(index + 1),
  ]

  return Promise.resolve(cloneDeal(updated))
}

function addDealNoteMock(
  input: AddDealNoteInput,
  _options?: DealServiceOptions,
): Promise<Deal> {
  const index = mockDeals.findIndex((deal) => deal.id === input.deal_id)
  if (index === -1) {
    throw new Error('No se encontró la gestión solicitada.')
  }

  const now = new Date().toISOString()
  const note: DealNote = {
    id: `mock-note-${Math.random().toString(36).slice(2, 8)}`,
    deal_id: input.deal_id,
    user_id: input.user_id,
    text: input.text,
    content: input.text,
    created_at: now,
  }

  const updated = cloneDeal(mockDeals[index])
  updated.notes = [note, ...updated.notes]
  updated.updated_at = now

  mockDeals = [
    ...mockDeals.slice(0, index),
    updated,
    ...mockDeals.slice(index + 1),
  ]

  return Promise.resolve(cloneDeal(updated))
}

const isMock = env.VITE_DATA_SOURCE_DEALS === 'mock'

export const listDeals = isMock ? listDealsMock : listDealsApi
export const listDealsWithRelations = isMock
  ? listDealsWithRelationsMock
  : listDealsWithRelationsApi
export const searchDeals = isMock ? searchDealsMock : searchDealsApi
export const createDeal = isMock ? createDealMock : createDealApi
export const updateDealStatus = isMock
  ? updateDealStatusMock
  : updateDealStatusApi
export const addDealNote = isMock ? addDealNoteMock : addDealNoteApi

export function getDealServiceHelpers() {
  return {
    mapDealStatusFromApi,
    mapDealStatusToApi,
  }
}
