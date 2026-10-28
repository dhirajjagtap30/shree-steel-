import { createContext, useContext, useMemo } from 'react'
import { contactService } from '../api/services'
import { useAsync } from '../hooks/useAsync'

// Contact details are needed on many screens (footer, call button, Contact page, admin Settings),
// so they are fetched once here and shared.
const EMPTY = []
const Ctx = createContext({ contact: EMPTY, ready: false, loading: false, error: '', reload() {}, setContact() {} })

export function ContactProvider({ children }) {
  const { data, loading, error, reload, setData } = useAsync(contactService.get, [])
  const value = useMemo(() => ({ contact: data || EMPTY, ready: data !== null, loading, error, reload, setContact: setData }), [data, loading, error, reload, setData])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useContact = () => useContext(Ctx)
