// src\features\auth\store\auth-store.ts
import { Store } from '@tanstack/store'

import type { AuthState } from '@/features/auth/types'

export function createAuthStore(initialState?: Partial<AuthState>) {
  return new Store<AuthState>({
    status: 'loading',
    user: null,
    error: null,
    accessToken: null,
    ...initialState,
  })
}
