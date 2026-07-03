// Layout quality linter for House Designer projects.
// Checks spatial design rules that the structural validator does not cover:
//   - furniture must be inside rooms (not in voids)
//   - furniture must not overlap walls
//   - furniture must not overlap other furniture
//   - doors must have clearance for their swing arc
//   - beds should be placed against a wall (headboard)
//   - circulation space must stay above a minimum width
//
// This module is dependency-free and runs in the browser or Node.

import { detectRooms } from '../lib/rooms.js'
import { wallUnit } from '../lib/geometry.js'

// ─── public API ─────────────────────────────────────────────────────────────

export const DEFAULT_LIMITS = {
  wallClearance: 0.05,   // m; furniture may approach this close to a wall face
  furnitureGap: 0.05,    // m; minimum gap between two furniture pieces
  passageWidth: 0.70,    // m; warning if a walking corridor is narrower
  criticalPassage: 0.50, // m; error if circulation is tighter than this
  bedWallMax: 0.20,      // m; headboard must be within this of a wall
  doorSwingRadiusFudge: 1.0, // use full door width as swing radius
}

/**
 * Lint a whole project. Returns an array of issue objects:
 *   { severity: 'error'|'warning', rule, message, floor, element? }
 */
export function lintProject(project, limits = DEFAULT_LIMITS) {
  const issues = []
  if (!project?.floors?.length) return issues
  for (const floor of project.floors) {
    issues.push(...lintFloor(floor, limits))
  }
  return issues
}

/**
 * Lint a single floor.
 */
export function lintFloor(floor, limits = DEFAULT_LIMITS) {
  const issues = []
  const rooms = detectRooms(floor)
  const wallObbs = makeWallObbs(floor.walls || [])
  const furns = floor.furniture || []

  // 1. Furniture inside a room
  for (const f of furns) {
    if (isOutdoor(f)) continue // plants/trees can be outside
    if (rooms.length && !isPointInAnyRoom({ x: f.x, y: f.y }, rooms)) {
      issues.push({
        severity: 'error',
        rule: 'furniture-in-room',
        message: `${label(f)} is not inside any enclosed room`,
        floor,
        element: f,
      })
    }
  }

  // 2. Furniture vs wall overlap / too close
  for (const f of furns) {
    const fObb = obbFromFurniture(f)
    for (const [w, wObb] of wallObbs) {
      const d = obbMinDistance(fObb, wObb)
      if (d < -0.005) {
        issues.push({
          severity: 'error',
          rule: 'furniture-wall-clearance',
          message: `${label(f)} overlaps wall ${w.id}`,
          floor,
          element: f,
        })
      }
    }
  }

  // 3. Furniture vs furniture overlap
  for (let i = 0; i < furns.length; i++) {
    for (let j = i + 1; j < furns.length; j++) {
      const a = furns[i], b = furns[j]
      if (canOverlap(a) || canOverlap(b)) continue
      // Intentionally adjacent pieces (kitchen run, dining chairs, etc.) are
      // allowed to touch; we only flag actual overlap for those.
      const intentional = adjacencyExempt(a, b)
      if (intentional) {
        const dist = obbMinDistance(obbFromFurniture(a), obbFromFurniture(b))
        if (dist >= -0.02) continue // just touching or separated
      } else {
        const obbA = inflateObb(obbFromFurniture(a), limits.furnitureGap)
        if (!obbIntersect(obbA, obbFromFurniture(b))) continue
      }
      issues.push({
        severity: 'error',
        rule: 'furniture-overlap',
        message: `${label(a)} overlaps ${label(b)}`,
        floor,
        element: a,
      })
    }
  }

  // 4. Door swing blocked
  for (const o of floor.openings || []) {
    if (o.type !== 'door') continue
    if (o.style === 'sliding') continue
    const swing = doorSwingObb(o, floor.walls || [])
    if (!swing) continue
    for (const f of furns) {
      if (isWallMounted(f) || canOverlap(f)) continue // wall-mounted / rugs OK on the wall side
      if (obbIntersect(swing, obbFromFurniture(f))) {
        issues.push({
          severity: 'error',
          rule: 'door-swing-blocked',
          message: `Door ${o.id} swing arc is blocked by ${label(f)}`,
          floor,
          element: o,
        })
      }
    }
    for (const [w, wObb] of wallObbs) {
      if (w.id === o.wallId) continue // the host wall carries the opening
      if (obbIntersect(swing, wObb)) {
        issues.push({
          severity: 'error',
          rule: 'door-swing-blocked',
          message: `Door ${o.id} swing arc is blocked by wall ${w.id}`,
          floor,
          element: o,
        })
      }
    }
  }

  // 5. Beds must be anchored to a wall on at least one side.
  for (const f of furns) {
    if (!isBed(f)) continue
    const edges = bedEdgeAnchors(f)
    const anchored = edges.some((edge) => {
      const { wall, distance, parallel } = nearestWallInfo(edge.center, edge.dir, floor.walls || [])
      return wall && distance <= limits.bedWallMax && parallel
    })
    if (!anchored) {
      issues.push({
        severity: 'error',
        rule: 'bed-against-wall',
        message: `${label(f)} is floating in the middle of the room`,
        floor,
        element: f,
      })
    }
  }

  // 6. Circulation / narrow passages (only between unrelated pieces).
  for (let i = 0; i < furns.length; i++) {
    for (let j = i + 1; j < furns.length; j++) {
      const a = furns[i], b = furns[j]
      if (canOverlap(a) || canOverlap(b)) continue
      if (adjacencyExempt(a, b)) continue
      const dist = obbMinDistance(obbFromFurniture(a), obbFromFurniture(b))
      if (dist < limits.criticalPassage) {
        issues.push({
          severity: 'error',
          rule: 'narrow-passage',
          message: `Only ${fmt(dist)} clearance between ${label(a)} and ${label(b)}`,
          floor,
          element: a,
        })
      }
    }
  }

  return issues
}

