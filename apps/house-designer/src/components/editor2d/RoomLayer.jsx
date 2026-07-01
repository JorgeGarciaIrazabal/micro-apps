import { useMemo } from 'react'
import { detectRooms } from '../../lib/rooms.js'

// Soft fills for detected rooms (under the walls) so enclosed spaces read as
// rooms. Returns both the world-space fills and the data for screen-space
// area labels (rendered by the parent so they stay crisp).
export function useRooms(floor) {
  const walls = floor.walls
  return useMemo(() => detectRooms({ walls }), [walls])
}

export default function RoomFills({ rooms }) {
  return (
    <g style={{ pointerEvents: 'none' }}>
      {rooms.map((r, i) => (
        <polygon key={i}
          points={r.polygon.map((p) => `${p.x},${p.y}`).join(' ')}
          fill={i % 2 ? '#ece5d8' : '#efe9df'} opacity={0.55} />
      ))}
    </g>
  )
}

export function RoomLabels({ rooms, worldToScreen }) {
  return (
    <g style={{ pointerEvents: 'none' }}>
      {rooms.filter((r) => r.area >= 1).map((r, i) => {
        const p = worldToScreen(r.centroid.x, r.centroid.y)
        return (
          <text key={i} x={p.sx} y={p.sy} textAnchor="middle" dominantBaseline="middle"
            fontSize={12} fill="#8b8271" fontWeight={600}>
            {r.area.toFixed(1)} m²
          </text>
        )
      })}
    </g>
  )
}
