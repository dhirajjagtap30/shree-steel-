// Turns any Axios/DRF failure into one ApiError with a human-readable message.
export class ApiError extends Error {
  constructor(message, { status = 0, data = null, code } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
    this.code = code
  }
}

// Understands DRF shapes: {"detail": "..."}, {"field": ["msg"]}, ["msg"], "msg"
const firstMessage = d => {
  if (!d) return ''
  if (typeof d === 'string') return d.trim().startsWith('<') ? '' : d // ignore HTML error pages
  if (Array.isArray(d)) return firstMessage(d[0])
  if (typeof d === 'object') {
    if (d.detail) return firstMessage(d.detail)
    for (const [k, v] of Object.entries(d)) {
      const m = firstMessage(v)
      if (m) return k === 'non_field_errors' ? m : `${k}: ${m}`
    }
  }
  return ''
}

export function toApiError(err) {
  if (err instanceof ApiError) return err
  const res = err?.response
  if (!res) {
    const timeout = err?.code === 'ECONNABORTED' || err?.code === 'ETIMEDOUT'
    return new ApiError(timeout ? 'The request timed out. Please try again.' : 'Cannot reach the server. Check your connection and try again.', { code: err?.code })
  }
  const message = firstMessage(res.data) ||
    (res.status >= 500 ? 'Server error. Please try again later.' : res.status === 404 ? 'Not found.' : `Request failed (${res.status}).`)
  return new ApiError(message, { status: res.status, data: res.data })
}

export const getErrorMessage = (err, fallback = 'Something went wrong. Please try again.') => err?.message || fallback
