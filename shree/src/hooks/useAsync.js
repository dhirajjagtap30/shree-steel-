import { useCallback, useEffect, useRef, useState } from 'react'
import { getErrorMessage } from '../api/errors'

// Runs an async loader (usually a service call) and tracks { data, loading, error }.
//   const { data, loading, error, reload, setData } = useAsync(projectsService.list, [])
export function useAsync(loader, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: '' })
  const [tick, setTick] = useState(0)
  const loaderRef = useRef(loader)
  loaderRef.current = loader

  useEffect(() => {
    let alive = true
    setState(s => ({ ...s, loading: true, error: '' }))
    loaderRef.current()
      .then(data => { if (alive) setState({ data, loading: false, error: '' }) })
      .catch(err => { if (alive) setState(s => ({ ...s, loading: false, error: getErrorMessage(err) })) })
    return () => { alive = false }
  }, [...deps, tick]) // eslint-disable-line react-hooks/exhaustive-deps

  const reload = useCallback(() => setTick(t => t + 1), [])
  const setData = useCallback(next => setState(s => ({ ...s, data: typeof next === 'function' ? next(s.data) : next })), [])
  return { ...state, reload, setData }
}
