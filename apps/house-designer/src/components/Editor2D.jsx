import { useMemo, useRef, useState, useEffect } from 'react'
import { fmtLength, uid, openingsOnWall, activeFloor } from '../lib/project.js'
import { dist, snap, wallUnit } from '../lib/geometry.js'
import * as M from '../lib/mutations.js'
import * as hit from '../lib/hitTest.js'
import { makeFurniture, openingDefaults } from '../lib/furniture/registry.js'
import { usePanZoom } from '../hooks/usePanZoom.js'
import { useWallDraft } from '../hooks/useWallDraft.js'
import WallShape from './WallShape.jsx'
import GridLayer from './editor2d/GridLayer.jsx'
import FloorsBelowLayer from './editor2d/FloorsBelowLayer.jsx'
import FurnitureLayer from './editor2d/FurnitureLayer.jsx'
import WallLabels, { DimensionPill } from './editor2d/WallLabels.jsx'
import RoomFills, { RoomLabels, useRooms } from './editor2d/RoomLayer.jsx'
import SelectionHandles from './editor2d/SelectionHandles.jsx'

// Screen-space threshold (px) for snapping to existing wall endpoints.
const ENDPOINT_SNAP_PX = 12
// Screen-space hit tolerance (px) for clicking walls/furniture.
const HIT_PX = 8

