// MOCK DATA ONLY - used when VITE_USE_MOCK=true. Shaped like the API responses (see src/api/mappers.js).
// Delete the whole src/mocks folder (and the USE_MOCK line in src/api/client.js) once the real backend is live.
export const MOCK_ADMIN_PASSWORD = 'admin123'

// Replace these placeholders with real projects (or add them from the admin panel).
export const MOCK_PROJECTS = [
  { category: 'PEB Projects', name: 'Add project name', location: '—', client: '—', scope: '—', area: '—', structural_system: '—', status: '—' },
  { category: 'Industrial Construction', name: 'Add project name', location: '—', client: '—', scope: '—', area: '—', structural_system: '—', status: '—' },
  { category: 'Precast Projects', name: 'Add project name', location: '—', client: '—', scope: '—', area: '—', structural_system: '—', status: '—' },
]

export const MOCK_CONTACT = [['Head Office', 'Add address'], ['Manufacturing Facility', 'Add address'], ['Phone', 'Add phone'], ['Email', 'Add email'], ['Google Maps', 'Add map link']]
  .map(([label, value]) => ({ label, value }))

export const MOCK_OPENINGS = ['Civil Engineer', 'Structural Engineer', 'Site Engineer', 'Project Engineer', 'Planning Engineer', 'QA/QC Engineer', 'Safety Engineer', 'Fabrication Engineer', 'Project Coordinator']
