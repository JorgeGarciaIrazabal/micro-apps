// Room detection on the wall centerline graph. Walls whose endpoints meet
// (within 1 cm) form a planar graph; its interior faces are the rooms. Walls
// are split where another wall's endpoint lands on them (T-junctions), so
// partition walls count. Areas follow the usual hobby-planner convention:
// measured on wall centerlines, ignoring wall thickness.
//
// Limitation (documented): loops must actually close — a wall gap (instead of
// a door Opening) leaves the loop open and the floor falls back to a
// bounding-box estimate.

import { dist } from './geometry.js'

const Q = 100 // quantize endpoints to 1 cm

function nodeKey(x, y) {
  return `${Math.round(x * Q)}:${Math.round(y * Q)}`
}

export function polygonArea(poly) {
  let s = 0
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length]
    s += a.x * b.y - b.x * a.y
  }
  return s / 2
}

export function polygonCentroid(poly) {
  let cx = 0, cy = 0, s = 0
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length]
    const cross = a.x * b.y - b.x * a.y
    s += cross
    cx += (a.x + b.x) * cross
    cy += (a.y + b.y) * cross
  }
  if (Math.abs(s) < 1e-9) return poly[0] || { x: 0, y: 0 }
  return { x: cx / (3 * s), y: cy / (3 * s) }
}

// Split walls at every node (wall endpoint) that lies on their interior, so
// T-junctions become real graph vertices. Returns segments as point pairs.
function splitWallsAtJunctions(walls) {
  const endpoints = []
  const seenPt = new Set()
  for (const w of walls) {
    for (const pt of [{ x: w.x1, y: w.y1 }, { x: w.x2, y: w.y2 }]) {
      const k = nodeKey(pt.x, pt.y)
      if (!seenPt.has(k)) { seenPt.add(k); endpoints.push(pt) }
    }
  }
  const segments = []
  for (const w of walls) {
    const L = dist(w.x1, w.y1, w.x2, w.y2)
    if (L < 1e-4) continue
    const ux = (w.x2 - w.x1) / L, uy = (w.y2 - w.y1) / L
    const cuts = [0, L]
    for (const pt of endpoints) {
      const t = (pt.x - w.x1) * ux + (pt.y - w.y1) * uy
      if (t <= 0.01 || t >= L - 0.01) continue
      const perp = Math.abs((pt.x - w.x1) * -uy + (pt.y - w.y1) * ux)
      if (perp < 0.015) cuts.push(t)
    }
    cuts.sort((a, b) => a - b)
    for (let i = 1; i < cuts.length; i++) {
      if (cuts[i] - cuts[i - 1] < 0.01) continue
      segments.push({
        x1: w.x1 + cuts[i - 1] * ux, y1: w.y1 + cuts[i - 1] * uy,
        x2: w.x1 + cuts[i] * ux, y2: w.y1 + cuts[i] * uy,
      })
    }
  }
  return segments
}

// Detect closed rooms: returns [{ polygon, area, centroid }], area in m².
export function detectRooms(floor) {
  const nodes = new Map()
  const addNode = (x, y) => {
    const k = nodeKey(x, y)
    let n = nodes.get(k)
    if (!n) { n = { x, y, out: [] }; nodes.set(k, n) }
    return n
  }

  const halfEdges = []
  const seen = new Set()
  for (const w of splitWallsAtJunctions(floor.walls || [])) {
    const a = addNode(w.x1, w.y1)
    const b = addNode(w.x2, w.y2)
    if (a === b) continue
    // Skip duplicate edges between the same node pair.
    const ek = nodeKey(a.x, a.y) < nodeKey(b.x, b.y)
      ? nodeKey(a.x, a.y) + '|' + nodeKey(b.x, b.y)
      : nodeKey(b.x, b.y) + '|' + nodeKey(a.x, a.y)
    if (seen.has(ek)) continue
    seen.add(ek)
    const h1 = { from: a, to: b, angle: Math.atan2(b.y - a.y, b.x - a.x), visited: false }
    const h2 = { from: b, to: a, angle: Math.atan2(a.y - b.y, a.x - b.x), visited: false }
    h1.twin = h2; h2.twin = h1
    a.out.push(h1)
    b.out.push(h2)
    halfEdges.push(h1, h2)
  }

  for (const n of nodes.values()) n.out.sort((e1, e2) => e1.angle - e2.angle)

  // Standard planar face walk: from each unvisited half-edge, repeatedly turn
  // to the next outgoing edge (in angular order) after the twin.
  const rooms = []
  for (const h0 of halfEdges) {
    if (h0.visited) continue
    const poly = []
    let h = h0
    let guard = 0
    do {
      h.visited = true
      poly.push({ x: h.from.x, y: h.from.y })
      const outs = h.to.out
      const idx = outs.indexOf(h.twin)
      h = outs[(idx + 1) % outs.length]
      guard++
    } while (h !== h0 && guard < 100000)
    if (poly.length < 3) continue
    const area = polygonArea(poly)
    // Interior faces come out with one orientation, each component's outer
    // face with the other; keep the interior sign (y-down world, CCW walk
    // gives interior faces negative signed area — validated by tests).
    if (area < -0.05) {
      const polygon = poly
      rooms.push({ polygon, area: -area, centroid: polygonCentroid(polygon) })
    }
  }
  return rooms
}

// Total floor area: exact (sum of detected rooms) or a bounding-box
// approximation when no closed loops exist.
export function floorArea(floor) {
  const rooms = detectRooms(floor)
  if (rooms.length) {
    return { area: rooms.reduce((s, r) => s + r.area, 0), exact: true }
  }
  const walls = floor.walls || []
  if (!walls.length) return { area: 0, exact: true }
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
  for (const w of walls) {
    minX = Math.min(minX, w.x1, w.x2); maxX = Math.max(maxX, w.x1, w.x2)
    minY = Math.min(minY, w.y1, w.y2); maxY = Math.max(maxY, w.y1, w.y2)
  }
  return { area: Math.max(0, (maxX - minX) * (maxY - minY)), exact: false }
}
