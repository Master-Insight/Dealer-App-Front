// src/features/products/components/product-form.tsx
import { useMemo, useState } from 'react'
import {
  CheckIcon,
  Loader2Icon,
  PlusCircleIcon,
  SparklesIcon,
} from 'lucide-react'

import type { Product, ProductStatus } from '@/features/products/types/product'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateProductMutation } from '@/features/products/hooks/use-products'

const STATUS_OPTIONS: Array<{ value: ProductStatus; label: string }> = [
  { value: 'available', label: 'Disponible' },
  { value: 'reserved', label: 'Reservado' },
  { value: 'sold', label: 'Vendido' },
  { value: 'retired', label: 'Fuera de catálogo' },
]

interface ProductFormProps {
  products: Array<Product>
}

export function ProductForm({ products }: ProductFormProps) {
  const [formState, setFormState] = useState({
    name: '',
    model: '',
    price: '',
    status: 'available' as ProductStatus,
    description: '',
  })
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const createProductMutation = useCreateProductMutation()

  const duplicatedName = useMemo(() => {
    const normalized = formState.name.trim().toLowerCase()
    if (normalized.length < 3) return null

    return (
      products.find((product) => product.name.toLowerCase() === normalized) ??
      null
    )
  }, [formState.name, products])

  const handleChange =
    (field: keyof typeof formState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value
      setFormState((prev) => ({ ...prev, [field]: value }))
      setSuccessMessage(null)
      setErrorMessage(null)
    }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!formState.name.trim()) {
      setErrorMessage('El nombre del producto es obligatorio.')
      return
    }

    try {
      await createProductMutation.mutateAsync({
        name: formState.name,
        model: formState.model || null,
        price: formState.price ? Number.parseFloat(formState.price) : null,
        status: formState.status,
        description: formState.description || null,
      })
      setSuccessMessage('Producto registrado correctamente.')
      setFormState({
        name: '',
        model: '',
        price: '',
        status: 'available',
        description: '',
      })
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No se pudo guardar el producto, intenta nuevamente.'
      setErrorMessage(message)
    }
  }

  return (
    <Card className="border-border/50 shadow-[var(--shadow-soft)]">
      <CardHeader className="space-y-2">
        <CardTitle className="flex items-center gap-2 text-xl font-semibold">
          <PlusCircleIcon className="size-5 text-brand" />
          Nuevo producto
        </CardTitle>
        <CardDescription>
          Registra unidades disponibles con precio y estado comercial.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="product-name">Nombre comercial</Label>
            <Input
              id="product-name"
              placeholder="Ej: SUV Atlas"
              value={formState.name}
              onChange={handleChange('name')}
              required
            />
            {duplicatedName ? (
              <p className="text-xs font-medium text-brand">
                Ya tienes un producto llamado "{duplicatedName.name}". Revisa el
                stock antes de crear uno nuevo.
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,0.6fr)]">
            <div className="space-y-2">
              <Label htmlFor="product-model">Versión / modelo</Label>
              <Input
                id="product-model"
                placeholder="Ej: Atlas 2.0 TSI"
                value={formState.model}
                onChange={handleChange('model')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-price">Precio</Label>
              <Input
                id="product-price"
                type="number"
                min={0}
                step={1000}
                placeholder="Ej: 46800000"
                value={formState.price}
                onChange={handleChange('price')}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="product-status">Estado comercial</Label>
              <select
                id="product-status"
                className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                value={formState.status}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    status: event.target.value as ProductStatus,
                  }))
                }
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-description">Destacado</Label>
              <Input
                id="product-description"
                placeholder="Ej: Único dueño, paquete tecnología"
                value={formState.description}
                onChange={handleChange('description')}
              />
            </div>
          </div>

          {errorMessage ? (
            <p className="text-sm font-medium text-destructive">
              {errorMessage}
            </p>
          ) : null}

          {successMessage ? (
            <p className="flex items-center gap-2 text-sm font-semibold text-brand">
              <CheckIcon className="size-4" />
              {successMessage}
            </p>
          ) : null}

          <Button
            type="submit"
            className="w-full md:w-auto"
            disabled={createProductMutation.isPending}
          >
            {createProductMutation.isPending ? (
              <span className="flex items-center gap-2">
                <Loader2Icon className="size-4 animate-spin" /> Guardando
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <SparklesIcon className="size-4" /> Publicar producto
              </span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
