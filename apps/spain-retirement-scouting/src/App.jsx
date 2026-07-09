import { useState, useEffect, useRef } from 'react'
import { meta, locations, wealthTaxInfo, splitRules, recommendations } from './data'
import './App.css'

const UI = {
  en: {
    title: 'Sub-€50k Plot Alternatives',
    subtitle: 'Five affordable, family-oriented suburbs in Spain',
    heroTag: 'Retirement Scouting Research · 2026',
    portfolio: 'Stock Portfolio',
    build: 'Build Budget',
    plotTarget: 'Plot Target',
    nav: [
      { id: 'overview', label: 'Overview' },
      { id: 'locations', label: 'Locations' },
      { id: 'activities', label: 'Activities' },
      { id: 'wealth', label: 'Wealth Tax' },
      { id: 'split', label: '50/50 Split' },
      { id: 'compare', label: 'Comparison' },
      { id: 'next', label: 'Next Steps' },
    ],
    overviewTitle: 'The Big Picture',
    overviewP1: 'A family with a €2,000,000 stock portfolio and a €300,000 build budget can achieve €0 Wealth Tax (under a 50/50 spousal split) by choosing the right region. These five suburbs offer urbanized building plots for around or under €50,000, with schools, sports facilities, and shopping centers under 25 minutes away.',
    overviewP2: 'Three locations are inside Madrid Province (guaranteed €0 Wealth Tax), one "Madrid-border cheat-code" in Guadalajara, and the top-value option in Granada.',
    overviewRegions: '3 × Madrid Province · 1 × Guadalajara · 1 × Granada',
    locTitle: 'Location Analysis',
    locSub: 'Plot prices, schools, shopping, sports and commute times for each option.',
    plotPrice: 'Plot Price',
    plotSize: 'Plot Size',
    buildCost: 'Build & Setup',
    monthlyExp: 'Monthly Expenses',
    wealthTax: 'Wealth Tax',
    itp: 'Purchase Tax (ITP)',
    school: 'School',
    mall: 'Shopping',
    sports: 'Sports & Padel',
    commutes: 'Commute Times',
    openLink: 'Visit ↗',
    recommended: '★ Recommended',
    wealthTitle: 'Wealth Tax by Region',
    wealthSub: 'For a total wealth of €2,300,000 (€2M portfolio + €300k home) under a 50/50 spousal split.',
    rate: 'Effective Rate',
    solidarityNote: 'Solidarity Tax: does not apply (net wealth under €3M)',
    excluded: 'Excluded Regions',
    excludedReason: 'No 100% rebate → real Wealth Tax at this level',
    splitTitle: 'How the 50/50 Split Works',
    splitSub: 'Spain\'s Wealth Tax is strictly individual — there is no joint return for married couples.',
    legalCitations: 'Legal Citations',
    howItWorks: 'How it works legally',
    preMoveRule: '⚠ The Critical Pre-Move Rule',
    preMoveSub: 'Avoiding Gift Tax (Impuesto sobre Sucesiones y Donaciones)',
    retirementNote: 'Note on retirement accounts (401k/IRA)',
    activitiesTitle: 'Family Activities & After-School',
    activitiesSub: 'Fun things, sports, music, nature and after-school programs for Clara in each location.',
    compareTitle: 'Financial & Budget Comparison',
    compareSub: 'All five sub-€50k alternatives, assuming a €300,000 home build + setup.',
    colLocation: 'Location',
    colRegion: 'Region',
    colPlot: 'Plot',
    colItp: 'ITP',
    colBuild: 'Build',
    colMonthly: 'Monthly',
    colTax: 'Tax (50/50)',
    colSize: 'Plot Size',
    nextTitle: 'Recommendations & Next Steps',
    nextSub: 'Pick your priority — each option wins on a different dimension.',
    pickLabel: 'Pick',
    reasonLabel: 'Why',
    footer: 'Research compiled July 2026 · Tax rules and plot prices are indicative — verify with a Spanish tax advisor (asesor fiscal) and local town halls (ayuntamientos) before purchasing.',
  },
  es: {
    title: 'Parcelas por menos de €50.000',
    subtitle: 'Cinco suburbios asequibles y familiares en España',
    heroTag: 'Investigación para jubilación · 2026',
    portfolio: 'Cartera de acciones',
    build: 'Presupuesto de obra',
    plotTarget: 'Objetivo de parcela',
    nav: [
      { id: 'overview', label: 'Resumen' },
      { id: 'locations', label: 'Ubicaciones' },
      { id: 'activities', label: 'Actividades' },
      { id: 'wealth', label: 'Impuesto' },
      { id: 'split', label: 'Reparto 50/50' },
      { id: 'compare', label: 'Comparativa' },
      { id: 'next', label: 'Próximos pasos' },
    ],
    overviewTitle: 'El panorama general',
    overviewP1: 'Una familia con una cartera de acciones de €2.000.000 y un presupuesto de obra de €300.000 puede lograr €0 de Impuesto sobre el Patrimonio (con reparto 50/50 entre cónyuges) eligiendo la región adecuada. Estos cinco suburbios ofrecen parcelas urbanizadas por alrededor o menos de €50.000, con colegios, instalaciones deportivas y centros comerciales a menos de 25 minutos.',
    overviewP2: 'Tres ubicaciones están dentro de la Provincia de Madrid (€0 garantizado), una "trampa en la frontera" en Guadalajara, y la mejor opción en Granada.',
    overviewRegions: '3 × Madrid · 1 × Guadalajara · 1 × Granada',
    locTitle: 'Análisis de ubicaciones',
    locSub: 'Precios de parcela, colegios, compras, deportes y tiempos de desplazamiento de cada opción.',
    plotPrice: 'Precio de parcela',
    plotSize: 'Tamaño de parcela',
    buildCost: 'Obra y equipamiento',
    monthlyExp: 'Gastos mensuales',
    wealthTax: 'Imp. Patrimonio',
    itp: 'Impuesto de compra (ITP)',
    school: 'Colegio',
    mall: 'Compras',
    sports: 'Deportes y pádel',
    commutes: 'Tiempos de desplazamiento',
    openLink: 'Visitar ↗',
    recommended: '★ Recomendado',
    wealthTitle: 'Impuesto sobre el Patrimonio por región',
    wealthSub: 'Para un patrimonio total de €2.300.000 (€2M cartera + €300k vivienda) con reparto 50/50 entre cónyuges.',
    rate: 'Tipo efectivo',
    solidarityNote: 'Impuesto de Solidaridad: no aplica (patrimonio neto inferior a €3M)',
    excluded: 'Regiones excluidas',
    excludedReason: 'Sin bonificación del 100% → Impuesto real a este nivel',
    splitTitle: 'Cómo funciona el reparto 50/50',
    splitSub: 'El Impuesto sobre el Patrimonio en España es estrictamente individual — no hay declaración conjunta para matrimonios.',
    legalCitations: 'Citas legales',
    howItWorks: 'Cómo funciona legalmente',
    preMoveRule: '⚠ Regla crítica: antes de mudarte',
    preMoveSub: 'Evitar el Impuesto de Donaciones (Sucesiones y Donaciones)',
    retirementNote: 'Nota sobre cuentas de jubilación (401k/IRA)',
    activitiesTitle: 'Actividades familiares y extraescolares',
    activitiesSub: 'Cosas divertidas, deportes, música, naturaleza y actividades extraescolares para Clara en cada ubicación.',
    compareTitle: 'Comparativa financiera y presupuestaria',
    compareSub: 'Las cinco alternativas por menos de €50k, asumiendo una obra de €300.000 + equipamiento.',
    colLocation: 'Ubicación',
    colRegion: 'Región',
    colPlot: 'Parcela',
    colItp: 'ITP',
    colBuild: 'Obra',
    colMonthly: 'Mensual',
    colTax: 'Imp. (50/50)',
    colSize: 'Tamaño',
    nextTitle: 'Recomendaciones y próximos pasos',
    nextSub: 'Elige tu prioridad — cada opción gana en una dimensión distinta.',
    pickLabel: 'Opción',
    reasonLabel: 'Por qué',
    footer: 'Investigación recopilada julio 2026 · Las normas fiscales y los precios de parcela son orientativos — verifica con un asesor fiscal y los ayuntamientos locales antes de comprar.',
  },
}

