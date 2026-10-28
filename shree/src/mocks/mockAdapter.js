// Axios adapter that answers requests from the mock database instead of the network.
// It imitates the Django REST endpoints listed in src/api/endpoints.js (same URLs, status codes and JSON shapes).
import { ENV } from '../config/env'
import { db, persist } from './mockDb'

const MOCK_TOKEN = 'mock-admin-token'
const uid = () => Math.random().toString(36).slice(2, 9)
const clone = v => (v === undefined ? v : JSON.parse(JSON.stringify(v)))
const only = (o, keys) => Object.fromEntries(keys.filter(k => o[k] !== undefined).map(k => [k, o[k]]))
const required = (o, keys) => {
  const errors = Object.fromEntries(keys.filter(k => !String(o[k] ?? '').trim()).map(k => [k, ['This field is required.']]))
  return Object.keys(errors).length ? [400, errors] : null
}

const fileToDataUrl = f => new Promise((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(r.result); r.onerror = () => reject(r.error); r.readAsDataURL(f) })

// JSON string -> object; FormData -> object (the project photo becomes a data URL, other files are dropped like before).
async function readBody(data) {
  if (typeof data === 'string') { try { return JSON.parse(data) } catch { return {} } }
  if (typeof FormData !== 'undefined' && data instanceof FormData) {
    const out = {}
    for (const [k, v] of data.entries()) {
      if (typeof v === 'string') out[k] = v
      else if (k === 'image' && v.size > 0) out[k] = await fileToDataUrl(v)
    }
    return out
  }
  return data ?? {}
}

const PROJECT_FIELDS = ['category', 'name', 'location', 'client', 'scope', 'area', 'structural_system', 'status', 'image']
const ENQUIRY_FIELDS = ['name', 'company', 'mobile', 'email', 'location', 'project_type', 'approx_area', 'message']
const byId = (list, id) => list.find(x => String(x.id) === String(id))
const NOT_FOUND = [404, { detail: 'Not found.' }]

const routes = []
const route = (method, path, auth, handler) => routes.push({ method, auth, handler, re: new RegExp('^' + path.replace(':id', '([^/]+)') + '$') })

route('post', '/auth/login/', false, ({ body }) =>
  body.password === db().password ? [200, { token: MOCK_TOKEN }] : [400, { detail: 'Wrong password.' }])
route('post', '/auth/change-password/', true, ({ body }) => {
  if (body.old_password !== db().password) return [400, { old_password: ['Current password is wrong.'] }]
  if (String(body.new_password || '').length < 6) return [400, { new_password: ['New password must be at least 6 characters.'] }]
  db().password = body.new_password; persist()
  return [200, { detail: 'Password changed.' }]
})

route('get', '/projects/', false, () => [200, db().projects])
route('post', '/projects/', true, ({ body }) => {
  const bad = required(body, ['name']); if (bad) return bad
  const p = { id: uid(), image: '', ...only(body, PROJECT_FIELDS) }
  db().projects.unshift(p); persist()
  return [201, p]
})
route('patch', '/projects/:id/', true, ({ params, body }) => {
  const p = byId(db().projects, params[0]); if (!p) return NOT_FOUND
  Object.assign(p, only(body, PROJECT_FIELDS)); persist()
  return [200, p]
})
route('delete', '/projects/:id/', true, ({ params }) => {
  const d = db(); if (!byId(d.projects, params[0])) return NOT_FOUND
  d.projects = d.projects.filter(p => String(p.id) !== String(params[0])); persist()
  return [204, undefined]
})

route('post', '/enquiries/', false, ({ body }) => {
  const bad = required(body, ['name', 'mobile', 'email']); if (bad) return bad
  const e = { id: uid(), created_at: new Date().toISOString(), status: 'New', ...only(body, ENQUIRY_FIELDS) }
  db().enquiries.unshift(e); persist()
  return [201, e]
})
route('get', '/enquiries/', true, () => [200, db().enquiries])
route('patch', '/enquiries/:id/', true, ({ params, body }) => {
  const e = byId(db().enquiries, params[0]); if (!e) return NOT_FOUND
  if (body.status) e.status = body.status
  persist()
  return [200, e]
})
route('delete', '/enquiries/:id/', true, ({ params }) => {
  const d = db(); if (!byId(d.enquiries, params[0])) return NOT_FOUND
  d.enquiries = d.enquiries.filter(e => String(e.id) !== String(params[0])); persist()
  return [204, undefined]
})

route('get', '/openings/', false, ({ query }) =>
  [200, String(query.is_active) === 'true' ? db().openings.filter(o => o.is_active) : db().openings])
route('post', '/openings/', true, ({ body }) => {
  const bad = required(body, ['title']); if (bad) return bad
  const o = { id: uid(), title: String(body.title).trim(), is_active: body.is_active !== false }
  db().openings.push(o); persist()
  return [201, o]
})
route('patch', '/openings/:id/', true, ({ params, body }) => {
  const o = byId(db().openings, params[0]); if (!o) return NOT_FOUND
  if (body.is_active !== undefined) o.is_active = !!body.is_active
  if (body.title !== undefined) o.title = body.title
  persist()
  return [200, o]
})
route('delete', '/openings/:id/', true, ({ params }) => {
  const d = db(); if (!byId(d.openings, params[0])) return NOT_FOUND
  d.openings = d.openings.filter(o => String(o.id) !== String(params[0])); persist()
  return [204, undefined]
})

route('get', '/contact-details/', false, () => [200, db().contact])
route('put', '/contact-details/', true, ({ body }) => {
  if (!Array.isArray(body)) return [400, { detail: 'Expected a list.' }]
  db().contact = body.map(({ label, value }) => ({ label, value: value ?? '' })); persist()
  return [200, db().contact]
})

route('get', '/site-content/', false, () => [200, db().content])
route('put', '/site-content/', true, ({ body }) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return [400, { detail: 'Expected an object.' }]
  db().content = body; persist()
  return [200, db().content]
})

const header = (config, name) => { const h = config.headers; return h?.get ? h.get(name) : h?.[name] }

export async function mockAdapter(config) {
  if (ENV.MOCK_DELAY_MS) await new Promise(r => setTimeout(r, ENV.MOCK_DELAY_MS))
  const method = (config.method || 'get').toLowerCase()
  const path = String(config.url || '').split('?')[0]
  const hit = routes.map(r => ({ r, m: path.match(r.re) })).find(x => x.m && x.r.method === method)

  let status, data
  if (!hit) [status, data] = routes.some(r => r.re.test(path)) ? [405, { detail: 'Method not allowed.' }] : NOT_FOUND
  else if (hit.r.auth && header(config, 'Authorization') !== `${ENV.AUTH_SCHEME} ${MOCK_TOKEN}`)
    [status, data] = [401, { detail: 'Authentication credentials were not provided.' }]
  else [status, data] = hit.r.handler({ params: hit.m.slice(1), query: config.params || {}, body: await readBody(config.data) })

  const response = { data: clone(data), status, statusText: String(status), headers: {}, config, request: {} }
  if (status >= 200 && status < 300) return response
  throw Object.assign(new Error(`Request failed with status code ${status}`), { isAxiosError: true, config, response })
}
