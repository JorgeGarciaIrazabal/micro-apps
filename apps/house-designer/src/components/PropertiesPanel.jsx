import { useEffect, useRef } from 'react'
import { wallLength, activeFloor } from '../lib/project.js'
import { floorArea } from '../lib/rooms.js'
import * as M from '../lib/mutations.js'
import { useT } from '../contexts/LangContext.jsx'

// Right sidebar. Edits the selected wall/furniture, or project settings when
// nothing is selected.
export default function PropertiesPanel({ project, selectedId, commit, onDelete, onDuplicate, focusLenToken,
  onAddFloor, onDeleteFloor, onFloorProp }) {
  const floor = activeFloor(project) || { walls: [], furniture: [], openings: [] }
  const furn = floor.furniture.find((f) => f.id === selectedId) || null
  const wall = !furn ? floor.walls.find((w) => w.id === selectedId) || null : null
  const opening = (!furn && !wall) ? (floor.openings || []).find((o) => o.id === selectedId) || null : null

  function patchSel(patch) {
    commit((p) => M.patchElement(p, selectedId, patch))
  }

  function patchSettings(patch) {
    commit((p) => M.patchSettings(p, patch))
  }

  return (
    <aside className="panel props-panel">
      {furn ? (
        <FurnitureProps f={furn} onChange={patchSel} onDelete={onDelete} onDuplicate={onDuplicate} />
      ) : wall ? (
        <WallProps w={wall} onChange={patchSel} onDelete={onDelete} onDuplicate={onDuplicate} focusLenToken={focusLenToken} />
      ) : opening ? (
        <OpeningProps o={opening} floor={floor} onChange={patchSel} onDelete={onDelete} />
      ) : (
        <ProjectProps project={project} onChangeSettings={patchSettings}
          onAddFloor={onAddFloor} onDeleteFloor={onDeleteFloor} onFloorProp={onFloorProp} />
      )}
    </aside>
  )
}

function Field({ label, children }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
    </label>
  )
}

function MetersField({ label, value, step, onChange, inputRef, t }) {
  return (
    <Field label={`${label}${t('props.m')}`}>
      <input
        ref={inputRef}
        type="number"
        step={step ?? 0.05}
        value={round(value, 3)}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </Field>
  )
}

function round(v, d) {
  const p = 10 ** d
  return Math.round(v * p) / p
}

function FurnitureProps({ f, onChange, onDelete, onDuplicate }) {
  const { t } = useT()
  const deg = (f.rotation * 180) / Math.PI
  return (
    <div className="props-group">
      <h3>{t('props.furniture')}</h3>
      <Field label={t('props.label')}>
        <input type="text" value={f.label} onChange={(e) => onChange({ label: e.target.value })} />
      </Field>
      <Field label={t('props.color')}>
        <input type="color" value={f.color} onChange={(e) => onChange({ color: e.target.value })} />
      </Field>
      <div className="field-row">
        <MetersField t={t} label={t('props.width')} value={f.width} onChange={(v) => onChange({ width: clamp(v, 0.1, 10) })} />
        <MetersField t={t} label={t('props.depth')} value={f.depth} onChange={(v) => onChange({ depth: clamp(v, 0.1, 10) })} />
      </div>
      <div className="field-row">
        <MetersField t={t} label={t('props.height')} value={f.height} onChange={(v) => onChange({ height: clamp(v, 0.02, 4) })} />
        <Field label={t('props.rotation')}>
          <input type="number" step={15} value={round(deg, 1)}
            onChange={(e) => onChange({ rotation: (Number(e.target.value) * Math.PI) / 180 })} />
        </Field>
      </div>
      <div className="field-row">
        <MetersField t={t} label={t('props.x')} value={f.x} onChange={(v) => onChange({ x: v })} />
        <MetersField t={t} label={t('props.y')} value={f.y} onChange={(v) => onChange({ y: v })} />
      </div>
      <div className="props-actions">
        <button onClick={() => onChange({ rotation: (f.rotation + Math.PI / 2) % (Math.PI * 2) })}>{t('props.rotate_90')}</button>
        <button onClick={onDuplicate} title="Ctrl+D">{t('props.duplicate')}</button>
        <button className="danger" onClick={onDelete}>{t('props.delete')}</button>
      </div>
    </div>
  )
}

function WallProps({ w, onChange, onDelete, onDuplicate, focusLenToken }) {
  const { t } = useT()
  const lenRef = useRef(null)
  const len = wallLength(w)
  useEffect(() => {
    if (!focusLenToken) return
    lenRef.current?.focus()
    lenRef.current?.select()
  }, [focusLenToken])
  const setLength = (newLen) => {
    const L = wallLength(w)
    if (L < 1e-6 || newLen <= 0) return
    const ux = (w.x2 - w.x1) / L, uy = (w.y2 - w.y1) / L
    onChange({ x2: w.x1 + newLen * ux, y2: w.y1 + newLen * uy })
  }
  return (
    <div className="props-group">
      <h3>{t('props.wall')}</h3>
      <MetersField t={t} label={t('props.length')} value={len} inputRef={lenRef}
        onChange={(v) => setLength(clamp(v, 0.05, 50))} />
      <MetersField t={t} label={t('props.thickness')} value={w.thickness} onChange={(v) => onChange({ thickness: clamp(v, 0.05, 0.6) })} />
      <div className="field-row">
        <MetersField t={t} label="X1" value={w.x1} onChange={(v) => onChange({ x1: v })} />
        <MetersField t={t} label="Y1" value={w.y1} onChange={(v) => onChange({ y1: v })} />
      </div>
      <div className="field-row">
        <MetersField t={t} label="X2" value={w.x2} onChange={(v) => onChange({ x2: v })} />
        <MetersField t={t} label="Y2" value={w.y2} onChange={(v) => onChange({ y2: v })} />
      </div>
      <div className="props-actions">
        <button onClick={onDuplicate} title="Ctrl+D">{t('props.duplicate')}</button>
        <button className="danger" onClick={onDelete}>{t('props.delete_wall')}</button>
      </div>
    </div>
  )
}

