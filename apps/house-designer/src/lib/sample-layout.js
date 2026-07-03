// Shared placement helpers for sample house generators.
// Keeps wall-thickness math, door/window offsets, and furniture spacing consistent.

import { makeFurniture, BY_TYPE } from './furniture/registry.js'

export const WT = 0.15          // wall thickness in meters
export const HT = WT / 2        // half-thickness

// Map cardinal wall direction to the rotation that puts an item's *back*
// side against that wall.  The back side is the local -y edge of the item.
const WALL_ROTATION = {
  S: 0,           // wall is the south edge; interior is north (+y)
  N: Math.PI,     // wall is the north edge; interior is south (-y)
  W: -Math.PI / 2, // wall is the west edge; interior is east (+x)
  E: Math.PI / 2,  // wall is the east edge; interior is west (-x)
}

// Interior side (cardinal) for each wall direction.
const WALL_SIDE = {
  S: '+y',
  N: '-y',
  W: '+x',
  E: '-x',
}

// ------------------------------------------------------------
// Identity / primitives
// ------------------------------------------------------------

export function uid(prefix = 'id') {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

export function place(type, x, y, rot = 0, overrides = {}) {
  return { ...makeFurniture(type, x, y), id: uid('f'), rotation: rot, ...overrides }
}

export function wall(x1, y1, x2, y2) {
  return { id: uid('w'), x1, y1, x2, y2, thickness: WT }
}

export function opening(kind, wallId, offset, width, side, style = 'swing', hinge = 0) {
  const isWindow = kind === 'window'
  return {
    id: uid('o'),
    type: kind,
    style,
    wallId,
    offset,
    width,
    height: isWindow ? 1.1 : 2.1,
    sill: isWindow ? 0.9 : 0,
    hinge,
    side,
  }
}

// ------------------------------------------------------------
// Wall helpers
// ------------------------------------------------------------

// Returns the interior face point of an axis-aligned wall at `along` meters
// from the wall start. `side` is the cardinal direction of the room interior:
// '+x' | '-x' | '+y' | '-y'.
function facePoint(w, along, side) {
  if (w.x1 === w.x2) { // vertical wall
    const x = w.x1 + (side === '+x' ? HT : -HT)
    const y = Math.min(w.y1, w.y2) + along
    return { x, y }
  }
  if (w.y1 === w.y2) { // horizontal wall
    const x = Math.min(w.x1, w.x2) + along
    const y = w.y1 + (side === '+y' ? HT : -HT)
    return { x, y }
  }
  throw new Error('only axis-aligned walls are supported')
}

// Length of an axis-aligned wall.
export function wallLength(w) {
  if (w.x1 === w.x2) return Math.abs(w.y2 - w.y1)
  if (w.y1 === w.y2) return Math.abs(w.x2 - w.x1)
  throw new Error('only axis-aligned walls are supported')
}

// ------------------------------------------------------------
// Furniture placement against walls / in rooms
// ------------------------------------------------------------

// Primary helper: place an item with its back against a wall.
//   wallDir: 'S' | 'N' | 'W' | 'E' -- the cardinal direction of the wall.
//   along: distance along the wall from its starting (minimum x or y) end.
export function alongWall(type, w, along, wallDir, clearance = 0.01) {
  const rot = WALL_ROTATION[wallDir]
  const side = WALL_SIDE[wallDir]
  const item = againstWall(type, w, along, side, 'back', rot)
  // Nudge slightly into the room so floating-point precision never reports
  // the item as overlapping the wall.
  const n = WALL_NORMAL[wallDir]
  item.x += n.x * clearance
  item.y += n.y * clearance
  return item
}

const WALL_NORMAL = {
  S: { x: 0, y: 1 },
  N: { x: 0, y: -1 },
  W: { x: 1, y: 0 },
  E: { x: -1, y: 0 },
}

// Place furniture with a named local side against a wall interior face.
//   side = '+x' | '-x' | '+y' | '-y'  (cardinal direction of the room)
//   face = 'back' | 'front' | 'left' | 'right' (which furniture side touches wall)
export function againstWall(type, w, along, side, face = 'back', rot = 0) {
  const def = BY_TYPE[type]
  const hw = def.width / 2
  const hd = def.depth / 2
  const c = Math.cos(rot), s = Math.sin(rot)
  const F = facePoint(w, along, side)

  // Move from the wall face point to the furniture center depending on which
  // local side is touching the wall.
  // local axes: x'=(c,s), y'=(-s,c)
  // back  = local y = -hd  ->  world offset = (-hd)*y' = ( hd*s, -hd*c)
  // front = local y = +hd  ->  world offset = ( hd)*y'  = (-hd*s,  hd*c)
  // left  = local x = -hw  ->  world offset = (-hw)*x' = (-hw*c, -hw*s)
  // right = local x = +hw  ->  world offset = ( hw)*x'  = ( hw*c,  hw*s)
  let x, y
  switch (face) {
    case 'back':
      x = F.x - hd * s
      y = F.y + hd * c
      break
    case 'front':
      x = F.x + hd * s
      y = F.y - hd * c
      break
    case 'left':
      x = F.x + hw * c
      y = F.y + hw * s
      break
    case 'right':
      x = F.x - hw * c
      y = F.y - hw * s
      break
    default:
      throw new Error(`unknown face ${face}`)
  }
  return place(type, x, y, rot)
}

// Place an item centered inside a rectangle with optional rotation.
// bounds = { x, y, w, h } in meters (x,y is bottom-left)
export function centered(type, bounds, rot = 0) {
  return place(type, bounds.x + bounds.w / 2, bounds.y + bounds.h / 2, rot)
}

// Place an item so its `face` side faces a target point.
export function facing(type, x, y, targetX, targetY, face = 'front') {
  const angle = Math.atan2(targetY - y, targetX - x)
  const rot = face === 'front' ? angle
    : face === 'back' ? angle + Math.PI
    : face === 'left' ? angle + Math.PI / 2
    : face === 'right' ? angle - Math.PI / 2
    : (() => { throw new Error(`unknown face ${face}`) })()
  return place(type, x, y, rot)
}

// ------------------------------------------------------------
// Openings (doors / windows)
// ------------------------------------------------------------

// Window centered at `along` meters from the wall start.
export function window(w, along, width = 1.2) {
  return opening('window', w.id, along - width / 2, width, 0)
}

// Door at `along` meters from the wall start, opening into the given side.
// `swingSide` is '+x'|'-x'|'+y'|'-y' and must match one of the wall's two
// outward normals; it controls which way the door arc swings.
export function door(w, along, width = 0.9, swingSide = '+y', hinge = 0) {
  const side = swingSideToInt(w, swingSide)
  return opening('door', w.id, along - width / 2, width, side, 'swing', hinge)
}

// Convert a cardinal swing direction into the linter's side integer.
// Wall direction is from (x1,y1) to (x2,y2).  side=1 means the left normal,
// side=-1 means the right normal.
function swingSideToInt(w, swingSide) {
  const dx = w.x2 - w.x1
  const dy = w.y2 - w.y1
  const ln = { x: -dy, y: dx } // left normal
  const rn = { x: dy, y: -dx } // right normal
  const target = cardinalVector(swingSide)
  const dotL = ln.x * target.x + ln.y * target.y
  const dotR = rn.x * target.x + rn.y * target.y
  if (dotL > dotR) return 1
  if (dotR > dotL) return -1
  throw new Error(`swing side ${swingSide} is parallel to the wall`)
}

function cardinalVector(side) {
  switch (side) {
    case '+x': return { x: 1, y: 0 }
    case '-x': return { x: -1, y: 0 }
    case '+y': return { x: 0, y: 1 }
    case '-y': return { x: 0, y: -1 }
  }
  throw new Error(`unknown side ${side}`)
}

// ------------------------------------------------------------
// Sequences (kitchen runs, dining rows, etc.)
// ------------------------------------------------------------

// Place a row of the same item along a wall, packed back-to-back.
export function row(type, w, wallDir, startAlong, count) {
  const def = BY_TYPE[type]
  const rot = WALL_ROTATION[wallDir]
  const dim = Math.abs(Math.sin(rot)) < 1e-6 ? def.width : def.depth
  const items = []
  for (let i = 0; i < count; i++) {
    items.push(alongWall(type, w, startAlong + dim * i + dim / 2, wallDir))
  }
  return items
}

// Place a spaced row of mixed items along a wall.
// specs = [{ type, wallDir?, gap? }]
export function spacedRow(w, startAlong, specs) {
  const items = []
  let along = startAlong
  for (const spec of specs) {
    const def = BY_TYPE[spec.type]
    const wallDir = spec.wallDir ?? 'S'
    const rot = WALL_ROTATION[wallDir]
    const dim = Math.abs(Math.sin(rot)) < 1e-6 ? def.width : def.depth
    items.push(alongWall(spec.type, w, along + dim / 2, wallDir))
    along += dim + (spec.gap ?? 0)
  }
  return items
}

// ------------------------------------------------------------
// Room bounds helper
// ------------------------------------------------------------

export function room(x, y, w, h) {
  return { x, y, w, h }
}
