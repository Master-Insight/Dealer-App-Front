// src/features/products/hooks/use-products.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type {
  CreateProductInput,
  Product,
  UpdateProductInput,
} from '@/features/products/types/product'
import {
  createProduct,
  listProducts,
  searchProducts,
  updateProduct,
} from '@/features/products/services/product-service'
import { useAuth } from '@/features/auth/hooks/use-auth'

export function useProductsQuery(search?: string) {
  const { accessToken, isAuthenticated } = useAuth()

  return useQuery({
    queryKey: ['products', { search: search ?? '', accessToken }],
    queryFn: () => {
      if (!accessToken) {
        return Promise.resolve([] as Array<Product>)
      }

      return search
        ? searchProducts(search, { accessToken })
        : listProducts({ accessToken })
    },
    enabled: isAuthenticated && !!accessToken,
  })
}

export function useCreateProductMutation() {
  const { accessToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateProductInput) => {
      if (!accessToken) {
        return Promise.reject(
          new Error('No hay sesión activa para registrar productos.'),
        )
      }

      return createProduct(input, { accessToken })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

export function useUpdateProductMutation() {
  const { accessToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateProductInput) => {
      if (!accessToken) {
        return Promise.reject(
          new Error('No hay sesión activa para actualizar productos.'),
        )
      }

      return updateProduct(input, { accessToken })
    },
    onSuccess: async (product) => {
      await queryClient.invalidateQueries({ queryKey: ['products'] })
      await queryClient.setQueryData<Array<Product> | undefined>(
        ['products', { search: '' }],
        (previous) =>
          previous?.map((item) => (item.id === product.id ? product : item)),
      )
    },
  })
}

export type { Product }
