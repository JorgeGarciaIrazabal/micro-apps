import { useEffect, useRef } from 'react'
import { wallLength, activeFloor } from '../lib/project.js'
import { floorArea } from '../lib/rooms.js'
import * as M from '../lib/mutations.js'

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

function MetersField({ label, value, step, onChange, inputRef }) {
  return (
    <Field label={`${label} (m)`}>
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
  const deg = (f.rotation * 180) / Math.PI
  return (
    <div className="props-group">
      <h3>Furniture</h3>
      <Field label="Label">
        <input type="text" value={f.label} onChange={(e) => onChange({ label: e.target.value })} />
      </Field>
      <Field label="Color">
        <input type="color" value={f.color} onChange={(e) => onChange({ color: e.target.value })} />
      </Field>
      <div className="field-row">
        <MetersField label="Width" value={f.width} onChange={(v) => onChange({ width: clamp(v, 0.1, 10) })} />
        <MetersField label="Depth" value={f.depth} onChange={(v) => onChange({ depth: clamp(v, 0.1, 10) })} />
      </div>
      <div className="field-row">
        <MetersField label="Height" value={f.height} onChange={(v) => onChange({ height: clamp(v, 0.02, 4) })} />
        <Field label="Rotation (°)">
          <input type="number" step={15} value={round(deg, 1)}
            onChange={(e) => onChange({ rotation: (Number(e.target.value) * Math.PI) / 180 })} />
        </Field>
      </div>
      <div className="field-row">
        <MetersField label="X" value={f.x} onChange={(v) => onChange({ x: v })} />
        <MetersField label="Y" value={f.y} onChange={(v) => onChange({ y: v })} />
      </div>
      <div className="props-actions">
        <button onClick={() => onChange({ rotation: (f.rotation + Math.PI / 2) % (Math.PI * 2) })}>Rotate 90°</button>
        <button onClick={onDuplicate} title="Ctrl+D">Duplicate</button>
        <button className="danger" onClick={onDelete}>Delete</button>
      </div>
    </div>
  )
}

function WallProps({ w, onChange, onDelete, onDuplicate, focusLenToken }) {
  const lenRef = useRef(null)
  const len = wallLength(w)
  useEffect(() => {
    if (!focusLenToken) return
    lenRef.current?.focus()
    lenRef.current?.select()
  }, [focusLenToken])
  // Resize the wall along its own direction: keep the angle, move endpoint 2.
  const setLength = (newLen) => {
    const L = wallLength(w)
    if (L < 1e-6 || newLen <= 0) return
    const ux = (w.x2 - w.x1) / L, uy = (w.y2 - w.y1) / L
    onChange({ x2: w.x1 + newLen * ux, y2: w.y1 + newLen * uy })
  }
  return (
    <div className="props-group">
      <h3>Wall</h3>
      <MetersField label="Length" value={len} inputRef={lenRef}
        onChange={(v) => setLength(clamp(v, 0.05, 50))} />
      <MetersField label="Thickness" value={w.thickness} onChange={(v) => onChange({ thickness: clamp(v, 0.05, 0.6) })} />
      <div className="field-row">
        <MetersField label="X1" value={w.x1} onChange={(v) => onChange({ x1: v })} />
        <MetersField label="Y1" value={w.y1} onChange={(v) => onChange({ y1: v })} />
      </div>
      <div className="field-row">
        <MetersField label="X2" value={w.x2} onChange={(v) => onChange({ x2: v })} />
        <MetersField label="Y2" value={w.y2} onChange={(v) => onChange({ y2: v })} />
      </div>
      <div className="props-actions">
        <button onClick={onDuplicate} title="Ctrl+D">Duplicate</button>
        <button className="danger" onClick={onDelete}>Delete wall</button>
      </div>
    </div>
  )
}

function OpeningProps({ o, floor, onChange, onDelete }) {
  const wall = floor.walls.find((w) => w.id === o.wallId)
  const wallLen = wall ? wallLength(wall) : 0
  const maxOff = Math.max(0, wallLen - o.width / 2)
  return (
    <div className="props-group">
      <h3>{o.type === 'window' ? 'Window' : 'Door'}</h3>
      <Field label="Type">
        <div className="seg">
          <button className={o.type === 'door' ? 'active' : ''} onClick={() => onChange({ type: 'door', sill: 0 })}>Door</button>
          <button className={o.type === 'window' ? 'active' : ''} onClick={() => onChange({ type: 'window', sill: o.sill > 0 ? o.sill : 1.0 })}>Window</button>
        </div>
      </Field>
      {o.type === 'door' && (
        <Field label="Door style">
          <div className="seg seg-wrap">
            {[['swing', 'Swing'], ['double', 'Double'], ['sliding', 'Sliding'], ['folding', 'Folding']].map(([s, lbl]) => (
              <button key={s} className={(o.style || 'swing') === s ? 'active' : ''}
                onClick={() => onChange({ style: s })}>{lbl}</button>
            ))}
          </div>
        </Field>
      )}
      <MetersField label="Width" value={o.width} onChange={(v) => onChange({ width: clamp(v, 0.3, 3) })} />
      <div className="field-row">
        <MetersField label="Height" value={o.height} onChange={(v) => onChange({ height: clamp(v, 0.3, 4) })} />
        <MetersField label="Sill" value={o.sill} onChange={(v) => onChange({ sill: clamp(v, 0, 3) })} />
      </div>
      {o.type === 'door' && o.style !== 'sliding' && (
        <Field label="Orientation">
          <div className="seg" style={{ width: '100%' }}>
            <button onClick={() => onChange({ hinge: o.hinge === 1 ? 0 : 1 })}>Flip hinge ↔</button>
            <button onClick={() => onChange({ side: o.side > 0 ? -1 : 1 })}>Flip swing ↕</button>
          </div>
        </Field>
      )}
      <MetersField label="Offset along wall" value={Math.min(o.offset, maxOff)}
        onChange={(v) => onChange({ offset: clamp(v, o.width / 2, maxOff) })} />
      <p className="catalog-hint" style={{ marginTop: 10 }}>
        {wall ? `On wall ${wallLen.toFixed(2)} m long.` : 'Wall was removed.'}
      </p>
      <div className="props-actions">
        <button className="danger" onClick={onDelete}>Delete opening</button>
      </div>
    </div>
  )
}

function ProjectProps({ project, onChangeSettings, onAddFloor, onDeleteFloor, onFloorProp }) {
  const s = project.settings
  const fl = activeFloor(project) || { walls: [], furniture: [], openings: [], name: '', level: 0 }
  const area = floorArea(fl)
  const canDelete = (project.floors || []).length > 1
  return (
    <div className="props-group">
      <h3>Project</h3>
      <MetersField label="Wall height" value={s.wallHeight} onChange={(v) => onChangeSettings({ wallHeight: clamp(v, 2.4, 6) })} />
      <MetersField label="Wall thickness" value={s.wallThickness} onChange={(v) => onChangeSettings({ wallThickness: clamp(v, 0.05, 0.6) })} />
      <MetersField label="Grid snap" step={0.05} value={s.gridSize ?? 0.1} onChange={(v) => onChangeSettings({ gridSize: clamp(v, 0.01, 1) })} />

      <h3 style={{ marginTop: 18 }}>Active floor</h3>
      <Field label="Floor name">
        <input type="text" value={fl.name} onChange={(e) => onFloorProp({ name: e.target.value })} />
      </Field>
      <MetersField label="Elevation (level)" value={fl.level}
        onChange={(v) => onFloorProp({ level: clamp(v, -10, 30) })} />
      <div className="props-actions">
        <button onClick={onAddFloor}>＋ Add floor</button>
        <button className="danger" onClick={onDeleteFloor} disabled={!canDelete}>Delete floor</button>
      </div>

      <div className="stats">
        <div><span>Walls</span><b>{fl.walls.length}</b></div>
        <div><span>Items</span><b>{fl.furniture.length}</b></div>
        <div><span>Floors</span><b>{(project.floors || []).length}</b></div>
        <div><span>{area.exact ? 'Floor area' : 'Approx. area (bbox)'}</span><b>{area.area.toFixed(2)} m²</b></div>
      </div>
    </div>
  )
}

function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)) }