// src/features/products/components/product-list.tsx
import { useMemo, useState } from 'react'
import {
  ArrowUpDownIcon,
  BoxesIcon,
  CalendarIcon,
  FuelIcon,
  GaugeIcon,
  Loader2Icon,
  MapPinIcon,
  SearchIcon,
  Settings2Icon,
  TagIcon,
} from 'lucide-react'

import type {
  Product,
  ProductStatus,
  UpdateProductInput,
} from '@/features/products/types/product'
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
  disponible: {
    label: 'Disponible',
    tone: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
  },
  reservado: {
    label: 'Reservado',
    tone: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
  },
  vendido: { label: 'Vendido', tone: 'bg-brand-alt/10 text-brand-alt' },
  baja: {
    label: 'Fuera de catálogo',
    tone: 'bg-slate-200 text-slate-700 dark:bg-slate-500/20 dark:text-slate-200',
  },
}

const STATUS_OPTIONS: Array<{ value: ProductStatus; label: string }> = [
  { value: 'disponible', label: 'Disponible' },
  { value: 'reservado', label: 'Reservado' },
  { value: 'vendido', label: 'Vendido' },
  { value: 'baja', label: 'Fuera de catálogo' },
]

const STATUS_FILTERS: Array<{ value: ProductStatus | 'all'; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'disponible', label: 'Disponibles' },
  { value: 'reservado', label: 'Reservados' },
  { value: 'vendido', label: 'Vendidos' },
  { value: 'baja', label: 'Fuera de catálogo' },
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

function buildUpdatePayload(
  product: Product,
  nextStatus: ProductStatus,
): UpdateProductInput {
  return {
    id: product.id,
    brand: product.brand,
    model: product.model,
    variant: product.variant ?? null,
    year: product.year ?? null,
    mileage: product.mileage ?? null,
    fuel_type: product.fuel_type ?? null,
    transmission: product.transmission ?? null,
    color: product.color ?? null,
    doors: product.doors ?? null,
    location: product.location ?? null,
    state: nextStatus,
    description: product.description ?? null,
    active: product.active ?? true,
    price: product.price ?? null,
    labels: product.labels ?? null,
    vehicle_type: product.vehicle_type ?? null,
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

  // 🔹 Color del estado visual
  const statusColor = {
    disponible: 'bg-green-500/10 text-green-700 border-green-500/30',
    reservado: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/30',
    vendido: 'bg-red-500/10 text-red-700 border-red-500/30',
    baja: 'bg-gray-400/10 text-gray-700 border-gray-400/30',
  }[product.state]

  return (
    <li className="grid gap-3 rounded-2xl border border-border/40 bg-card/70 p-5 shadow-sm transition hover:border-brand/40 hover:shadow-md md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div className="space-y-1">
        <p className="text-base font-semibold text-foreground">
          {product.brand} {product.model}
          {product.variant ? (
            <span className="text-foreground/60"> • {product.variant}</span>
          ) : null}
        </p>

        {/* Subdetalles del vehículo */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-foreground/70">
          {product.year ? (
            <span className="inline-flex items-center gap-1">
              <CalendarIcon className="size-3.5" />
              {product.year}
            </span>
          ) : null}
          {product.mileage ? (
            <span className="inline-flex items-center gap-1">
              <GaugeIcon className="size-3.5" />
              {product.mileage.toLocaleString()} km
            </span>
          ) : null}
          {product.fuel_type ? (
            <span className="inline-flex items-center gap-1">
              <FuelIcon className="size-3.5" />
              {product.fuel_type}
            </span>
          ) : null}
          {product.transmission ? (
            <span className="inline-flex items-center gap-1">
              <Settings2Icon className="size-3.5" />
              {product.transmission}
            </span>
          ) : null}
          {product.color ? (
            <span className="inline-flex items-center gap-1">
              <TagIcon className="size-3.5" />
              {product.color}
            </span>
          ) : null}
        </div>

        {/* Ubicación y precio */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-foreground/70">
          {product.location ? (
            <span className="inline-flex items-center gap-1">
              <MapPinIcon className="size-3.5" />
              {product.location}
            </span>
          ) : null}
          <span className="font-semibold text-foreground">
            {formatCurrency(product.price ?? null)}
          </span>
        </div>
      </div>

      {/* Estado y fecha */}
      <div className="flex flex-col items-end justify-between text-xs text-foreground/50 md:items-end">
        <span
          className={cn(
            'inline-flex items-center gap-2 rounded-full border px-3 py-1 font-medium uppercase tracking-wide transition',
            statusColor,
          )}
        >
          {product.state}
        </span>

        <span className="mt-2 inline-flex items-center gap-2 rounded-full bg-muted/40 px-3 py-1 font-medium uppercase tracking-wide">
          <CalendarIcon className="size-3" />
          ACT: {updatedLabel}
        </span>
      </div>
    </li>
  )
}

// 🔹 Lista principal
export function ProductList() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProductStatus | 'all'>('all')

  const { data: products = [], isLoading } = useProductsQuery(search)

  const updateProductMutation = useUpdateProductMutation()

  const filteredProducts = useMemo(() => {
    if (statusFilter === 'all') return products
    return products.filter((product) => product.state === statusFilter)
  }, [products, statusFilter])

  const handleStatusChange = async (
    product: Product,
    nextStatus: ProductStatus,
  ) => {
    try {
      await updateProductMutation.mutateAsync(
        buildUpdatePayload(product, nextStatus),
      )
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
                    value={product.state}
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
