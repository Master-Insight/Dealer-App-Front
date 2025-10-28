import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRightIcon, Cross2Icon } from "@radix-ui/react-icons" 
import { cn } from '@/lib/utils'

function DashboardPage() {
    const availableCars = Array.from({ length: 11 }, (_, i) => ({
      id: i + 1,
      label: `Label`,
    }))

    const appointments = [
      { id: 1, artist: "Artist", title: "Title" },
      { id: 2, artist: "Artist", title: "Title" },
      { id: 3, artist: "Artist", title: "Title" },
      { id: 4, artist: "Artist", title: "Title" },
    ]

    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Inicio</h1>
        </div>

        {/* Autos Disponibles */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <h2 className="text-xl font-semibold">Autos Disponibles</h2>
            <ArrowRightIcon className="h-5 w-5" />
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {availableCars.map((car) => (
              <div key={car.id} className="flex flex-col items-center gap-2 shrink-0">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded bg-muted-foreground/20" />
                    <div className="h-6 w-6 rounded bg-muted-foreground/30" />
                  </div>
                </div>
                <span className="text-sm">{car.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Agenda de Citas */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <h2 className="text-xl font-semibold">Agenda de Citas</h2>
            <ArrowRightIcon className="h-5 w-5" />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {appointments.map((appointment, index) => (
              <Card
                key={appointment.id}
                className={cn("relative overflow-hidden", index === 0 && "border-2 border-primary")}
              >
                <CardContent className="flex flex-col items-center justify-center p-8">
                  <div className="mb-4 flex items-center gap-2">
                    {index === 0 && (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        I
                      </div>
                    )}
                    <div className="h-16 w-16 rounded-full bg-muted" />
                    <div className="flex flex-col gap-1">
                      <div className="h-4 w-12 rounded bg-muted" />
                      <div className="h-3 w-8 rounded bg-muted" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">{appointment.artist}</p>
                    <p className="text-sm text-muted-foreground">{appointment.title}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="absolute bottom-2 right-2 h-8 w-8 rounded-full">
                    <Cross2Icon className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    )
}

export const Route = createFileRoute('/_private/dashboard/')({
  component: DashboardPage,
})