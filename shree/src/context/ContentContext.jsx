import { createContext, useContext, useMemo } from 'react'
import { contentService } from '../api/services'
import { useAsync } from '../hooks/useAsync'
import { DEFAULT_CONTENT } from '../content/defaults'

// Objects merge key by key; arrays and text from the admin replace the default as a whole.
const isObj = v => v && typeof v === 'object' && !Array.isArray(v)
export const merge = (base, over) => {
  if (!isObj(base) || !isObj(over)) return over === undefined || over === null ? base : over
  const out = { ...base }
  for (const k of Object.keys(over)) out[k] = k in base ? merge(base[k], over[k]) : over[k]
  return out
}

// Website text for every page. While loading (or if the API is down) the defaults are shown, so the public site never breaks.
export const Ctx = createContext({ content: DEFAULT_CONTENT, stored: {}, ready: false, loading: false, error: '', reload() {}, setStored() {} })

export function ContentProvider({ children }) {
  const { data, loading, error, reload, setData } = useAsync(contentService.get, [])
  const value = useMemo(() => ({
    content: merge(DEFAULT_CONTENT, data || {}), stored: data || {}, ready: data !== null, loading, error, reload, setStored: setData,
  }), [data, loading, error, reload, setData])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useContent = () => useContext(Ctx)
