// Translates between the API's field names (Django/snake_case) and the names the UI components use.
// If your Django serializers use different names, change them HERE only - no component needs to change.

// DRF may return a plain array or a paginated {count, next, previous, results} object.
export const unwrap = d => (Array.isArray(d) ? d : Array.isArray(d?.results) ? d.results : [])

export const projectFromApi = p => ({
  id: p.id, cat: p.category ?? '', name: p.name ?? '', location: p.location ?? '', client: p.client ?? '',
  scope: p.scope ?? '', area: p.area ?? '', system: p.structural_system ?? '', status: p.status ?? '', image: p.image || '',
})
export const projectToApi = p => ({
  category: p.cat, name: p.name, location: p.location, client: p.client,
  scope: p.scope, area: p.area, structural_system: p.system, status: p.status,
})

export const enquiryFromApi = e => ({
  id: e.id, date: e.created_at, status: e.status, name: e.name ?? '', company: e.company ?? '', mobile: e.mobile ?? '',
  email: e.email ?? '', location: e.location ?? '', type: e.project_type ?? '', area: e.approx_area ?? '', message: e.message ?? '',
})
export const enquiryToApi = f => ({
  name: f.name, company: f.company, mobile: f.mobile, email: f.email,
  location: f.location, project_type: f.type, approx_area: f.area, message: f.message,
})

export const openingFromApi = o => ({ id: o.id, title: o.title ?? '', active: !!o.is_active })

export const contactFromApi = c => ({ label: c.label, value: c.value ?? '' })
export const contactToApi = c => ({ label: c.label, value: c.value })
