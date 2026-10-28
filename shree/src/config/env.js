// Single place that reads environment variables (see .env.example).
const env = import.meta.env
const flag = (v, fallback) => (v === undefined || v === '' ? fallback : String(v).toLowerCase() === 'true')

export const ENV = Object.freeze({
  API_BASE_URL: String(env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api').replace(/\/+$/, ''),
  API_TIMEOUT_MS: Number(env.VITE_API_TIMEOUT_MS) || 15000,
  USE_MOCK: flag(env.VITE_USE_MOCK, true),
  MOCK_DELAY_MS: Number(env.VITE_MOCK_DELAY_MS) || 0,
  AUTH_SCHEME: env.VITE_AUTH_SCHEME || 'Bearer',
})
