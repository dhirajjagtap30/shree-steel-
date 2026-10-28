import { useEffect, useState } from 'react'
import { Routes, Route, NavLink, Link, Navigate, useLocation } from 'react-router-dom'
import { Menu, X, Sun, Moon, Phone, Mail, MapPin, ArrowUp, PhoneCall, FileDown, LayoutGrid } from 'lucide-react'
import { DIVISIONS } from './data'
import { useDivision, useNav } from './context/DivisionContext'
import ScopedContent from './context/ScopedContent'
import { useContact } from './context/ContactContext'
import { useContent } from './context/ContentContext'
import f1 from './assets/footer1.webp'
import f2 from './assets/footer2.webp'
import f3 from './assets/footer3.webp'
import { Home, About, Services, ServiceDetail, Projects, Manufacturing, Quality, Careers, Contact } from './pages'
import { AdminLogin, AdminLayout, Dashboard, ProjectsAdmin, EnquiriesAdmin, OpeningsAdmin, SettingsAdmin } from './admin'
import { PageEditor } from './adminPages'
import { DivisionsAdmin, DivisionEditor } from './divisionAdmin'
import { SiteFx, Splash } from './wow'
import Gateway from './components/Gateway'
import { lazy, Suspense } from 'react'
const BrochureModal = lazy(() => import('./components/BrochureModal'))

function ScrollTop() { const { pathname } = useLocation(); useEffect(() => { window.scrollTo(0, 0) }, [pathname]); return null }

function Extras() {
  const { contact } = useContact()
  const [p, setP] = useState(0)
  const [show, setShow] = useState(false)
  useEffect(() => {
    const f = () => { const h = document.documentElement; const max = h.scrollHeight - h.clientHeight; setP(max > 0 ? h.scrollTop / max : 0); setShow(h.scrollTop > 500) }
    f(); addEventListener('scroll', f, { passive: true }); addEventListener('resize', f)
    return () => { removeEventListener('scroll', f); removeEventListener('resize', f) }
  }, [])
  const phone = (contact.find(c => c.label === 'Phone')?.value || '').replace(/[^\d+]/g, '')
  return (
    <>
      <div className="sp" style={{ transform: `scaleX(${p})` }} />
      <div className="fab">
        <button className={'ib up' + (show ? ' on' : '')} aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><ArrowUp size={20} /></button>
        {phone.length >= 7 && <a className="ib call" href={'tel:' + phone} aria-label="Call us"><PhoneCall size={20} /></a>}
      </div>
    </>
  )
}

function useTheme() {
  const [t, setT] = useState(() => { try { return localStorage.getItem('theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') } catch { return 'light' } })
  useEffect(() => { document.documentElement.dataset.theme = t; try { localStorage.setItem('theme', t) } catch {} }, [t])
  return [t, () => setT(t === 'dark' ? 'light' : 'dark')]
}

export const Logo = () => {
  const { content: { site } } = useContent()
  return (
    <Link to="/" className="logo">
      <svg viewBox="0 0 60 34"><path d="M30 2 56 14H4z" fill="#b45be8" /><rect x="4" y="22" width="52" height="5" fill="#f5a524" /></svg>
      <span><b>{site.brand}</b><small>{site.tagline}</small></span>
    </Link>
  )
}

function Header({ theme, toggle }) {
  const [open, setOpen] = useState(false)
  const [bro, setBro] = useState(false)
  const { pathname } = useLocation()
  const NAV = useNav()
  const { div, reopen } = useDivision()
  useEffect(() => { setOpen(false) }, [pathname])
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : '' }, [open])
  return (
    <header>
      <div className="w nav">
        <Logo />
        <nav className={open ? 'open' : ''}>
          <ul>{NAV.map(([to, t]) => <li key={to}><NavLink to={to} end={to === '/'}>{t}</NavLink></li>)}</ul>
        </nav>
        <div className="navr">
          <button type="button" className="ib swd" onClick={reopen} aria-label="Switch division" title={div ? 'Switch division (now: ' + DIVISIONS[div].name + ')' : 'Choose a division'}><LayoutGrid size={19} /></button>
          <button type="button" className="btn o brochure" onClick={() => setBro(true)} aria-label="Get Brochure" title="Get Brochure"><FileDown size={17} /><span>Get Brochure</span></button>
          <Link to="/contact" className="btn hd">Get a Quote</Link>
          <button className="ib bg" aria-label="Menu" onClick={() => setOpen(!open)}>{open ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </div>
      {bro && <Suspense fallback={null}><BrochureModal onClose={() => setBro(false)} /></Suspense>}
    </header>
  )
}

function Footer() {
  const { contact } = useContact()
  const { content: { site } } = useContent()
  const get = l => contact.find(c => c.label === l)?.value
  const NAV = useNav()
  return (
    <footer>
      <div className="fbg" aria-hidden="true">{[f1, f2, f3].map((s, i) => <img key={i} src={s} alt="" loading="lazy" style={{ animationDelay: i * 7 + 's' }} />)}</div>
      <div className="w fgrid">
        <div>
          <Logo />
          <p>{site.footerText}</p>
        </div>
        <div>
          <h4>Company</h4>
          <ul>{NAV.slice(1, 5).map(([to, t]) => <li key={to}><Link to={to}>{t}</Link></li>)}</ul>
        </div>
        <div>
          <h4>More</h4>
          <ul>{NAV.slice(5).map(([to, t]) => <li key={to}><Link to={to}>{t}</Link></li>)}<li><Link to="/admin">Admin login</Link></li></ul>
        </div>
        <div>
          <h4>Contact</h4>
          <ul className="fc">
            <li><Phone size={15} />{get('Phone')}</li>
            <li><Mail size={15} />{get('Email')}</li>
            <li><MapPin size={15} />{get('Head Office')}</li>
          </ul>
        </div>
      </div>
      <div className="w copy">{site.copyright}</div>
    </footer>
  )
}

function PublicRoutes() {
  const { div } = useDivision()
  const { content } = useContent()
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/services" element={div ? <Navigate to={'/services/' + div} replace /> : <Services />} />
      <Route path="/services/:slug" element={<ServiceDetail />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/manufacturing" element={div && !content.showMfg ? <Navigate to="/" replace /> : <Manufacturing />} />
      <Route path="/quality" element={<Quality />} />
      <Route path="/careers" element={<Careers />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="*" element={<Home />} />
    </Routes>
  )
}

function Public({ theme, toggle }) {
  const { pathname } = useLocation()
  const { div } = useDivision()
  return (
    <>
      <Splash />
      <Gateway />
      <ScopedContent>
        <SiteFx />
        <Header theme={theme} toggle={toggle} />
        <Extras />
        <main key={pathname + div} className="page"><PublicRoutes /></main>
        <Footer />
      </ScopedContent>
    </>
  )
}

export default function App() {
  const [theme, toggle] = useTheme()
  return (
    <>
      <ScrollTop />
      <Routes>
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/*" element={<AdminLayout theme={theme} toggle={toggle} />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="projects" element={<ProjectsAdmin />} />
          <Route path="enquiries" element={<EnquiriesAdmin />} />
          <Route path="openings" element={<OpeningsAdmin />} />
          <Route path="settings" element={<SettingsAdmin />} />
          <Route path="page/:key" element={<PageEditor />} />
          <Route path="divisions" element={<DivisionsAdmin />} />
          <Route path="division/:slug" element={<DivisionEditor />} />
        </Route>
        <Route path="*" element={<Public theme={theme} toggle={toggle} />} />
      </Routes>
    </>
  )
}
