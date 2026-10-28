import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Plus, Trash2, Save, RotateCcw, ExternalLink, X, ArrowUp, ArrowDown } from 'lucide-react'
import { contentService } from './api/services'
import { useAction } from './hooks/useAction'
import { useContent } from './context/ContentContext'
import { DEFAULT_CONTENT } from './content/defaults'
import AsyncState from './components/AsyncState'

// ---------- small field components ----------
const T = ({ label, hint, value, onChange, area }) => (
  <label>{label}{area ? <textarea rows="3" value={value ?? ''} onChange={e => onChange(e.target.value)} /> : <input value={value ?? ''} onChange={e => onChange(e.target.value)} />}
    {hint && <span className="mut small">{hint}</span>}</label>
)
// One item per line.
const L = ({ label, hint = 'One item per line.', value, onChange }) => (
  <label>{label}<textarea rows={Math.min(Math.max(value.length + 1, 3), 12)} value={value.join('\n')} onChange={e => onChange(e.target.value.split('\n'))} />
    <span className="mut small">{hint}</span></label>
)
// Rows of { title, text }.
const P = ({ label, a = 'Title', b = 'Text', value, onChange }) => {
  const set = (i, k, v) => onChange(value.map((r, j) => (j === i ? { ...r, [k]: v } : r)))
  return (
    <div className="pairs"><b>{label}</b>
      {value.map((r, i) => (
        <div className="pr" key={i}>
          <input placeholder={a} value={r.title} onChange={e => set(i, 'title', e.target.value)} />
          <input placeholder={b} value={r.text} onChange={e => set(i, 'text', e.target.value)} />
          <button type="button" className="ib dng" aria-label="Remove" onClick={() => onChange(value.filter((_, j) => j !== i))}><Trash2 size={16} /></button>
        </div>))}
      <button type="button" className="btn o sm" onClick={() => onChange([...value, { title: '', text: '' }])}><Plus size={14} />Add row</button>
    </div>
  )
}
const Check = ({ label, hint, value, onChange }) => (
  <label className="sw" style={{ alignItems: 'flex-start' }}><input type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)} />
    <span>{label}{hint && <span className="mut small" style={{ display: 'block', fontWeight: 400 }}>{hint}</span>}</span></label>
)
const Img = ({ label, value, onChange }) => {
  const pick = f => {
    if (!f) return
    if (f.size > 600000) return alert('Image too large. Use under 600 KB.')
    const r = new FileReader(); r.onload = () => onChange(r.result); r.readAsDataURL(f)
  }
  return (
    <div className="pairs"><b>{label}</b>
      <input type="file" accept="image/*" onChange={e => pick(e.target.files[0])} />
      {value && <><img src={value} alt="" className="prev" /><button type="button" className="btn o sm" onClick={() => onChange('')}><X size={14} />Use original image</button></>}
    </div>
  )
}

