import { http } from '../client'
import { EP } from '../endpoints'
import { unwrap, openingFromApi } from '../mappers'

export const openingsService = {
  // activeOnly=true is used by the public Careers page (GET /openings/?is_active=true)
  list: async ({ activeOnly = false } = {}) =>
    unwrap((await http.get(EP.OPENINGS, { params: activeOnly ? { is_active: true } : undefined })).data).map(openingFromApi),
  create: async title => openingFromApi((await http.post(EP.OPENINGS, { title, is_active: true })).data),
  setActive: async (id, active) => { await http.patch(EP.opening(id), { is_active: active }) },
  remove: async id => { await http.delete(EP.opening(id)) },
}
