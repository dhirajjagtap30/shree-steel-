import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  LayoutGrid, Cog as CogIcon, ArrowRight, Building2, Boxes, HardHat, Ruler, Factory, Warehouse, ShieldCheck, Hammer, Cog, Flame, Wrench, SprayCan,
  ClipboardCheck, Users, Briefcase, Phone, Mail, MapPin, Send, CheckCircle2, Layers, Gauge, Award, Compass, Truck, Eye, Target, Map as MapIcon, X, ChevronLeft, ChevronRight,
} from 'lucide-react'
import * as D from './data'
import { projectsService, openingsService, enquiriesService } from './api/services'
import { useAsync } from './hooks/useAsync'
import { useAction } from './hooks/useAction'
import { useContact } from './context/ContactContext'
import { useContent } from './context/ContentContext'
import AsyncState from './components/AsyncState'
import { Reveal, FitImg, cssUrl } from './ui'
import { useDivision } from './context/DivisionContext'
import heroImg from './assets/hero.webp'
import AboutFuturistic from './components/AboutFuturistic'

const SERVICE_ICON = { peb: Warehouse, precast: Boxes, industrial: Factory, engineering: Ruler }
const STRENGTH_ICON = [Ruler, Factory, Compass, HardHat, ClipboardCheck, Building2]
const WHY_ICON = [Layers, Cog, Ruler, Compass, Gauge, Factory]
const CAT_ICON = { All: LayoutGrid, 'PEB Projects': Warehouse, 'Industrial Construction': Factory, 'Precast Projects': Boxes }
const PROC_ICON = [Compass, Ruler, Hammer, SprayCan, Truck, HardHat]
const MFG_ICON = [Hammer, Cog, Layers, Flame, Wrench, SprayCan, SprayCan, Boxes]

const Head = ({ k, t, children }) => {
  const { content: { banner } } = useContent()
  return (
  <div className="pagehead" style={banner ? { '--banner': `url(${banner})` } : undefined}><div className="w"><div className="k">{k}</div><h1>{t}</h1>{children && <p>{children}</p>}</div></div>
  )
}
const at = (arr, i) => arr[i % arr.length]   // icons repeat when the admin adds more items than icons
const Chips = ({ items, icon: I = CheckCircle2 }) => <ul className="chips">{items.map((x, i) => <Reveal as="li" d={Math.min(i, 8) * 40} key={i + x}><I size={15} />{x}</Reveal>)}</ul>
const Tile = ({ icon: I, i = 0, children }) => <Reveal as="li" className="it" d={(i % 4) * 70}><span className="ico"><I size={20} /></span>{children}</Reveal>
const Flow = ({ steps }) => <div className="flow">{steps.map((s, i) => <Reveal as="span" d={i * 70} key={i + s}><em>{i + 1}</em>{s}</Reveal>)}</div>
const H4 = ({ children }) => <h4 className="sub">{children}</h4>

function Why() {
  const { content: { about: a } } = useContent()
  return (
    <section className="alt"><div className="w">
      <div className="k">{a.whyKicker}</div><h2>{a.whyHeading}</h2>
      <div className="g3 mt">{a.why.map(({ title: t, text: p }, i) => { const I = at(WHY_ICON, i); return (
        <Reveal className="card" d={(i % 3) * 90} key={i + t}><span className="ico lg"><I size={26} /></span><h3>{t}</h3><p>{p}</p></Reveal>) })}</div>
    </div></section>
  )
}

const STAT_ICON = [Warehouse, Boxes, Factory, HardHat]
function Stats() {
  const { content: { home: h } } = useContent()
  return (
    <div className="w stats">{h.stats.map(({ title, text }, i) => { const I = at(STAT_ICON, i); return <Reveal d={i * 80} key={i + title}><I size={26} /><b>{title}</b><span>{text}</span></Reveal> })}</div>
  )
}

