import { useEffect, useMemo, useState } from 'react'
import {
  FULL_DAY_ROUTE,
  MALL_BENCHMARKS,
  REQUIREMENTS,
  TOWNS,
  VERDICT_OPTIONS,
  mapsDriveUrl,
  mapsMultiStopUrl,
  mapsPlaceUrl,
} from './data.js'

const STORAGE_KEY = 'visita-valladolid-familia-v1'

const EMPTY_SIGHTING = {
  kind: 'casa',
  townId: 'arroyo',
  address: '',
  agencyOrPromo: '',
  askingPrice: '',
  builtArea: '',
  usableArea: '',
  extrasNote: '',
  handoverDate: '',
  handoverStatus: 'desconocida',
  handoverSource: '',
  plotArea: '',
  landStatus: 'por-confirmar',
  highlights: '',
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { townNotes: {}, sightings: [] }
    const parsed = JSON.parse(raw)
    return {
      townNotes: parsed.townNotes || {},
      sightings: Array.isArray(parsed.sightings) ? parsed.sightings : [],
    }
  } catch {
    return { townNotes: {}, sightings: [] }
  }
}

function getTownById(id) {
  return TOWNS.find((t) => t.id === id)
}

function getVerdict(id) {
  return VERDICT_OPTIONS.find((v) => v.id === id) || null
}

function buildShareReport(townNotes, sightings) {
  const lines = []
  lines.push('VISITA A VALLADOLID — OBSERVACIONES DE LA FAMILIA')
  lines.push('Para Jorge, Marisa y Clara')
  lines.push('================================================')
  lines.push('')

  const visitedOrNoted = TOWNS.filter((t) => {
    const n = townNotes[t.id]
    return (
      n &&
      (n.visited ||
        n.verdict ||
        n.feel ||
        n.walkability ||
        n.noise ||
        n.mallMinutes ||
        n.fees ||
        (n.notes && n.notes.trim()))
    )
  })

  if (visitedOrNoted.length === 0) {
    lines.push('Todavía no hay pueblos anotados.')
  } else {
    lines.push(`PUEBLOS REVISADOS (${visitedOrNoted.length})`)
    lines.push('')
    visitedOrNoted.forEach((town) => {
      const n = townNotes[town.id] || {}
      const v = getVerdict(n.verdict)
      const status = n.visited ? 'Visitado' : 'Con notas'
      lines.push(`• ${town.name} [${status}]${v ? ` — ${v.emoji} ${v.label}` : ''}`)
      const chips = []
      if (n.feel) chips.push(`Ambiente: ${n.feel}`)
      if (n.walkability) chips.push(`A pie: ${n.walkability}`)
      if (n.noise) chips.push(`Ruido/tráfico: ${n.noise}`)
      if (n.mallMinutes) chips.push(`C. comercial real: ${n.mallMinutes} min`)
      if (chips.length > 0) lines.push(`  ${chips.join(' | ')}`)
      if (n.fees && n.fees.trim()) lines.push(`  Cuotas/urbanización: ${n.fees.trim()}`)
      if (n.notes && n.notes.trim()) lines.push(`  Notas: ${n.notes.trim()}`)
      lines.push('')
    })
  }

  if (sightings.length > 0) {
    lines.push(`CASAS Y PARCELAS VISTAS (${sightings.length})`)
    lines.push('')
    sightings.forEach((s, idx) => {
      const town = getTownById(s.townId)
      const kindLabel =
        s.kind === 'obra-nueva'
          ? 'Obra nueva'
          : s.kind === 'parcela'
          ? 'Parcela / Solar'
          : 'Casa / Chalet'
      lines.push(`${idx + 1}. [${kindLabel}] ${town ? town.name : s.townId}`)
      if (s.address) lines.push(`   Dirección / zona: ${s.address}`)
      if (s.agencyOrPromo) lines.push(`   Agencia / promotora: ${s.agencyOrPromo}`)
      if (s.askingPrice) {
        lines.push(`   Precio pedido (sin impuestos ni extras): ${s.askingPrice}`)
      }
      if (s.kind !== 'parcela' && (s.builtArea || s.usableArea)) {
        const areas = []
        if (s.builtArea) areas.push(`Construidos: ${s.builtArea}`)
        if (s.usableArea) areas.push(`Útiles: ${s.usableArea}`)
        lines.push(`   Superficie: ${areas.join(' · ')}`)
      }
      if (s.kind === 'obra-nueva') {
        const handoverText =
          s.handoverStatus === 'desconocida' || !s.handoverDate
            ? 'Desconocida'
            : `${s.handoverDate} (${s.handoverStatus === 'estimada' ? 'estimada' : 'publicada'})`
        lines.push(
          `   Entrega de llaves (fase/unidad): ${handoverText}${
            s.handoverSource ? ` · Fuente: ${s.handoverSource}` : ''
          }`
        )
      }
      if (s.kind === 'parcela') {
        const landLabels = {
          urbano: 'Urbano / solar residencial',
          urbanizable: 'Urbanizable (no listo para construir)',
          rustico: 'Rústico (no edificable)',
          'por-confirmar': 'Por confirmar en ayuntamiento',
        }
        lines.push(
          `   Parcela: ${s.plotArea || 'm² sin confirmar'} · Suelo: ${
            landLabels[s.landStatus] || s.landStatus
          }`
        )
      }
      if (s.extrasNote) lines.push(`   Impuestos / extras / arreglos aparte: ${s.extrasNote}`)
      if (s.highlights) lines.push(`   Qué llamó la atención: ${s.highlights}`)
      lines.push('')
    })
  }

  return lines.join('\n').trim()
}

