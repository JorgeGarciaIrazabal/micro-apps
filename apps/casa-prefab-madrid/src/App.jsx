import { useState, useMemo } from 'react'
import {
  models,
  techs,
  companies,
} from './data'

const fmt = (n) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Math.round(n))
const fmtNum = (n) => new Intl.NumberFormat('es-ES', { maximumFractionDigits: 1 }).format(n)

const TECH_COLORS = {
  hormigon: '#ea580c',
  madera: '#16a34a',
  lsf: '#0284c7',
  sip: '#6366f1',
  mod3d: '#9333ea',
  contenedor: '#64748b',
}

const TABS = [
  { id: 'overview', label: 'Resumen' },
  { id: 'models', label: 'Comparar modelos' },
  { id: 'tech', label: 'Comparar tecnologías' },
  { id: 'companies', label: 'Comparar fabricantes' },
  { id: 'visits', label: 'Lugares para visitar' },
]

const techName = (id) => techs.find((t) => t.id === id)?.name.split(' (')[0] ?? id
const techLongName = (id) => techs.find((t) => t.id === id)?.name ?? id

const energyScore = (rating) => {
  const map = { 'a+': 1, a: 2, b: 3, c: 4, d: 5, e: 6, f: 7, g: 8 }
  return map[rating?.toLowerCase()] ?? 4
}

const energyLabel = (score) => {
  const map = { 1: 'A+', 2: 'A', 3: 'B', 4: 'C', 5: 'D', 6: 'E', 7: 'F', 8: 'G' }
  return map[Math.round(score)] ?? '—'
}