const MQ_ICON = [Warehouse, Boxes, Factory, Ruler, Flame, Layers, SprayCan, ClipboardCheck, HardHat]
function Marquee() {
  const { content: { home: h } } = useContent()
  const items = h.marquee.map((t, i) => [at(MQ_ICON, i), t])
  if (!items.length) return null
  return (
    <div className="mq" aria-hidden="true"><div className="mqt">{[...items, ...items].map(([I, t], i) => <span key={i}><I size={18} />{t}</span>)}</div></div>
  )
}

function Process() {
  const { content: { home: h, services } } = useContent()
  const { div } = useDivision()
  const sv = services.items[div || 'peb'] || Object.values(services.items)[0]
  const steps = sv?.flow || []
  if (!steps.length) return null
  return (
    <section className="alt"><div className="w">
      <div className="k">{h.processKicker}</div><h2>{div ? (sv.flowTitle || h.processHeading) : h.processHeading}</h2>
      <ol className="steps">{steps.map((s, i) => { const I = at(PROC_ICON, i); return (
        <Reveal as="li" d={i * 90} key={i + s}><span className="ico lg"><I size={26} /></span><b>{s}</b><em>Step {i + 1}</em></Reveal>) })}</ol>
    </div></section>
  )
}

// Home cards for a division: the cards the admin set (with photos), else its content groups / process / custom note.
const DCARD_ICON = [Layers, Cog, Ruler]
function divCards(s, div, custom) {
  if (!s) return null
  const to = '/services/' + div
  const list = custom?.length ? custom : D.defaultDivCards(s)
  return list.slice(0, 6).map((c, i) => ({ ...c, to, key: c.title + i, icon: DCARD_ICON[i % 3] }))
}

export function Home() {
  const { contact } = useContact()
  const { content: C } = useContent()
  const h = C.home, sv = C.services.items
  const { div } = useDivision()
  const dcards = div ? divCards(sv[div], div, h.cards) : null
  const chips = div ? D.DIVISIONS[div].chips : ['PEB', 'Precast', 'Execution']
  const chipIcons = [div ? SERVICE_ICON[div] : Warehouse, div ? Ruler : Boxes, HardHat]
  return (
    <>
      <div className="hero">
        {h.heroVideo
          ? <video className="heroimg" src={h.heroVideo} poster={h.heroImage || heroImg} autoPlay muted loop playsInline preload="auto" />
          : <img className="heroimg" src={h.heroImage || heroImg} alt="Steel structure under construction at sunset" fetchpriority="high" />}
        <div className="w hg">
        <div>
          <div className="pill hi" style={{ '--d': '0ms' }}><ShieldCheck size={14} />{h.pill}</div>
          <h1 className="hi" style={{ '--d': '100ms' }}>{h.titleA} <span>{h.titleB}</span></h1>
          <div className="tag hi" style={{ '--d': '220ms' }}>{h.tag}</div>
          <p className="hi" style={{ '--d': '320ms' }}>{h.intro}</p>
          <div className="ba hi" style={{ '--d': '440ms' }}><Link to="/contact" className="btn">Get a Quote <ArrowRight size={16} /></Link><Link to="/services" className="btn o">Our Services</Link></div>
        </div>
        <div className="hv">
          {chips.map((t, i) => { const I = chipIcons[i]; return <span key={t} className={'fb b' + (i + 1)}><I size={16} />{t}</span> })}
        </div>
      </div></div>
      <div className={'w cards' + (dcards && dcards.length < 3 ? ' c' + dcards.length : '')}>
        {(dcards || ['peb', 'precast', 'industrial'].map(s => ({ key: s, to: '/services/' + s, icon: SERVICE_ICON[s], title: sv[s].cardTitle || sv[s].title, text: sv[s].blurb }))).map((c, ci) => { const I = c.icon; return (
          <Reveal as={Link} d={ci * 120} to={c.to} className="card hov svc" key={c.key}>
            {c.image && <span className="svc-img" style={{ '--img': cssUrl(c.image) }} />}
            <span className="svc-n" aria-hidden="true">0{ci + 1}</span>
            <span className="ico lg"><I size={26} /></span>
            <h3>{c.title}</h3><p>{c.text}</p>
            <span className="more">Explore <ArrowRight size={15} /></span>
          </Reveal>) })}
      </div>
      <Stats />
      <Marquee />
      <section><div className="w g2">
        <div><div className="k">{h.aboutKicker}</div><h2>{h.aboutHeading}</h2>
          <p className="lead">{h.aboutText}</p>
          <p className="mt"><Link to="/about" className="btn">Know More <ArrowRight size={16} /></Link></p></div>
        <ul className="g2">{C.about.strengths.map((x, i) => <Tile key={i + x} i={i} icon={at(STRENGTH_ICON, i)}>{x}</Tile>)}</ul>
      </div></section>
      <Process />
      <Why />
      <section><div className="w">
        <Reveal className="cta big"><div><b>{h.ctaTitle}</b><p>{h.ctaText}</p></div>
          <div className="ba"><Link to="/contact" className="btn">Get a Quote</Link><a className="btn o" href={'tel:' + (contact.find(c => c.label === 'Phone')?.value || '')}><Phone size={16} />Call us</a></div></Reveal>
      </div></section>
    </>
  )
}

