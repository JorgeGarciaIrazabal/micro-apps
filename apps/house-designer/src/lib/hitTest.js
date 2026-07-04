// Floor-level hit-test queries for the 2D editor. All coordinates and
// tolerances are in METERS — callers convert pixel tolerances via the zoom
// scale (tolPx / scale).

import { dist, pointSegDist, pointInRotatedRect, projectOnWall } from './geometry.js'
import { openingsOnWall } from './project.js'
import { wallUnit } from './geometry.js'

// Topmost (last drawn) furniture containing the point, prioritizing non-rug items
// since rugs are rendered at the very bottom.
export function hitFurniture(floor, wx, wy) {
  // First pass: look for non-rug furniture (rendered on top)
  for (let i = floor.furniture.length - 1; i >= 0; i--) {
    const f = floor.furniture[i]
    if (f.type !== 'rug' && pointInRotatedRect(wx, wy, f.x, f.y, f.rotation, f.width, f.depth)) {
      return f
    }
  }
  // Second pass: look for rugs (rendered at the bottom)
  for (let i = floor.furniture.length - 1; i >= 0; i--) {
    const f = floor.furniture[i]
    if (f.type === 'rug' && pointInRotatedRect(wx, wy, f.x, f.y, f.rotation, f.width, f.depth)) {
      return f
    }
  }
  return null
}

export function hitWall(floor, wx, wy, tol) {
  let best = null
  let bestD = tol
  for (const w of floor.walls) {
    const d = pointSegDist(wx, wy, w.x1, w.y1, w.x2, w.y2)
    if (d < bestD) { bestD = d; best = w }
  }
  return best
}

export function hitWallEndpoint(floor, wx, wy, tol) {
  for (const w of floor.walls) {
    if (dist(wx, wy, w.x1, w.y1) < tol) return { wall: w, end: 1 }
    if (dist(wx, wy, w.x2, w.y2) < tol) return { wall: w, end: 2 }
  }
  return null
}

// Nearest wall to a point, with the projected offset along it (for placing or
// dragging openings). Only walls within `maxPerp` meters of the point count.
export function nearestWallForOpening(floor, wx, wy, maxPerp = 0.6) {
  let best = null
  for (const w of floor.walls) {
    const { t, perp, L } = projectOnWall(w, wx, wy)
    if (L < 1e-4 || perp > maxPerp) continue
    if (!best || perp < best.perp) best = { wall: w, offset: t, L, perp }
  }
  return best
}

// Select an opening by clicking near its center on its wall.
export function hitOpening(floor, wx, wy) {
  let best = null, bestD = Infinity
  for (const w of floor.walls) {
    const { L, ux, uy } = wallUnit(w)
    if (L < 1e-4) continue
    for (const o of openingsOnWall(floor, w.id)) {
      const cx = w.x1 + o.offset * ux, cy = w.y1 + o.offset * uy
      const d = dist(wx, wy, cx, cy)
      const tol = Math.max(0.3, o.width / 2 + 0.05)
      if (d < tol && d < bestD) { bestD = d; best = o }
    }
  }
  return best
}
