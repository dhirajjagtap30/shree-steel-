import { useCallback, useEffect, useState } from 'react'
import { NavLink, Navigate, Outlet, useNavigate, useOutletContext, Link } from 'react-router-dom'
import { LayoutDashboard, FolderKanban, Inbox, Briefcase, Settings, LogOut, Sun, Moon, Plus, Pencil, Trash2, Lock, X, Globe, Save, Menu, FileText, Mail, Phone, Target, Hammer, Factory, ShieldCheck, Layers, ArrowRight, TrendingUp, LayoutGrid } from 'lucide-react'
import * as D from './data'
import { authService, projectsService, enquiriesService, openingsService, contactService } from './api/services'
import { getErrorMessage } from './api/errors'
import { ENV } from './config/env'
import { useAsync } from './hooks/useAsync'
import { useAction } from './hooks/useAction'
import { useContact } from './context/ContactContext'
import AsyncState from './components/AsyncState'
import { PAGE_LINKS } from './adminPages'
import { DivisionCards } from './divisionAdmin'

export function AdminLogin() {
  const nav = useNavigate()
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  if (authService.isAuthenticated()) return <Navigate to="/admin/dashboard" replace />
  const go = async e => {
    e.preventDefault(); setBusy(true); setErr('')
    try { await authService.login({ password: pw }); nav('/admin/dashboard') }
    catch (x) { setErr(x.status === 400 || x.status === 401 ? 'Wrong password. Try again.' : getErrorMessage(x)) }
    finally { setBusy(false) }
  }
  return (
    <div className="login">
      <form onSubmit={go} className="lbox">
        <span className="ico lg"><Lock size={26} /></span>
        <h2>Admin login</h2>
        <p className="lead">Enter the admin password to manage the website.</p>
        <label>Password<input type="password" autoFocus value={pw} onChange={e => { setPw(e.target.value); setErr('') }} /></label>
        {err && <p className="err" role="alert">{err}</p>}
        <button className="btn" type="submit" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
        <Link to="/" className="ul small"><Globe size={14} /> Back to website</Link>
      </form>
    </div>
  )
}

const LINKS = [['dashboard', 'Dashboard', LayoutDashboard], ['projects', 'Projects list', FolderKanban], ['enquiries', 'Enquiries', Inbox], ['openings', 'Job openings', Briefcase], ['settings', 'Contact & password', Settings]]
export function AdminLayout({ theme, toggle }) {
  const nav = useNavigate()
  const [open, setOpen] = useState(false)
  const [newCount, setNewCount] = useState(0)
  const authed = authService.isAuthenticated()
  // Sidebar badge: number of new enquiries. Pages call refreshBadge() after changing an enquiry.
  const refreshBadge = useCallback(() => enquiriesService.list().then(l => setNewCount(l.filter(e => e.status === 'New').length)).catch(() => {}), [])
  useEffect(() => { if (authed) refreshBadge() }, [authed, refreshBadge])
  if (!authed) return <Navigate to="/admin" replace />
  return (
    <div className="adm">
      <aside className={open ? 'open' : ''} onClick={() => setOpen(false)}>
        <div className="abrand"><b>SHREE STEEL</b><small>Admin panel</small></div>
        <nav>
          {LINKS.slice(0, 1).map(([to, t, I]) => <NavLink key={to} to={'/admin/' + to}><I size={18} />{t}</NavLink>)}
          <span className="sbl">Divisions</span>
          <NavLink to="/admin/divisions" end><LayoutGrid size={18} />All divisions</NavLink>
          {[['peb', 'PEB'], ['precast', 'Precast'], ['industrial', 'Industrial']].map(([k, t]) => <NavLink key={k} to={'/admin/division/' + k}><FileText size={18} />{t} website</NavLink>)}
          <span className="sbl">Website pages</span>
          {PAGE_LINKS.map(([k, t]) => <NavLink key={k} to={'/admin/page/' + k}><FileText size={18} />{t}</NavLink>)}
          <span className="sbl">Data</span>
          {LINKS.slice(1).map(([to, t, I]) => <NavLink key={to} to={'/admin/' + to}><I size={18} />{t}{to === 'enquiries' && newCount > 0 && <i>{newCount}</i>}</NavLink>)}
        </nav>
        <div className="abot">
          <Link to="/"><Globe size={18} />View website</Link>
          <button onClick={() => { authService.logout(); nav('/admin') }}><LogOut size={18} />Log out</button>
        </div>
      </aside>
      <div className="amain">
        <div className="atop">
          <button className="ib amenu" onClick={() => setOpen(!open)} aria-label="Menu"><Menu size={20} /></button>
          <span className="atitle">Manage website</span>
          <button className="ib" onClick={toggle} aria-label="Theme">{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>
        </div>
        <div className="abody"><Outlet context={{ refreshBadge }} /></div>
      </div>
    </div>
  )
}

// Counts up from 0 to n (skipped when the visitor prefers reduced motion).
function useCount(n) {
  const [v, setV] = useState(0)
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setV(n); return }
    let raf, t0
    const step = t => { t0 ??= t; const k = Math.min((t - t0) / 900, 1); setV(Math.round(n * (1 - Math.pow(1 - k, 3)))); if (k < 1) raf = requestAnimationFrame(step) }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [n])
  return v
}
const Count = ({ n }) => <>{useCount(n)}</>

