// src/features/products/components/product-list.tsx
import { useMemo, useState } from 'react'
import {
  ArrowUpDownIcon,
  BadgeCheckIcon,
  BoxesIcon,
  Loader2Icon,
  SearchIcon,
} from 'lucide-react'

import type { Product, ProductStatus } from '@/features/products/types/product'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  useProductsQuery,
  useUpdateProductMutation,
} from '@/features/products/hooks/use-products'
import { cn } from '@/lib/utils'

const STATUS_LABELS: Record<ProductStatus, { label: string; tone: string }> = {
  available: {
    label: 'Disponible',
    tone: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
  },
  reserved: {
    label: 'Reservado',
    tone: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
  },
  sold: { label: 'Vendido', tone: 'bg-brand-alt/10 text-brand-alt' },
  retired: {
    label: 'Fuera de catálogo',
    tone: 'bg-slate-200 text-slate-700 dark:bg-slate-500/20 dark:text-slate-200',
  },
}

const STATUS_OPTIONS: Array<{ value: ProductStatus; label: string }> = [
  { value: 'available', label: 'Disponible' },
  { value: 'reserved', label: 'Reservado' },
  { value: 'sold', label: 'Vendido' },
  { value: 'retired', label: 'Fuera de catálogo' },
]

const STATUS_FILTERS: Array<{ value: ProductStatus | 'all'; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'available', label: 'Disponibles' },
  { value: 'reserved', label: 'Reservados' },
  { value: 'sold', label: 'Vendidos' },
  { value: 'retired', label: 'Fuera de catálogo' },
]

function formatCurrency(value: number | null | undefined) {
  if (!value && value !== 0) return 'Sin precio'

  try {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(value)
  } catch (_error) {
    return `${value}`
  }
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/50 bg-card/60 p-10 text-center text-sm text-foreground/70">
      <BoxesIcon className="size-6 text-brand" />
      <div>
        <p className="font-semibold text-foreground">Sin productos cargados</p>
        <p className="text-xs text-foreground/60">
          Registra tu stock para relacionarlo con nuevas gestiones.
        </p>
      </div>
    </div>
  )
}

function ProductRow({ product }: { product: Product }) {
  const updatedAt = useMemo(
    () => new Date(product.updated_at),
    [product.updated_at],
  )
  const updatedLabel = updatedAt.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
  })

  const statusBadge = STATUS_LABELS[product.state]

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-border/50 bg-card/70 p-5 shadow-sm transition hover:border-brand/40 hover:shadow-lg">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            {product.name}
          </h3>
          {product.model ? (
            <p className="text-xs uppercase tracking-[0.35em] text-foreground/60">
              {product.model}
            </p>
          ) : null}
        </div>
        <span
          className={cn(
            'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
            statusBadge.tone,
          )}
        >
          <BadgeCheckIcon className="size-3" />
          {statusBadge.label}
        </span>
      </header>

      {product.description ? (
        <p className="text-sm text-foreground/70">{product.description}</p>
      ) : null}

      <footer className="flex flex-wrap items-center justify-between gap-3 text-xs text-foreground/60">
        <span className="rounded-full border border-border/50 px-3 py-1 font-semibold text-foreground">
          {formatCurrency(product.price ?? null)}
        </span>
        <span className="rounded-full border border-border/40 px-3 py-1">
          Actualizado {updatedLabel}
        </span>
      </footer>
    </article>
  )
}

export function ProductList() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProductStatus | 'all'>('all')

  const { data: products = [], isLoading } = useProductsQuery(search)
  const updateProductMutation = useUpdateProductMutation()

  const filteredProducts = useMemo(() => {
    if (statusFilter === 'all') return products
    return products.filter((product) => product.status === statusFilter)
  }, [products, statusFilter])

  const handleStatusChange = async (
    product: Product,
    nextStatus: ProductStatus,
  ) => {
    try {
      await updateProductMutation.mutateAsync({
        id: product.id,
        status: nextStatus,
      })
    } catch (error) {
      console.error('No se pudo actualizar el producto', error)
    }
  }

  return (
    <Card className="border-border/50 shadow-[var(--shadow-soft)]">
      <CardHeader className="gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-semibold">
              Stock comercial
            </CardTitle>
            <CardDescription>
              Gestiona la disponibilidad de vehículos para vincularlos con
              gestiones.
            </CardDescription>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="flex items-center gap-2 rounded-full border border-border/40 bg-background px-4 py-2 text-xs font-medium uppercase tracking-[0.35em] text-foreground/60">
              <SearchIcon className="size-3.5" /> Buscar
            </label>
            <select
              className="rounded-xl border border-border/60 bg-background px-3 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as ProductStatus | 'all')
              }
            >
              {STATUS_FILTERS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por modelo, versión o nombre"
        />
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <p className="flex items-center gap-2 text-sm text-foreground/70">
            <Loader2Icon className="size-4 animate-spin" /> Cargando
            productos...
          </p>
        ) : filteredProducts.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {filteredProducts.map((product) => (
              <div key={product.id} className="space-y-3">
                <ProductRow product={product} />
                <div className="flex items-center justify-between gap-2 rounded-xl border border-border/50 bg-muted/40 px-3 py-2 text-xs text-foreground/60">
                  <span className="flex items-center gap-2">
                    <ArrowUpDownIcon className="size-4" /> Cambiar estado
                  </span>
                  <select
                    className="rounded-lg border border-border/40 bg-background px-2 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    value={product.status}
                    onChange={(event) =>
                      handleStatusChange(
                        product,
                        event.target.value as ProductStatus,
                      )
                    }
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
