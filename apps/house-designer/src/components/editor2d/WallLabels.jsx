import { fmtWallLabel } from '../../lib/project.js'
import { wallUnit } from '../../lib/geometry.js'

// Ray-casting point-in-polygon algorithm to check if a coordinate is inside a room
function pointInPolygon(x, y, poly) {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x, yi = poly[i].y
    const xj = poly[j].x, yj = poly[j].y
    const intersect = ((yi > y) !== (yj > y))
        && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)
    if (intersect) inside = !inside
  }
  return inside
}

// A screen-space measurement pill. Rotation is normalized so text never
// renders upside-down. Supports customizable opacity.
export function DimensionPill({ sx, sy, text, angleDeg = 0, accent = false, opacity = 1.0 }) {
  let a = angleDeg
  if (a > 90) a -= 180
  if (a < -90) a += 180
  const w = text.length * 6.6 + 12
  return (
    <g transform={`translate(${sx} ${sy}) rotate(${a})`} style={{ pointerEvents: 'none' }} opacity={opacity}>
      <rect x={-w / 2} y={-9} width={w} height={18} rx={4}
        fill={accent ? '#fff3e2' : '#fffdf8'} stroke={accent ? '#ff8c1a' : '#d8d2c6'} strokeWidth={1} opacity={0.94} />
      <text x={0} y={1} textAnchor="middle" dominantBaseline="middle" fontSize={11}
        fill={accent ? '#b35400' : '#5a5247'}>{text}</text>
    </g>
  )
}

// Wall length labels, drawn in screen space for crisp text. Offsets outwards
// from the center of the plan, and makes interior/partition labels semi-transparent.
export default function WallLabels({ walls, worldToScreen, scale, rooms = [] }) {
  // Calculate average center of the blueprint
  let cx = 0, cy = 0
  if (walls.length > 0) {
    let sumX = 0, sumY = 0
    walls.forEach((w) => {
      sumX += (w.x1 + w.x2) / 2
      sumY += (w.y1 + w.y2) / 2
    })
    cx = sumX / walls.length
    cy = sumY / walls.length
  }

  return (
    <g>
      {walls.map((w) => {
        const { L, ux, uy, nx: baseNx, ny: baseNy } = wallUnit(w)
        if (L * scale < 48) return null
        const lbl = fmtWallLabel(w)
        if (!lbl) return null

        // Determine outward direction relative to center of the project
        const mx = (w.x1 + w.x2) / 2
        const my = (w.y1 + w.y2) / 2
        const dx = mx - cx
        const dy = my - cy

        // Flip normal if it points inward (dot product with outward vector is negative)
        const dot = baseNx * dx + baseNy * dy
        const nx = dot >= 0 ? baseNx : -baseNx
        const ny = dot >= 0 ? baseNy : -baseNy

        const offM = (w.thickness / 2) + 14 / scale // beside the wall, in meters
        const mid = worldToScreen(mx + nx * offM, my + ny * offM)
        const angle = (Math.atan2(uy, ux) * 180) / Math.PI

        // Determine if wall is interior
        let opacity = 1.0
        if (rooms.length > 0) {
          // Offset midpoint slightly left and right along the normal vector (8 cm offset)
          const pLeftX = mx - baseNx * 0.08
          const pLeftY = my - baseNy * 0.08
          const pRightX = mx + baseNx * 0.08
          const pRightY = my + baseNy * 0.08

          const leftInside = rooms.some(r => pointInPolygon(pLeftX, pLeftY, r.polygon))
          const rightInside = rooms.some(r => pointInPolygon(pRightX, pRightY, r.polygon))

          // If both sides of the wall lie inside closed room polygons, it is an interior wall
          if (leftInside && rightInside) {
            opacity = 0.45
          }
        }

        return <DimensionPill key={`wl${w.id}`} sx={mid.sx} sy={mid.sy} text={lbl} angleDeg={angle} opacity={opacity} />
      })}
    </g>
  )
}