const QUICK = [['gateway', 'First screen cards', LayoutGrid], ['home', 'Home', Globe], ['about', 'About', Target], ['services', 'Services', Hammer], ['projects', 'Projects', FolderKanban], ['manufacturing', 'Manufacturing', Factory],
  ['quality', 'Quality & Safety', ShieldCheck], ['careers', 'Careers', Briefcase], ['contact', 'Contact', Phone], ['site', 'Logo & footer', Layers]]
const ST_COLOR = { New: '#f5a524', Contacted: '#3b82f6', Quoted: '#8b5cf6', Closed: '#22a06b' }

function Bars({ rows, total }) {
  return (
    <ul className="bars">{rows.map(([label, n, color]) => (
      <li key={label}><div className="bl"><span>{label}</span><b><Count n={n} /></b></div>
        <div className="bt"><i style={{ '--w': (total ? (n / total) * 100 : 0) + '%', background: color }} /></div></li>))}</ul>
  )
}

export function Dashboard() {
  const { data, loading, error, reload } = useAsync(() => Promise.all([projectsService.list(), enquiriesService.list(), openingsService.list()]), [])
  const [projects, enquiries, openings] = data || [[], [], []]
  const newCount = enquiries.filter(e => e.status === 'New').length
  const hr = new Date().getHours()
  const hello = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening'
  const stats = [[FolderKanban, projects.length, 'Projects', '#7a1fb5', '/admin/projects'], [Inbox, enquiries.length, 'Total enquiries', '#3b82f6', '/admin/enquiries'],
    [Mail, newCount, 'New enquiries', '#f5a524', '/admin/enquiries'], [Briefcase, openings.filter(o => o.active).length, 'Open positions', '#22a06b', '/admin/openings']]
  const byStatus = ['New', 'Contacted', 'Quoted', 'Closed'].map(k => [k, enquiries.filter(e => e.status === k).length, ST_COLOR[k]])
  const byCat = D.CATS.slice(1).map((c, i) => [c, projects.filter(p => p.cat === c).length, ['#7a1fb5', '#f5a524', '#3b82f6'][i % 3]])
  return (
    <>
      <div className="dhero">
        <div>
          <span className="dk"><TrendingUp size={14} />Admin dashboard</span>
          <h1>{hello}, Admin 👋</h1>
          <p>{new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · Manage everything on your website from here.</p>
          <div className="ba"><Link to="/" className="btn"><Globe size={16} />View website</Link><Link to="/admin/page/home" className="btn o">Edit Home page <ArrowRight size={16} /></Link></div>
        </div>
        <div className="dfl" aria-hidden="true"><span className="f1"><Factory size={22} /></span><span className="f2"><Hammer size={22} /></span><span className="f3"><ShieldCheck size={22} /></span></div>
      </div>

      <AsyncState loading={loading && !data} error={error} onRetry={reload}>
        <div className="dgrid">{stats.map(([I, n, l, c, to], i) => (
          <Link to={to} className="stc" style={{ '--c': c, animationDelay: i * 70 + 'ms' }} key={l}>
            <span className="sti"><I size={22} /></span><b><Count n={n} /></b><span>{l}</span><ArrowRight className="sta" size={16} />
          </Link>))}</div>

        <h3 className="dsec">Divisions - click a card to control its website</h3>
        <DivisionCards />

        <h3 className="dsec">Edit website pages</h3>
        <div className="qa">{QUICK.map(([k, t, I], i) => (
          <Link to={'/admin/page/' + k} key={k} style={{ animationDelay: i * 45 + 'ms' }}><span className="qi"><I size={20} /></span><b>{t}</b><Pencil size={15} /></Link>))}</div>

        <div className="dcols">
          <div className="panel"><h3>Enquiries by status</h3>
            {enquiries.length === 0 ? <p className="lead">No enquiries yet.</p> : <Bars rows={byStatus} total={enquiries.length} />}</div>
          <div className="panel"><h3>Projects by category</h3>
            {projects.length === 0 ? <p className="lead">No projects yet.</p> : <Bars rows={byCat} total={projects.length} />}</div>
        </div>

        <div className="panel mt">
          <div className="arow"><h3 style={{ margin: 0 }}>Latest enquiries</h3><Link to="/admin/enquiries" className="ul small">View all</Link></div>
          {enquiries.length === 0 ? <p className="lead">No enquiries yet. Submissions from the Contact page appear here.</p> :
            <ul className="list">{enquiries.slice(0, 5).map(e => <li key={e.id}><div><b>{e.name}</b><span>{e.type} · {e.mobile}</span></div><em className={'st ' + e.status}>{e.status}</em></li>)}</ul>}
        </div>
        {ENV.USE_MOCK && <p className="note">Data is saved in this browser (localStorage). To receive enquiries from visitors on other devices, a backend/database is needed — see README.</p>}
      </AsyncState>
    </>
  )
}

const empty = { cat: D.CATS[1], name: '', location: '', client: '', scope: '', area: '', system: '', status: '', image: '' }
export function ProjectsAdmin() {
  const { data, loading, error, reload } = useAsync(projectsService.list, [])
  const projects = data || []
  const [ed, setEd] = useState(null)
  const act = useAction()
  const openEd = p => { act.clearError(); setEd(p) }
  const save = async e => {
    e.preventDefault()
    // imageFile (if a new photo was picked) is uploaded as multipart; image is only the local preview
    if (await act.run(() => ed.id ? projectsService.update(ed.id, ed) : projectsService.create(ed))) { setEd(null); reload() }
  }
  const del = async id => { if (confirm('Delete this project?') && await act.run(() => projectsService.remove(id))) reload() }
  const pick = f => { if (!f) return; if (f.size > 600000) return alert('Image too large. Use under 600 KB.'); const r = new FileReader(); r.onload = () => setEd(x => ({ ...x, image: r.result, imageFile: f })); r.readAsDataURL(f) }
  return (
    <>
      <div className="arow"><h1 className="ah">Projects</h1><button className="btn" onClick={() => openEd({ ...empty })}><Plus size={16} />Add project</button></div>
      {!ed && act.error && <p className="err" role="alert">{act.error}</p>}
      <AsyncState loading={loading && !data} error={error} onRetry={reload}>
      <div className="panel tw"><table>
        <thead><tr><th>Project</th><th>Category</th><th>Location</th><th>Status</th><th /></tr></thead>
        <tbody>{projects.map(p => <tr key={p.id}><td data-l="Project">{p.name}</td><td data-l="Category">{p.cat}</td><td data-l="Location">{p.location}</td><td data-l="Status">{p.status}</td>
          <td className="acts"><button className="ib" onClick={() => openEd(p)} aria-label="Edit"><Pencil size={16} /></button><button className="ib dng" onClick={() => del(p.id)} aria-label="Delete"><Trash2 size={16} /></button></td></tr>)}</tbody>
      </table>{projects.length === 0 && <p className="lead">No projects. Click “Add project”.</p>}</div>
      </AsyncState>
      {ed && <div className="modal" onClick={() => setEd(null)}><form className="mbox" onClick={e => e.stopPropagation()} onSubmit={save}>
        <div className="arow"><h3>{ed.id ? 'Edit project' : 'Add project'}</h3><button type="button" className="ib" onClick={() => setEd(null)}><X size={18} /></button></div>
        <label>Category<select value={ed.cat} onChange={e => setEd({ ...ed, cat: e.target.value })}>{D.CATS.slice(1).map(c => <option key={c}>{c}</option>)}</select></label>
        {D.FIELDS.map(([k, l]) => <label key={k}>{l}<input required={k === 'name'} value={ed[k]} onChange={e => setEd({ ...ed, [k]: e.target.value })} /></label>)}
        <label>Photo<input type="file" accept="image/*" onChange={e => pick(e.target.files[0])} /></label>
        {ed.image && <img src={ed.image} alt="" className="prev" />}
        {act.error && <p className="err" role="alert">{act.error}</p>}
        <button className="btn" type="submit" disabled={act.busy}><Save size={16} />{act.busy ? 'Saving…' : 'Save'}</button>
      </form></div>}
    </>
  )
}

export function EnquiriesAdmin() {
  const { refreshBadge } = useOutletContext()
  const { data, loading, error, reload, setData } = useAsync(enquiriesService.list, [])
  const enquiries = data || []
  const act = useAction()
  const setSt = async (id, status) => { if (await act.run(() => enquiriesService.setStatus(id, status))) { setData(l => l.map(e => e.id === id ? { ...e, status } : e)); refreshBadge() } }
  const del = async id => { if (confirm('Delete this enquiry?') && await act.run(() => enquiriesService.remove(id))) { setData(l => l.filter(e => e.id !== id)); refreshBadge() } }
  return (
    <>
      <h1 className="ah">Enquiries</h1>
      {act.error && <p className="err" role="alert">{act.error}</p>}
      <AsyncState loading={loading && !data} error={error} onRetry={reload}>
      {enquiries.length === 0 && <div className="panel"><p className="lead">No enquiries yet.</p></div>}
      <div className="eq">{enquiries.map(e => (
        <div className="panel" key={e.id}>
          <div className="arow"><div><b>{e.name}</b>{e.company && <span className="mut"> · {e.company}</span>}</div>
            <select value={e.status} onChange={x => setSt(e.id, x.target.value)} className={'st ' + e.status}>{['New', 'Contacted', 'Quoted', 'Closed'].map(s => <option key={s}>{s}</option>)}</select></div>
          <p className="mut small">{new Date(e.date).toLocaleString()}</p>
          <p><a href={'tel:' + e.mobile} className="ul">{e.mobile}</a> · <a href={'mailto:' + e.email} className="ul">{e.email}</a></p>
          <p className="mut">{e.type}{e.location && ' · ' + e.location}{e.area && ' · ' + e.area}</p>
          {e.message && <p>{e.message}</p>}
          <button className="ib dng" onClick={() => del(e.id)} aria-label="Delete"><Trash2 size={16} /></button>
        </div>))}</div>
      </AsyncState>
    </>
  )
}

export function OpeningsAdmin() {
  const { data, loading, error, reload, setData } = useAsync(openingsService.list, [])
  const openings = data || []
  const [t, setT] = useState('')
  const act = useAction()
  const add = async e => { e.preventDefault(); if (!t.trim()) return; if (await act.run(() => openingsService.create(t.trim()))) { setT(''); reload() } }
  const toggle = async o => { if (await act.run(() => openingsService.setActive(o.id, !o.active))) setData(l => l.map(x => x.id === o.id ? { ...x, active: !x.active } : x)) }
  const remove = async id => { if (await act.run(() => openingsService.remove(id))) setData(l => l.filter(x => x.id !== id)) }
  return (
    <>
      <h1 className="ah">Job openings</h1>
      <form className="panel add" onSubmit={add}><input placeholder="New position, e.g. Welder" value={t} onChange={e => setT(e.target.value)} /><button className="btn" type="submit" disabled={act.busy}><Plus size={16} />Add</button></form>
      {act.error && <p className="err" role="alert">{act.error}</p>}
      <AsyncState loading={loading && !data} error={error} onRetry={reload}>
      <div className="panel mt"><ul className="list">{openings.map(o => (
        <li key={o.id}><div><b>{o.title}</b></div>
          <div className="acts"><label className="sw"><input type="checkbox" checked={o.active} onChange={() => toggle(o)} />{o.active ? 'Showing' : 'Hidden'}</label>
            <button className="ib dng" onClick={() => remove(o.id)} aria-label="Delete"><Trash2 size={16} /></button></div></li>))}</ul></div>
      </AsyncState>
    </>
  )
}

export function SettingsAdmin() {
  const { contact, ready, loading, error, reload, setContact } = useContact()
  const [c, setC] = useState(contact)
  useEffect(() => { setC(contact) }, [contact]) // contact may finish loading after this page opens
  const [pw, setPw] = useState({ old: '', n: '' })
  const [msg, setMsg] = useState('')
  const contactAct = useAction()
  const pwAct = useAction()
  const saveC = async e => {
    e.preventDefault(); setMsg('')
    let saved
    if (await contactAct.run(async () => { saved = await contactService.save(c) })) { setContact(saved); setMsg('Contact details saved.') }
  }
  const savePw = async e => {
    e.preventDefault(); setMsg('')
    if (pw.n.length < 6) return setMsg('New password must be at least 6 characters.')
    let wrongOld = false
    const ok = await pwAct.run(async () => {
      try { await authService.changePassword({ oldPassword: pw.old, newPassword: pw.n }) }
      catch (err) { if (err.status === 401 || err.status === 403 || err.data?.old_password) wrongOld = true; else throw err }
    })
    if (!ok) return
    if (wrongOld) return setMsg('Current password is wrong.')
    setPw({ old: '', n: '' }); setMsg('Password changed.')
  }
  return (
    <>
      <h1 className="ah">Settings</h1>
      {msg && <p className="ok">{msg}</p>}
      {(contactAct.error || pwAct.error) && <p className="err" role="alert">{contactAct.error || pwAct.error}</p>}
      <AsyncState loading={loading && !ready} error={!ready && error} onRetry={reload}>
      <form className="panel fl" onSubmit={saveC}><h3>Contact details</h3>
        {c.map((x, i) => <label key={x.label}>{x.label}<input value={x.value} onChange={e => setC(c.map((y, j) => j === i ? { ...y, value: e.target.value } : y))} /></label>)}
        <button className="btn" type="submit" disabled={contactAct.busy}><Save size={16} />{contactAct.busy ? 'Saving…' : 'Save'}</button></form>
      </AsyncState>
      <form className="panel fl mt" onSubmit={savePw}><h3>Change password</h3>
        <label>Current password<input type="password" value={pw.old} onChange={e => setPw({ ...pw, old: e.target.value })} /></label>
        <label>New password<input type="password" value={pw.n} onChange={e => setPw({ ...pw, n: e.target.value })} /></label>
        <button className="btn" type="submit" disabled={pwAct.busy}>{pwAct.busy ? 'Changing…' : 'Change password'}</button></form>
    </>
  )
}
