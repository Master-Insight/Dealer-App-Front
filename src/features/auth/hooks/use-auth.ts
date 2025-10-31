// src\features\auth\hooks\use-auth.ts
import { useMemo } from 'react'

import {
  useAuthContext,
  useAuthState,
} from '@/features/auth/providers/auth-provider.tsx'

export function useAuth() {
  const state = useAuthState()
  const context = useAuthContext()

  return useMemo(
    () => ({
      ...state,
      isAuthenticated: state.status === 'authenticated' && !!state.user,
      isLoading: state.status === 'loading',
      signInWithPassword: context.signInWithPassword,
      signOut: context.signOut,
      isMocked: context.isMocked,
    }),
    [context.isMocked, context.signInWithPassword, context.signOut, state],
  )
}
