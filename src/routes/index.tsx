import { createFileRoute } from '@tanstack/react-router'

import { LoginForm } from '@/features/auth/components/login-form'
import { AuthLayout } from '@/layouts/auth-layout'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  )
}