// Shrinks a chosen photo to max 700px JPEG so many photos fit in browser storage.
const shrink = (file, max = 700, q = 0.82) => new Promise((res, rej) => {
  const r = new FileReader()
  r.onerror = rej
  r.onload = () => {
    const im = new Image()
    im.onerror = rej
    im.onload = () => {
      const k = Math.min(1, max / Math.max(im.width, im.height)), c = document.createElement('canvas')
      c.width = Math.round(im.width * k); c.height = Math.round(im.height * k)
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height)
      res(c.toDataURL('image/jpeg', q))
    }
    im.src = r.result
  }
  r.readAsDataURL(file)
})
// People on the About timeline: name, designation, photo, details (one per line). Order = order on the page.
const People = ({ label, value, onChange }) => {
  const set = (i, patch) => onChange(value.map((p, j) => (j === i ? { ...p, ...patch } : p)))
  const move = (i, d) => { const n = [...value], j = i + d; if (j < 0 || j >= n.length) return; [n[i], n[j]] = [n[j], n[i]]; onChange(n) }
  const pick = async (i, f) => { if (!f) return; try { set(i, { photo: await shrink(f) }) } catch { alert('Could not read this image. Try a JPG or PNG.') } }
  return (
    <div className="pairs"><b>{label}</b>
      <span className="mut small">Each person appears on the curved timeline (first = top). Visitors click the photo to see the details.</span>
      {value.map((p, i) => (
        <div className="sub-panel" key={i}>
          <div className="arow" style={{ marginBottom: 4 }}><h4>Person {i + 1}</h4>
            <div className="acts">
              <button type="button" className="ib" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp size={16} /></button>
              <button type="button" className="ib" aria-label="Move down" disabled={i === value.length - 1} onClick={() => move(i, 1)}><ArrowDown size={16} /></button>
              <button type="button" className="ib dng" aria-label="Remove person" onClick={() => onChange(value.filter((_, j) => j !== i))}><Trash2 size={16} /></button>
            </div></div>
          <T label="Name" value={p.name} onChange={v => set(i, { name: v })} />
          <T label="Designation" hint="e.g. Founder & Managing Director" value={p.role} onChange={v => set(i, { role: v })} />
          <div className="pairs"><b>Photo</b>
            <input type="file" accept="image/*" onChange={e => pick(i, e.target.files[0])} />
            {p.photo && <><img src={p.photo} alt="" className="prev" style={{ maxWidth: 140, aspectRatio: '1', borderRadius: '50%' }} /><button type="button" className="btn o sm" onClick={() => set(i, { photo: '' })}><X size={14} />Remove photo</button></>}
          </div>
          <L label="Details (shown when the photo is clicked)" hint="One point per line." value={p.details || []} onChange={v => set(i, { details: v })} />
        </div>))}
      <button type="button" className="btn o sm" onClick={() => onChange([...value, { name: '', role: '', photo: '', details: [] }])}><Plus size={14} />Add person</button>
    </div>
  )
}

// Road map on the About page: year, title, text, optional photo. Order = order on the road (first = top).
const Journey = ({ label, value, onChange }) => {
  const set = (i, patch) => onChange(value.map((m, j) => (j === i ? { ...m, ...patch } : m)))
  const move = (i, d) => { const n = [...value], j = i + d; if (j < 0 || j >= n.length) return; [n[i], n[j]] = [n[j], n[i]]; onChange(n) }
  const pick = async (i, f) => { if (!f) return; try { set(i, { photo: await shrink(f, 900) }) } catch { alert('Could not read this image. Try a JPG or PNG.') } }
  return (
    <div className="pairs"><b>{label}</b>
      <span className="mut small">Each milestone appears on the winding road (first = top, then left / right alternately). Add or delete as many as you like, then press "Save changes" at the bottom.</span>
      {value.map((m, i) => (
        <div className="sub-panel" key={i}>
          <div className="arow" style={{ marginBottom: 4 }}><h4>Milestone {i + 1}{m.year ? ' · ' + m.year : ''}</h4>
            <div className="acts">
              <button type="button" className="ib" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp size={16} /></button>
              <button type="button" className="ib" aria-label="Move down" disabled={i === value.length - 1} onClick={() => move(i, 1)}><ArrowDown size={16} /></button>
              <button type="button" className="ib dng" aria-label="Remove milestone" onClick={() => { if (confirm('Delete this milestone?')) onChange(value.filter((_, j) => j !== i)) }}><Trash2 size={16} /></button>
            </div></div>
          <T label="Year" hint="e.g. 2017 (or 2017 - 2018)" value={m.year} onChange={v => set(i, { year: v })} />
          <T label="Title" hint="e.g. Factory started" value={m.title} onChange={v => set(i, { title: v })} />
          <T label="Details" area value={m.text} onChange={v => set(i, { text: v })} />
          <div className="pairs"><b>Photo (optional)</b>
            <input type="file" accept="image/*" onChange={e => { pick(i, e.target.files[0]); e.target.value = '' }} />
            {m.photo && <><img src={m.photo} alt="" className="prev" style={{ maxWidth: 220 }} /><button type="button" className="btn o sm" onClick={() => set(i, { photo: '' })}><X size={14} />Remove photo</button></>}
          </div>
        </div>))}
      {value.length === 0 && <p className="mut small">No milestones. The road map is hidden on the website until you add one.</p>}
      <button type="button" className="btn o sm" onClick={() => onChange([...value, { year: '', title: '', text: '', photo: '' }])}><Plus size={14} />Add milestone</button>
    </div>
  )
}

