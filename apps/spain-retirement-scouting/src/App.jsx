import { useState, useMemo } from 'react'
import { meta, locations, wealthTaxInfo, splitRules, recommendations } from './data'
import './App.css'

const UI = {
  en: {
    title: 'Spain Retirement Scout',
    subtitle: 'Interactive dashboard for sub-€50k plot alternatives',
    tag: '2026',
    kpiPortfolio: 'Stock Portfolio',
    kpiBuild: 'Build Budget',
    kpiPlot: 'Plot Target',
    kpiTax: 'Wealth Tax (50/50)',
    kpiTaxableBase: 'Taxable base /spouse',
    kpiAnnual: '/yr',
    kpiMonthly: '/mo',
    kpiLocations: 'Locations',
    kpiZeroTax: '€0-tax regions',
    tabs: [
      { id: 'compare', label: 'Compare' },
      { id: 'detail', label: 'Detail' },
      { id: 'tax', label: 'Tax' },
      { id: 'split', label: 'Split Rules' },
    ],
    sortLabel: 'Sort by',
    sortOptions: [
      { id: 'value', label: '€/m² Value' },
      { id: 'monthly', label: 'Monthly' },
      { id: 'tax', label: 'Wealth Tax' },
      { id: 'build', label: 'Build Cost' },
    ],
    metricLabels: {
      value: 'Plot €/m²',
      build: 'Build',
      monthly: 'Monthly',
      tax: 'Tax/yr',
      itp: 'ITP',
    },
    activitiesLabel: 'Activities',
    colLocation: 'Location',
    colRegion: 'Region',
    colPlot: 'Plot (avg)',
    colSize: 'Size m²',
    colItp: 'ITP',
    colBuild: 'Build',
    colMonthly: 'Monthly',
    colTax: 'Tax/yr',
    detailPick: 'Pick a location from Compare',
    school: 'School',
    mall: 'Shopping',
    sports: 'Sports & Padel',
    commutes: 'Commute Times',
    openLink: 'Visit ↗',
    recommended: '★ Recommended',
    activitiesFor: 'Activities in',
    noActivities: 'No activities match the current filters.',
    allLocs: 'All locations',
    allCats: 'All categories',
    filterLoc: 'Location',
    filterCat: 'Category',
    taxTitle: 'Wealth Tax Calculator',
    taxSub: 'Live computation under a 50/50 spousal split. Drag the portfolio slider to see how each region reacts.',
    perSpouse: 'Per spouse (50/50)',
    generalExempt: 'General exemption',
    residenceExempt: 'Primary residence',
    taxableBase: 'Taxable base',
    region: 'Region',
    rate: 'Effective',
    excluded: 'Excluded regions (real tax)',
    excludedReason: 'No 100% rebate → real Wealth Tax at this level',
    solidarityNote: 'Solidarity Tax: does not apply (net wealth under €3M)',
    splitTitle: 'How the 50/50 Split Works',
    splitSub: "Spain's Wealth Tax is strictly individual — no joint return for married couples.",
    legalCitations: 'Legal Citations',
    howItWorks: 'How it works legally',
    preMoveRule: '⚠ The Critical Pre-Move Rule',
    preMoveSub: 'Avoiding Gift Tax (Sucesiones y Donaciones)',
    retirementNote: 'Note on retirement accounts (401k/IRA)',
    footer: 'Research compiled July 2026 · Indicative figures — verify with a Spanish asesor fiscal and local ayuntamientos before purchasing.',
  },
  es: {
    title: 'Retiro en España',
    subtitle: 'Panel interactivo de parcelas por menos de €50.000',
    tag: '2026',
    kpiPortfolio: 'Cartera de acciones',
    kpiBuild: 'Presupuesto de obra',
    kpiPlot: 'Objetivo de parcela',
    kpiTax: 'Imp. Patrimonio (50/50)',
    kpiTaxableBase: 'Base /cónyuge',
    kpiAnnual: '/año',
    kpiMonthly: '/mes',
    kpiLocations: 'Ubicaciones',
    kpiZeroTax: 'Regiones con €0',
    tabs: [
      { id: 'compare', label: 'Comparativa' },
      { id: 'detail', label: 'Detalle' },
      { id: 'tax', label: 'Impuesto' },
      { id: 'split', label: 'Reparto 50/50' },
    ],
    sortLabel: 'Ordenar por',
    sortOptions: [
      { id: 'value', label: '€/m² Valor' },
      { id: 'monthly', label: 'Gastos mensuales' },
      { id: 'tax', label: 'Imp. Patrimonio' },
      { id: 'build', label: 'Coste de obra' },
    ],
    metricLabels: {
      value: 'Parcela €/m²',
      build: 'Obra',
      monthly: 'Mensual',
      tax: 'Imp./año',
      itp: 'ITP',
    },
    activitiesLabel: 'Actividades',
    colLocation: 'Ubicación',
    colRegion: 'Región',
    colPlot: 'Parcela (med.)',
    colSize: 'Tamaño m²',
    colItp: 'ITP',
    colBuild: 'Obra',
    colMonthly: 'Mensual',
    colTax: 'Imp./año',
    detailPick: 'Elige una ubicación en Comparativa',
    school: 'Colegio',
    mall: 'Compras',
    sports: 'Deportes y pádel',
    commutes: 'Tiempos de desplazamiento',
    openLink: 'Visitar ↗',
    recommended: '★ Recomendado',
    activitiesFor: 'Actividades en',
    noActivities: 'Ninguna actividad coincide con los filtros.',
    allLocs: 'Todas las ubicaciones',
    allCats: 'Todas las categorías',
    filterLoc: 'Ubicación',
    filterCat: 'Categoría',
    taxTitle: 'Calculadora de Impuesto sobre el Patrimonio',
    taxSub: 'Cálculo en vivo con reparto 50/50 entre cónyuges. Mueve el slider de cartera para ver cómo reacciona cada región.',
    perSpouse: 'Por cónyuge (50/50)',
    generalExempt: 'Exención general',
    residenceExempt: 'Vivienda habitual',
    taxableBase: 'Base imponible',
    region: 'Región',
    rate: 'Tipo efectivo',
    excluded: 'Regiones excluidas (impuesto real)',
    excludedReason: 'Sin bonificación del 100% → Impuesto real a este nivel',
    solidarityNote: 'Impuesto de Solidaridad: no aplica (patrimonio neto inferior a €3M)',
    splitTitle: 'Cómo funciona el reparto 50/50',
    splitSub: 'El Impuesto sobre el Patrimonio en España es estrictamente individual — no hay declaración conjunta para matrimonios.',
    legalCitations: 'Citas legales',
    howItWorks: 'Cómo funciona legalmente',
    preMoveRule: '⚠ Regla crítica: antes de mudarte',
    preMoveSub: 'Evitar el Impuesto de Donaciones (Sucesiones y Donaciones)',
    retirementNote: 'Nota sobre cuentas de jubilación (401k/IRA)',
    footer: 'Investigación recopilada julio 2026 · Cifras orientativas — verifica con un asesor fiscal y los ayuntamientos antes de comprar.',
  },
}

