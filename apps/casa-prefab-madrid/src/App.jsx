import { useState, useEffect, useMemo, useRef } from 'react'
import {
  meta, techs, techProsCons, companies, includedItems, excludedItems,
  costByQuality, costBreakdownPercents, extraCosts, pitfalls, sources, questionsToAsk,
  visitPlaces, visitPlacesAlicante, ferias, feriasAlicante,
} from './data'

const NAV = [
  { id: 'calc', label: 'Calculadora' },
  { id: 'techs', label: 'Tecnologías' },
  { id: 'empresas', label: 'Empresas' },
  { id: 'visitar', label: 'Visitar' },
  { id: 'alcance', label: 'Alcance' },
  { id: 'trampas', label: 'Trampas' },
  { id: 'preguntas', label: 'Preguntas' },
]

const fmt = (n) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Math.round(n))
const fmtK = (n) => `${Math.round(n / 1000)}k`

const BREAKDOWN_COLORS = {
  cimentacion:   '#c2410c',
  estructura:    '#0f766e',
  cubierta:      '#7c3aed',
  carpinteria:   '#0369a1',
  revestimientos:'#ca8a04',
  instalaciones: '#db2777',
  acabados:      '#16a34a',
  direccion:     '#64748b',
}
const BREAKDOWN_LABELS = {
  cimentacion:   'Cimentación',
  estructura:    'Estructura + envolvente',
  cubierta:      'Cubierta',
  carpinteria:   'Carpintería exterior',
  revestimientos:'Revestimientos',
  instalaciones: 'Instalaciones',
  acabados:      'Acabados interiores',
  direccion:     'Proyecto + dirección',
}

export default function App() {
  const [active, setActive] = useState('calc')
  const sectionRefs = useRef({})

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id)
        })
      },
      { rootMargin: '-30% 0px -60% 0px' }
    )
    NAV.forEach((n) => {
      const el = document.getElementById(n.id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [])

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="page">
      <nav className="float-nav">
        <span className="nav-logo" onClick={() => scrollTo('hero')}>🏠</span>
        {NAV.map((n) => (
          <button key={n.id} className={`nav-pill ${active === n.id ? 'active' : ''}`} onClick={() => scrollTo(n.id)}>
            {n.label}
          </button>
        ))}
      </nav>

      <Hero scrollTo={scrollTo} />
      <Calculator sectionRef={(el) => (sectionRefs.current.calc = el)} />
      <TechSpectrum />
      <Companies />
      <Visitar />
      <Scope />
      <Pitfalls />
      <Questions />
      <Sources />
      <footer className="page-footer">
        <p>Investigación recopilada junio 2026 · Precios orientativos — verifica cada presupuesto con la empresa</p>
      </footer>
    </div>
  )
}

/* ===== HERO ===== */
function Hero({ scrollTo }) {
  return (
    <section className="hero" id="hero">
      <div className="hero-bg" />
      <div className="hero-content">
        <span className="hero-tag">Investigación interactiva · Junio 2026</span>
        <h1 className="hero-title">
          Casa Prefabricada<br />
          <span className="hero-title-accent">en Madrid</span>
        </h1>
        <p className="hero-sub">
          Tecnología, empresas y costes reales para una vivienda de 100–120 m²,<br />
          llave en mano, sin contar el terreno.
        </p>
        <div className="hero-stats">
          <div className="stat-pill">
            <span className="stat-num">200k</span>
            <span className="stat-label">objetivo ideal</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-pill">
            <span className="stat-num">300k</span>
            <span className="stat-label">presupuesto máx</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-pill">
            <span className="stat-num">110</span>
            <span className="stat-label">m² objetivo</span>
          </div>
        </div>
        <button className="hero-cta" onClick={() => scrollTo('calc')}>Calcular mi presupuesto →</button>
      </div>
    </section>
  )
}

