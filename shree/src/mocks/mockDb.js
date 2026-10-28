// Tiny "database" for the mock API, persisted in localStorage so admin changes survive a refresh.
import { MOCK_ADMIN_PASSWORD, MOCK_PROJECTS, MOCK_CONTACT, MOCK_OPENINGS } from './mockData'
import { projectToApi, enquiryToApi } from '../api/mappers'

const KEY = 'shree-steel-mock-db-v2'
const LEGACY_KEY = 'shree-steel-data-v1' // data saved by the previous (pre-API) version of the site

const seed = () => ({
  projects: MOCK_PROJECTS.map((p, i) => ({ id: 'p' + i, image: '', ...p })),
  enquiries: [],
  contact: MOCK_CONTACT.map(c => ({ ...c })),
  openings: MOCK_OPENINGS.map((title, i) => ({ id: 'o' + i, title, is_active: true })),
  content: {},
  password: MOCK_ADMIN_PASSWORD,
})

// Converts data saved by the old version so nothing a user entered is lost.
const fromLegacy = o => {
  const arr = Array.isArray
  const out = {
    projects: arr(o.projects) ? o.projects.map(p => ({ id: p.id, image: p.image || '', ...projectToApi(p) })) : undefined,
    enquiries: arr(o.enquiries) ? o.enquiries.map(e => ({ id: e.id, created_at: e.date, status: e.status, ...enquiryToApi(e) })) : undefined,
    contact: arr(o.contact) ? o.contact : undefined,
    openings: arr(o.openings) ? o.openings.map(x => ({ id: x.id, title: x.title, is_active: !!x.active })) : undefined,
    password: typeof o.password === 'string' ? o.password : undefined,
  }
  return Object.fromEntries(Object.entries(out).filter(([, v]) => v !== undefined))
}

const read = key => { try { const o = JSON.parse(localStorage.getItem(key) || 'null'); return o && typeof o === 'object' ? o : null } catch { return null } }

let cache
export const db = () => {
  if (cache) return cache
  const stored = read(KEY)
  const legacy = stored ? null : read(LEGACY_KEY)
  cache = { ...seed(), ...(stored || (legacy ? fromLegacy(legacy) : {})) }
  for (const k of ['projects', 'enquiries', 'contact', 'openings']) if (!Array.isArray(cache[k])) cache[k] = seed()[k]
  if (!cache.content || typeof cache.content !== 'object' || Array.isArray(cache.content)) cache.content = {}
  return cache
}
export const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(cache)) } catch {} }