const fmt = (n) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Math.round(n))
const fmtK = (n) => `€${Math.round(n / 1000)}k`

const ACTIVITY_CATEGORIES = [
  { id: 'sports', icon: '⚽', match: ['fútbol', 'pádel', 'tenis', 'padel', 'polideportivo', 'piscina', 'baloncesto', 'hockey', 'judo', 'karate', 'golf', 'frontón', 'soccer', 'basketball', 'sports', 'pool', 'climbing', 'pumptrack', 'pickleball', 'defensa', 'patinaje'] },
  { id: 'nature', icon: '🌳', match: ['senderismo', 'ruta', 'naturaleza', 'parque', 'sierra', 'hiking', 'park', 'natural', 'picnic', 'mountain', 'robledales', 'pinares', 'granja', 'equitación', 'caballo', 'farm', 'horse', 'mountain'] },
  { id: 'culture', icon: '🎨', match: ['museo', 'palacio', 'castillo', 'iglesia', 'histórico', 'patrimonio', 'enoturismo', 'bodegas', 'taller', 'cerámica', 'arte', 'música', 'biblioteca', 'cine', 'teatro', 'cultural', 'museum', 'palace', 'castle', 'church', 'historic', 'heritage', 'wine', 'workshop', 'art', 'music', 'library', 'cinema', 'theater'] },
  { id: 'language', icon: '🗣️', match: ['inglés', 'english', 'idiomas', 'languages', 'eoi', 'kids&us', 'bilingual', 'bilingüe', 'immersion'] },
  { id: 'camps', icon: '🏕️', match: ['campamento', 'camp', 'verano', 'summer', 'urban camp', 'plan corresponsables', 'guardería', 'cei'] },
  { id: 'festive', icon: '🎪', match: ['fiestas', 'patronales', 'festival', 'festivities', 'programación', 'program', 'spectáculo', 'gigantes', 'cabezudos', 'taurinos', 'aqualand'] },
]

