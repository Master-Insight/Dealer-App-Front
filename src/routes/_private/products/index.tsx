import { createFileRoute } from '@tanstack/react-router'

import { ProductForm } from '@/features/products/components/product-form'
import { ProductList } from '@/features/products/components/product-list'
import { useProductsQuery } from '@/features/products/hooks/use-products'

export const Route = createFileRoute('/_private/products/')({
  component: ProductsPage,
})

function ProductsPage() {
  const { data: products = [] } = useProductsQuery()

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.5fr)_minmax(0,1fr)]">
      <ProductForm products={products} />
      <ProductList />
    </div>
  )
}
