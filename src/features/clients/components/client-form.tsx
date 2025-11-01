// src/features/clients/components/client-form.tsx
import { useEffect, useMemo, useState } from 'react'
import { CheckIcon, Loader2Icon, UserPlusIcon } from 'lucide-react'

import type { Client } from '@/features/clients/types/client'
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
import { useCreateClientMutation } from '@/features/clients/hooks/use-clients'
import { getClientServiceHelpers } from '@/features/clients/services/client-service'

const { normalizePhone } = getClientServiceHelpers()

interface ClientFormProps {
  existingClients: Array<Client>
  onClientCreated?: (client: Client) => void
}

export function ClientForm({
  existingClients,
  onClientCreated,
}: ClientFormProps) {
  const [formState, setFormState] = useState({
    name: '',
    phone: '',
    email: '',
    dni: '',
    address: '',
    city: '',
    province: '',
  })
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [matchedClient, setMatchedClient] = useState<Client | null>(null)

  const createClientMutation = useCreateClientMutation()

  const suggestions = useMemo(() => {
    const term = formState.name.trim().toLowerCase()
    if (term.length < 2) return [] as Array<Client>

    return existingClients.filter((client) => {
      const matchesName = client.name.toLowerCase().includes(term)
      const matchesPhone = normalizePhone(client.phone).includes(
        term.replace(/[^0-9]/g, ''),
      )
      return matchesName || matchesPhone
    })
  }, [existingClients, formState.name])

  useEffect(() => {
    if (!formState.phone) {
      setMatchedClient(null)
      return
    }

    const match = existingClients.find(
      (client) =>
        normalizePhone(client.phone) === normalizePhone(formState.phone),
    )

    if (!match) {
      setMatchedClient(null)
      return
    }

    setMatchedClient(match)
    setFormState((prev) => {
      const next = { ...prev }
      let changed = false

      if (prev.name.trim() !== match.name) {
        next.name = match.name
        changed = true
      }
      if ((prev.email || '') !== (match.email ?? '')) {
        next.email = match.email ?? ''
        changed = true
      }
      if ((prev.dni || '') !== (match.dni ?? '')) {
        next.dni = match.dni ?? ''
        changed = true
      }
      if ((prev.address || '') !== (match.address ?? '')) {
        next.address = match.address ?? ''
        changed = true
      }
      if ((prev.city || '') !== (match.city ?? '')) {
        next.city = match.city ?? ''
        changed = true
      }
      if ((prev.province || '') !== (match.province ?? '')) {
        next.province = match.province ?? ''
        changed = true
      }

      return changed ? next : prev
    })
  }, [existingClients, formState.phone])

  const handleInputChange =
    (field: keyof typeof formState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormState((prev) => ({ ...prev, [field]: event.target.value }))
      setFormError(null)
      setSuccessMessage(null)
    }

  const handleSelectSuggestion = (client: Client) => {
    setMatchedClient(client)
    setFormState({
      name: client.name,
      phone: client.phone,
      email: client.email ?? '',
      dni: client.dni ?? '',
      address: client.address ?? '',
      city: client.city ?? '',
      province: client.province ?? '',
    })
    setFormError(null)
    setSuccessMessage('Cliente existente cargado desde el historial.')
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    if (!formState.name.trim() || !formState.phone.trim()) {
      setFormError(
        'Nombre y teléfono son obligatorios para registrar un cliente.',
      )
      return
    }

    if (matchedClient) {
      setSuccessMessage(
        'Este cliente ya estaba registrado. Los datos fueron completados.',
      )
      return
    }

    try {
      const client = await createClientMutation.mutateAsync({
        name: formState.name,
        phone: formState.phone,
        email: formState.email || null,
        dni: formState.dni || null,
        address: formState.address || null,
        city: formState.city || null,
        province: formState.province || null,
      })
      setSuccessMessage('Cliente creado correctamente.')
      setFormState({
        name: '',
        phone: '',
        email: '',
        dni: '',
        address: '',
        city: '',
        province: '',
      })
      onClientCreated?.(client)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No pudimos guardar el cliente. Intenta nuevamente.'
      setFormError(message)
    }
  }

  return (
    <Card className="border-border/50 shadow-[var(--shadow-soft)]">
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center gap-2 text-xl font-semibold">
          <UserPlusIcon className="size-5 text-brand" />
          Nuevo cliente
        </CardTitle>
        <CardDescription>
          Carga rápida para asesoría comercial. Solo necesitas nombre y
          teléfono.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="client-name">Nombre completo</Label>
            <Input
              id="client-name"
              placeholder="Ej: Laura Méndez"
              value={formState.name}
              onChange={handleInputChange('name')}
              autoComplete="name"
              required
            />
            {suggestions.length > 0 ? (
              <div className="rounded-xl border border-border/40 bg-muted/40 p-3 text-xs text-foreground/80">
                <p className="mb-2 font-semibold uppercase tracking-wide text-brand">
                  Coincidencias
                </p>
                <ul className="space-y-1">
                  {suggestions.slice(0, 3).map((client) => (
                    <li key={client.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectSuggestion(client)}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition hover:bg-card"
                      >
                        <span>
                          <span className="block font-medium">
                            {client.name}
                          </span>
                          <span className="block text-[0.7rem] text-foreground/60">
                            {client.phone}
                          </span>
                        </span>
                        <CheckIcon className="size-4 text-brand" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          {/* Teléfono */}
          <div className="space-y-2">
            <Label htmlFor="client-phone">Teléfono</Label>
            <Input
              id="client-phone"
              placeholder="Ej: +54 9 11 5555-1234"
              value={formState.phone}
              onChange={handleInputChange('phone')}
              autoComplete="tel"
              required
            />
            {matchedClient ? (
              <p className="text-xs font-medium text-brand">
                Cliente existente detectado. Se completaron los datos
                automáticamente.
              </p>
            ) : null}
          </div>

          {/* Email y DNI */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="client-email">Email (opcional)</Label>
              <Input
                id="client-email"
                type="email"
                placeholder="cliente@correo.com"
                value={formState.email}
                onChange={handleInputChange('email')}
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-document">Documento / DNI</Label>
              <Input
                id="client-document"
                placeholder="Ej: 30999888"
                value={formState.dni}
                onChange={handleInputChange('dni')}
                autoComplete="off"
              />
            </div>
          </div>

          {/* Dirección y ciudad */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="client-address">Dirección</Label>
              <Input
                id="client-address"
                placeholder="Ej: Av. Siempre Viva 742"
                value={formState.address}
                onChange={handleInputChange('address')}
                autoComplete="street-address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-city">Ciudad</Label>
              <Input
                id="client-city"
                placeholder="Ej: Córdoba"
                value={formState.city}
                onChange={handleInputChange('city')}
                autoComplete="address-level2"
              />
            </div>
          </div>

          {/* Provincia */}
          <div className="space-y-2">
            <Label htmlFor="client-province">Provincia</Label>
            <Input
              id="client-province"
              placeholder="Ej: Córdoba"
              value={formState.province}
              onChange={handleInputChange('province')}
              autoComplete="address-level1"
            />
          </div>

          {/* Mensajes */}
          {formError ? (
            <p className="text-sm font-medium text-destructive">{formError}</p>
          ) : null}
          {successMessage ? (
            <p className="text-sm font-semibold text-brand">{successMessage}</p>
          ) : null}

          {/* Botón */}
          <Button
            type="submit"
            className="w-full md:w-auto"
            disabled={createClientMutation.isPending}
          >
            {createClientMutation.isPending ? (
              <span className="flex items-center gap-2">
                <Loader2Icon className="size-4 animate-spin" /> Guardando
              </span>
            ) : matchedClient ? (
              'Cliente encontrado'
            ) : (
              'Guardar cliente'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
