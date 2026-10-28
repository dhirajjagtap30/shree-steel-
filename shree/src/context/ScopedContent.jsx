import { useMemo } from 'react'
import { Ctx, merge, useContent } from './ContentContext'
import { useDivision } from './DivisionContext'
import { DEFAULT_CONTENT as DEF } from '../content/defaults'
import { DIVISIONS } from '../data'

// Use the division text only where the admin has NOT changed the default text.
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)
const ov = (cur, def, next) => same(cur, def) ? next : cur

export function scopeContent(c, div) {
  const d = DIVISIONS[div]
  if (!d) return c
  const o = c.divisions?.[div] || {}          // everything the admin edited for this division (Admin > Divisions)
  const items = c.services.items[div] ? { [div]: merge(c.services.items[div], o.service || {}) } : c.services.items
  const home = merge({
    ...c.home,
    pill: ov(c.home.pill, DEF.home.pill, d.pill), tag: ov(c.home.tag, DEF.home.tag, d.tag), intro: ov(c.home.intro, DEF.home.intro, d.intro),
    stats: ov(c.home.stats, DEF.home.stats, d.stats.map(([title, text]) => ({ title, text }))),
    marquee: ov(c.home.marquee, DEF.home.marquee, d.marquee),
    aboutHeading: ov(c.home.aboutHeading, DEF.home.aboutHeading, d.heading), aboutText: ov(c.home.aboutText, DEF.home.aboutText, d.aboutText),
    ctaTitle: ov(c.home.ctaTitle, DEF.home.ctaTitle, d.ctaTitle), ctaText: ov(c.home.ctaText, DEF.home.ctaText, d.ctaText),
  }, o.home || {})
  if (o.home?.heroImage && o.home.heroVideo === undefined) home.heroVideo = ''
  const mfgOver = { ...(o.manufacturing || {}) }; delete mfgOver.show
  return {
    ...c,
    site: merge({ ...c.site, tagline: d.full, footerText: ov(c.site.footerText, DEF.site.footerText, d.footer) }, o.site || {}),
    home,
    about: merge({
      ...c.about,
      heroBadge: ov(c.about.heroBadge, DEF.about.heroBadge, d.full), heading: ov(c.about.heading, DEF.about.heading, d.heading),
      intro: ov(c.about.intro, DEF.about.intro, d.aboutText),
      strengths: ov(c.about.strengths, DEF.about.strengths, d.strengths),
      why: ov(c.about.why, DEF.about.why, d.why.map(([title, text]) => ({ title, text }))),
    }, o.about || {}),
    services: { ...c.services, heading: d.heading, intro: d.intro, items },
    projects: merge({ ...c.projects, intro: ov(c.projects.intro, DEF.projects.intro, d.projectsIntro) }, o.projects || {}),
    manufacturing: merge({
      ...c.manufacturing, items: ov(c.manufacturing.items, DEF.manufacturing.items, d.mfg || []),
      gallery: div === 'peb' ? c.manufacturing.gallery : [],       // the default photos show steel fabrication - only the PEB division uses them
    }, mfgOver),
    quality: merge(c.quality, o.quality || {}),
    showMfg: o.manufacturing?.show ?? d.showMfg,
    banner: o.banner || '',
  }
}

/* Wraps the public website so every page/menu/footer reads the division's content. The admin panel is outside this wrapper. */
export default function ScopedContent({ children }) {
  const base = useContent()
  const { div } = useDivision()
  const value = useMemo(() => ({ ...base, content: scopeContent(base.content, div) }), [base, div])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
