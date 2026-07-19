import { useState, useEffect, useRef } from 'react'
import { trip, ui, tags, realityChecks, days, showrooms, woodNote, townsRef, bookingChecklist } from './data.js'

const STORE_KEY = 'madrid-agosto-2026'
const linkIcon = { web: '🔗', phone: '📞', email: '✉️', map: '📍', food: '🍽️', book: '📅', plots: '🏡' }

function loadStore() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {} } catch { return {} }
}

export default function App() {
  const store = loadStore()
  const [lang, setLang] = useState(store.lang === 'en' ? 'en' : 'es')
  const [dayId, setDayId] = useState(store.dayId && days.some(d => d.id === store.dayId) ? store.dayId : days[0].id)
  const [activeTags, setActiveTags] = useState(() => new Set(store.activeTags || []))
  const [checked, setChecked] = useState(() => new Set(store.checked || []))
  const trackRef = useRef(null)

  const L = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? (v[lang] ?? v.en) : v)

  useEffect(() => {
    localStorage.setItem(STORE_KEY, JSON.stringify({ lang, dayId, activeTags: [...activeTags], checked: [...checked] }))
  }, [lang, dayId, activeTags, checked])

  // Auto-centre the active day in the route strip — only scrolls the strip, never the page.
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const el = track.querySelector('.day-pill.active')
    if (el) track.scrollTo({ left: el.offsetLeft - track.clientWidth / 2 + el.clientWidth / 2, behavior: 'smooth' })
  }, [dayId])

  const day = days.find(d => d.id === dayId)
  const dayIdx = days.findIndex(d => d.id === dayId)
  const stopMatches = (stop) => activeTags.size === 0 || stop.tags.some(t => activeTags.has(t))
  const dayHasMatch = (d) => activeTags.size === 0 || d.stops.some(stopMatches)
  const visibleStops = day.stops.filter(stopMatches)

  const toggleTag = (t) => setActiveTags(prev => { const n = new Set(prev); n.has(t) ? n.delete(t) : n.add(t); return n })
  const toggleCheck = (id) => setChecked(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })

  const booked = checked.size
  const total = bookingChecklist.length

  return (
    <div className="app">
      {/* Sticky roadbook header */}
      <header className="topbar">
        <div className="tb-row">
          <div className="brand">
            <span className="brand-mark">RUTA</span>
            <span className="brand-title">{trip.title}</span>
            <span className="brand-dates">{trip.dateRange}</span>
          </div>
          <div className="tb-right">
            <div className="mini-stats">
              <span><b>{days.length}</b>{L(ui.statDays)}</span>
              <span><b>{showrooms.filter(s => s.star).length}</b>{L(ui.statShowrooms)}</span>
              <span><b>{townsRef.length}</b>{L(ui.statTowns)}</span>
              <span className={booked === total ? 'done' : ''}><b>{booked}/{total}</b>{L(ui.statBooked)}</span>
            </div>
            <div className="lang" role="group" aria-label="Language">
              <button className={lang === 'es' ? 'on' : ''} onClick={() => setLang('es')}>ES</button>
              <button className={lang === 'en' ? 'on' : ''} onClick={() => setLang('en')}>EN</button>
            </div>
          </div>
        </div>

        {/* Day route strip */}
        <div className="route-wrap">
          <div className="route" ref={trackRef}>
            {days.map(d => (
              <button
                key={d.id}
                className={'day-pill' + (d.id === dayId ? ' active' : '') + (!dayHasMatch(d) ? ' dim' : '')}
                onClick={() => setDayId(d.id)}
                aria-current={d.id === dayId}
              >
                <span className="dp-dow">{L(d.dow)}</span>
                <span className="dp-num">{d.label.replace('Aug ', '')}</span>
                <span className="dp-emoji">{d.emoji}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="wrap">
        {/* Filters */}
        <div className="filters">
          <span className="filters-label">{L(ui.filter)}</span>
          <div className="chips">
            {Object.entries(tags).map(([key, t]) => (
              <button
                key={key}
                className={'chip' + (activeTags.has(key) ? ' on' : '')}
                style={activeTags.has(key)
                  ? { background: t.color, borderColor: t.color, color: '#fff' }
                  : { borderColor: 'color-mix(in srgb,' + t.color + ' 45%, transparent)', color: t.color }}
                onClick={() => toggleTag(key)}
              >
                {t.icon} {L(t.label)}
              </button>
            ))}
            {activeTags.size > 0 && <button className="chip clear" onClick={() => setActiveTags(new Set())}>{L(ui.clear)}</button>}
          </div>
        </div>

        {/* Reality checks */}
        <details className="notice">
          <summary>{L(ui.realityTitle)}</summary>
          <ul>
            {realityChecks.map((r, i) => <li key={i}><span className="notice-ico">{r.icon}</span><span>{L(r.text)}</span></li>)}
          </ul>
        </details>

        {/* The day (a "leg" of the route) */}
        <main className="leg">
          <div className="leg-head">
            <div className="leg-index">
              <span className="leg-day">{L(day.dow)}</span>
              <span className="leg-date">{day.label.replace('Aug ', '')}</span>
              <span className="leg-mon">AGO</span>
            </div>
            <div className="leg-title-wrap">
              <div className="leg-badges">
                <span className="road-badge">{L(day.corridor)}</span>
                {day.heat === 'cooler' && <span className="cool-badge">{L(ui.coolDay)}</span>}
              </div>
              <h1 className="leg-title">{L(day.title)}</h1>
              <p className="leg-summary">{L(day.summary)}</p>
            </div>
          </div>

          <div className="stations">
            {visibleStops.length === 0 && <div className="no-stops">{L(ui.noStops)}</div>}
            {visibleStops.map((stop, i) => {
              const dot = tags[stop.tags[0]]?.color || 'var(--accent)'
              return (
                <article className="station" key={i}>
                  <div className="st-rail">
                    <span className="st-dot" style={{ borderColor: dot }}><span style={{ background: dot }} />{stop.icon}</span>
                    {i < visibleStops.length - 1 && <span className="st-line" />}
                  </div>
                  <div className="st-card">
                    <div className="st-top">
                      <span className="st-kind">{L(stop.kind)}</span>
                      {stop.time && <span className="st-data">🕒 {stop.time}</span>}
                      {stop.drive && <span className="st-data">🚗 {stop.drive}</span>}
                    </div>
                    <h3 className="st-title">{L(stop.title)}</h3>
                    {stop.place && <div className="st-place">{L(stop.place)}</div>}
                    <p className="st-desc">{L(stop.desc)}</p>
                    {stop.booking && <div className="st-booking"><b>{tags.booking.icon} {L(tags.booking.label)}</b> — {L(stop.booking)}</div>}
                    <div className="st-tags">
                      {stop.tags.map(t => (
                        <span key={t} className="stag" style={{ color: tags[t].color, background: 'color-mix(in srgb,' + tags[t].color + ' 12%, transparent)' }}>
                          {tags[t].icon} {L(tags[t].label)}
                        </span>
                      ))}
                    </div>
                    {stop.links.length > 0 && (
                      <div className="st-links">
                        {stop.links.map((l, j) => (
                          <a key={j} className={'slink ' + l.type} href={l.url} target="_blank" rel="noreferrer">{linkIcon[l.type] || '🔗'} {L(l.label)}</a>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              )
            })}
          </div>

          <div className="leg-move">
            <button className="mv" disabled={dayIdx === 0} onClick={() => dayIdx > 0 && setDayId(days[dayIdx - 1].id)}>{L(ui.prev)}</button>
            <button className="mv next" disabled={dayIdx === days.length - 1} onClick={() => dayIdx < days.length - 1 && setDayId(days[dayIdx + 1].id)}>{L(ui.next)}</button>
          </div>
        </main>

        {/* Checklist */}
        <section className="panel">
          <h2 className="panel-h">{L(ui.checklistTitle)}</h2>
          <div className="cl-progress"><div className="cl-bar" style={{ width: `${(booked / total) * 100}%` }} /></div>
          <ul className="checklist">
            {bookingChecklist.map(item => (
              <li key={item.id} className={checked.has(item.id) ? 'done' : ''} onClick={() => toggleCheck(item.id)}>
                <span className="cl-box">{checked.has(item.id) ? '☑' : '☐'}</span>
                <div className="cl-body">
                  <span>{L(item.text)}</span>
                  {item.links?.length > 0 && (
                    <div className="cl-links" onClick={e => e.stopPropagation()}>
                      {item.links.map((l, j) => (
                        <a key={j} className={'cl-link ' + l.type} href={l.url} target="_blank" rel="noreferrer">{linkIcon[l.type] || '🔗'} {L(l.label)}</a>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Reference */}
        <section className="panel">
          <h2 className="panel-h">{L(ui.referenceTitle)}</h2>
          <details className="ref">
            <summary>{L(ui.showroomsSummary)}</summary>
            <div className="ref-cards">
              {showrooms.map((s, i) => (
                <a key={i} className={'ref-card' + (s.star ? ' star' : '')} href={s.url} target="_blank" rel="noreferrer">
                  <div className="rc-type">{s.star ? '★ ' : ''}{L(s.type)}</div>
                  <div className="rc-name">{s.name}</div>
                  <div className="rc-meta">📌 {L(s.where)}</div>
                  <div className="rc-meta mono">📞 {s.book}</div>
                  <div className="rc-day">{s.day}</div>
                </a>
              ))}
            </div>
            <p className="ref-note">{L(ui.woodCaveat)}{L(woodNote)}</p>
          </details>
          <details className="ref">
            <summary>{L(ui.townsSummary)}</summary>
            <div className="ref-table">
              {townsRef.map((t, i) => (
                <div className="ref-row" key={i}>
                  <div className="rr-name">{t.name}{t.idealista && <a className="rr-idealista" href={t.idealista} target="_blank" rel="noreferrer">🏡 Idealista</a>}</div>
                  <div className="rr-region">{L(t.region)}</div>
                  <div className="rr-kid">🧒 {L(t.kid)}</div>
                  <div className="rr-day mono">{t.day}</div>
                </div>
              ))}
              <div className="ref-row excluded">
                <div className="rr-name">Las Gabias (Granada)</div>
                <div className="rr-region">Granada</div>
                <div className="rr-kid">{L(ui.excludedTown)}</div>
                <div className="rr-day mono">—</div>
              </div>
            </div>
          </details>
        </section>

        <footer className="foot">{L(ui.foot)}</footer>
      </div>
    </div>
  )
}
