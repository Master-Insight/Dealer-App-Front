// src/features/clients/hooks/use-clients.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { Client, CreateClientInput } from '@/features/clients/types/client'
import {
  createClient,
  findClientByPhone,
  getClientSuggestions,
  listClients,
  searchClients,
} from '@/features/clients/services/client-service'

export function useClientsQuery(search?: string) {
  return useQuery({
    queryKey: ['clients', { search: search ?? '' }],
    queryFn: async () => {
      if (search && search.trim().length > 0) {
        return searchClients(search)
      }

      return listClients()
    },
  })
}

export function useClientSuggestions(term: string) {
  return useQuery({
    queryKey: ['clients', 'suggestions', term],
    queryFn: () => getClientSuggestions(term),
    staleTime: 1000 * 60,
    enabled: term.trim().length >= 2,
  })
}

export function useClientByPhone(phone: string) {
  return useQuery({
    queryKey: ['clients', 'by-phone', phone],
    queryFn: () => findClientByPhone(phone),
    enabled: phone.trim().length > 0,
    staleTime: 1000 * 60,
  })
}

export function useCreateClientMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateClientInput) => createClient(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['clients'] })
      await queryClient.invalidateQueries({
        queryKey: ['clients', 'suggestions'],
      })
    },
  })
}

export function useClientListData(search: string) {
  const clientsQuery = useClientsQuery(search)
  return clientsQuery
}

export type { Client }
