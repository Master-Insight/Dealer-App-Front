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
import { useAuth } from '@/features/auth/hooks/use-auth'

export function useDealsQuery(search?: string) {
  const { accessToken, isAuthenticated } = useAuth()

  return useQuery({
    queryKey: ['deals', { search: search ?? '', accessToken }],
    queryFn: () => {
      if (!accessToken) {
        return Promise.resolve([] as Array<DealWithRelations>)
      }

      return search
        ? searchDeals(search, { accessToken })
        : listDealsWithRelations({ accessToken })
    },
    enabled: isAuthenticated && !!accessToken,
  })
}

export function useCreateDealMutation() {
  const { accessToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateDealInput) => {
      if (!accessToken) {
        return Promise.reject(
          new Error('No hay sesión activa para registrar gestiones.'),
        )
      }

      return createDeal(input, { accessToken })
    },
    onSuccess: async (deal) => {
      await queryClient.invalidateQueries({ queryKey: ['deals'] })
      await queryClient.invalidateQueries({ queryKey: ['clients'] })
      await queryClient.invalidateQueries({ queryKey: ['products'] })
      return deal
    },
  })
}

export function useUpdateDealStatusMutation() {
  const { accessToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateDealStatusInput) => {
      if (!accessToken) {
        return Promise.reject(
          new Error('No hay sesión activa para actualizar gestiones.'),
        )
      }

      return updateDealStatus(input, { accessToken })
    },
    onSuccess: async (deal) => {
      await queryClient.invalidateQueries({ queryKey: ['deals'] })
      return deal
    },
  })
}

export function useAddDealNoteMutation() {
  const { accessToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: AddDealNoteInput) => {
      if (!accessToken) {
        return Promise.reject(
          new Error('No hay sesión activa para registrar notas.'),
        )
      }

      return addDealNote(input, { accessToken })
    },
    onSuccess: async (deal) => {
      await queryClient.invalidateQueries({ queryKey: ['deals'] })
      return deal
    },
  })
}

export type { Deal, DealWithRelations }