// The 2D floor-plan editor. Owns tool/pointer dispatch and composes the SVG
// from layer components; pan/zoom and the wall-drafting state live in hooks,
// geometry/hit-testing/mutations in lib modules.
export default function Editor2D({
  project, commit, tool, setTool, selectedId, setSelectedId, onWallDoubleClick,
}) {
  const svgRef = useRef(null)
  const dragRef = useRef(null)
  const [hoverId, setHoverId] = useState(null)

  const { settings } = project
  const floor = activeFloor(project) || { walls: [], furniture: [], openings: [] }
  const grid = settings.gridSize ?? 0.1

  const { pan, scale, size, spaceRef, worldToScreen, screenToWorld, clientToWorld, startPan, movePan } =
    usePanZoom(svgRef)

  const wallDraft = useWallDraft({
    walls: floor.walls, grid, scale, thickness: settings.wallThickness,
    commit, snapPx: ENDPOINT_SNAP_PX,
  })

  const rooms = useRooms(floor)

  // Floors strictly below the active one — drawn faintly as a construction guide.
  const floorsBelow = useMemo(() => {
    const all = project.floors || []
    const lvl = floor.level || 0
    return all.filter((f) => (f.level || 0) < lvl - 1e-6).sort((a, b) => (b.level || 0) - (a.level || 0))
  }, [project.floors, floor.level])

  // ---- mutation shorthands ----------------------------------------------
  const patchElement = (id, patch) => commit((p) => M.patchElement(p, id, patch))

  function removeSelected() {
    if (!selectedId) return
    commit((p) => M.deleteElement(p, selectedId))
    setSelectedId(null)
  }

  // ---- keyboard -----------------------------------------------------------
  // Attached once to the stage element; reads latest state through a ref so
  // handlers never go stale.
  const keyRef = useRef(null)
  keyRef.current = (e) => {
    if (e.key === 'Escape') {
      wallDraft.finish()
      setSelectedId(null)
      setTool('select')
    } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
      e.preventDefault()
      removeSelected()
    } else if (e.key.toLowerCase() === 'r' && selectedId) {
      commit((p) => M.rotateFurniture(p, selectedId))
    } else if (e.key === 'Enter') {
      wallDraft.finish()
    } else if (e.key.startsWith('Arrow') && selectedId) {
      e.preventDefault()
      const step = grid * (e.shiftKey ? 5 : 1)
      const [dx, dy] = {
        ArrowUp: [0, -step], ArrowDown: [0, step], ArrowLeft: [-step, 0], ArrowRight: [step, 0],
      }[e.key] || [0, 0]
      commit((p) => M.nudgeElement(p, selectedId, dx, dy, grid))
    }
  }

  useEffect(() => {
    const el = svgRef.current?.parentElement
    if (!el) return
    el.tabIndex = 0
    const onKey = (e) => keyRef.current(e)
    const onShift = (e) => wallDraft.setShiftHeld(e.shiftKey)
    el.addEventListener('keydown', onKey)
    window.addEventListener('keydown', onShift)
    window.addEventListener('keyup', onShift)
    return () => {
      el.removeEventListener('keydown', onKey)
      window.removeEventListener('keydown', onShift)
      window.removeEventListener('keyup', onShift)
    }
  }, [wallDraft.setShiftHeld])

  // ---- pointer handlers ---------------------------------------------------
  function onPointerDown(e) {
    svgRef.current?.setPointerCapture?.(e.pointerId)
    const world = clientToWorld(e.clientX, e.clientY)
    const isPan = spaceRef.current || e.button === 1 || e.button === 2

    if (isPan) {
      dragRef.current = startPan(e)
      return
    }

    if (tool === 'wall') {
      wallDraft.handleWallClick(world)
      return
    }

    if (tool.startsWith('furniture:')) {
      const type = tool.split(':')[1]
      const p = wallDraft.snapPoint(world.x, world.y)
      const item = { ...makeFurniture(type, p.x, p.y), id: uid('f') }
      commit((proj) => M.addFurniture(proj, item))
      setSelectedId(item.id)
      return
    }

    if (tool.startsWith('opening:')) {
      const key = tool.split(':')[1]
      const near = hit.nearestWallForOpening(floor, world.x, world.y)
      if (!near) return // not near a wall: ignore
      const def = openingDefaults(key)
      const off = Math.max(def.width / 2, Math.min(near.L - def.width / 2, near.offset))
      const op = { id: uid('o'), type: def.type, style: def.style, wallId: near.wall.id, offset: off, width: def.width, height: def.height, sill: def.sill, hinge: def.hinge, side: def.side }
      commit((proj) => M.addOpening(proj, op))
      setSelectedId(op.id)
      return
    }

    // select tool
    const ep = hit.hitWallEndpoint(floor, world.x, world.y, (HIT_PX / scale) * 1.4)
    if (ep) {
      setSelectedId(ep.wall.id)
      // Store the fixed (other) endpoint so angle-snapping works during drag.
      const alignTo = ep.end === 1
        ? { x: ep.wall.x2, y: ep.wall.y2 }
        : { x: ep.wall.x1, y: ep.wall.y1 }
      dragRef.current = { kind: 'wall-end', wallId: ep.wall.id, end: ep.end, alignTo }
      return
    }
    const op = hit.hitOpening(floor, world.x, world.y)
    if (op) {
      setSelectedId(op.id)
      dragRef.current = { kind: 'move-opening', id: op.id }
      return
    }
    const f = hit.hitFurniture(floor, world.x, world.y)
    if (f) {
      setSelectedId(f.id)
      dragRef.current = { kind: 'move-furn', id: f.id, start: { x: world.x, y: world.y }, orig: { x: f.x, y: f.y } }
      return
    }
    const w = hit.hitWall(floor, world.x, world.y, HIT_PX / scale)
    if (w) {
      setSelectedId(w.id)
      return
    }
    setSelectedId(null)
  }

  function onPointerMove(e) {
    const world = clientToWorld(e.clientX, e.clientY)
    wallDraft.setCursor(world)
    wallDraft.setShiftHeld(e.shiftKey)
    const d = dragRef.current
    if (!d) {
      // Hover feedback (select tool only, nothing being dragged).
      if (tool === 'select') {
        const f = hit.hitFurniture(floor, world.x, world.y)
        const w = f ? null : hit.hitWall(floor, world.x, world.y, HIT_PX / scale)
        const id = f?.id || w?.id || null
        if (id !== hoverId) setHoverId(id)
      } else if (hoverId) {
        setHoverId(null)
      }
      return
    }
    if (d.kind === 'pan') {
      movePan(d, e)
      return
    }
    if (d.kind === 'move-furn') {
      const dx = world.x - d.start.x
      const dy = world.y - d.start.y
      patchElement(d.id, { x: snap(d.orig.x + dx, grid), y: snap(d.orig.y + dy, grid) })
      return
    }
    if (d.kind === 'wall-end') {
      const p = wallDraft.snapPoint(world.x, world.y, d.wallId, d.alignTo)
      patchElement(d.wallId, d.end === 1 ? { x1: p.x, y1: p.y } : { x2: p.x, y2: p.y })
      return
    }
    if (d.kind === 'move-opening') {
      const o = (floor.openings || []).find((x) => x.id === d.id)
      if (!o) return
      const near = hit.nearestWallForOpening(floor, world.x, world.y)
      if (!near) return // keep the opening where it is until near a wall again
      const off = Math.max(o.width / 2, Math.min(near.L - o.width / 2, snap(near.offset, grid)))
      patchElement(d.id, { wallId: near.wall.id, offset: off })
      return
    }
    if (d.kind === 'rotate-furn') {
      const f = floor.furniture.find((x) => x.id === d.id)
      if (!f) return
      const ang = Math.atan2(world.y - f.y, world.x - f.x) + Math.PI / 2
      patchElement(d.id, { rotation: snap(ang, Math.PI / 12) })
      return
    }
    if (d.kind === 'resize-furn') {
      const f = floor.furniture.find((x) => x.id === d.id)
      if (!f) return
      const c = Math.cos(-f.rotation), s = Math.sin(-f.rotation)
      if (e.shiftKey || !d.anchor) {
        // Shift: symmetric resize around the center.
        const lx = (world.x - f.x) * c - (world.y - f.y) * s
        const ly = (world.x - f.x) * s + (world.y - f.y) * c
        patchElement(d.id, {
          width: Math.max(0.1, snap(lx * 2, grid)),
          depth: Math.max(0.1, snap(ly * 2, grid)),
        })
        return
      }
      // Default: the top-left corner (captured at drag start) stays fixed and
      // the center follows the new extent.
      const lx = (world.x - d.anchor.x) * c - (world.y - d.anchor.y) * s
      const ly = (world.x - d.anchor.x) * s + (world.y - d.anchor.y) * c
      const width = Math.max(0.1, snap(lx, grid))
      const depth = Math.max(0.1, snap(ly, grid))
      const cos = Math.cos(f.rotation), sin = Math.sin(f.rotation)
      patchElement(d.id, {
        width, depth,
        x: d.anchor.x + (width / 2) * cos - (depth / 2) * sin,
        y: d.anchor.y + (width / 2) * sin + (depth / 2) * cos,
      })
    }
  }

  function onPointerUp(e) {
    dragRef.current = null
    svgRef.current?.releasePointerCapture?.(e.pointerId)
  }

  // Double-click a wall to select it and focus the length field in the sidebar.
  function onDoubleClick(e) {
    const world = clientToWorld(e.clientX, e.clientY)
    const w = hit.hitWall(floor, world.x, world.y, HIT_PX / scale)
    if (w) {
      setSelectedId(w.id)
      onWallDoubleClick?.(w.id)
    }
  }

  // Suppress context menu so middle/right-button panning works cleanly.
  const onContextMenu = (e) => e.preventDefault()

  // ---- drag-and-drop from FurniturePanel ----------------------------------
  function onDragOver(e) {
    if (e.dataTransfer.types.includes('application/house-designer')) {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'copy'
    }
  }

  function onDrop(e) {
    const raw = e.dataTransfer.getData('application/house-designer')
    if (!raw) return
    e.preventDefault()
    const data = JSON.parse(raw)
    const world = clientToWorld(e.clientX, e.clientY)
    if (data.kind === 'furniture') {
      const p = wallDraft.snapPoint(world.x, world.y)
      const item = { ...makeFurniture(data.type, p.x, p.y), id: uid('f') }
      commit((proj) => M.addFurniture(proj, item))
      setSelectedId(item.id)
      setTool('select')
    } else if (data.kind === 'opening') {
      const near = hit.nearestWallForOpening(floor, world.x, world.y)
      if (!near) return
      const def = openingDefaults(data.key)
      const off = Math.max(def.width / 2, Math.min(near.L - def.width / 2, near.offset))
      const op = { id: uid('o'), type: def.type, style: def.style, wallId: near.wall.id, offset: off, width: def.width, height: def.height, sill: def.sill, hinge: def.hinge, side: def.side }
      commit((proj) => M.addOpening(proj, op))
      setSelectedId(op.id)
      setTool('select')
    }
  }

  // ---- derived render data ------------------------------------------------
  const selectedFurniture = floor.furniture.find((f) => f.id === selectedId) || null

  // Wall junctions: weld the corner notches left by butt line caps with a
  // rounded cap (circle radius = half the joined walls' max thickness).
  const junctions = useMemo(() => {
    const map = new Map()
    for (const w of floor.walls) {
      const { L } = wallUnit(w)
      if (L < 1e-4) continue
      for (const pt of [{ x: w.x1, y: w.y1 }, { x: w.x2, y: w.y2 }]) {
        const key = `${Math.round(pt.x * 100)}:${Math.round(pt.y * 100)}`
        const j = map.get(key) || { x: pt.x, y: pt.y, count: 0, thickness: 0, selected: false }
        j.count++
        j.thickness = Math.max(j.thickness, w.thickness)
        j.selected = j.selected || w.id === selectedId
        map.set(key, j)
      }
    }
    return [...map.values()].filter((j) => j.count >= 2)
  }, [floor.walls, selectedId])

  // Live dimension pill for the current drag (opening / resize).
  const dragDims = (() => {
    const d = dragRef.current
    if (!d) return null
    if (d.kind === 'move-opening') {
      const o = (floor.openings || []).find((x) => x.id === d.id)
      const w = o && floor.walls.find((x) => x.id === o.wallId)
      if (!o || !w) return null
      const { L, ux, uy } = wallUnit(w)
      const a = Math.max(0, o.offset - o.width / 2)
      const b = Math.min(L, o.offset + o.width / 2)
      const at = (t) => worldToScreen(w.x1 + t * ux, w.y1 + t * uy)
      const angle = (Math.atan2(uy, ux) * 180) / Math.PI
      const pills = []
      if (a > 0.05) pills.push({ ...at(a / 2), text: fmtLength(a), angle })
      if (L - b > 0.05) pills.push({ ...at((b + L) / 2), text: fmtLength(L - b), angle })
      return pills
    }
    if (d.kind === 'resize-furn') {
      const f = floor.furniture.find((x) => x.id === d.id)
      if (!f) return null
      const p = worldToScreen(f.x, f.y)
      return [{ sx: p.sx, sy: p.sy - 24, text: `${f.width.toFixed(2)} × ${f.depth.toFixed(2)} m`, angle: 0 }]
    }
    return null
  })()

  const transform = `translate(${pan.x} ${pan.y}) scale(${scale})`
  const { draft, preview } = wallDraft

  return (
    <div className="editor2d">
      <svg
        ref={svgRef}
        width={size.w}
        height={size.h}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onContextMenu={onContextMenu}
        onDoubleClick={onDoubleClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
        style={{ display: 'block', cursor: cursorStyle(tool, dragRef.current, spaceRef.current) }}
      >
        <rect x={0} y={0} width={size.w} height={size.h} fill="#f7f6f3" />
        <g transform={transform}>
          <GridLayer size={size} scale={scale} grid={grid} screenToWorld={screenToWorld} />
          <RoomFills rooms={rooms} />
          <FloorsBelowLayer floors={floorsBelow} />

          {/* walls + junction welds */}
          {floor.walls.map((w) => (
            <WallShape key={w.id} w={w} openings={openingsOnWall(floor, w.id)}
              selectedId={selectedId} hoverId={hoverId} scale={scale} />
          ))}
          {junctions.map((j, i) => (
            <circle key={`jx${i}`} cx={j.x} cy={j.y} r={j.thickness / 2} fill={j.selected ? '#ff8c1a' : '#3a3530'} />
          ))}

          <FurnitureLayer furniture={floor.furniture} selectedId={selectedId} hoverId={hoverId} scale={scale} />

          {/* draft chain + preview */}
          {draft.map((p, i) => i > 0 && (
            <line key={i} x1={draft[i - 1].x} y1={draft[i - 1].y} x2={p.x} y2={p.y}
              stroke="#ff8c1a" strokeWidth={0.04} strokeDasharray={`${0.08 / scale} ${0.06 / scale}`} opacity={0.5} />
          ))}
          {draft.map((p, i) => (
            <circle key={`dp${i}`} cx={p.x} cy={p.y} r={5 / scale} fill="#ff8c1a" />
          ))}
          {preview && (
            <line x1={preview.from.x} y1={preview.from.y}
              x2={preview.to.x} y2={preview.to.y}
              stroke="#ff8c1a" strokeWidth={0.04} strokeDasharray={`${0.1 / scale} ${0.05 / scale}`} opacity={0.7} />
          )}
        </g>

        <RoomLabels rooms={rooms} worldToScreen={worldToScreen} />
        <WallLabels walls={floor.walls} worldToScreen={worldToScreen} scale={scale} />

        {/* live dimension for the in-progress wall segment */}
        {preview && (() => {
          const L = dist(preview.from.x, preview.from.y, preview.to.x, preview.to.y)
          if (L < 0.05) return null
          const mid = worldToScreen((preview.from.x + preview.to.x) / 2, (preview.from.y + preview.to.y) / 2)
          const angle = (Math.atan2(preview.to.y - preview.from.y, preview.to.x - preview.from.x) * 180) / Math.PI
          return <DimensionPill sx={mid.sx} sy={mid.sy - 16} text={fmtLength(L)} angleDeg={angle} accent />
        })()}

        {/* live dimensions for opening / resize drags */}
        {dragDims && dragDims.map((p, i) => (
          <DimensionPill key={`dd${i}`} sx={p.sx} sy={p.sy} text={p.text} angleDeg={p.angle} accent />
        ))}

        {selectedFurniture && (
          <SelectionHandles
            f={selectedFurniture}
            worldToScreen={worldToScreen}
            onRotateStart={() => { dragRef.current = { kind: 'rotate-furn', id: selectedFurniture.id } }}
            onResizeStart={() => {
              const f = selectedFurniture
              const cos = Math.cos(f.rotation), sin = Math.sin(f.rotation)
              // World position of the top-left (local -w/2,-d/2) corner — the
              // fixed point for the default resize.
              dragRef.current = {
                kind: 'resize-furn', id: f.id,
                anchor: {
                  x: f.x + (-f.width / 2) * cos - (-f.depth / 2) * sin,
                  y: f.y + (-f.width / 2) * sin + (-f.depth / 2) * cos,
                },
              }
            }}
          />
        )}

        {/* zoom indicator */}
        <g transform={`translate(${size.w - 110} ${size.h - 26})`} style={{ pointerEvents: 'none' }}>
          <rect x={-4} y={-14} width={108} height={20} rx={4} fill="rgba(255,255,255,0.85)" stroke="#d8d2c6" />
          <text x={0} y={0} fontSize={11} fill="#5a5247">
            {scale.toFixed(0)} px/m · grid {grid.toFixed(2)} m
          </text>
        </g>
      </svg>
    </div>
  )
}

function cursorStyle(tool, drag, space) {
  if (drag?.kind === 'pan' || space) return 'grab'
  if (drag) return 'move'
  if (tool === 'wall') return 'crosshair'
  if (tool.startsWith('furniture:')) return 'copy'
  return 'default'
}