// ─── OBB geometry ─────────────────────────────────────────────────────────────

function obbFromFurniture(f) {
  const c = Math.cos(f.rotation || 0)
  const s = Math.sin(f.rotation || 0)
  const hw = (f.width || 0) / 2
  const hd = (f.depth || 0) / 2
  const center = { x: f.x, y: f.y }
  const axes = [
    { x: c, y: s },
    { x: -s, y: c },
  ]
  const extents = [hw, hd]
  return { center, axes, extents }
}

function makeWallObbs(walls) {
  return walls.map((w) => {
    const { L, ux, uy } = wallUnit(w)
    if (L < 1e-4) return [w, null]
    const t = w.thickness || 0.15
    const center = { x: (w.x1 + w.x2) / 2, y: (w.y1 + w.y2) / 2 }
    const axes = [{ x: ux, y: uy }, { x: -uy, y: ux }]
    const extents = [L / 2, t / 2]
    return [w, { center, axes, extents }]
  }).filter(([, o]) => o)
}

function inflateObb(obb, by) {
  return { ...obb, extents: obb.extents.map((e) => e + by) }
}

// SAT intersection test for two OBBs.
function obbIntersect(a, b) {
  const axes = [...a.axes, ...b.axes]
  for (const axis of axes) {
    const projA = projectObb(a, axis)
    const projB = projectObb(b, axis)
    if (projA.max < projB.min - 1e-6 || projB.max < projA.min - 1e-6) {
      return false
    }
  }
  return true
}

function projectObb(obb, axis) {
  const dotC = dot(obb.center, axis)
  const r = obb.extents[0] * Math.abs(dot(obb.axes[0], axis)) +
            obb.extents[1] * Math.abs(dot(obb.axes[1], axis))
  return { min: dotC - r, max: dotC + r }
}

// Distance between two OBBs along their candidate axes.
// Positive = separated by that amount; zero = touching; negative = overlap,
// with magnitude equal to the minimum penetration depth (MTD).
function obbMinDistance(a, b) {
  const axes = [...a.axes, ...b.axes]
  let maxGap = -Infinity
  let anySeparating = false
  let minPenetration = Infinity
  for (const axis of axes) {
    const pa = projectObb(a, axis)
    const pb = projectObb(b, axis)
    if (pa.max < pb.min - 1e-6 || pb.max < pa.min - 1e-6) {
      const gap = Math.max(pb.min - pa.max, pa.min - pb.max)
      maxGap = Math.max(maxGap, gap)
      anySeparating = true
    } else {
      const penetration = Math.min(pa.max, pb.max) - Math.max(pa.min, pb.min)
      minPenetration = Math.min(minPenetration, penetration)
    }
  }
  if (anySeparating) return Math.max(0, maxGap)
  return -minPenetration
}