/* ===== CALCULATOR ===== */
function Calculator() {
  const [size, setSize] = useState(110)
  const [techId, setTechId] = useState('sip')
  const [quality, setQuality] = useState('low')
  const [acometidas, setAcometidas] = useState(true)
  const [earthworks, setEarthworks] = useState(false)
  const [extras, setExtras] = useState({ fencing: false, porch: true, photovoltaic: false })
  const [animatedTotal, setAnimatedTotal] = useState(0)

  const tech = techs.find((t) => t.id === techId)

  const calc = useMemo(() => {
    const pPerM2 = quality === 'low' ? tech.pricePerM2[0] : tech.pricePerM2[1]
    const pem = pPerM2 * size
    const structParts = Object.entries(costBreakdownPercents).map(([k, pct]) => ({
      key: k, label: BREAKDOWN_LABELS[k], color: BREAKDOWN_COLORS[k], amount: pem * pct, pct,
    }))
    const iva = pem * 0.10
    const icio = pem * 0.04
    const licenciaTasa = pem * 0.02
    const mid = (e) => (e[0] + e[1]) / 2
    const acomCost = acometidas ? mid(extraCosts.acometidas) : 0
    const earthCost = earthworks ? mid(extraCosts.earthworks) : 0
    const altas = mid(extraCosts.altas)
    const extrasCost = Object.entries(extras).filter(([, v]) => v).reduce((s, [k]) => {
      const m = { fencing: 'fencing', porch: 'porch', photovoltaic: 'photovoltaic' }
      return s + mid(extraCosts[m[k]])
    }, 0)
    const taxes = iva + icio + licenciaTasa
    const civilAndExtras = acomCost + earthCost + altas + extrasCost
    const total = pem + taxes + civilAndExtras
    return { pPerM2, pem, structParts, iva, icio, licenciaTasa, taxes, acomCost, earthCost, altas, extrasCost, civilAndExtras, total }
  }, [size, tech, quality, acometidas, earthworks, extras])

  useEffect(() => {
    const target = calc.total
    const start = animatedTotal
    const diff = target - start
    if (Math.abs(diff) < 1) { setAnimatedTotal(target); return }
    let raf
    const duration = 400
    const t0 = performance.now()
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setAnimatedTotal(start + diff * eased)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [calc.total])

  const over = calc.total > meta.budget.max
  const overIdeal = calc.total > meta.budget.ideal
  const verdict = over
    ? { text: `Excede tu máximo en ${fmt(calc.total - meta.budget.max)}`, class: 'over' }
    : overIdeal
    ? { text: `${fmt(calc.total - meta.budget.ideal)} por encima del ideal`, class: 'warn' }
    : { text: `Dentro del ideal con ${fmt(meta.budget.ideal - calc.total)} de margen`, class: 'ok' }

  const totalForBars = Math.max(calc.total, 1)
  const maxBarScale = 320000

  return (
    <section className="section calc-section" id="calc">
      <SectionHeader num="01" title="Calculadora de presupuesto" sub="Mueve los controles y mira cómo cambia tu coste total, desglosado por partidas." />

      <div className="calc-layout">
        {/* LEFT: CONTROLS */}
        <div className="calc-controls">
          <div className="ctrl">
            <label>Superficie</label>
            <div className="slider-row">
              <input type="range" min="80" max="150" step="5" value={size} onChange={(e) => setSize(+e.target.value)} />
              <span className="slider-val">{size} m²</span>
            </div>
          </div>

          <div className="ctrl">
            <label>Tecnología</label>
            <div className="tech-picker">
              {techs.map((t) => (
                <button
                  key={t.id}
                  className={`tech-pick ${techId === t.id ? 'active' : ''}`}
                  style={techId === t.id ? { borderColor: BREAKDOWN_COLORS[t.id] } : {}}
                  onClick={() => setTechId(t.id)}
                >
                  <span className="tech-pick-icon">{t.icon}</span>
                  <span className="tech-pick-name">{t.name.split(' (')[0].split(' 3D')[0]}</span>
                </button>
              ))}
            </div>
            <p className="tech-hint">{tech.summary} <strong>{tech.pricePerM2[0]}–{tech.pricePerM2[1]} €/m²</strong> · {tech.timeframe}</p>
          </div>

          <div className="ctrl">
            <label>Calidad de acabados</label>
            <div className="seg">
              <button className={quality === 'low' ? 'active' : ''} onClick={() => setQuality('low')}>
                <span className="seg-label">Media</span>
                <span className="seg-sub">{tech.pricePerM2[0]} €/m²</span>
              </button>
              <button className={quality === 'high' ? 'active' : ''} onClick={() => setQuality('high')}>
                <span className="seg-label">Alta</span>
                <span className="seg-sub">{tech.pricePerM2[1]} €/m²</span>
              </button>
            </div>
          </div>

          <div className="ctrl">
            <label>Obra civil y extras</label>
            <div className="mini-toggles">
              <MiniToggle label="Acometidas" checked={acometidas} onChange={setAcometidas} />
              <MiniToggle label="Tierras" checked={earthworks} onChange={setEarthworks} />
              <MiniToggle label="Valla" checked={extras.fencing} onChange={(v) => setExtras((x) => ({ ...x, fencing: v }))} />
              <MiniToggle label="Porche" checked={extras.porch} onChange={(v) => setExtras((x) => ({ ...x, porch: v }))} />
              <MiniToggle label="Solar" checked={extras.photovoltaic} onChange={(v) => setExtras((x) => ({ ...x, photovoltaic: v }))} />
            </div>
          </div>

          <div className="quick-info">
            <p>Plazo típico de ejecución: <strong>6–9 meses</strong></p>
            <p>IVA aplicable: <strong>10%</strong> (vivienda habitual)</p>
          </div>
        </div>

        {/* RIGHT: VISUAL RESULT */}
        <div className="calc-display">
          <div className={`total-block ${verdict.class}`}>
            <span className="total-label">Total estimado · sin terreno</span>
            <span className="total-amount">{fmt(animatedTotal)}</span>
            <span className={`total-verdict ${verdict.class}`}>{verdict.text}</span>
          </div>

          <div className="budget-bar-wrap">
            <div className="budget-bar-track">
              <div className="budget-bar-fill" style={{ width: `${Math.min(100, (calc.total / maxBarScale) * 100)}%`, background: over ? 'var(--over)' : overIdeal ? 'var(--accent)' : 'var(--ok)' }} />
              <div className="budget-marker ideal" style={{ left: `${(meta.budget.ideal / maxBarScale) * 100}%` }} />
              <div className="budget-marker max" style={{ left: `${(meta.budget.max / maxBarScale) * 100}%` }} />
            </div>
            <div className="budget-labels">
              <span className="bm-ideal">▲ ideal {fmtK(meta.budget.ideal)}€</span>
              <span className="bm-max">▲ máx {fmtK(meta.budget.max)}€</span>
            </div>
          </div>

          <div className="comp-bars">
            <h4>Composición del coste</h4>
            {calc.structParts.map((p) => (
              <div key={p.key} className="comp-bar-row">
                <span className="comp-bar-label">{p.label}</span>
                <div className="comp-bar-track">
                  <div className="comp-bar-fill" style={{ width: `${(p.amount / totalForBars) * 100}%`, background: p.color }} />
                </div>
                <span className="comp-bar-amt">{fmt(p.amount)}</span>
              </div>
            ))}
            <div className="comp-bar-row comp-bar-section">
              <span className="comp-bar-label">IVA + ICIO + licencia</span>
              <div className="comp-bar-track">
                <div className="comp-bar-fill" style={{ width: `${(calc.taxes / totalForBars) * 100}%`, background: '#b91c1c' }} />
              </div>
              <span className="comp-bar-amt">{fmt(calc.taxes)}</span>
            </div>
            <div className="comp-bar-row comp-bar-section">
              <span className="comp-bar-label">Obra civil + extras</span>
              <div className="comp-bar-track">
                <div className="comp-bar-fill" style={{ width: `${(calc.civilAndExtras / totalForBars) * 100}%`, background: '#a16207' }} />
              </div>
              <span className="comp-bar-amt">{fmt(calc.civilAndExtras)}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Toggle({ label, hint, checked, onChange }) {
  return (
    <label className={`toggle-card ${checked ? 'checked' : ''}`}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle-info">
        <span className="toggle-label">{label}</span>
        <span className="toggle-hint">{hint}</span>
      </span>
      <span className="toggle-check">{checked ? '✓' : ''}</span>
    </label>
  )
}

function MiniToggle({ label, checked, onChange }) {
  return (
    <button className={`mini-toggle ${checked ? 'checked' : ''}`} onClick={() => onChange(!checked)}>
      <span>{label}</span>
      <span className="mini-check">{checked ? '✓' : '+'}</span>
    </button>
  )
}

/* ===== TECH SPECTRUM ===== */
function TechSpectrum() {
  const [openId, setOpenId] = useState(null)
  const maxScale = 2200
  return (
    <section className="section" id="techs">
      <SectionHeader num="02" title="Tecnologías constructoras" sub="Compara los 6 sistemas por precio, plazo y prestaciones. Pulsa para ver pros y contras." />

      <div className="spectrum">
        <div className="spectrum-axis">
          <span>0</span><span>500</span><span>1.000</span><span>1.500</span><span>2.000</span><span>€/m²</span>
        </div>
        {techs.map((t) => {
          const leftPct = (t.pricePerM2[0] / maxScale) * 100
          const widthPct = ((t.pricePerM2[1] - t.pricePerM2[0]) / maxScale) * 100
          return (
            <div key={t.id} className={`spectrum-row ${openId === t.id ? 'open' : ''}`}>
              <div className="spectrum-label" onClick={() => setOpenId(openId === t.id ? null : t.id)}>
                <span className="spectrum-icon">{t.icon}</span>
                <span className="spectrum-name">{t.name}</span>
                <span className="spectrum-expand">{openId === t.id ? '−' : '+'}</span>
              </div>
              <div className="spectrum-bar-area" onClick={() => setOpenId(openId === t.id ? null : t.id)}>
                <div className="spectrum-bar-bg" />
                <div
                  className="spectrum-bar-fill"
                  style={{ left: `${leftPct}%`, width: `${widthPct}%`, background: BREAKDOWN_COLORS[t.id] || '#c2410c' }}
                />
                <span className="spectrum-price-tag" style={{ left: `${leftPct + widthPct + 1}%` }}>
                  {t.pricePerM2[0]}–{t.pricePerM2[1]} €/m²
                </span>
              </div>
              {openId === t.id && (
                <div className="spectrum-detail">
                  <p className="spectrum-summary">{t.summary}</p>
                  <div className="spectrum-specs">
                    <SpecChip label="Plazo" value={t.timeframe} />
                    <SpecChip label="Energía" value={t.energyClass.join('–')} />
                    <SpecChip label="Masa térmica" value={t.thermalMass} />
                    <SpecChip label="Transporte" value={t.transportWeight} />
                  </div>
                  <div className="spectrum-proscons">
                    <div className="pc-col">
                      <h5>Pros</h5>
                      <ul>{techProsCons[t.id].pros.map((p, i) => <li key={i}>{p}</li>)}</ul>
                    </div>
                    <div className="pc-col">
                      <h5>Contras</h5>
                      <ul>{techProsCons[t.id].cons.map((c, i) => <li key={i}>{c}</li>)}</ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

function SpecChip({ label, value }) {
  return (
    <div className="spec-chip">
      <span className="spec-chip-label">{label}</span>
      <span className="spec-chip-value">{value}</span>
    </div>
  )
}

/* ===== COMPANIES ===== */
function Companies() {
  const [filter, setFilter] = useState('all')
  const filtered = filter === 'all' ? companies : companies.filter((c) => c.tech === filter)
  return (
    <section className="section" id="empresas">
      <SectionHeader num="03" title="Empresas en Madrid" sub={`${companies.length} empresas con sede o servicio en la Comunidad de Madrid. Filtra por tecnología.`} />
      <div className="filter-chips">
        <button className={`chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>Todas</button>
        {techs.map((t) => (
          <button key={t.id} className={`chip ${filter === t.id ? 'active' : ''}`} onClick={() => setFilter(t.id)}>
            {t.icon} {t.name.split(' (')[0].split(' 3D')[0]}
          </button>
        ))}
      </div>
      <div className="co-grid">
        {filtered.map((c) => (
          <article key={c.name} className={`co-card co-${c.tech}`}>
            <div className="co-top">
              <span className="co-emoji">{c.icon}</span>
              <span className="co-tech-tag">{techs.find((t) => t.id === c.tech)?.name.split(' (')[0]}</span>
            </div>
            <h3 className="co-name">{c.name}</h3>
            <p className="co-loc">📍 {c.location}</p>
            <p className="co-radius">🚚 {c.madridRadius}</p>
            <p className="co-scope-text">{c.scope}</p>
            <div className="co-price-box">
              <span className="co-price-tag">Precio</span>
              <span className="co-price-val">{c.priceFrom}</span>
            </div>
            <p className="co-notes-text">{c.notes}</p>
            <a href={c.url} target="_blank" rel="noreferrer" className="co-link">Visitar web ↗</a>
          </article>
        ))}
      </div>
    </section>
  )
}

/* ===== VISITAR ===== */
function Visitar() {
  const [filter, setFilter] = useState('all')
  const types = [
    { id: 'all', label: 'Todo' },
    { id: 'showroom', label: 'Showrooms' },
    { id: 'pilot', label: 'Casas piloto' },
    { id: 'office', label: 'Oficinas' },
    { id: 'factory', label: 'Fábricas' },
  ]
  const filtered = filter === 'all' ? visitPlaces : visitPlaces.filter((p) => p.type === filter)
  return (
    <section className="section" id="visitar">
      <SectionHeader num="04" title="Dónde ver casas en Madrid" sub="Showrooms, casas piloto y oficinas para visitar en persona. Cita previa en casi todos." />

      <div className="filter-chips">
        {types.map((t) => (
          <button key={t.id} className={`chip ${filter === t.id ? 'active' : ''}`} onClick={() => setFilter(t.id)}>{t.label}</button>
        ))}
      </div>

      <div className="visit-grid">
        {filtered.map((p) => (
          <article key={p.name} className={`visit-card ${p.recommended ? 'recommended' : ''}`}>
            {p.recommended && <span className="rec-badge">★ Recomendado</span>}
            <div className="visit-head">
              <span className="visit-icon">{p.icon}</span>
              <div>
                <h3 className="visit-name">{p.name}</h3>
                <span className="visit-type-tag">{p.type === 'showroom' ? 'Showroom' : p.type === 'pilot' ? 'Casa piloto' : p.type === 'office' ? 'Oficina' : 'Fábrica'}</span>
              </div>
            </div>
            <p className="visit-addr">📍 {p.address}</p>
            <p className="visit-hours">🕒 {p.hours}</p>
            <p className="visit-appt">📞 {p.appointment}</p>
            <p className="visit-what">{p.what}</p>
            <div className="visit-links">
              {p.maps && <a href={p.maps} target="_blank" rel="noreferrer" className="visit-link maps">Maps ↗</a>}
              <a href={p.url} target="_blank" rel="noreferrer" className="visit-link web">Web ↗</a>
            </div>
          </article>
        ))}
      </div>

      <div className="ferias-block">
        <h3 className="ferias-title">📅 Ferias y eventos 2026</h3>
        <div className="feria-list">
          {ferias.map((f) => (
            <article key={f.name} className={`feria-card ${f.recommended ? 'recommended' : ''}`}>
              {f.recommended && <span className="rec-badge">★ Imperdible</span>}
              <div className="feria-head">
                <h4>{f.name}</h4>
                <span className="feria-date">{f.date}</span>
              </div>
              <p className="feria-addr">📍 {f.address}</p>
              <p className="feria-what">{f.what}</p>
              <a href={f.url} target="_blank" rel="noreferrer" className="visit-link web">Más info ↗</a>
            </article>
          ))}
        </div>
      </div>

      <div className="alicante-block">
        <h3 className="alicante-title">✈️ Comunidad Valenciana · Viaje de 2–3h desde Madrid</h3>
        <p className="alicante-sub">Alicante y Valencia concentran la mayor densidad de fábricas de casas modulares de España. Merecen un día de viaje.</p>
        <div className="visit-grid">
          {visitPlacesAlicante.map((p) => (
            <article key={p.name} className={`visit-card ${p.recommended ? 'recommended' : ''}`} style={{ borderTopColor: '#16a34a' }}>
              {p.recommended && <span className="rec-badge">★ Recomendado</span>}
              <div className="visit-head">
                <span className="visit-icon">{p.icon}</span>
                <div>
                  <h3 className="visit-name">{p.name}</h3>
                  <span className="visit-type-tag">Fábrica</span>
                </div>
              </div>
              <p className="visit-addr">📍 {p.address}</p>
              <p className="visit-hours">🕒 {p.hours}</p>
              <p className="visit-appt">📞 {p.appointment}</p>
              <p className="visit-what">{p.what}</p>
              <div className="visit-links">
                {p.maps && <a href={p.maps} target="_blank" rel="noreferrer" className="visit-link maps">Maps ↗</a>}
                <a href={p.url} target="_blank" rel="noreferrer" className="visit-link web">Web ↗</a>
              </div>
            </article>
          ))}
        </div>
        <div className="feria-list" style={{ marginTop: '0.9rem' }}>
          {feriasAlicante.map((f) => (
            <article key={f.name} className="feria-card" style={{ borderLeftColor: '#16a34a' }}>
              <div className="feria-head">
                <h4>{f.name}</h4>
                <span className="feria-date">{f.date}</span>
              </div>
              <p className="feria-addr">📍 {f.address}</p>
              <p className="feria-what">{f.what}</p>
              <a href={f.url} target="_blank" rel="noreferrer" className="visit-link web">Más info ↗</a>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ===== SCOPE ===== */
function Scope() {
  return (
    <section className="section" id="alcance">
      <SectionHeader num="05" title="¿Qué incluye el llave en mano?" sub="El contrato típico en España cubre bastante — pero hay partidas que siempre pagas tú." />
      <div className="scope-cols">
        <div className="scope-in">
          <div className="scope-header-in">
            <span className="scope-icon">✓</span>
            <h3>Incluido en el contrato</h3>
          </div>
          {includedItems.map((g) => (
            <div key={g.area} className="scope-group">
              <h4>{g.area}</h4>
              <ul>{g.items.map((i) => <li key={i}>{i}</li>)}</ul>
            </div>
          ))}
        </div>
        <div className="scope-out">
          <div className="scope-header-out">
            <span className="scope-icon">✗</span>
            <h3>Tú pagas (extra)</h3>
          </div>
          <ul className="scope-out-list">
            {excludedItems.map((e) => (
              <li key={e.label}>
                <strong>{e.label}</strong>
                <p>{e.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

/* ===== PITFALLS ===== */
function Pitfalls() {
  return (
    <section className="section" id="trampas">
      <SectionHeader num="06" title="Trampas a verificar" sub="12 puntos críticos que aparecen una y otra vez. Léelos antes de firmar." />
      <div className="pit-grid">
        {pitfalls.map((p, i) => (
          <article key={i} className="pit-card">
            <span className="pit-num">{String(i + 1).padStart(2, '0')}</span>
            <h3>{p.title}</h3>
            <p>{p.detail}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

/* ===== QUESTIONS ===== */
function Questions() {
  return (
    <section className="section" id="preguntas">
      <SectionHeader num="07" title="Preguntas para cada empresa" sub="Una empresa seria responderá sin esquivar ninguna de estas 10 preguntas." />
      <div className="qlist">
        {questionsToAsk.map((q, i) => (
          <div key={i} className="qlist-item">
            <span className="qlist-num">{String(i + 1).padStart(2, '0')}</span>
            <span className="qlist-text">{q}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ===== SOURCES ===== */
function Sources() {
  return (
    <section className="section" id="sources">
      <SectionHeader num="08" title="Fuentes" sub="Datos compilados de medios especializados y páginas de fabricantes." />
      <div className="src-grid">
        {sources.map((s, i) => (
          <a key={i} href={s.url} target="_blank" rel="noreferrer" className="src-link">{s.label} ↗</a>
        ))}
      </div>
    </section>
  )
}

/* ===== SHARED ===== */
function SectionHeader({ num, title, sub }) {
  return (
    <div className="sec-header">
      <span className="sec-num">{num}</span>
      <div>
        <h2 className="sec-title">{title}</h2>
        <p className="sec-sub">{sub}</p>
      </div>
    </div>
  )
}