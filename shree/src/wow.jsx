import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useContent } from './context/ContentContext'
import './wow.css'

/* Site-wide "wow" effects (desktop mouse only, all switched off for prefers-reduced-motion):
   - soft light that follows the cursor
   - cards / tiles tilt in 3D toward the cursor and catch a highlight
   - buttons are gently pulled toward the cursor (magnetic)
   - steel wipe between pages
   - scroll value (--sy) for parallax of the floating hero chips */
export function SiteFx() {
  const { pathname } = useLocation()
  const glow = useRef(null)
  const first = useRef(true)
  const [wipe, setWipe] = useState(0)

  useEffect(() => { if (first.current) { first.current = false; return } setWipe(n => n + 1) }, [pathname])

  useEffect(() => {
    const root = document.documentElement
    const onScroll = () => root.style.setProperty('--sy', String(scrollY))
    onScroll(); addEventListener('scroll', onScroll, { passive: true })
    const fine = matchMedia('(hover:hover) and (pointer:fine)').matches
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!fine || still) return () => removeEventListener('scroll', onScroll)

    const TILT = '.card,.pc,.stats>div,.it,.fx-t'
    let tilted = null, pulled = null
    const reset = (el, vars) => { if (!el) return; el.classList.remove('fx-tilt'); vars.forEach(v => el.style.removeProperty(v)) }
    const move = e => {
      const g = glow.current
      if (g) { g.style.transform = `translate3d(${e.clientX}px,${e.clientY}px,0) translate(-50%,-50%)`; g.style.opacity = 1 }
      const el = e.target instanceof Element ? e.target : null
      const t = el && el.closest(TILT)
      const tt = t && !t.closest('.ab') ? t : null          // the About page has its own tilt
      if (tilted && tilted !== tt) reset(tilted, ['--rx', '--ry', '--mx', '--my'])
      if (tt) {
        const b = tt.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top
        tt.style.setProperty('--rx', ((y - b.height / 2) / b.height) * -9 + 'deg')
        tt.style.setProperty('--ry', ((x - b.width / 2) / b.width) * 9 + 'deg')
        tt.style.setProperty('--mx', x + 'px'); tt.style.setProperty('--my', y + 'px')
        tt.classList.add('fx-tilt')
      }
      tilted = tt
      const m = el && el.closest('.btn')
      if (pulled && pulled !== m) { pulled.style.translate = ''; pulled = null }
      if (m) {
        const b = m.getBoundingClientRect()
        m.style.translate = `${(e.clientX - (b.left + b.width / 2)) * 0.2}px ${(e.clientY - (b.top + b.height / 2)) * 0.3}px`
        pulled = m
      }
    }
    const leave = () => { if (glow.current) glow.current.style.opacity = 0 }
    document.addEventListener('mousemove', move, { passive: true })
    document.documentElement.addEventListener('mouseleave', leave)
    return () => {
      removeEventListener('scroll', onScroll); document.removeEventListener('mousemove', move); document.documentElement.removeEventListener('mouseleave', leave)
      reset(tilted, ['--rx', '--ry', '--mx', '--my']); if (pulled) pulled.style.translate = ''
    }
  }, [])

  return (
    <>
      <div className="fx-glow" ref={glow} aria-hidden="true" />
      {wipe > 0 && <div key={wipe} className="fx-wipe" aria-hidden="true" />}
    </>
  )
}

/* Intro animation: the logo is "drawn", the beam slides in, name appears. Once per browser session. */
export function Splash() {
  const { content: { site } } = useContent()
  const [state, setState] = useState(() => {
    try { if (sessionStorage.getItem('splash') || matchMedia('(prefers-reduced-motion: reduce)').matches) return 'off' } catch {}
    return 'on'
  })
  useEffect(() => {
    if (state !== 'on') return
    try { sessionStorage.setItem('splash', '1') } catch {}
    document.body.style.overflow = 'hidden'
    const t1 = setTimeout(() => setState('out'), 2300), t2 = setTimeout(() => setState('off'), 2900)
    return () => { clearTimeout(t1); clearTimeout(t2); document.body.style.overflow = '' }
  }, [state === 'on'])
  useEffect(() => { if (state === 'off') document.body.style.overflow = '' }, [state])
  if (state === 'off') return null
  const brand = (site.brand || 'SHREE STEEL').split('')
  return (
    <div className={'fx-splash' + (state === 'out' ? ' out' : '')} onClick={() => setState('out')} role="presentation">
      <div className="fx-sgrid" />
      <div className="fx-sbox">
        <svg viewBox="0 0 60 40" className="fx-slogo" aria-hidden="true">
          <path className="fx-roof" pathLength="1" d="M30 3 56 15H4z" />
          <rect className="fx-beam" x="4" y="24" width="52" height="5" />
        </svg>
        <div className="fx-sname" aria-label={site.brand}>{brand.map((ch, i) => <span key={i} style={{ '--i': i }} aria-hidden="true">{ch === ' ' ? ' ' : ch}</span>)}</div>
        <div className="fx-stag">{site.tagline}</div>
        <div className="fx-sbar"><i /></div>
      </div>
    </div>
  )
}
