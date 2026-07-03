// Project data model for House Designer micro-app.
// All geometry is stored in METERS in the project model; the 2D editor maps
// meters -> screen pixels via a scale factor (zoom). This keeps the on-disk
// format resolution-independent and easy to share.

import { dist } from './geometry.js'

export const PROJECT_VERSION = 1

// ---- id generation -------------------------------------------------------
let _seq = 0
export function uid(prefix = 'id') {
  _seq = (_seq + 1) % 1e9
  return `${prefix}_${Date.now().toString(36)}_${(_seq).toString(36)}`
}

// ---- units --------------------------------------------------------------
// Convert a length in meters to a display string (always metric).
export function fmtLength(m) {
  if (m == null || Number.isNaN(m)) return ''
  return `${m.toFixed(2)} m`
}

// ---- geometry helpers ---------------------------------------------------
export function wallLength(w) {
  return dist(w.x1, w.y1, w.x2, w.y2)
}

export function fmtWallLabel(w) {
  const len = wallLength(w)
  if (len < 1e-4) return ''
  return fmtLength(len).replace(/\s/, '\u00A0')
}

// ---- default + serialization -------------------------------------------
export function makeFloor(name = 'Ground', level = 0) {
  return { id: uid('floor'), name, level, walls: [], furniture: [], openings: [] }
}

export function createProject(name = 'Untitled Project') {
  const ground = makeFloor('Ground', 0)
  return {
    version: PROJECT_VERSION,
    name,
    // `units` is display-intent only (storage is always meters); ft display is
    // intentionally unimplemented but the field round-trips per the spec.
    settings: { units: 'm', wallHeight: 2.7, wallThickness: 0.15, gridSize: 0.1 },
    floors: [ground],
    activeFloorId: ground.id,
  }
}

// Coerce/validate a parsed object into a sound project. Tolerant on import
// so partial files from older versions or hand-edits still load.
export function normalizeProject(input) {
  const p = { ...createProject(input?.name) }
  if (typeof input?.name === 'string') p.name = input.name

  const s = { ...p.settings, ...(input?.settings || {}) }
  s.units = s.units === 'ft' ? 'ft' : 'm'
  s.wallHeight = clampNum(s.wallHeight, 2.4, 6, 2.7)
  s.wallThickness = clampNum(s.wallThickness, 0.05, 0.6, 0.15)
  s.gridSize = clampNum(s.gridSize, 0.01, 1.0, 0.1)
  p.settings = s

  if (Array.isArray(input?.floors) && input.floors.length) {
    p.floors = input.floors.map((f, i) => coerceFloor(f, i * 3))
    // ensure unique ids
    const seen = new Set()
    for (const f of p.floors) { if (seen.has(f.id)) f.id = uid('floor'); seen.add(f.id) }
    const want = typeof input.activeFloorId === 'string' ? input.activeFloorId : null
    p.activeFloorId = want && p.floors.some((f) => f.id === want) ? want : p.floors[0].id
  } else {
    // Migrate a pre-floors (flat walls/furniture/openings) project into one floor.
    const ground = makeFloor('Ground', 0)
    ground.walls = (Array.isArray(input?.walls) ? input.walls : []).map(coerceWall).filter(Boolean)
    ground.furniture = (Array.isArray(input?.furniture) ? input.furniture : []).map(coerceFurniture).filter(Boolean)
    ground.openings = (Array.isArray(input?.openings) ? input.openings : []).map(coerceOpening).filter(Boolean)
    p.floors = [ground]
    p.activeFloorId = ground.id
  }
  return p
}

function clampNum(v, lo, hi, dflt) {
  const n = Number(v)
  if (Number.isNaN(n)) return dflt
  return Math.min(hi, Math.max(lo, n))
}

function num(v, dflt) {
  const n = Number(v)
  return Number.isNaN(n) ? dflt : n
}

function coerceWall(w) {
  if (!w || typeof w !== 'object') return null
  const out = {
    id: typeof w.id === 'string' ? w.id : uid('w'),
    x1: num(w.x1, 0), y1: num(w.y1, 0),
    x2: num(w.x2, 0), y2: num(w.y2, 0),
    thickness: clampNum(w.thickness, 0.05, 0.6, 0.15),
  }
  // Skip zero-length walls (degenerate)
  if (dist(out.x1, out.y1, out.x2, out.y2) < 1e-4) return null
  return out
}

function coerceFurniture(f) {
  if (!f || typeof f !== 'object') return null
  return {
    id: typeof f.id === 'string' ? f.id : uid('f'),
    type: typeof f.type === 'string' ? f.type : 'box',
    x: num(f.x, 0), y: num(f.y, 0),
    rotation: num(f.rotation, 0),
    width: clampNum(f.width, 0.05, 10, 0.5),
    depth: clampNum(f.depth, 0.05, 10, 0.5),
    height: clampNum(f.height, 0.05, 4, 0.5),
    color: typeof f.color === 'string' ? f.color : '#b08968',
    label: typeof f.label === 'string' ? f.label : '',
  }
}

export function serialize(project) {
  const out = {
    version: PROJECT_VERSION,
    name: project.name,
    settings: { ...project.settings },
    floors: (project.floors || []).map(cleanFloor),
    activeFloorId: project.activeFloorId,
  }
  return JSON.stringify(out, null, 2)
}

