import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { DIVISIONS, NAV } from '../data'
import { useContent } from './ContentContext'

/* The visitor picks a division (PEB / Precast / Industrial) on the first screen and the whole website
   then shows only that division. "" = full website. The choice is remembered for the browser session. */
const Ctx = createContext({ div: '', open: false, choose() {}, dismiss() {}, reopen() {} })
const flag = (k, v) => { try { v === null ? sessionStorage.removeItem(k) : sessionStorage.setItem(k, v) } catch {} }

export function DivisionProvider({ children }) {
  const urlDiv = (location.hash.match(/[?&]division=(\w+)/) || [])[1]       // e.g. #/?division=peb (used by the admin "View website" links)
  const [div, setDiv] = useState(() => { if (DIVISIONS[urlDiv]) return urlDiv; try { const v = sessionStorage.getItem('division'); return DIVISIONS[v] ? v : '' } catch { return '' } })
  const [open, setOpen] = useState(() => {
    if (DIVISIONS[urlDiv]) return false
    try { if (sessionStorage.getItem('gateway')) return false } catch {}
    const h = location.hash
    return !h || h === '#' || h === '#/'          // deep links (e.g. #/contact) skip the first screen
  })
  const choose = useCallback(slug => { setDiv(slug || ''); flag('division', slug || null); flag('gateway', '1'); setOpen(false) }, [])
  const dismiss = useCallback(() => { flag('gateway', '1'); setOpen(false) }, [])
  const reopen = useCallback(() => setOpen(true), [])
  const value = useMemo(() => ({ div, open, choose, dismiss, reopen }), [div, open, choose, dismiss, reopen])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useDivision = () => useContext(Ctx)

/* Menu of the website: for a division the "Services" item becomes that division, and Manufacturing is hidden when it does not apply. */
export function useNav() {
  const { div } = useDivision()
  const { content } = useContent()
  const d = DIVISIONS[div]
  if (!d) return NAV
  return NAV.filter(([to]) => to !== '/manufacturing' || content.showMfg).map(([to, t]) => to === '/services' ? ['/services/' + div, d.page] : [to, t])
}
