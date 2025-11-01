// src/features/deals/types/deal.ts
import type { Client } from '@/features/clients/types/client'
import type { Product } from '@/features/products/types/product'

export type DealStatus =
  | 'pendiente'
  | 'asignada'
  | 'realizada'
  | 'perdida'
  | 'en_cobro'

export interface DealNote {
  id: string
  content: string
  created_at: string
  user_id: string
  text: string
}

export interface Deal {
  id: string
  advisor_id?: string | null
  client_id: string
  product_id?: string | null
  scheduled_for: string
  status: DealStatus
  // notes?: string | null
  created_at: string
  notes: Array<DealNote>
}

export interface CreateDealInput {
  company_id?: string | null
  advisor_id?: string | null
  client_id: string
  product_id?: string | null
  scheduled_for: string
  status: DealStatus
  notes?: string | null
}

export interface UpdateDealStatusInput {
  id: string
  advisor_id?: string | null
  client_id?: string | null
  product_id?: string | null
  scheduled_for: string
  status: DealStatus
  notes?: string | null
}

export interface AddDealNoteInput {
  user_id: string
  text: string
}

export interface DealWithRelations extends Deal {
  client?: Client
  product?: Product | null
}
