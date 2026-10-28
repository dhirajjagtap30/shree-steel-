import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, ArrowDown, Target, Eye, ShieldCheck, Ruler, Factory, Compass, HardHat, ClipboardCheck, Building2,
  Layers, Cog, Gauge, Activity, Phone, Check, Quote, Briefcase, Users, Hammer, SprayCan, Truck, Boxes, Warehouse,
  Flame, Wrench, Zap, Award, Sparkles, Star, Milestone,
} from 'lucide-react'
import { useContent } from '../context/ContentContext'
import { useContact } from '../context/ContactContext'
import { Reveal } from '../ui'
import './aboutFuturistic.css'
import PeopleTimeline from './PeopleTimeline'
import RoadMap from './RoadMap'

const STRENGTH_ICON = [Ruler, Factory, Compass, HardHat, ClipboardCheck, Building2]
const WHY_ICON = [Layers, Cog, Ruler, Compass, Gauge, Factory]
const PROC_ICON = [Compass, Ruler, Hammer, SprayCan, Truck, HardHat]
const SERVICE_ICON = { peb: Warehouse, precast: Boxes, industrial: Factory, engineering: Ruler }
const MQ_ICON = [Warehouse, Boxes, Factory, Ruler, Flame, Layers, SprayCan, ClipboardCheck, HardHat]
const ORBIT = [Hammer, Cog, HardHat, Ruler, Flame, Wrench]   // decorative icons floating around the hero
const at = (arr, i) => arr[i % arr.length]

/* ---------- card that tilts in 3D and follows the cursor with a light spot ---------- */
function Tilt({ children, className = '' }) {
  const ref = useRef(null)
  const move = e => {
    const el = ref.current; if (!el) return
    const b = el.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top
    el.style.setProperty('--rx', ((y - b.height / 2) / (b.height / 2)) * -10 + 'deg')
    el.style.setProperty('--ry', ((x - b.width / 2) / (b.width / 2)) * 10 + 'deg')
    el.style.setProperty('--mx', (x / b.width) * 100 + '%'); el.style.setProperty('--my', (y / b.height) * 100 + '%')
  }
  const leave = () => { const el = ref.current; if (el) { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg') } }
  return <div ref={ref} className={'ab-tilt ' + className} onMouseMove={move} onMouseLeave={leave}><div className="ab-tilt-in">{children}</div></div>
}

/* ---------- number that counts up when scrolled into view ---------- */
function Counter({ value, suffix = '', label, icon: Icon, i }) {
  const ref = useRef(null)
  const [n, setN] = useState(0)
  useEffect(() => {
    const el = ref.current; if (!el) return
    let t = 0
    const run = () => {
      const start = performance.now(), dur = 1800
      const step = now => { const p = Math.min(1, (now - start) / dur); setN(Math.round(value * (1 - Math.pow(1 - p, 3)))); if (p < 1) t = requestAnimationFrame(step) }
      t = requestAnimationFrame(step)
    }
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) { setN(value); return }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { run(); io.disconnect() } }, { threshold: 0.4 })
    io.observe(el)
    return () => { io.disconnect(); cancelAnimationFrame(t) }
  }, [value])
  return (
    <Reveal d={i * 90} className="ab-stat-w">
      <div ref={ref} className="ab-stat">
        <span className="ab-ico pulse"><Icon size={22} /></span>
        <b>{String(n).padStart(2, '0')}{suffix}</b>
        <small>{label}</small>
      </div>
    </Reveal>
  )
}

/* small section heading: icon + label, big title, optional hint */
const Head = ({ icon: I, k, children, hint }) => (
  <div className="ab-head">
    <Reveal><div className="k ab-k">{I && <I size={16} />}{k}</div></Reveal>
    <Reveal d={80}><h2>{children}</h2></Reveal>
    {hint && <Reveal d={160}><p>{hint}</p></Reveal>}
  </div>
)

