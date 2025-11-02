// src/features/deals/components/deal-form.tsx
import { useEffect, useMemo, useState } from 'react'
import {
  CalendarIcon,
  CheckIcon,
  Loader2Icon,
  NotebookPenIcon,
  UserRoundPlusIcon,
} from 'lucide-react'

import type { DealStatus } from '@/features/deals/types/deal'
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
import { useClientsQuery } from '@/features/clients/hooks/use-clients'
import { useCreateDealMutation } from '@/features/deals/hooks/use-deals'
import { useProductsQuery } from '@/features/products/hooks/use-products'

const STATUS_OPTIONS: Array<{ value: DealStatus; label: string }> = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'assigned', label: 'Asignada' },
  { value: 'completed', label: 'Realizada' },
  { value: 'in_collection', label: 'En cobro' },
  { value: 'lost', label: 'Perdida' },
]

function toLocalDateTimeInput(date: Date) {
  const localDate = new Date(
    date.getTime() - date.getTimezoneOffset() * 60 * 1000,
  )
  return localDate.toISOString().slice(0, 16)
}

interface DealFormState {
  title: string
  advisor: string
  clientId: string
  productId: string
  scheduledAt: string
  status: DealStatus
  note: string
}

export function DealForm() {
  const { data: clients = [] } = useClientsQuery()
  const { data: products = [] } = useProductsQuery()
  const createDealMutation = useCreateDealMutation()

  const [formState, setFormState] = useState<DealFormState>(() => ({
    title: '',
    advisor: '',
    clientId: clients[0]?.id ?? '',
    productId: '',
    scheduledAt: toLocalDateTimeInput(new Date()),
    status: 'pending',
    note: '',
  }))
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const upcomingClients = useMemo(() => clients.slice(0, 25), [clients])
  const availableProducts = useMemo(
    () => products.filter((product) => product.status !== 'retired'),
    [products],
  )

  useEffect(() => {
    if (!formState.clientId && clients.length > 0) {
      setFormState((prev) => ({ ...prev, clientId: clients[0].id }))
    }
  }, [clients, formState.clientId])

  const handleChange =
    (field: keyof DealFormState) =>
    (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      const value = event.target.value
      setFormState((prev) => ({ ...prev, [field]: value }))
      setSuccessMessage(null)
      setErrorMessage(null)
    }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!formState.clientId) {
      setErrorMessage('Selecciona un cliente para registrar la gestión.')
      return
    }

    try {
      await createDealMutation.mutateAsync({
        title: formState.title || 'Seguimiento comercial',
        advisor: formState.advisor || 'Asesor asignado',
        clientId: formState.clientId,
        productId: formState.productId || null,
        scheduledAt: new Date(formState.scheduledAt).toISOString(),
        status: formState.status,
        note: formState.note || null,
      })

      setSuccessMessage('Gestión creada correctamente.')
      setFormState((prev) => ({
        ...prev,
        title: '',
        note: '',
      }))
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No se pudo registrar la gestión. Intenta nuevamente.'
      setErrorMessage(message)
    }
  }

  return (
    <Card className="border-border/50 shadow-[var(--shadow-soft)]">
      <CardHeader className="space-y-2">
        <CardTitle className="flex items-center gap-2 text-xl font-semibold">
          <UserRoundPlusIcon className="size-5 text-brand" />
          Nueva gestión comercial
        </CardTitle>
        <CardDescription>
          Vincula clientes con productos para dar seguimiento ágil desde el
          panel.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="deal-title">Título</Label>
            <Input
              id="deal-title"
              placeholder="Ej: Seguimiento test drive"
              value={formState.title}
              onChange={handleChange('title')}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="deal-client">Cliente</Label>
              <select
                id="deal-client"
                className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                value={formState.clientId}
                onChange={handleChange('clientId')}
              >
                <option value="">Seleccionar cliente</option>
                {upcomingClients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} · {client.phone}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deal-advisor">Asesor</Label>
              <Input
                id="deal-advisor"
                placeholder="Ej: Florencia Gómez"
                value={formState.advisor}
                onChange={handleChange('advisor')}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="deal-product">Producto vinculado</Label>
              <select
                id="deal-product"
                className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                value={formState.productId}
                onChange={handleChange('productId')}
              >
                <option value="">Sin producto asignado</option>
                {availableProducts.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deal-date">Agenda</Label>
              <div className="relative">
                <Input
                  id="deal-date"
                  type="datetime-local"
                  value={formState.scheduledAt}
                  onChange={handleChange('scheduledAt')}
                />
                <CalendarIcon className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-foreground/60" />
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="deal-status">Estado</Label>
              <select
                id="deal-status"
                className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                value={formState.status}
                onChange={handleChange('status')}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deal-note">Nota inicial</Label>
              <Input
                id="deal-note"
                placeholder="Contexto o próximos pasos"
                value={formState.note}
                onChange={handleChange('note')}
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
            disabled={createDealMutation.isPending}
          >
            {createDealMutation.isPending ? (
              <span className="flex items-center gap-2">
                <Loader2Icon className="size-4 animate-spin" /> Registrando
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <NotebookPenIcon className="size-4" /> Guardar gestión
              </span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
