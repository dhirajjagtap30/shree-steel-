// Default website text. The admin panel (Admin > Website pages) overrides any of these values;
// whatever the admin has not changed falls back to the value written here.
import * as D from '../data'
import mCnc from '../assets/manufacturing/cnc-plasma-cutting.webp'
import mHbeam from '../assets/manufacturing/h-beam-storage.webp'
import mServices from '../assets/manufacturing/professional-steel-services.webp'
import mSurface from '../assets/manufacturing/surface-preparation.webp'
import mWelding from '../assets/manufacturing/fabrication-welding.webp'
import mRolling from '../assets/manufacturing/hot-rolling.webp'
import mCasting from '../assets/manufacturing/steel-casting.webp'
import mBlasting from '../assets/manufacturing/sand-blasting.webp'

const services = Object.fromEntries(Object.entries(D.SERVICES).map(([slug, s]) => [slug, {
  title: s.title,
  cardTitle: slug === 'peb' ? 'PEB' : '',   // shorter title used on the Home page card (empty = use title)
  blurb: s.blurb,
  flowTitle: s.flowTitle || 'Our process',
  flow: s.flow || [],
  groups: s.groups.map(([title, items]) => ({ title, items })),
  custom: !!s.custom,
  customTitle: s.custom ? 'Custom Precast Solutions' : '',
  customText: s.custom ? "Don't see the product you need? Share your drawing or requirement with us." : '',
}]))

// First screen (division cards). Edit in Admin > Website pages > First screen.
// target: peb | precast | industrial = opens only that division's website; all = opens the full website.
const gwCard = (slug, button = 'Open website') => ({ title: slug === 'peb' ? 'PEB' : D.SERVICES[slug].title, text: D.SERVICES[slug].blurb, image: '', target: slug, button, showArt: true })

