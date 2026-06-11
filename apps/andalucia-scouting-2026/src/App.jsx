import { useState } from 'react'
import { content } from './data/content'
import StopCard from './components/StopCard'
import './App.css'

const SECTIONS = {
  en: [
    { id: 'overview', label: 'Overview' },
    { id: 'comparison', label: 'Town Comparison' },
    { id: 'day1', label: 'Day 1 · 12 Aug' },
    { id: 'day2', label: 'Day 2 · 13 Aug' },
    { id: 'day3', label: 'Day 3 · 14 Aug' },
    { id: 'day4', label: 'Day 4 · 15 Aug' },
    { id: 'obra', label: 'Obra Nueva' },
    { id: 'parking', label: 'Parking & Cars' },
    { id: 'supermarkets', label: 'Supermarkets' },
    { id: 'terrenos', label: 'Plots / Land' },
    { id: 'resale', label: 'Resale Condos' },
    { id: 'bases', label: 'Bases' },
    { id: 'food', label: 'Food' },
    { id: 'questions', label: 'Questions' },
    { id: 'caveats', label: 'Caveats' },
  ],
  es: [
    { id: 'overview', label: 'Resumen' },
    { id: 'comparison', label: 'Comparativa' },
    { id: 'day1', label: 'Día 1 · 12 Ago' },
    { id: 'day2', label: 'Día 2 · 13 Ago' },
    { id: 'day3', label: 'Día 3 · 14 Ago' },
    { id: 'day4', label: 'Día 4 · 15 Ago' },
    { id: 'obra', label: 'Obra Nueva' },
    { id: 'parking', label: 'Parking y Coches' },
    { id: 'supermarkets', label: 'Supermercados' },
    { id: 'terrenos', label: 'Parcelas / Suelo' },
    { id: 'resale', label: 'Segunda Mano' },
    { id: 'bases', label: 'Alojamientos' },
    { id: 'food', label: 'Restaurantes' },
    { id: 'questions', label: 'Preguntas' },
    { id: 'caveats', label: 'Advertencias' },
  ]
}