export function About() {
  return <AboutFuturistic />
}

export function Services() {
  const { content: { services: sv } } = useContent()
  return (
    <>
      <Head k="Our Services" t={sv.heading}>{sv.intro}</Head>
      <section><div className="w g2">
        {Object.entries(sv.items).map(([slug, s], si) => { const I = SERVICE_ICON[slug] || Warehouse; return (
          <Reveal as={Link} d={si * 90} to={'/services/' + slug} className="card hov" key={slug}>
            <span className="ico lg"><I size={26} /></span><h3>{s.title}</h3><p>{s.blurb}</p>
            <span className="more">View details <ArrowRight size={15} /></span>
          </Reveal>) })}
      </div></section>
    </>
  )
}

export function ServiceDetail() {
  const { div } = useDivision()
  const slug = div || useParams().slug
  const s = useContent().content.services.items[slug]
  if (!s) return <Head k="Services" t="Service not found"><Link to="/services" className="ul">Back to services</Link></Head>
  return (
    <>
      <Head k="Our Services" t={s.title}>{s.blurb}</Head>
      {s.image && <section style={{ paddingBottom: 0 }}><div className="w"><FitImg className="svimg" src={s.image} alt={s.title} /></div></section>}
      <section><div className="w">
        {s.flow.length > 0 && <><H4>{s.flowTitle || 'Our process'}</H4><Flow steps={s.flow} /></>}
        {s.groups.map(({ title: t, items }, gi) => <div key={gi + t}><H4>{t}</H4><Chips items={items} /></div>)}
        {s.custom && <div className="cta"><div><b>{s.customTitle}</b><p>{s.customText}</p></div><Link to="/contact" className="btn">Share Requirement</Link></div>}
        <p className="mt"><Link to="/contact" className="btn">Get a Quote <ArrowRight size={16} /></Link></p>
      </div></section>
    </>
  )
}

export function Projects() {
  const { data: projects, loading, error, reload } = useAsync(projectsService.list, [])
  const { content: { projects: pg } } = useContent()
  const { div } = useDivision()
  const [catPick, setCat] = useState('All')
  const cat = div ? D.DIVISIONS[div].cat : catPick
  const list = (projects || []).filter(p => cat === 'All' || p.cat === cat)
  return (
    <>
      <Head k="Projects" t={pg.heading}>{pg.intro}</Head>
      <section><div className="w">
        {!div && <div className="tabs">{D.CATS.map(c => { const I = CAT_ICON[c] || LayoutGrid; return <button key={c} className={c === cat ? 'on' : ''} onClick={() => setCat(c)}><I size={16} />{c}</button> })}</div>}
        <AsyncState loading={loading && !projects} error={error} onRetry={reload}>
        {list.length === 0 && <p className="lead">No projects in this category yet.</p>}
        <div className="g3">{list.map((p, i) => (
          <Reveal className="pc" d={(i % 3) * 80} key={p.id}>
            <div className={'ph' + (p.image ? ' has-img' : '')} style={p.image ? { '--img': cssUrl(p.image) } : undefined}>{!p.image && <><Building2 size={34} /><span>{p.cat}</span></>}</div>
            <dl>{D.FIELDS.map(([k, l]) => <div key={k}><dt>{l}</dt><dd>{p[k] || '—'}</dd></div>)}</dl>
          </Reveal>
        ))}</div>
        </AsyncState>
      </div></section>
    </>
  )
}

