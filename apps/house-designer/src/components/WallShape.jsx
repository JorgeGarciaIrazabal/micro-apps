import { wallUnit, wallCutSegments } from '../lib/geometry.js'

// Draws a wall in world coordinates, cut by its door/window openings, with the
// standard plan symbol for each opening. The wall is rendered as solid
// segments around each opening (a visible gap), plus the door swing arc or the
// window glass lines inside the gap.

export default function WallShape({ w, openings, selectedId, hoverId, scale }) {
  const { L, ux, uy, nx, ny } = wallUnit(w)
  if (L < 1e-4) return null
  const at = (t) => ({ x: w.x1 + t * ux, y: w.y1 + t * uy })

  const wallSel = w.id === selectedId
  const wallHover = !wallSel && w.id === hoverId
  const thk = w.thickness
  const wallColor = wallSel ? '#ff8c1a' : '#3a3530'
  const centerColor = wallSel ? '#ffd9a8' : '#7a736b'

  const { segs, ops } = wallCutSegments(L, openings)

  return (
    <g className="wall">
      {segs.map(([a, b], i) => {
        const p1 = at(a), p2 = at(b)
        return (
          <g key={`s${i}`}>
            {wallHover && (
              <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                stroke="#ff8c1a" strokeWidth={thk + 6 / scale} strokeLinecap="butt" opacity={0.25} />
            )}
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
        // door — symbol depends on the leaf style (swing/double/sliding/folding).
        const sx = o.side > 0 ? nx : -nx, sy = o.side > 0 ? ny : -ny   // swing normal
        const threshold = (
          <line x1={hinge.x} y1={hinge.y} x2={other.x} y2={other.y} stroke={centerColor} strokeWidth={1 / scale} opacity={0.4} />
        )

        // Leaf line + sampled swing arc for a hinged leaf of length `len` at `hg`,
        // sweeping toward the jamb `ot`.
        const leafArc = (hg, ot, len) => {
          const tip = { x: hg.x + len * sx, y: hg.y + len * sy }
          const alen = Math.hypot(ot.x - hg.x, ot.y - hg.y)
          const dx = (ot.x - hg.x) / alen, dy = (ot.y - hg.y) / alen
          const cross = sx * dy - sy * dx, dot = sx * dx + sy * dy
          const delta = Math.atan2(cross, dot) // signed sweep angle (~±90°)
          const N = 12
          let d = `M ${tip.x.toFixed(4)} ${tip.y.toFixed(4)}`
          for (let k = 1; k <= N; k++) {
            const t = (k / N) * delta
            const c = Math.cos(t), s = Math.sin(t)
            d += ` L ${(hg.x + len * (sx * c - sy * s)).toFixed(4)} ${(hg.y + len * (sx * s + sy * c)).toFixed(4)}`
          }
          return (
            <>
              <line x1={hg.x} y1={hg.y} x2={tip.x} y2={tip.y} stroke={accent} strokeWidth={2 / scale} />
              <path d={d} fill="none" stroke={accent} strokeWidth={1.2 / scale} opacity={0.9} />
            </>
          )
        }

        if (o.style === 'double') {
          return (
            <g key={`o${i}`}>
              {leafArc(at(a), at(b), w2 / 2)}
              {leafArc(at(b), at(a), w2 / 2)}
              {threshold}
            </g>
          )
        }

        if (o.style === 'sliding') {
          // Two overlapping panels offset to either face of the wall, plus a
          // travel arrow on the leading panel.
          const k = thk * 0.28
          const pLen = w2 * 0.58
          const p1a = { x: at(a).x + nx * k, y: at(a).y + ny * k }
          const p1b = { x: at(a + pLen).x + nx * k, y: at(a + pLen).y + ny * k }
          const p2a = { x: at(b - pLen).x - nx * k, y: at(b - pLen).y - ny * k }
          const p2b = { x: at(b).x - nx * k, y: at(b).y - ny * k }
          const arrowBase = { x: at(a + w2 * 0.45).x + nx * k * 3.2, y: at(a + w2 * 0.45).y + ny * k * 3.2 }
          const arrowTip = { x: at(a + w2 * 0.8).x + nx * k * 3.2, y: at(a + w2 * 0.8).y + ny * k * 3.2 }
          const ah = 0.07 // arrowhead size (m)
          return (
            <g key={`o${i}`}>
              <line x1={p1a.x} y1={p1a.y} x2={p1b.x} y2={p1b.y} stroke={accent} strokeWidth={thk * 0.3} />
              <line x1={p2a.x} y1={p2a.y} x2={p2b.x} y2={p2b.y} stroke={accent} strokeWidth={thk * 0.3} />
              <line x1={arrowBase.x} y1={arrowBase.y} x2={arrowTip.x} y2={arrowTip.y} stroke={accent} strokeWidth={1.2 / scale} opacity={0.85} />
              <path d={`M ${arrowTip.x - ux * ah - nx * ah * 0.6} ${arrowTip.y - uy * ah - ny * ah * 0.6}
                        L ${arrowTip.x} ${arrowTip.y}
                        L ${arrowTip.x - ux * ah + nx * ah * 0.6} ${arrowTip.y - uy * ah + ny * ah * 0.6}`}
                fill="none" stroke={accent} strokeWidth={1.2 / scale} opacity={0.85} />
              {threshold}
            </g>
          )
        }

        if (o.style === 'folding') {
          // Bifold zigzag from the hinge jamb: panel vertices alternate between
          // the wall line and the swing side.
          const panels = 4
          const out = w2 * 0.22
          const from = o.hinge === 1 ? b : a
          const dir = o.hinge === 1 ? -1 : 1
          const pts = []
          for (let v = 0; v <= panels; v++) {
            const along = from + dir * (w2 * v) / panels
            const lat = (v % 2) * out
            pts.push(`${(at(along).x + sx * lat).toFixed(4)},${(at(along).y + sy * lat).toFixed(4)}`)
          }
          return (
            <g key={`o${i}`}>
              <polyline points={pts.join(' ')} fill="none" stroke={accent} strokeWidth={1.8 / scale} strokeLinejoin="round" />
              {threshold}
            </g>
          )
        }

        // default: single swing leaf
        return (
          <g key={`o${i}`}>
            {leafArc(hinge, other, w2)}
            {threshold}
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
