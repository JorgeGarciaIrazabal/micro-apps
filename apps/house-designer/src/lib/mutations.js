// All project mutations live here as pure functions (project, ...) -> new
// project. Each clones the input once, so callers never mutate React state in
// place. Use them through the history hook: commit((p) => M.something(p, ...)).

import { uid, activeFloor, makeFloor } from './project.js'
import { dist, snap } from './geometry.js'

// Clone the project and run `fn(activeFloor, project)` on the clone.
export function updateActiveFloor(p, fn) {
  const next = structuredClone(p)
  const fl = activeFloor(next)
  if (fl) fn(fl, next)
  return next
}

function findElement(fl, id) {
  return (
    fl.furniture.find((f) => f.id === id) ||
    fl.walls.find((w) => w.id === id) ||
    (fl.openings || []).find((o) => o.id === id) ||
    null
  )
}

// Patch whichever element (furniture / wall / opening) has this id.
export function patchElement(p, id, patch) {
  return updateActiveFloor(p, (fl) => {
    const el = findElement(fl, id)
    if (el) Object.assign(el, patch)
  })
}

// Delete an element; deleting a wall also removes its openings.
export function deleteElement(p, id) {
  return updateActiveFloor(p, (fl) => {
    const wallGone = fl.walls.some((w) => w.id === id)
    fl.openings = (fl.openings || []).filter((o) => o.id !== id && (!wallGone || o.wallId !== id))
    fl.walls = fl.walls.filter((w) => w.id !== id)
    fl.furniture = fl.furniture.filter((f) => f.id !== id)
  })
}

export function addWall(p, a, b, thickness) {
  if (dist(a.x, a.y, b.x, b.y) < 1e-3) return p
  return updateActiveFloor(p, (fl) => {
    fl.walls.push({ id: uid('w'), x1: a.x, y1: a.y, x2: b.x, y2: b.y, thickness })
  })
}

// item / opening must already carry a unique id (callers build them via
// makeFurniture/openingDefaults + uid so they can select the new element).
export function addFurniture(p, item) {
  return updateActiveFloor(p, (fl) => { fl.furniture.push(item) })
}

export function addOpening(p, opening) {
  return updateActiveFloor(p, (fl) => { fl.openings.push(opening) })
}

// Duplicate an element with the given (pre-generated) id, offset slightly so
// the copy is visible. Duplicating a wall also copies its openings.
export function duplicateElement(p, id, newId, offset = 0.3) {
  return updateActiveFloor(p, (fl) => {
    const f = fl.furniture.find((x) => x.id === id)
    if (f) {
      fl.furniture.push({ ...f, id: newId, x: f.x + offset, y: f.y + offset })
      return
    }
    const w = fl.walls.find((x) => x.id === id)
    if (w) {
      fl.walls.push({ ...w, id: newId, x1: w.x1 + offset, y1: w.y1 + offset, x2: w.x2 + offset, y2: w.y2 + offset })
      for (const o of (fl.openings || []).filter((o) => o.wallId === id)) {
        fl.openings.push({ ...o, id: uid('o'), wallId: newId })
      }
      return
    }
    const o = (fl.openings || []).find((x) => x.id === id)
    if (o) fl.openings.push({ ...o, id: newId, offset: o.offset + offset })
  })
}

export function rotateFurniture(p, id) {
  return updateActiveFloor(p, (fl) => {
    const it = fl.furniture.find((x) => x.id === id)
    if (it) it.rotation = (it.rotation + Math.PI / 2) % (Math.PI * 2)
  })
}

// Nudge furniture/wall by (dx,dy); openings slide along their wall by dx.
export function nudgeElement(p, id, dx, dy, grid) {
  return updateActiveFloor(p, (fl) => {
    const f = fl.furniture.find((x) => x.id === id)
    if (f) { f.x = snap(f.x + dx, grid); f.y = snap(f.y + dy, grid); return }
    const w = fl.walls.find((x) => x.id === id)
    if (w) {
      w.x1 = snap(w.x1 + dx, grid); w.y1 = snap(w.y1 + dy, grid)
      w.x2 = snap(w.x2 + dx, grid); w.y2 = snap(w.y2 + dy, grid)
      return
    }
    const o = (fl.openings || []).find((x) => x.id === id)
    if (o) {
      const wall = fl.walls.find((x) => x.id === o.wallId)
      if (wall) {
        const L = dist(wall.x1, wall.y1, wall.x2, wall.y2)
        o.offset = Math.max(0, Math.min(L, snap(o.offset + dx, grid)))
      }
    }
  })
}

export function patchSettings(p, patch) {
  return { ...p, settings: { ...p.settings, ...patch } }
}

export function patchActiveFloor(p, patch) {
  return updateActiveFloor(p, (fl) => { Object.assign(fl, patch) })
}

export function setActiveFloorId(p, id) {
  return { ...p, activeFloorId: id }
}

export function addFloor(p) {
  const level = (p.floors || []).reduce((m, f) => Math.max(m, f.level || 0), 0) + 3
  const f = makeFloor(`Floor ${p.floors.length + 1}`, level)
  return { ...p, floors: [...p.floors, f], activeFloorId: f.id }
}

export function deleteFloor(p) {
  if (p.floors.length <= 1) return p
  const idx = p.floors.findIndex((f) => f.id === p.activeFloorId)
  const floors = p.floors.filter((f) => f.id !== p.activeFloorId)
  const activeFloorId = floors[Math.max(0, idx - 1)].id
  return { ...p, floors, activeFloorId }
}

export function renameProject(p, name) {
  return { ...p, name }
}
