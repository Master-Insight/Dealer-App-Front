// src/features/products/components/product-form.tsx
import { useState } from 'react'
import {
  CheckIcon,
  Loader2Icon,
  PlusCircleIcon,
  SparklesIcon,
} from 'lucide-react'

import type {
  CreateProductInput,
  Product,
  ProductFuelType,
  ProductStatus,
  ProductTransmision,
  ProductTypes,
} from '@/features/products/types/product'
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
  { value: 'disponible', label: 'Disponible' },
  { value: 'reservado', label: 'Reservado' },
  { value: 'vendido', label: 'Vendido' },
  { value: 'baja', label: 'Baja' },
]

const VEHICLE_TYPES: Array<{ value: ProductTypes; label: string }> = [
  { value: 'Auto', label: 'Auto' },
  { value: 'Moto', label: 'Moto' },
  { value: 'Camioneta', label: 'Camioneta' },
  { value: 'Camión', label: 'Camión' },
]

const FUEL_TYPES: Array<{ value: ProductFuelType; label: string }> = [
  { value: 'Nafta', label: 'Nafta' },
  { value: 'Diesel', label: 'Diésel' },
  { value: 'Gas', label: 'Gas' },
  { value: 'Eléctrico', label: 'Eléctrico' },
]

const TRANSMISSIONS: Array<{ value: ProductTransmision; label: string }> = [
  { value: 'Manual', label: 'Manual' },
  { value: 'Automática', label: 'Automática' },
]

interface ProductFormProps {
  products: Array<Product>
}

export function ProductForm({ products: _products }: ProductFormProps) {
  const [formState, setFormState] = useState<CreateProductInput>({
    company_id: null,
    brand: '',
    model: '',
    variant: '',
    year: undefined,
    mileage: undefined,
    fuel_type: null,
    transmission: null,
    color: '',
    doors: undefined,
    location: '',
    state: 'disponible',
    description: '',
    active: true,
    price: undefined,
    labels: '',
    vehicle_type: null,
  })
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const createProductMutation = useCreateProductMutation()

  const NULLABLE_FIELDS: Array<keyof CreateProductInput> = [
    'fuel_type',
    'transmission',
    'vehicle_type',
  ]

  const handleChange =
    (field: keyof CreateProductInput) =>
    (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      const value = event.target.value
      const isNullableField = NULLABLE_FIELDS.includes(field)

      setFormState((prev) => ({
        ...prev,
        [field]:
          event.target.type === 'number'
            ? event.target.value === ''
              ? undefined
              : Number(value)
            : isNullableField && value === ''
              ? null
              : value,
      }))
      setErrorMessage(null)
      setSuccessMessage(null)
    }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!formState.brand.trim() || !formState.model.trim()) {
      setErrorMessage('La marca y el modelo son obligatorios.')
      return
    }

    try {
      await createProductMutation.mutateAsync(formState)
      setSuccessMessage('Producto registrado correctamente.')
      setFormState({
        company_id: null,
        brand: '',
        model: '',
        variant: '',
        year: undefined,
        mileage: undefined,
        fuel_type: null,
        transmission: null,
        color: '',
        doors: undefined,
        location: '',
        state: 'disponible',
        description: '',
        active: true,
        price: undefined,
        labels: '',
        vehicle_type: null,
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
          Registra una nueva unidad en el inventario con sus datos técnicos y
          estado comercial.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Marca y Modelo */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="brand">Marca</Label>
              <Input
                id="brand"
                placeholder="Ej: Volkswagen"
                value={formState.brand}
                onChange={handleChange('brand')}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Modelo</Label>
              <Input
                id="model"
                placeholder="Ej: Atlas 2.0 TSI"
                value={formState.model}
                onChange={handleChange('model')}
                required
              />
            </div>
          </div>

          {/* Variante y Año */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="variant">Versión / Variante</Label>
              <Input
                id="variant"
                placeholder="Ej: Highline Plus"
                value={formState.variant ?? ''}
                onChange={handleChange('variant')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Año</Label>
              <Input
                id="year"
                type="number"
                placeholder="Ej: 2023"
                value={formState.year ?? ''}
                onChange={handleChange('year')}
              />
            </div>
          </div>

          {/* Kilometraje y Precio */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="mileage">Kilometraje</Label>
              <Input
                id="mileage"
                type="number"
                placeholder="Ej: 25.000"
                value={formState.mileage ?? ''}
                onChange={handleChange('mileage')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Precio</Label>
              <Input
                id="price"
                type="number"
                placeholder="Ej: 46800000"
                value={formState.price ?? ''}
                onChange={handleChange('price')}
              />
            </div>
          </div>

          {/* Combustible y Transmisión */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fuel_type">Tipo de combustible</Label>
              <select
                id="fuel_type"
                className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                value={formState.fuel_type ?? ''}
                onChange={handleChange('fuel_type')}
              >
                <option value="">Seleccionar</option>
                {FUEL_TYPES.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="transmission">Transmisión</Label>
              <select
                id="transmission"
                className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                value={formState.transmission ?? ''}
                onChange={handleChange('transmission')}
              >
                <option value="">Seleccionar</option>
                {TRANSMISSIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Color, Puertas, Ubicación */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                placeholder="Ej: Gris Plata"
                value={formState.color ?? ''}
                onChange={handleChange('color')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doors">Puertas</Label>
              <Input
                id="doors"
                type="number"
                min={2}
                max={5}
                placeholder="Ej: 5"
                value={formState.doors ?? ''}
                onChange={handleChange('doors')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
              <Input
                id="location"
                placeholder="Ej: Córdoba"
                value={formState.location ?? ''}
                onChange={handleChange('location')}
              />
            </div>
          </div>

          {/* Estado y Tipo de vehículo */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="state">Estado comercial</Label>
              <select
                id="state"
                className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                value={formState.state}
                onChange={handleChange('state')}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicle_type">Tipo de vehículo</Label>
              <select
                id="vehicle_type"
                className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                value={formState.vehicle_type ?? ''}
                onChange={handleChange('vehicle_type')}
              >
                <option value="">Seleccionar</option>
                {VEHICLE_TYPES.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Descripción y etiquetas */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                placeholder="Ej: 0 km, paquete tecnología, único dueño"
                value={formState.description ?? ''}
                onChange={handleChange('description')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="labels">Etiquetas</Label>
              <Input
                id="labels"
                placeholder="Ej: demo, oferta, flota"
                value={formState.labels ?? ''}
                onChange={handleChange('labels')}
              />
            </div>
          </div>

          {/* Mensajes */}
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

          {/* Botón de acción */}
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