export function Manufacturing() {
  const { content: { manufacturing: m } } = useContent()
  const [zoom, setZoom] = useState(null)
  const shots = (m.gallery || []).filter(g => g && g.src)
  useEffect(() => {
    if (zoom === null) return
    const k = e => { if (e.key === 'Escape') setZoom(null); if (e.key === 'ArrowRight') setZoom(z => (z + 1) % shots.length); if (e.key === 'ArrowLeft') setZoom(z => (z - 1 + shots.length) % shots.length) }
    addEventListener('keydown', k)
    return () => removeEventListener('keydown', k)
  }, [zoom, shots.length])
  const cur = zoom !== null ? shots[zoom] : null
  // Fill every row: a wide photo takes a full row; a last row with 1 photo stretches full width, with 2 photos each takes half.
  const span = shots.map(() => '')
  { let run = []
    const flush = () => { if (run.length % 3 === 1) span[run[run.length - 1]] = ' s6'; if (run.length % 3 === 2) { span[run[run.length - 1]] = ' s3'; span[run[run.length - 2]] = ' s3' } run = [] }
    shots.forEach((g, i) => { if (g.wide) { flush() } else run.push(i) }) ; flush() }
  return (
    <>
      <Head k="Manufacturing" t={m.heading}>{m.intro}</Head>
      <section><div className="w"><ul className="g4">{m.items.map((x, i) => <Tile key={i + x} i={i} icon={at(MFG_ICON, i)}>{x}</Tile>)}</ul></div></section>
      {shots.length > 0 && (
        <section className="alt"><div className="w">
          {(m.galleryKicker || m.galleryHeading) && <div className="mg-head">{m.galleryKicker && <div className="k">{m.galleryKicker}</div>}{m.galleryHeading && <h2>{m.galleryHeading}</h2>}</div>}
          <ul className="mg">{shots.map((g, i) => (
            <Reveal as="li" key={i} d={(i % 3) * 80} className={'mg-i' + (g.wide ? ' wide' : span[i])}>
              <button type="button" onClick={() => setZoom(i)} aria-label={'View larger: ' + (g.caption || 'photo')} style={{ '--img': cssUrl(g.src) }}>
                <img src={g.src} alt={g.caption || 'Manufacturing facility'} loading="lazy" />
                {g.caption && <span>{g.caption}</span>}
              </button>
            </Reveal>))}
          </ul>
        </div></section>
      )}
      {cur && (
        <div className="lb" role="dialog" aria-modal="true" onClick={() => setZoom(null)}>
          <button type="button" className="ib lb-x" aria-label="Close" onClick={() => setZoom(null)}><X size={22} /></button>
          {shots.length > 1 && <button type="button" className="ib lb-n lb-p" aria-label="Previous" onClick={e => { e.stopPropagation(); setZoom((zoom - 1 + shots.length) % shots.length) }}><ChevronLeft size={26} /></button>}
          <figure onClick={e => e.stopPropagation()}><img src={cur.src} alt={cur.caption || ''} />{cur.caption && <figcaption>{cur.caption}</figcaption>}</figure>
          {shots.length > 1 && <button type="button" className="ib lb-n lb-nx" aria-label="Next" onClick={e => { e.stopPropagation(); setZoom((zoom + 1) % shots.length) }}><ChevronRight size={26} /></button>}
        </div>
      )}
    </>
  )
}