// Facility photos: add (several at once), replace, rename, make wide, reorder, delete.
const Gallery = ({ label, value, onChange }) => {
  const [busy, setBusy] = useState(false)
  const set = (i, patch) => onChange(value.map((p, j) => (j === i ? { ...p, ...patch } : p)))
  const move = (i, d) => { const n = [...value], j = i + d; if (j < 0 || j >= n.length) return; [n[i], n[j]] = [n[j], n[i]]; onChange(n) }
  const read = f => shrink(f, 1400, 0.8)
  const replace = async (i, f) => { if (!f) return; try { set(i, { src: await read(f) }) } catch { alert('Could not read this image. Try a JPG, PNG or WEBP.') } }
  const addMany = async files => {
    const list = [...(files || [])]; if (!list.length) return
    setBusy(true)
    try {
      const added = []
      for (const f of list) added.push({ src: await read(f), caption: f.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim(), wide: false })
      onChange([...value, ...added])
    } catch { alert('One of the images could not be read. Try JPG, PNG or WEBP.') }
    setBusy(false)
  }
  return (
    <div className="pairs"><b>{label}</b>
      <span className="mut small">These photos appear on the Manufacturing page in this order (first = top left). Click a photo's title to rename it. Remember to press "Save changes" at the bottom.</span>
      <div className="gal-admin">
        {value.map((p, i) => (
          <div className="sub-panel" key={i}>
            <div className="arow" style={{ marginBottom: 0 }}><h4>Photo {i + 1}</h4>
              <div className="acts">
                <button type="button" className="ib" aria-label="Move earlier" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp size={16} /></button>
                <button type="button" className="ib" aria-label="Move later" disabled={i === value.length - 1} onClick={() => move(i, 1)}><ArrowDown size={16} /></button>
                <button type="button" className="ib dng" aria-label="Delete photo" onClick={() => { if (confirm('Delete this photo?')) onChange(value.filter((_, j) => j !== i)) }}><Trash2 size={16} /></button>
              </div></div>
            {p.src ? <img src={p.src} alt="" className="prev" style={{ maxHeight: 180 }} /> : <p className="mut small">No image yet. Choose one below.</p>}
            <label>Change photo<input type="file" accept="image/*" onChange={e => { replace(i, e.target.files[0]); e.target.value = '' }} /></label>
            <T label="Title (shown under the photo)" value={p.caption} onChange={v => set(i, { caption: v })} />
            <Check label="Show full width" hint="Good for wide / banner images." value={p.wide} onChange={v => set(i, { wide: v })} />
          </div>))}
      </div>
      {value.length === 0 && <p className="mut small">No photos yet. The photo section is hidden on the website until you add one.</p>}
      <label className="btn o sm" style={{ cursor: 'pointer', width: 'fit-content' }}><Plus size={14} />{busy ? 'Adding…' : 'Add photos'}
        <input type="file" accept="image/*" multiple hidden disabled={busy} onChange={e => { addMany(e.target.files); e.target.value = '' }} /></label>
    </div>
  )
}