const UI_STRINGS = {
  en: {
    tripGoal: 'Trip Goal',
    strategy: 'Strategy',
    itineraryGlance: 'Itinerary at a Glance',
    strategyP1: 'Three target regions. Two overnight bases. Three pathways evaluated: ',
    strategyP2: 'Obra Nueva',
    strategyP3: 'Suelo Urbano / Terrenos',
    strategyP4: 'Resale',
    strategyP5: ' (new developments), ',
    strategyP6: ' (buildable urban plots), and ',
    strategyP7: ' (existing townhouses, apartments, and villas).',
    openMaps: 'Open in Google Maps ↗',
    openAlt: 'Open alternate ↗',
    backToTop: '↑ back to top',
    type: 'Type',
    units: 'Units',
    priceFrom: 'Price from',
    handover: 'Handover',
    area: 'Area',
    day: 'Day',
    parkingTitle: 'Parking & Vehicle Logistics',
    parkingSub: 'Since you will have 1 or 2 cars, parking convenience is a major quality-of-life factor. Avoid historical centers (cascos históricos) and focus on modern extension zones with wide street profiles where guest and street parking are easy.',
    supermarketsTitle: 'Large-Format Supermarkets',
    supermarketsSub: 'Child + van friendly. Modern formats feature spacious underground or surface parking.',
    plotsTitle: 'Suelo Urbano — Buildable Plots',
    plotsSub: 'Inland Andalucía is where the value-per-m² is highest for buildable urban land. Confirm with each municipality: classification, build coefficient, connection fees.',
    plotsRulesTitle: 'Ley LISTA 2022 — Modular / Industrialised Construction',
    plotsRulesSub: 'Modular and industrialised builds follow identical licensing rules to traditional builds.',
    plotsInlandHeader: 'Granada Vega & Sevilla Aljarafe — €/m² ranges',
    plotsCoastHeader: 'Málaga Eastern Coast — €/m² ranges',
    resaleTitle: 'Resale — Existing Houses & Apartments',
    resaleSub: 'Typical 3-bed property price ranges by area. Granada Vega offers the most affordable townhouses and villas (€210k–€340k), keeping you well under the €380k retirement budget.',
    basesTitle: 'Overnight Bases — Villa Rentals',
    basesSub: 'Book via Airbnb, Vrbo, or a local agency. Filter on "villa" + "private pool" + "parking". The week of 15 August is peak high season — book by April 2026. After booking, message the host to confirm the driveway is wide enough for a 7-seater van.',
    searchFilters: 'Search filters',
    priceBand: 'Price band',
    caution: 'Caution',
    restaurantsTitle: 'Family-Friendly Restaurants',
    restaurantsSub: 'All have parking, kid menus, and no narrow-street approach. August restaurant rotation is real — call 3 days ahead to confirm open.',
    questionsTitle: 'Questions to Ask at Every Stop',
    qObra: 'Obra nueva developer',
    qTerreno: 'Terreno (plot) seller / agent',
    qResale: 'Resale (existing house / apartment)',
    caveatsTitle: "Caveats — What This Plan Doesn't Do",
    researchCompiled: 'Research compiled: ',
    verifyWarning: '. Prices, addresses, and stock may shift — verify each stop 48h before the visit.',
    preTripChecks: 'Pre-trip checks: Confirm rental vehicle specifications, verify developer office hours, and check municipal parking availability.',
    comparisonTitle: 'Suburban Town Comparison',
    comparisonSub: 'A side-by-side analysis of the target towns highlighting property prices, climate comfort, parking convenience, and key pros/cons.',
    climateLabel: 'Climate',
    parkingLabel: 'Parking Logistics',
    prosLabel: 'Pros',
    consLabel: 'Cons',
    viewVideo: 'Watch Video Tour 🎥',
    viewImages: 'View Photos & Streets 📸',
  },
  es: {
    tripGoal: 'Objetivo del Viaje',
    strategy: 'Estrategia',
    itineraryGlance: 'Itinerario Resumido',
    strategyP1: 'Tres regiones objetivo. Dos alojamientos base. Tres vías evaluadas: ',
    strategyP2: 'Obra Nueva',
    strategyP3: 'Suelo Urbano / Terrenos',
    strategyP4: 'Segunda Mano',
    strategyP5: ' (nuevas promociones), ',
    strategyP6: ' (parcelas urbanas edificables) y ',
    strategyP7: ' (apartamentos, adosados y villas existentes).',
    openMaps: 'Abrir en Google Maps ↗',
    openAlt: 'Abrir alternativo ↗',
    backToTop: '↑ volver arriba',
    type: 'Tipo',
    units: 'Unidades',
    priceFrom: 'Precio desde',
    handover: 'Entrega',
    area: 'Zona',
    day: 'Día',
    parkingTitle: 'Parking y Coches en las Zonas',
    parkingSub: 'Dado que dispondrán de 1 o 2 coches, la comodidad del aparcamiento es clave para su calidad de vida. Eviten cascos históricos y céntrense en zonas de expansión con avenidas anchas de fácil estacionamiento.',
    supermarketsTitle: 'Grandes Supermercados',
    supermarketsSub: 'Cómodos para niños y furgonetas. Los formatos grandes cuentan con parkings amplios subterráneos o en superficie.',
    plotsTitle: 'Suelo Urbano — Parcelas Edificables',
    plotsSub: 'La Vega de Granada y el Aljarafe ofrecen una excelente relación calidad/precio para suelo urbano. Confirmar con cada ayuntamiento: clasificación, edificabilidad y tasas.',
    plotsRulesTitle: 'Ley LISTA 2022 — Construcción Modular / Industrializada',
    plotsRulesSub: 'Las construcciones modulares e industrializadas siguen exactamente las mismas normas de licencia que la obra tradicional.',
    plotsInlandHeader: 'Granada Vega y Sevilla Aljarafe — Precios por m²',
    plotsCoastHeader: 'Costa de Málaga Oriental — Precios por m²',
    resaleTitle: 'Segunda Mano — Pisos y Apartamentos',
    resaleSub: 'Rangos de precios típicos para 3 dormitorios. Granada Vega ofrece las opciones más económicas (€110k–€210k), manteniéndose muy por debajo del límite de 380.000 €.',
    basesTitle: 'Alojamientos Base — Alquiler de Villas',
    basesSub: 'Reservar vía Airbnb, Vrbo o agencia local. Filtrar por "villa" + "piscina privada" + "aparcamiento". La semana del 15 de agosto es temporada muy alta — reservar antes de abril de 2026. Tras reservar, confirmar con el anfitrión que la entrada es apta para Clase V.',
    searchFilters: 'Filtros de búsqueda',
    priceBand: 'Rango de precios',
    caution: 'Atención',
    restaurantsTitle: 'Restaurantes Familiares',
    restaurantsSub: 'Todos disponen de parking, menú infantil y accesos cómodos. En agosto hay turnos de vacaciones — llame 3 días antes para confirmar que está abierto.',
    questionsTitle: 'Preguntas para Hacer en Cada Parada',
    qObra: 'Promotora de obra nueva',
    qTerreno: 'Vendedor / agente de parcelas',
    qResale: 'Propiedad de segunda mano',
    caveatsTitle: 'Advertencias — Lo que este plan no incluye',
    researchCompiled: 'Investigación recopilada: ',
    verifyWarning: '. Los precios, direcciones y disponibilidad pueden variar — verifique cada parada 48 horas antes de la visita.',
    preTripChecks: 'Controles previos: Confirmar especificaciones de la furgoneta de alquiler, verificar horarios de oficinas promotoras y disponibilidad de parking municipal.',
    comparisonTitle: 'Comparativa de Municipios',
    comparisonSub: 'Análisis comparativo de los municipios objetivo destacando precios, confort climático, facilidad de aparcamiento y pros/contras.',
    climateLabel: 'Clima',
    parkingLabel: 'Logística de Parking',
    prosLabel: 'Pros',
    consLabel: 'Contras',
    viewVideo: 'Ver Video Tour 🎥',
    viewImages: 'Ver Fotos y Calles 📸',
  }
}

