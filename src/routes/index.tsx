import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'

import { LoginForm } from '@/features/auth/components/login-form'
import { AuthLayout } from '@/layouts/auth-layout'

const loginSearchSchema = z.object({
  redirect: z
    .union([z.literal('/dashboard'), z.literal('/clients')])
    .optional(),
})

export const Route = createFileRoute('/')({
  validateSearch: (search) => loginSearchSchema.parse(search),
  beforeLoad: async ({ context, search }) => {
    const state = await context.auth.waitForAuthReady()
    if (state.user) {
      throw redirect({ to: search.redirect ?? '/dashboard' })
    }
  },
  component: App,
})

function App() {
  const { redirect: redirectTo } = Route.useSearch()

  return (
    <AuthLayout>
      <LoginForm redirectTo={redirectTo} />
    </AuthLayout>
  )
}
