// src/features/clients/types/client.ts
export interface Client {
  id: string
  name: string
  phone: string
  email?: string | null
  dni?: string | null
  address?: string | null
  city?: string | null
  province?: string | null
  created_at: string
}

export interface CreateClientInput {
  company_id?: string
  name: string
  phone: string
  email?: string | null
  dni?: string | null
  address?: string | null
  city?: string | null
  province?: string | null
}

export type ClientSearchParams = {
  query?: string
}
