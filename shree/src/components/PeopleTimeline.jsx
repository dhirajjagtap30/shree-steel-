import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { X, ChevronLeft, ChevronRight, Check, Plus, ArrowRight, Briefcase } from 'lucide-react'
import { Reveal, FitImg } from '../ui'

/* People on a curved, scroll-drawn timeline. Photos sit left/right of the line; click one to open a card
   with the big photo, name, designation and details. Everything comes from Admin > Website pages > About. */

const initials = n => String(n || '?').trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase()

function Photo({ p, className = '' }) {
  return p.photo
    ? <FitImg className={'pl-img ' + className} src={p.photo} alt={p.name} loading="lazy" />
    : <span className={'pl-img pl-ini ' + className} aria-label={p.name}>{initials(p.name)}</span>
}

// smooth curve through points (Catmull-Rom converted to cubic Béziers)
const curve = pts => {
  let d = `M${pts[0][0]} ${pts[0][1]}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2
    d += ` C${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6} ${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]} ${p2[1]}`
  }
  return d
}

function Modal({ people, i, setI, onClose }) {
  const p = people[i]
  const closeRef = useRef(null)
  useEffect(() => {
    const key = e => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') setI((i + 1) % people.length)
      if (e.key === 'ArrowLeft') setI((i - 1 + people.length) % people.length)
    }
    addEventListener('keydown', key)
    const prev = document.body.style.overflow; document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => { removeEventListener('keydown', key); document.body.style.overflow = prev }
  }, [i, people.length])
  return createPortal(
    <div className="pl-modal" onClick={onClose} role="dialog" aria-modal="true" aria-label={p.name}>
      <div className="pl-card" onClick={e => e.stopPropagation()} key={i}>
        <button className="pl-x" ref={closeRef} onClick={onClose} aria-label="Close"><X size={20} /></button>
        <div className="pl-cphoto"><Photo p={p} /><span className="pl-glow" /></div>
        <div className="pl-cbody">
          <span className="pl-tag"><Briefcase size={13} />{p.role || 'Leadership'}</span>
          <h3>{p.name}</h3>
          {p.details?.length > 0 && <ul>{p.details.map((d, k) => <li key={k} style={{ '--k': k }}><span><Check size={13} /></span>{d}</li>)}</ul>}
          <Link to="/contact" className="btn" onClick={onClose}>Connect with us <ArrowRight size={16} /></Link>
        </div>
        {people.length > 1 && <div className="pl-nav">
          <button onClick={() => setI((i - 1 + people.length) % people.length)} aria-label="Previous"><ChevronLeft size={20} /></button>
          <span>{i + 1} / {people.length}</span>
          <button onClick={() => setI((i + 1) % people.length)} aria-label="Next"><ChevronRight size={20} /></button>
        </div>}
      </div>
    </div>, document.body)
}

export default function PeopleTimeline({ a }) {
  const people = (a.people || []).filter(p => p && (p.name || p.photo))
  const box = useRef(null)
  const [W, setW] = useState(1000)
  const [prog, setProg] = useState(0)
  const [open, setOpen] = useState(null)

  useEffect(() => {
    const el = box.current; if (!el) return
    const ro = new ResizeObserver(() => setW(el.clientWidth)); ro.observe(el); setW(el.clientWidth)
    let raf = 0
    const upd = () => { raf = 0; const r = el.getBoundingClientRect(); setProg(Math.max(0, Math.min(1, (innerHeight * 0.7 - r.top) / r.height))) }
    const on = () => { if (!raf) raf = requestAnimationFrame(upd) }
    addEventListener('scroll', on, { passive: true }); addEventListener('resize', on); upd()
    return () => { ro.disconnect(); removeEventListener('scroll', on); removeEventListener('resize', on); cancelAnimationFrame(raf) }
  }, [people.length])

  if (!people.length) return null
  const narrow = W < 640
  const D = narrow ? 84 : 156, ROW = narrow ? 168 : 290, TOP = narrow ? 60 : 90, CON = narrow ? 34 : 50
  const pts = people.map((_, i) => ({
    x: narrow ? 30 + (i % 2 ? 7 : -3) : W / 2 + (i % 2 ? 30 : -30),
    y: TOP + i * ROW,
  }))
  const H = TOP * 2 + (people.length - 1) * ROW
  const path = curve([[pts[0].x + (narrow ? 0 : 30), 0], ...pts.map(p => [p.x, p.y]), [pts[pts.length - 1].x + (narrow ? 0 : -30), H]])

  return (
    <>
      <div className="pl" ref={box} style={{ height: H }}>
        <svg className="pl-svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
          <defs><linearGradient id="plg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7a1fb5" /><stop offset="1" stopColor="#f5a524" /></linearGradient></defs>
          <path d={path} className="pl-base" pathLength="1" />
          <path d={path} className="pl-draw" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - prog} stroke="url(#plg)" />
        </svg>
        {people.map((p, i) => {
          const left = !narrow && i % 2 === 0, x = pts[i].x, y = pts[i].y
          const lit = prog * H >= y - 40
          return (
            <div key={i}>
              <span className={'pl-node' + (lit ? ' lit' : '')} style={{ left: x, top: y }} />
              <Reveal className={'pl-p ' + (narrow ? 'is-row' : left ? 'is-l' : 'is-r')} d={80}
                style={narrow ? { left: x + CON, top: y - D / 2, width: W - x - CON - 8 } : left ? { right: W - x + CON, top: y - D / 2, width: D } : { left: x + CON, top: y - D / 2, width: D }}>
                <button className="pl-btn" onClick={() => setOpen(i)} aria-label={'Open ' + p.name} style={{ '--D': D + 'px', '--con': CON + 'px' }}>
                  <span className="pl-ph"><Photo p={p} /><span className="pl-plus"><Plus size={14} /></span></span>
                  <span className="pl-txt"><b>{p.name}</b>{p.role && <em>{p.role}</em>}<small>Tap to know more <ArrowRight size={12} /></small></span>
                </button>
              </Reveal>
            </div>
          )
        })}
      </div>
      {open !== null && <Modal people={people} i={open} setI={setOpen} onClose={() => setOpen(null)} />}
    </>
  )
}
