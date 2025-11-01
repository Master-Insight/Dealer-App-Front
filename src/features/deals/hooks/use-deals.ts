// src/features/deals/hooks/use-deals.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type {
  AddDealNoteInput,
  CreateDealInput,
  Deal,
  DealWithRelations,
  UpdateDealStatusInput,
} from '@/features/deals/types/deal'
import {
  addDealNote,
  createDeal,
  listDealsWithRelations,
  searchDeals,
  updateDealStatus,
} from '@/features/deals/services/deal-service'

export function useDealsQuery(search?: string) {
  return useQuery({
    queryKey: ['deals', { search: search ?? '' }],
    queryFn: () => (search ? searchDeals(search) : listDealsWithRelations()),
  })
}

export function useCreateDealMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateDealInput) => createDeal(input),
    onSuccess: async (deal) => {
      await queryClient.invalidateQueries({ queryKey: ['deals'] })
      await queryClient.invalidateQueries({ queryKey: ['clients'] })
      await queryClient.invalidateQueries({ queryKey: ['products'] })
      return deal
    },
  })
}

export function useUpdateDealStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateDealStatusInput) => updateDealStatus(input),
    onSuccess: async (deal) => {
      await queryClient.invalidateQueries({ queryKey: ['deals'] })
      return deal
    },
  })
}

export function useAddDealNoteMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: AddDealNoteInput) => addDealNote(input),
    onSuccess: async (deal) => {
      await queryClient.invalidateQueries({ queryKey: ['deals'] })
      return deal
    },
  })
}

export type { Deal, DealWithRelations }
