// src/features/clients/services/client-service.ts
import type { Client, CreateClientInput } from '@/features/clients/types/client'
import { apiClient } from '@/api/clients'
import { env } from '@/env'

interface ClientServiceOptions {
  accessToken: string
}

// 🔹 Modelo real del backend
interface ClientApiModel {
  id: string
  company_id: string
  name: string
  email: string | null
  phone: string
  dni: string | null
  address: string | null
  city: string | null
  province: string | null
  created_at: string
}

interface ClientsCollectionResponse {
  success: boolean
  message: string
  data: Array<ClientApiModel>
}

// 🔹 MOCK DE CLIENTES
const seedClients: Array<Client> = [
  {
    id: '27dea078-b4f6-40f4-9cae-adb0cbf56c15',
    name: 'María González',
    phone: '+54 9 11 2345-6789',
    email: 'maria.gonzalez@example.com',
    dni: '30123456',
    address: 'direccion 1',
    city: 'Cordoba',
    province: 'Cordoba',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: '62a83ce7-72e6-42ac-9cf3-eaa848b7e009',
    name: 'Julián Fernández',
    phone: '+54 9 11 9876-5432',
    email: 'julian.fernandez@example.com',
    dni: '27999888',
    address: 'direccion 1',
    city: 'Capital',
    province: 'Capital',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    id: '2025-11-01T02:55:46.296595Z',
    name: 'Carla Sosa',
    phone: '+54 9 351 123-4567',
    email: 'carla.sosa@example.com',
    dni: '32888777',
    address: null,
    city: 'Cordoba',
    province: 'Cordoba',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: '227fb964-9641-465a-b718-4ba1bc51f803',
    name: 'Roberto Álvarez',
    phone: '+54 9 11 4444-5555',
    email: null,
    dni: '30999111',
    address: null,
    city: null,
    province: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
]

function ensureAccessToken(options?: ClientServiceOptions) {
  if (!options?.accessToken) {
    throw new Error('Se requiere una sesión activa para operar con clientes.')
  }
  return options.accessToken
}

function mapClient(client: ClientApiModel): Client {
  return {
    id: client.id,
    name: client.name,
    phone: client.phone,
    email: client.email,
    dni: client.dni,
    address: client.address,
    city: client.city,
    province: client.province,
    created_at: client.created_at,
  }
}

function normalizePhone(value: string) {
  return value.replace(/[^0-9]/g, '')
}

// 🔹 API MODE (real)
export async function listClientsApi(
  options?: ClientServiceOptions,
): Promise<Array<Client>> {
  const accessToken = ensureAccessToken(options)

  const response = await apiClient.request<ClientsCollectionResponse>(
    '/clients',
    {
      method: 'GET',
      accessToken,
      query: { page_size: 100 },
    },
  )

  return response.data
    .map(mapClient)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
}

export async function searchClientsApi(
  query: string,
  options?: ClientServiceOptions,
): Promise<Array<Client>> {
  const accessToken = ensureAccessToken(options)
  const normalized = query.trim()

  const response = await apiClient.request<ClientsCollectionResponse>(
    '/clients',
    {
      method: 'GET',
      accessToken,
      query: {
        page_size: 50,
        ...(normalized ? { search: normalized } : {}),
      },
    },
  )

  const clients = response.data.map(mapClient)
  if (!normalized) {
    return clients
  }

  const normalizedDigits = normalizePhone(normalized)
  return clients.filter((client) => {
    const matchesName = client.name
      .toLowerCase()
      .includes(normalized.toLowerCase())
    const matchesPhone = normalizePhone(client.phone).includes(normalizedDigits)
    const matchesDocument = client.dni
      ?.toLowerCase()
      .includes(normalized.toLowerCase())

    return matchesName || matchesPhone || !!matchesDocument
  })
}

export async function createClientApi(
  input: CreateClientInput,
  options?: ClientServiceOptions,
): Promise<Client> {
  const accessToken = ensureAccessToken(options)

  const payload = {
    company_id: input.company_id ?? '227fb964-9641-465a-b718-4ba1bc51f803', // opcional por ahora
    name: input.name.trim(),
    phone: input.phone.trim(),
    email: input.email?.trim() || null,
    dni: input.dni?.trim() || null,
    address: input.address?.trim() || null,
    city: input.city?.trim() || null,
    province: input.province?.trim() || null,
  }

  const response = await apiClient.request<{
    success: boolean
    message: string
    data: ClientApiModel
  }>('/clients', {
    method: 'POST',
    accessToken,
    body: payload,
  })

  if (!response.success || !response.data) {
    throw new Error('Error al crear el cliente.')
  }

  return mapClient(response.data)
}

// 🔹 MOCK MODE
async function listClientsMock(): Promise<Array<Client>> {
  return seedClients
}

async function searchClientsMock(query: string): Promise<Array<Client>> {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return seedClients
  return seedClients.filter(
    (client) =>
      client.name.toLowerCase().includes(normalized) ||
      client.phone.includes(normalized),
  )
}

async function createClientMock(input: CreateClientInput): Promise<Client> {
  const client: Client = {
    id: `mock-${Math.random().toString(36).slice(2, 8)}`,
    name: input.name,
    phone: input.phone,
    email: input.email ?? null,
    dni: input.dni ?? null,
    address: input.address ?? null,
    city: input.city ?? null,
    province: input.province ?? null,
    created_at: new Date().toISOString(),
  }
  seedClients.unshift(client)
  return client
}

// 🔹 EXPORT SELECTOR
const isMock = env.VITE_DATA_SOURCE_CLIENTS === 'mock'

export const listClients = isMock ? listClientsMock : listClientsApi
export const searchClients = isMock ? searchClientsMock : searchClientsApi
export const createClient = isMock ? createClientMock : createClientApi

export async function findClientByPhone(
  phone: string,
  options?: ClientServiceOptions,
): Promise<Client | null> {
  const normalizedPhone = normalizePhone(phone)
  if (!normalizedPhone) {
    return null
  }

  const clients = await searchClients(phone, options)
  return (
    clients.find(
      (client) => normalizePhone(client.phone) === normalizedPhone,
    ) ?? null
  )
}

export async function getClientSuggestions(
  value: string,
  options?: ClientServiceOptions,
): Promise<Array<Client>> {
  const normalized = value.trim()
  if (!normalized) {
    return []
  }

  const clients = await searchClients(normalized, options)
  return clients.slice(0, 10)
}

// Helpers
export function getClientServiceHelpers() {
  return {
    normalizePhone,
  }
}
