// src\components\login-form.tsx
import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'

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
import { useAuth } from '@/features/auth/hooks/use-auth.ts'

type LoginDestination = '/dashboard' | '/clients'

interface LoginFormProps {
  redirectTo?: LoginDestination
}

export function LoginForm({ redirectTo }: LoginFormProps) {
  const navigate = useNavigate()
  const { signInWithPassword, isLoading, error, isMocked } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)
    try {
      await signInWithPassword({ email, password })
      const destination: LoginDestination = redirectTo ?? '/dashboard'
      navigate({ to: destination })
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'No se pudo iniciar sesión, intenta nuevamente más tarde.'
      setFormError(message)
    }
  }

  return (
    <Card className="w-full max-w-md border-border/60 shadow-[var(--shadow-soft)]">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl font-semibold">Iniciar sesión</CardTitle>
        <CardDescription>
          Ingresa tus credenciales para acceder al panel.{' '}
          {isMocked
            ? 'Modo demostración activo.'
            : 'Las sesiones son gestionadas por Supabase Auth.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="asesor@dealerapp.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          {(formError || error) && (
            <p className="text-sm font-medium text-destructive">
              {formError ?? error ?? 'Ocurrió un error inesperado.'}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Validando...' : 'Ingresar'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