function categorize(activity) {
  const haystack = `${activity.nameEs} ${activity.nameEn} ${activity.descEs} ${activity.descEn}`.toLowerCase()
  const cats = ACTIVITY_CATEGORIES.filter(c => c.match.some(m => haystack.includes(m)))
  return cats.length ? cats.map(c => c.id) : ['culture']
}

function activityCats(loc) {
  const cats = new Set()
  loc.activities.forEach((a) => categorize(a).forEach((c) => cats.add(c)))
  return [...cats]
}

const ACTIVITY_SCORES = (() => {
  const KEY_CATS = ['language', 'camps', 'sports', 'nature']
  const ranked = locations.map((l) => {
    const cats = activityCats(l)
    const count = l.activities.length
    const breadth = cats.length
    const keyCount = cats.filter((c) => KEY_CATS.includes(c)).length
    const urlCount = l.activities.filter((a) => a.url).length
    const raw = count * 4 + breadth * 7 + keyCount * 5 + urlCount * 2
    return { id: l.id, raw }
  }).sort((a, b) => b.raw - a.raw || a.id.localeCompare(b.id))
  const maxRaw = ranked[0].raw
  const minRaw = ranked[ranked.length - 1].raw
  const scale = 90 / (maxRaw - minRaw)
  const scores = {}
  ranked.forEach((s, i) => {
    const base = Math.round(10 + (s.raw - minRaw) * scale)
    scores[s.id] = base - i
  })
  return scores
})()

function activityProfile(loc) {
  const cats = activityCats(loc)
  const count = loc.activities.length
  const breadth = cats.length
  const KEY_CATS = ['language', 'camps', 'sports', 'nature']
  const keyCount = cats.filter((c) => KEY_CATS.includes(c)).length
  return { count, breadth, cats, score: ACTIVITY_SCORES[loc.id] }
}

const commuteMinutes = (s) => {
  const m = s.match(/(\d+)(?:\s*[-–]\s*(\d+))?\s*min/)
  if (!m) return 60
  const a = parseInt(m[1], 10)
  const b = m[2] ? parseInt(m[2], 10) : a
  return (a + b) / 2
}

