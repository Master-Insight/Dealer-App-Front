// src/features/deals/types/deal.ts
import type { Client } from '@/features/clients/types/client'
import type { Product } from '@/features/products/types/product'

export type DealStatus =
  | 'pending'
  | 'assigned'
  | 'completed'
  | 'lost'
  | 'in_collection'

export interface DealNote {
  id: string
  content: string
  createdAt: string
  author: string
}

export interface Deal {
  id: string
  title: string
  advisor: string
  clientId: string
  productId: string | null
  status: DealStatus
  scheduledAt: string
  createdAt: string
  notes: Array<DealNote>
}

export interface CreateDealInput {
  title: string
  advisor: string
  clientId: string
  productId?: string | null
  status?: DealStatus
  scheduledAt: string
  note?: string | null
}

export interface UpdateDealStatusInput {
  id: string
  status: DealStatus
}

export interface AddDealNoteInput {
  id: string
  content: string
  author: string
}

export interface DealWithRelations extends Deal {
  client?: Client
  product?: Product | null
}
