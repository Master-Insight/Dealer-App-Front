// src/features/clients/types/client.ts
export interface Client {
  id: string
  name: string
  phone: string
  email?: string | null
  documentId?: string | null
  notes?: string | null
  createdAt: string
}

export interface CreateClientInput {
  name: string
  phone: string
  email?: string | null
  documentId?: string | null
  notes?: string | null
}

export type ClientSearchParams = {
  query?: string
}