export default function App() {
  const [lang, setLang] = useState('es')
  const [tab, setTab] = useState('compare')
  const [portfolio, setPortfolio] = useState(2000000)
  const [buildBudget, setBuildBudget] = useState(300000)
  const [plotTarget, setPlotTarget] = useState(50000)
  const [sort, setSort] = useState('value')
  const [selected, setSelected] = useState(null)
  const ui = UI[lang]

  const sortedLocs = useMemo(() => {
    const val = (l) => {
      switch (sort) {
        case 'value': return ((l.plotPrice[0] + l.plotPrice[1]) / 2) / ((l.plotSize[0] + l.plotSize[1]) / 2)
        case 'monthly': return l.monthlyExpenses
        case 'tax': return l.wealthTax
        case 'build': return l.buildCost
        default: return 0
      }
    }
    return [...locations].sort((a, b) => val(a) - val(b))
  }, [sort])

  const maxBar = useMemo(() => {
    const val = (l) => {
      switch (sort) {
        case 'value': return ((l.plotPrice[0] + l.plotPrice[1]) / 2) / ((l.plotSize[0] + l.plotSize[1]) / 2)
        case 'monthly': return l.monthlyExpenses
        case 'tax': return l.wealthTax || 1
        case 'build': return l.buildCost
        default: return 1
      }
    }
    return Math.max(...locations.map(val), 1)
  }, [sort])

  const selectedLoc = selected ? locations.find((l) => l.id === selected) : null

  return (
    <div className="dash">
      <TopBar ui={ui} lang={lang} setLang={setLang} />
      <KpiBar
        ui={ui}
        portfolio={portfolio}
        setPortfolio={setPortfolio}
        buildBudget={buildBudget}
        setBuildBudget={setBuildBudget}
        plotTarget={plotTarget}
        setPlotTarget={setPlotTarget}
        lang={lang}
      />
      <TabBar ui={ui} tab={tab} setTab={setTab} />
      <main className="dash-main">
        {tab === 'compare' && (
          <CompareView ui={ui} lang={lang} sort={sort} setSort={setSort} sortedLocs={sortedLocs} maxBar={maxBar} onSelect={(id) => { setSelected(id); setTab('detail') }} />
        )}
        {tab === 'detail' && (
          <DetailView ui={ui} lang={lang} loc={selectedLoc} onSelect={setSelected} />
        )}
        {tab === 'tax' && (
          <TaxView ui={ui} lang={lang} portfolio={portfolio} buildBudget={buildBudget} />
        )}
        {tab === 'split' && <SplitView ui={ui} lang={lang} />}
      </main>
      <footer className="dash-footer">{ui.footer}</footer>
    </div>
  )
}

function TopBar({ ui, lang, setLang }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <span className="topbar-tag">{ui.tag}</span>
        <h1 className="topbar-title">{ui.title}</h1>
        <span className="topbar-sub">{ui.subtitle}</span>
      </div>
      <div className="lang-toggle">
        <button className={lang === 'es' ? 'active' : ''} onClick={() => setLang('es')}>ES</button>
        <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
      </div>
    </header>
  )
}

function KpiBar({ ui, portfolio, setPortfolio, buildBudget, setBuildBudget, plotTarget, setPlotTarget, lang }) {
  const perSpouse = portfolio / 2
  const residenceExempt = 300000
  const generalExempt = 700000
  const taxablePerSpouse = Math.max(0, perSpouse + buildBudget / 2 - generalExempt - residenceExempt)
  const zeroTaxRegions = wealthTaxInfo.regions.filter((r) => r.rateEn.includes('€0')).length
  return (
    <section className="kpi-bar">
      <div className="kpi-slider">
        <div className="kpi-slider-head">
          <span className="kpi-label">{ui.kpiPortfolio}</span>
          <span className="kpi-value">{fmt(portfolio)}</span>
        </div>
        <input type="range" min="500000" max="5000000" step="100000" value={portfolio} onChange={(e) => setPortfolio(Number(e.target.value))} />
        <div className="kpi-slider-foot">
          <span>€500k</span><span>€5M</span>
        </div>
      </div>
      <div className="kpi-slider">
        <div className="kpi-slider-head">
          <span className="kpi-label">{ui.kpiBuild}</span>
          <span className="kpi-value">{fmt(buildBudget)}</span>
        </div>
        <input type="range" min="150000" max="500000" step="10000" value={buildBudget} onChange={(e) => setBuildBudget(Number(e.target.value))} />
        <div className="kpi-slider-foot">
          <span>€150k</span><span>€500k</span>
        </div>
      </div>
      <div className="kpi-slider">
        <div className="kpi-slider-head">
          <span className="kpi-label">{ui.kpiPlot}</span>
          <span className="kpi-value">{fmt(plotTarget)}</span>
        </div>
        <input type="range" min="20000" max="100000" step="5000" value={plotTarget} onChange={(e) => setPlotTarget(Number(e.target.value))} />
        <div className="kpi-slider-foot">
          <span>€20k</span><span>€100k</span>
        </div>
      </div>
      <div className="kpi-tiles">
        <div className="kpi-tile">
          <span className="kpi-tile-num">{locations.length}</span>
          <span className="kpi-tile-label">{ui.kpiLocations}</span>
        </div>
        <div className="kpi-tile zero">
          <span className="kpi-tile-num">{zeroTaxRegions}</span>
          <span className="kpi-tile-label">{ui.kpiZeroTax}</span>
        </div>
        <div className={`kpi-tile ${taxablePerSpouse === 0 ? 'zero' : 'warn'}`}>
          <span className="kpi-tile-num">{fmt(taxablePerSpouse)}</span>
          <span className="kpi-tile-label">{ui.kpiTaxableBase}</span>
        </div>
      </div>
    </section>
  )
}

