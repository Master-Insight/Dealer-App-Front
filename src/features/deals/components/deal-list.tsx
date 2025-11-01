// src/features/deals/components/deal-list.tsx
import { useMemo, useState } from 'react'
import {
  CalendarClockIcon,
  CircleDotIcon,
  MessagesSquareIcon,
  NotebookTextIcon,
  SearchIcon,
  UserRoundIcon,
} from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  useAddDealNoteMutation,
  useDealsQuery,
  useUpdateDealStatusMutation,
} from '@/features/deals/hooks/use-deals'
import type { DealStatus, DealWithRelations } from '@/features/deals/types/deal'
import { cn } from '@/lib/utils'

const STATUS_META: Record<DealStatus, { label: string; tone: string }> = {
  pending: {
    label: 'Pendiente',
    tone: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200',
  },
  assigned: {
    label: 'Asignada',
    tone: 'bg-brand/10 text-brand',
  },
  completed: {
    label: 'Realizada',
    tone: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
  },
  lost: {
    label: 'Perdida',
    tone: 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
  },
  in_collection: {
    label: 'En cobro',
    tone: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300',
  },
}

const STATUS_FILTERS: Array<{ value: DealStatus | 'all'; label: string }> = [
  { value: 'all', label: 'Todas' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'assigned', label: 'Asignadas' },
  { value: 'completed', label: 'Realizadas' },
  { value: 'in_collection', label: 'En cobro' },
  { value: 'lost', label: 'Perdidas' },
]

function formatDateTime(value: string) {
  const date = new Date(value)
  return date.toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function DealNotes({ deal }: { deal: DealWithRelations }) {
  if (deal.notes.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border/50 bg-muted/30 px-3 py-2 text-xs text-foreground/60">
        Sin notas registradas.
      </p>
    )
  }

  return (
    <ul className="space-y-2">
      {deal.notes.slice(0, 3).map((note) => (
        <li
          key={note.id}
          className="rounded-xl border border-border/40 bg-card/80 px-3 py-2 text-xs"
        >
          <p className="font-semibold text-foreground">{note.author}</p>
          <p className="text-foreground/70">{note.content}</p>
          <p className="text-[0.65rem] uppercase tracking-[0.35em] text-foreground/50">
            {formatDateTime(note.createdAt)}
          </p>
        </li>
      ))}
    </ul>
  )
}

function QuickNoteForm({ deal }: { deal: DealWithRelations }) {
  const [value, setValue] = useState('')
  const addNoteMutation = useAddDealNoteMutation()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!value.trim()) return

    try {
      await addNoteMutation.mutateAsync({
        id: deal.id,
        content: value,
        author: deal.advisor,
      })
      setValue('')
    } catch (error) {
      console.error('No se pudo agregar la nota', error)
    }
  }

  return (
    <form className="flex items-center gap-2" onSubmit={handleSubmit}>
      <Input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Agregar nota rápida"
        className="h-9"
      />
      <button
        type="submit"
        className="inline-flex h-9 items-center rounded-lg bg-brand px-3 text-xs font-semibold uppercase tracking-[0.35em] text-white shadow-sm transition hover:bg-brand/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        disabled={addNoteMutation.isPending}
      >
        Guardar
      </button>
    </form>
  )
}

