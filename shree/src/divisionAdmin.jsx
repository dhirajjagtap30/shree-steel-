import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowRight, ArrowUp, ArrowDown, Boxes, ExternalLink, Factory, Plus, RotateCcw, Save, Trash2, Warehouse, X } from 'lucide-react'
import { contentService } from './api/services'
import { useAction } from './hooks/useAction'
import { useContent } from './context/ContentContext'
import { scopeContent } from './context/ScopedContent'
import { DIVISIONS, defaultDivCards } from './data'
import AsyncState from './components/AsyncState'
import { T, L, P, Check, Gallery, Journey, shrink, clean, clone } from './adminPages'

/* Admin > Divisions: three cards (PEB / Precast / Industrial). Click one to control that division's whole website. */
const ICON = { peb: Warehouse, precast: Boxes, industrial: Factory }
const SLUGS = ['peb', 'precast', 'industrial']

export function DivisionCards() {
  const { content } = useContent()
  return (
    <div className="dvg">
      {SLUGS.map(slug => {
        const card = (content.gateway?.cards || []).find(c => c.target === slug)
        const img = content.divisions?.[slug]?.home?.heroImage || card?.image || ''
        const I = ICON[slug]
        const sv = content.services.items[slug]
        return (
          <div className="dvc" key={slug}>
            {img && <span className="dvi" style={{ backgroundImage: `url(${img})` }} />}
            <div className="dvt"><span className="qi"><I size={22} /></span>
              <a className="dvv" href={'#/?division=' + slug} target="_blank" rel="noreferrer"><ExternalLink size={14} />View</a></div>
            <Link to={'/admin/division/' + slug} className="dvb" style={{ color: 'inherit' }}>
              <h3>{card?.title || sv?.title}</h3><p>{card?.text || sv?.blurb}</p>
              <span className="dvgo">Control this website <ArrowRight size={15} /></span>
            </Link>
          </div>)
      })}
    </div>
  )
}

export function DivisionsAdmin() {
  return (
    <>
      <h1 className="ah">Divisions</h1>
      <p className="note">Click a card to control that division's whole website — text, photos, pages and menu. Each division is edited separately.</p>
      <DivisionCards />
    </>
  )
}

// ---------- fields ----------
const Photo = ({ label, hint, value, onChange, max = 1600 }) => (
  <div className="pairs"><b>{label}</b>
    {hint && <span className="mut small">{hint}</span>}
    <input type="file" accept="image/*" onChange={async e => { const f = e.target.files[0]; e.target.value = ''; if (!f) return; try { onChange(await shrink(f, max, 0.82)) } catch { alert('Could not read this image. Try a JPG, PNG or WEBP.') } }} />
    {value ? <><img src={value} alt="" className="prev" style={{ maxHeight: 180 }} /><button type="button" className="btn o sm" onClick={() => onChange('')}><X size={14} />Remove photo</button></> : <span className="mut small">No photo set.</span>}
  </div>
)

const Section = ({ title, hint, open, children }) => (
  <details className="dsx" open={open}><summary><span>{title}</span>{hint && <small>{hint}</small>}</summary><div className="dsb">{children}</div></details>
)

// Cards under the hero: title, text, photo. Add / delete / reorder.
const CardList = ({ value, onChange }) => {
  const set = (i, patch) => onChange(value.map((c, j) => (j === i ? { ...c, ...patch } : c)))
  const move = (i, k) => { const n = [...value], j = i + k; if (j < 0 || j >= n.length) return; [n[i], n[j]] = [n[j], n[i]]; onChange(n) }
  return (
    <div className="pairs">
      {value.map((c, i) => (
        <div className="sub-panel" key={i}>
          <div className="arow" style={{ marginBottom: 0 }}><h4>Card {i + 1}</h4>
            <div className="acts">
              <button type="button" className="ib" aria-label="Move earlier" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp size={16} /></button>
              <button type="button" className="ib" aria-label="Move later" disabled={i === value.length - 1} onClick={() => move(i, 1)}><ArrowDown size={16} /></button>
              <button type="button" className="ib dng" aria-label="Delete card" onClick={() => onChange(value.filter((_, j) => j !== i))}><Trash2 size={16} /></button>
            </div></div>
          <T label="Title" value={c.title} onChange={v => set(i, { title: v })} />
          <T label="Text" area value={c.text} onChange={v => set(i, { text: v })} />
          <Photo label="Card photo (top of the card)" max={1000} value={c.image} onChange={v => set(i, { image: v })} />
        </div>))}
      <button type="button" className="btn o sm" onClick={() => onChange([...value, { title: 'New card', text: '', image: '' }])}><Plus size={14} />Add card</button>
    </div>
  )
}

