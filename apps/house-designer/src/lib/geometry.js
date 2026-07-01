// Pure 2D geometry helpers shared by the 2D editor, the 3D builder, and hit
// testing. No React or Three.js imports — everything works on plain numbers
// and the project's wall/furniture records (meters).

export const dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1)

export function snap(v, step) {
  if (!step) return v
  return Math.round(v / step) * step
}

// Distance from point (px,py) to segment (x1,y1)-(x2,y2).
export function pointSegDist(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1
  const len2 = dx * dx + dy * dy
  if (len2 < 1e-9) return dist(px, py, x1, y1)
  let t = ((px - x1) * dx + (py - y1) * dy) / len2
  t = Math.max(0, Math.min(1, t))
  return dist(px, py, x1 + t * dx, y1 + t * dy)
}

// Length + unit direction + left normal of a wall segment.
export function wallUnit(w) {
  const L = dist(w.x1, w.y1, w.x2, w.y2)
  if (L < 1e-9) return { L: 0, ux: 1, uy: 0, nx: 0, ny: 1 }
  const ux = (w.x2 - w.x1) / L
  const uy = (w.y2 - w.y1) / L
  return { L, ux, uy, nx: -uy, ny: ux }
}

// Project a point onto a wall: t = clamped distance along the wall from its
// start, perp = perpendicular distance from the wall line.
export function projectOnWall(w, x, y) {
  const { L, ux, uy } = wallUnit(w)
  if (!L) return { t: 0, perp: Infinity, L }
  const t = Math.max(0, Math.min(L, (x - w.x1) * ux + (y - w.y1) * uy))
  const perp = Math.abs((x - w.x1) * -uy + (y - w.y1) * ux)
  return { t, perp, L }
}

// Is (wx,wy) inside a w×d rectangle centered at (cx,cy) rotated by rot?
export function pointInRotatedRect(wx, wy, cx, cy, rot, w, d) {
  const c = Math.cos(-rot)
  const s = Math.sin(-rot)
  const dx = wx - cx
  const dy = wy - cy
  const lx = dx * c - dy * s
  const ly = dx * s + dy * c
  return Math.abs(lx) <= w / 2 && Math.abs(ly) <= d / 2
}

// Snap a candidate endpoint so walls are easy to draw at 0/90/180/270°.
// If the angle from `from` to (x,y) is within `toleranceDeg` of an axis
// direction, rotate the point onto that axis keeping the same length.
export function angleSnap(x, y, from, toleranceDeg = 12) {
  const dx = x - from.x, dy = y - from.y
  const len = Math.hypot(dx, dy)
  if (len < 1e-6) return { x, y }
  const deg = (Math.atan2(dy, dx) * 180) / Math.PI
  const nearest = Math.round(deg / 90) * 90
  if (Math.abs(deg - nearest) < toleranceDeg) {
    const rad = (nearest * Math.PI) / 180
    return { x: from.x + len * Math.cos(rad), y: from.y + len * Math.sin(rad) }
  }
  return { x, y }
}

// Split a wall of length L into solid segments around its openings (which must
// be sorted by offset — see openingsOnWall). Returns:
//   segs: [[a, b]]            solid wall runs (meters from the wall start)
//   ops:  [{ o, a, b }]       each opening with its clamped span
// Openings narrower than 5 cm after clamping are skipped (degenerate).
export function wallCutSegments(L, openings) {
  const segs = []
  const ops = []
  let cursor = 0
  for (const o of openings) {
    const a = Math.max(cursor, o.offset - o.width / 2)
    const b = Math.min(L, o.offset + o.width / 2)
    if (b - a < 0.05) { cursor = Math.max(cursor, b); continue }
    if (a > cursor + 1e-6) segs.push([cursor, a])
    ops.push({ o, a, b })
    cursor = b
  }
  if (cursor < L - 1e-6) segs.push([cursor, L])
  return { segs, ops }
}