export default function App() {
  const [tab, setTab] = useState('overview')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [minSize, setMinSize] = useState('')
  const [maxSize, setMaxSize] = useState('')
  const [bedrooms, setBedrooms] = useState('all')
  const [selectedTech, setSelectedTech] = useState('all')
  const [sort, setSort] = useState({ col: 'pricePerM2', dir: 'asc' })

  const allPrices = useMemo(() => models.map((m) => m.price), [])
  const allSizes = useMemo(() => models.map((m) => m.size), [])
  const [priceScopeFilter, setPriceScopeFilter] = useState('all')
  const minP = Math.min(...allPrices)
  const maxP = Math.max(...allPrices)
  const minS = Math.min(...allSizes)
  const maxS = Math.max(...allSizes)

  const bedroomOptions = useMemo(
    () => Array.from(new Set(models.map((m) => m.bedrooms).filter(Boolean))).sort((a, b) => a - b),
    []
  )
  const techOptions = useMemo(() => Array.from(new Set(models.map((m) => m.tech))), [])

  const getPriceScope = (scope = '') => {
    const s = scope.toLowerCase()
    if (s.includes('llave en mano')) return 'llave_en_mano'
    if (s.includes('casa móvil') || s.includes('casa movil') || s.includes('solo casa') || s.includes('kit básico') || s.includes('kit basico') || s.includes('casa + montaje')) return 'solo_casa'
    return 'otro'
  }

  const filtered = useMemo(() => {
    const min = minPrice === '' ? -Infinity : Number(minPrice)
    const max = maxPrice === '' ? Infinity : Number(maxPrice)
    const minSz = minSize === '' ? -Infinity : Number(minSize)
    const maxSz = maxSize === '' ? Infinity : Number(maxSize)
    return models.filter((m) => {
      const okPrice = m.price >= min && m.price <= max
      const okSize = m.size >= minSz && m.size <= maxSz
      const okBed = bedrooms === 'all' || String(m.bedrooms) === bedrooms
      const okTech = selectedTech === 'all' || m.tech === selectedTech
      const okScope = priceScopeFilter === 'all' || getPriceScope(m.deliveryScope) === priceScopeFilter
      return okPrice && okSize && okBed && okTech && okScope
    })
  }, [minPrice, maxPrice, minSize, maxSize, bedrooms, selectedTech, priceScopeFilter])

  const withMetrics = useMemo(() => filtered.map((m) => ({ ...m, pricePerM2: m.price / m.size })), [filtered])

  const sortedRows = useMemo(() => {
    const { col, dir } = sort
    return [...withMetrics].sort((a, b) => {
      const va = a[col]
      const vb = b[col]
      if (typeof va === 'string') {
        return dir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
      }
      return dir === 'asc' ? va - vb : vb - va
    })
  }, [withMetrics, sort])

  const kpis = useMemo(() => {
    const n = filtered.length
    if (n === 0) return null
    const avgPricePerM2 = filtered.reduce((s, m) => s + m.price / m.size, 0) / n
    const prices = filtered.map((m) => m.price)
    const sizes = filtered.map((m) => m.size)
    const times = filtered.map((m) => m.buildTimeMonths)
    const avgBuildTime = times.reduce((s, t) => s + t, 0) / n
    return {
      totalModels: n,
      avgPricePerM2,
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      avgSize: sizes.reduce((s, z) => s + z, 0) / n,
      avgBuildTime,
      minBuildTime: Math.min(...times),
      maxBuildTime: Math.max(...times),
    }
  }, [filtered])

  const histogram = useMemo(() => {
    const bins = [
      { label: '<100k', min: 0, max: 100000 },
      { label: '100–150k', min: 100000, max: 150000 },
      { label: '150–200k', min: 150000, max: 200000 },
      { label: '200–250k', min: 200000, max: 250000 },
      { label: '250–300k', min: 250000, max: 300000 },
      { label: '>300k', min: 300000, max: Infinity },
    ]
    return bins.map((b) => ({
      ...b,
      count: filtered.filter((m) => m.price >= b.min && m.price < b.max).length,
    }))
  }, [filtered])

  const maxBin = useMemo(() => Math.max(1, ...histogram.map((b) => b.count)), [histogram])

  const techSummary = useMemo(() => {
    const byTech = {}
    for (const t of techs) {
      const rows = models.filter((m) => m.tech === t.id)
      const count = rows.length
      const avgP = count ? rows.reduce((s, m) => s + m.price / m.size, 0) / count : 0
      const avgSize = count ? rows.reduce((s, m) => s + m.size, 0) / count : 0
      const avgTime = count ? rows.reduce((s, m) => s + m.buildTimeMonths, 0) / count : 0
      byTech[t.id] = {
        ...t,
        count,
        avgPricePerM2: avgP,
        avgSize,
        avgTime,
        minPricePerM2: count ? Math.min(...rows.map((m) => m.price / m.size)) : 0,
        maxPricePerM2: count ? Math.max(...rows.map((m) => m.price / m.size)) : 0,
      }
    }
    return byTech
  }, [])

  const companySummary = useMemo(() => {
    return companies.map((c) => {
      const rows = models.filter((m) => m.manufacturer === c.name)
      const count = rows.length
      const avgP = count ? rows.reduce((s, m) => s + m.price / m.size, 0) / count : c.avgPricePerM2
      const avgSize = count ? rows.reduce((s, m) => s + m.size, 0) / count : 0
      const avgTime = count ? rows.reduce((s, m) => s + m.buildTimeMonths, 0) / count : 0
      return { ...c, modelCount: count, avgPricePerM2: avgP || c.avgPricePerM2, avgSize, avgTime }
    })
  }, [])

  const handleSort = (col) => {
    setSort((prev) => ({ col, dir: prev.col === col && prev.dir === 'asc' ? 'desc' : 'asc' }))
  }

  const sortIcon = (col) => (sort.col === col ? (sort.dir === 'asc' ? '▲' : '▼') : '↕')

  const resetFilters = () => {
    setMinPrice('')
    setMaxPrice('')
    setMinSize('')
    setMaxSize('')
    setBedrooms('all')
    setSelectedTech('all')
    setPriceScopeFilter('all')
    setSort({ col: 'pricePerM2', dir: 'asc' })
  }

  const Filters = () => (
    <section className="filter-bar card">
      <div className="filter-group">
        <label>Precio total</label>
        <div className="range-inputs">
          <input type="number" placeholder={minP} min={0} value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
          <span>–</span>
          <input type="number" placeholder={maxP} min={0} value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
        </div>
      </div>
      <div className="filter-group">
        <label>Tamaño (m²)</label>
        <div className="range-inputs">
          <input type="number" placeholder={minS} min={0} value={minSize} onChange={(e) => setMinSize(e.target.value)} />
          <span>–</span>
          <input type="number" placeholder={maxS} min={0} value={maxSize} onChange={(e) => setMaxSize(e.target.value)} />
        </div>
      </div>
      <div className="filter-group">
        <label>Dormitorios</label>
        <select value={bedrooms} onChange={(e) => setBedrooms(e.target.value)}>
          <option value="all">Todos</option>
          {bedroomOptions.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>
      <div className="filter-group">
        <label>Tecnología</label>
        <select value={selectedTech} onChange={(e) => setSelectedTech(e.target.value)}>
          <option value="all">Todas</option>
          {techOptions.map((t) => (
            <option key={t} value={t}>{techName(t)}</option>
          ))}
        </select>
      </div>
      <div className="filter-group">
        <label>Ámbito del precio</label>
        <select value={priceScopeFilter} onChange={(e) => setPriceScopeFilter(e.target.value)}>
          <option value="all">Todos</option>
          <option value="llave_en_mano">Llave en mano</option>
          <option value="solo_casa">Solo casa / estructura / kit</option>
        </select>
      </div>
      <button className="reset-btn" onClick={resetFilters}>
        Restablecer
      </button>
    </section>
  )

  const overviewKpis = useMemo(() => {
    const techCovered = techs.length
    const analyzedCompanies = companies.length
    const prices = models.map((m) => m.price)
    const sizes = models.map((m) => m.size)
    const times = models.map((m) => m.buildTimeMonths)
    const avgPricePerM2 =
      models.reduce((s, m) => s + m.price / m.size, 0) / (models.length || 1)
    const avgEnergy =
      models.reduce((s, m) => s + energyScore(m.energyRating), 0) /
      (models.length || 1)
    return {
      analyzedCompanies,
      techCovered,
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      minSize: Math.min(...sizes),
      maxSize: Math.max(...sizes),
      avgBuildTime: times.reduce((s, t) => s + t, 0) / (times.length || 1),
      minBuildTime: Math.min(...times),
      maxBuildTime: Math.max(...times),
      avgPricePerM2,
      avgEnergy,
    }
  }, [])

  const priceByTechnology = useMemo(
    () =>
      Object.values(techSummary).sort(
        (a, b) => (b.avgPricePerM2 || 0) - (a.avgPricePerM2 || 0)
      ),
    [techSummary]
  )

  const scopeSummary = useMemo(() => {
    const rows = models.map((m) => ({ ...m, scope: getPriceScope(m.deliveryScope) }))
    const turnkey = rows.filter((m) => m.scope === 'llave_en_mano')
    const onlyHouse = rows.filter((m) => m.scope === 'solo_casa')
    const avg = (arr) =>
      arr.length ? arr.reduce((s, m) => s + m.price / m.size, 0) / arr.length : 0
    return {
      turnkeyCount: turnkey.length,
      onlyHouseCount: onlyHouse.length,
      turnkeyAvg: avg(turnkey),
      onlyHouseAvg: avg(onlyHouse),
    }
  }, [])

  const rankings = useMemo(() => {
    const withAvg = Object.values(techSummary)
      .filter((t) => t.count)
      .map((t) => ({
        id: t.id,
        name: t.name.split(' (')[0],
        icon: t.icon,
        color: TECH_COLORS[t.id],
        avgPricePerM2: t.avgPricePerM2,
        avgTime: t.avgTime,
        energyClass: t.energyClass,
      }))
    const sortedPrice = [...withAvg].sort((a, b) => a.avgPricePerM2 - b.avgPricePerM2)
    const sortedTime = [...withAvg].sort((a, b) => a.avgTime - b.avgTime)
    const sortedEnergy = [...withAvg].sort(
      (a, b) => energyScore(a.energyClass[0]) - energyScore(b.energyClass[0])
    )
    return {
      mostAffordable: sortedPrice[0] || null,
      fastest: sortedTime[0] || null,
      mostEfficient: sortedEnergy[0] || null,
    }
  }, [techSummary])

  const Kpis = () => (
    <section className="kpi-row">
      <Kpi label="Modelos mostrados" value={kpis ? `${kpis.totalModels}` : '—'} sub="en la selección" />
      <Kpi label="Precio medio / m²" value={kpis ? `${fmtNum(kpis.avgPricePerM2)} €` : '—'} sub="entre selección" />
      <Kpi label="Rango de precio" value={kpis ? `${fmt(kpis.minPrice)} – ${fmt(kpis.maxPrice)}` : '—'} sub="precio total del modelo" />
      <Kpi label="Plazo medio de ejecución" value={kpis ? `${fmtNum(kpis.avgBuildTime)} meses` : '—'} sub={`${kpis?.minBuildTime}–${kpis?.maxBuildTime} meses`} />
    </section>
  )

  const technologyCounts = useMemo(() => {
    const counts = {}
    for (const t of techs) counts[t.id] = { ...t, count: 0, companies: 0 }
    for (const m of models) counts[m.tech].count += 1
    for (const c of companies) {
      for (const t of c.techOffered) {
        if (counts[t]) counts[t].companies += 1
      }
    }
    return Object.values(counts).sort((a, b) => b.count - a.count)
  }, [])

  const Overview = () => (
    <>
      <section className="kpi-row kpi-row--overview">
        <Kpi
          label="Empresas analizadas"
          value={overviewKpis.analyzedCompanies}
          sub="fabricantes / integradores"
        />
        <Kpi
          label="Modelos en base"
          value={models.length}
          sub="referencia de precios"
        />
        <Kpi
          label="Rango de precios"
          value={`${fmt(overviewKpis.minPrice)} – ${fmt(overviewKpis.maxPrice)}`}
          sub="precio total en base"
        />
        <Kpi
          label="€/m² medio"
          value={`${fmtNum(overviewKpis.avgPricePerM2)} €`}
          sub="media ponderada por modelo"
        />
        <Kpi
          label="Plazos"
          value={`${overviewKpis.minBuildTime}–${overviewKpis.maxBuildTime} meses`}
          sub={`media ${fmtNum(overviewKpis.avgBuildTime)} meses`}
        />
        <Kpi
          label="Eficiencia media"
          value={energyLabel(overviewKpis.avgEnergy)}
          sub="certificación aproximada"
        />
      </section>

      <section className="charts-row two-col">
        <div className="card chart-card">
          <h2>Distribución de tecnologías</h2>
          <div className="tech-dist-chart">
            {technologyCounts.map((t) => (
              <div key={t.id} className="tech-dist-row">
                <span className="tech-dist-icon">{t.icon}</span>
                <div className="tech-dist-info">
                  <span className="tech-dist-name">{t.name.split(' (')[0]}</span>
                  <span className="tech-dist-sub">
                    {t.count} modelos · {t.companies} fabricante{t.companies === 1 ? '' : 's'}
                  </span>
                </div>
                <div className="tech-dist-bar-wrap">
                  <div
                    className="tech-dist-bar"
                    style={{
                      width: `${(t.count / Math.max(...technologyCounts.map((x) => x.count))) * 100}%`,
                      background: TECH_COLORS[t.id],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card chart-card">
          <h2>Panorama de precios por tecnología</h2>
          <div className="price-range-chart">
            {priceByTechnology.map((t) => (
              <div key={t.id} className="price-range-row">
                <span className="price-range-name">
                  <span className="tech-dot" style={{ background: TECH_COLORS[t.id] }} />
                  {t.name.split(' (')[0]}
                </span>
                <div className="price-range-bar">
                  <span
                    className="price-range-fill"
                    style={{
                      left: `${(t.minPricePerM2 / 3000) * 100}%`,
                      right: `${100 - (t.maxPricePerM2 / 3000) * 100}%`,
                      background: TECH_COLORS[t.id],
                    }}
                  />
                </div>
                <span className="price-range-val">
                  {t.count ? `${Math.round(t.minPricePerM2)}–${Math.round(t.maxPricePerM2)} €` : '—'}
                </span>
              </div>
            ))}
          </div>
          <div className="chart-footnote">
            Rango de €/m² real por tecnología. Precio medio global:{' '}
            <strong>{fmtNum(overviewKpis.avgPricePerM2)} €/m²</strong>.
          </div>
        </div>
      </section>

      <section className="charts-row two-col">
        <div className="card chart-card">
          <h2>Llave en mano vs. solo casa</h2>
          <div className="scope-compare">
            <div className="scope-box">
              <span className="scope-box-label">Solo casa / estructura / kit</span>
              <span className="scope-box-value">
                {scopeSummary.onlyHouseCount ? (
                  <>
                    <strong>{fmtNum(scopeSummary.onlyHouseAvg)} €/m²</strong>
                    <span className="scope-box-sub">media · {scopeSummary.onlyHouseCount} modelos</span>
                  </>
                ) : (
                  <span className="scope-box-sub">Sin datos</span>
                )}
              </span>
            </div>
            <div className="scope-arrow">→</div>
            <div className="scope-box">
              <span className="scope-box-label">Llave en mano</span>
              <span className="scope-box-value">
                {scopeSummary.turnkeyCount ? (
                  <>
                    <strong>{fmtNum(scopeSummary.turnkeyAvg)} €/m²</strong>
                    <span className="scope-box-sub">media · {scopeSummary.turnkeyCount} modelos</span>
                  </>
                ) : (
                  <span className="scope-box-sub">Sin datos</span>
                )}
              </span>
            </div>
          </div>
          <p className="chart-footnote">
            El salto de precio refleja proyecto, licencia, cimentación, acometidas y acabados.
          </p>
        </div>

        <div className="card chart-card">
          <h2>Comparativa rápida de tecnologías</h2>
          <div className="ranking-row ranking-row--inner">
            <div className="ranking-card">
              <h3>Más asequible</h3>
              {rankings.mostAffordable ? (
                <>
                  <span className="ranking-icon" style={{ color: rankings.mostAffordable.color }}>
                    {rankings.mostAffordable.icon}
                  </span>
                  <p className="ranking-name">{rankings.mostAffordable.name}</p>
                  <p className="ranking-metric">{fmtNum(rankings.mostAffordable.avgPricePerM2)} €/m²</p>
                </>
              ) : (
                <p className="ranking-metric">—</p>
              )}
            </div>
            <div className="ranking-card">
              <h3>Más rápida</h3>
              {rankings.fastest ? (
                <>
                  <span className="ranking-icon" style={{ color: rankings.fastest.color }}>
                    {rankings.fastest.icon}
                  </span>
                  <p className="ranking-name">{rankings.fastest.name}</p>
                  <p className="ranking-metric">{fmtNum(rankings.fastest.avgTime)} meses</p>
                </>
              ) : (
                <p className="ranking-metric">—</p>
              )}
            </div>
            <div className="ranking-card">
              <h3>Más eficiente</h3>
              {rankings.mostEfficient ? (
                <>
                  <span className="ranking-icon" style={{ color: rankings.mostEfficient.color }}>
                    {rankings.mostEfficient.icon}
                  </span>
                  <p className="ranking-name">{rankings.mostEfficient.name}</p>
                  <p className="ranking-metric">{rankings.mostEfficient.energyClass.join('–')}</p>
                </>
              ) : (
                <p className="ranking-metric">—</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="executive-summary card">
        <p>
          Los precios finales dependen más del alcance del presupuesto que de la tecnología.
          Compara siempre “llave en mano” frente a “solo casa” y verifica qué incluye cada
          partida: cimentación, acometidas, proyecto y licencia.
        </p>
      </section>
    </>
  )

  const priceScopeLabel = (scope = '') => {
    const s = scope.toLowerCase()
    if (s.includes('llave en mano')) return { label: 'Llave en mano', desc: 'Casa + obra completa' }
    if (s.includes('casa móvil') || s.includes('casa movil') || s.includes('solo casa') || s.includes('kit básico') || s.includes('kit basico') || s.includes('casa + montaje')) return { label: 'Solo casa / estructura', desc: 'Sin obra completa' }
    return { label: 'Otro', desc: 'Consultar alcance' }
  }

  const ModelsTable = () => (
    <section className="table-section card">
      <div className="table-head">
        <h2>Comparativa de modelos</h2>
        <span className="table-count">{sortedRows.length} resultados</span>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th className="sortable" onClick={() => handleSort('name')}>Modelo {sortIcon('name')}</th>
              <th className="sortable" onClick={() => handleSort('manufacturer')}>Fabricante {sortIcon('manufacturer')}</th>
              <th className="sortable" onClick={() => handleSort('tech')}>Tecnología {sortIcon('tech')}</th>
              <th className="sortable" onClick={() => handleSort('deliveryScope')}>Ámbito del precio {sortIcon('deliveryScope')}</th>
              <th className="sortable right" onClick={() => handleSort('price')}>Precio {sortIcon('price')}</th>
              <th className="sortable right" onClick={() => handleSort('size')}>m² {sortIcon('size')}</th>
              <th className="sortable right" onClick={() => handleSort('pricePerM2')}>€/m² {sortIcon('pricePerM2')}</th>
              <th className="sortable right" onClick={() => handleSort('bedrooms')}>Dorm. {sortIcon('bedrooms')}</th>
              <th className="sortable right" onClick={() => handleSort('bathrooms')}>Baños {sortIcon('bathrooms')}</th>
              <th className="sortable right" onClick={() => handleSort('buildTimeMonths')}>Plazo {sortIcon('buildTimeMonths')}</th>
              <th className="sortable" onClick={() => handleSort('energyRating')}>Energía {sortIcon('energyRating')}</th>
              <th>Estructura</th>
              <th>Cimentación</th>
              <th>Personalización</th>
              <th>Garantía</th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((m) => {
              const scope = priceScopeLabel(m.deliveryScope)
              return (
                <tr key={m.id}>
                  <td className="model-name">
                    {m.url ? (
                      <a className="model-link" href={m.url} target="_blank" rel="noreferrer" title="Ver ficha del modelo">
                        {m.name}
                      </a>
                    ) : (
                      m.name
                    )}
                  </td>
                  <td>{m.manufacturer}</td>
                  <td>
                    <span className="tech-dot" style={{ background: TECH_COLORS[m.tech] }} />
                    {techName(m.tech)}
                  </td>
                  <td>
                    <span className="scope-badge scope-{scope.label === 'Llave en mano' ? 'turnkey' : 'only'}">
                      {scope.label}
                    </span>
                    <span className="scope-desc" title={m.deliveryScope}>{scope.desc}</span>
                  </td>
                  <td className="right">{fmt(m.price)}</td>
                  <td className="right">{m.size}</td>
                  <td className="right">{fmtNum(m.pricePerM2)}</td>
                  <td className="right">{m.bedrooms}</td>
                  <td className="right">{m.bathrooms}</td>
                  <td className="right">{m.buildTimeMonths} m</td>
                  <td>
                    <span className={`energy-badge energy-${m.energyRating[0].toLowerCase()}`}>{m.energyRating}</span>
                  </td>
                  <td className="small-text" title={m.structureType}>{m.structureType || '—'}</td>
                  <td className="small-text">{m.foundation || '—'}</td>
                  <td className="small-text">{m.customizationLevel || '—'}</td>
                  <td className="small-text">{m.warranty || '—'}</td>
                </tr>
              )
            })}
            {sortedRows.length === 0 && (
              <tr>
                <td colSpan={15} className="no-results">No hay modelos que coincidan con los filtros aplicados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )

  const Technologies = () => (
    <section className="tech-section">
      <div className="card chart-card">
        <h2>Rango de €/m² por tecnología</h2>
        <div className="per-m2-chart">
          {Object.values(techSummary)
            .sort((a, b) => b.avgPricePerM2 - a.avgPricePerM2)
            .map((t) => (
              <div key={t.id} className="per-m2-row">
                <span className="per-m2-name">
                  <span className="tech-dot" style={{ background: TECH_COLORS[t.id] }} />
                  {t.name}
                </span>
                <div className="per-m2-bar-wrap">
                  <div
                    className="per-m2-bar"
                    style={{
                      width: `${Math.min(100, ((t.avgPricePerM2 / 3500) * 100))}%`,
                      background: TECH_COLORS[t.id],
                    }}
                  />
                </div>
                <span className="per-m2-val">{fmtNum(t.avgPricePerM2)} €/m²</span>
              </div>
            ))}
        </div>
      </div>
      <div className="tech-grid">
        {techs.map((t) => {
          const s = techSummary[t.id]
          const pc = techProsCons[t.id]
          return (
            <div className="card tech-card" key={t.id}>
              <div className="tech-card-head">
                <span className="tech-icon">{t.icon}</span>
                <div>
                  <h3>{t.name}</h3>
                  <p className="tech-sub">{t.timeframe} · energía {t.energyClass.join('–')} · {s.count} modelos en la base</p>
                </div>
              </div>
              <p className="tech-summary">{t.summary}</p>
              <div className="tech-stats">
                <div className="tech-stat">
                  <span className="tech-stat-label">Rango €/m²</span>
                  <span className="tech-stat-value">{t.pricePerM2[0]} – {t.pricePerM2[1]} €</span>
                </div>
                <div className="tech-stat">
                  <span className="tech-stat-label">Media base</span>
                  <span className="tech-stat-value">{s.count ? fmtNum(s.avgPricePerM2) : '—'} €/m²</span>
                </div>
                <div className="tech-stat">
                  <span className="tech-stat-label">Plazo</span>
                  <span className="tech-stat-value">{t.timeframe}</span>
                </div>
                <div className="tech-stat">
                  <span className="tech-stat-label">Masa térmica</span>
                  <span className="tech-stat-value">{t.thermalMass}</span>
                </div>
                <div className="tech-stat">
                  <span className="tech-stat-label">Uso típico</span>
                  <span className="tech-stat-value">{t.typicalUse}</span>
                </div>
              </div>
              {pc && (
                <div className="pros-cons">
                  <div>
                    <h4>Ventajas</h4>
                    <ul>
                      {pc.pros.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4>Desventajas</h4>
                    <ul>
                      {pc.cons.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )

  const Companies = () => (
    <section className="company-section">
      <div className="card chart-card">
        <h2>Precio medio por m² por fabricante</h2>
        <div className="per-m2-chart">
          {[...companySummary]
            .sort((a, b) => b.avgPricePerM2 - a.avgPricePerM2)
            .map((c) => (
              <div key={c.name} className="per-m2-row">
                <span className="per-m2-name">{c.name}</span>
                <div className="per-m2-bar-wrap">
                  <div
                    className="per-m2-bar"
                    style={{
                      width: `${Math.min(100, ((c.avgPricePerM2 / 3000) * 100))}%`,
                      background: TECH_COLORS[c.tech] || '#64748b',
                    }}
                  />
                </div>
                <span className="per-m2-val">{fmtNum(c.avgPricePerM2)} €/m²</span>
              </div>
            ))}
        </div>
      </div>
      <div className="company-grid">
        {companySummary.map((c) => (
          <div className="card company-card" key={c.name}>
            <div className="company-head">
              <span className="company-icon">{c.icon}</span>
              <div>
                <h3>{c.name}</h3>
                <p className="company-sub">{c.location}</p>
              </div>
            </div>
            <div className="company-tags">
              {c.techOffered.map((id) => (
                <span key={id} className="company-tag" style={{ background: TECH_COLORS[id] + '18', color: TECH_COLORS[id] }}>
                  {techName(id)}
                </span>
              ))}
            </div>
            <dl className="company-dl">
              <dt>Zona de actuación</dt>
              <dd>{c.madridRadius}</dd>
              <dt>Rango de precio / m²</dt>
              <dd>{c.priceRange ? `${c.priceRange[0]} – ${c.priceRange[1]} €` : c.priceFrom}</dd>
              <dt>Precio medio / m² estimado</dt>
              <dd>{fmtNum(c.avgPricePerM2)} €/m²</dd>
              <dt>Plazo típico</dt>
              <dd>{c.typicalBuildTime}</dd>
              <dt>Garantía</dt>
              <dd>{c.warranty}</dd>
            </dl>
            <p className="company-scope">{c.scope}</p>
            {c.url && (
              <a className="company-link" href={c.url} target="_blank" rel="noreferrer">
                Ver web del fabricante
              </a>
            )}
          </div>
        ))}
      </div>
      <div className="card table-section">
        <div className="table-head">
          <h2>Tabla comparativa de fabricantes</h2>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Fabricante</th>
                <th>Tecnologías</th>
                <th>Ubicación</th>
                <th className="right">Rango €/m²</th>
                <th className="right">Precio medio / m²</th>
                <th>Plazo típico</th>
                <th>Garantía</th>
                <th>Zona de actuación</th>
              </tr>
            </thead>
            <tbody>
              {companySummary.map((c) => (
                <tr key={c.name}>
                  <td className="model-name">{c.name}</td>
                  <td>{c.techOffered.map(techName).join(', ')}</td>
                  <td>{c.location}</td>
                  <td className="right">{c.priceRange ? `${c.priceRange[0]}–${c.priceRange[1]} €` : '—'}</td>
                  <td className="right">{fmtNum(c.avgPricePerM2)} €/m²</td>
                  <td>{c.typicalBuildTime}</td>
                  <td>{c.warranty}</td>
                  <td>{c.madridRadius}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )

  const Visits = () => {
    const [visitFilter, setVisitFilter] = useState('all')
    const [recFilter, setRecFilter] = useState(false)
    const [locationFilter, setLocationFilter] = useState('Alicante')
    const [locationSort, setLocationSort] = useState('none')
    const [showAlicante, setShowAlicante] = useState(true)
    const allVisits = useMemo(() => {
      const combined = [...visitPlaces, ...visitPlacesAlicante]
      return combined.map((v) => ({
        ...v,
        locationCity: v.locationCity || (v.alicante ? 'Alicante' : 'Madrid'),
      }))
    }, [])
    const visitTypes = useMemo(() => Array.from(new Set(allVisits.map((v) => v.type))).sort(), [])
    const locationOptions = useMemo(
      () => Array.from(new Set(allVisits.map((v) => v.locationCity))).sort(),
      []
    )
    const filteredVisits = useMemo(
      () => {
        let rows = allVisits.filter((v) => {
          const okType = visitFilter === 'all' || v.type === visitFilter
          const okRec = !recFilter || v.recommended
          const okAlicante = showAlicante || !v.alicante
          const okLoc = locationFilter === 'all' || v.locationCity === locationFilter
          return okType && okRec && okLoc && okAlicante
        })
        if (locationSort !== 'none') {
          rows = [...rows].sort((a, b) => {
            const ca = a.locationCity
            const cb = b.locationCity
            return locationSort === 'asc' ? ca.localeCompare(cb) : cb.localeCompare(ca)
          })
        }
        return rows
      },
      [allVisits, visitFilter, recFilter, locationFilter, locationSort, showAlicante]
    )
    return (
      <section className="visit-section">
        <div className="card visit-filters">
          <div className="filter-group">
            <label>Tipo de visita</label>
            <select value={visitFilter} onChange={(e) => setVisitFilter(e.target.value)}>
              <option value="all">Todas</option>
              {visitTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Ubicación</label>
            <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
              <option value="all">Todas</option>
              {locationOptions.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Ordenar por ubicación</label>
            <select value={locationSort} onChange={(e) => setLocationSort(e.target.value)}>
              <option value="none">Sin orden</option>
              <option value="asc">A → Z</option>
              <option value="desc">Z → A</option>
            </select>
          </div>
          <label className="check-toggle">
            <input type="checkbox" checked={recFilter} onChange={(e) => setRecFilter(e.target.checked)} />
            <span>Solo recomendados</span>
          </label>
          <label className="check-toggle">
            <input type="checkbox" checked={showAlicante} onChange={(e) => setShowAlicante(e.target.checked)} />
            <span>Incluir exposiciones de Alicante/Valencia</span>
          </label>
        </div>
        <div className="visit-grid">
          {filteredVisits.map((v) => {
            const city = v.locationCity || 'Madrid'
            return (
              <div className="card visit-card" key={v.name}>
                <div className="visit-head">
                  <span className="visit-icon">{v.icon}</span>
                  <div>
                    <h3>{v.name}</h3>
                    <span className="visit-type">{v.type}</span>
                    {v.recommended && <span className="visit-rec">Recomendado</span>}
                  </div>
                </div>
                <div className="visit-location">
                  <span className={`location-badge location-${city.toLowerCase().replace(/[^a-z]/g, '-')}`}>{city}</span>
                  <span className="location-hint">
                    {city === 'Madrid'
                      ? 'En la Comunidad de Madrid'
                      : city === 'Alicante'
                        ? 'En la provincia de Alicante'
                        : city === 'A Coruña' || city === 'Valencia' || city === 'Nacional'
                          ? `Ubicación: ${city}`
                          : 'Fuera de Madrid'}
                  </span>
                </div>
                <p className="visit-address">{v.address}</p>
                <div className="visit-meta">
                  <div>
                    <span className="meta-label">Horario</span>
                    <span className="meta-value">{v.hours}</span>
                  </div>
                  <div>
                    <span className="meta-label">Cita</span>
                    <span className="meta-value">{v.appointment}</span>
                  </div>
                  <div>
                    <span className="meta-label">Tecnología</span>
                    <span className="meta-value" style={{ color: TECH_COLORS[v.tech] }}>{techName(v.tech)}</span>
                  </div>
                </div>
                <p className="visit-what">{v.what}</p>
                <div className="visit-links">
                  {v.maps && (
                    <a className="company-link" href={v.maps} target="_blank" rel="noreferrer">
                      Ver en mapa
                    </a>
                  )}
                  {v.url && (
                    <a className="company-link" href={v.url} target="_blank" rel="noreferrer">
                      Web
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>
    )
  }

  return (
    <div className="dashboard">
      <header className="dash-header">
        <div>
          <h1>Casa Prefab Madrid</h1>
          <p>Panel de comparación de viviendas prefabricadas · datos orientativos · junio 2026</p>
        </div>
        <div className="dash-meta">
          <span>{models.length} modelos en base de datos</span>
          <span>Precios sin terreno</span>
        </div>
      </header>

      <nav className="tab-bar">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab-btn ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === 'overview' && <Overview />}
      {tab === 'models' && (
        <>
          <Filters />
          <ModelsTable />
        </>
      )}
      {tab === 'tech' && <Technologies />}
      {tab === 'companies' && <Companies />}
      {tab === 'visits' && <Visits />}

      <footer className="dash-footer">
        <p>Datos recopilados de fabricantes y medios especializados · Precios orientativos · Verifica cada presupuesto con la empresa correspondiente</p>
      </footer>
    </div>
  )
}

function Kpi({ label, value, sub }) {
  return (
    <div className="kpi-card card">
      <span className="kpi-label">{label}</span>
      <span className="kpi-value">{value}</span>
      <span className="kpi-sub">{sub}</span>
    </div>
  )
}
