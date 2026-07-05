import { useId } from 'react'
import { shade } from '../lib/color.js'
import { defFor } from '../lib/furniture/registry.js'

// Top-down 2D graphics for furniture, drawn in the item's LOCAL frame:
// x in [-w/2, w/2] (width), y in [-d/2, d/2] (depth), centered at (0,0).
// The parent <g> applies translate+rotate, so "back" at -y rotates with the
// piece. Recognizable from above — no text label needed.
//
// Reference shapes follow standard floor-plan icon conventions (sofa backrest
// strip + cushions, bed with pillows + headboard, toilet tank+bowl, stove 4
// burners, etc.) so each piece reads at a glance.

const clamp0 = (v) => (v > 0 ? v : 0)

// Which plan symbols get a material pattern fill over their body rect.
const SYMBOL_FINISH = {
  seat: 'fabric', bed: 'fabric', rug: 'fabric',
  table: 'wood', chair: 'wood', bench: 'wood', piano: 'wood', cabinet: 'wood',
  nightstand: 'wood', bookshelf: 'wood', 'tv-stand': 'wood', stairs: 'wood',
  'stairs-l': 'wood', 'stairs-u': 'wood', 'stairs-spiral': 'wood', 'stairs-split': 'wood',
}

export function FurnitureGraphic({ type, width: w, depth: d, color }) {
  // useId may contain characters that are unsafe inside url(#...) refs.
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  // Guard against tiny/negative dimensions (the app clamps furniture to >= 0.1
  // but imported data or in-flight drags can transiently be smaller).
  w = Math.max(w, 0.1)
  d = Math.max(d, 0.1)
  const hx = w / 2, hy = d / 2
  const dark = shade(color, 0.7)
  const light = shade(color, 1.22)
  const sw = Math.min(w, d) * 0.05
  const foot = { fill: color, stroke: dark, strokeWidth: sw, rx: Math.min(w, d) * 0.08 }

  const symbol = defFor(type).symbol
  const finish = SYMBOL_FINISH[symbol]
  const texId = `${uid}-tex`
  const sheenId = `${uid}-sheen`

  // Material pattern (wood grain / fabric weave) + a soft diagonal sheen so
  // flat plan colors read as lit surfaces. Referenced by `body` and by the
  // rug symbol, which draws its own base rect.
  const texDefs = (
    <defs>
      {finish === 'wood' && (
        <pattern id={texId} patternUnits="userSpaceOnUse" x={-hx} y={-hy} width={0.8} height={0.12}>
          <line x1={0} y1={0.06} x2={0.8} y2={0.06} stroke={dark} strokeWidth={0.012} opacity={0.3} />
          <line x1={0.08} y1={0.028} x2={0.62} y2={0.022} stroke={dark} strokeWidth={0.008} opacity={0.2} />
          <line x1={0.2} y1={0.096} x2={0.75} y2={0.09} stroke={dark} strokeWidth={0.008} opacity={0.16} />
        </pattern>
      )}
      {finish === 'fabric' && (
        <pattern id={texId} patternUnits="userSpaceOnUse" x={-hx} y={-hy} width={0.09} height={0.09}>
          <line x1={0} y1={0.045} x2={0.09} y2={0.045} stroke={dark} strokeWidth={0.01} opacity={0.14} />
          <line x1={0.045} y1={0} x2={0.045} y2={0.09} stroke={dark} strokeWidth={0.01} opacity={0.14} />
        </pattern>
      )}
      <linearGradient id={sheenId} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#ffffff" stopOpacity="0.26" />
        <stop offset="0.45" stopColor="#ffffff" stopOpacity="0" />
        <stop offset="1" stopColor="#000000" stopOpacity="0.12" />
      </linearGradient>
    </defs>
  )

  const body = (
    <>
      {texDefs}
      <rect x={-hx} y={-hy} width={w} height={d} rx={clamp0(foot.rx)} fill={foot.fill}
        stroke={foot.stroke} strokeWidth={foot.strokeWidth} />
      {finish && (
        <rect x={-hx} y={-hy} width={w} height={d} rx={clamp0(foot.rx)} fill={`url(#${texId})`} />
      )}
      <rect x={-hx} y={-hy} width={w} height={d} rx={clamp0(foot.rx)} fill={`url(#${sheenId})`} />
    </>
  )

  // ---- shared stair helpers (used by the straight/L/U/spiral/split symbols) --
  // A single wood-finished stair-flight rectangle. Treads are added separately.
  const flightRect = (x, y, rw, rh, key) => (
    <g key={key}>
      <rect x={x} y={y} width={rw} height={rh} fill={color} stroke={dark} strokeWidth={sw * 0.6} />
      <rect x={x} y={y} width={rw} height={rh} fill={`url(#${texId})`} />
      <rect x={x} y={y} width={rw} height={rh} fill={`url(#${sheenId})`} />
    </g>
  )
  // Evenly spaced tread lines across a flight. axis 'h' → horizontal lines (a
  // flight that runs along y); 'v' → vertical lines (a flight that runs along x).
  const treadLines = (x, y, rw, rh, axis, key) => {
    const runLen = axis === 'h' ? rh : rw
    const n = Math.max(3, Math.round(runLen / 0.27))
    return <g key={key}>
      {Array.from({ length: n - 1 }).map((_, i) => {
        const t = (i + 1) / n
        return axis === 'h'
          ? <line key={i} x1={x} y1={y + rh * t} x2={x + rw} y2={y + rh * t} stroke={dark} strokeWidth={sw * 0.5} opacity={0.7} />
          : <line key={i} x1={x + rw * t} y1={y} x2={x + rw * t} y2={y + rh} stroke={dark} strokeWidth={sw * 0.5} opacity={0.7} />
      })}
    </g>
  }
  // Small arrowhead at (x,y) pointing up/down/left/right — marks the "up" way.
  const arrowHead = (x, y, dir, key) => {
    const a = 0.11
    const d2 = {
      up: `M ${x - a} ${y + a} L ${x} ${y} L ${x + a} ${y + a}`,
      down: `M ${x - a} ${y - a} L ${x} ${y} L ${x + a} ${y - a}`,
      left: `M ${x + a} ${y - a} L ${x} ${y} L ${x + a} ${y + a}`,
      right: `M ${x - a} ${y - a} L ${x} ${y} L ${x - a} ${y + a}`,
    }[dir]
    return <path key={key} d={d2} fill="none" stroke={dark} strokeWidth={sw * 1.2}
      strokeLinejoin="round" strokeLinecap="round" />
  }

  switch (symbol) {
    case 'seat': {
      const seats = type === 'sofa' ? (w > 1.4 ? 3 : 2) : 1
      const back = 0.22 * d
      const arm = type === 'sofa' ? 0.1 * w : 0.14 * w
      const seams = []
      for (let i = 1; i < seats; i++) seams.push(-hx + arm + ((w - 2 * arm) * i) / seats)
      return <>
        {body}
        {/* backrest along the -y edge */}
        <rect x={-hx} y={-hy} width={w} height={back} rx={sw} fill={dark} />
        {/* armrests */}
        <rect x={-hx} y={-hy + back} width={arm} height={d - back} rx={sw} fill={shade(color, 0.85)} />
        <rect x={hx - arm} y={-hy + back} width={arm} height={d - back} rx={sw} fill={shade(color, 0.85)} />
        {/* cushion seams */}
        {seams.map((x, i) => (
          <line key={i} x1={x} y1={-hy + back + sw} x2={x} y2={hy - sw} stroke={dark} strokeWidth={sw * 0.6} opacity={0.6} />
        ))}
      </>
    }

    case 'bed': {
      const pillows = type === 'bed-double' ? 2 : 1
      const head = 0.12 * d
      const pw = (w - 0.18) / pillows
      return <>
        {body}
        {/* headboard */}
        <rect x={-hx} y={-hy} width={w} height={head} rx={sw} fill={shade(color, 0.6)} />
        {/* pillows */}
        {Array.from({ length: pillows }).map((_, i) => (
          <rect key={i} x={-hx + 0.09 + i * (pw + 0.09)} y={-hy + head + 0.04}
            width={pw} height={0.16 * d} rx={sw} fill={light} stroke={dark} strokeWidth={sw * 0.5} />
        ))}
        {/* blanket fold near the foot */}
        <line x1={-hx + 0.05} y1={hy - 0.22 * d} x2={hx - 0.05} y2={hy - 0.22 * d}
          stroke={dark} strokeWidth={sw * 0.7} opacity={0.5} />
      </>
    }

    case 'table': {
      const leg = Math.min(w, d) * 0.14
      const inset = 0.06
      return <>
        {body}
        {/* subtle grain along the width */}
        {[0.3, 0.5, 0.7].map((t, i) => (
          <line key={`g${i}`} x1={-hx + 0.08} y1={-hy + d * t} x2={hx - 0.08} y2={-hy + d * t}
            stroke={dark} strokeWidth={sw * 0.4} opacity={0.18} />
        ))}
        {/* four leg marks at the corners */}
        {[[ -1, -1 ], [ 1, -1 ], [ -1, 1 ], [ 1, 1 ]].map(([sx, sy], i) => (
          <rect key={i} x={sx * hx - sx * inset - leg / 2} y={sy * hy - sy * inset - leg / 2}
            width={leg} height={leg} rx={leg * 0.3} fill={dark} />
        ))}
        {/* desk: chair-notch cue on the +y (sitting) edge */}
        {type === 'desk' && (
          <rect x={-w * 0.25} y={hy - 0.04} width={w * 0.5} height={0.04} rx={0.015} fill={dark} opacity={0.5} />
        )}
      </>
    }

    case 'chair': {
      const back = 0.22 * d
      return <>
        {body}
        <rect x={-hx} y={-hy} width={w} height={back} rx={sw} fill={shade(color, 0.7)} />
        {/* seat inset so it reads at small sizes */}
        <rect x={-hx + w * 0.14} y={-hy + back + d * 0.08} width={clamp0(w * 0.72)} height={clamp0(d * 0.6)}
          rx={sw * 1.4} fill={light} opacity={0.55} />
      </>
    }

    case 'office-chair': {
      const r = Math.min(w, d) / 2
      return <>
        {body}
        {/* seat */}
        <circle cx={0} cy={0.06 * d} r={r * 0.62} fill={shade(color, 1.1)} stroke={dark} strokeWidth={sw} />
        {/* backrest */}
        <path d={`M ${-r * 0.6} ${-hy + 0.03} A ${r * 0.7} ${r * 0.7} 0 0 1 ${r * 0.6} ${-hy + 0.03}`}
          fill="none" stroke={dark} strokeWidth={sw * 1.1} />
        {/* 5-star base */}
        {Array.from({ length: 5 }).map((_, i) => {
          const a = (i / 5) * Math.PI * 2 + Math.PI / 2
          return <line key={i} x1={0} y1={0.06 * d} x2={Math.cos(a) * r * 0.95} y2={0.06 * d + Math.sin(a) * r * 0.95}
            stroke={dark} strokeWidth={sw * 0.9} />
        })}
      </>
    }

    case 'toilet': {
      const tankW = w * 0.86, tankH = d * 0.26
      return <>
        {/* tank at -y */}
        <rect x={-tankW / 2} y={-hy} width={tankW} height={tankH} rx={sw} fill={color} stroke={dark} strokeWidth={sw} />
        {/* bowl (ellipse) at +y */}
        <ellipse cx={0} cy={(tankH - hy + hy) / 2 + 0.02} rx={w * 0.42} ry={(d - tankH) * 0.46}
          fill={light} stroke={dark} strokeWidth={sw} />
      </>
    }

    case 'bathtub': {
      return <>
        {body}
        <rect x={-hx + 0.08} y={-hy + 0.08} width={clamp0(w - 0.16)} height={clamp0(d - 0.16)} rx={clamp0(foot.rx - 0.04)}
          fill={light} stroke={dark} strokeWidth={sw * 0.5} opacity={0.9} />
        <circle cx={hx - 0.18} cy={0} r={0.05} fill={dark} opacity={0.5} />
      </>
    }

    case 'shower': {
      return <>
        {body}
        <rect x={-hx + 0.05} y={-hy + 0.05} width={clamp0(w - 0.1)} height={clamp0(d - 0.1)} fill="none"
          stroke={light} strokeWidth={sw * 0.7} strokeDasharray={`${sw} ${sw}`} />
        <circle cx={0} cy={0} r={Math.min(w, d) * 0.1} fill={light} stroke={dark} strokeWidth={sw * 0.5} />
        <line x1={-hx + 0.05} y1={-hy + 0.05} x2={hx - 0.05} y2={hy - 0.05} stroke={dark} strokeWidth={sw * 0.4} opacity={0.35} />
      </>
    }

    case 'sink': {
      // Elliptical basin + faucet stub so it doesn't read as a cabinet.
      return <>
        {body}
        <ellipse cx={0} cy={0.03 * d} rx={clamp0(hx - 0.12)} ry={clamp0(hy - 0.15)}
          fill={light} stroke={dark} strokeWidth={sw * 0.6} />
        <ellipse cx={0} cy={0.03 * d} rx={clamp0((hx - 0.12) * 0.35)} ry={clamp0((hy - 0.15) * 0.35)}
          fill={shade(color, 1.35)} opacity={0.8} />
        <line x1={0} y1={-hy + 0.02} x2={0} y2={-hy + 0.12} stroke={dark} strokeWidth={sw * 1.2} />
        <circle cx={0} cy={-hy + 0.07} r={0.035} fill={dark} />
      </>
    }

    case 'vanity': {
      return <>
        {body}
        <rect x={-hx + 0.1} y={-hy + 0.14} width={clamp0(w - 0.2)} height={clamp0(d - 0.24)} rx={sw}
          fill={light} stroke={dark} strokeWidth={sw * 0.5} />
        <circle cx={0} cy={-hy + 0.07} r={0.04} fill={dark} />
      </>
    }

    case 'stove': {
      const bx = w * 0.22, by = d * 0.22
      const spots = [[ -bx, -by ], [ bx, -by ], [ -bx, by ], [ bx, by ]]
      return <>
        {body}
        {spots.map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={Math.min(w, d) * 0.13} fill={dark} opacity={0.85} />
            <circle cx={x} cy={y} r={Math.min(w, d) * 0.06} fill={shade(color, 1.4)} />
          </g>
        ))}
      </>
    }

    case 'fridge': {
      return <>
        {body}
        {/* freezer / door seam */}
        <line x1={-hx} y1={-hy + d * 0.34} x2={hx} y2={-hy + d * 0.34} stroke={dark} strokeWidth={sw * 0.7} />
        <line x1={hx - 0.06} y1={-hy + 0.06} x2={hx - 0.06} y2={hy - 0.06} stroke={dark} strokeWidth={sw} opacity={0.7} />
      </>
    }

    case 'cabinet': {
      const rows = type === 'wardrobe' ? 1 : (type === 'filing-cabinet' ? 3 : 2)
      const cols = type === 'wardrobe' ? 2 : 1
      const lines = []
      for (let i = 1; i < cols; i++) lines.push([-hx + (w * i) / cols, -hy, -hx + (w * i) / cols, hy])
      for (let i = 1; i < rows; i++) lines.push([-hx, -hy + (d * i) / rows, hx, -hy + (d * i) / rows])
      return <>
        {body}
        {lines.map((l, i) => <line key={i} x1={l[0]} y1={l[1]} x2={l[2]} y2={l[3]} stroke={dark} strokeWidth={sw * 0.6} opacity={0.6} />)}
        {/* handles */}
        {cols > 1 && [-hx + w / 4, hx - w / 4].map((x, i) => (
          <circle key={i} cx={x} cy={0} r={0.025} fill={dark} />
        ))}
      </>
    }

    case 'nightstand': {
      return <>
        {body}
        <line x1={-hx + 0.05} y1={0} x2={hx - 0.05} y2={0} stroke={dark} strokeWidth={sw * 0.5} opacity={0.6} />
        <circle cx={0} cy={hy - 0.06} r={0.02} fill={dark} />
      </>
    }

    case 'bookshelf': {
      const shelves = 3
      return <>
        {body}
        {Array.from({ length: shelves }).map((_, i) => (
          <line key={i} x1={-hx + 0.05} y1={-hy + (d * (i + 1)) / (shelves + 1)}
            x2={hx - 0.05} y2={-hy + (d * (i + 1)) / (shelves + 1)} stroke={dark} strokeWidth={sw * 0.6} />
        ))}
      </>
    }

    case 'tv-stand': {
      return <>
        {body}
        <line x1={0} y1={-hy} x2={0} y2={hy} stroke={dark} strokeWidth={sw * 0.5} opacity={0.5} />
        {/* TV slab + stand foot, hanging off the -y (wall) edge */}
        <rect x={-w * 0.35} y={-hy - 0.07} width={w * 0.7} height={0.06} rx={0.02} fill="#22201d" />
        <line x1={0} y1={-hy - 0.01} x2={0} y2={-hy} stroke="#22201d" strokeWidth={sw * 1.6} />
      </>
    }

    case 'counter': {
      return <>
        {body}
        <rect x={-hx + 0.06} y={-hy + 0.06} width={clamp0(w - 0.12)} height={clamp0(d - 0.12)} rx={clamp0(foot.rx - 0.04)}
          fill="none" stroke={light} strokeWidth={sw * 0.4} opacity={0.6} />
      </>
    }

    case 'plant': {
      const r = Math.min(w, d) / 2
      return <>
        <circle cx={0} cy={0} r={r} fill={shade('#6b4e3d', 0.9)} stroke={dark} strokeWidth={sw} />
        {[[ -r * 0.4, -r * 0.3 ], [ r * 0.45, -r * 0.15 ], [ -r * 0.2, r * 0.4 ], [ r * 0.25, r * 0.35 ]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={r * 0.42} fill={shade('#4a7c4a', 1 + i * 0.05)} />
        ))}
        <circle cx={0} cy={0} r={r * 0.18} fill={shade('#6b4e3d', 0.7)} />
      </>
    }

    case 'tree': {
      const r = Math.min(w, d) / 2
      return <>
        <circle cx={0} cy={0} r={r} fill={shade('#3d6b3d', 1.05)} stroke={shade('#2d5230', 0.8)} strokeWidth={sw} />
        {[[ -r * 0.3, -r * 0.2, 0.7 ], [ r * 0.35, r * 0.1, 0.85 ], [ -r * 0.1, r * 0.4, 0.6 ], [ r * 0.2, -r * 0.4, 0.6 ]].map(([x, y, s], i) => (
          <circle key={i} cx={x} cy={y} r={r * 0.45 * s} fill={shade('#3d6b3d', 1.1 + i * 0.03)} opacity={0.9} />
        ))}
        <circle cx={0} cy={0} r={r * 0.16} fill={shade('#6b4e3d', 0.9)} />
      </>
    }

    case 'rug': {
      return <>
        {texDefs}
        <rect x={-hx} y={-hy} width={w} height={d} rx={clamp0(foot.rx)} fill={color} opacity={0.55} />
        <rect x={-hx} y={-hy} width={w} height={d} rx={clamp0(foot.rx)} fill={`url(#${texId})`} opacity={0.7} />
        <rect x={-hx + 0.1} y={-hy + 0.1} width={clamp0(w - 0.2)} height={clamp0(d - 0.2)} rx={clamp0(foot.rx - 0.04)}
          fill="none" stroke={shade(color, 0.6)} strokeWidth={sw * 0.8} opacity={0.7} />
        <rect x={-hx + 0.2} y={-hy + 0.2} width={clamp0(w - 0.4)} height={clamp0(d - 0.4)} rx={clamp0(foot.rx - 0.08)}
          fill="none" stroke={light} strokeWidth={sw * 0.5} opacity={0.5} />
      </>
    }

    case 'stairs': {
      // treads across the depth + an "up" arrow along the run (toward -y)
      const treads = Math.max(4, Math.round(d / 0.27))
      return <>
        {body}
        {Array.from({ length: treads - 1 }).map((_, i) => (
          <line key={i} x1={-hx} y1={-hy + (d * (i + 1)) / treads} x2={hx} y2={-hy + (d * (i + 1)) / treads}
            stroke={dark} strokeWidth={sw * 0.5} opacity={0.7} />
        ))}
        <line x1={0} y1={hy - 0.15} x2={0} y2={-hy + 0.25} stroke={dark} strokeWidth={sw * 1.2} />
        <path d={`M ${-0.09} ${-hy + 0.34} L 0 ${-hy + 0.18} L ${0.09} ${-hy + 0.34}`}
          fill="none" stroke={dark} strokeWidth={sw * 1.2} />
      </>
    }

    case 'stairs-l': {
      // quarter-turn: lower flight (left column) → corner landing → upper flight
      // (top row). Rises toward -y then turns toward +x.
      const fw = Math.min(w, d) * 0.34
      const lowY = -hy + fw           // lower flight starts below the landing
      const upX = -hx + fw            // upper flight starts right of the landing
      const cxLow = -hx + fw / 2
      const cyUp = -hy + fw / 2
      return <>
        {texDefs}
        {flightRect(-hx, lowY, fw, hy - lowY, 'low')}
        {flightRect(-hx, -hy, fw, fw, 'land')}
        {flightRect(upX, -hy, hx - upX, fw, 'up')}
        {treadLines(-hx, lowY, fw, hy - lowY, 'h', 'tl')}
        {treadLines(upX, -hy, hx - upX, fw, 'v', 'tu')}
        <path d={`M ${cxLow} ${hy - 0.15} L ${cxLow} ${cyUp} L ${hx - 0.22} ${cyUp}`}
          fill="none" stroke={dark} strokeWidth={sw * 1.1} strokeLinejoin="round" opacity={0.9} />
        {arrowHead(hx - 0.2, cyUp, 'right', 'ah')}
      </>
    }

    case 'stairs-u': {
      // half-turn: up the left flight, across a top landing, down the right
      // flight (which keeps rising in elevation). Two parallel runs + a well.
      const fw = w * 0.42
      const rightX = hx - fw
      const landY = -hy + fw
      const cxL = -hx + fw / 2
      const cxR = hx - fw / 2
      return <>
        {texDefs}
        {flightRect(-hx, landY, fw, hy - landY, 'left')}
        {flightRect(rightX, landY, fw, hy - landY, 'right')}
        {flightRect(-hx, -hy, w, fw, 'land')}
        {treadLines(-hx, landY, fw, hy - landY, 'h', 'tl')}
        {treadLines(rightX, landY, fw, hy - landY, 'h', 'tr')}
        <path d={`M ${cxL} ${hy - 0.15} L ${cxL} ${-hy + fw / 2} L ${cxR} ${-hy + fw / 2} L ${cxR} ${hy - 0.3}`}
          fill="none" stroke={dark} strokeWidth={sw * 1.1} strokeLinejoin="round" opacity={0.9} />
        {arrowHead(cxR, hy - 0.16, 'down', 'ah')}
      </>
    }

    case 'stairs-spiral': {
      // circular run of wedge treads around a central newel post
      const R = Math.min(w, d) / 2
      const treads = 12
      // rotation arrow: an arc with a triangular head at its leading tip
      const ar = R * 0.62, a0 = -Math.PI * 0.85, a1 = Math.PI * 0.35
      const [x0, y0] = [Math.cos(a0) * ar, Math.sin(a0) * ar]
      const [x1, y1] = [Math.cos(a1) * ar, Math.sin(a1) * ar]
      const tx = -Math.sin(a1), ty = Math.cos(a1) // tangent (ascending direction)
      const nx = Math.cos(a1), ny = Math.sin(a1)   // outward normal
      const ah = 0.12
      return <>
        {texDefs}
        <circle cx={0} cy={0} r={R} fill={color} stroke={dark} strokeWidth={sw * 0.6} />
        <circle cx={0} cy={0} r={R} fill={`url(#${texId})`} />
        <circle cx={0} cy={0} r={R} fill={`url(#${sheenId})`} />
        {Array.from({ length: treads }).map((_, i) => {
          const a = (i / treads) * Math.PI * 2
          return <line key={i} x1={0} y1={0} x2={Math.cos(a) * R} y2={Math.sin(a) * R}
            stroke={dark} strokeWidth={sw * 0.5} opacity={0.6} />
        })}
        <path d={`M ${x0} ${y0} A ${ar} ${ar} 0 1 1 ${x1} ${y1}`}
          fill="none" stroke={dark} strokeWidth={sw * 1.1} opacity={0.9} />
        <path d={`M ${x1 - tx * ah + nx * ah * 0.6} ${y1 - ty * ah + ny * ah * 0.6}
          L ${x1} ${y1} L ${x1 - tx * ah - nx * ah * 0.6} ${y1 - ty * ah - ny * ah * 0.6}`}
          fill="none" stroke={dark} strokeWidth={sw * 1.1} strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={0} cy={0} r={R * 0.15} fill={dark} />
      </>
    }

    case 'stairs-split': {
      // bifurcated: a wide central flight up to a landing that splits into two
      // outer flights rising left and right toward the upper floor.
      const fw = w * 0.3            // outer flight width
      const wc = w * 0.5            // central flight width
      const lb = Math.min(0.5, d * 0.12) // half-depth of the landing band
      const cxL = -hx + fw / 2
      const cxR = hx - fw / 2
      return <>
        {texDefs}
        {flightRect(-wc / 2, lb, wc, hy - lb, 'center')}
        {flightRect(-hx, -lb, w, 2 * lb, 'land')}
        {flightRect(-hx, -hy, fw, hy - lb, 'ul')}
        {flightRect(hx - fw, -hy, fw, hy - lb, 'ur')}
        {treadLines(-wc / 2, lb, wc, hy - lb, 'h', 'tc')}
        {treadLines(-hx, -hy, fw, hy - lb, 'h', 'tul')}
        {treadLines(hx - fw, -hy, fw, hy - lb, 'h', 'tur')}
        <path d={`M 0 ${hy - 0.15} L 0 0`} fill="none" stroke={dark} strokeWidth={sw * 1.1} opacity={0.9} />
        <path d={`M 0 0 L ${cxL} 0 L ${cxL} ${-hy + 0.3}`} fill="none" stroke={dark} strokeWidth={sw} strokeLinejoin="round" opacity={0.85} />
        <path d={`M 0 0 L ${cxR} 0 L ${cxR} ${-hy + 0.3}`} fill="none" stroke={dark} strokeWidth={sw} strokeLinejoin="round" opacity={0.85} />
        {arrowHead(cxL, -hy + 0.16, 'up', 'al')}
        {arrowHead(cxR, -hy + 0.16, 'up', 'ar')}
      </>
    }

    case 'balcony': {
      // open platform with railing ticks on 3 sides; -y edge attaches to the house
      const rail = (x1, y1, x2, y2, key) => {
        const len = Math.hypot(x2 - x1, y2 - y1)
        const n = Math.max(2, Math.round(len / 0.3))
        const ticks = Array.from({ length: n + 1 }).map((_, i) => {
          const t = i / n
          return <circle key={i} cx={x1 + (x2 - x1) * t} cy={y1 + (y2 - y1) * t} r={0.03} fill={dark} />
        })
        return <g key={key}>
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={dark} strokeWidth={sw * 1.4} />
          {ticks}
        </g>
      }
      return <>
        <rect x={-hx} y={-hy} width={w} height={d} fill={light} stroke={dark} strokeWidth={sw * 0.5} opacity={0.75} />
        {/* tile joints */}
        {Array.from({ length: Math.max(1, Math.round(w / 0.5)) - 1 }).map((_, i) => (
          <line key={`t${i}`} x1={-hx + (w * (i + 1)) / Math.max(1, Math.round(w / 0.5))} y1={-hy}
            x2={-hx + (w * (i + 1)) / Math.max(1, Math.round(w / 0.5))} y2={hy} stroke={dark} strokeWidth={sw * 0.3} opacity={0.35} />
        ))}
        {rail(-hx, -hy, -hx, hy, 'l')}
        {rail(-hx, hy, hx, hy, 'f')}
        {rail(hx, hy, hx, -hy, 'r')}
      </>
    }

    case 'railing': {
      const n = Math.max(2, Math.round(w / 0.25))
      return <>
        <line x1={-hx} y1={0} x2={hx} y2={0} stroke={dark} strokeWidth={sw * 2} />
        {Array.from({ length: n + 1 }).map((_, i) => (
          <circle key={i} cx={-hx + (w * i) / n} cy={0} r={Math.max(0.03, d * 0.4)} fill={dark} />
        ))}
      </>
    }

    case 'appliance': {
      // front-loader: control strip at -y + round drum door
      const r = Math.min(w, d) * 0.3
      return <>
        {body}
        <line x1={-hx + 0.05} y1={-hy + 0.12} x2={hx - 0.05} y2={-hy + 0.12} stroke={dark} strokeWidth={sw * 0.6} opacity={0.7} />
        <circle cx={hx - 0.12} cy={-hy + 0.06} r={0.028} fill={dark} />
        <circle cx={0} cy={0.05 * d} r={r} fill={light} stroke={dark} strokeWidth={sw * 0.8} />
        <circle cx={0} cy={0.05 * d} r={r * 0.55} fill="none" stroke={dark} strokeWidth={sw * 0.5} opacity={0.6} />
      </>
    }

    case 'lamp': {
      const r = Math.min(w, d) / 2
      return <>
        <circle cx={0} cy={0} r={r} fill={light} stroke={dark} strokeWidth={sw} opacity={0.9} />
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i / 8) * Math.PI * 2
          return <line key={i} x1={Math.cos(a) * r * 0.55} y1={Math.sin(a) * r * 0.55}
            x2={Math.cos(a) * r * 0.9} y2={Math.sin(a) * r * 0.9} stroke={dark} strokeWidth={sw * 0.6} opacity={0.7} />
        })}
        <circle cx={0} cy={0} r={r * 0.16} fill={dark} />
      </>
    }

    case 'piano': {
      // upright piano: body + keyboard strip along the +y (player) edge
      const keys = 14
      const kd = Math.min(0.16, d * 0.3)
      return <>
        {body}
        <rect x={-hx + 0.04} y={hy - kd - 0.03} width={clamp0(w - 0.08)} height={kd} rx={sw * 0.5}
          fill="#f4f1ea" stroke={dark} strokeWidth={sw * 0.4} />
        {Array.from({ length: keys - 1 }).map((_, i) => (
          <line key={i} x1={-hx + 0.04 + ((w - 0.08) * (i + 1)) / keys} y1={hy - kd - 0.03}
            x2={-hx + 0.04 + ((w - 0.08) * (i + 1)) / keys} y2={hy - 0.03} stroke="#8b8271" strokeWidth={sw * 0.25} />
        ))}
      </>
    }

    case 'pool': {
      return <>
        <rect x={-hx} y={-hy} width={w} height={d} rx={Math.min(w, d) * 0.12} fill="#e3e0d6" stroke={dark} strokeWidth={sw * 0.6} />
        <rect x={-hx + 0.18} y={-hy + 0.18} width={clamp0(w - 0.36)} height={clamp0(d - 0.36)} rx={Math.min(w, d) * 0.1}
          fill={color} opacity={0.85} />
        {[0.35, 0.55, 0.75].map((t, i) => (
          <path key={i} d={`M ${-hx + 0.35} ${-hy + d * t} q ${w * 0.12} ${-0.08} ${w * 0.24} 0 t ${w * 0.24} 0`}
            fill="none" stroke="#fff" strokeWidth={sw * 0.5} opacity={0.5} />
        ))}
      </>
    }

    case 'bbq': {
      const r = Math.min(w, d) * 0.42
      return <>
        <circle cx={0} cy={0} r={r} fill={color} stroke={dark} strokeWidth={sw} />
        {[-0.5, -0.17, 0.17, 0.5].map((t, i) => (
          <line key={i} x1={-r * 0.8} y1={r * t} x2={r * 0.8} y2={r * t} stroke={light} strokeWidth={sw * 0.5} opacity={0.8} />
        ))}
        <rect x={r + 0.02} y={-d * 0.18} width={clamp0(hx - r - 0.04)} height={d * 0.36} rx={sw} fill={shade(color, 1.1)} stroke={dark} strokeWidth={sw * 0.4} />
      </>
    }

    case 'bench': {
      return <>
        {body}
        {[0.28, 0.5, 0.72].map((t, i) => (
          <line key={i} x1={-hx + 0.05} y1={-hy + d * t} x2={hx - 0.05} y2={-hy + d * t}
            stroke={dark} strokeWidth={sw * 0.5} opacity={0.6} />
        ))}
      </>
    }

    default: {
      // generic box: a carton with an X
      return <>
        {body}
        <line x1={-hx + 0.06} y1={-hy + 0.06} x2={hx - 0.06} y2={hy - 0.06} stroke={dark} strokeWidth={sw * 0.5} opacity={0.45} />
        <line x1={hx - 0.06} y1={-hy + 0.06} x2={-hx + 0.06} y2={hy - 0.06} stroke={dark} strokeWidth={sw * 0.5} opacity={0.45} />
      </>
    }
  }
}