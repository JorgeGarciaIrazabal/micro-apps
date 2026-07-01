import { useMemo } from 'react'

// Grid lines covering the visible world window. Minor lines every grid step,
// major lines on whole meters.
export default function GridLayer({ size, scale, grid, screenToWorld }) {
  const gridLines = useMemo(() => {
    if (!size.w) return { minor: [], major: [] }
    const tl = screenToWorld(0, 0)
    const br = screenToWorld(size.w, size.h)
    const x0 = Math.floor(tl.x / grid) * grid
    const x1 = Math.ceil(br.x / grid) * grid
    const y0 = Math.floor(tl.y / grid) * grid
    const y1 = Math.ceil(br.y / grid) * grid
    const minor = []
    const major = []
    const eps = 1e-6
    for (let x = x0; x <= x1 + eps; x += grid) {
      const isMajor = Math.abs(x - Math.round(x)) < eps
      ;(isMajor ? major : minor).push({ x, y0, y1 })
    }
    for (let y = y0; y <= y1 + eps; y += grid) {
      const isMajor = Math.abs(y - Math.round(y)) < eps
      ;(isMajor ? major : minor).push({ x0, x1, y })
    }
    return { minor, major }
  }, [size, grid, screenToWorld])

  const line = (l, key, stroke) => (
    'y0' in l
      ? <line key={key} x1={l.x} y1={l.y0} x2={l.x} y2={l.y1} stroke={stroke} strokeWidth={1 / scale} vectorEffect="non-scaling-stroke" />
      : <line key={key} x1={l.x0} y1={l.y} x2={l.x1} y2={l.y} stroke={stroke} strokeWidth={1 / scale} vectorEffect="non-scaling-stroke" />
  )

  return (
    <>
      <g className="grid-minor">{gridLines.minor.map((l, i) => line(l, `m${i}`, '#e3e0d9'))}</g>
      <g className="grid-major">{gridLines.major.map((l, i) => line(l, `M${i}`, '#cfcabf'))}</g>
    </>
  )
}
