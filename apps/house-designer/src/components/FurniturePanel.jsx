import { useState } from 'react'
import { CATALOG, STRUCTURE } from '../lib/furniture.js'

// Left sidebar: tool selection (Select / Wall) + furniture catalog.
// Clicking a furniture item switches the active tool to "furniture:<type>".
// Each catalog category is collapsible.
export default function FurniturePanel({ tool, onTool }) {
  const activeType = tool.startsWith('furniture:') ? tool.split(':')[1] : null
  const activeOpening = tool.startsWith('opening:') ? tool.split(':')[1] : null
  const [collapsed, setCollapsed] = useState({})

  const toggle = (cat) => setCollapsed((c) => ({ ...c, [cat]: !c[cat] }))

  return (
    <aside className="panel furniture-panel">
      <div className="tools">
        <button
          className={`tool-btn ${tool === 'select' ? 'active' : ''}`}
          onClick={() => onTool('select')}
          title="Select / move (Esc)"
        >
          <span className="tool-ico">🖱️</span>
          <span>Select</span>
        </button>
        <button
          className={`tool-btn ${tool === 'wall' ? 'active' : ''}`}
          onClick={() => onTool('wall')}
          title="Draw walls: click to chain, Enter/Esc to finish"
        >
          <span className="tool-ico">📏</span>
          <span>Wall</span>
        </button>
      </div>

      <div className="catalog-scroll">
        <p className="catalog-hint">
          {tool === 'wall'
            ? 'Click to place wall points. Enter/Esc ends the chain.'
            : activeOpening
            ? `Click a wall to place a ${activeOpening}.`
            : activeType
            ? `Click the plan to place a ${activeType.replace('-', ' ')}.`
            : 'Pick an item, then click the plan to place it.'}
        </p>
        <div className="cat">
          <h4 className="cat-header" onClick={() => toggle('structure')}>
            <span>Structure</span>
            <span className="cat-caret">{collapsed.structure ? '▸' : '▾'}</span>
          </h4>
          {!collapsed.structure && (
            <div className="cat-grid">
              {STRUCTURE.map((it) => (
                <button
                  key={it.type}
                  className={`cat-item ${activeOpening === it.type ? 'active' : ''}`}
                  title={`${it.label} · ${it.width}m wide`}
                  onClick={() => onTool(`opening:${it.type}`)}
                >
                  <span className="cat-icon">{it.icon}</span>
                  <span className="cat-label">{it.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        {CATALOG.map((cat) => (
          <div key={cat.category} className="cat">
            <h4 className="cat-header" onClick={() => toggle(cat.category)}>
              <span>{cat.category}</span>
              <span className="cat-caret">{collapsed[cat.category] ? '▸' : '▾'}</span>
            </h4>
            {!collapsed[cat.category] && (
              <div className="cat-grid">
                {cat.items.map((it) => (
                  <button
                    key={it.type}
                    className={`cat-item ${activeType === it.type ? 'active' : ''}`}
                    title={`${it.label} · ${it.width}×${it.depth}×${it.height} m`}
                    onClick={() => onTool(`furniture:${it.type}`)}
                  >
                    <span className="cat-icon">{it.icon}</span>
                    <span className="cat-label">{it.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  )
}