export default function AboutFuturistic() {
  const { content: c } = useContent()
  const { contact } = useContact()
  const a = c.about
  const [tab, setTab] = useState('mission')
  const [node, setNode] = useState(null)
  const [svc, setSvc] = useState(null)
  const bar = useRef(null)
  const tl = useRef(null)

  useEffect(() => {
    // scroll progress bar + timeline line that "draws" itself as you scroll
    const onScroll = () => {
      const d = document.documentElement, max = d.scrollHeight - innerHeight
      if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`
      const el = tl.current
      if (el) { const r = el.getBoundingClientRect(); el.style.setProperty('--prog', Math.max(0, Math.min(1, (innerHeight * 0.65 - r.top) / r.height))) }
    }
    addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll)
    onScroll()
    return () => { removeEventListener('scroll', onScroll); removeEventListener('resize', onScroll) }
  }, [])

  const counters = [
    [Object.keys(c.services?.items || {}).length, '', 'Service lines', Building2],
    [c.manufacturing?.items?.length || 0, '', 'Manufacturing capabilities', Factory],
    [c.quality?.quality?.length || 0, '', 'Quality inspection stages', ShieldCheck],
    [a.strengths?.length || 0, '', 'Core strengths', HardHat],
  ]
  const steps = Object.values(c.services?.items || {})[0]?.flow || []
  const tabs = [
    ['mission', 'Our Mission', Target, 'Mission', a.mission],
    ['vision', 'Our Vision', Eye, 'Vision', a.vision],
    ['approach', 'Our Approach', Layers, a.approachTitle, a.approach],
  ]
  const cur = tabs.find(t => t[0] === tab)
  const CurIcon = cur[2]
  const phone = contact?.find?.(x => x.label === 'Phone')?.value || ''
  const strip = (c.home?.marquee || []).map((t, i) => [at(MQ_ICON, i), t])
  const words = String(a.heading || '').split(' ')

  return (
    <div className="ab">
      <div className="ab-prog" aria-hidden="true"><i ref={bar} /></div>
      <div className="ab-grid" aria-hidden="true" />

      {/* HERO */}
      <section className="ab-hero">
        <div className="ab-orbit" aria-hidden="true">
          {ORBIT.map((I, i) => <span key={i} className={'ab-orb o' + (i + 1)}><I size={22} /></span>)}
        </div>
        <div className="w">
          <div className="ab-pill"><Factory size={15} />{a.heroBadge}<Sparkles size={14} className="ab-spk" /></div>
          <h1 aria-label={a.heading}>{words.map((w, i) => <span key={i} className="ab-word" style={{ '--i': i }} aria-hidden="true">{w}&nbsp;</span>)}</h1>
          <p className="ab-lead">{a.intro}</p>
          <div className="ba ab-cta">
            <Link to="/contact" className="btn ab-shine">Get a Quote <ArrowRight size={16} /></Link>
            <a href="#ab-strength" className="btn o"><Zap size={16} />Explore Our Strengths</a>
          </div>
          <a href="#ab-strength" className="ab-scroll" aria-label="Scroll down"><ArrowDown size={18} /></a>
        </div>
      </section>

      {/* capabilities strip */}
      {strip.length > 0 && <div className="ab-mq" aria-hidden="true"><div className="ab-mqt">{[...strip, ...strip].map(([I, t], i) => <span key={i}><I size={18} />{t}</span>)}</div></div>}

      {/* COUNTERS */}
      <section className="ab-sec ab-tight"><div className="w ab-stats">
        {counters.map(([v, sfx, l, I], i) => <Counter key={l} i={i} value={v} suffix={sfx} label={l} icon={I} />)}
      </div></section>

      {/* ROAD MAP - winding road with year milestones (edit in Admin > Website pages > About > Road map) */}
      {a.journey?.some(m => m && (m.year || m.title || m.text)) && <section className="ab-sec" id="ab-journey"><div className="w">
        <Head icon={Milestone} k={a.journeyKicker} hint={a.journeyHint}>{a.journeyHeading}</Head>
        <RoadMap a={a} />
      </div></section>}

      {/* PEOPLE - curved timeline, click a photo for details (edit in Admin > About) */}
      {a.people?.some(p => p && (p.name || p.photo)) && <section className="ab-sec" id="ab-people"><div className="w">
        <Head icon={Users} k={a.peopleKicker} hint={a.peopleHint}>{a.peopleHeading}</Head>
        <PeopleTimeline a={a} />
      </div></section>}

      {/* STRENGTHS - tilt cards */}
      <section className="ab-sec" id="ab-strength"><div className="w">
        <Head icon={HardHat} k={a.strengthsTitle} hint="Hover (or tap) the cards.">Engineered for <span>industry</span></Head>
        <div className="ab-g3">
          {a.strengths.map((x, i) => { const I = at(STRENGTH_ICON, i); return (
            <Reveal key={i + x} d={(i % 3) * 90}><Tilt><span className="ab-ico lg pulse"><I size={26} /></span><h3>{x}</h3><span className="ab-no">{String(i + 1).padStart(2, '0')}</span></Tilt></Reveal>) })}
        </div>
      </div></section>

      {/* SERVICES CATALOG - click a card to see details */}
      <section className="ab-sec"><div className="w">
        <Head icon={Wrench} k="What we do" hint="Tap a card to see what is inside.">Interactive <span>service catalog</span></Head>
        <div className="ab-g4">
          {Object.entries(c.services?.items || {}).map(([slug, sv], i) => {
            const on = svc === slug, I = SERVICE_ICON[slug] || Warehouse
            const n = (sv.groups || []).reduce((t, g) => t + g.items.length, 0)
            return (
              <Reveal key={slug} d={i * 80}>
                <button className={'ab-node svc' + (on ? ' on' : '')} onClick={() => setSvc(on ? null : slug)} aria-expanded={on}>
                  <span className="ab-node-top"><span className="ab-ico pulse"><I size={20} /></span>{n > 0 && <span className="ab-chip">{n} items</span>}</span>
                  <h4>{sv.title}</h4><p>{sv.blurb}</p>
                  <span className="ab-open"><span>
                    {(sv.groups || []).slice(0, 2).map((g, gi) => (
                      <span key={gi} className="ab-grp"><em>{g.title}</em>
                        <span className="ab-tags">{g.items.slice(0, 6).map(t => <span key={t}><Check size={12} />{t}</span>)}</span>
                      </span>))}
                    <Link to={'/services/' + slug} className="ab-more" onClick={e => e.stopPropagation()}>View details <ArrowRight size={14} /></Link>
                  </span></span>
                </button>
              </Reveal>) })}
        </div>
      </div></section>

      {/* MISSION / VISION / APPROACH */}
      <section className="ab-sec"><div className="w">
        <Reveal className="ab-panel">
          <div className="ab-tabs" role="tablist">
            {tabs.map(([id, label, I]) => (
              <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}><I size={16} />{label}</button>))}
          </div>
          <div className="ab-tabbody" key={tab}>
            <span className="ab-ico xl"><CurIcon size={30} /></span>
            <h3>{cur[3]}</h3>
            <p>{cur[4]}</p>
          </div>
        </Reveal>
      </div></section>

      {/* WHY - clickable nodes */}
      <section className="ab-sec"><div className="w">
        <Head icon={Star} k={a.whyKicker} hint="Tap a card to focus it.">{a.whyHeading}</Head>
        <div className="ab-g3">
          {a.why.map(({ title: t, text: p }, i) => { const I = at(WHY_ICON, i); const on = node === i; return (
            <Reveal key={i + t} d={(i % 3) * 90}>
              <button className={'ab-node' + (on ? ' on' : '')} onClick={() => setNode(on ? null : i)} aria-pressed={on}>
                <span className="ab-node-top"><span className="ab-ico pulse"><I size={20} /></span><em>NODE // {String(i + 1).padStart(2, '0')}</em></span>
                <h4>{t}</h4><p>{p}</p>
              </button>
            </Reveal>) })}
        </div>
      </div></section>

      {/* PROCESS TIMELINE */}
      {steps.length > 0 && <section className="ab-sec"><div className="w">
        <Head icon={Compass} k={c.home.processKicker}>{c.home.processHeading}</Head>
        <ol className="ab-tl" ref={tl}>
          {steps.map((st, i) => { const I = at(PROC_ICON, i); return (
            <Reveal as="li" key={i + st} d={60} className={'ab-tl-i' + (i % 2 ? ' ab-r' : '')}>
              <span className="ab-dot"><I size={18} /></span>
              <div><small>STEP {String(i + 1).padStart(2, '0')}</small><b>{st}</b></div>
            </Reveal>) })}
        </ol>
      </div></section>}

      {/* CTA */}
      <section className="ab-sec"><div className="w">
        <Reveal className="ab-final">
          <span className="ab-ico xl pulse"><Zap size={30} /></span>
          <h2>{c.home.ctaTitle}</h2>
          <p>{c.home.ctaText}</p>
          <div className="ba" style={{ justifyContent: 'center' }}>
            <Link to="/contact" className="btn ab-shine">Get a Quote <ArrowRight size={16} /></Link>
            {phone && <a className="btn o" href={'tel:' + phone}><Phone size={16} />Call us</a>}
          </div>
        </Reveal>
      </div></section>
    </div>
  )
}
