import { fmtWallLabel } from '../../lib/project.js'
import { wallUnit } from '../../lib/geometry.js'

// A screen-space measurement pill. Rotation is normalized so text never
// renders upside-down.
export function DimensionPill({ sx, sy, text, angleDeg = 0, accent = false }) {
  let a = angleDeg
  if (a > 90) a -= 180
  if (a < -90) a += 180
  const w = text.length * 6.6 + 12
  return (
    <g transform={`translate(${sx} ${sy}) rotate(${a})`} style={{ pointerEvents: 'none' }}>
      <rect x={-w / 2} y={-9} width={w} height={18} rx={4}
        fill={accent ? '#fff3e2' : '#fffdf8'} stroke={accent ? '#ff8c1a' : '#d8d2c6'} strokeWidth={1} opacity={0.94} />
      <text x={0} y={1} textAnchor="middle" dominantBaseline="middle" fontSize={11}
        fill={accent ? '#b35400' : '#5a5247'}>{text}</text>
    </g>
  )
}

// Wall length labels, drawn in screen space for crisp text: rotated to the
// wall angle, offset perpendicular so they sit beside the wall, hidden when
// the wall is too short on screen to label legibly.
export default function WallLabels({ walls, worldToScreen, scale }) {
  return (
    <g>
      {walls.map((w) => {
        const { L, ux, uy, nx, ny } = wallUnit(w)
        if (L * scale < 48) return null
        const lbl = fmtWallLabel(w)
        if (!lbl) return null
        const offM = (w.thickness / 2) + 14 / scale // beside the wall, in meters
        const mid = worldToScreen(
          (w.x1 + w.x2) / 2 + nx * offM,
          (w.y1 + w.y2) / 2 + ny * offM,
        )
        const angle = (Math.atan2(uy, ux) * 180) / Math.PI
        return <DimensionPill key={`wl${w.id}`} sx={mid.sx} sy={mid.sy} text={lbl} angleDeg={angle} />
      })}
    </g>
  )
}
