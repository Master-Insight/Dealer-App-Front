import { createFileRoute } from '@tanstack/react-router'
import { ArrowRightIcon } from '@radix-ui/react-icons'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// TODO mock dashboard
const MOCKED_METRICS = [
  { label: 'Gestiones activas', value: 18, trend: '+12% vs semana pasada' },
  { label: 'Autos disponibles', value: 42, trend: '8 reservas confirmadas' },
  { label: 'Clientes nuevos', value: 9, trend: '3 provenientes de referidos' },
]

const MOCKED_APPOINTMENTS = [
  {
    id: 1,
    advisor: 'Ayelén Ruiz',
    client: 'Marcos Díaz',
    time: 'Hoy · 10:30 hs',
  },
  {
    id: 2,
    advisor: 'Mauro Benítez',
    client: 'Carla Sánchez',
    time: 'Hoy · 12:45 hs',
  },
  {
    id: 3,
    advisor: 'Florencia Gómez',
    client: 'Ricardo Pérez',
    time: 'Hoy · 15:00 hs',
  },
  {
    id: 4,
    advisor: 'Equipo Venta Digital',
    client: 'Contacto web',
    time: 'Mañana · 11:30 hs',
  },
]

const MOCKED_STOCK = Array.from({ length: 6 }, (_, index) => ({
  id: index + 1,
  model: `SUV ${2020 + index}`,
  status: index % 3 === 0 ? 'Reservado' : 'Disponible',
}))

function DashboardPage() {
  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-3">
        {MOCKED_METRICS.map((metric) => (
          <Card key={metric.label} className="border-border/60 bg-card/70">
            <CardHeader className="space-y-2">
              <CardDescription className="text-xs uppercase tracking-[0.3em] text-brand">
                {metric.label}
              </CardDescription>
              <CardTitle className="text-3xl font-bold text-foreground">
                {metric.value}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground/70">{metric.trend}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_minmax(0,0.8fr)]">
        <Card className="border-border/60 bg-card/70">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-semibold">
                Agenda de hoy
              </CardTitle>
              <CardDescription>
                Seguimiento de citas asignadas a asesores
              </CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" className="gap-2">
              Ver agenda completa
              <ArrowRightIcon className="size-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {MOCKED_APPOINTMENTS.map((appointment, index) => (
              <div
                key={appointment.id}
                className={cn(
                  'flex items-center justify-between rounded-2xl border border-border/60 bg-white/80 p-4 backdrop-blur dark:bg-card',
                  index === 0 && 'border-brand/60 shadow-[var(--shadow-soft)]',
                )}
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {appointment.client}
                  </p>
                  <p className="text-xs text-foreground/70">
                    Asesor: {appointment.advisor}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-brand">
                    {appointment.time}
                  </p>
                  <button
                    type="button"
                    className="text-xs font-semibold text-foreground/70 underline-offset-4 hover:underline"
                  >
                    Detalles
                  </button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Agenda de Citas */}
        <Card className="border-border/60 bg-card/70">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Stock destacado
            </CardTitle>
            <CardDescription>
              Vehículos listos para asignar a una gestión
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {MOCKED_STOCK.map((vehicle) => (
              <div
                key={vehicle.id}
                className="flex items-center justify-between rounded-2xl border border-border/50 bg-white/70 px-4 py-3 text-sm dark:bg-card"
              >
                <div>
                  <p className="font-medium text-foreground">{vehicle.model}</p>
                  <p className="text-xs text-foreground/60">
                    ID interno · #{vehicle.id}
                  </p>
                </div>
                <span
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
                    vehicle.status === 'Disponible'
                      ? 'bg-brand/10 text-brand'
                      : 'bg-brand-alt/10 text-brand-alt',
                  )}
                >
                  {vehicle.status}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

export const Route = createFileRoute('/_private/dashboard/')({
  component: DashboardPage,
})
