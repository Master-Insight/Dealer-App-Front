// src/features/clients/services/client-service.ts
import type { Client, CreateClientInput } from '@/features/clients/types/client'

const STORAGE_KEY = 'dealerapp.clients'

function generateId(prefix: string) {
  return typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${prefix}-${Math.random().toString(36).slice(2)}`
}

// TODO mocks clients
const seedClients: Array<Client> = [
  {
    id: 'cl-001',
    name: 'María González',
    phone: '+54 9 11 2345-6789',
    email: 'maria.gonzalez@example.com',
    documentId: '30123456',
    notes: 'Consulta por plan de financiación SUV',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: 'cl-002',
    name: 'Julián Fernández',
    phone: '+54 9 11 9876-5432',
    email: 'julian.fernandez@example.com',
    documentId: '27999888',
    notes: 'Viene derivado de campaña digital',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    id: 'cl-003',
    name: 'Carla Sosa',
    phone: '+54 9 351 123-4567',
    email: 'carla.sosa@example.com',
    documentId: '32888777',
    notes: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: 'cl-004',
    name: 'Roberto Álvarez',
    phone: '+54 9 11 4444-5555',
    email: null,
    documentId: '30999111',
    notes: 'Solicitó contacto para flota corporativa',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
]

let memoryStore: Array<Client> = [...seedClients]

function normalizePhone(value: string) {
  return value.replace(/[^0-9]/g, '')
}

function cloneClients(clients: Array<Client>) {
  return clients.map((client) => ({ ...client }))
}

function readFromStorage(): Array<Client> {
  if (typeof window === 'undefined' || !('localStorage' in window)) {
    return cloneClients(memoryStore)
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryStore))
      return cloneClients(memoryStore)
    }

    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0) {
      const restored = parsed
        .filter(
          (candidate): candidate is Partial<Client> =>
            typeof candidate === 'object' && candidate !== null,
        )
        .map((client, index) => ({
          id:
            typeof client.id === 'string'
              ? client.id
              : generateId(`restored-${index}`),
          name:
            typeof client.name === 'string'
              ? client.name
              : 'Cliente sin nombre',
          phone: typeof client.phone === 'string' ? client.phone : '',
          email: typeof client.email === 'string' ? client.email : null,
          documentId:
            typeof client.documentId === 'string' ? client.documentId : null,
          notes: typeof client.notes === 'string' ? client.notes : null,
          createdAt:
            typeof client.createdAt === 'string'
              ? client.createdAt
              : new Date().toISOString(),
        }))

      if (restored.length > 0) {
        memoryStore = restored
      }
    }
  } catch (error) {
    console.error('No se pudo leer la base local de clientes', error)
  }

  return cloneClients(memoryStore)
}

function writeToStorage(clients: Array<Client>) {
  memoryStore = cloneClients(clients)

  if (typeof window === 'undefined' || !('localStorage' in window)) {
    return
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryStore))
  } catch (error) {
    console.warn('No se pudo guardar la base local de clientes', error)
  }
}

export function listClients(): Promise<Array<Client>> {
  const clients = readFromStorage()
  const sorted = [...clients].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
  return Promise.resolve(sorted)
}

export async function searchClients(query: string) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) {
    return listClients()
  }

  const clients = await listClients()
  return clients.filter((client) => {
    const matchesName = client.name.toLowerCase().includes(normalized)
    const matchesPhone = normalizePhone(client.phone).includes(
      normalized.replace(/[^0-9]/g, ''),
    )
    const matchesDocument = client.documentId
      ?.toLowerCase()
      .includes(normalized)

    return matchesName || matchesPhone || !!matchesDocument
  })
}

export function createClient(input: CreateClientInput): Promise<Client> {
  const clients = readFromStorage()
  const normalizedPhone = normalizePhone(input.phone)

  const duplicated = clients.find(
    (client) => normalizePhone(client.phone) === normalizedPhone,
  )
  if (duplicated) {
    const error = new Error('Ya existe un cliente registrado con ese teléfono.')
    ;(error as Error & { existingClient?: Client }).existingClient = duplicated
    throw error
  }

  const id = generateId('client')

  const newClient: Client = {
    id,
    name: input.name.trim(),
    phone: input.phone.trim(),
    email: input.email?.trim() || null,
    documentId: input.documentId?.trim() || null,
    notes: input.notes?.trim() || null,
    createdAt: new Date().toISOString(),
  }

  const nextClients = [newClient, ...clients]
  writeToStorage(nextClients)
  return Promise.resolve(newClient)
}

export function findClientByPhone(phone: string): Promise<Client | null> {
  const clients = readFromStorage()
  const normalizedPhone = normalizePhone(phone)
  const client =
    clients.find((item) => normalizePhone(item.phone) === normalizedPhone) ??
    null
  return Promise.resolve(client)
}

export async function getClientSuggestions(value: string) {
  const normalized = value.trim().toLowerCase()
  if (!normalized) return [] as Array<Client>

  const clients = await listClients()
  const normalizedDigits = normalized.replace(/[^0-9]/g, '')

  return clients.filter((client) => {
    const nameMatch = client.name.toLowerCase().includes(normalized)
    const phoneMatch = normalizePhone(client.phone).includes(normalizedDigits)
    return nameMatch || phoneMatch
  })
}

export function getClientServiceHelpers() {
  return {
    normalizePhone,
  }
}
