import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { dist, snap, fmtWallLabel, mToUnit, uid, openingsOnWall, activeFloor } from '../lib/project.js'
import { makeFurniture, openingDefaults } from '../lib/furniture.js'
import { FurnitureGraphic } from './FurnitureGraphic.jsx'
import WallShape from './WallShape.jsx'

// Screen-space threshold (px) for snapping to existing wall endpoints.
const ENDPOINT_SNAP_PX = 12
// Screen-space hit tolerance (px) for clicking walls/furniture.
const HIT_PX = 8

// Build the SVG point transform helpers from pan + scale.
function useMapping(pan, scale, svgRef) {
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
  }, [screenToWorld])
  return { worldToScreen, screenToWorld, clientToWorld }
}

export default function Editor2D({
  project, setProject, tool, setTool, selectedId, setSelectedId, onWallDoubleClick,
}) {
  const svgRef = useRef(null)
  const [pan, setPan] = useState({ x: 120, y: 80 })
  const [scale, setScale] = useState(70) // px per meter
  const [draft, setDraft] = useState([]) // wall chain: [{x,y}] in meters
  const [cursor, setCursor] = useState(null) // world meters, for preview
  const [size, setSize] = useState({ w: 800, h: 560 })
  const dragRef = useRef(null)
  const spaceRef = useRef(false)

  const { settings } = project
  const floor = activeFloor(project) || { walls: [], furniture: [], openings: [] }
  const grid = settings.gridSize
  const units = settings.units

  // Floors strictly below the active one — drawn faintly as a construction guide.
  const floorsBelow = useMemo(() => {
    const all = project.floors || []
    const lvl = floor.level || 0
    return all.filter((f) => (f.level || 0) < lvl - 1e-6).sort((a, b) => (b.level || 0) - (a.level || 0))
  }, [project.floors, floor.level])

  const { worldToScreen, clientToWorld, screenToWorld } = useMapping(pan, scale, svgRef)

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
  }, [])

  // Keyboard: Delete removes selection, Escape cancels draft/selection +
  // returns to Select tool, R rotates selected furniture 90deg,
  // Arrow keys nudge the selected element (furniture/wall-end/opening).
  const ARROW_STEP = grid // one grid cell per press; Shift = ×5

  function nudgeSelected(stepX, stepY) {
    if (!selectedId) return
    patchProject((fl) => {
      const f = fl.furniture.find((x) => x.id === selectedId)
      if (f) { f.x = snap(f.x + stepX, grid); f.y = snap(f.y + stepY, grid); return }
      const w = fl.walls.find((x) => x.id === selectedId)
      if (w) {
        w.x1 = snap(w.x1 + stepX, grid); w.y1 = snap(w.y1 + stepY, grid)
        w.x2 = snap(w.x2 + stepX, grid); w.y2 = snap(w.y2 + stepY, grid)
        return
      }
      const o = (fl.openings || []).find((x) => x.id === selectedId)
      if (o) {
        const wall = fl.walls.find((x) => x.id === o.wallId)
        if (wall) {
          const L = dist(wall.x1, wall.y1, wall.x2, wall.y2)
          o.offset = Math.max(0, Math.min(L, snap(o.offset + stepX, grid)))
        }
      }
    })
  }

  const onKey = useCallback((e) => {
    if (e.key === 'Escape') {
      setDraft([])
      setSelectedId(null)
      setTool('select')
    } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
      e.preventDefault()
      removeSelected()
    } else if (e.key.toLowerCase() === 'r' && selectedId) {
      rotateSelected()
    } else if (e.key === 'Enter') {
      // Finish wall chain.
      setDraft([])
    } else if (e.key.startsWith('Arrow') && selectedId) {
      e.preventDefault()
      const big = e.shiftKey ? 5 : 1
      if (e.key === 'ArrowUp') nudgeSelected(0, -grid * big)
      else if (e.key === 'ArrowDown') nudgeSelected(0, grid * big)
      else if (e.key === 'ArrowLeft') nudgeSelected(-grid * big, 0)
      else if (e.key === 'ArrowRight') nudgeSelected(grid * big, 0)
    }
  }, [selectedId, grid, setTool])

  useEffect(() => {
    const el = svgRef.current?.parentElement
    if (!el) return
    el.tabIndex = 0
    el.addEventListener('keydown', onKey)
    return () => el.removeEventListener('keydown', onKey)
  }, [onKey])

  // Hold Space to pan with left-drag (in addition to middle/right button).
  useEffect(() => {
    const down = (e) => { if (e.code === 'Space') spaceRef.current = true }
    const up = (e) => { if (e.code === 'Space') spaceRef.current = false }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [])

  // ---- mutations --------------------------------------------------------
  // fn receives the ACTIVE FLOOR of the cloned project and mutates its arrays.
  function patchProject(fn) {
    setProject((p) => {
      const next = structuredClone(p)
      const fl = activeFloor(next)
      if (fl) fn(fl)
      return next
    })
  }

  function removeSelected() {
    if (!selectedId) return
    patchProject((fl) => {
      const wallGone = fl.walls.some((w) => w.id === selectedId)
      fl.openings = (fl.openings || []).filter((o) => o.id !== selectedId && (!wallGone || o.wallId !== selectedId))
      fl.walls = fl.walls.filter((w) => w.id !== selectedId)
      fl.furniture = fl.furniture.filter((f) => f.id !== selectedId)
    })
    setSelectedId(null)
  }

  function rotateSelected() {
    if (!selectedId) return
    patchProject((fl) => {
      const it = fl.furniture.find((x) => x.id === selectedId)
      if (it) it.rotation = (it.rotation + Math.PI / 2) % (Math.PI * 2)
    })
  }

  function updateFurniture(id, patch) {
    patchProject((fl) => {
      const it = fl.furniture.find((x) => x.id === id)
      if (it) Object.assign(it, patch)
    })
  }

  function updateWall(id, patch) {
    patchProject((fl) => {
      const w = fl.walls.find((x) => x.id === id)
      if (w) Object.assign(w, patch)
    })
  }

  // ---- alignment helpers ----------------------------------------------
  // Snap a candidate endpoint so walls are easy to draw at 0/90/180/270°.
  // If the angle from `from` to (x,y) is within ~12° of an axis direction,
  // project the point onto that axis (keeping the larger delta so the wall
  // still follows the cursor on the dominant axis).
  const angleSnapTo = (x, y, from) => {
    const dx = x - from.x, dy = y - from.y
    const len = Math.hypot(dx, dy)
    if (len < 1e-6) return { x, y }
    const ang = Math.atan2(dy, dx) // radians
    const deg = (ang * 180) / Math.PI
    // Distance to nearest multiple of 90°, in degrees.
    const nearest = Math.round(deg / 90) * 90
    const delta = Math.abs(deg - nearest)
    if (delta < 12) {
      const rad = (nearest * Math.PI) / 180
      // Keep the wall the same length as the cursor intended.
      return { x: from.x + len * Math.cos(rad), y: from.y + len * Math.sin(rad) }
    }
    return { x, y }
  }

  // Snap a world point to grid + nearby wall endpoints, optionally angle-aligned
  // to a reference point (for wall drawing).
  const snapPoint = useCallback((x, y, ignoreId = null, alignTo = null) => {
    const gx = snap(x, grid)
    const gy = snap(y, grid)
    let best = { x: gx, y: gy }
    let bestD = (ENDPOINT_SNAP_PX / scale) // threshold in meters
    for (const w of floor.walls) {
      if (w.id === ignoreId) continue
      for (const pt of [{ x: w.x1, y: w.y1 }, { x: w.x2, y: w.y2 }]) {
        const d = dist(pt.x, pt.y, x, y)
        if (d < bestD) { bestD = d; best = { x: pt.x, y: pt.y } }
      }
    }
    // Only angle-snap when no endpoint snap won (so corners still connect).
    if (alignTo && bestD >= (ENDPOINT_SNAP_PX / scale)) {
      best = angleSnapTo(best.x, best.y, alignTo)
    }
    return best
  }, [floor.walls, grid, scale])

  // ---- hit testing ------------------------------------------------------
  function hitFurniture(wx, wy) {
    // Topmost (last drawn) first.
    for (let i = floor.furniture.length - 1; i >= 0; i--) {
      const f = floor.furniture[i]
      if (pointInFurniture(wx, wy, f)) return f
    }
    return null
  }

  function pointInFurniture(wx, wy, f) {
    // Transform point into furniture local frame.
    const c = Math.cos(-f.rotation)
    const s = Math.sin(-f.rotation)
    const dx = wx - f.x
    const dy = wy - f.y
    const lx = dx * c - dy * s
    const ly = dx * s + dy * c
    return Math.abs(lx) <= f.width / 2 && Math.abs(ly) <= f.depth / 2
  }

  function hitWall(wx, wy) {
    const tol = HIT_PX / scale
    let best = null
    let bestD = tol
    for (const w of floor.walls) {
      const d = pointSegDist(wx, wy, w.x1, w.y1, w.x2, w.y2)
      if (d < bestD) { bestD = d; best = w }
    }
    return best
  }

  function hitWallEndpoint(wx, wy) {
    const tol = HIT_PX / scale * 1.4
    for (const w of floor.walls) {
      if (dist(wx, wy, w.x1, w.y1) < tol) return { wall: w, end: 1 }
      if (dist(wx, wy, w.x2, w.y2) < tol) return { wall: w, end: 2 }
    }
    return null
  }

  // Nearest wall to a point, with the projected offset along it (for placing
  // openings). Returns { wall, offset, L } within ~0.6 m of the wall line.
  function nearestWallForOpening(wx, wy) {
    let best = null
    for (const w of floor.walls) {
      const L = dist(w.x1, w.y1, w.x2, w.y2)
      if (L < 1e-4) continue
      const ux = (w.x2 - w.x1) / L, uy = (w.y2 - w.y1) / L
      const perp = Math.abs((wx - w.x1) * -uy + (wy - w.y1) * ux)
      if (perp > 0.6) continue
      const t = Math.max(0, Math.min(L, (wx - w.x1) * ux + (wy - w.y1) * uy))
      if (!best || perp < best.perp) best = { wall: w, offset: t, L, perp }
    }
    return best
  }

  // Select an opening by clicking near its center on its wall.
  function hitOpening(wx, wy) {
    let best = null, bestD = Infinity
    for (const w of floor.walls) {
      const L = dist(w.x1, w.y1, w.x2, w.y2)
      if (L < 1e-4) continue
      const ux = (w.x2 - w.x1) / L, uy = (w.y2 - w.y1) / L
      for (const o of openingsOnWall(floor, w.id)) {
        const cx = w.x1 + o.offset * ux, cy = w.y1 + o.offset * uy
        const d = dist(wx, wy, cx, cy)
        const tol = Math.max(0.3, o.width / 2 + 0.05)
        if (d < tol && d < bestD) { bestD = d; best = o }
      }
    }
    return best
  }

  // ---- pointer handlers -------------------------------------------------
  function onPointerDown(e) {
    svgRef.current?.setPointerCapture?.(e.pointerId)
    const world = clientToWorld(e.clientX, e.clientY)
    const isPan = spaceRef.current || e.button === 1 || e.button === 2

    if (isPan) {
      dragRef.current = { kind: 'pan', sx: e.clientX, sy: e.clientY, pan: { ...pan } }
      return
    }

    if (tool === 'wall') {
      const prev = draft[draft.length - 1]
      const p = snapPoint(world.x, world.y, null, prev || null)
      // Closing the chain: click near the first point loops back and resets.
      // NOTE: commit the wall and update the draft as separate setState calls —
      // nesting setProject inside setDraft's updater triggers "setState during
      // render" and crashes the tree.
      if (draft.length >= 2 && dist(draft[0].x, draft[0].y, p.x, p.y) < (ENDPOINT_SNAP_PX / scale)) {
        commitChainWall(draft[draft.length - 1], draft[0])
        setDraft([])
        return
      }
      if (prev) commitChainWall(prev, p)
      setDraft([...draft, p])
      return
    }

    if (tool.startsWith('furniture:')) {
      const type = tool.split(':')[1]
      const p = snapPoint(world.x, world.y)
      const item = makeFurniture(type, p.x, p.y)
      item.id = uid('f')
      patchProject((fl) => { fl.furniture.push(item) })
      setSelectedId(item.id)
      return
    }

    if (tool.startsWith('opening:')) {
      const type = tool.split(':')[1]
      const near = nearestWallForOpening(world.x, world.y)
      if (!near) return // not near a wall: ignore
      const def = openingDefaults(type)
      const off = Math.max(def.width / 2, Math.min(near.L - def.width / 2, near.offset))
      const op = { id: uid('o'), type, wallId: near.wall.id, offset: off, width: def.width, height: def.height, sill: def.sill, hinge: def.hinge, side: def.side }
      patchProject((fl) => { fl.openings.push(op) })
      setSelectedId(op.id)
      return
    }

    // select tool
    const ep = hitWallEndpoint(world.x, world.y)
    if (ep) {
      setSelectedId(ep.wall.id)
      dragRef.current = { kind: 'wall-end', wallId: ep.wall.id, end: ep.end }
      return
    }
    const op = hitOpening(world.x, world.y)
    if (op) {
      setSelectedId(op.id)
      return
    }
    const f = hitFurniture(world.x, world.y)
    if (f) {
      setSelectedId(f.id)
      dragRef.current = { kind: 'move-furn', id: f.id, start: { x: world.x, y: world.y }, orig: { x: f.x, y: f.y } }
      return
    }
    const w = hitWall(world.x, world.y)
    if (w) {
      setSelectedId(w.id)
      return
    }
    setSelectedId(null)
  }

  function commitChainWall(a, b) {
    if (dist(a.x, a.y, b.x, b.y) < 1e-3) return
    patchProject((fl) => {
      fl.walls.push({ id: uid('w'), x1: a.x, y1: a.y, x2: b.x, y2: b.y, thickness: settings.wallThickness })
    })
  }

  function onPointerMove(e) {
    const world = clientToWorld(e.clientX, e.clientY)
    setCursor(world)
    const d = dragRef.current
    if (!d) return
    if (d.kind === 'pan') {
      setPan({ x: d.pan.x + (e.clientX - d.sx), y: d.pan.y + (e.clientY - d.sy) })
      return
    }
    if (d.kind === 'move-furn') {
      const dx = world.x - d.start.x
      const dy = world.y - d.start.y
      updateFurniture(d.id, { x: snap(d.orig.x + dx, grid), y: snap(d.orig.y + dy, grid) })
      return
    }
    if (d.kind === 'wall-end') {
      const p = snapPoint(world.x, world.y, d.wallId)
      updateWall(d.wallId, d.end === 1 ? { x1: p.x, y1: p.y } : { x2: p.x, y2: p.y })
      return
    }
    if (d.kind === 'rotate-furn') {
      const f = floor.furniture.find((x) => x.id === d.id)
      if (!f) return
      const ang = Math.atan2(world.y - f.y, world.x - f.x) + Math.PI / 2
      updateFurniture(d.id, { rotation: snap(ang, Math.PI / 12) })
      return
    }
    if (d.kind === 'resize-furn') {
      const f = floor.furniture.find((x) => x.id === d.id)
      if (!f) return
      const c = Math.cos(-f.rotation), s = Math.sin(-f.rotation)
      const lx = (world.x - f.x) * c - (world.y - f.y) * s
      const ly = (world.x - f.x) * s + (world.y - f.y) * c
      updateFurniture(d.id, {
        width: Math.max(0.1, snap(lx * 2, grid)),
        depth: Math.max(0.1, snap(ly * 2, grid)),
      })
    }
  }

  function onPointerUp(e) {
    dragRef.current = null
    svgRef.current?.releasePointerCapture?.(e.pointerId)
  }

  function onWheel(e) {
    // Zoom centered on cursor: keep world point under pointer fixed.
    e.preventDefault()
    const r = svgRef.current.getBoundingClientRect()
    const sx = e.clientX - r.left
    const sy = e.clientY - r.top
    const before = screenToWorld(sx, sy)
    const factor = Math.exp(-e.deltaY * 0.0015)
    const ns = Math.min(400, Math.max(8, scale * factor))
    setPan({ x: sx - before.x * ns, y: sy - before.y * ns })
    setScale(ns)
  }

  // Double-click a wall to select it and focus the length field in the sidebar.
  function onDoubleClick(e) {
    const world = clientToWorld(e.clientX, e.clientY)
    const w = hitWall(world.x, world.y)
    if (w) {
      setSelectedId(w.id)
      onWallDoubleClick?.(w.id)
    }
  }

  // Suppress context menu so middle/right-button panning works cleanly.
  const onContextMenu = (e) => e.preventDefault()

  // ---- derived render data ---------------------------------------------
  const selectedFurniture = floor.furniture.find((f) => f.id === selectedId) || null

  // Grid lines for the visible world window.
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
  }, [size, pan, scale, grid, screenToWorld])

  // Draft preview point (snapped) for the in-progress wall.
  const draftPreview = useMemo(() => {
    if (!draft.length || !cursor) return null
    const last = draft[draft.length - 1]
    const p = snapPoint(cursor.x, cursor.y, null, last)
    return { from: last, to: p }
  }, [draft, cursor, snapPoint])

  const transform = `translate(${pan.x} ${pan.y}) scale(${scale})`

  return (
    <div className="editor2d">
      <svg
        ref={svgRef}
        width={size.w}
        height={size.h}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onWheel={onWheel}
        onContextMenu={onContextMenu}
        onDoubleClick={onDoubleClick}
        style={{ display: 'block', cursor: cursorStyle(tool, dragRef.current, spaceRef.current) }}
      >
        <rect x={0} y={0} width={size.w} height={size.h} fill="#f7f6f3" />
        <g transform={transform}>
          {/* grid */}
          <g className="grid-minor">
            {gridLines.minor.map((l, i) =>
              'y0' in l
                ? <line key={`mv${i}`} x1={l.x} y1={l.y0} x2={l.x} y2={l.y1} stroke="#e3e0d9" strokeWidth={1 / scale} vectorEffect="non-scaling-stroke" />
                : <line key={`mh${i}`} x1={l.x0} y1={l.y} x2={l.x1} y2={l.y} stroke="#e3e0d9" strokeWidth={1 / scale} vectorEffect="non-scaling-stroke" />
            )}
          </g>
          <g className="grid-major">
            {gridLines.major.map((l, i) =>
              'y0' in l
                ? <line key={`Mv${i}`} x1={l.x} y1={l.y0} x2={l.x} y2={l.y1} stroke="#cfcabf" strokeWidth={1 / scale} vectorEffect="non-scaling-stroke" />
                : <line key={`Mh${i}`} x1={l.x0} y1={l.y} x2={l.x1} y2={l.y} stroke="#cfcabf" strokeWidth={1 / scale} vectorEffect="non-scaling-stroke" />
            )}
          </g>

          {/* floors below — faint construction guide */}
          {floorsBelow.map((bf) => (
            <g key={`bf-${bf.id}`} opacity={0.22} pointerEvents="none" style={{ pointerEvents: 'none' }}>
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
          ))}

          {/* walls */}
          {floor.walls.map((w) => (
            <WallShape key={w.id} w={w} openings={openingsOnWall(floor, w.id)} selectedId={selectedId} scale={scale} />
          ))}

          {/* furniture */}
          {floor.furniture.map((f) => {
            const sel = f.id === selectedId
            return (
              <g key={f.id} transform={`translate(${f.x} ${f.y}) rotate(${(f.rotation * 180) / Math.PI})`}>
                <FurnitureGraphic type={f.type} width={f.width} depth={f.depth} color={f.color} />
                {sel && (
                  <rect x={-f.width / 2} y={-f.depth / 2} width={f.width} height={f.depth}
                    rx={Math.min(f.width, f.depth) * 0.08} fill="none" stroke="#ff8c1a"
                    strokeWidth={2.5 / scale} />
                )}
              </g>
            )
          })}

          {/* draft chain + preview */}
          {draft.map((p, i) => i > 0 && (
            <line key={i} x1={draft[i - 1].x} y1={draft[i - 1].y} x2={p.x} y2={p.y}
              stroke="#ff8c1a" strokeWidth={0.04} strokeDasharray={`${0.08 / scale} ${0.06 / scale}`} opacity={0.5} />
          ))}
          {draft.map((p, i) => (
            <circle key={`dp${i}`} cx={p.x} cy={p.y} r={5 / scale} fill="#ff8c1a" />
          ))}
          {draftPreview && (
            <line x1={draftPreview.from.x} y1={draftPreview.from.y}
              x2={draftPreview.to.x} y2={draftPreview.to.y}
              stroke="#ff8c1a" strokeWidth={0.04} strokeDasharray={`${0.1 / scale} ${0.05 / scale}`} opacity={0.7} />
          )}
        </g>

        {/* wall length labels — drawn in screen space for crisp text */}
        <g>
          {floor.walls.map((w) => {
            const mid = worldToScreen((w.x1 + w.x2) / 2, (w.y1 + w.y2) / 2)
            const lbl = fmtWallLabel(w, units)
            return (
              <g key={`wl${w.id}`} transform={`translate(${mid.sx} ${mid.sy})`} style={{ pointerEvents: 'none' }}>
                <rect x={-26} y={-9} width={52} height={18} rx={4} fill="#fffdf8" stroke="#d8d2c6" strokeWidth={1} opacity={0.92} />
                <text x={0} y={1} textAnchor="middle" dominantBaseline="middle" fontSize={11} fill="#5a5247">{lbl}</text>
              </g>
            )
          })}
        </g>

        {/* selection handles for furniture, in screen space */}
        {selectedFurniture && (
          <SelectionHandles
            f={selectedFurniture}
            pan={pan} scale={scale}
            onRotateStart={() => { dragRef.current = { kind: 'rotate-furn', id: selectedFurniture.id } }}
            onResizeStart={() => { dragRef.current = { kind: 'resize-furn', id: selectedFurniture.id } }}
            worldToScreen={worldToScreen}
          />
        )}

        {/* zoom indicator */}
        <g transform={`translate(${size.w - 110} ${size.h - 26})`} style={{ pointerEvents: 'none' }}>
          <rect x={-4} y={-14} width={108} height={20} rx={4} fill="rgba(255,255,255,0.85)" stroke="#d8d2c6" />
          <text x={0} y={0} fontSize={11} fill="#5a5247">
            {scale.toFixed(0)} px/m · grid {mToUnit(grid, units).toFixed(2)} {units}
          </text>
        </g>
      </svg>
    </div>
  )
}

