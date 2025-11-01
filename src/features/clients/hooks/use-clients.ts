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
import { useAuth } from '@/features/auth/hooks/use-auth'

export function useClientsQuery(search?: string) {
  const { accessToken, isAuthenticated } = useAuth()

  return useQuery({
    queryKey: ['clients', { search: search ?? '', accessToken }],
    queryFn: async () => {
      if (!accessToken) {
        return [] as Array<Client>
      }
      if (search && search.trim().length > 0) {
        return searchClients(search, { accessToken })
      }

      return listClients({ accessToken })
    },
    enabled: isAuthenticated && !!accessToken,
  })
}

export function useClientSuggestions(term: string) {
  const { accessToken, isAuthenticated } = useAuth()

  return useQuery({
    queryKey: ['clients', 'suggestions', term, accessToken],
    queryFn: () => {
      if (!accessToken) {
        return Promise.resolve([] as Array<Client>)
      }

      return getClientSuggestions(term, { accessToken })
    },
    staleTime: 1000 * 60,
    enabled: term.trim().length >= 2 && isAuthenticated && !!accessToken,
  })
}

export function useClientByPhone(phone: string) {
  const { accessToken, isAuthenticated } = useAuth()

  return useQuery({
    queryKey: ['clients', 'by-phone', phone, accessToken],
    queryFn: () => {
      if (!accessToken) {
        return Promise.resolve(null)
      }

      return findClientByPhone(phone, { accessToken })
    },
    enabled: phone.trim().length > 0 && isAuthenticated && !!accessToken,
    staleTime: 1000 * 60,
  })
}

export function useCreateClientMutation() {
  const { accessToken } = useAuth()

  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateClientInput) => {
      if (!accessToken) {
        return Promise.reject(
          new Error('No hay sesión activa para registrar clientes.'),
        )
      }

      return createClient(input, { accessToken })
    },
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
