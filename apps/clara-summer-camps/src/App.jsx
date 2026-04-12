import { useState, useMemo } from 'react'
import { camps, suggestedStrategy } from './data/camps'
import CampCard from './components/CampCard'
import PriceComparison from './components/PriceComparison'
import Filters, { activityCategories } from './components/Filters'
import './App.css'

const distanceOrder = {
  "En San Juan": 0,
  "En la playa de San Juan": 0,
  "En Playa San Juan": 0,
  "En la playa": 0,
}

function getWeeklyPrice(camp) {
  const weekly = camp.pricing.find(p =>
    (p.duration.includes('semana') || p.duration.includes('5 dia')) && !p.note?.includes('comedor')
  )
  return weekly && typeof weekly.price === 'number' ? weekly.price : null
}

export default function App() {
  const [filters, setFilters] = useState({
    tier: null,
    activity: 'all',
    eligibleOnly: true,
    sort: 'tier',
  })

  const filtered = useMemo(() => {
    let result = [...camps]

    if (filters.tier !== null) {
      result = result.filter(c => c.tier === filters.tier)
    }

    if (filters.eligibleOnly) {
      result = result.filter(c => c.claraEligible)
    }

    if (filters.activity !== 'all') {
      const cat = activityCategories.find(c => c.id === filters.activity)
      if (cat?.match) {
        result = result.filter(camp =>
          camp.activities.some(a =>
            cat.match.some(m => a.toLowerCase().includes(m.toLowerCase()))
          )
        )
      }
    }

    result.sort((a, b) => {
      switch (filters.sort) {
        case 'tier':
          return a.tier - b.tier
        case 'price-asc': {
          const pa = getWeeklyPrice(a) ?? 9999
          const pb = getWeeklyPrice(b) ?? 9999
          return pa - pb
        }
        case 'price-desc': {
          const pa = getWeeklyPrice(a) ?? 0
          const pb = getWeeklyPrice(b) ?? 0
          return pb - pa
        }
        case 'distance': {
          const da = distanceOrder[a.location.distanceFromSanJuan] ?? 1
          const db = distanceOrder[b.location.distanceFromSanJuan] ?? 1
          return da - db || a.tier - b.tier
        }
        default:
          return 0
      }
    })

    return result
  }, [filters])

  return (
    <div className="app">
      <header className="app-header">
        <h1>Campamentos de Verano para Clara</h1>
        <p className="subtitle">San Juan, Alicante - Julio 2026</p>
        <p className="context">Clara, 5 anos (cumple 6 en septiembre). Objetivo: campamentos de dia en espanol.</p>
      </header>

      <section className="strategy-section">
        <h2>{suggestedStrategy.title}</h2>
        <p>{suggestedStrategy.description}</p>
        <div className="strategy-options">
          {suggestedStrategy.options.map((opt, i) => (
            <div key={i} className="strategy-card">
              <span className="strategy-weeks">{opt.weeks}</span>
              <strong>{opt.camp}</strong>
              <p>{opt.reason}</p>
            </div>
          ))}
        </div>
      </section>

      <PriceComparison camps={camps} />

      <section className="camps-section">
        <h2>Campamentos ({filtered.length} de {camps.length})</h2>
        <Filters filters={filters} onChange={setFilters} />
        <div className="camps-list">
          {filtered.map(camp => (
            <CampCard key={camp.id} camp={camp} />
          ))}
          {filtered.length === 0 && (
            <p className="no-results">No hay campamentos que coincidan con los filtros seleccionados.</p>
          )}
        </div>
      </section>

      <footer className="app-footer">
        <p>Investigacion realizada: 12 abril 2026. Precios y fechas pueden cambiar. Verificar antes de inscribir.</p>
        <p>Fecha limite importante: Sagrados Corazones cierra inscripcion el 31 mayo 2026.</p>
      </footer>
    </div>
  )
}
