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

export function useProductsQuery(search?: string) {
  return useQuery({
    queryKey: ['products', { search: search ?? '' }],
    queryFn: () => (search ? searchProducts(search) : listProducts()),
  })
}

export function useCreateProductMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateProductInput) => createProduct(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

export function useUpdateProductMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateProductInput) => updateProduct(input),
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
