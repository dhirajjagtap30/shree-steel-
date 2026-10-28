import { useEffect, useRef, useState } from 'react'
import { Flag, Rocket } from 'lucide-react'
import { Reveal, FitImg } from '../ui'

/* Company road map: a winding two-lane road drawn down the page, milestones (year + title + text + optional photo)
   hang off the road alternately left / right. The road lights up as you scroll.
   Everything comes from Admin > Website pages > About > Road map (add / edit / reorder / remove). */

// smooth curve through points (Catmull-Rom converted to cubic Béziers)
const curve = pts => {
  let d = `M${pts[0][0]} ${pts[0][1]}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2
    d += ` C${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6} ${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]} ${p2[1]}`
  }
  return d
}

export default function RoadMap({ a }) {
  const items = (a.journey || []).filter(m => m && (String(m.year || '').trim() || String(m.title || '').trim() || String(m.text || '').trim()))
  const box = useRef(null)
  const [W, setW] = useState(1000)
  const [prog, setProg] = useState(0)

  useEffect(() => {
    const el = box.current; if (!el) return
    const ro = new ResizeObserver(() => setW(el.clientWidth)); ro.observe(el); setW(el.clientWidth)
    let raf = 0
    const upd = () => { raf = 0; const r = el.getBoundingClientRect(); setProg(Math.max(0, Math.min(1, (innerHeight * 0.7 - r.top) / r.height))) }
    const on = () => { if (!raf) raf = requestAnimationFrame(upd) }
    addEventListener('scroll', on, { passive: true }); addEventListener('resize', on); upd()
    return () => { ro.disconnect(); removeEventListener('scroll', on); removeEventListener('resize', on); cancelAnimationFrame(raf) }
  }, [items.length])

  if (!items.length) return null
  const narrow = W < 760
  const HW = narrow ? 16 : 30, CON = narrow ? 22 : 56, AMP = narrow ? 6 : 46, TOP = narrow ? 70 : 90, MIN = narrow ? 170 : 200
  const cx = narrow ? 40 : W / 2
  const cardW = narrow ? W - (cx + HW + CON) - 4 : Math.max(180, Math.min(380, cx - AMP - HW - CON - 8))
  const cpl = Math.max(18, Math.floor(cardW / 8.4))              // rough characters per line

  // estimated card height -> spacing between milestones so cards never overlap
  const hs = items.map(m => 64 + 34 + Math.ceil(String(m.text || '').length / cpl) * 23 + (m.photo ? Math.round(cardW * 0.5) + 14 : 0))
  const gaps = items.slice(0, -1).map((_, i) => narrow
    ? Math.max(MIN, hs[i] + 28)
    : Math.max(MIN, 0.55 * Math.max(hs[i - 1] || 0, hs[i], hs[i + 1] || 0) + 30))
  const ys = items.reduce((acc, _, i) => (acc.push(i === 0 ? TOP : acc[i - 1] + gaps[i - 1]), acc), [])
  const last = ys[ys.length - 1]
  const END = narrow ? 110 : 140
  const H = last + END
  const xs = items.map((_, i) => cx + (narrow ? (i % 2 ? AMP : -AMP) : (i % 2 ? AMP : -AMP)))
  const mid = [[xs[0] + (narrow ? 0 : AMP), 0], ...xs.map((x, i) => [x, ys[i]]), [xs[xs.length - 1] + (narrow ? 0 : -AMP), H]]
  const center = curve(mid)
  const L = curve(mid.map(([x, y]) => [x - HW, y]))
  const R = curve(mid.map(([x, y]) => [x + HW, y]))
  const Rrev = curve([...mid].reverse().map(([x, y]) => [x + HW, y])).replace(/^M/, 'L')
  const fill = `${L} ${Rrev} Z`

  return (
    <div className="rm" ref={box} style={{ height: H }}>
      <svg className="rm-svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
        <defs><linearGradient id="rmg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c58cf0" /><stop offset="1" stopColor="#f5a524" /></linearGradient></defs>
        <path d={fill} className="rm-road" />
        <path d={L} className="rm-edge" /><path d={R} className="rm-edge" />
        <path d={center} className="rm-mid" pathLength="1" />
        <path d={center} className="rm-lit" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - prog} stroke="url(#rmg)" />
      </svg>
      <span className="rm-cap rm-start" style={{ left: xs[0] + (narrow ? 0 : AMP), top: 14 }}><Flag size={13} />Start</span>
      {items.map((m, i) => {
        const left = !narrow && i % 2 === 0, x = xs[i], y = ys[i]
        const lit = prog * H >= y - 40
        const pos = narrow ? { left: x + HW + CON, top: y - 34, width: cardW }
          : left ? { right: W - (x - HW) + CON, top: y - 34, width: cardW } : { left: x + HW + CON, top: y - 34, width: cardW }
        const con = narrow ? { left: x + HW, top: y - 1, width: CON } : left ? { left: x - HW - CON, top: y - 1, width: CON } : { left: x + HW, top: y - 1, width: CON }
        return (
          <div key={i}>
            <span className={'rm-node' + (lit ? ' lit' : '')} style={{ left: x, top: y }} />
            <span className={'rm-con' + (left ? ' is-l' : '') + (lit ? ' lit' : '')} style={con} />
            <Reveal className={'rm-card' + (left ? ' is-l' : '') + (lit ? ' lit' : '')} d={60} style={pos}>
              {m.year && <span className="rm-year">{m.year}</span>}
              {m.title && <h3>{m.title}</h3>}
              {m.photo && <FitImg src={m.photo} alt={m.title || m.year || ''} loading="lazy" />}
              {m.text && <p>{m.text}</p>}
            </Reveal>
          </div>
        )
      })}
      {a.journeyEnd && <span className="rm-cap rm-end" style={{ left: xs[xs.length - 1] + (narrow ? 0 : -AMP), top: H - 34 }}><Rocket size={14} />{a.journeyEnd}</span>}
    </div>
  )
}