const Groups = ({ value, onChange }) => (
  <div className="pairs"><b>Content groups (shown as chips on the service page)</b>
    {value.map((g, gi) => (
      <div className="grp" key={gi}>
        <div className="pr1"><input placeholder="Group title" value={g.title} onChange={e => onChange(value.map((x, j) => (j === gi ? { ...x, title: e.target.value } : x)))} />
          <button type="button" className="ib dng" aria-label="Remove group" onClick={() => onChange(value.filter((_, j) => j !== gi))}><Trash2 size={16} /></button></div>
        <L label="" value={g.items} onChange={v => onChange(value.map((x, j) => (j === gi ? { ...x, items: v } : x)))} />
      </div>))}
    <button type="button" className="btn o sm" onClick={() => onChange([...value, { title: 'New group', items: [''] }])}><Plus size={14} />Add group</button>
  </div>
)

// Everything the admin can control for a division, taken from what the website shows right now.
const build = (content, slug) => {
  const e = scopeContent(content, slug), sv = e.services.items[slug], h = e.home, a = e.about, m = e.manufacturing, q = e.quality
  return clone({
    home: { heroImage: h.heroImage || '', heroVideo: h.heroVideo || '', pill: h.pill, titleA: h.titleA, titleB: h.titleB, tag: h.tag, intro: h.intro,
      cards: h.cards?.length ? h.cards : defaultDivCards(sv).map(c => ({ ...c, image: '' })),
      stats: h.stats, marquee: h.marquee, aboutKicker: h.aboutKicker, aboutHeading: h.aboutHeading, aboutText: h.aboutText,
      processKicker: h.processKicker, processHeading: h.processHeading, ctaTitle: h.ctaTitle, ctaText: h.ctaText },
    banner: e.banner || '',
    site: { tagline: e.site.tagline, footerText: e.site.footerText },
    service: { title: sv.title, blurb: sv.blurb, image: sv.image || '', flowTitle: sv.flowTitle, flow: sv.flow, groups: sv.groups, customTitle: sv.customTitle, customText: sv.customText, custom: !!sv.custom },
    about: { heroBadge: a.heroBadge, heading: a.heading, intro: a.intro, vision: a.vision, mission: a.mission, approachTitle: a.approachTitle, approach: a.approach, strengthsTitle: a.strengthsTitle, strengths: a.strengths, whyKicker: a.whyKicker, whyHeading: a.whyHeading, why: a.why,
      journeyKicker: a.journeyKicker, journeyHeading: a.journeyHeading, journeyHint: a.journeyHint, journeyEnd: a.journeyEnd, journey: a.journey || [] },
    projects: { heading: e.projects.heading, intro: e.projects.intro },
    manufacturing: { show: !!e.showMfg, heading: m.heading, intro: m.intro, items: m.items, galleryKicker: m.galleryKicker, galleryHeading: m.galleryHeading, gallery: m.gallery || [] },
    quality: { heading: q.heading, intro: q.intro, qualityTitle: q.qualityTitle, quality: q.quality, safetyTitle: q.safetyTitle, safety: q.safety },
  })
}

export function DivisionEditor() {
  const { slug } = useParams()
  const { ready } = useContent()
  if (!DIVISIONS[slug]) return <Navigate to="/admin/divisions" replace />
  return <Editor key={slug + ':' + ready} slug={slug} />
}