// ---------- Services (4 services, each with process steps and groups of points) ----------
const SERVICE_NAMES = { peb: 'PEB Structures', precast: 'Precast Concrete', industrial: 'Industrial Construction', engineering: 'Engineering & Design' }
function ServicesFields({ d, set }) {
  const setItem = (slug, patch) => set('items', { ...d.items, [slug]: { ...d.items[slug], ...patch } })
  return (
    <>
      <T label="Page heading" value={d.heading} onChange={v => set('heading', v)} />
      <T label="Page intro" area value={d.intro} onChange={v => set('intro', v)} />
      {Object.entries(d.items).map(([slug, s]) => (
        <div className="sub-panel" key={slug}>
          <h4>{SERVICE_NAMES[slug] || slug}</h4>
          <T label="Title" value={s.title} onChange={v => setItem(slug, { title: v })} />
          <T label="Short title on Home card" hint="Leave empty to use the title." value={s.cardTitle} onChange={v => setItem(slug, { cardTitle: v })} />
          <T label="Short description" area value={s.blurb} onChange={v => setItem(slug, { blurb: v })} />
          <T label="Process heading" value={s.flowTitle} onChange={v => setItem(slug, { flowTitle: v })} />
          <L label="Process steps" hint="One step per line. Leave empty to hide. (PEB steps are also shown on the Home page.)" value={s.flow} onChange={v => setItem(slug, { flow: v })} />
          {s.groups.map((g, gi) => (
            <div className="grp" key={gi}>
              <div className="pr1"><input placeholder="Group title" value={g.title} onChange={e => setItem(slug, { groups: s.groups.map((x, j) => (j === gi ? { ...x, title: e.target.value } : x)) })} />
                <button type="button" className="ib dng" aria-label="Remove group" onClick={() => setItem(slug, { groups: s.groups.filter((_, j) => j !== gi) })}><Trash2 size={16} /></button></div>
              <L label="" value={g.items} onChange={v => setItem(slug, { groups: s.groups.map((x, j) => (j === gi ? { ...x, items: v } : x)) })} />
            </div>))}
          <button type="button" className="btn o sm" onClick={() => setItem(slug, { groups: [...s.groups, { title: 'New group', items: [''] }] })}><Plus size={14} />Add group</button>
          {s.custom && <><T label="Call-to-action title" value={s.customTitle} onChange={v => setItem(slug, { customTitle: v })} />
            <T label="Call-to-action text" area value={s.customText} onChange={v => setItem(slug, { customText: v })} /></>}
        </div>))}
    </>
  )
}

