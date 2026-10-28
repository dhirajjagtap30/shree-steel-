import { useCallback, useState } from 'react'
import { getErrorMessage } from '../api/errors'

// Wraps a save/delete call: tracks `busy` and `error`. run() resolves true on success, false on failure.
//   const { busy, error, run } = useAction()
//   if (await run(() => projectsService.remove(id))) reload()
export function useAction() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const run = useCallback(async fn => {
    setBusy(true); setError('')
    try { await fn(); return true } catch (err) { setError(getErrorMessage(err)); return false } finally { setBusy(false) }
  }, [])
  const clearError = useCallback(() => setError(''), [])
  return { busy, error, run, clearError }
}
