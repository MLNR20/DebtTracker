import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

const baseURL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api'

export const api = axios.create({
  baseURL,
  headers: {
    Accept: 'application/json',
  },
})

export function saveTokens(tokens: { token: string; refresh_token?: string }) {
  localStorage.setItem('auth_token', tokens.token)
  if (tokens.refresh_token) {
    localStorage.setItem('auth_refresh_token', tokens.refresh_token)
  }
}

export function clearSession() {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('auth_refresh_token')
  localStorage.removeItem('auth_user')
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password']

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean }

// A single in-flight refresh shared by all requests that 401 at the same time,
// since refresh tokens are single-use (rotated).
let refreshPromise: Promise<string> | null = null

function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    const refreshToken = localStorage.getItem('auth_refresh_token')
    if (!refreshToken) {
      return Promise.reject(new Error('No refresh token'))
    }
    // Plain axios (not `api`) so this call skips our interceptors.
    refreshPromise = axios
      .post<{ token: string; refresh_token: string }>(
        `${baseURL}/refresh`,
        { refresh_token: refreshToken },
        { headers: { Accept: 'application/json' } },
      )
      .then(({ data }) => {
        saveTokens(data)
        return data.token
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

function endSession(hadToken: boolean) {
  clearSession()
  if (!PUBLIC_PATHS.includes(window.location.pathname)) {
    if (hadToken) {
      sessionStorage.setItem('session_expired', '1')
    }
    window.location.href = '/login'
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status !== 401) {
      return Promise.reject(error)
    }

    const original = error.config as RetriableConfig | undefined
    const hadToken = Boolean(localStorage.getItem('auth_token'))

    if (original && !original._retry && hadToken && localStorage.getItem('auth_refresh_token')) {
      original._retry = true
      try {
        const newToken = await refreshAccessToken()
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      } catch {
        // refresh failed — fall through to ending the session
      }
    }

    endSession(hadToken)
    return Promise.reject(error)
  },
)
