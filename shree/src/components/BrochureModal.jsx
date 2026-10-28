import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Download, Loader2 } from 'lucide-react'

export const BROCHURE_URL = import.meta.env.BASE_URL + 'Shree_Steel_Brochure.pdf'
const FILE_NAME = 'Shree_Steel_Brochure.pdf'

export default function BrochureModal({ onClose }) {
  const box = useRef(null)
  const [state, setState] = useState('loading') // loading | ready | error
  const [pages, setPages] = useState(0)

  // close on Esc + lock page scroll
  useEffect(() => {
    const k = e => e.key === 'Escape' && onClose()
    addEventListener('keydown', k)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { removeEventListener('keydown', k); document.body.style.overflow = prev }
  }, [onClose])

  // render the PDF pages (pdf.js is loaded only when the popup opens)
  useEffect(() => {
    let dead = false
    let task
    ;(async () => {
      try {
        const pdfjs = await import('pdfjs-dist')
        const worker = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default
        pdfjs.GlobalWorkerOptions.workerSrc = worker
        task = pdfjs.getDocument(BROCHURE_URL)
        const pdf = await task.promise
        if (dead) return
        setPages(pdf.numPages)
        const host = box.current
        const width = Math.min(host.clientWidth - 24, 900)
        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          if (dead) return
          const base = page.getViewport({ scale: 1 })
          const vp = page.getViewport({ scale: (width / base.width) * dpr })
          const c = document.createElement('canvas')
          c.width = vp.width; c.height = vp.height
          c.style.width = width + 'px'; c.style.height = (vp.height / dpr) + 'px'
          c.className = 'bm-page'
          host.appendChild(c)
          await page.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise
          if (i === 1) setState('ready')
        }
      } catch (e) {
        if (!dead) setState('error')
      }
    })()
    return () => { dead = true; task?.destroy?.() }
  }, [])

  return createPortal(
    <div className="bm" role="dialog" aria-modal="true" aria-label="Brochure" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="bm-card">
        <div className="bm-top">
          <b>Shree Steel – Brochure{pages ? <small> · {pages} pages</small> : null}</b>
          <button className="ib" aria-label="Close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="bm-body">
          {state === 'loading' && <div className="bm-msg"><Loader2 className="spin" size={28} /><span>Loading brochure…</span></div>}
          {state === 'error' && <div className="bm-msg"><span>Sorry, the preview could not be loaded. Please use the Download button below.</span></div>}
          <div ref={box} className="bm-pages" />
        </div>

        <div className="bm-foot">
          <a className="btn" href={BROCHURE_URL} download={FILE_NAME}><Download size={18} />Download Brochure</a>
        </div>
      </div>
    </div>,
    document.body
  )
}
