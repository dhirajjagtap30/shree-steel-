import { http } from '../client'
import { EP } from '../endpoints'
import { unwrap, contactFromApi, contactToApi } from '../mappers'

// Company contact details as an ordered list of {label, value} (Head Office, Phone, Email, ...).
export const contactService = {
  get: async () => unwrap((await http.get(EP.CONTACT)).data).map(contactFromApi),
  // Django: PUT /contact-details/ with the full array; respond with the saved array.
  save: async list => unwrap((await http.put(EP.CONTACT, list.map(contactToApi))).data).map(contactFromApi),
}