export const DEFAULT_CONTENT = {
  gateway: {
    kicker: 'Welcome to Shree Steel',
    heading: 'What are you',
    accent: 'looking for?',
    subtext: 'Select a division — the website opens with only what relates to it.',
    showSkip: true,
    skipText: 'Enter full website',
    cards: [gwCard('peb'), gwCard('precast'), gwCard('industrial')],
  },
  site: {
    brand: 'SHREE STEEL',
    tagline: 'Everything in steel fab',
    footerText: 'Integrated engineering & construction solutions — PEB, precast and industrial construction under one roof.',
    copyright: '© 2026 Shree Steel. All rights reserved.',
  },
  home: {
    heroImage: '',
    heroVideo: '/videos/hero.mp4',      // background video (file: public/videos/hero.mp4)
    pill: 'Integrated engineering & construction',
    titleA: 'Shree',
    titleB: 'Steel',
    tag: 'PEB | PRECAST | INDUSTRIAL CONSTRUCTION',
    intro: 'Shree Steel delivers integrated solutions in Pre-Engineered Buildings, Precast Concrete structures and Industrial Construction — from design and manufacturing to execution.',
    stats: [
      { title: 'PEB', text: 'Pre-engineered buildings' }, { title: 'Precast', text: 'Concrete products' },
      { title: 'In-house', text: 'Fabrication' }, { title: 'Turnkey', text: 'Design to execution' },
    ],
    marquee: ['PEB Structures', 'Precast Concrete', 'Industrial Construction', 'Engineering & Design', 'CNC Plasma Cutting', 'H-Beam Production', 'Sand Blasting', 'Quality Control', 'Site Safety'],
    aboutKicker: 'About Us',
    aboutHeading: 'Engineering that builds industry',
    aboutText: 'Shree Steel is an engineering and construction company providing integrated solutions across Pre-Engineered Buildings, Precast Concrete and Industrial Construction.',
    processKicker: 'How we work',
    processHeading: 'From drawing to erection',
    ctaTitle: 'Planning a shed, plant or precast order?',
    ctaText: 'Share your requirement and we will revert with a quote.',
  },
  about: {
    heroBadge: 'Integrated engineering & construction',
    heading: 'Engineering that builds industry',
    intro: 'Shree Steel is an engineering and construction company providing integrated solutions across Pre-Engineered Buildings, Precast Concrete and Industrial Construction.',
    vision: 'To become a trusted engineering and construction partner for industrial and infrastructure development.',
    mission: 'To deliver safe, efficient and cost-effective engineering solutions through quality, technology and execution excellence.',
    peopleKicker: 'Leadership & vision',
    peopleHeading: 'The people behind Shree Steel',
    peopleHint: 'Tap a photo to know more.',
    // Edit these in Admin > Website pages > About > People. Photo is optional (initials are shown until you add one).
    people: [
      { name: 'Founder Name', role: 'Founder & Managing Director', photo: '', details: ['Replace this with the founder\'s experience', 'Add key achievements, one per line', 'Change the photo, name and details from Admin'] },
      { name: 'Director Name', role: 'Director', photo: '', details: ['Add this person\'s role and responsibilities', 'Add key achievements, one per line'] },
    ],
    // Road map on the About page. Edit in Admin > Website pages > About > Road map (add / edit / reorder / delete). Photo is optional.
    journeyKicker: 'Our journey',
    journeyHeading: 'Our road map',
    journeyHint: 'The milestones that shaped Shree Steel.',
    journeyEnd: 'And the journey continues…',
    journey: [
      { year: '2017', title: 'Where it began', text: 'Replace this with how and where Shree Steel started.', photo: '' },
      { year: '2018', title: 'First big step', text: 'Add an important project, expansion or achievement of this year.', photo: '' },
      { year: '2020', title: 'Growing capacity', text: 'Add new facilities, machines, certifications or divisions.', photo: '' },
    ],
    approachTitle: 'Our Approach',
    approach: 'Controlled manufacturing and construction processes, with inspection at every stage and safety built into every site.',
    strengthsTitle: 'Our Strength',
    strengths: D.STRENGTHS,
    whyKicker: 'Why Shree Steel?',
    whyHeading: 'Everything under one roof',
    why: D.WHY.map(([title, text]) => ({ title, text })),
  },
  services: {
    heading: 'One partner, design to execution',
    intro: 'PEB, precast, industrial construction and engineering — under one roof.',
    items: services,
  },
  projects: {
    heading: 'Proof of delivery',
    intro: 'Browse our work across PEB, industrial civil and precast.',
  },
  manufacturing: {
    heading: 'Our manufacturing facility',
    intro: 'In-house steel fabrication and precast manufacturing.',
    items: D.MANUFACTURING,
    galleryKicker: 'Inside our facility',
    galleryHeading: 'Our manufacturing in action',
    // Edit in Admin > Website pages > Manufacturing > Facility photos (add, replace, rename, reorder, delete).
    // wide = true shows the photo across the full width of the page.
    gallery: [
      { src: mCnc, caption: 'CNC Plasma Cutting', wide: false },
      { src: mHbeam, caption: 'H-Beam Stock & Storage', wide: false },
      { src: mServices, caption: 'Professional Steel Services', wide: true },
      { src: mSurface, caption: 'Surface Preparation & Finishing', wide: false },
      { src: mWelding, caption: 'Fabrication & Welding', wide: false },
      { src: mRolling, caption: 'Hot Rolling', wide: false },
      { src: mCasting, caption: 'Steel Melting & Casting', wide: false },
      { src: mBlasting, caption: 'Sand Blasting', wide: false },
    ],
  },
  quality: {
    heading: 'Built right. Built safe.',
    intro: '',
    qualityTitle: 'Quality',
    quality: D.QUALITY,
    safetyTitle: 'Safety',
    safety: D.SAFETY,
  },
  careers: {
    heading: 'Build your career with Shree Steel',
    intro: '',
    emptyText: 'No open positions right now. Check back soon.',
    buttonText: 'Apply / Enquire',
  },
  contact: {
    heading: "Let's build your next project",
    intro: 'Tell us about your requirement.',
  },
}
