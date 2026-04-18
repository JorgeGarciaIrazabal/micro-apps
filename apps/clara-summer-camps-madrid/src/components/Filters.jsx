import { tierLabels } from '../data/camps'

const activityCategories = [
  { id: "all", label: "Todos" },
  { id: "creative", label: "Creativo / Arte", match: ["Pintura", "Dibujo", "Escultura", "Ilustracion", "Mural", "Manualidades", "Talleres creativos", "Talleres artisticos", "Arte"] },
  { id: "sport", label: "Deportivo", match: ["Futbol", "Padel", "Tenis", "Golf", "Deportes", "Multideporte", "Beisbol", "Badminton", "Voleibol"] },
  { id: "music", label: "Musical", match: ["Canto", "Musica", "Vocal"] },
  { id: "dance", label: "Baile / Teatro", match: ["Baile", "Danza", "Teatro", "Interpretacion", "Actuacion", "Escenicas"] },
  { id: "science", label: "Ciencias", match: ["Ciencias", "Experimentos", "Naturaleza", "Exploracion"] },
  { id: "water", label: "Acuatico", match: ["Natacion", "Surf", "Kayak", "Piscina"] },
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
          <option value="distance">Proximidad a Penagrande</option>
        </select>
      </div>
    </div>
  )
}

export { activityCategories }
