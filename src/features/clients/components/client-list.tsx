// src/features/clients/components/client-list.tsx
import { useMemo, useState } from 'react'
import { CalendarIcon, PhoneIcon, SearchIcon, UserIcon } from 'lucide-react'

import type { Client } from '@/features/clients/types/client'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useClientListData } from '@/features/clients/hooks/use-clients'
import { cn } from '@/lib/utils'

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/50 bg-card/60 p-10 text-center text-sm text-foreground/70">
      <UserIcon className="size-6 text-brand" />
      <div>
        <p className="font-semibold text-foreground">
          Sin clientes cargados todavía
        </p>
        <p className="text-xs text-foreground/60">
          Registra tu primer contacto comercial desde el formulario.
        </p>
      </div>
    </div>
  )
}

function ClientRow({ client }: { client: Client }) {
  const created_at = useMemo(
    () => new Date(client.created_at),
    [client.created_at],
  )
  const createdLabel = created_at.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  return (
    <li className="grid gap-3 rounded-2xl border border-border/40 bg-card/70 p-5 shadow-sm transition hover:border-brand/40 hover:shadow-md md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div className="space-y-1">
        <p className="text-base font-semibold text-foreground">{client.name}</p>
        <div className="flex flex-wrap items-center gap-3 text-xs text-foreground/70">
          <span className="inline-flex items-center gap-1">
            <PhoneIcon className="size-3.5" />
            {client.phone}
          </span>
          {client.email ? (
            <span className="inline-flex items-center gap-1">
              <UserIcon className="size-3.5" />
              {client.email}
            </span>
          ) : null}
          {client.dni ? (
            <span className="rounded-full border border-border/40 px-2 py-0.5 text-[0.65rem] uppercase tracking-wider">
              DNI {client.dni}
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex items-start justify-end text-xs text-foreground/50">
        <span className="inline-flex items-center gap-2 rounded-full bg-muted/40 px-3 py-1 font-medium uppercase tracking-wide">
          <CalendarIcon className="size-3" />
          Creado {createdLabel}
        </span>
      </div>
    </li>
  )
}

export function ClientList() {
  const [search, setSearch] = useState('')
  const { data, isLoading } = useClientListData(search)

  const clients = data ?? []

  const empty = !isLoading && clients.length === 0

  return (
    <Card className="border-border/50 shadow-[var(--shadow-soft)]">
      <CardHeader className="gap-3">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">
              Directorio de clientes
            </CardTitle>
            <CardDescription>
              Acceso rápido a tus contactos recientes y sugerencias para nuevas
              gestiones.
            </CardDescription>
          </div>
          <Label className="flex items-center gap-2 rounded-full border border-border/40 bg-background px-4 py-2 text-xs font-medium uppercase tracking-[0.35em] text-foreground/60">
            <SearchIcon className="size-3.5" /> Buscar
          </Label>
        </div>
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nombre, teléfono o DNI"
        />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-foreground/70">Cargando clientes...</p>
        ) : empty ? (
          <EmptyState />
        ) : (
          <ul
            className={cn('grid gap-3', clients.length > 6 && 'md:grid-cols-2')}
          >
            {clients.map((client) => (
              <ClientRow key={client.id} client={client} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
