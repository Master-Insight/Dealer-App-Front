import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  server: {
    SERVER_URL: z.string().url().optional(),
  },

  clientPrefix: 'VITE_',

  client: {
    VITE_APP_TITLE: z.string().min(1).optional(),
    VITE_SUPABASE_URL: z.string().url().optional(),
    VITE_SUPABASE_ANON_KEY: z.string().min(1).optional(),
    VITE_API_URL: z.string().url().optional(),
    VITE_DATA_SOURCE_CLIENTS: z.enum(['api', 'mock']).default('api'),
    VITE_DATA_SOURCE_PRODUCTS: z.enum(['api', 'mock']).default('api'),
    VITE_DATA_SOURCE_DEALS: z.enum(['api', 'mock']).default('api'),
  },

  runtimeEnv: import.meta.env,

  emptyStringAsUndefined: true,
})