function DealCard({ deal }: { deal: DealWithRelations }) {
  const updateStatusMutation = useUpdateDealStatusMutation()

  const statusMeta = STATUS_META[deal.status]

  const handleStatusChange = async (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const nextStatus = event.target.value as DealStatus
    try {
      await updateStatusMutation.mutateAsync({
        id: deal.id,
        status: nextStatus,
      })
    } catch (error) {
      console.error('No se pudo actualizar la gestión', error)
    }
  }

  return (
    <li className="space-y-4 rounded-2xl border border-border/50 bg-card/80 p-5 shadow-sm transition hover:border-brand/40 hover:shadow-lg">
      <header className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-foreground">
            {deal.title}
          </h3>
          <p className="text-xs text-foreground/70">
            <UserRoundIcon className="mr-2 inline size-4 text-brand" />
            {deal.advisor}
          </p>
        </div>
        <span
          className={cn(
            'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
            statusMeta.tone,
          )}
        >
          <CircleDotIcon className="size-3" />
          {statusMeta.label}
        </span>
      </header>

      <section className="space-y-3 text-sm text-foreground/80">
        <p>
          <strong>Cliente:</strong> {deal.client?.name ?? 'Sin datos'}
        </p>
        {deal.product ? (
          <p>
            <strong>Producto:</strong> {deal.product.name}
          </p>
        ) : null}
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-brand">
          <CalendarClockIcon className="size-4" />{' '}
          {formatDateTime(deal.scheduledAt)}
        </p>
      </section>

      <section className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-foreground/60">
          <MessagesSquareIcon className="size-4" /> Historial rápido
        </div>
        <DealNotes deal={deal} />
        <QuickNoteForm deal={deal} />
      </section>

      <footer className="flex flex-col gap-2 rounded-xl border border-border/50 bg-muted/40 p-3 text-xs text-foreground/70 md:flex-row md:items-center md:justify-between">
        <span className="inline-flex items-center gap-2">
          <NotebookTextIcon className="size-4" /> Actualizar estado
        </span>
        <select
          className="rounded-lg border border-border/40 bg-background px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          value={deal.status}
          onChange={handleStatusChange}
        >
          {STATUS_FILTERS.filter((option) => option.value !== 'all').map(
            (option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ),
          )}
        </select>
      </footer>
    </li>
  )
}

export function DealList() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<DealStatus | 'all'>('all')
  const [advisorFilter, setAdvisorFilter] = useState<string>('all')

  const { data: deals = [], isLoading } = useDealsQuery(search)

  const advisors = useMemo(() => {
    const values = new Set<string>()
    deals.forEach((deal) => values.add(deal.advisor))
    return Array.from(values).sort()
  }, [deals])

  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      const statusMatches =
        statusFilter === 'all' ? true : deal.status === statusFilter
      const advisorMatches =
        advisorFilter === 'all' ? true : deal.advisor === advisorFilter
      return statusMatches && advisorMatches
    })
  }, [advisorFilter, deals, statusFilter])

  return (
    <Card className="border-border/50 shadow-[var(--shadow-soft)]">
      <CardHeader className="gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-semibold">
              Agenda y gestiones activas
            </CardTitle>
            <CardDescription>
              Monitorea el flujo comercial diario y registra notas rápidas por
              equipo.
            </CardDescription>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Label className="flex items-center gap-2 rounded-full border border-border/40 bg-background px-4 py-2 text-xs font-medium uppercase tracking-[0.35em] text-foreground/60">
              <SearchIcon className="size-3.5" /> Buscar
            </Label>
            <select
              className="rounded-xl border border-border/60 bg-background px-3 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as DealStatus | 'all')
              }
            >
              {STATUS_FILTERS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              className="rounded-xl border border-border/60 bg-background px-3 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              value={advisorFilter}
              onChange={(event) => setAdvisorFilter(event.target.value)}
            >
              <option value="all">Todos los asesores</option>
              {advisors.map((advisor) => (
                <option key={advisor} value={advisor}>
                  {advisor}
                </option>
              ))}
            </select>
          </div>
        </div>
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por cliente, producto o asesor"
        />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-foreground/70">Cargando gestiones...</p>
        ) : filteredDeals.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/60 bg-card/60 p-10 text-center text-sm text-foreground/70">
            <MessagesSquareIcon className="size-6 text-brand" />
            <div>
              <p className="font-semibold text-foreground">
                No hay gestiones que coincidan con los filtros
              </p>
              <p className="text-xs text-foreground/60">
                Ajusta la búsqueda o registra una nueva gestión desde el
                formulario.
              </p>
            </div>
          </div>
        ) : (
          <ul className="space-y-4">
            {filteredDeals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
