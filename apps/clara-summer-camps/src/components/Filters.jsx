import { tierLabels } from '../data/camps'

const activityCategories = [
  { id: "all", label: "Todos" },
  { id: "creative", label: "Creativo / Arte", match: ["Pintura", "Manualidades", "Talleres creativos", "Talleres artisticos", "Escritura creativa"] },
  { id: "water", label: "Acuatico", match: ["Surf", "Kayak", "Paddle Surf", "Natacion", "Juegos acuaticos"] },
  { id: "sport", label: "Deportivo", match: ["Padel", "Tenis", "Atletismo", "Judo", "Deportes"] },
  { id: "music", label: "Musical", match: ["Piano", "Guitarra", "Canto", "Musica", "Bateria"] },
  { id: "dance", label: "Baile / Teatro", match: ["Baile", "Coreografias", "teatro", "danza", "ballet"] },
]

export default function Filters({ filters, onChange }) {
  return (
    <div className="filters">
      <div className="filter-group">
        <label>Nivel de recomendacion:</label>
        <div className="filter-chips">
          <button
            className={`chip ${filters.tier === null ? 'active' : ''}`}
            onClick={() => onChange({ ...filters, tier: null })}
          >
            Todos
          </button>
          {Object.entries(tierLabels).map(([tier, { label, color, bg }]) => (
            <button
              key={tier}
              className={`chip ${filters.tier === Number(tier) ? 'active' : ''}`}
              style={filters.tier === Number(tier) ? { background: bg, color, borderColor: color } : {}}
              onClick={() => onChange({ ...filters, tier: filters.tier === Number(tier) ? null : Number(tier) })}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <label>Tipo de actividad:</label>
        <div className="filter-chips">
          {activityCategories.map(cat => (
            <button
              key={cat.id}
              className={`chip ${filters.activity === cat.id ? 'active' : ''}`}
              onClick={() => onChange({ ...filters, activity: filters.activity === cat.id ? 'all' : cat.id })}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <label>
          <input
            type="checkbox"
            checked={filters.eligibleOnly}
            onChange={e => onChange({ ...filters, eligibleOnly: e.target.checked })}
          />
          {' '}Solo campamentos donde Clara puede inscribirse
        </label>
      </div>

      <div className="filter-group">
        <label>Ordenar por:</label>
        <select
          value={filters.sort}
          onChange={e => onChange({ ...filters, sort: e.target.value })}
        >
          <option value="tier">Recomendacion</option>
          <option value="price-asc">Precio (menor a mayor)</option>
          <option value="price-desc">Precio (mayor a menor)</option>
          <option value="distance">Proximidad a San Juan</option>
        </select>
      </div>
    </div>
  )
}

export { activityCategories }
