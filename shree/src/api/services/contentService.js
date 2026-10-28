import { http } from '../client'
import { EP } from '../endpoints'

// Editable website text for every page, stored as ONE JSON object: { home: {...}, about: {...}, ... }.
// Keys the admin never touched are simply missing; the site falls back to src/content/defaults.js.
const asObject = d => (d && typeof d === 'object' && !Array.isArray(d) ? d : {})

export const contentService = {
  // Public. Django: GET /site-content/ -> the JSON object ({} when nothing is saved yet)
  get: async () => asObject((await http.get(EP.CONTENT)).data),
  // Admin only. Django: PUT /site-content/ with the full JSON object -> the saved object
  save: async content => asObject((await http.put(EP.CONTENT, content)).data),
}
