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

export function FurnitureGraphic({ type, width: w, depth: d, color }) {
  // Guard against tiny/negative dimensions (the app clamps furniture to >= 0.1
  // but imported data or in-flight drags can transiently be smaller).
  w = Math.max(w, 0.1)
  d = Math.max(d, 0.1)
  const hx = w / 2, hy = d / 2
  const dark = shade(color, 0.7)
  const light = shade(color, 1.22)
  const sw = Math.min(w, d) * 0.05
  const foot = { fill: color, stroke: dark, strokeWidth: sw, rx: Math.min(w, d) * 0.08 }

  const body = (
    <rect x={-hx} y={-hy} width={w} height={d} rx={clamp0(foot.rx)} fill={foot.fill}
      stroke={foot.stroke} strokeWidth={foot.strokeWidth} />
  )

  switch (defFor(type).symbol) {
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
        <rect x={-hx} y={-hy} width={w} height={d} rx={clamp0(foot.rx)} fill={color} opacity={0.55} />
        <rect x={-hx + 0.1} y={-hy + 0.1} width={clamp0(w - 0.2)} height={clamp0(d - 0.2)} rx={clamp0(foot.rx - 0.04)}
          fill="none" stroke={shade(color, 0.6)} strokeWidth={sw * 0.8} opacity={0.7} />
        <rect x={-hx + 0.2} y={-hy + 0.2} width={clamp0(w - 0.4)} height={clamp0(d - 0.4)} rx={clamp0(foot.rx - 0.08)}
          fill="none" stroke={light} strokeWidth={sw * 0.5} opacity={0.5} />
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