// ─── door swing arc as an OBB-safe polygon ──────────────────────────────────

function doorSwingObb(o, walls) {
  const wall = walls.find((w) => w.id === o.wallId)
  if (!wall) return null
  const { L, ux, uy } = wallUnit(wall)
  if (L < 1e-4) return null
  const w = o.width || 0.9
  const start = { x: wall.x1, y: wall.y1 }
  // Jamb positions along the wall (hinge vs free jamb)
  const hingeT = o.hinge === 1 ? o.offset + w / 2 : o.offset - w / 2
  const freeT = o.hinge === 1 ? o.offset - w / 2 : o.offset + w / 2
  const hinge = { x: start.x + ux * hingeT, y: start.y + uy * hingeT }
  const free = { x: start.x + ux * freeT, y: start.y + uy * freeT }
  // Side normal: +1 = left normal, -1 = right normal
  const nx = o.side === -1 ? uy : -uy
  const ny = o.side === -1 ? -ux : ux
  // Build a convex polygon that bounds the quarter-circle sweep.
  const steps = 8
  const poly = [hinge]
  poly.push(free)
  for (let i = 1; i <= steps; i++) {
    const ang = (i / steps) * (Math.PI / 2)
    const ca = Math.cos(ang)
    const sa = Math.sin(ang)
    // rotate the free-jamb vector around hinge by ang toward the normal side
    const dx = free.x - hinge.x
    const dy = free.y - hinge.y
    const rx = dx * ca + (nx * w) * sa
    const ry = dy * ca + (ny * w) * sa
    poly.push({ x: hinge.x + rx, y: hinge.y + ry })
  }
  return polygonObb(poly)
}

function polygonObb(poly) {
  let cx = 0, cy = 0
  for (const p of poly) { cx += p.x; cy += p.y }
  cx /= poly.length; cy /= poly.length
  // Use PCA-like bounding box via the polygon's covariance matrix would be
  // ideal, but for our convex sweep polygons the wall-aligned axes plus the
  // perpendicular axis work well. Compute the two dominant directions from the
  // polygon's edges instead.
  let bestA = 0, bestLen = 0
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i]
    const b = poly[(i + 1) % poly.length]
    const dx = b.x - a.x, dy = b.y - a.y
    const len2 = dx * dx + dy * dy
    if (len2 > bestLen) { bestLen = len2; bestA = Math.atan2(dy, dx) }
  }
  const perp = bestA + Math.PI / 2
  const axes = [
    { x: Math.cos(bestA), y: Math.sin(bestA) },
    { x: Math.cos(perp), y: Math.sin(perp) },
  ]
  const center = { x: cx, y: cy }
  // extents from projection
  const p0 = projectPolygon(poly, axes[0])
  const p1 = projectPolygon(poly, axes[1])
  const extents = [(p0.max - p0.min) / 2, (p1.max - p1.min) / 2]
  // Recenter so projections are symmetric around center
  center.x = axes[0].x * (p0.min + p0.max) / 2 + axes[1].x * (p1.min + p1.max) / 2
  center.y = axes[0].y * (p0.min + p0.max) / 2 + axes[1].y * (p1.min + p1.max) / 2
  return { center, axes, extents }
}

function projectPolygon(poly, axis) {
  let min = Infinity, max = -Infinity
  for (const p of poly) {
    const d = dot(p, axis)
    min = Math.min(min, d); max = Math.max(max, d)
  }
  return { min, max }
}

// ─── room containment ───────────────────────────────────────────────────────

function isPointInAnyRoom(pt, rooms) {
  for (const r of rooms) {
    if (pointInPolygon(pt, r.polygon)) return true
  }
  return false
}

function pointInPolygon(pt, poly) {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const pi = poly[i], pj = poly[j]
    const intersect = ((pi.y > pt.y) !== (pj.y > pt.y)) &&
      (pt.x < (pj.x - pi.x) * (pt.y - pi.y) / (pj.y - pi.y) + pi.x)
    if (intersect) inside = !inside
  }
  return inside
}

// ─── bed headboard rule ───────────────────────────────────────────────────────

function isBed(f) {
  return f.type === 'bed-double' || f.type === 'bed-single' || f.type === 'crib'
}

