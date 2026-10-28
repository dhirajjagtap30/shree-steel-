// Static website content lives here - edit this file to change text and lists.
// Data that changes at runtime (projects, enquiries, job openings, contact details) comes from the API - see src/api.
export const NAV = [['/', 'Home'], ['/about', 'About'], ['/services', 'Services'], ['/projects', 'Projects'],
  ['/manufacturing', 'Manufacturing'], ['/quality', 'Quality & Safety'], ['/careers', 'Careers'], ['/contact', 'Contact']]

export const STRENGTHS = ['Engineering & Design', 'In-house Manufacturing', 'Project Management', 'Skilled Execution Team', 'Quality Control', 'Industrial Construction Expertise']

export const SERVICES = {
  peb: { title: 'PEB Structures', blurb: 'Design, manufacturing and erection of pre-engineered steel buildings.',
    flow: ['Design', 'Detailing', 'Fabrication', 'Surface Treatment', 'Transportation', 'Erection'],
    groups: [['Applications', ['Industrial Buildings', 'Warehouses', 'Manufacturing Plants', 'Logistics Buildings', 'Workshops', 'Storage Buildings', 'Commercial PEB', 'Mezzanine Floors', 'Canopies', 'Structural Steel Buildings']],
      ['PEB Manufacturing Capabilities', ['H-Beam Production Line', 'CNC Plasma Cutting', 'Welding', 'Sand Blasting', 'Gantry Crane', 'Bolt Threading', 'Fabrication Facilities']]] },
  precast: { title: 'Precast Concrete', blurb: 'Precision-manufactured precast concrete products and building components designed for faster, safer and more efficient construction.',
    groups: [['Products', ['U Drains', 'RCC Drain Covers', 'Precast Beams', 'Precast Columns', 'Precast Footings', 'Boundary Wall Panels', 'Precast Compound Walls', 'Kerb Stones', 'Cable Trenches', 'Utility Trenches', 'Industrial Flooring Components', 'Custom Precast Products']]],
    custom: true },
  industrial: { title: 'Industrial Construction', blurb: 'Civil construction, industrial infrastructure and structural work.',
    flow: ['Concept', 'Design', 'BOQ', 'Procurement', 'Manufacturing', 'Construction', 'Commissioning'], flowTitle: 'Industrial Infrastructure',
    groups: [['Civil', ['Foundations', 'RCC Structures', 'Equipment Foundations', 'Industrial Flooring', 'Roads & Pavements', 'Drainage', 'Retaining Walls', 'Utility Structures']],
      ['Buildings & Infrastructure', ['Warehouses', 'Manufacturing Plants', 'Utility Buildings', 'Industrial Roads', 'Drainage Systems']],
      ['Structural', ['Structural Steel', 'PEB Erection', 'Platforms', 'Pipe Racks', 'Staircases', 'Mezzanine Structures', 'Equipment Structures']]] },
  engineering: { title: 'Engineering & Design', blurb: 'Design-driven engineering from planning to fabrication drawings.',
    groups: [['Capabilities', ['Architectural Planning', 'Structural Design', 'PEB Design', 'Connection Design', 'Foundation Design', 'Precast Design', 'Shop Drawings', 'Fabrication Drawings', 'BOQ & Estimation', 'Project Planning']]] },
}

export const CATS = ['All', 'PEB Projects', 'Industrial Construction', 'Precast Projects']
export const FIELDS = [['name', 'Project'], ['location', 'Location'], ['client', 'Client'], ['scope', 'Scope'], ['area', 'Area'], ['system', 'Structural System'], ['status', 'Status']]

export const MANUFACTURING = ['Steel Fabrication', 'CNC Plasma Cutting', 'H-Beam Manufacturing', 'Welding', 'Surface Preparation', 'Sand Blasting', 'Painting', 'Precast Manufacturing']
export const QUALITY = ['Incoming Material Inspection', 'Welding Inspection', 'Dimensional Inspection', 'Concrete Quality Control', 'Reinforcement Inspection', 'Fabrication Inspection', 'Final Inspection']
export const SAFETY = ['PPE', 'Work-at-height safety', 'Lifting & rigging procedures', 'Toolbox talks', 'Site safety audits', 'Permit-to-work systems']
export const WHY = [['Integrated Solutions', 'PEB + Precast + Industrial Construction under one roof.'], ['Manufacturing Capability', 'In-house steel fabrication and precast manufacturing.'],
  ['Engineering Expertise', 'Design-driven approach to construction.'], ['Project Management', 'Planning, procurement, execution and coordination.'],
  ['Quality', 'Controlled manufacturing and construction processes.'], ['Industrial Experience', 'Understanding of industrial project requirements.']]

