import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Boxes, Factory, LayoutGrid, Warehouse } from 'lucide-react'
import { DIVISIONS } from '../data'
import { useContent } from '../context/ContentContext'
import { useDivision } from '../context/DivisionContext'
import './gateway.css'

/* First screen: the 3 divisions as animated cards.
   Click a card -> the website opens showing ONLY that division (its own menu, pages and content).
   "Enter full website" / Esc / click outside -> full website (or keeps the current division when re-opened from the header). */
const ICON = { peb: Warehouse, precast: Boxes, industrial: Factory }
const P = (d, i, extra) => <path d={d} pathLength="1" style={{ '--k': i }} {...extra} />

// line drawings that "draw themselves" inside each card
const ART = {
  peb: <svg viewBox="0 0 200 90" aria-hidden="true">{[
    'M10 78H190', 'M30 78V38', 'M170 78V38', 'M30 38 100 12 170 38', 'M30 52 52 40', 'M170 52 148 40', 'M100 12V30', 'M30 78 100 30 170 78', 'M62 26V34', 'M138 26V34'].map((d, i) => P(d, i))}</svg>,
  precast: <svg viewBox="0 0 200 90" aria-hidden="true">{[
    'M10 80H190', 'M100 6V30', 'M94 30H106V38H94Z', 'M30 80V58H92V80', 'M96 80V58H170V80', 'M44 58V80', 'M30 58 44 44H106L92 58', 'M110 58 124 44H184L170 58', 'M52 69H70', 'M118 69H140'].map((d, i) => P(d, i))}</svg>,
  industrial: <svg viewBox="0 0 200 90" aria-hidden="true">{[
    'M10 80H190', 'M20 80V50L44 36V50L68 36V50L92 36V80', 'M20 80H92', 'M108 80V22H124V80', 'M150 80V16', 'M150 16H190', 'M178 16V34', 'M172 34H184V42H172Z', 'M150 80 190 16'].map((d, i) => P(d, i))}
    <circle cx="116" cy="14" r="4" className="sm" style={{ '--s': 0 }} /><circle cx="122" cy="6" r="3" className="sm" style={{ '--s': 1 }} /></svg>,
}

export default function Gateway() {
  const nav = useNavigate()
  const { open, div, choose, dismiss } = useDivision()
  const { content: { gateway: g } } = useContent()
  const [state, setState] = useState(open ? 'on' : 'off')
  // the intro splash plays first (once per session) -> start the card animation after it
  const delay = useRef((() => { try { return open && !sessionStorage.getItem('splash') ? 2.7 : 0.15 } catch { return 0.15 } })())

  useEffect(() => {
    if (open) { setState('on'); return }
    setState(s => s === 'on' ? 'out' : s)
    const t = setTimeout(() => { setState(s => s === 'out' ? 'off' : s); delay.current = 0.15 }, 700)
    return () => clearTimeout(t)
  }, [open])

  useEffect(() => {
    document.body.style.overflow = state === 'on' ? 'hidden' : ''
    if (state !== 'on') return
    const k = e => { if (e.key === 'Escape') dismiss() }
    addEventListener('keydown', k)
    return () => { removeEventListener('keydown', k); document.body.style.overflow = '' }
  }, [state, dismiss])

  if (state === 'off') return null

  const pick = target => { choose(DIVISIONS[target] ? target : ''); nav('/') }
  const track = e => {
    const el = e.currentTarget, b = el.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top
    el.style.setProperty('--mx', x + 'px'); el.style.setProperty('--my', y + 'px')
    el.style.setProperty('--rx', ((y - b.height / 2) / b.height) * -8 + 'deg')
    el.style.setProperty('--ry', ((x - b.width / 2) / b.width) * 8 + 'deg')
  }
  const untrack = e => { ['--rx', '--ry'].forEach(v => e.currentTarget.style.setProperty(v, '0deg')) }

  return (
    <div className={'gw' + (state === 'out' ? ' out' : '')} style={{ '--g0': delay.current + 's' }} role="dialog" aria-label="Choose a division" onClick={e => { if (e.target === e.currentTarget) dismiss() }}>
      <div className="gw-grid" aria-hidden="true" />
      <div className="gw-orb o1" aria-hidden="true" /><div className="gw-orb o2" aria-hidden="true" />
      <div className="gw-box">
        <div className="gw-head">
          {g.kicker && <div className="gw-k">{g.kicker}</div>}
          <h1>{g.heading} <span>{g.accent}</span></h1>
          {g.subtext && <p>{g.subtext}</p>}
        </div>
        <div className="gw-cards">
          {(g.cards || []).map((c, i) => { const I = ICON[c.target] || LayoutGrid; const here = div && div === c.target; return (
            <button type="button" key={i} className={'gw-card' + (here ? ' cur' : '')} style={{ '--i': i }} onClick={() => pick(c.target)} onMouseMove={track} onMouseLeave={untrack}>
              <span className="gw-in">
                {c.image && <span className="gw-bg" style={{ backgroundImage: `linear-gradient(180deg,rgba(20,8,32,.5),rgba(20,8,32,.9) 70%),url(${c.image})` }} />}
                <span className="gw-art">{c.showArt !== false && ART[c.target]}<span className="gw-num">{String(i + 1).padStart(2, '0')}</span></span>
                <span className="gw-ico"><I size={28} /></span>
                <span className="gw-t">{c.title}</span>
                <span className="gw-p">{c.text}</span>
                <span className="gw-more">{here ? 'Current · ' : ''}{c.button || 'Open website'} <ArrowRight size={16} /></span>
              </span>
            </button>) })}
        </div>
        {g.showSkip !== false && <button type="button" className="gw-skip" onClick={() => { choose(''); nav('/') }}>{g.skipText || 'Enter full website'} <ArrowRight size={15} /></button>}
      </div>
    </div>
  )
}