const fmt = (n) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Math.round(n))

export default function App() {
  const [lang, setLang] = useState('es')
  const [active, setActive] = useState('overview')
  const navRef = useRef(null)
  const ui = UI[lang]

  const scrollTo = (id) => {
    setActive(id)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="page">
      <header className="hero" id="hero">
        <div className="hero-bg" />
        <div className="lang-selector">
          <button className={`lang-btn ${lang === 'es' ? 'active' : ''}`} onClick={() => setLang('es')}>ES</button>
          <button className={`lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => setLang('en')}>EN</button>
        </div>
        <div className="hero-content">
          <span className="hero-tag">{ui.heroTag}</span>
          <h1 className="hero-title">
            {lang === 'es' ? 'Jubilación en España' : 'Spain Retirement'}
            <span className="hero-title-accent">{ui.title}</span>
          </h1>
          <p className="hero-sub">{ui.subtitle}</p>
          <div className="hero-stats">
            <div className="stat-pill">
              <span className="stat-num">{meta.portfolio}</span>
              <span className="stat-label">{ui.portfolio}</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-pill">
              <span className="stat-num">{meta.build}</span>
              <span className="stat-label">{ui.build}</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-pill">
              <span className="stat-num">{meta.plotTarget}</span>
              <span className="stat-label">{ui.plotTarget}</span>
            </div>
          </div>
          <button className="hero-cta" onClick={() => scrollTo('overview')}>{lang === 'es' ? 'Ver el análisis →' : 'See the analysis →'}</button>
        </div>
      </header>

      <nav className="tab-bar" ref={navRef}>
        {ui.nav.map((n) => (
          <button key={n.id} className={`tab ${active === n.id ? 'active' : ''}`} onClick={() => scrollTo(n.id)}>
            {n.label}
          </button>
        ))}
      </nav>

      <main className="content">
        <OverviewSection lang={lang} ui={ui} />
        <LocationsSection lang={lang} ui={ui} />
        <ActivitiesSection lang={lang} ui={ui} />
        <WealthSection lang={lang} ui={ui} />
        <SplitSection lang={lang} ui={ui} />
        <CompareSection lang={lang} ui={ui} />
        <NextStepsSection lang={lang} ui={ui} />
      </main>

      <footer className="page-footer">
        <p>{ui.footer}</p>
      </footer>
    </div>
  )
}

function OverviewSection({ lang, ui }) {
  return (
    <section className="section" id="overview">
      <SectionHeader num="01" title={ui.overviewTitle} sub={ui.overviewSub} />
      <p className="lead">{ui.overviewP1}</p>
      <p className="lead">{ui.overviewP2}</p>
      <div className="region-badges">
        <span className="region-badge">📍 3 × {lang === 'es' ? 'Madrid' : 'Madrid'}</span>
        <span className="region-badge">📍 1 × {lang === 'es' ? 'Guadalajara' : 'Guadalajara'}</span>
        <span className="region-badge">📍 1 × {lang === 'es' ? 'Granada' : 'Granada'}</span>
      </div>
      <div className="overview-cards">
        {locations.map((loc) => (
          <article key={loc.id} className={`overview-card ${loc.recommended ? 'recommended' : ''}`}>
            {loc.recommended && <span className="rec-badge">{ui.recommended}</span>}
            <span className="ov-icon">{loc.icon}</span>
            <h3>{lang === 'es' ? loc.nameEs : loc.nameEn}</h3>
            <span className="ov-region">{lang === 'es' ? loc.regionEs : loc.regionEn}</span>
            <p className="ov-tagline">{lang === 'es' ? loc.taglineEs : loc.taglineEn}</p>
            <p className="ov-price">{fmt(loc.plotPrice[0])} – {fmt(loc.plotPrice[1])}</p>
            <p className="ov-size">{loc.plotSize[0]}–{loc.plotSize[1]} m²</p>
            <p className="ov-tax">
              {loc.wealthTax === 0 ? (
                <span className="tax-zero">€0 {lang === 'es' ? 'impuesto' : 'tax'}</span>
              ) : (
                <span className="tax-low">~€122/{lang === 'es' ? 'mes' : 'mo'}</span>
              )}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}

function LocationsSection({ lang, ui }) {
  return (
    <section className="section" id="locations">
      <SectionHeader num="02" title={ui.locTitle} sub={ui.locSub} />
      <div className="loc-list">
        {locations.map((loc, i) => (
          <article key={loc.id} className={`loc-card ${loc.recommended ? 'recommended' : ''}`}>
            {loc.recommended && <span className="rec-badge">{ui.recommended}</span>}
            <div className="loc-header">
              <span className="loc-icon">{loc.icon}</span>
              <div>
                <h3>{lang === 'es' ? loc.nameEs : loc.nameEn}</h3>
                <span className="loc-region">{lang === 'es' ? loc.regionEs : loc.regionEn} — {lang === 'es' ? loc.taglineEs : loc.taglineEn}</span>
              </div>
            </div>
            <div className="loc-grid">
              <div className="loc-fact">
                <dt>{ui.plotPrice}</dt>
                <dd>{fmt(loc.plotPrice[0])} – {fmt(loc.plotPrice[1])}</dd>
              </div>
              <div className="loc-fact">
                <dt>{ui.plotSize}</dt>
                <dd>{loc.plotSize[0]}–{loc.plotSize[1]} m²</dd>
              </div>
              <div className="loc-fact">
                <dt>{ui.buildCost}</dt>
                <dd>~{fmt(loc.buildCost)}</dd>
              </div>
              <div className="loc-fact">
                <dt>{ui.monthlyExp}</dt>
                <dd>~{fmt(loc.monthlyExpenses)}/{lang === 'es' ? 'mes' : 'mo'}</dd>
              </div>
              <div className="loc-fact">
                <dt>{ui.wealthTax}</dt>
                <dd className={loc.wealthTax === 0 ? 'tax-zero' : 'tax-low'}>
                  {loc.wealthTax === 0 ? '€0' : `~${fmt(loc.wealthTax)}/${lang === 'es' ? 'año' : 'yr'}`}
                </dd>
              </div>
              <div className="loc-fact">
                <dt>{ui.itp}</dt>
                <dd>{loc.itpPct}%</dd>
              </div>
            </div>
            <div className="loc-details">
              <div className="loc-row">
                <span className="loc-row-label">🎓 {ui.school}</span>
                <span className="loc-row-val">{lang === 'es' ? loc.schoolEs : loc.schoolEn}</span>
                {loc.schoolUrl && <a href={loc.schoolUrl} target="_blank" rel="noreferrer" className="loc-link">{ui.openLink}</a>}
              </div>
              <div className="loc-row">
                <span className="loc-row-label">🛒 {ui.mall}</span>
                <span className="loc-row-val">{lang === 'es' ? loc.mallEs : loc.mallEn}</span>
                {loc.mallUrl && <a href={loc.mallUrl} target="_blank" rel="noreferrer" className="loc-link">{ui.openLink}</a>}
              </div>
              <div className="loc-row">
                <span className="loc-row-label">🎾 {ui.sports}</span>
                <span className="loc-row-val">{lang === 'es' ? loc.sportsEs : loc.sportsEn}</span>
                {loc.sportsUrl && <a href={loc.sportsUrl} target="_blank" rel="noreferrer" className="loc-link">{ui.openLink}</a>}
              </div>
            </div>
            <div className="commutes">
              <h4 className="commutes-title">🚗 {ui.commutes}</h4>
              {loc.commutes.map((c, ci) => (
                <div key={ci} className="commute-row">
                  <span className="commute-dest">{lang === 'es' ? c.labelEs : c.labelEn}</span>
                  <span className="commute-time">{c.time}</span>
                </div>
              ))}
            </div>
            <p className="loc-recommendation">{lang === 'es' ? loc.recommendationEs : loc.recommendationEn}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function ActivitiesSection({ lang, ui }) {
  return (
    <section className="section" id="activities">
      <SectionHeader num="03" title={ui.activitiesTitle} sub={ui.activitiesSub} />
      <div className="activities-list">
        {locations.map((loc) => (
          <div key={loc.id} className="activities-block">
            <h3 className="activities-loc-title">
              <span className="activities-loc-icon">{loc.icon}</span>
              {lang === 'es' ? loc.nameEs : loc.nameEn}
              <span className="activities-loc-region">· {lang === 'es' ? loc.regionEs : loc.regionEn}</span>
            </h3>
            <div className="activities-grid">
              {loc.activities.map((a, i) => (
                <article key={i} className="activity-card">
                  <span className="activity-icon">{a.icon}</span>
                  <div className="activity-body">
                    <h4>{lang === 'es' ? a.nameEs : a.nameEn}</h4>
                    <p>{lang === 'es' ? a.descEs : a.descEn}</p>
                    {a.url && <a href={a.url} target="_blank" rel="noreferrer" className="activity-link">{ui.openLink}</a>}
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function WealthSection({ lang, ui }) {
  return (
    <section className="section" id="wealth">
      <SectionHeader num="04" title={ui.wealthTitle} sub={ui.wealthSub} />
      <div className="wealth-list">
        {wealthTaxInfo.regions.map((r, i) => (
          <article key={i} className="wealth-card">
            <h3>{lang === 'es' ? r.regionEs : r.regionEn}</h3>
            <p className={`wealth-rate ${r.rateEn.includes('€0') ? 'tax-zero' : 'tax-low'}`}>
              {lang === 'es' ? r.rateEs : r.rateEn}
            </p>
            <p className="wealth-note">{lang === 'es' ? r.noteEs : r.noteEn}</p>
          </article>
        ))}
      </div>
      <div className="excluded-block">
        <h4>{ui.excluded}</h4>
        <div className="excluded-list">
          {wealthTaxInfo.excluded.map((e, i) => (
            <div key={i} className="excluded-item">
              <span className="excluded-region">{lang === 'es' ? e.regionEs : e.regionEn}</span>
              <span className="excluded-reason">{lang === 'es' ? e.reasonEs : e.reasonEn}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function SplitSection({ lang, ui }) {
  const steps = lang === 'es' ? splitRules.howItWorksEs : splitRules.howItWorksEn
  const preMove = lang === 'es' ? splitRules.preMoveRuleEs : splitRules.preMoveRuleEn
  return (
    <section className="section" id="split">
      <SectionHeader num="05" title={ui.splitTitle} sub={ui.splitSub} />
      <h3 className="group-h3">{ui.legalCitations}</h3>
      <div className="citations">
        {splitRules.citations.map((c, i) => (
          <article key={i} className="citation-card">
            <h4>{lang === 'es' ? c.idEs : c.idEn}</h4>
            <p>{lang === 'es' ? c.textEs : c.textEn}</p>
          </article>
        ))}
      </div>
      <h3 className="group-h3">{ui.howItWorks}</h3>
      <ol className="steps-list">
        {steps.map((s, i) => <li key={i}>{s}</li>)}
      </ol>
      <div className="premove-block">
        <h3 className="premove-title">{ui.preMoveRule}</h3>
        <p className="premove-sub">{ui.preMoveSub}</p>
        <ol className="steps-list premove-list">
          {preMove.map((s, i) => <li key={i}>{s}</li>)}
        </ol>
      </div>
      <div className="retirement-note">
        <h4>{ui.retirementNote}</h4>
        <p>{lang === 'es' ? splitRules.retirementNoteEs : splitRules.retirementNoteEn}</p>
      </div>
    </section>
  )
}

function CompareSection({ lang, ui }) {
  return (
    <section className="section" id="compare">
      <SectionHeader num="06" title={ui.compareTitle} sub={ui.compareSub} />
      <div className="compare-table-wrap">
        <table className="compare-table">
          <thead>
            <tr>
              <th>{ui.colLocation}</th>
              <th>{ui.colRegion}</th>
              <th>{ui.colPlot}</th>
              <th>{ui.colSize}</th>
              <th>{ui.colItp}</th>
              <th>{ui.colBuild}</th>
              <th>{ui.colMonthly}</th>
              <th>{ui.colTax}</th>
            </tr>
          </thead>
          <tbody>
            {locations.map((loc) => (
              <tr key={loc.id}>
                <td className="loc-name">{lang === 'es' ? loc.nameEs.split(' (')[0] : loc.nameEn.split(' (')[0]}</td>
                <td>{lang === 'es' ? loc.regionEs : loc.regionEn}</td>
                <td className="price-col">{fmt((loc.plotPrice[0] + loc.plotPrice[1]) / 2)}</td>
                <td>{loc.plotSize[0]}–{loc.plotSize[1]} m²</td>
                <td>{loc.itpPct}%</td>
                <td>~{fmt(loc.buildCost)}</td>
                <td>~{fmt(loc.monthlyExpenses)}</td>
                <td className={loc.wealthTax === 0 ? 'tax-zero' : 'tax-low'}>
                  {loc.wealthTax === 0 ? '€0' : `~${fmt(loc.wealthTax)}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function NextStepsSection({ lang, ui }) {
  const recs = recommendations[lang]
  return (
    <section className="section" id="next">
      <SectionHeader num="07" title={ui.nextTitle} sub={ui.nextSub} />
      <div className="rec-list">
        {recs.map((r, i) => (
          <article key={i} className={`rec-card ${i === recs.length - 1 ? 'best' : ''}`}>
            <h3>{r.title}</h3>
            <div className="rec-pick">
              <span className="rec-label">{ui.pickLabel}:</span>
              <span className="rec-value">{r.pick}</span>
            </div>
            <p className="rec-reason">{r.reason}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

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