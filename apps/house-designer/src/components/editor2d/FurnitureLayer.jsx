import { FurnitureGraphic } from '../FurnitureGraphic.jsx'

// Active-floor furniture. Rugs render first so everything else sits on top.
export default function FurnitureLayer({ furniture, selectedId, hoverId, scale }) {
  const rugs = furniture.filter((f) => f.type === 'rug')
  const rest = furniture.filter((f) => f.type !== 'rug')
  const render = (f) => {
    const sel = f.id === selectedId
    const hov = !sel && f.id === hoverId
    return (
      <g key={f.id} transform={`translate(${f.x} ${f.y}) rotate(${(f.rotation * 180) / Math.PI})`}>
        <FurnitureGraphic type={f.type} width={f.width} depth={f.depth} color={f.color} />
        {(sel || hov) && (
          <rect x={-f.width / 2} y={-f.depth / 2} width={Math.max(f.width, 0)} height={Math.max(f.depth, 0)}
            rx={Math.max(0, Math.min(f.width, f.depth) * 0.08)} fill="none" stroke="#ff8c1a"
            strokeWidth={(sel ? 2.5 : 4) / scale} opacity={sel ? 1 : 0.3} />
        )}
      </g>
    )
  }
  return [...rugs.map(render), ...rest.map(render)]
}
