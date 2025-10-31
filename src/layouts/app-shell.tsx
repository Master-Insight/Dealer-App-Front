// src/layouts/app-shell.tsx
import { Link, Outlet } from '@tanstack/react-router'
import { LogOutIcon } from 'lucide-react'
import type { PropsWithChildren } from 'react'

import { DealerAppLogo } from '@/components/brand/logo'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/hooks/use-auth'

interface NavigationItem {
  label: string
  description: string
  to?: '/dashboard'
  badge?: string
}

const NAVIGATION: Array<NavigationItem> = [
  { label: 'Inicio', to: '/dashboard', description: 'Resumen comercial' },
  {
    label: 'Clientes',
    description: 'Directorio y actividades',
    badge: 'Fase 1',
  },
  {
    label: 'Productos',
    description: 'Stock y disponibilidad',
    badge: 'Fase 1',
  },
  { label: 'Gestiones', description: 'Agenda y seguimiento', badge: 'Fase 1' },
]

export function AppShellLayout({ children }: PropsWithChildren) {
  const { user, signOut, isMocked } = useAuth()

  return (
    <div className="grid min-h-dvh w-full grid-cols-1 bg-background lg:grid-cols-[18rem_minmax(0,1fr)]">
      <aside className="hidden flex-col justify-between border-r border-border/40 bg-sidebar px-6 py-8 lg:flex">
        <div className="space-y-8">
          <DealerAppLogo />

          <nav className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand">
              Navegación
            </p>
            <ul className="space-y-2">
              {NAVIGATION.map((item) => (
                <li key={item.label}>
                  {item.to ? (
                    <Link
                      to={item.to}
                      className="group flex flex-col rounded-xl border border-transparent bg-card px-4 py-3 text-left shadow-sm transition hover:border-brand/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
                    >
                      <span className="font-medium">{item.label}</span>
                      <span className="text-xs text-foreground/70">
                        {item.description}
                      </span>
                    </Link>
                  ) : (
                    <div className="group flex flex-col rounded-xl border border-dashed border-border/60 bg-card/60 px-4 py-3 text-foreground/60">
                      <span className="font-medium">{item.label}</span>
                      <span className="text-xs">{item.description}</span>
                      {item.badge ? (
                        <span className="mt-1 text-[0.65rem] uppercase tracking-wider text-brand">
                          {item.badge}
                        </span>
                      ) : null}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <footer className="space-y-4">
          <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand">
              Estado
            </p>
            <p className="mt-2 text-sm text-foreground/80">
              {isMocked
                ? 'Autenticación en modo demo'
                : 'Conectado a Supabase Auth'}
            </p>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {user?.fullName ?? user?.email ?? 'Asesor'}
              </p>
              <p className="text-xs text-foreground/60">
                {user?.role ?? 'advisor'}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={signOut}
              aria-label="Cerrar sesión"
            >
              <LogOutIcon className="size-4" />
            </Button>
          </div>
        </footer>
      </aside>

      <div className="flex flex-col">
        <header className="flex items-center justify-between border-b border-border/40 px-5 py-4 lg:hidden">
          <DealerAppLogo withLabel={false} />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button type="button" variant="outline" size="sm" onClick={signOut}>
              <LogOutIcon className="mr-2 size-3.5" />
              Salir
            </Button>
          </div>
        </header>
        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="hidden items-center justify-between border-b border-border/40 px-8 py-6 lg:flex">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-brand">
                Resumen
              </p>
              <h1 className="text-2xl font-bold text-foreground">
                Panel de control
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button type="button" variant="outline" onClick={signOut}>
                <LogOutIcon className="mr-2 size-4" />
                Cerrar sesión
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto bg-muted/20 px-4 py-6 sm:px-8">
            {children ?? <Outlet />}
          </main>
        </div>
      </div>
    </div>
  )
}
