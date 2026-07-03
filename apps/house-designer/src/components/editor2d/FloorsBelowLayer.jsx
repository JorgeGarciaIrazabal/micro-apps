import { dist } from '../../lib/geometry.js'
import { FurnitureGraphic } from '../FurnitureGraphic.jsx'

// Floors strictly below the active one, drawn faintly as a construction guide.
export default function FloorsBelowLayer({ floors }) {
  return floors.map((bf) => (
    <g key={`bf-${bf.id}`} opacity={0.1} style={{ pointerEvents: 'none' }}>
      {bf.walls.map((w) => {
        const L = dist(w.x1, w.y1, w.x2, w.y2)
        if (L < 1e-4) return null
        return (
          <line key={w.id} x1={w.x1} y1={w.y1} x2={w.x2} y2={w.y2}
            stroke="#9a9183" strokeWidth={w.thickness} strokeLinecap="butt" />
        )
      })}
      {bf.furniture.map((f) => (
        <g key={f.id} transform={`translate(${f.x} ${f.y}) rotate(${(f.rotation * 180) / Math.PI})`}>
          <FurnitureGraphic type={f.type} width={f.width} depth={f.depth} color={f.color} />
        </g>
      ))}
    </g>
  ))
}