export default function App() {
  const [lang, setLang] = useState('en')
  const [active, setActive] = useState('overview')

  const { tripMeta, overview, townsComparison, days, obraNueva, parkingInfo, supermarkets, bases, restaurants, terrenos, resaleClusters, questions, caveats } = content[lang]
  const ui = UI_STRINGS[lang]
  const sections = SECTIONS[lang]

  const onNav = (id) => {
    setActive(id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="app">
      <header className="app-header" style={{ position: 'relative' }}>
        <div className="lang-selector">
          <button className={`lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => setLang('en')}>EN</button>
          <button className={`lang-btn ${lang === 'es' ? 'active' : ''}`} onClick={() => setLang('es')}>ES</button>
        </div>
        <h1>{tripMeta.title}</h1>
        <p className="subtitle">{tripMeta.dates} · {tripMeta.party}</p>
        <p className="context">{tripMeta.vehicle} · {tripMeta.origin} → {tripMeta.return}</p>
      </header>

      <nav className="tab-bar" aria-label="Sections">
        {sections.map(s => (
          <button
            key={s.id}
            type="button"
            className={`tab ${active === s.id ? 'active' : ''}`}
            onClick={() => onNav(s.id)}
          >
            {s.label}
          </button>
        ))}
      </nav>

      <main className="content">
        {active === 'overview' && <OverviewSection overview={overview} days={days} ui={ui} />}
        {active === 'comparison' && <ComparisonSection townsComparison={townsComparison} ui={ui} />}
        {active === 'day1' && <DaySection day={days[0]} lang={lang} />}
        {active === 'day2' && <DaySection day={days[1]} lang={lang} />}
        {active === 'day3' && <DaySection day={days[2]} lang={lang} />}
        {active === 'day4' && <DaySection day={days[3]} lang={lang} />}
        {active === 'obra' && <ObraSection obraNueva={obraNueva} ui={ui} />}
        {active === 'parking' && <ParkingSection parkingInfo={parkingInfo} ui={ui} />}
        {active === 'supermarkets' && <SupermarketsSection supermarkets={supermarkets} ui={ui} />}
        {active === 'terrenos' && <TerrenosSection terrenos={terrenos} ui={ui} />}
        {active === 'resale' && <ResaleSection resaleClusters={resaleClusters} ui={ui} />}
        {active === 'bases' && <BasesSection bases={bases} ui={ui} />}
        {active === 'food' && <FoodSection restaurants={restaurants} ui={ui} />}
        {active === 'questions' && <QuestionsSection questions={questions} ui={ui} />}
        {active === 'caveats' && <CaveatsSection caveats={caveats} ui={ui} />}
      </main>

      <footer className="app-footer">
        <p>{ui.researchCompiled}{tripMeta.researchDate}{ui.verifyWarning}</p>
        <p>{ui.preTripChecks}</p>
        <p><a className="footer-link" href={`${import.meta.env.BASE_URL}`}>↑ {ui.backToTop}</a></p>
      </footer>
    </div>
  )
}

function OverviewSection({ overview, days, ui }) {
  return (
    <section>
      <h2 className="section-h2">{ui.tripGoal}</h2>
      <p className="lead">{overview.goal}</p>

      <h2 className="section-h2">{ui.strategy}</h2>
      <p className="lead">
        {ui.strategyP1}
        <strong>{ui.strategyP2}</strong>{ui.strategyP5}
        <strong>{ui.strategyP3}</strong>{ui.strategyP6}
        <strong>{ui.strategyP4}</strong>{ui.strategyP7}
      </p>

      <div className="cluster-grid">
        {overview.clusters.map(c => (
          <div key={c.id} className="cluster-card">
            <h3>{c.name}</h3>
            <p className="cluster-meta">{c.nights} {ui.nights} · {ui.base}: {c.base}</p>
            <ul>
              {c.strongFor.map(s => <li key={s}>{s}</li>)}
            </ul>
          </div>
        ))}
      </div>

      <h2 className="section-h2">{ui.itineraryGlance}</h2>
      <div className="day-grid">
        {days.map(d => (
          <div key={d.id} className="day-mini">
            <div className="day-mini-head">
              <span className="day-mini-num">Day {d.number}</span>
              <span className="day-mini-date">{d.weekday} {d.date}</span>
            </div>
            <h4>{d.title}</h4>
            <p>{d.subtitle}</p>
            <div className="day-mini-stats">
              <span>🚐 {d.driveKm} km · {d.driveHours} h</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function ComparisonSection({ townsComparison, ui }) {
  return (
    <section>
      <h2 className="section-h2">{ui.comparisonTitle}</h2>
      <p className="lead">{ui.comparisonSub}</p>
      <div className="comparison-grid">
        {townsComparison.map((t, i) => (
          <article key={i} className="comparison-card">
            <header className="comparison-header">
              <h3>{t.name} <span className="province-tag">({t.province})</span></h3>
              <span className="price-tag">{t.price}</span>
            </header>
            <div className="comparison-meta">
              <p>🌤️ <strong>{ui.climateLabel}:</strong> {t.climate}</p>
              <p>🚗 <strong>{ui.parkingLabel}:</strong> {t.parking}</p>
            </div>
            <div className="comparison-actions" style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
              {t.video && <a className="maps-btn" href={t.video} target="_blank" rel="noreferrer" style={{ flex: 1, textAlign: 'center', fontSize: '0.72rem', padding: '5px 8px' }}>{ui.viewVideo}</a>}
              {t.images && <a className="maps-btn secondary" href={t.images} target="_blank" rel="noreferrer" style={{ flex: 1, textAlign: 'center', fontSize: '0.72rem', padding: '5px 8px', margin: 0 }}>{ui.viewImages}</a>}
            </div>
            <div className="pros-cons">
              <div className="pros-block">
                <h4 className="pros-h4">✓ {ui.prosLabel}</h4>
                <ul>
                  {t.pros.map((p, idx) => <li key={idx}>{p}</li>)}
                </ul>
              </div>
              <div className="cons-block">
                <h4 className="cons-h4">✗ {ui.consLabel}</h4>
                <ul>
                  {t.cons.map((c, idx) => <li key={idx}>{c}</li>)}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function DaySection({ day, lang }) {
  return (
    <section>
      <div className="day-header">
        <span className="day-pill">Day {day.number}</span>
        <span className="day-pill">{day.weekday} {day.date}</span>
        <span className="day-pill">🚐 {day.driveKm} km · {day.driveHours} h</span>
      </div>
      <h2 className="section-h2">{day.title}</h2>
      <p className="lead">{day.subtitle}</p>

      <div className="stops">
        {day.sections.map((s, i) => (
          <StopCard key={i} stop={s} lang={lang} />
        ))}
      </div>
    </section>
  )
}

function ObraSection({ obraNueva, ui }) {
  return (
    <section>
      <h2 className="section-h2">{ui.strategyP2}</h2>
      <p className="lead">{ui.parkingSub}</p>
      <div className="card-list">
        {obraNueva.map((d, i) => (
          <article key={i} className="dev-card">
            <header>
              <h3>{d.name}</h3>
              <span className="dev-day">{ui.day} {d.day}</span>
            </header>
            <p className="dev-developer">{d.developer}</p>
            <dl className="dev-facts">
              <div><dt>{ui.type}</dt><dd>{d.type}</dd></div>
              <div><dt>{ui.units}</dt><dd>{d.units}</dd></div>
              <div><dt>{ui.priceFrom}</dt><dd>{d.priceFrom}</dd></div>
              <div><dt>{ui.handover}</dt><dd>{d.handover}</dd></div>
              <div><dt>{ui.area}</dt><dd>{d.area}</dd></div>
            </dl>
            <a className="maps-btn" href={d.maps} target="_blank" rel="noreferrer">{ui.openMaps}</a>
          </article>
        ))}
      </div>
    </section>
  )
}

function ParkingSection({ parkingInfo, ui }) {
  return (
    <section>
      <h2 className="section-h2">{ui.parkingTitle}</h2>
      <p className="lead">{ui.parkingSub}</p>
      <div className="card-list">
        {parkingInfo.map((p, i) => (
          <article key={i} className="supermarket-card">
            <h3>{p.town}</h3>
            <p className="super-addr">🚗 {p.parkingScore} · {ui.difficulty}: {p.difficulty}</p>
            <p className="super-note">{p.note}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function SupermarketsSection({ supermarkets, ui }) {
  const groups = [
    { id: 'granada', label: 'Granada Vega (Las Gabias / Churriana / Armilla)' },
    { id: 'coast', label: 'Málaga Eastern Coast (Torre del Mar)' },
    { id: 'sevilla', label: 'Sevilla Aljarafe (Bormujos)' },
  ]
  return (
    <section>
      <h2 className="section-h2">{ui.supermarketsTitle}</h2>
      <p className="lead">{ui.supermarketsSub}</p>
      {groups.map(g => (
        <div key={g.id}>
          <h3 className="group-h3">{g.label}</h3>
          <div className="card-list">
            {supermarkets.filter(s => s.cluster === g.id).map((s, i) => (
              <article key={i} className="supermarket-card">
                <h3>{s.name}</h3>
                <p className="super-addr">{s.address}</p>
                <p className="super-note">{s.note}</p>
                <a className="maps-btn" href={s.maps} target="_blank" rel="noreferrer">{ui.openMaps}</a>
              </article>
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}

function TerrenosSection({ terrenos, ui }) {
  return (
    <section>
      <h2 className="section-h2">{ui.plotsTitle}</h2>
      <p className="lead">{ui.plotsSub}</p>

      <h3 className="group-h3">{ui.plotsRulesTitle}</h3>
      <ul className="rules-list">
        {terrenos.rules.map((r, i) => <li key={i}>{r}</li>)}
      </ul>

      <h3 className="group-h3">{ui.plotsInlandHeader}</h3>
      <div className="card-list">
        {terrenos.inland.map((t, i) => (
          <article key={i} className="terreno-card">
            <h3>{t.name}</h3>
            <p className="terreno-muni">{t.municipality}</p>
            <p className="terreno-price">€{t.price}/m²</p>
            <p className="terreno-note">{t.note}</p>
          </article>
        ))}
      </div>

      <h3 className="group-h3">{ui.plotsCoastHeader}</h3>
      <div className="card-list">
        {terrenos.coast.map((t, i) => (
          <article key={i} className="terreno-card">
            <h3>{t.name}</h3>
            <p className="terreno-muni">{t.municipality}</p>
            <p className="terreno-price">€{t.price}/m²</p>
            <p className="terreno-note">{t.note}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function ResaleSection({ resaleClusters, ui }) {
  return (
    <section>
      <h2 className="section-h2">{ui.resaleTitle}</h2>
      <p className="lead">{ui.resaleSub}</p>
      {resaleClusters.map((c, i) => (
        <div key={i}>
          <h3 className="group-h3">{c.cluster}</h3>
          <p className="cluster-subtitle">{c.subtitle}</p>
          <div className="resale-table-wrapper">
            <table className="resale-table">
              <thead>
                <tr>
                  <th>{ui.urbanization}</th>
                  <th>{ui.type}</th>
                  <th>{ui.price}</th>
                </tr>
              </thead>
              <tbody>
                {c.entries.map((e, j) => (
                  <tr key={j}>
                    <td>{e.urbanization}</td>
                    <td>{e.type}</td>
                    <td className="price-col">{e.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </section>
  )
}

function BasesSection({ bases, ui }) {
  return (
    <section>
      <h2 className="section-h2">{ui.basesTitle}</h2>
      <p className="lead">{ui.basesSub}</p>
      <div className="card-list">
        {bases.map((b, i) => (
          <article key={i} className="base-card">
            <header>
              <h3>{b.name}</h3>
              <span className="base-nights">{b.nights}</span>
            </header>
            <p className="base-why">{b.why}</p>
            <dl className="base-facts">
              <div><dt>{ui.searchFilters}</dt><dd>{b.filters}</dd></div>
              <div><dt>{ui.priceBand}</dt><dd>{b.priceBand}</dd></div>
              <div><dt>{ui.caution}</dt><dd>{b.caution}</dd></div>
            </dl>
            <a className="maps-btn" href={b.maps} target="_blank" rel="noreferrer">{ui.openMaps}</a>
          </article>
        ))}
      </div>
    </section>
  )
}

function FoodSection({ restaurants, ui }) {
  return (
    <section>
      <h2 className="section-h2">{ui.restaurantsTitle}</h2>
      <p className="lead">{ui.restaurantsSub}</p>
      <div className="card-list">
        {restaurants.map((r, i) => (
          <article key={i} className="food-card">
            <header>
              <h3>{r.name}</h3>
              <span className="food-when">{r.when}</span>
            </header>
            <p className="food-area">{r.area}</p>
            <a className="maps-btn" href={r.maps} target="_blank" rel="noreferrer">{ui.openMaps}</a>
          </article>
        ))}
      </div>
    </section>
  )
}

function QuestionsSection({ questions, ui }) {
  return (
    <section>
      <h2 className="section-h2">{ui.questionsTitle}</h2>

      <h3 className="group-h3">{ui.qObra}</h3>
      <ol className="q-list">
        {questions.obraNueva.map((q, i) => <li key={i}>{q}</li>)}
      </ol>

      <h3 className="group-h3">{ui.qTerreno}</h3>
      <ol className="q-list">
        {questions.terreno.map((q, i) => <li key={i}>{q}</li>)}
      </ol>

      <h3 className="group-h3">{ui.qResale}</h3>
      <ol className="q-list">
        {questions.resale.map((q, i) => <li key={i}>{q}</li>)}
      </ol>
    </section>
  )
}

function CaveatsSection({ caveats, ui }) {
  return (
    <section>
      <h2 className="section-h2">{ui.caveatsTitle}</h2>
      <ul className="caveat-list">
        {caveats.map((c, i) => <li key={i}>{c}</li>)}
      </ul>
    </section>
  )
}