function cleanWall(w) {
  return { id: w.id, x1: w.x1, y1: w.y1, x2: w.x2, y2: w.y2, thickness: w.thickness }
}
function cleanFurniture(f) {
  return {
    id: f.id, type: f.type, x: f.x, y: f.y, rotation: f.rotation,
    width: f.width, depth: f.depth, height: f.height, color: f.color, label: f.label,
  }
}

function coerceFloor(raw, fallbackLevel = 0) {
  const f = raw && typeof raw === 'object' ? raw : {}
  return {
    id: typeof f.id === 'string' ? f.id : uid('floor'),
    name: typeof f.name === 'string' ? f.name : 'Floor',
    level: clampNum(f.level, -10, 30, fallbackLevel),
    walls: (Array.isArray(f.walls) ? f.walls : []).map(coerceWall).filter(Boolean),
    furniture: (Array.isArray(f.furniture) ? f.furniture : []).map(coerceFurniture).filter(Boolean),
    openings: (Array.isArray(f.openings) ? f.openings : []).map(coerceOpening).filter(Boolean),
  }
}

function cleanFloor(f) {
  return {
    id: f.id, name: f.name, level: f.level,
    walls: f.walls.map(cleanWall), furniture: f.furniture.map(cleanFurniture), openings: f.openings.map(cleanOpening),
  }
}

// The floor currently being edited (its walls/furniture/openings).
export function activeFloor(p) {
  const floors = p?.floors || []
  return floors.find((f) => f.id === p?.activeFloorId) || floors[0] || null
}
function cleanOpening(o) {
  return { id: o.id, type: o.type, style: o.style || 'swing', wallId: o.wallId, offset: o.offset, width: o.width, height: o.height, sill: o.sill, hinge: o.hinge, side: o.side }
}

export const DOOR_STYLES = ['swing', 'double', 'sliding', 'folding']

function coerceOpening(o) {
  if (!o || typeof o !== 'object') return null
  const type = o.type === 'window' ? 'window' : 'door'
  return {
    id: typeof o.id === 'string' ? o.id : uid('o'),
    type,
    // Door leaf style; windows always carry 'swing' (ignored when rendering).
    style: DOOR_STYLES.includes(o.style) ? o.style : 'swing',
    wallId: typeof o.wallId === 'string' ? o.wallId : '',
    offset: Math.max(0, num(o.offset, 0)),
    width: clampNum(o.width, 0.3, 3, type === 'door' ? 0.9 : 1.2),
    height: clampNum(o.height, 0.3, 4, type === 'door' ? 2.1 : 1.2),
    sill: clampNum(o.sill, 0, 3, type === 'door' ? 0 : 1.0),
    hinge: o.hinge === 1 ? 1 : 0, // which jamb is the hinge (0 = start, 1 = end)
    side: o.side < 0 ? -1 : 1,    // which side of the wall it swings into
  }
}

// Openings belonging to a wall, sorted by offset along the wall.
export function openingsOnWall(container, wallId) {
  return ((container && container.openings) || [])
    .filter((o) => o.wallId === wallId)
    .sort((a, b) => a.offset - b.offset)
}

export const ERR_INVALID_JSON = 'File is not valid JSON.'
export const ERR_NOT_PROJECT = 'File does not contain a project object.'

export function deserialize(text) {
  let parsed
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error(ERR_INVALID_JSON)
  }
  if (!parsed || typeof parsed !== 'object') {
    throw new Error(ERR_NOT_PROJECT)
  }
  return normalizeProject(parsed)
}

// ---- file helpers (browser) -------------------------------------------
// Trigger a browser download of a text/blob with the given filename.
export function downloadBlob(filename, data, mime = 'application/json') {
  const blob = toBlob(data, mime)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// Coerce a payload into a Blob. Accepts a plain string (text), or a `data:`
// URL — the latter is decoded to binary so PNG/image exports are real files,
// not a text file containing the literal data URL.
function toBlob(data, mime) {
  if (typeof data === 'string' && data.startsWith('data:')) {
    const comma = data.indexOf(',')
    const meta = data.slice(5, comma) // e.g. "image/png;base64"
    const payloadMime = meta.split(';')[0] || mime
    const raw = data.slice(comma + 1)
    if (meta.includes('base64')) {
      const bytes = Uint8Array.from(atob(raw), (c) => c.charCodeAt(0))
      return new Blob([bytes], { type: payloadMime })
    }
    return new Blob([decodeURIComponent(raw)], { type: payloadMime })
  }
  return new Blob([data], { type: mime })
}

// Open a file picker and resolve with { name, text } for the chosen file.
// Returns null if the user cancels.
export function pickFile(accept = 'application/json') {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = accept
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) return resolve(null)
      const reader = new FileReader()
      reader.onload = () => resolve({ name: file.name, text: String(reader.result) })
      reader.onerror = () => resolve(null)
      reader.readAsText(file)
    }
    input.click()
  })
}

// Sanitize a string into a safe filename stem.
export function safeName(name, dflt = 'project') {
  const stem = (name || '').trim().replace(/[\\/:*?"<>|]+/g, '_').slice(0, 60)
  return stem || dflt
}