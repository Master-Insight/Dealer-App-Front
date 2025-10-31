import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'

import type { QueryClient } from '@tanstack/react-query'

import type { AuthRouterContext } from '@/features/auth/utils/auth-context'

interface AppRouterContext {
  queryClient: QueryClient
  auth: AuthRouterContext
}

export const Route = createRootRouteWithContext<AppRouterContext>()({
  component: () => (
    <>
      <Outlet />
    </>
  ),
})
