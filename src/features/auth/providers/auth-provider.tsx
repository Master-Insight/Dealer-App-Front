// src/features/auth/providers/auth-provider.tsx
import { createContext, useContext, useEffect, useMemo, useRef } from 'react'
import { useStore } from '@tanstack/react-store'
import type { PropsWithChildren } from 'react'
import type { Store } from '@tanstack/store'

import type { AuthState, AuthUser, Credentials } from '@/features/auth/types'
import { getSupabaseClient } from '@/integrations/supabase/client.ts'

interface AuthContextValue {
  store: Store<AuthState>
  signInWithPassword: (credentials: Credentials) => Promise<void>
  signOut: () => Promise<void>
  isMocked: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

function mapSupabaseUser(user: any | null): AuthUser | null {
  if (!user) return null

  return {
    id: user.id,
    email: user.email,
    role: (user.user_metadata?.role ?? 'advisor') as AuthUser['role'],
    fullName: user.user_metadata?.full_name ?? null,
    phone: user.user_metadata?.phone ?? null,
    companyId: user.user_metadata?.company_id ?? null,
  }
}

export function AuthProvider({
  children,
  store,
}: PropsWithChildren<{ store: Store<AuthState> }>) {
  const supabase = useMemo(() => getSupabaseClient(), [])
  const isMocked = !supabase
  const initializing = useRef(true)

  useEffect(() => {
    if (!supabase) {
      store.setState((state) => ({
        ...state,
        status: 'unauthenticated',
        user: null,
        accessToken: null,
      }))
      return
    }

    let active = true

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!active) return

        if (error) {
          store.setState((state) => ({
            ...state,
            status: 'unauthenticated',
            user: null,
            accessToken: null,
            error: error.message,
          }))
          return
        }

        store.setState((state) => ({
          ...state,
          status: data.session?.user ? 'authenticated' : 'unauthenticated',
          user: mapSupabaseUser(data.session?.user ?? null),
          accessToken: data.session?.access_token ?? null,
          error: null,
        }))
      })
      .finally(() => {
        initializing.current = false
      })

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        store.setState((state) => ({
          ...state,
          status: session?.user ? 'authenticated' : 'unauthenticated',
          user: mapSupabaseUser(session?.user ?? null),
          accessToken: session?.access_token ?? null,
          error: null,
        }))
      },
    )

    return () => {
      active = false
      subscription.subscription.unsubscribe()
    }
  }, [store, supabase])

  useEffect(() => {
    if (!supabase && initializing.current) {
      store.setState((state) => ({
        ...state,
        status: 'unauthenticated',
        user: null,
        accessToken: null,
      }))
      initializing.current = false
    }
  }, [store, supabase])

  const signInWithPassword = async (credentials: Credentials) => {
    store.setState((state) => ({ ...state, status: 'loading', error: null }))

    if (!supabase) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const id =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `mock-${Math.random().toString(36).slice(2)}`
      store.setState({
        status: 'authenticated',
        user: {
          id,
          email: credentials.email,
          role: 'advisor',
          fullName: 'Demo Advisor',
          companyId: 'demo-company',
          phone: null,
        },
        accessToken: 'mock-token',
        error: null,
      })
      return
    }

    const { error } = await supabase.auth.signInWithPassword(credentials)

    if (error) {
      store.setState((state) => ({
        ...state,
        status: 'unauthenticated',
        error: error.message,
      }))
      throw error
    }
  }

  const signOut = async () => {
    if (!supabase) {
      store.setState({
        status: 'unauthenticated',
        user: null,
        accessToken: null,
        error: null,
      })
      return
    }

    const { error } = await supabase.auth.signOut()
    if (error) {
      store.setState((state) => ({ ...state, error: error.message }))
      throw error
    }
  }

  const value = useMemo<AuthContextValue>(
    () => ({ store, signInWithPassword, signOut, isMocked }),
    [isMocked, signInWithPassword, signOut, store],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }

  return context
}

export function useAuthState() {
  const { store } = useAuthContext()
  return useStore(store, (state) => state)
}
