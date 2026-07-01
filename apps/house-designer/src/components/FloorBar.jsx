// Floor switcher strip: one tab per floor + an add button. Selecting a tab
// switches the active floor that the 2D editor edits.
export default function FloorBar({ project, onSelect, onAdd }) {
  const floors = project.floors || []
  const activeId = project.activeFloorId
  return (
    <div className="floor-bar">
      <span className="floor-bar-label">Floors</span>
      <div className="floor-tabs">
        {floors.map((f) => (
          <button
            key={f.id}
            className={`floor-tab ${f.id === activeId ? 'active' : ''}`}
            onClick={() => onSelect(f.id)}
            title={`Level ${f.level} m`}
          >
            {f.name}
          </button>
        ))}
        <button className="floor-add" onClick={onAdd} title="Add a new floor">＋</button>
      </div>
    </div>
  )
}