// Selection handles (rotate + resize) rendered in screen space so they stay
// a constant pixel size regardless of zoom.
function SelectionHandles({ f, worldToScreen, onRotateStart, onResizeStart }) {
  const cos = Math.cos(f.rotation), sin = Math.sin(f.rotation)
  // local (lx, ly) -> screen, rotating around the furniture center.
  const toScreen = (lx, ly) => worldToScreen(f.x + lx * cos - ly * sin, f.y + lx * sin + ly * cos)
  const corners = [
    toScreen(-f.width / 2, -f.depth / 2),
    toScreen(f.width / 2, -f.depth / 2),
    toScreen(-f.width / 2, f.depth / 2),
    toScreen(f.width / 2, f.depth / 2),
  ]
  const pts = corners.map((p) => p.sx + ',' + p.sy).join(' ')
  const rh = toScreen(0, -f.depth / 2 - 0.35)
  const rhAnchor = toScreen(0, -f.depth / 2)
  const br = corners[3]
  return (
    <g>
      {/* bounding outline */}
      <polygon points={pts} fill="none" stroke="#ff8c1a" strokeWidth={1.5} strokeDasharray="4 3" />
      {/* rotate handle */}
      <line x1={rhAnchor.sx} y1={rhAnchor.sy} x2={rh.sx} y2={rh.sy} stroke="#ff8c1a" strokeWidth={1.5} />
      <circle cx={rh.sx} cy={rh.sy} r={6} fill="#fff" stroke="#ff8c1a" strokeWidth={2}
        style={{ cursor: 'grab' }} onPointerDown={(e) => { e.stopPropagation(); onRotateStart() }} />
      {/* resize handle: bottom-right corner */}
      <circle cx={br.sx} cy={br.sy} r={6} fill="#ff8c1a" stroke="#fff" strokeWidth={2}
        style={{ cursor: 'nwse-resize' }} onPointerDown={(e) => { e.stopPropagation(); onResizeStart() }} />
    </g>
  )
}

function cursorStyle(tool, drag, space) {
  if (drag?.kind === 'pan' || space) return 'grab'
  if (drag) return 'move'
  if (tool === 'wall') return 'crosshair'
  if (tool.startsWith('furniture:')) return 'copy'
  return 'default'
}

// Distance from point (px,py) to segment (x1,y1)-(x2,y2).
function pointSegDist(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1
  const len2 = dx * dx + dy * dy
  if (len2 < 1e-9) return dist(px, py, x1, y1)
  let t = ((px - x1) * dx + (py - y1) * dy) / len2
  t = Math.max(0, Math.min(1, t))
  return dist(px, py, x1 + t * dx, y1 + t * dy)
}