function OpeningProps({ o, floor, onChange, onDelete }) {
  const { t } = useT()
  const wall = floor.walls.find((w) => w.id === o.wallId)
  const wallLen = wall ? wallLength(wall) : 0
  const maxOff = Math.max(0, wallLen - o.width / 2)
  const doorStyles = [
    ['swing', t('props.style.swing')],
    ['double', t('props.style.double')],
    ['sliding', t('props.style.sliding')],
    ['folding', t('props.style.folding')],
  ]
  return (
    <div className="props-group">
      <h3>{o.type === 'window' ? t('props.window') : t('props.door')}</h3>
      <Field label={t('props.type')}>
        <div className="seg">
          <button className={o.type === 'door' ? 'active' : ''} onClick={() => onChange({ type: 'door', sill: 0 })}>{t('props.door')}</button>
          <button className={o.type === 'window' ? 'active' : ''} onClick={() => onChange({ type: 'window', sill: o.sill > 0 ? o.sill : 1.0 })}>{t('props.window')}</button>
        </div>
      </Field>
      {o.type === 'door' && (
        <Field label={t('props.door_style')}>
          <div className="seg seg-wrap">
            {doorStyles.map(([s, lbl]) => (
              <button key={s} className={(o.style || 'swing') === s ? 'active' : ''}
                onClick={() => onChange({ style: s })}>{lbl}</button>
            ))}
          </div>
        </Field>
      )}
      <MetersField t={t} label={t('props.width')} value={o.width} onChange={(v) => onChange({ width: clamp(v, 0.3, 3) })} />
      <div className="field-row">
        <MetersField t={t} label={t('props.height')} value={o.height} onChange={(v) => onChange({ height: clamp(v, 0.3, 4) })} />
        <MetersField t={t} label={t('props.sill')} value={o.sill} onChange={(v) => onChange({ sill: clamp(v, 0, 3) })} />
      </div>
      {o.type === 'door' && o.style !== 'sliding' && (
        <Field label={t('props.orientation')}>
          <div className="seg" style={{ width: '100%' }}>
            <button onClick={() => onChange({ hinge: o.hinge === 1 ? 0 : 1 })}>{t('props.flip_hinge')}</button>
            <button onClick={() => onChange({ side: o.side > 0 ? -1 : 1 })}>{t('props.flip_swing')}</button>
          </div>
        </Field>
      )}
      <MetersField t={t} label={t('props.offset')} value={Math.min(o.offset, maxOff)}
        onChange={(v) => onChange({ offset: clamp(v, o.width / 2, maxOff) })} />
      <p className="catalog-hint" style={{ marginTop: 10 }}>
        {wall ? t('props.on_wall', { len: wallLen.toFixed(2) }) : t('props.wall_removed')}
      </p>
      <div className="props-actions">
        <button className="danger" onClick={onDelete}>{t('props.delete_opening')}</button>
      </div>
    </div>
  )
}

function ProjectProps({ project, onChangeSettings, onAddFloor, onDeleteFloor, onFloorProp }) {
  const { t } = useT()
  const s = project.settings
  const fl = activeFloor(project) || { walls: [], furniture: [], openings: [], name: '', level: 0 }
  const area = floorArea(fl)
  const canDelete = (project.floors || []).length > 1
  return (
    <div className="props-group">
      <h3>{t('props.project')}</h3>
      <MetersField t={t} label={t('props.wall_height')} value={s.wallHeight} onChange={(v) => onChangeSettings({ wallHeight: clamp(v, 2.4, 6) })} />
      <MetersField t={t} label={t('props.wall_thickness')} value={s.wallThickness} onChange={(v) => onChangeSettings({ wallThickness: clamp(v, 0.05, 0.6) })} />
      <MetersField t={t} label={t('props.grid_snap')} step={0.05} value={s.gridSize ?? 0.1} onChange={(v) => onChangeSettings({ gridSize: clamp(v, 0.01, 1) })} />

      <h3 style={{ marginTop: 18 }}>{t('props.active_floor')}</h3>
      <Field label={t('props.floor_name')}>
        <input type="text" value={fl.name} onChange={(e) => onFloorProp({ name: e.target.value })} />
      </Field>
      <MetersField t={t} label={t('props.elevation')} value={fl.level}
        onChange={(v) => onFloorProp({ level: clamp(v, -10, 30) })} />
      <div className="props-actions">
        <button onClick={onAddFloor}>{t('props.add_floor')}</button>
        <button className="danger" onClick={onDeleteFloor} disabled={!canDelete}>{t('props.delete_floor')}</button>
      </div>

      <div className="stats">
        <div><span>{t('props.walls_count')}</span><b>{fl.walls.length}</b></div>
        <div><span>{t('props.items_count')}</span><b>{fl.furniture.length}</b></div>
        <div><span>{t('props.floors_count')}</span><b>{(project.floors || []).length}</b></div>
        <div><span>{area.exact ? t('props.floor_area') : t('props.approx_area')}</span><b>{area.area.toFixed(2)} m²</b></div>
      </div>
    </div>
  )
}

function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)) }
