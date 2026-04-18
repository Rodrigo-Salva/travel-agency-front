import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { API } from './endpoints'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/'

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// ------- Request interceptor: attach Bearer token -------
apiClient.interceptors.request.use((config) => {
  // Import lazily to avoid circular deps at module load time
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ------- Response interceptor: silent token refresh on 401 -------
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (err: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token!)
    }
  })
  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`
              resolve(apiClient(originalRequest))
            },
            reject,
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = getRefreshToken()
        if (!refreshToken) throw new Error('No refresh token')

        const { data } = await axios.post(`${BASE_URL}${API.auth.refresh}`, {
          refresh: refreshToken,
        })

        const newAccessToken: string = data.access
        setAccessToken(newAccessToken)
        processQueue(null, newAccessToken)

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        clearTokens()
        // Redirect to login only in browser context
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

// ------- Token storage helpers (sessionStorage) -------
// These are defined here to avoid circular imports with the auth store.
// The auth store also calls these to keep Zustand in sync.

const ACCESS_TOKEN_KEY = 'ta_access'
const REFRESH_TOKEN_KEY = 'ta_refresh'

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setAccessToken(token: string): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(ACCESS_TOKEN_KEY, token)
}

export function setTokens(access: string, refresh: string): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(ACCESS_TOKEN_KEY, access)
  sessionStorage.setItem(REFRESH_TOKEN_KEY, refresh)
}

export function clearTokens(): void {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(ACCESS_TOKEN_KEY)
  sessionStorage.removeItem(REFRESH_TOKEN_KEY)
}