function Editor({ slug }) {
  const { content, stored, ready, loading, error, reload, setStored } = useContent()
  const info = DIVISIONS[slug]
  const [d, setD] = useState(() => build(content, slug))
  const [gw, setGw] = useState(() => clone((content.gateway?.cards || []).find(c => c.target === slug) || null))
  const [msg, setMsg] = useState('')
  const act = useAction()
  const sec = (s, k, v) => { setMsg(''); setD(x => ({ ...x, [s]: { ...x[s], [k]: v } })) }
  const home = (k, v) => sec('home', k, v)
  const persist = async (next, okMsg) => {
    let saved
    if (await act.run(async () => { saved = await contentService.save(next) })) { setStored(saved); setMsg(okMsg); return saved }
  }
  const save = async e => {
    e.preventDefault()
    const cleaned = clean(d)
    const next = { ...stored, divisions: { ...(stored.divisions || {}), [slug]: cleaned } }
    if (gw) {
      const cards = [...(content.gateway?.cards || [])]
      const i = cards.findIndex(c => c.target === slug)
      i >= 0 ? (cards[i] = gw) : cards.push(gw)
      next.gateway = { ...(stored.gateway || {}), cards }
    }
    if (await persist(next, 'Saved. This division\'s website is updated.')) setD(cleaned)
  }
  const reset = async () => {
    if (!confirm('Restore the original content of this division? Your changes on it will be lost.')) return
    const { [slug]: _drop, ...rest } = stored.divisions || {}
    const next = { ...stored, divisions: rest }
    if (await persist(next, 'Original content restored.')) setD(build({ ...content, divisions: rest }, slug))
  }
  return (
    <>
      <div className="arow"><h1 className="ah">{info.full}</h1>
        <div className="acts"><Link className="btn o sm" to="/admin/divisions">← All divisions</Link>
          <a className="btn o sm" href={'#/?division=' + slug} target="_blank" rel="noreferrer"><ExternalLink size={14} />View website</a></div></div>
      <p className="note">Everything below belongs only to the <b>{info.name}</b> website. Open a section, change it, then press "Save changes" at the bottom.</p>
      {msg && <p className="ok">{msg}</p>}
      {act.error && <p className="err" role="alert">{act.error}</p>}
      <AsyncState loading={loading && !ready} error={!ready && error} onRetry={reload}>
        <form className="fl wide" onSubmit={save} style={{ display: 'grid', gap: 14 }}>

          <Section title="1 · Card on the first screen" hint="The card visitors click first" open>
            {gw ? <>
              <T label="Title" value={gw.title} onChange={v => setGw({ ...gw, title: v })} />
              <T label="Description" area value={gw.text} onChange={v => setGw({ ...gw, text: v })} />
              <T label="Button text" value={gw.button} onChange={v => setGw({ ...gw, button: v })} />
              <Photo label="Card background photo" max={1000} value={gw.image} onChange={v => setGw({ ...gw, image: v })} />
              <Check label="Show the animated line drawing" value={gw.showArt !== false} onChange={v => setGw({ ...gw, showArt: v })} />
            </> : <>
              <p className="mut small">There is no first-screen card for this division (it was deleted).</p>
              <button type="button" className="btn o sm" onClick={() => setGw({ title: info.page, text: d.service.blurb, image: '', target: slug, button: 'Open website', showArt: true })}><Plus size={14} />Add the card again</button>
            </>}
          </Section>

          <Section title="2 · Home page top (hero)" hint="Big photo, heading and intro">
            <Photo label="Hero photo" hint="Setting a photo replaces the hero background video." value={d.home.heroImage}
              onChange={v => { setMsg(''); setD(x => ({ ...x, home: { ...x.home, heroImage: v, heroVideo: v ? '' : x.home.heroVideo } })) }} />
            <T label="Hero background video (optional)" hint="An .mp4 link or /videos/hero.mp4. Leave empty to use the photo." value={d.home.heroVideo} onChange={v => home('heroVideo', v)} />
            <T label="Small badge above heading" value={d.home.pill} onChange={v => home('pill', v)} />
            <T label="Heading - first word" value={d.home.titleA} onChange={v => home('titleA', v)} />
            <T label="Heading - highlighted word" value={d.home.titleB} onChange={v => home('titleB', v)} />
            <T label="Tagline" value={d.home.tag} onChange={v => home('tag', v)} />
            <T label="Intro paragraph" area value={d.home.intro} onChange={v => home('intro', v)} />
          </Section>

          <Section title="3 · Cards under the hero" hint="Add, delete and give each a photo">
            <CardList value={d.home.cards} onChange={v => home('cards', v)} />
          </Section>

          <Section title="4 · Highlights & scrolling strip">
            <P label="Four highlight boxes" a="Big word" b="Small text" value={d.home.stats} onChange={v => home('stats', v)} />
            <L label="Scrolling strip" value={d.home.marquee} onChange={v => home('marquee', v)} />
          </Section>

          <Section title="5 · Home page - about block & call to action">
            <T label="About block - small label" value={d.home.aboutKicker} onChange={v => home('aboutKicker', v)} />
            <T label="About block - heading" value={d.home.aboutHeading} onChange={v => home('aboutHeading', v)} />
            <T label="About block - text" area value={d.home.aboutText} onChange={v => home('aboutText', v)} />
            <T label={'"How we work" - small label'} value={d.home.processKicker} onChange={v => home('processKicker', v)} />
            <T label={'"How we work" - heading'} value={d.home.processHeading} onChange={v => home('processHeading', v)} />
            <T label="Bottom call-to-action title" value={d.home.ctaTitle} onChange={v => home('ctaTitle', v)} />
            <T label="Bottom call-to-action text" value={d.home.ctaText} onChange={v => home('ctaText', v)} />
          </Section>

          <Section title="6 · Page header photo, logo line & footer" hint="Photo behind every inner page title">
            <Photo label="Inner pages header photo" hint="Shown behind the title on About, Services, Projects, Contact … Leave empty for the default photo." value={d.banner} onChange={v => { setMsg(''); setD(x => ({ ...x, banner: v })) }} />
            <T label="Logo line (under company name)" value={d.site.tagline} onChange={v => sec('site', 'tagline', v)} />
            <T label="Footer description" area value={d.site.footerText} onChange={v => sec('site', 'footerText', v)} />
          </Section>

          <Section title={'7 · ' + info.page + ' page'} hint="The division's own service page">
            <T label="Title" value={d.service.title} onChange={v => sec('service', 'title', v)} />
            <T label="Short description" area value={d.service.blurb} onChange={v => sec('service', 'blurb', v)} />
            <Photo label="Large photo at the top of the page" value={d.service.image} onChange={v => sec('service', 'image', v)} />
            <T label="Process heading" value={d.service.flowTitle} onChange={v => sec('service', 'flowTitle', v)} />
            <L label="Process steps" hint="One step per line. Leave empty to hide." value={d.service.flow} onChange={v => sec('service', 'flow', v)} />
            <Groups value={d.service.groups} onChange={v => sec('service', 'groups', v)} />
            {d.service.custom && <><T label="Call-to-action title" value={d.service.customTitle} onChange={v => sec('service', 'customTitle', v)} />
              <T label="Call-to-action text" area value={d.service.customText} onChange={v => sec('service', 'customText', v)} /></>}
          </Section>

          <Section title="8 · About page">
            <T label="Small badge above heading" value={d.about.heroBadge} onChange={v => sec('about', 'heroBadge', v)} />
            <T label="Page heading" value={d.about.heading} onChange={v => sec('about', 'heading', v)} />
            <T label="Intro" area value={d.about.intro} onChange={v => sec('about', 'intro', v)} />
            <T label="Vision" area value={d.about.vision} onChange={v => sec('about', 'vision', v)} />
            <T label="Mission" area value={d.about.mission} onChange={v => sec('about', 'mission', v)} />
            <T label="Road map - small label" value={d.about.journeyKicker} onChange={v => sec('about', 'journeyKicker', v)} />
            <T label="Road map - heading" value={d.about.journeyHeading} onChange={v => sec('about', 'journeyHeading', v)} />
            <T label="Road map - hint line" value={d.about.journeyHint} onChange={v => sec('about', 'journeyHint', v)} />
            <T label="Road map - last label (bottom of road)" value={d.about.journeyEnd} onChange={v => sec('about', 'journeyEnd', v)} />
            <Journey label="Road map milestones (add / remove)" value={d.about.journey} onChange={v => sec('about', 'journey', v)} />
            <T label="Third tab - title" value={d.about.approachTitle} onChange={v => sec('about', 'approachTitle', v)} />
            <T label="Third tab - text" area value={d.about.approach} onChange={v => sec('about', 'approach', v)} />
            <T label="Strengths label" value={d.about.strengthsTitle} onChange={v => sec('about', 'strengthsTitle', v)} />
            <L label="Strengths" value={d.about.strengths} onChange={v => sec('about', 'strengths', v)} />
            <T label={'"Why us" - small label'} value={d.about.whyKicker} onChange={v => sec('about', 'whyKicker', v)} />
            <T label={'"Why us" - heading'} value={d.about.whyHeading} onChange={v => sec('about', 'whyHeading', v)} />
            <P label={'"Why us" cards'} a="Card title" b="Card text" value={d.about.why} onChange={v => sec('about', 'why', v)} />
          </Section>

          <Section title="9 · Projects page" hint="Add the projects themselves under Projects list">
            <T label="Page heading" value={d.projects.heading} onChange={v => sec('projects', 'heading', v)} />
            <T label="Intro" area value={d.projects.intro} onChange={v => sec('projects', 'intro', v)} />
            <p className="note"><Link to="/admin/projects" className="ul">Add / edit / delete projects and photos →</Link> (choose the category "{info.cat}" for this division)</p>
          </Section>

          <Section title="10 · Manufacturing page" hint="Menu item + factory photos">
            <Check label="Show the Manufacturing page in this division's menu" value={d.manufacturing.show} onChange={v => sec('manufacturing', 'show', v)} />
            <T label="Page heading" value={d.manufacturing.heading} onChange={v => sec('manufacturing', 'heading', v)} />
            <T label="Intro" area value={d.manufacturing.intro} onChange={v => sec('manufacturing', 'intro', v)} />
            <L label="Manufacturing capabilities" value={d.manufacturing.items} onChange={v => sec('manufacturing', 'items', v)} />
            <T label="Photo section - small heading" value={d.manufacturing.galleryKicker} onChange={v => sec('manufacturing', 'galleryKicker', v)} />
            <T label="Photo section - heading" value={d.manufacturing.galleryHeading} onChange={v => sec('manufacturing', 'galleryHeading', v)} />
            <Gallery label="Photos" value={d.manufacturing.gallery} onChange={v => sec('manufacturing', 'gallery', v)} />
          </Section>

          <Section title="11 · Quality & Safety page">
            <T label="Page heading" value={d.quality.heading} onChange={v => sec('quality', 'heading', v)} />
            <T label="Intro (optional)" area value={d.quality.intro} onChange={v => sec('quality', 'intro', v)} />
            <T label="Quality column title" value={d.quality.qualityTitle} onChange={v => sec('quality', 'qualityTitle', v)} />
            <L label="Quality points" value={d.quality.quality} onChange={v => sec('quality', 'quality', v)} />
            <T label="Safety column title" value={d.quality.safetyTitle} onChange={v => sec('quality', 'safetyTitle', v)} />
            <L label="Safety points" value={d.quality.safety} onChange={v => sec('quality', 'safety', v)} />
          </Section>

          <div className="acts" style={{ justifyContent: 'flex-start' }}>
            <button className="btn" type="submit" disabled={act.busy}><Save size={16} />{act.busy ? 'Saving…' : 'Save changes'}</button>
            <button className="btn o" type="button" disabled={act.busy} onClick={reset}><RotateCcw size={16} />Restore original</button>
          </div>
        </form>
      </AsyncState>
    </>
  )
}
