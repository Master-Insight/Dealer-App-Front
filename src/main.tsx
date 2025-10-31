import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'

import * as TanStackQueryProvider from './integrations/tanstack-query/root-provider.tsx'
import { ThemeProvider } from './components/providers/theme-provider.tsx'
import { AuthProvider } from './features/auth/providers/auth-provider.tsx'
import { createAuthStore } from './features/auth/store/auth-store.ts'
import { createAuthRouterContext } from './features/auth/utils/auth-context.ts'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

import './styles.css'
import reportWebVitals from './reportWebVitals.ts'

const TanStackQueryProviderContext = TanStackQueryProvider.getContext()
const authStore = createAuthStore()
const authRouterContext = createAuthRouterContext(authStore)

const router = createRouter({
  routeTree,
  context: {
    ...TanStackQueryProviderContext,
    auth: authRouterContext,
  },
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Render the app
const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <TanStackQueryProvider.Provider {...TanStackQueryProviderContext}>
        <AuthProvider store={authStore}>
          <ThemeProvider>
            <RouterProvider router={router} />
          </ThemeProvider>
        </AuthProvider>
      </TanStackQueryProvider.Provider>
    </StrictMode>,
  )
}

reportWebVitals()
