import { http } from '../client'
import { EP } from '../endpoints'
import { unwrap, enquiryFromApi, enquiryToApi } from '../mappers'

export const enquiriesService = {
  // Public (no login): the Contact form. `file` is the optional drawing/BOQ upload.
  async create({ file, ...fields }) {
    const body = enquiryToApi(fields)
    if (!(file && file.size > 0)) return void (await http.post(EP.ENQUIRIES, body))
    const fd = new FormData()
    Object.entries(body).forEach(([k, v]) => fd.append(k, v ?? ''))
    fd.append('file', file)
    await http.post(EP.ENQUIRIES, fd)
  },
  // Admin only
  list: async () => unwrap((await http.get(EP.ENQUIRIES)).data).map(enquiryFromApi),
  setStatus: async (id, status) => { await http.patch(EP.enquiry(id), { status }) },
  remove: async id => { await http.delete(EP.enquiry(id)) },
}