// ---------- First screen: heading + division cards (add / delete / reorder, change text and background photo) ----------
const Sel = ({ label, hint, value, onChange, options }) => (
  <label>{label}<select value={value ?? ''} onChange={e => onChange(e.target.value)}>{options.map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select>
    {hint && <span className="mut small">{hint}</span>}</label>
)
const OPENS = [['peb', 'PEB division website'], ['precast', 'Precast division website'], ['industrial', 'Industrial division website'], ['all', 'Full website (all divisions)']]
function GatewayFields({ d, set }) {
  const cards = d.cards || []
  const setCards = v => set('cards', v)
  const upd = (i, patch) => setCards(cards.map((c, j) => (j === i ? { ...c, ...patch } : c)))
  const move = (i, k) => { const n = [...cards], j = i + k; if (j < 0 || j >= n.length) return; [n[i], n[j]] = [n[j], n[i]]; setCards(n) }
  const pick = async (i, f) => { if (!f) return; try { upd(i, { image: await shrink(f, 1000, 0.8) }) } catch { alert('Could not read this image. Try a JPG, PNG or WEBP.') } }
  return (
    <>
      <T label="Small line above heading" value={d.kicker} onChange={v => set('kicker', v)} />
      <T label="Heading - first part" value={d.heading} onChange={v => set('heading', v)} />
      <T label="Heading - highlighted (orange) part" value={d.accent} onChange={v => set('accent', v)} />
      <T label="Line under heading" value={d.subtext} onChange={v => set('subtext', v)} />
      <Check label="Show the bottom button" hint="Lets visitors skip the cards and open the full website." value={d.showSkip !== false} onChange={v => set('showSkip', v)} />
      <T label="Bottom button text" value={d.skipText} onChange={v => set('skipText', v)} />
      <div className="pairs"><b>Cards</b>
        <span className="mut small">Cards appear on the first screen in this order. Remember to press "Save changes" at the bottom.</span>
        {cards.map((c, i) => (
          <div className="sub-panel" key={i}>
            <div className="arow" style={{ marginBottom: 0 }}><h4>Card {i + 1}</h4>
              <div className="acts">
                <button type="button" className="ib" aria-label="Move earlier" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp size={16} /></button>
                <button type="button" className="ib" aria-label="Move later" disabled={i === cards.length - 1} onClick={() => move(i, 1)}><ArrowDown size={16} /></button>
                <button type="button" className="ib dng" aria-label="Delete card" onClick={() => { if (confirm('Delete this card?')) setCards(cards.filter((_, j) => j !== i)) }}><Trash2 size={16} /></button>
              </div></div>
            <T label="Title" value={c.title} onChange={v => upd(i, { title: v })} />
            <T label="Description" area value={c.text} onChange={v => upd(i, { text: v })} />
            <T label="Button text" value={c.button} onChange={v => upd(i, { button: v })} />
            <Sel label="When clicked, open" hint="A division opens a website showing only that division." value={c.target} onChange={v => upd(i, { target: v })} options={OPENS} />
            <div className="pairs"><b>Background photo</b>
              <input type="file" accept="image/*" onChange={e => { pick(i, e.target.files[0]); e.target.value = '' }} />
              {c.image ? <><img src={c.image} alt="" className="prev" style={{ maxHeight: 160 }} /><button type="button" className="btn o sm" onClick={() => upd(i, { image: '' })}><X size={14} />Remove photo</button></> : <span className="mut small">No photo - the card uses the dark purple background.</span>}
            </div>
            <Check label="Show the animated line drawing" hint="Turn off when you use a photo, if you prefer a clean photo." value={c.showArt !== false} onChange={v => upd(i, { showArt: v })} />
          </div>))}
        <button type="button" className="btn o sm" onClick={() => setCards([...cards, { title: 'New card', text: '', image: '', target: 'all', button: 'Open website', showArt: false }])}><Plus size={14} />Add card</button>
      </div>
    </>
  )
}

// ---------- one schema per page: [key, type, label, extra] ----------
const SCHEMA = {
  gateway: { title: 'First screen (division cards)', note: 'The first screen visitors see: the cards for PEB, Precast and Industrial. Change text, add or delete cards, and set a background photo for each card.', custom: GatewayFields },
  home: { title: 'Home page', fields: [
    ['heroVideo', 'text', 'Hero background video (optional)', { hint: 'Paste an .mp4 link, or put a file in the project folder public/videos/ and type /videos/hero.mp4. Leave empty to use the image.' }],
    ['heroImage', 'img', 'Hero (top) image'], ['pill', 'text', 'Small badge above heading'], ['titleA', 'text', 'Heading - first word'], ['titleB', 'text', 'Heading - highlighted word'],
    ['tag', 'text', 'Tagline'], ['intro', 'area', 'Intro paragraph'], ['stats', 'pairs', 'Four highlight boxes', { a: 'Big word', b: 'Small text' }],
    ['marquee', 'list', 'Scrolling strip (services & capabilities)'], ['aboutKicker', 'text', 'About block - small label'], ['aboutHeading', 'text', 'About block - heading'],
    ['aboutText', 'area', 'About block - text'], ['processKicker', 'text', '"How we work" - small label'], ['processHeading', 'text', '"How we work" - heading'],
    ['ctaTitle', 'text', 'Bottom call-to-action title'], ['ctaText', 'text', 'Bottom call-to-action text']] },
  about: { title: 'About page', note: 'Strengths and "Why us" are shown on both the About and Home pages.', fields: [
    ['heroBadge', 'text', 'Small badge above heading'], ['heading', 'text', 'Page heading'], ['intro', 'area', 'Intro'], ['vision', 'area', 'Vision'], ['mission', 'area', 'Mission'],
    ['peopleKicker', 'text', 'People section - small label'], ['peopleHeading', 'text', 'People section - heading'], ['peopleHint', 'text', 'People section - hint line'], ['people', 'people', 'People on the timeline'],
    ['journeyKicker', 'text', 'Road map - small label'], ['journeyHeading', 'text', 'Road map - heading'], ['journeyHint', 'text', 'Road map - hint line'], ['journeyEnd', 'text', 'Road map - last label (bottom of road)'], ['journey', 'journey', 'Road map milestones (add / remove)'],
    ['approachTitle', 'text', 'Third tab - title'], ['approach', 'area', 'Third tab - text'],
    ['strengthsTitle', 'text', 'Strengths label'], ['strengths', 'list', 'Strengths'], ['whyKicker', 'text', '"Why us" - small label'],
    ['whyHeading', 'text', '"Why us" - heading'], ['why', 'pairs', '"Why us" cards', { a: 'Card title', b: 'Card text' }]] },
  services: { title: 'Services', custom: ServicesFields },
  projects: { title: 'Projects page', link: ['/admin/projects', 'Add / edit / delete projects and photos'], fields: [
    ['heading', 'text', 'Page heading'], ['intro', 'area', 'Intro']] },
  manufacturing: { title: 'Manufacturing page', fields: [['heading', 'text', 'Page heading'], ['intro', 'area', 'Intro'], ['items', 'list', 'Manufacturing capabilities'], ['galleryKicker', 'text', 'Photo section - small heading'], ['galleryHeading', 'text', 'Photo section - heading'], ['gallery', 'gallery', 'Facility photos']] },
  quality: { title: 'Quality & Safety page', fields: [
    ['heading', 'text', 'Page heading'], ['intro', 'area', 'Intro (optional)'], ['qualityTitle', 'text', 'Quality column title'], ['quality', 'list', 'Quality points'],
    ['safetyTitle', 'text', 'Safety column title'], ['safety', 'list', 'Safety points']] },
  careers: { title: 'Careers page', link: ['/admin/openings', 'Add / hide / delete job openings'], fields: [
    ['heading', 'text', 'Page heading'], ['intro', 'area', 'Intro (optional)'], ['emptyText', 'text', 'Text when no openings'], ['buttonText', 'text', 'Button text']] },
  contact: { title: 'Contact page', link: ['/admin/settings', 'Edit phone, email, addresses and map link'], fields: [
    ['heading', 'text', 'Page heading'], ['intro', 'area', 'Intro']] },
  site: { title: 'Logo, header & footer', fields: [
    ['brand', 'text', 'Company name (logo)'], ['tagline', 'text', 'Logo tagline'], ['footerText', 'area', 'Footer description'], ['copyright', 'text', 'Copyright line']] },
}
export const PAGE_LINKS = [['gateway', 'First screen (cards)'], ['home', 'Home'], ['about', 'About'], ['services', 'Services'], ['projects', 'Projects'], ['manufacturing', 'Manufacturing'], ['quality', 'Quality & Safety'], ['careers', 'Careers'], ['contact', 'Contact'], ['site', 'Logo & footer']]

const clone = v => JSON.parse(JSON.stringify(v))
// Remove empty lines / empty rows before saving.
const clean = v => {
  if (Array.isArray(v)) {
    if (v.every(x => typeof x === 'string')) return v.map(x => x.trim()).filter(Boolean)
    return v.map(clean).filter(x => !(x && typeof x === 'object' && 'src' in x && 'caption' in x && !x.src)).filter(x => !(x && typeof x === 'object' && 'name' in x && 'photo' in x && !String(x.name).trim() && !x.photo)).filter(x => !(x && typeof x === 'object' && 'year' in x && !String(x.year).trim() && !String(x.title ?? '').trim() && !String(x.text ?? '').trim() && !x.photo))
      .filter(x => !(x && typeof x === 'object' && 'title' in x && !('year' in x) && !String(x.title).trim() && !String(x.text ?? '').trim() && !('items' in x)))
  }
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, clean(x)]))
  return v
}

