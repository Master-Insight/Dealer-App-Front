// src/features/auth/types.ts
export type AuthRole = 'root' | 'admin' | 'advisor'

export interface AuthUser {
  id: string
  email: string
  role: AuthRole
  fullName?: string | null
  phone?: string | null
  companyId?: string | null
}

export interface AuthState {
  status: 'loading' | 'authenticated' | 'unauthenticated'
  user: AuthUser | null
  error: string | null
  accessToken: string | null
}

export interface Credentials {
  email: string
  password: string
}