// ---- Divisions: the website opens as a mini-site of the division the visitor picks on the first screen.
// Edit the text here. (If the admin has changed a text in Admin > Website pages, the admin text is kept.)
export const DIVISIONS = {
  peb: {
    name: 'PEB', full: 'PEB Division', page: 'PEB', cat: 'PEB Projects', showMfg: true,
    mfg: ['Steel Fabrication', 'CNC Plasma Cutting', 'H-Beam Manufacturing', 'Welding', 'Surface Preparation', 'Sand Blasting', 'Painting'],
    pill: 'Pre-Engineered Buildings', tag: 'PEB | PRE-ENGINEERED BUILDINGS', chips: ['Design', 'Fabrication', 'Erection'],
    intro: 'Design, manufacturing and erection of pre-engineered steel buildings — warehouses, factories and industrial sheds, from drawing to erection.',
    footer: 'Pre-engineered steel buildings — design, in-house fabrication and erection.',
    heading: 'Pre-engineered steel buildings', projectsIntro: 'Browse our PEB projects.',
    stats: [['Design', 'Engineered to your span & load'], ['Fabrication', 'In-house CNC, welding & blasting'], ['Erection', 'Skilled site teams'], ['Turnkey', 'Drawing to handover']],
    marquee: ['Pre-Engineered Buildings', 'Industrial Sheds', 'Warehouses', 'Mezzanine Floors', 'CNC Plasma Cutting', 'H-Beam Production', 'Sand Blasting', 'Quality Control', 'Site Safety'],
    aboutText: 'Shree Steel designs, manufactures and erects pre-engineered steel buildings for industrial, logistics and commercial use, backed by in-house fabrication.',
    ctaTitle: 'Planning a shed or steel building?', ctaText: 'Share your requirement and we will revert with a quote.',
    strengths: ['Structural Design', 'In-house Fabrication', 'CNC & H-Beam Lines', 'Skilled Erection Team', 'Quality Control', 'Site Safety'],
    why: [['In-house Fabrication', 'Cutting, welding and blasting under one roof.'], ['Engineered Design', 'Buildings designed for your span, load and use.'], ['Faster Delivery', 'Controlled manufacturing and planned erection.'],
      ['Skilled Erection', 'Experienced teams for safe site work.'], ['Quality', 'Inspection at every stage of fabrication.'], ['Industrial Experience', 'Understanding of plant and warehouse needs.']],
  },
  precast: {
    name: 'Precast', full: 'Precast Division', page: 'Precast Concrete', cat: 'Precast Projects', showMfg: false, mfg: ['Precast Manufacturing'],
    pill: 'Precast Concrete', tag: 'PRECAST CONCRETE', chips: ['Precision', 'Faster build', 'Custom'],
    intro: 'Precision-manufactured precast concrete products and building components designed for faster, safer and more efficient construction.',
    footer: 'Precast concrete products and building components for faster, safer construction.',
    heading: 'Precast concrete, made to order', projectsIntro: 'Browse our precast projects.',
    stats: [['Precast', 'Concrete products'], ['Precision', 'Factory-controlled casting'], ['Custom', 'Made to your drawing'], ['Faster', 'Quicker site installation']],
    marquee: ['U Drains', 'RCC Drain Covers', 'Precast Beams', 'Precast Columns', 'Boundary Wall Panels', 'Kerb Stones', 'Cable Trenches', 'Custom Precast Products'],
    aboutText: 'Shree Steel manufactures precast concrete products and building components that make construction faster, safer and more efficient.',
    ctaTitle: 'Need precast products?', ctaText: 'Share your drawing or requirement and we will revert with a quote.',
    strengths: ['Precast Design', 'Controlled Casting', 'Reinforcement Detailing', 'Custom Products', 'Quality Control', 'Timely Supply'],
    why: [['Factory Quality', 'Products cast in a controlled environment.'], ['Faster Construction', 'Ready components reduce time on site.'], ['Custom Products', 'Made to your drawing and requirement.'],
      ['Wide Range', 'Drains, beams, columns, walls, kerbs and more.'], ['Quality', 'Concrete and reinforcement inspection.'], ['Safer Sites', 'Less on-site casting and fewer site hazards.']],
  },
  industrial: {
    name: 'Industrial', full: 'Industrial Division', page: 'Industrial Construction', cat: 'Industrial Construction', showMfg: false, mfg: [],
    pill: 'Industrial Construction', tag: 'INDUSTRIAL CONSTRUCTION', chips: ['Civil', 'Structural', 'Execution'],
    intro: 'Civil construction, industrial infrastructure and structural work — from concept and BOQ to construction and commissioning.',
    footer: 'Civil construction, industrial infrastructure and structural work.',
    heading: 'Industrial construction, end to end', projectsIntro: 'Browse our industrial construction projects.',
    stats: [['Civil', 'Foundations to RCC structures'], ['Structural', 'Steel, platforms & pipe racks'], ['Infrastructure', 'Roads, drainage & utilities'], ['End-to-end', 'Concept to commissioning']],
    marquee: ['Industrial Construction', 'Foundations', 'RCC Structures', 'Industrial Flooring', 'Pipe Racks', 'Platforms', 'Roads & Drainage', 'Quality Control', 'Site Safety'],
    aboutText: 'Shree Steel delivers civil construction, industrial infrastructure and structural work for plants, warehouses and utility projects.',
    ctaTitle: 'Planning an industrial project?', ctaText: 'Share your requirement and we will revert with a quote.',
    strengths: ['Civil Construction', 'Structural Steel Work', 'Project Management', 'Skilled Execution Team', 'Quality Control', 'Industrial Experience'],
    why: [['Civil + Structural', 'Foundations to structural steel with one team.'], ['Project Management', 'Planning, procurement, execution and coordination.'], ['Industrial Experience', 'Understanding of plant and utility requirements.'],
      ['End-to-end Delivery', 'Concept, BOQ, construction and commissioning.'], ['Quality', 'Controlled construction processes.'], ['Safety', 'Safety built into every site.']],
  },
}

// Default cards shown under the Home hero of a division: its content groups, its process and (precast) the custom-products note.
export function defaultDivCards(s) {
  if (!s) return []
  const list = (s.groups || []).map(g => ({ title: g.title, text: g.items.slice(0, 4).join(' · ') + (g.items.length > 4 ? ' · …' : '') }))
  if (s.flow?.length) list.push({ title: s.flowTitle || 'Our process', text: s.flow.join(' → ') })
  if (s.custom && s.customTitle) list.push({ title: s.customTitle, text: s.customText })
  return list.slice(0, 3)
}
