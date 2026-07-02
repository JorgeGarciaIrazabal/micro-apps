import { useState } from 'react'
import { CATALOG, STRUCTURE, STRUCTURE_BY_KEY } from '../lib/furniture/registry.js'
import { FurnitureGraphic } from './FurnitureGraphic.jsx'
import { IconSelect, IconWall, IconDoor, IconDoorDouble, IconDoorSliding, IconDoorFolding, IconWindow } from './Icons.jsx'

const STRUCTURE_ICONS = {
  'door': IconDoor,
  'door-double': IconDoorDouble,
  'door-sliding': IconDoorSliding,
  'door-folding': IconDoorFolding,
  'window': IconWindow,
}

// Catalog icon = the item's actual plan symbol, framed in a fitted viewBox.
// Consistent across platforms and previews exactly what lands on the plan.
function CatalogIcon({ it }) {
  const m = 0.1 * Math.max(it.width, it.depth)
  const s = Math.max(it.width, it.depth) + 2 * m
  return (
    <svg className="cat-icon" width={26} height={26} viewBox={`${-s / 2} ${-s / 2} ${s} ${s}`} aria-hidden="true">
      <FurnitureGraphic type={it.type} width={it.width} depth={it.depth} color={it.color} />
    </svg>
  )
}

// Left sidebar: tool selection (Select / Wall) + furniture catalog.
// Clicking a furniture item switches the active tool to "furniture:<type>".
// Each catalog category is collapsible.
export default function FurniturePanel({ tool, onTool }) {
  const activeType = tool.startsWith('furniture:') ? tool.split(':')[1] : null
  const activeOpening = tool.startsWith('opening:') ? tool.split(':')[1] : null
  const [collapsed, setCollapsed] = useState({})
  const [query, setQuery] = useState('')

  const toggle = (cat) => setCollapsed((c) => ({ ...c, [cat]: !c[cat] }))

  // Search filters by label/type across every category (structure included)
  // and overrides collapsing so matches are always visible.
  const q = query.trim().toLowerCase()
  const matches = (it) => !q || it.label.toLowerCase().includes(q) || it.type.toLowerCase().includes(q)
  const structureItems = STRUCTURE.filter(matches)
  const catalog = CATALOG
    .map((c) => ({ ...c, items: c.items.filter(matches) }))
    .filter((c) => c.items.length > 0)
  const isOpen = (cat) => (q ? true : !collapsed[cat])

  return (
    <aside className="panel furniture-panel">
      <div className="tools">
        <button
          className={`tool-btn ${tool === 'select' ? 'active' : ''}`}
          onClick={() => onTool('select')}
          title="Select / move (Esc)"
        >
          <span className="tool-ico"><IconSelect /></span>
          <span>Select</span>
        </button>
        <button
          className={`tool-btn ${tool === 'wall' ? 'active' : ''}`}
          onClick={() => onTool('wall')}
          title="Draw walls: click to chain, Enter/Esc to finish"
        >
          <span className="tool-ico"><IconWall /></span>
          <span>Wall</span>
        </button>
      </div>

      <div className="search-box">
        <input
          type="search"
          className="search-input"
          placeholder="Search components…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Escape') { setQuery(''); e.stopPropagation() } }}
          aria-label="Search components"
        />
      </div>

      <div className="catalog-scroll">
        <p className="catalog-hint">
          {tool === 'wall'
            ? 'Click to place wall points. Enter/Esc ends the chain.'
            : activeOpening
            ? `Click a wall to place a ${(STRUCTURE_BY_KEY[activeOpening]?.label || activeOpening).toLowerCase()}.`
            : activeType
            ? `Click the plan to place a ${activeType.replace('-', ' ')}.`
            : 'Pick an item, then click the plan to place it.'}
        </p>
        {q && structureItems.length === 0 && catalog.length === 0 && (
          <p className="catalog-hint">No components match “{query}”.</p>
        )}
        {structureItems.length > 0 && <div className="cat">
          <h4 className="cat-header" onClick={() => toggle('structure')}>
            <span>Structure</span>
            <span className="cat-caret">{isOpen('structure') ? '▾' : '▸'}</span>
          </h4>
          {isOpen('structure') && (
            <div className="cat-grid">
              {structureItems.map((it) => {
                const StructureIcon = STRUCTURE_ICONS[it.key] || IconDoor
                return (
                  <button
                    key={it.key}
                    className={`cat-item ${activeOpening === it.key ? 'active' : ''}`}
                    title={`${it.label} · ${it.width}m wide`}
                    onClick={() => onTool(`opening:${it.key}`)}
                  >
                    <span className="cat-icon"><StructureIcon /></span>
                    <span className="cat-label">{it.label}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>}
        {catalog.map((cat) => (
          <div key={cat.category} className="cat">
            <h4 className="cat-header" onClick={() => toggle(cat.category)}>
              <span>{cat.category}</span>
              <span className="cat-caret">{isOpen(cat.category) ? '▾' : '▸'}</span>
            </h4>
            {isOpen(cat.category) && (
              <div className="cat-grid">
                {cat.items.map((it) => (
                  <button
                    key={it.type}
                    className={`cat-item ${activeType === it.type ? 'active' : ''}`}
                    title={`${it.label} · ${it.width}×${it.depth}×${it.height} m`}
                    onClick={() => onTool(`furniture:${it.type}`)}
                  >
                    <CatalogIcon it={it} />
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
