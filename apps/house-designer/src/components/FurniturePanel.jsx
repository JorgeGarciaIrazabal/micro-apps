import { useState } from 'react'
import { CATALOG, STRUCTURE, STRUCTURE_BY_KEY } from '../lib/furniture/registry.js'
import { FurnitureGraphic } from './FurnitureGraphic.jsx'
import { IconSelect, IconWall, IconDoor, IconDoorDouble, IconDoorSliding, IconDoorFolding, IconWindow } from './Icons.jsx'
import { useT } from '../contexts/LangContext.jsx'
import { catKey } from '../lib/i18n.js'

const STRUCTURE_ICONS = {
  'door': IconDoor,
  'door-double': IconDoorDouble,
  'door-sliding': IconDoorSliding,
  'door-folding': IconDoorFolding,
  'window': IconWindow,
}

function CatalogIcon({ it }) {
  const m = 0.1 * Math.max(it.width, it.depth)
  const s = Math.max(it.width, it.depth) + 2 * m
  return (
    <svg className="cat-icon" width={26} height={26} viewBox={`${-s / 2} ${-s / 2} ${s} ${s}`} aria-hidden="true">
      <FurnitureGraphic type={it.type} width={it.width} depth={it.depth} color={it.color} />
    </svg>
  )
}

function startDrag(e, data) {
  const svg = e.currentTarget.querySelector('svg')
  if (svg) {
    const SIZE = 72
    const ghost = svg.cloneNode(true)
    ghost.setAttribute('width', SIZE)
    ghost.setAttribute('height', SIZE)
    ghost.style.cssText = `position:fixed;left:-9999px;top:0;background:#fff;border-radius:8px;padding:8px;box-shadow:0 3px 12px rgba(0,0,0,0.22);`
    document.body.appendChild(ghost)
    e.dataTransfer.setDragImage(ghost, SIZE / 2, SIZE / 2)
    requestAnimationFrame(() => document.body.removeChild(ghost))
  }
  e.dataTransfer.effectAllowed = 'copy'
  e.dataTransfer.setData('application/house-designer', JSON.stringify(data))
}

// Left sidebar: tool selection (Select / Wall) + furniture catalog.
export default function FurniturePanel({ tool, onTool }) {
  const { t } = useT()
  const activeType = tool.startsWith('furniture:') ? tool.split(':')[1] : null
  const activeOpening = tool.startsWith('opening:') ? tool.split(':')[1] : null
  const [collapsed, setCollapsed] = useState({})
  const [query, setQuery] = useState('')

  const toggle = (cat) => setCollapsed((c) => ({ ...c, [cat]: !c[cat] }))

  const itemLabel = (it) => t(`furniture.${it.type}`)
  const openingLabel = (it) => t(`opening.${it.key}`)

  const q = query.trim().toLowerCase()
  const matchesFurn = (it) => !q || itemLabel(it).toLowerCase().includes(q) || it.type.toLowerCase().includes(q)
  const matchesOpening = (it) => !q || openingLabel(it).toLowerCase().includes(q) || it.key.toLowerCase().includes(q)

  const structureItems = STRUCTURE.filter(matchesOpening)
  const catalog = CATALOG
    .map((c) => ({ ...c, items: c.items.filter(matchesFurn) }))
    .filter((c) => c.items.length > 0)
  const isOpen = (cat) => (q ? true : !collapsed[cat])

  const hint = tool === 'wall'
    ? t('panel.hint_wall')
    : activeOpening
    ? t('panel.hint_opening', { label: openingLabel(STRUCTURE_BY_KEY[activeOpening] || { key: activeOpening }).toLowerCase() })
    : activeType
    ? t('panel.hint_furniture', { type: activeType.replace('-', ' ') })
    : t('panel.hint_select')

  return (
    <aside className="panel furniture-panel">
      <div className="tools">
        <button
          className={`tool-btn ${tool === 'select' ? 'active' : ''}`}
          onClick={() => onTool('select')}
          title={t('panel.select_title')}
        >
          <span className="tool-ico"><IconSelect /></span>
          <span>{t('panel.select')}</span>
        </button>
        <button
          className={`tool-btn ${tool === 'wall' ? 'active' : ''}`}
          onClick={() => onTool('wall')}
          title={t('panel.wall_title')}
        >
          <span className="tool-ico"><IconWall /></span>
          <span>{t('panel.wall')}</span>
        </button>
      </div>

      <div className="search-box">
        <input
          type="search"
          className="search-input"
          placeholder={t('panel.search_placeholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Escape') { setQuery(''); e.stopPropagation() } }}
          aria-label={t('panel.search_label')}
        />
      </div>

      <div className="catalog-scroll">
        <p className="catalog-hint">{hint}</p>
        {q && structureItems.length === 0 && catalog.length === 0 && (
          <p className="catalog-hint">{t('panel.no_results', { query })}</p>
        )}
        {structureItems.length > 0 && <div className="cat">
          <h4 className="cat-header" onClick={() => toggle('structure')}>
            <span>{t('panel.structure')}</span>
            <span className="cat-caret">{isOpen('structure') ? '▾' : '▸'}</span>
          </h4>
          {isOpen('structure') && (
            <div className="cat-grid">
              {structureItems.map((it) => {
                const StructureIcon = STRUCTURE_ICONS[it.key] || IconDoor
                const label = openingLabel(it)
                return (
                  <button
                    key={it.key}
                    className={`cat-item ${activeOpening === it.key ? 'active' : ''}`}
                    title={`${label} · ${it.width}m`}
                    draggable
                    onDragStart={(e) => startDrag(e, { kind: 'opening', key: it.key })}
                    onClick={() => onTool(`opening:${it.key}`)}
                  >
                    <span className="cat-icon"><StructureIcon /></span>
                    <span className="cat-label">{label}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>}
        {catalog.map((cat) => (
          <div key={cat.category} className="cat">
            <h4 className="cat-header" onClick={() => toggle(cat.category)}>
              <span>{t(catKey(cat.category))}</span>
              <span className="cat-caret">{isOpen(cat.category) ? '▾' : '▸'}</span>
            </h4>
            {isOpen(cat.category) && (
              <div className="cat-grid">
                {cat.items.map((it) => {
                  const label = itemLabel(it)
                  return (
                    <button
                      key={it.type}
                      className={`cat-item ${activeType === it.type ? 'active' : ''}`}
                      title={`${label} · ${it.width}×${it.depth}×${it.height} m`}
                      draggable
                      onDragStart={(e) => startDrag(e, { kind: 'furniture', type: it.type })}
                      onClick={() => onTool(`furniture:${it.type}`)}
                    >
                      <CatalogIcon it={it} />
                      <span className="cat-label">{label}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  )
}
