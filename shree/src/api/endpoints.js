// Every backend URL lives here (relative to VITE_API_BASE_URL). Django-style trailing slashes.
export const EP = {
  LOGIN: '/auth/login/',
  CHANGE_PASSWORD: '/auth/change-password/',
  PROJECTS: '/projects/',
  project: id => `/projects/${id}/`,
  ENQUIRIES: '/enquiries/',
  enquiry: id => `/enquiries/${id}/`,
  OPENINGS: '/openings/',
  opening: id => `/openings/${id}/`,
  CONTACT: '/contact-details/',
  CONTENT: '/site-content/',
}
