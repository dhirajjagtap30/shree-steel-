import axios from 'axios'
import { ENV } from '../config/env'
import { getToken, clearToken } from './token'
import { toApiError } from './errors'

// The one Axios instance used by every service in src/api/services.
export const http = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: ENV.API_TIMEOUT_MS,
  headers: { Accept: 'application/json' },
})

// Mock mode: requests never leave the browser. The mock is loaded lazily, so it is a separate chunk
// that is never downloaded when VITE_USE_MOCK=false.
if (ENV.USE_MOCK) http.defaults.adapter = config => import('../mocks/mockAdapter').then(m => m.mockAdapter(config))

http.interceptors.request.use(config => {
  const token = getToken()
  if (token) config.headers.Authorization = `${ENV.AUTH_SCHEME} ${token}`
  return config
})

http.interceptors.response.use(
  res => res,
  err => {
    const apiError = toApiError(err)
    // Expired/invalid admin session -> clear it and send the user to the login page.
    if (apiError.status === 401 && !err.config?.skipAuthRedirect && getToken()) {
      clearToken()
      window.location.hash = '#/admin'
    }
    return Promise.reject(apiError)
  },
)