export default function App() {
  const initial = useMemo(() => loadState(), [])
  const [activeTab, setActiveTab] = useState('rutas')
  const [selectedTownId, setSelectedTownId] = useState(null)
  const [townFilter, setTownFilter] = useState('todos')
  const [reqSection, setReqSection] = useState('todo')

  const [extraStops, setExtraStops] = useState({
    aldeamayor: false,
    herrera: false,
    cisterniga: false,
  })
  const [cityVisited, setCityVisited] = useState(false)

  const [townNotes, setTownNotes] = useState(initial.townNotes)
  const [sightings, setSightings] = useState(initial.sightings)

  const [showSightingForm, setShowSightingForm] = useState(false)
  const [sightingDraft, setSightingDraft] = useState(EMPTY_SIGHTING)
  const [copiedReport, setCopiedReport] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ townNotes, sightings }))
    } catch {
      // ignore storage quota errors
    }
  }, [townNotes, sightings])

  const updateTownNote = (townId, patch) => {
    setTownNotes((prev) => ({
      ...prev,
      [townId]: {
        ...(prev[townId] || {}),
        ...patch,
      },
    }))
  }

  const toggleChecklistItem = (townId, idx) => {
    setTownNotes((prev) => {
      const current = prev[townId] || {}
      const checks = { ...(current.checks || {}) }
      checks[idx] = !checks[idx]
      return {
        ...prev,
        [townId]: { ...current, checks },
      }
    })
  }

  const openTown = (townId) => {
    setSelectedTownId(townId)
    setActiveTab('pueblos')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openSightingForTown = (townId) => {
    setSightingDraft({ ...EMPTY_SIGHTING, townId: townId || 'arroyo' })
    setShowSightingForm(true)
    setActiveTab('notas')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const saveSighting = (e) => {
    e.preventDefault()
    if (!sightingDraft.address.trim() && !sightingDraft.highlights.trim()) return
    const entry = {
      ...sightingDraft,
      id: `s-${Date.now()}`,
      createdAt: new Date().toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
      }),
    }
    setSightings((prev) => [entry, ...prev])
    setSightingDraft(EMPTY_SIGHTING)
    setShowSightingForm(false)
  }

  const deleteSighting = (id) => {
    setSightings((prev) => prev.filter((item) => item.id !== id))
  }

  const routeTownIds = useMemo(
    () => FULL_DAY_ROUTE.baseStops.filter((s) => s.type === 'town').map((s) => s.townId),
    []
  )

  const mainVisitedCount = routeTownIds.filter((id) => townNotes[id]?.visited).length

  const totalNotedCount =
    TOWNS.filter((t) => {
      const n = townNotes[t.id]
      return n && (n.visited || n.verdict || (n.notes && n.notes.trim()))
    }).length + sightings.length

  // Construir la ruta única de día completo con los desvíos opcionales activos
  const activeRouteStops = useMemo(() => {
    const extras = FULL_DAY_ROUTE.optionalStops.filter((s) => extraStops[s.id])
    return [...FULL_DAY_ROUTE.baseStops, ...extras]
  }, [extraStops])

  const activeRouteLegs = useMemo(() => {
    const legs = []
    for (let i = 0; i < activeRouteStops.length - 1; i++) {
      const fromId = activeRouteStops[i].id
      const toId = activeRouteStops[i + 1].id
      legs.push(
        FULL_DAY_ROUTE.legs[`${fromId}->${toId}`] || 'Tramo directo por carreteras locales'
      )
    }
    return legs
  }, [activeRouteStops])

  const activeRouteMapsUrl = useMemo(() => {
    const queries = []
    activeRouteStops.forEach((s) => {
      if (s.id === 'valladolid-ciudad') {
        queries.push('Centro Comercial Vallsur, Paseo de Zorrilla, Valladolid')
        queries.push('Campo Grande, Valladolid')
      } else {
        queries.push(s.mapsQuery)
      }
    })
    return mapsMultiStopUrl(queries)
  }, [activeRouteStops])

  const hasOptionalSelected = Object.values(extraStops).some(Boolean)

  const filteredTowns = useMemo(() => {
    return TOWNS.filter((t) => {
      if (townFilter === 'ruta') return routeTownIds.includes(t.id)
      if (townFilter === 'extras') return !routeTownIds.includes(t.id)
      if (townFilter === 'pendientes') return !townNotes[t.id]?.visited
      return true
    })
  }, [townFilter, townNotes, routeTownIds])

  const reportText = useMemo(
    () => buildShareReport(townNotes, sightings),
    [townNotes, sightings]
  )

  const handleCopyReport = async () => {
    try {
      await navigator.clipboard.writeText(reportText)
      setCopiedReport(true)
      setTimeout(() => setCopiedReport(false), 2400)
    } catch {
      const area = document.createElement('textarea')
      area.value = reportText
      document.body.appendChild(area)
      area.select()
      document.execCommand('copy')
      document.body.removeChild(area)
      setCopiedReport(true)
      setTimeout(() => setCopiedReport(false), 2400)
    }
  }

  const handleDownloadReport = () => {
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'visita-valladolid-observaciones.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const selectedTown = selectedTownId ? getTownById(selectedTownId) : null

  return (
    <div className="guide-shell">
      {/* Cabecera cálida y clara */}
      <header className="guide-header">
        <div className="guide-header-inner">
          <div className="brand-block">
            <span className="brand-eyebrow">Guía de campo · Jorge, Marisa y Clara</span>
            <h1>Visita a Valladolid: guía para la familia</h1>
          </div>
          <div className="header-status">
            <span className="progress-pill">
              <span className="progress-dot" />
              {mainVisitedCount} de {routeTownIds.length} pueblos de la ruta visitados
            </span>
          </div>
        </div>

        {/* Navegación superior en escritorio */}
        <nav className="desktop-nav" aria-label="Secciones principales">
          <button
            className={activeTab === 'rutas' ? 'active' : ''}
            onClick={() => {
              setActiveTab('rutas')
              setSelectedTownId(null)
            }}
          >
            🧭 Ruta del día
          </button>
          <button
            className={activeTab === 'pueblos' ? 'active' : ''}
            onClick={() => setActiveTab('pueblos')}
          >
            🏡 Pueblos y barrios
          </button>
          <button
            className={activeTab === 'requisitos' ? 'active' : ''}
            onClick={() => {
              setActiveTab('requisitos')
              setSelectedTownId(null)
            }}
          >
            📋 Qué buscamos
          </button>
          <button
            className={activeTab === 'notas' ? 'active' : ''}
            onClick={() => {
              setActiveTab('notas')
              setSelectedTownId(null)
            }}
          >
            ✍️ Notas y envío
            {totalNotedCount > 0 && <span className="nav-count">{totalNotedCount}</span>}
          </button>
        </nav>
      </header>

      <main className="guide-main">
        {/* ==================== PESTAÑA 1: RUTA DEL DÍA ==================== */}
        {activeTab === 'rutas' && (
          <div className="stack-lg">
            <section className="intro-note">
              <p>
                Una única <strong>ruta de día completo</strong> en orden geográfico para llevar en
                el móvil: recorre <strong>5 pueblos (incluido Zaratán)</strong>, hace pausa al
                mediodía en <strong>Valladolid ciudad y Vallsur</strong>, y pasa también por{' '}
                <strong>RÍO Shopping</strong> para comprobar distancias reales sin dar rodeos.
              </p>
            </section>

            {/* Ruta única de todo el día */}
            <section className="shortcut-card full-day-card">
              <div className="shortcut-head">
                <div className="town-badges">
                  <span className="eyebrow-tag green">Ruta única · Día completo</span>
                  <span className="eyebrow-tag amber">
                    {5 + Object.values(extraStops).filter(Boolean).length} pueblos + Valladolid y
                    centros comerciales
                  </span>
                </div>
                <h2>{FULL_DAY_ROUTE.title}</h2>
                <p>{FULL_DAY_ROUTE.subtitle}</p>
              </div>

              <div className="route-chain">
                {activeRouteStops.map((stop, idx) => {
                  const isTown = stop.type === 'town'
                  const isCity = stop.type === 'city'
                  const isOpt = idx >= FULL_DAY_ROUTE.baseStops.length
                  const visited = isTown ? Boolean(townNotes[stop.townId]?.visited) : cityVisited
                  return (
                    <div className="chain-item" key={stop.id}>
                      <div
                        className={`loop-stop-row ${visited ? 'is-visited' : ''} ${
                          isCity ? 'is-city-stop' : ''
                        } ${isOpt ? 'is-optional' : ''}`}
                      >
                        <button
                          type="button"
                          className="check-circle"
                          aria-label={`Marcar ${stop.title} como visitado`}
                          onClick={() =>
                            isTown
                              ? updateTownNote(stop.townId, { visited: !visited })
                              : setCityVisited((v) => !v)
                          }
                        >
                          {visited ? '✓' : idx + 1}
                        </button>

                        {isTown ? (
                          <button
                            type="button"
                            className="stop-main-btn"
                            onClick={() => openTown(stop.townId)}
                          >
                            <span className="moment-label">{stop.moment}</span>
                            <strong>
                              {stop.title} {isOpt && <em className="opt-tag">Extra</em>}
                            </strong>
                            <small>{stop.subtitle}</small>
                          </button>
                        ) : (
                          <div className="stop-main-btn static-stop">
                            <span className="moment-label city">{stop.moment}</span>
                            <strong>{stop.title}</strong>
                            <small>{stop.subtitle}</small>
                            <div className="city-quick-links">
                              {stop.cityPlaces.map((place) => (
                                <a
                                  key={place.label}
                                  className="mini-map-chip"
                                  href={mapsPlaceUrl(place.query)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  📍 {place.label} ↗
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {isTown && (
                          <button
                            type="button"
                            className="mini-link-btn"
                            onClick={() => openTown(stop.townId)}
                          >
                            Ficha →
                          </button>
                        )}
                      </div>

                      {activeRouteLegs[idx] && (
                        <div className="chain-leg">🚗 {activeRouteLegs[idx]}</div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Desvíos opcionales si sobra tarde */}
              <div className="detour-box">
                <span className="detour-title">
                  Si os sobra tarde tras Boecillo, podéis añadir paradas opcionales a la ruta:
                </span>
                <div className="detour-toggles">
                  {FULL_DAY_ROUTE.optionalStops.map((opt) => (
                    <label
                      key={opt.id}
                      className={`detour-pill ${extraStops[opt.id] ? 'active' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(extraStops[opt.id])}
                        onChange={(e) =>
                          setExtraStops((prev) => ({ ...prev, [opt.id]: e.target.checked }))
                        }
                      />
                      <span>+ {getTownById(opt.townId)?.shortName || opt.title}</span>
                    </label>
                  ))}
                </div>
              </div>

              <p className="drive-total">
                ⏱️{' '}
                {hasOptionalSelected
                  ? FULL_DAY_ROUTE.driveSummaryWithExtras
                  : FULL_DAY_ROUTE.driveSummaryBase}
              </p>

              <div className="card-footer-actions">
                <a
                  className="btn btn-primary"
                  href={activeRouteMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  🗺️ Abrir ruta completa del día en Google Maps
                </a>
              </div>
            </section>

            {/* Referencias de Centros Comerciales */}
            <section className="mall-strip">
              <h3>Centros comerciales incluidos como referencia (máximo ~20 min en coche)</h3>
              <div className="mall-cards">
                {Object.values(MALL_BENCHMARKS).map((mall) => (
                  <div className="mall-card" key={mall.id}>
                    <div>
                      <strong>{mall.name}</strong>
                      <p>{mall.shortDesc}</p>
                    </div>
                    <a
                      className="btn btn-ghost"
                      href={mapsPlaceUrl(mall.mapsQuery)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ver en Maps ↗
                    </a>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ==================== PESTAÑA 2: PUEBLOS ==================== */}
        {activeTab === 'pueblos' && !selectedTown && (
          <div className="stack-md">
            <div className="section-intro-row">
              <div>
                <h2>Pueblos y barrios a explorar</h2>
                <p className="muted">
                  Toca cualquier pueblo para ver qué zonas comparar, los enlaces a Idealista y
                  apuntar tus impresiones.
                </p>
              </div>
            </div>

            <div className="filter-row" role="tablist" aria-label="Filtrar pueblos">
              {[
                { id: 'todos', label: 'Todos (8)' },
                { id: 'ruta', label: 'En la ruta del día (5)' },
                { id: 'extras', label: 'Extras opcionales (3)' },
                { id: 'pendientes', label: 'Pendientes' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`pill-btn ${townFilter === f.id ? 'active' : ''}`}
                  onClick={() => setTownFilter(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="town-grid">
              {filteredTowns.map((town) => {
                const note = townNotes[town.id] || {}
                const verdict = getVerdict(note.verdict)
                return (
                  <article
                    key={town.id}
                    className={`town-card ${note.visited ? 'visited' : ''} ${
                      town.priority === 'opcional' ? 'optional' : ''
                    }`}
                  >
                    <div className="town-card-top">
                      <div className="town-badges">
                        <span
                          className={`eyebrow-tag ${
                            routeTownIds.includes(town.id) ? 'green' : 'soft'
                          }`}
                        >
                          {town.badge}
                        </span>
                        {routeTownIds.includes(town.id) && (
                          <span className="eyebrow-tag amber">En la ruta del día</span>
                        )}
                      </div>
                      {note.visited && <span className="visited-badge">✓ Visitado</span>}
                    </div>

                    <h3>{town.name}</h3>
                    <p className="town-tagline">{town.tagline}</p>

                    <div className="town-quick-facts">
                      <span>
                        📍 <strong>Comparar:</strong> {town.stops.map((s) => s.name).join(' vs. ')}
                      </span>
                      <span>
                        🛍️ <strong>Referencia:</strong>{' '}
                        {town.mallRefs.map((m) => `${m.label} (${m.estimate})`).join(' · ')}
                      </span>
                    </div>

                    {verdict && (
                      <div className={`verdict-banner tone-${verdict.tone}`}>
                        {verdict.emoji} Vuestra valoración: <strong>{verdict.label}</strong>
                      </div>
                    )}

                    <div className="town-card-actions">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => openTown(town.id)}
                      >
                        Abrir ficha y notas →
                      </button>
                      <a
                        className="btn btn-ghost"
                        href={town.idealistaLinks[0].url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Idealista ↗
                      </a>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        )}

        {/* ==================== FICHA DETALLADA DE UN PUEBLO ==================== */}
        {activeTab === 'pueblos' && selectedTown && (
          <TownDetailView
            town={selectedTown}
            note={townNotes[selectedTown.id] || {}}
            onBack={() => setSelectedTownId(null)}
            onSelectTown={(id) => openTown(id)}
            onUpdateNote={(patch) => updateTownNote(selectedTown.id, patch)}
            onToggleCheck={(idx) => toggleChecklistItem(selectedTown.id, idx)}
            onAddSighting={() => openSightingForTown(selectedTown.id)}
          />
        )}

        {/* ==================== PESTAÑA 3: QUÉ BUSCAMOS ==================== */}
        {activeTab === 'requisitos' && (
          <div className="stack-lg">
            <div className="req-hero">
              <span className="eyebrow-tag green">Referencia rápida en ruta</span>
              <h2>Qué buscamos en Valladolid</h2>
              <p>
                Guía práctica de lo que necesita nuestra casa (o parcela) para que podáis
                consultarlo sobre la marcha sin tener que recordar detalles de memoria.
              </p>

              <div className="key-numbers-bar">
                <div className="key-num">
                  <strong>≤ 350.000 €</strong>
                  <span>Tope Valladolid</span>
                </div>
                <div className="key-num">
                  <strong>≥ 3 dorm.</strong>
                  <span>~110–120 m² o más</span>
                </div>
                <div className="key-num">
                  <strong>~20 min</strong>
                  <span>A RÍO o Vallsur</span>
                </div>
                <div className="key-num">
                  <strong>≤ 120.000 €</strong>
                  <span>Solar &gt; 200 m²</span>
                </div>
              </div>
            </div>

            <div className="filter-row">
              {[
                { id: 'todo', label: 'Ver todo' },
                { id: 'imprescindibles', label: 'Imprescindibles (7)' },
                { id: 'preferencias', label: 'Preferencias (5)' },
                { id: 'hallazgo', label: 'Si veis casa o parcela (4)' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`pill-btn ${reqSection === s.id ? 'active' : ''}`}
                  onClick={() => setReqSection(s.id)}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {(reqSection === 'todo' || reqSection === 'imprescindibles') && (
              <section className="req-section">
                <h3>1. Imprescindibles</h3>
                <div className="req-list">
                  {REQUIREMENTS.mustHaves.map((item, i) => (
                    <div className="req-item must" key={item.title}>
                      <span className="req-num">{i + 1}</span>
                      <div>
                        <h4>{item.title}</h4>
                        <p>{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {(reqSection === 'todo' || reqSection === 'preferencias') && (
              <section className="req-section">
                <h3>2. Preferencias muy valoradas</h3>
                <div className="req-list">
                  {REQUIREMENTS.preferences.map((item) => (
                    <div className="req-item pref" key={item.title}>
                      <span className="req-icon">✦</span>
                      <div>
                        <h4>{item.title}</h4>
                        <p>{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {(reqSection === 'todo' || reqSection === 'hallazgo') && (
              <section className="req-section">
                <h3>3. Si veis una casa o parcela prometedora</h3>
                <div className="req-list">
                  {REQUIREMENTS.ifSpotted.map((item) => (
                    <div className="req-item spot" key={item.title}>
                      <span className="req-icon">📌</span>
                      <div>
                        <h4>{item.title}</h4>
                        <p>{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cta-box">
                  <div>
                    <strong>¿Habéis visto un cartel o una calle que os ha encantado?</strong>
                    <p>
                      No hace falta llamar ni pedir visita: apuntad aquí la dirección y lo que os
                      llamó la atención para revisarlo luego con Jorge y Marisa.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => openSightingForTown('arroyo')}
                  >
                    + Anotar casa o parcela vista
                  </button>
                </div>
              </section>
            )}
          </div>
        )}

        {/* ==================== PESTAÑA 4: NOTAS Y ENVÍO ==================== */}
        {activeTab === 'notas' && (
          <div className="stack-lg">
            {/* Resumen comparativo */}
            <section className="panel-card">
              <div className="panel-head">
                <h2>Resumen de pueblos visitados</h2>
                <p className="muted">
                  Todo lo que apuntáis en cada pueblo se guarda automáticamente en este dispositivo.
                </p>
              </div>

              <div className="compare-list">
                {TOWNS.map((town) => {
                  const n = townNotes[town.id] || {}
                  const v = getVerdict(n.verdict)
                  const hasContent =
                    n.visited ||
                    v ||
                    n.feel ||
                    n.walkability ||
                    n.noise ||
                    n.mallMinutes ||
                    (n.notes && n.notes.trim())
                  return (
                    <div
                      key={town.id}
                      className={`compare-row ${hasContent ? 'has-data' : 'empty'}`}
                    >
                      <div className="compare-main">
                        <div className="compare-title">
                          <strong>{town.name}</strong>
                          {n.visited && <span className="visited-badge">✓ Visitado</span>}
                          {v && (
                            <span className={`verdict-chip tone-${v.tone}`}>
                              {v.emoji} {v.label}
                            </span>
                          )}
                        </div>
                        {hasContent ? (
                          <div className="compare-details">
                            <div className="detail-tags">
                              {n.feel && <span>Ambiente: {n.feel}</span>}
                              {n.walkability && <span>A pie: {n.walkability}</span>}
                              {n.noise && <span>Ruido: {n.noise}</span>}
                              {n.mallMinutes && <span>C. comercial: {n.mallMinutes} min</span>}
                            </div>
                            {n.fees && <p className="small-note">Cuotas: {n.fees}</p>}
                            {n.notes && <p className="compare-quote">“{n.notes}”</p>}
                          </div>
                        ) : (
                          <p className="muted-sm">Sin notas todavía.</p>
                        )}
                      </div>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => openTown(town.id)}
                      >
                        {hasContent ? 'Editar' : 'Anotar'}
                      </button>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Casas o parcelas vistas */}
            <section className="panel-card">
              <div className="panel-head-row">
                <div>
                  <h2>Casas y parcelas vistas en ruta</h2>
                  <p className="muted">
                    Solo para registrar direcciones, carteles o detalles útiles. No hay que contactar
                    a nadie desde aquí.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setShowSightingForm((s) => !s)}
                >
                  {showSightingForm ? 'Cerrar formulario' : '+ Añadir hallazgo'}
                </button>
              </div>

              {showSightingForm && (
                <form className="sighting-form" onSubmit={saveSighting}>
                  <div className="form-row">
                    <label>Tipo de inmueble</label>
                    <div className="segment-group">
                      {[
                        { id: 'casa', label: 'Casa / Chalet' },
                        { id: 'obra-nueva', label: 'Obra nueva' },
                        { id: 'parcela', label: 'Parcela / Solar' },
                      ].map((k) => (
                        <button
                          key={k.id}
                          type="button"
                          className={sightingDraft.kind === k.id ? 'active' : ''}
                          onClick={() => setSightingDraft((d) => ({ ...d, kind: k.id }))}
                        >
                          {k.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-row">
                      <label htmlFor="s-town">Pueblo</label>
                      <select
                        id="s-town"
                        value={sightingDraft.townId}
                        onChange={(e) =>
                          setSightingDraft((d) => ({ ...d, townId: e.target.value }))
                        }
                      >
                        {TOWNS.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-row">
                      <label htmlFor="s-price">Precio pedido (sin impuestos ni extras)</label>
                      <input
                        id="s-price"
                        type="text"
                        placeholder="Ej.: 325.000 €"
                        value={sightingDraft.askingPrice}
                        onChange={(e) =>
                          setSightingDraft((d) => ({ ...d, askingPrice: e.target.value }))
                        }
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <label htmlFor="s-address">Dirección exacta, calle o referencia de mapa</label>
                    <input
                      id="s-address"
                      type="text"
                      required
                      placeholder="Ej.: Calle Fuente del Cisne, cerca del parque..."
                      value={sightingDraft.address}
                      onChange={(e) =>
                        setSightingDraft((d) => ({ ...d, address: e.target.value }))
                      }
                    />
                  </div>

                  <div className="form-row">
                    <label htmlFor="s-agency">Agencia, promotora o nombre del cartel</label>
                    <input
                      id="s-agency"
                      type="text"
                      placeholder="Ej.: Residencial..., cartel particular, inmobiliaria..."
                      value={sightingDraft.agencyOrPromo}
                      onChange={(e) =>
                        setSightingDraft((d) => ({ ...d, agencyOrPromo: e.target.value }))
                      }
                    />
                  </div>

                  {sightingDraft.kind !== 'parcela' && (
                    <div className="form-grid-2">
                      <div className="form-row">
                        <label htmlFor="s-built">Superficie construida (si consta)</label>
                        <input
                          id="s-built"
                          type="text"
                          placeholder="Ej.: 175 m²"
                          value={sightingDraft.builtArea}
                          onChange={(e) =>
                            setSightingDraft((d) => ({ ...d, builtArea: e.target.value }))
                          }
                        />
                      </div>
                      <div className="form-row">
                        <label htmlFor="s-usable">
                          Superficie útil interior (sin garaje/sótano/terraza)
                        </label>
                        <input
                          id="s-usable"
                          type="text"
                          placeholder="Ej.: 125 m² útiles"
                          value={sightingDraft.usableArea}
                          onChange={(e) =>
                            setSightingDraft((d) => ({ ...d, usableArea: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                  )}

                  {sightingDraft.kind === 'obra-nueva' && (
                    <div className="sub-fieldset">
                      <strong>Entrega de llaves (fase o unidad concreta)</strong>
                      <p className="muted-sm">
                        Distinto del fin de obra. Si no hay fecha publicada, dejadlo como
                        desconocida.
                      </p>
                      <div className="form-grid-2">
                        <div className="form-row">
                          <label htmlFor="s-hstatus">Estado de la fecha</label>
                          <select
                            id="s-hstatus"
                            value={sightingDraft.handoverStatus}
                            onChange={(e) =>
                              setSightingDraft((d) => ({ ...d, handoverStatus: e.target.value }))
                            }
                          >
                            <option value="desconocida">Desconocida / no publicada</option>
                            <option value="estimada">Fecha estimada</option>
                            <option value="confirmada">Fecha publicada</option>
                          </select>
                        </div>
                        <div className="form-row">
                          <label htmlFor="s-hdate">Fecha anunciada</label>
                          <input
                            id="s-hdate"
                            type="text"
                            disabled={sightingDraft.handoverStatus === 'desconocida'}
                            placeholder="Ej.: 2º trimestre 2027"
                            value={sightingDraft.handoverDate}
                            onChange={(e) =>
                              setSightingDraft((d) => ({ ...d, handoverDate: e.target.value }))
                            }
                          />
                        </div>
                      </div>
                      <div className="form-row">
                        <label htmlFor="s-hsource">Fuente del dato</label>
                        <input
                          id="s-hsource"
                          type="text"
                          placeholder="Ej.: Cartel en la parcela, folleto, web promotora"
                          value={sightingDraft.handoverSource}
                          onChange={(e) =>
                            setSightingDraft((d) => ({ ...d, handoverSource: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                  )}

                  {sightingDraft.kind === 'parcela' && (
                    <div className="sub-fieldset">
                      <strong>Datos de la parcela</strong>
                      <p className="muted-sm">
                        Recordad: que diga “edificable” no basta; luego pediremos retranqueos,
                        ocupación y confirmación al ayuntamiento.
                      </p>
                      <div className="form-grid-2">
                        <div className="form-row">
                          <label htmlFor="s-plotarea">Superficie aproximada</label>
                          <input
                            id="s-plotarea"
                            type="text"
                            placeholder="Ej.: 420 m²"
                            value={sightingDraft.plotArea}
                            onChange={(e) =>
                              setSightingDraft((d) => ({ ...d, plotArea: e.target.value }))
                            }
                          />
                        </div>
                        <div className="form-row">
                          <label htmlFor="s-landstatus">Tipo de suelo</label>
                          <select
                            id="s-landstatus"
                            value={sightingDraft.landStatus}
                            onChange={(e) =>
                              setSightingDraft((d) => ({ ...d, landStatus: e.target.value }))
                            }
                          >
                            <option value="por-confirmar">Por confirmar en ayuntamiento</option>
                            <option value="urbano">Urbano / solar con suministros</option>
                            <option value="urbanizable">Urbanizable (no listo aún)</option>
                            <option value="rustico">Rústico</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="form-row">
                    <label htmlFor="s-extras">
                      Gastos aparte (impuestos, cocina, jardín o arreglos visibles)
                    </label>
                    <input
                      id="s-extras"
                      type="text"
                      placeholder="Ej.: Cocina sin equipar, jardín en tierra, cuota EUC..."
                      value={sightingDraft.extrasNote}
                      onChange={(e) =>
                        setSightingDraft((d) => ({ ...d, extrasNote: e.target.value }))
                      }
                    />
                  </div>

                  <div className="form-row">
                    <label htmlFor="s-highlights">Qué os ha llamado la atención</label>
                    <textarea
                      id="s-highlights"
                      rows={3}
                      placeholder="Sol, privacidad del jardín, calle tranquila, vecinos, cercanía a parques..."
                      value={sightingDraft.highlights}
                      onChange={(e) =>
                        setSightingDraft((d) => ({ ...d, highlights: e.target.value }))
                      }
                    />
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary">
                      Guardar hallazgo
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => setShowSightingForm(false)}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}

              {sightings.length === 0 ? (
                <p className="empty-hint">
                  Aún no habéis añadido ninguna casa o parcela. Si veis algo interesante desde el
                  coche o paseando, tocad “+ Añadir hallazgo”.
                </p>
              ) : (
                <div className="sightings-list">
                  {sightings.map((s) => {
                    const town = getTownById(s.townId)
                    const kindLabel =
                      s.kind === 'obra-nueva'
                        ? 'Obra nueva'
                        : s.kind === 'parcela'
                        ? 'Parcela / Solar'
                        : 'Casa / Chalet'
                    return (
                      <div className="sighting-item" key={s.id}>
                        <div className="sighting-top">
                          <div className="town-badges">
                            <span className="eyebrow-tag green">{kindLabel}</span>
                            <span className="eyebrow-tag soft">{town?.name || s.townId}</span>
                            {s.askingPrice && (
                              <span className="eyebrow-tag amber">{s.askingPrice}</span>
                            )}
                          </div>
                          <button
                            type="button"
                            className="delete-btn"
                            onClick={() => deleteSighting(s.id)}
                          >
                            Borrar
                          </button>
                        </div>
                        {s.address && <p className="sighting-address">📍 {s.address}</p>}
                        {s.agencyOrPromo && (
                          <p className="muted-sm">Cartel / agencia: {s.agencyOrPromo}</p>
                        )}
                        {s.kind === 'obra-nueva' && (
                          <p className="muted-sm">
                            Entrega de llaves:{' '}
                            {s.handoverStatus === 'desconocida' || !s.handoverDate
                              ? 'Desconocida'
                              : `${s.handoverDate} (${s.handoverStatus})`}
                            {s.handoverSource ? ` · Fuente: ${s.handoverSource}` : ''}
                          </p>
                        )}
                        {s.kind === 'parcela' && (
                          <p className="muted-sm">
                            Parcela: {s.plotArea || 'm² sin confirmar'} · Suelo: {s.landStatus}
                          </p>
                        )}
                        {s.extrasNote && (
                          <p className="muted-sm">Extras / gastos aparte: {s.extrasNote}</p>
                        )}
                        {s.highlights && <p className="sighting-note">{s.highlights}</p>}
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            {/* Enviar observaciones a Jorge y Marisa */}
            <section className="panel-card share-panel">
              <div className="panel-head">
                <h2>Enviar observaciones a Jorge y Marisa</h2>
                <p className="muted">
                  Cuando terminéis el día (o al final del viaje), enviadnos este resumen con un
                  toque por WhatsApp o copiadlo.
                </p>
              </div>

              <pre className="report-preview">{reportText}</pre>

              <div className="share-actions">
                <a
                  className="btn btn-whatsapp"
                  href={`https://wa.me/?text=${encodeURIComponent(reportText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  💬 Enviar por WhatsApp
                </a>
                <button type="button" className="btn btn-secondary" onClick={handleCopyReport}>
                  {copiedReport ? '✓ ¡Resumen copiado!' : '📋 Copiar resumen'}
                </button>
                <button type="button" className="btn btn-ghost" onClick={handleDownloadReport}>
                  ⬇️ Descargar (.txt)
                </button>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Barra de navegación inferior fija en móvil */}
      <nav className="mobile-bottom-nav" aria-label="Navegación móvil">
        <button
          type="button"
          className={activeTab === 'rutas' ? 'active' : ''}
          onClick={() => {
            setActiveTab('rutas')
            setSelectedTownId(null)
          }}
        >
          <span className="tab-ico">🧭</span>
          <span>Ruta</span>
        </button>
        <button
          type="button"
          className={activeTab === 'pueblos' ? 'active' : ''}
          onClick={() => setActiveTab('pueblos')}
        >
          <span className="tab-ico">🏡</span>
          <span>Pueblos</span>
        </button>
        <button
          type="button"
          className={activeTab === 'requisitos' ? 'active' : ''}
          onClick={() => {
            setActiveTab('requisitos')
            setSelectedTownId(null)
          }}
        >
          <span className="tab-ico">📋</span>
          <span>Qué buscamos</span>
        </button>
        <button
          type="button"
          className={activeTab === 'notas' ? 'active' : ''}
          onClick={() => {
            setActiveTab('notas')
            setSelectedTownId(null)
          }}
        >
          <span className="tab-ico">✍️</span>
          <span>Notas</span>
          {totalNotedCount > 0 && <span className="mobile-badge">{totalNotedCount}</span>}
        </button>
      </nav>
    </div>
  )
}

function TownDetailView({
  town,
  note,
  onBack,
  onSelectTown,
  onUpdateNote,
  onToggleCheck,
  onAddSighting,
}) {
  const idx = TOWNS.findIndex((t) => t.id === town.id)
  const prevTown = idx > 0 ? TOWNS[idx - 1] : null
  const nextTown = idx < TOWNS.length - 1 ? TOWNS[idx + 1] : null

  return (
    <div className="stack-md">
      <div className="detail-nav-bar">
        <button type="button" className="back-btn" onClick={onBack}>
          ← Todos los pueblos
        </button>
        <button
          type="button"
          className={`visit-toggle-btn ${note.visited ? 'is-visited' : ''}`}
          onClick={() => onUpdateNote({ visited: !note.visited })}
        >
          {note.visited ? '✓ Visitado' : 'Marcar como visitado'}
        </button>
      </div>

      {/* Cabecera de ficha */}
      <section className="detail-hero">
        <div className="town-badges">
          <span className={`eyebrow-tag ${town.priority === 'opcional' ? 'soft' : 'green'}`}>
            {town.badge}
          </span>
          {FULL_DAY_ROUTE.baseStops.some((s) => s.townId === town.id) ? (
            <span className="eyebrow-tag amber">En la ruta del día</span>
          ) : (
            <span className="eyebrow-tag soft">Parada opcional de tarde</span>
          )}
        </div>
        <h2>{town.name}</h2>
        <p className="detail-lead">{town.whyConsidered}</p>
      </section>

      {/* Paradas concretas */}
      <section className="panel-card">
        <h3>1. Zonas a visitar y comparar</h3>
        <div className="stops-list">
          {town.stops.map((stop, i) => (
            <div className="stop-card" key={stop.name}>
              <div className="stop-card-info">
                <span className="stop-badge">Parada {i + 1}</span>
                <h4>{stop.name}</h4>
                <p>{stop.detail}</p>
              </div>
              <a
                className="btn btn-secondary"
                href={mapsPlaceUrl(stop.mapsQuery)}
                target="_blank"
                rel="noopener noreferrer"
              >
                📍 Cómo llegar
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Qué queremos comprobar */}
      <section className="panel-card">
        <h3>2. Qué nos gustaría observar aquí</h3>
        <div className="checklist">
          {town.whatToCheck.map((item, i) => {
            const checked = Boolean(note.checks?.[i])
            return (
              <label key={item} className={`check-item ${checked ? 'checked' : ''}`}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleCheck(i)}
                />
                <span>{item}</span>
              </label>
            )
          })}
        </div>
      </section>

      {/* Referencia de centro comercial */}
      <section className="panel-card">
        <h3>3. Comprobación de centro comercial (límite ~20 min)</h3>
        <div className="mall-check-list">
          {town.mallRefs.map((ref) => {
            const mall = MALL_BENCHMARKS[ref.mallId]
            return (
              <div className="mall-check-row" key={ref.label}>
                <div>
                  <strong>
                    {ref.label} · <span className="time-accent">{ref.estimate}</span>
                  </strong>
                  <p>{ref.note}</p>
                </div>
                <a
                  className="btn btn-ghost"
                  href={mapsDriveUrl(ref.originQuery, mall.mapsQuery)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  🚗 Medir ruta real
                </a>
              </div>
            )
          })}
        </div>
      </section>

      {/* Vida cotidiana + Mercado e Idealista */}
      <section className="panel-card">
        <h3>4. Vida familiar, mercado e Idealista</h3>
        <div className="info-block">
          <strong>Colegios, ocio y entorno para Clara:</strong>
          <p>{town.familyLife}</p>
        </div>
        <div className="info-block">
          <strong>Referencia de mercado (investigación previa):</strong>
          <p>{town.marketNotes}</p>
        </div>

        <div className="idealista-box">
          <span className="idealista-label">
            Búsquedas filtradas en Idealista para echar un vistazo por la zona:
          </span>
          <div className="idealista-links">
            {town.idealistaLinks.map((link) => (
              <a
                key={link.url}
                className={`idealista-btn ${link.type}`}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>{link.type === 'terrenos' ? '🌱' : '🏠'}</span>
                <span>{link.label}</span>
                <span className="ext-arrow">↗</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Vuestras observaciones de este pueblo */}
      <section className="panel-card notes-card">
        <h3>5. Vuestras impresiones de {town.shortName}</h3>
        <p className="muted-sm">
          Se guarda automáticamente en el móvil y aparece luego en el resumen para enviar.
        </p>

        <div className="form-row">
          <label>Sensación general</label>
          <div className="verdict-grid">
            {VERDICT_OPTIONS.map((v) => (
              <button
                key={v.id}
                type="button"
                className={`verdict-btn tone-${v.tone} ${note.verdict === v.id ? 'active' : ''}`}
                onClick={() =>
                  onUpdateNote({ verdict: note.verdict === v.id ? '' : v.id })
                }
              >
                <span>{v.emoji}</span>
                <span>{v.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="form-row">
          <label>Ambiente en la calle un día normal</label>
          <div className="choice-row">
            {['Con vida', 'Tranquilo', 'Algo vacío'].map((opt) => (
              <button
                key={opt}
                type="button"
                className={`choice-pill ${note.feel === opt ? 'active' : ''}`}
                onClick={() => onUpdateNote({ feel: note.feel === opt ? '' : opt })}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="form-row">
          <label>¿Qué tal ir a pie a tiendas y parques?</label>
          <div className="choice-row">
            {['Muy bien', 'Regular', 'Hace falta coche'].map((opt) => (
              <button
                key={opt}
                type="button"
                className={`choice-pill ${note.walkability === opt ? 'active' : ''}`}
                onClick={() =>
                  onUpdateNote({ walkability: note.walkability === opt ? '' : opt })
                }
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="form-row">
          <label>Tráfico y ruido en calles residenciales</label>
          <div className="choice-row">
            {['Silencioso', 'Normal', 'Ruidoso'].map((opt) => (
              <button
                key={opt}
                type="button"
                className={`choice-pill ${note.noise === opt ? 'active' : ''}`}
                onClick={() => onUpdateNote({ noise: note.noise === opt ? '' : opt })}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-row">
            <label htmlFor="n-mall">Tiempo real al centro comercial (min)</label>
            <input
              id="n-mall"
              type="number"
              inputMode="numeric"
              min="1"
              max="90"
              placeholder="Ej.: 14"
              value={note.mallMinutes || ''}
              onChange={(e) => onUpdateNote({ mallMinutes: e.target.value })}
            />
          </div>
          <div className="form-row">
            <label htmlFor="n-fees">
              {town.id === 'aldeamayor'
                ? 'Cuota urbanización (EUC) / comunidad'
                : 'Cuotas comunidad / urbanización (si sabéis)'}
            </label>
            <input
              id="n-fees"
              type="text"
              placeholder="Ej.: 85 €/mes + EUC..."
              value={note.fees || ''}
              onChange={(e) => onUpdateNote({ fees: e.target.value })}
            />
          </div>
        </div>

        <div className="form-row">
          <label htmlFor="n-notes">
            ¿Cómo os imagináis el día a día de Jorge, Marisa y Clara aquí?
          </label>
          <textarea
            id="n-notes"
            rows={4}
            placeholder="Lo que más os ha gustado, lo que os genera dudas, sensación en las urbanizaciones..."
            value={note.notes || ''}
            onChange={(e) => onUpdateNote({ notes: e.target.value })}
          />
        </div>

        <div className="detail-note-cta">
          <button type="button" className="btn btn-secondary" onClick={onAddSighting}>
            📌 Anotar una casa o parcela vista en {town.shortName}
          </button>
        </div>
      </section>

      {/* Navegación anterior / siguiente pueblo */}
      <div className="prev-next-row">
        {prevTown ? (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => onSelectTown(prevTown.id)}
          >
            ← {prevTown.shortName}
          </button>
        ) : (
          <span />
        )}
        {nextTown && (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => onSelectTown(nextTown.id)}
          >
            {nextTown.shortName} →
          </button>
        )}
      </div>
    </div>
  )
}