// The wrapper gives the editor a new identity per page (and once the saved text has loaded),
// so the form always starts from the right page's data and never shows another page's fields.
export function PageEditor() {
  const { key } = useParams()
  const { ready } = useContent()
  if (!SCHEMA[key]) return <Navigate to="/admin/dashboard" replace />
  return <Editor key={key + ':' + ready} pageKey={key} />
}

function Editor({ pageKey: key }) {
  const schema = SCHEMA[key]
  const { content, stored, ready, loading, error, reload, setStored } = useContent()
  const [d, setD] = useState(() => clone(content[key] || {}))
  const [msg, setMsg] = useState('')
  const act = useAction()
  const set = (k, v) => { setMsg(''); setD(x => ({ ...x, [k]: v })) }
  const persist = async (next, okMsg) => {
    let saved
    if (await act.run(async () => { saved = await contentService.save(next) })) { setStored(saved); setMsg(okMsg); return saved }
  }
  const save = async e => {
    e.preventDefault()
    const cleaned = clean(d)
    if (await persist({ ...stored, [key]: cleaned }, 'Saved. The website is updated.')) setD(cleaned)
  }
  const reset = async () => {
    if (!confirm('Restore the original text for this page? Your changes on it will be lost.')) return
    const { [key]: _drop, ...rest } = stored
    if (await persist(rest, 'Original text restored.')) setD(clone(DEFAULT_CONTENT[key]))
  }
  const Custom = schema.custom
  return (
    <>
      <div className="arow"><h1 className="ah">{schema.title}</h1>
        {key !== 'site' && <a className="btn o sm" href={'#/' + (key === 'home' || key === 'gateway' ? '' : key === 'quality' ? 'quality' : key)} target="_blank" rel="noreferrer"><ExternalLink size={14} />View page</a>}</div>
      {schema.note && <p className="note">{schema.note}</p>}
      {schema.link && <p className="note"><Link to={schema.link[0]} className="ul">{schema.link[1]} →</Link></p>}
      {msg && <p className="ok">{msg}</p>}
      {act.error && <p className="err" role="alert">{act.error}</p>}
      <AsyncState loading={loading && !ready} error={!ready && error} onRetry={reload}>
        {d && (
          <form className="panel fl wide" onSubmit={save}>
            {Custom ? <Custom d={d} set={set} /> : schema.fields.map(([k, type, label, x]) => {
              const common = { key: k, label, value: d[k] ?? (type === 'list' || type === 'pairs' || type === 'people' || type === 'journey' || type === 'gallery' ? [] : ''), onChange: v => set(k, v) }
              if (type === 'check') return <Check {...common} hint={x?.hint} />
              if (type === 'area') return <T {...common} area hint={x?.hint} />
              if (type === 'list') return <L {...common} />
              if (type === 'pairs') return <P {...common} {...x} />
              if (type === 'people') return <People {...common} />
              if (type === 'journey') return <Journey {...common} />
              if (type === 'gallery') return <Gallery {...common} />
              if (type === 'img') return <Img {...common} />
              return <T {...common} hint={x?.hint} />
            })}
            <div className="acts" style={{ justifyContent: 'flex-start' }}>
              <button className="btn" type="submit" disabled={act.busy}><Save size={16} />{act.busy ? 'Saving…' : 'Save changes'}</button>
              <button className="btn o" type="button" disabled={act.busy} onClick={reset}><RotateCcw size={16} />Restore original</button>
            </div>
          </form>
        )}
      </AsyncState>
    </>
  )
}

export { T, L, P, Check, Gallery, Journey, shrink, clean, clone }
