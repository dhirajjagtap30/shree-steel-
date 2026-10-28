import { http } from '../client'
import { EP } from '../endpoints'
import { unwrap, projectFromApi, projectToApi } from '../mappers'

// A new photo (File) is sent as multipart/form-data; otherwise plain JSON.
const toBody = ({ imageFile, ...project }) => {
  const body = projectToApi(project)
  if (!imageFile) return body
  const fd = new FormData()
  Object.entries(body).forEach(([k, v]) => fd.append(k, v ?? ''))
  fd.append('image', imageFile)
  return fd
}

export const projectsService = {
  list: async () => unwrap((await http.get(EP.PROJECTS)).data).map(projectFromApi),
  create: async project => projectFromApi((await http.post(EP.PROJECTS, toBody(project))).data),
  update: async (id, project) => projectFromApi((await http.patch(EP.project(id), toBody(project))).data),
  remove: async id => { await http.delete(EP.project(id)) },
}
