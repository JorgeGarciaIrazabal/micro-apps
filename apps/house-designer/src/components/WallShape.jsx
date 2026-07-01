import { wallLength } from '../lib/project.js'

// Draws a wall in world coordinates, cut by its door/window openings, with the
// standard plan symbol for each opening. The wall is rendered as solid
// segments around each opening (a visible gap), plus the door swing arc or the
// window glass lines inside the gap.

export default function WallShape({ w, openings, selectedId, scale }) {
  const L = wallLength(w)
  if (L < 1e-4) return null
  const ux = (w.x2 - w.x1) / L, uy = (w.y2 - w.y1) / L
  const nx = -uy, ny = ux // left normal
  const A = { x: w.x1, y: w.y1 }
  const at = (t) => ({ x: A.x + t * ux, y: A.y + t * uy })

  const wallSel = w.id === selectedId
  const thk = w.thickness
  const wallColor = wallSel ? '#ff8c1a' : '#3a3530'
  const centerColor = wallSel ? '#ffd9a8' : '#7a736b'

  // Build solid segments around openings (clamped to the wall span).
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

  return (
    <g className="wall">
      {segs.map(([a, b], i) => {
        const p1 = at(a), p2 = at(b)
        return (
          <g key={`s${i}`}>
            <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
              stroke={wallColor} strokeWidth={thk} strokeLinecap="butt" />
            <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
              stroke={centerColor} strokeWidth={1 / scale} />
          </g>
        )
      })}

      {ops.map(({ o, a, b }, i) => {
        const w2 = b - a
        const hinge = o.hinge === 1 ? at(b) : at(a)
        const other = o.hinge === 1 ? at(a) : at(b)
        const opSel = o.id === selectedId
        const accent = opSel ? '#ff8c1a' : (o.type === 'window' ? '#5a8fb0' : '#b5783a')
        if (o.type === 'window') {
          // glass: two parallel lines offset from the wall center
          const k = thk * 0.35
          const g1a = { x: hinge.x + nx * k, y: hinge.y + ny * k }
          const g1b = { x: other.x + nx * k, y: other.y + ny * k }
          const g2a = { x: hinge.x - nx * k, y: hinge.y - ny * k }
          const g2b = { x: other.x - nx * k, y: other.y - ny * k }
          return (
            <g key={`o${i}`}>
              <line x1={hinge.x} y1={hinge.y} x2={other.x} y2={other.y} stroke={centerColor} strokeWidth={1 / scale} opacity={0.5} />
              <line x1={g1a.x} y1={g1a.y} x2={g1b.x} y2={g1b.y} stroke={accent} strokeWidth={1.5 / scale} />
              <line x1={g2a.x} y1={g2a.y} x2={g2b.x} y2={g2b.y} stroke={accent} strokeWidth={1.5 / scale} />
            </g>
          )
        }
        // door: leaf line (hinge -> open) + sampled swing arc back to the other jamb.
        // Orientation: hinge jamb (hinge) + swing side (o.side * normal) -> 4 layouts.
        const sx = o.side > 0 ? nx : -nx, sy = o.side > 0 ? ny : -ny   // swing normal
        const tip = { x: hinge.x + w2 * sx, y: hinge.y + w2 * sy }
        // direction from hinge to the other jamb (along the wall)
        const dx = (other.x - hinge.x) / w2, dy = (other.y - hinge.y) / w2
        const cross = sx * dy - sy * dx, dot = sx * dx + sy * dy
        const delta = Math.atan2(cross, dot) // signed sweep angle (~±90°)
        const N = 12
        let d = `M ${tip.x.toFixed(4)} ${tip.y.toFixed(4)}`
        for (let k = 1; k <= N; k++) {
          const t = (k / N) * delta
          const c = Math.cos(t), s = Math.sin(t)
          const px = hinge.x + w2 * (sx * c - sy * s)
          const py = hinge.y + w2 * (sx * s + sy * c)
          d += ` L ${px.toFixed(4)} ${py.toFixed(4)}`
        }
        return (
          <g key={`o${i}`}>
            <line x1={hinge.x} y1={hinge.y} x2={tip.x} y2={tip.y} stroke={accent} strokeWidth={2 / scale} />
            <path d={d} fill="none" stroke={accent} strokeWidth={1.2 / scale} opacity={0.9} />
            <line x1={hinge.x} y1={hinge.y} x2={other.x} y2={other.y} stroke={centerColor} strokeWidth={1 / scale} opacity={0.4} />
          </g>
        )
      })}

      {wallSel && (
        <>
          <circle cx={w.x1} cy={w.y1} r={6 / scale} fill="#fff" stroke="#ff8c1a" strokeWidth={2 / scale} />
          <circle cx={w.x2} cy={w.y2} r={6 / scale} fill="#fff" stroke="#ff8c1a" strokeWidth={2 / scale} />
        </>
      )}
    </g>
  )
}