import { IconPlus } from './Icons.jsx'
import { useT } from '../contexts/LangContext.jsx'

// Floor switcher strip: one tab per floor + an add button.
export default function FloorBar({ project, onSelect, onAdd }) {
  const { t } = useT()
  const floors = project.floors || []
  const activeId = project.activeFloorId
  return (
    <div className="floor-bar">
      <span className="floor-bar-label">{t('floorbar.floors')}</span>
      <div className="floor-tabs">
        {floors.map((f) => (
          <button
            key={f.id}
            className={`floor-tab ${f.id === activeId ? 'active' : ''}`}
            onClick={() => onSelect(f.id)}
            title={t('floorbar.level', { level: f.level })}
          >
            {f.name}
          </button>
        ))}
        <button className="floor-add" onClick={onAdd} title={t('floorbar.add')}><IconPlus size={14} /></button>
      </div>
    </div>
  )
}