function TabBar({ ui, tab, setTab }) {
  return (
    <nav className="tabbar">
      {ui.tabs.map((t) => (
        <button key={t.id} className={`tabbar-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
          {t.label}
        </button>
      ))}
    </nav>
  )
}

function Bar({ value, max, color }) {
  const pct = Math.max(2, (value / max) * 100)
  return (
    <div className="bar-track">
      <div className="bar-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

const SUM_METRICS = [
  { id: 'value', fmt: (l) => `${fmt(Math.round(((l.plotPrice[0] + l.plotPrice[1]) / 2) / ((l.plotSize[0] + l.plotSize[1]) / 2)))}/m²`, val: (l) => ((l.plotPrice[0] + l.plotPrice[1]) / 2) / ((l.plotSize[0] + l.plotSize[1]) / 2), color: '#38bdf8', reverse: true },
  { id: 'build', fmt: (l) => fmt(l.buildCost), val: (l) => l.buildCost, color: '#f472b6' },
  { id: 'monthly', fmt: (l) => fmt(l.monthlyExpenses), val: (l) => l.monthlyExpenses, color: '#fb923c', reverse: true },
  { id: 'tax', fmt: (l) => l.wealthTax === 0 ? '€0' : `~${fmt(l.wealthTax)}`, val: (l) => l.wealthTax || 0, color: '#4ade80', reverse: true },
  { id: 'itp', fmt: (l) => `${l.itpPct}%`, val: (l) => l.itpPct, color: '#fbbf24', reverse: true },
]

function CompareView({ ui, lang, sort, setSort, sortedLocs, maxBar, onSelect }) {
  const commuteAvg = (l) => {
    const mins = l.commutes.map((c) => commuteMinutes(c.time))
    return Math.round(mins.reduce((a, b) => a + b, 0) / mins.length)
  }
  const metricRange = SUM_METRICS.map((m) => {
    const vals = locations.map(m.val)
    return { id: m.id, min: Math.min(...vals), max: Math.max(...vals) }
  })
  const pctFor = (m, v) => {
    const r = metricRange.find((r) => r.id === m.id)
    if (!r || r.max === r.min) return 50
    const norm = (v - r.min) / (r.max - r.min)
    return Math.max(8, m.reverse ? (1 - norm) * 100 : norm * 100)
  }
  return (
    <section className="view">
      <div className="view-head">
        <h2>{ui.tabs[0].label}</h2>
        <div className="sort-toolbar">
          <span className="sort-label">{ui.sortLabel}:</span>
          <div className="sort-chips">
            {ui.sortOptions.map((o) => (
              <button key={o.id} className={`sort-chip ${sort === o.id ? 'active' : ''}`} onClick={() => setSort(o.id)}>
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="sum-grid">
        {sortedLocs.map((l, rank) => (
          <button key={l.id} className={`sum-card ${l.recommended ? 'recommended' : ''}`} onClick={() => onSelect(l.id)}>
            <div className="sum-card-head">
              <span className="sum-rank">#{rank + 1}</span>
              <span className="sum-card-icon">{l.icon}</span>
              <div className="sum-card-name">
                <strong>{(lang === 'es' ? l.nameEs : l.nameEn).split(' (')[0]}</strong>
                <span className="sum-card-region">{lang === 'es' ? l.regionEs : l.regionEn}</span>
              </div>
              {l.recommended && <span className="sum-rec-badge">★</span>}
            </div>
            <div className="sum-card-metrics">
              {SUM_METRICS.map((m) => {
                const v = m.val(l)
                const pct = pctFor(m, v)
                const isHi = sort === m.id
                return (
                  <div key={m.id} className={`sum-metric ${isHi ? 'highlight' : ''}`}>
                    <span className="sum-metric-label">{ui.metricLabels[m.id]}</span>
                    <span className="sum-metric-val">{m.fmt(l)}</span>
                    <div className="sum-metric-bar-track">
                      <div className="sum-metric-bar-fill" style={{ width: `${pct}%`, background: m.color, opacity: isHi ? 1 : 0.5 }} />
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="sum-acts">
              <div className="sum-acts-head">
                <span className="sum-acts-label">{ui.activitiesLabel}</span>
                <span className="sum-acts-count">{activityProfile(l).count}</span>
              </div>
              <div className="sum-acts-strip">
                {ACTIVITY_CATEGORIES.map((c) => {
                  const prof = activityProfile(l)
                  const present = prof.cats.includes(c.id)
                  return (
                    <span key={c.id} className={`sum-acts-dot ${present ? 'present' : 'absent'}`} title={c.id}>
                      {c.icon}
                    </span>
                  )
                })}
              </div>
              <div className="sum-acts-score">
                <div className="sum-acts-score-bar">
                  <div className="sum-acts-score-fill" style={{ width: `${activityProfile(l).score}%` }} />
                </div>
                <span className="sum-acts-score-num">{activityProfile(l).score}<span className="sum-acts-score-max">/100</span></span>
              </div>
            </div>
            <div className="sum-card-foot">
              <span className="sum-commute">🚗 ~{commuteAvg(l)} min {lang === 'es' ? 'media' : 'avg'}</span>
              {l.wealthTax === 0 && <span className="sum-tax-badge">€0 tax</span>}
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}

function DetailView({ ui, lang, loc, onSelect }) {
  if (!loc) {
    return (
      <section className="view">
        <div className="empty-state">
          <span className="empty-icon">👆</span>
          <p>{ui.detailPick}</p>
          <div className="loc-pills">
            {locations.map((l) => (
              <button key={l.id} className="loc-pill" onClick={() => onSelect(l.id)}>
                {l.icon} {(lang === 'es' ? l.nameEs : l.nameEn).split(' (')[0]}
              </button>
            ))}
          </div>
        </div>
      </section>
    )
  }
  const maxCommute = Math.max(...loc.commutes.map((c) => commuteMinutes(c.time)))
  return (
    <section className="view detail-view">
      <div className="detail-head">
        <span className="detail-icon">{loc.icon}</span>
        <div>
          <h2>{lang === 'es' ? loc.nameEs : loc.nameEn}</h2>
          <span className="detail-region">{lang === 'es' ? loc.regionEs : loc.regionEn} · {lang === 'es' ? loc.taglineEs : loc.taglineEn}</span>
        </div>
        {loc.recommended && <span className="rec-pill">{ui.recommended}</span>}
      </div>
      <div className="detail-kpis">
        <div className="dkpi"><dt>{ui.colPlot}</dt><dd>{fmt(loc.plotPrice[0])} – {fmt(loc.plotPrice[1])}</dd></div>
        <div className="dkpi"><dt>{ui.colSize}</dt><dd>{loc.plotSize[0]}–{loc.plotSize[1]} m²</dd></div>
        <div className="dkpi"><dt>{ui.colItp}</dt><dd>{loc.itpPct}%</dd></div>
        <div className="dkpi"><dt>{ui.colBuild}</dt><dd>~{fmt(loc.buildCost)}</dd></div>
        <div className="dkpi"><dt>{ui.colMonthly}</dt><dd>~{fmt(loc.monthlyExpenses)}</dd></div>
        <div className={`dkpi ${loc.wealthTax === 0 ? 'zero' : 'warn'}`}><dt>{ui.colTax}</dt><dd>{loc.wealthTax === 0 ? '€0' : `~${fmt(loc.wealthTax)}`}</dd></div>
      </div>
      <div className="detail-cols">
        <div className="detail-col">
          <h3>{ui.commutes}</h3>
          <div className="commute-viz">
            {loc.commutes.map((c, i) => {
              const mins = commuteMinutes(c.time)
              return (
                <div key={i} className="commute-viz-row">
                  <span className="commute-viz-dest">{lang === 'es' ? c.labelEs : c.labelEn}</span>
                  <div className="commute-viz-bar">
                    <div className="commute-viz-fill" style={{ width: `${(mins / maxCommute) * 100}%` }} />
                  </div>
                  <span className="commute-viz-time">{c.time}</span>
                </div>
              )
            })}
          </div>
        </div>
        <div className="detail-col">
          <h3>📍 {ui.school}</h3>
          <div className="detail-link-row">
            <span>{lang === 'es' ? loc.schoolEs : loc.schoolEn}</span>
            {loc.schoolUrl && <a href={loc.schoolUrl} target="_blank" rel="noreferrer">{ui.openLink}</a>}
          </div>
          <h3>🛒 {ui.mall}</h3>
          <div className="detail-link-row">
            <span>{lang === 'es' ? loc.mallEs : loc.mallEn}</span>
            {loc.mallUrl && <a href={loc.mallUrl} target="_blank" rel="noreferrer">{ui.openLink}</a>}
          </div>
          <h3>🎾 {ui.sports}</h3>
          <div className="detail-link-row">
            <span>{lang === 'es' ? loc.sportsEs : loc.sportsEn}</span>
            {loc.sportsUrl && <a href={loc.sportsUrl} target="_blank" rel="noreferrer">{ui.openLink}</a>}
          </div>
        </div>
      </div>
      <div className="detail-reco">
        {lang === 'es' ? loc.recommendationEs : loc.recommendationEn}
      </div>
      <div className="detail-acts">
        <DetailActivities loc={loc} lang={lang} ui={ui} />
      </div>
    </section>
  )
}

function TaxView({ ui, lang, portfolio, buildBudget }) {
  const perSpouse = portfolio / 2
  const residenceExempt = 300000
  const generalExempt = 700000
  const taxablePerSpouse = Math.max(0, perSpouse + buildBudget / 2 - generalExempt - residenceExempt)
  return (
    <section className="view">
      <div className="view-head">
        <h2>{ui.taxTitle}</h2>
        <p className="view-sub">{ui.taxSub}</p>
      </div>
      <div className="tax-calc">
        <div className="tax-calc-row"><span>{ui.perSpouse}</span><strong>{fmt(perSpouse)}</strong></div>
        <div className="tax-calc-row"><span>{ui.residenceExempt}</span><strong>−{fmt(residenceExempt)}</strong></div>
        <div className="tax-calc-row"><span>{ui.generalExempt}</span><strong>−{fmt(generalExempt)}</strong></div>
        <div className={`tax-calc-row total ${taxablePerSpouse === 0 ? 'zero' : 'warn'}`}>
          <span>{ui.taxableBase}</span><strong>{fmt(taxablePerSpouse)}</strong>
        </div>
      </div>
      <div className="tax-region-grid">
        {wealthTaxInfo.regions.map((r, i) => {
          const isZero = r.rateEn.includes('€0')
          return (
            <article key={i} className={`tax-region-card ${isZero ? 'zero' : 'warn'}`}>
              <h3>{lang === 'es' ? r.regionEs : r.regionEn}</h3>
              <p className="tax-region-rate">{lang === 'es' ? r.rateEs : r.rateEn}</p>
              <p className="tax-region-note">{lang === 'es' ? r.noteEs : r.noteEn}</p>
              <div className="tax-region-viz">
                <div className="tax-region-bar-track">
                  <div className="tax-region-bar-fill" style={{ width: isZero ? '100%' : `${Math.min(100, (taxablePerSpouse / perSpouse) * 100)}%`, background: isZero ? '#16a34a' : '#f59e0b' }} />
                </div>
                <span className="tax-region-viz-label">{isZero ? '0%' : `${Math.round((taxablePerSpouse / perSpouse) * 100)}% taxable`}</span>
              </div>
            </article>
          )
        })}
      </div>
      <div className="tax-solidarity">{ui.solidarityNote}</div>
      <div className="tax-excluded">
        <h4>{ui.excluded}</h4>
        <p className="tax-excluded-reason">{ui.excludedReason}</p>
        <div className="tax-excluded-list">
          {wealthTaxInfo.excluded.map((e, i) => (
            <span key={i} className="tax-excluded-pill">{lang === 'es' ? e.regionEs : e.regionEn}</span>
          ))}
        </div>
      </div>
    </section>
  )
}

function DetailActivities({ loc, lang, ui }) {
  const [cat, setCat] = useState('all')
  const prof = activityProfile(loc)
  const enriched = loc.activities.map((a) => ({ ...a, categories: categorize(a) }))
  const filtered = cat === 'all' ? enriched : enriched.filter((a) => a.categories.includes(cat))
  const locName = (lang === 'es' ? loc.nameEs : loc.nameEn).split(' (')[0]
  return (
    <>
      <div className="detail-acts-head">
        <h3>{ui.activitiesFor} {locName}</h3>
        <div className="detail-acts-score">
          <span className="detail-acts-count">{prof.count}</span>
          <div className="detail-acts-score-bar">
            <div className="detail-acts-score-fill" style={{ width: `${prof.score}%` }} />
          </div>
          <span className="detail-acts-score-num">{prof.score}/100</span>
        </div>
      </div>
      <div className="detail-acts-cats">
        <button className={`act-filter-chip ${cat === 'all' ? 'active' : ''}`} onClick={() => setCat('all')}>{ui.allCats}</button>
        {ACTIVITY_CATEGORIES.map((c) => {
          const present = prof.cats.includes(c.id)
          return (
            <button
              key={c.id}
              className={`act-filter-chip ${cat === c.id ? 'active' : ''} ${!present ? 'dim' : ''}`}
              onClick={() => setCat(c.id)}
              disabled={!present}
            >
              {c.icon} {c.id}
            </button>
          )
        })}
      </div>
      {filtered.length === 0 ? (
        <p className="act-empty">{ui.noActivities}</p>
      ) : (
        <div className="act-grid">
          {filtered.map((a, i) => (
            <article key={i} className="act-card">
              <div className="act-card-top">
                <span className="act-card-icon">{a.icon}</span>
              </div>
              <h4>{lang === 'es' ? a.nameEs : a.nameEn}</h4>
              <p>{lang === 'es' ? a.descEs : a.descEn}</p>
              <div className="act-card-cats">
                {a.categories.map((c) => {
                  const catDef = ACTIVITY_CATEGORIES.find((x) => x.id === c)
                  return catDef && <span key={c} className="act-cat-pill">{catDef.icon} {catDef.id}</span>
                })}
              </div>
              {a.url && <a href={a.url} target="_blank" rel="noreferrer" className="act-card-link">{ui.openLink}</a>}
            </article>
          ))}
        </div>
      )}
    </>
  )
}

function SplitView({ ui, lang }) {
  const steps = lang === 'es' ? splitRules.howItWorksEs : splitRules.howItWorksEn
  const preMove = lang === 'es' ? splitRules.preMoveRuleEs : splitRules.preMoveRuleEn
  return (
    <section className="view">
      <div className="view-head">
        <h2>{ui.splitTitle}</h2>
        <p className="view-sub">{ui.splitSub}</p>
      </div>
      <h3 className="split-h3">{ui.legalCitations}</h3>
      <div className="split-citations">
        {splitRules.citations.map((c, i) => (
          <article key={i} className="citation-card">
            <h4>{lang === 'es' ? c.idEs : c.idEn}</h4>
            <p>{lang === 'es' ? c.textEs : c.textEn}</p>
          </article>
        ))}
      </div>
      <h3 className="split-h3">{ui.howItWorks}</h3>
      <ol className="split-steps">
        {steps.map((s, i) => <li key={i}>{s}</li>)}
      </ol>
      <div className="split-premove">
        <h3>{ui.preMoveRule}</h3>
        <p className="split-premove-sub">{ui.preMoveSub}</p>
        <ol className="split-steps">
          {preMove.map((s, i) => <li key={i}>{s}</li>)}
        </ol>
      </div>
      <div className="split-retirement">
        <h4>{ui.retirementNote}</h4>
        <p>{lang === 'es' ? splitRules.retirementNoteEs : splitRules.retirementNoteEn}</p>
      </div>
    </section>
  )
}