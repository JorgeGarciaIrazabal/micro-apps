import { useCallback, useEffect, useRef, useState } from 'react'

// Pan/zoom state for the 2D editor plus the world<->screen mapping helpers.
// Owns the container ResizeObserver, the non-passive wheel-zoom listener
// (React's synthetic onWheel is passive and can't preventDefault), and the
// Space-key tracking used for temporary pan mode.
export function usePanZoom(svgRef) {
  const [pan, setPan] = useState({ x: 120, y: 80 })
  const [scale, setScale] = useState(70) // px per meter
  const [size, setSize] = useState({ w: 800, h: 560 })
  const spaceRef = useRef(false)

  const worldToScreen = useCallback((x, y) => ({
    sx: x * scale + pan.x,
    sy: y * scale + pan.y,
  }), [pan, scale])

  const screenToWorld = useCallback((sx, sy) => ({
    x: (sx - pan.x) / scale,
    y: (sy - pan.y) / scale,
  }), [pan, scale])

  // Convert a client (page) coordinate into world meters using the svg bbox.
  const clientToWorld = useCallback((clientX, clientY) => {
    const r = svgRef.current.getBoundingClientRect()
    return screenToWorld(clientX - r.left, clientY - r.top)
  }, [screenToWorld, svgRef])

  // Track container size for responsive grid + view.
  useEffect(() => {
    const el = svgRef.current?.parentElement
    if (!el) return
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect()
      setSize({ w: r.width, h: r.height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [svgRef])

  // Hold Space to pan with left-drag (in addition to middle/right button).
  useEffect(() => {
    const down = (e) => { if (e.code === 'Space') spaceRef.current = true }
    const up = (e) => { if (e.code === 'Space') spaceRef.current = false }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [])

  // Wheel zoom toward the cursor.
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const onWheel = (e) => {
      e.preventDefault()
      const r = svg.getBoundingClientRect()
      const sx = e.clientX - r.left
      const sy = e.clientY - r.top
      const before = screenToWorld(sx, sy)
      const factor = Math.exp(-e.deltaY * 0.0015)
      const ns = Math.min(400, Math.max(8, scale * factor))
      setPan({ x: sx - before.x * ns, y: sy - before.y * ns })
      setScale(ns)
    }
    svg.addEventListener('wheel', onWheel, { passive: false })
    return () => svg.removeEventListener('wheel', onWheel)
  }, [scale, screenToWorld, svgRef])

  // Drag-to-pan plumbing for the editor's pointer handlers.
  const startPan = useCallback((e) => (
    { kind: 'pan', sx: e.clientX, sy: e.clientY, pan: { x: pan.x, y: pan.y } }
  ), [pan])
  const movePan = useCallback((d, e) => {
    setPan({ x: d.pan.x + (e.clientX - d.sx), y: d.pan.y + (e.clientY - d.sy) })
  }, [])

  return { pan, scale, size, spaceRef, worldToScreen, screenToWorld, clientToWorld, startPan, movePan }
}
