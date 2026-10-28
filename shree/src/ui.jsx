import { useEffect, useRef, useState } from 'react'

// Reveals an element with a rise animation when it scrolls into view.
export function Reveal({ as: As = 'div', d = 0, className = '', style, children, ...rest }) {
  const ref = useRef(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || !('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) { setOn(true); return }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect() } }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return <As ref={ref} className={`rv${on ? ' in' : ''} ${className}`} style={{ '--d': d + 'ms', ...style }} {...rest}>{children}</As>
}

// url("...") value for a CSS variable (safe for data: URLs and file names with spaces)
export const cssUrl = s => `url("${String(s || '').replace(/"/g, '%22')}")`

// Image that is always shown COMPLETE (object-fit: contain). The empty space is filled with a blurred copy of the same photo.
export function FitImg({ src, alt = '', className = '', style, ...rest }) {
  return <span className={'fit ' + className} style={{ '--img': cssUrl(src), ...style }}><img src={src} alt={alt} {...rest} /></span>
}