export function Quality() {
  const { content: { quality: q } } = useContent()
  return (
    <>
      <Head k="Quality & Safety" t={q.heading}>{q.intro}</Head>
      <section><div className="w g2">
        <div><h3 className="ttl"><Award size={22} />{q.qualityTitle}</h3><Chips items={q.quality} icon={ClipboardCheck} /></div>
        <div><h3 className="ttl"><HardHat size={22} />{q.safetyTitle}</h3><Chips items={q.safety} icon={ShieldCheck} /></div>
      </div></section>
    </>
  )
}

export function Careers() {
  const { data: openings, loading, error, reload } = useAsync(() => openingsService.list({ activeOnly: true }), [])
  const { content: { careers: cr } } = useContent()
  const open = (openings || []).filter(o => o.active)
  return (
    <>
      <Head k="Careers" t={cr.heading}>{cr.intro}</Head>
      <section><div className="w">
        <AsyncState loading={loading && !openings} error={error} onRetry={reload}>
        <ul className="g4">{open.map(o => <Tile key={o.id} i={0} icon={Briefcase}>{o.title}</Tile>)}</ul>
        {open.length === 0 && <p className="lead">{cr.emptyText}</p>}
        </AsyncState>
        <p className="mt"><Link to="/contact" className="btn">{cr.buttonText} <ArrowRight size={16} /></Link></p>
      </div></section>
    </>
  )
}

const CONTACT_ICON = { 'Head Office': Building2, 'Manufacturing Facility': Factory, Phone: Phone, Email: Mail, 'Google Maps': MapIcon }
export function Contact() {
  const { contact, ready, loading, error: contactError, reload } = useContact()
  const { content: C } = useContent()
  const [sent, setSent] = useState(false)
  const { busy, error, run } = useAction()
  const submit = async e => {
    e.preventDefault()
    const form = e.target
    const f = Object.fromEntries(new FormData(form)) // includes `file` (optional drawing / BOQ)
    setSent(false)
    if (await run(() => enquiriesService.create(f))) { setSent(true); form.reset() }
  }
  return (
    <>
      <Head k="Contact Us" t={C.contact.heading}>{C.contact.intro}</Head>
      <section><div className="w g2">
        <AsyncState loading={loading && !ready} error={!ready && contactError} onRetry={reload}>
        <ul className="ci">{contact.map(({ label, value }) => { const I = CONTACT_ICON[label] || MapPin; return (
          <li key={label}><span className="ico"><I size={20} /></span><div><b>{label}</b>{label === 'Google Maps' && /^https?:/.test(value) ? <a href={value} target="_blank" rel="noreferrer" className="ul">Open in Maps</a> : value}</div></li>) })}</ul>
        </AsyncState>
        <form onSubmit={submit}>
          <label>Name<input name="name" required /></label><label>Company<input name="company" /></label>
          <label>Mobile<input name="mobile" type="tel" required /></label><label>Email<input name="email" type="email" required /></label>
          <label>Project Location<input name="location" /></label>
          <label>Project Type<select name="type">{Object.values(C.services.items).map(s => <option key={s.title}>{s.title}</option>)}</select></label>
          <label className="fw">Approximate Area<input name="area" placeholder="e.g. 25,000 sq ft" /></label>
          <label className="fw">Requirement<textarea name="message" rows="4" /></label>
          <label className="fw">Upload Drawing / BOQ<input name="file" type="file" /></label>
          <button className="btn fw" type="submit" disabled={busy}><Send size={16} />{busy ? 'Sending…' : 'Submit Project Enquiry'}</button>
          {error && <p className="fw err" role="alert">{error}</p>}
          {sent && <p className="fw ok"><CheckCircle2 size={18} />Thank you! We'll get back to you shortly.</p>}
        </form>
      </div></section>
    </>
  )
}
