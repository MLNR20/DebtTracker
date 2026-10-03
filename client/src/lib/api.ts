import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api',
  headers: {
    Accept: 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password']

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const hadToken = Boolean(localStorage.getItem('auth_token'))
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      if (!PUBLIC_PATHS.includes(window.location.pathname)) {
        if (hadToken) {
          sessionStorage.setItem('session_expired', '1')
        }
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)
