// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

import { env } from '@/env'

let client: SupabaseClient | null | undefined

export function getSupabaseClient() {
  if (client !== undefined) {
    return client
  }

  const url = env.VITE_SUPABASE_URL
  const anonKey = env.VITE_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    console.warn(
      'Supabase credentials are not configured. Falling back to mock authentication.',
    )
    client = null
    return client
  }

  client = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })

  return client
}