function bedEdgeAnchors(f) {
  const c = Math.cos(f.rotation || 0)
  const s = Math.sin(f.rotation || 0)
  const hw = (f.width || 0) / 2
  const hd = (f.depth || 0) / 2
  // Four edges in local coordinates: center offset and edge direction.
  // Direction must be parallel to the wall the edge can anchor to.
  return [
    { lc: { x: 0, y: -hd }, dir: { x: c, y: s } }, // headboard / footboard
    { lc: { x: 0, y: hd },  dir: { x: c, y: s } },
    { lc: { x: -hw, y: 0 }, dir: { x: -s, y: c } }, // left / right long side
    { lc: { x: hw, y: 0 },  dir: { x: -s, y: c } },
  ].map(({ lc, dir }) => ({
    center: {
      x: f.x + lc.x * c - lc.y * s,
      y: f.y + lc.x * s + lc.y * c,
    },
    dir,
  }))
}

function nearestWallInfo(pt, dir, walls) {
  let best = null
  let bestDist = Infinity
  let parallel = false
  for (const w of walls) {
    const { L, ux, uy } = wallUnit(w)
    if (L < 1e-4) continue
    const t = ((pt.x - w.x1) * ux + (pt.y - w.y1) * uy)
    const clamped = Math.max(0, Math.min(L, t))
    const nearest = { x: w.x1 + ux * clamped, y: w.y1 + uy * clamped }
    const d = Math.hypot(nearest.x - pt.x, nearest.y - pt.y)
    if (d < bestDist) {
      bestDist = d
      best = w
      // wall direction (ux,uy) must be parallel to dir (bed width axis)
      const dotAbs = Math.abs(ux * dir.x + uy * dir.y)
      parallel = dotAbs > Math.cos(Math.PI / 12) // within 15°
    }
  }
  return { wall: best, distance: bestDist, parallel }
}

// ─── classification helpers ─────────────────────────────────────────────────

function isOutdoor(f) {
  return f.type === 'tree' || f.type === 'pool' || f.type === 'bbq' ||
         f.type === 'bench' || f.type === 'outdoor-table'
}

function canOverlap(f) {
  // Rugs are allowed under furniture; railings/balconies are thin/structural.
  return f.type === 'rug' || f.type === 'railing' || f.type === 'balcony'
}

function isWallMounted(f) {
  // These items can sit flush against the wall the door is mounted on.
  return f.type === 'wardrobe' || f.type === 'bookshelf' || f.type === 'counter' ||
         f.type === 'sink' || f.type === 'stove' || f.type === 'vanity'
}

// Pairs that are intentionally allowed to touch (functional groups).
function adjacencyExempt(a, b) {
  const types = new Set([a.type, b.type])
  const both = (t1, t2) => types.has(t1) && types.has(t2)
  // Sleep area
  if (both('bed-double', 'nightstand') || both('bed-single', 'nightstand') || both('crib', 'nightstand')) return true
  if (both('bed-double', 'wardrobe') || both('bed-single', 'wardrobe') || both('crib', 'wardrobe')) return true
  if (both('bed-double', 'dresser') || both('bed-single', 'dresser')) return true
  // Dining
  if (types.has('dining-table') && types.has('chair')) return true
  // Living room composition
  if (both('sofa', 'coffee-table') || both('sofa', 'side-table') || both('sofa', 'rug')) return true
  if (both('armchair', 'coffee-table') || both('armchair', 'side-table') || both('armchair', 'rug')) return true
  // Office
  if (both('desk', 'office-chair')) return true
  if (both('desk', 'filing-cabinet') || both('desk', 'bookshelf')) return true
  // Kitchen run (appliances/counters may be ganged)
  const kitchenRun = ['counter', 'sink', 'stove', 'fridge', 'island', 'dishwasher']
  if (kitchenRun.includes(a.type) && kitchenRun.includes(b.type)) return true
  // Bathroom fixtures in small rooms
  const bathroom = ['toilet', 'vanity', 'bathtub', 'shower', 'washing-machine']
  if (bathroom.includes(a.type) && bathroom.includes(b.type)) return true
  return false
}

// ─── misc ───────────────────────────────────────────────────────────────────

function label(f) {
  return `${f.label || f.type} (${f.id})`
}

function fmt(m) {
  return `${m.toFixed(2)} m`
}

function dot(a, b) {
  return a.x * b.x + a.y * b.y
}
