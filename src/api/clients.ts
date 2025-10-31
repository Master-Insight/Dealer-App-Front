// src\api\clients.ts
import { env } from '@/env'

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  query?: Record<string, string | number | boolean | undefined>
  body?: Record<string, unknown> | undefined
  accessToken?: string | null
}

export class ApiError extends Error {
  status: number
  payload: unknown

  constructor(message: string, status: number, payload: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

function buildUrl(path: string, query?: RequestOptions['query']) {
  const baseUrl = (
    env.VITE_API_URL ??
    env.SERVER_URL ??
    'http://localhost:8000'
  ).replace(/\/$/, '')
  const url = new URL(`${baseUrl}${path}`)

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === '') return
      url.searchParams.append(key, String(value))
    })
  }

  return url.toString()
}
// Ejemplo de uso: buildUrl('/products', { limit: 10, page: 2 })
// → "http://localhost:8000/products?limit=10&page=2"

export class ApiClient {
  async request<TResponse>(path: string, options: RequestOptions = {}) {
    const { query, body, headers, accessToken, ...init } = options
    const url = buildUrl(path, query)

    const response = await fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      let payload: unknown = null
      try {
        payload = await response.json()
      } catch (error) {
        payload = null
      }

      throw new ApiError(response.statusText, response.status, payload)
    }

    if (response.status === 204) {
      return undefined as TResponse
    }

    const data = (await response.json()) as TResponse
    return data
  }
  // Ejemplo de uso: const deals = await apiClient.request<Deal[]>('/deals', { method: 'GET' })

  login(body: { email: string; password: string }) {
    return this.request<{
      access_token: string
      token_type: string
      expires_in: number
    }>('/auth/token', {
      method: 'POST',
      body,
    })
  }

  getCurrentSession(accessToken: string | null) {
    if (!accessToken) {
      return Promise.resolve(null)
    }

    return this.request<{ user: unknown }>('/auth/session', {
      method: 'GET',
      accessToken,
    })
  }
}

export const apiClient = new ApiClient()
