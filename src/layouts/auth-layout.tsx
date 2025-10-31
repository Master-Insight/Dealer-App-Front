// src\layouts\auth-layout.tsx
import type { PropsWithChildren } from 'react'

import { DealerAppLogo } from '@/components/brand/logo'
import { ThemeToggle } from '@/components/theme/theme-toggle'

export function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="relative flex min-h-dvh w-full flex-col overflow-hidden bg-background">
      <div className="absolute inset-x-0 top-0 -z-[1] h-[18rem] bg-gradient-to-b from-brand/15 to-transparent" />
      <header className="flex w-full items-center justify-between px-6 py-5 sm:px-10">
        <DealerAppLogo className="text-foreground" />
        <ThemeToggle />
      </header>

      <main className="flex flex-1 flex-col items-center px-6 pb-12">
        <div className="grid w-full max-w-screen-xl flex-1 grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <section className="hidden flex-col justify-center gap-8 lg:flex">
            <div className="rounded-3xl bg-card/70 p-10 shadow-[var(--shadow-soft)] ring-1 ring-border/40 backdrop-blur">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-brand">
                Dealer App Platform
              </p>
              <h1 className="mt-4 max-w-xl text-4xl font-bold leading-snug text-foreground">
                Gestiona clientes, productos y oportunidades desde un único
                panel.
              </h1>
              <p className="mt-4 max-w-xl text-base text-foreground/70">
                Centralizamos el ciclo comercial automotriz para que tus
                asesores trabajen con foco. Conecta tu concesionaria, controla
                la agenda y haz seguimiento de cada gestión.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-foreground/70">
              <div className="rounded-2xl border border-border/50 bg-card/80 p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand">
                  MVP
                </p>
                <p className="mt-2 font-medium">
                  Clientes, productos y gestiones sincronizadas
                </p>
              </div>
              <div className="rounded-2xl border border-border/50 bg-card/80 p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand">
                  Roadmap
                </p>
                <p className="mt-2 font-medium">
                  Automatizaciones, analíticas y canal WhatsApp
                </p>
              </div>
            </div>
          </section>

          <section className="flex items-center justify-center">
            {children}
          </section>
        </div>
      </main>
    </div>
  )
}
