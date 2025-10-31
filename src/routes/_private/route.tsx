import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

import { AppShellLayout } from '@/layouts/app-shell'

export const Route = createFileRoute('/_private')({
  beforeLoad: async ({ context, location }) => {
    const state = await context.auth.waitForAuthReady()
    if (!state.user) {
      throw redirect({ to: '/', search: { redirect: location.href } })
    }
  },
  component: PrivateLayout,
})

function PrivateLayout() {
  return (
    <AppShellLayout>
      <Outlet />
    </AppShellLayout>
  )
}
