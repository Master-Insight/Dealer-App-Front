// src/features/auth/utils/auth-context.ts
import type { Store } from '@tanstack/store'

import type { AuthState, AuthUser } from '@/features/auth/types'

export interface AuthRouterContext {
  store: Store<AuthState>
  waitForAuthReady: () => Promise<AuthState>
  requireUser: () => Promise<AuthUser>
  getState: () => AuthState
}

export function createAuthRouterContext(
  store: Store<AuthState>,
): AuthRouterContext {
  async function waitForAuthReady() {
    const current = store.state
    if (current.status !== 'loading') {
      return current
    }

    return new Promise<AuthState>((resolve) => {
      const unsub = store.subscribe(() => {
        const next = store.state
        if (next.status !== 'loading') {
          unsub()
          resolve(next)
        }
      })
    })
  }

  async function requireUser() {
    const state = await waitForAuthReady()
    if (!state.user) {
      throw new Error('No authenticated user')
    }

    return state.user
  }

  return {
    store,
    waitForAuthReady,
    requireUser,
    getState: () => store.state,
  }
}
