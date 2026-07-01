#!/usr/bin/env node
// .claude/skills/house-design/validate.mjs
// Standalone validator for House Designer project JSON files.
// No dependencies — pure Node builtins.
//
// Usage:
//   node validate.mjs <file.json> [file2.json ...] [--strict] [--quiet]
//
// Flags:
//   --strict   treat warnings as errors (exit non-zero on any warning)
//   --quiet    only print summary + errors, suppress per-check warnings detail
//
// Exit codes: 0 = valid (warnings allowed unless --strict); 1 = at least one error.

import fs from 'node:fs'
import path from 'node:path'

const argv = process.argv.slice(2)
const flags = new Set(argv.filter((a) => a.startsWith('--')))
const files = argv.filter((a) => !a.startsWith('--'))
const STRICT = flags.has('--strict')
const QUIET = flags.has('--quiet')

if (files.length === 0) {
  console.error('Usage: node validate.mjs <file.json> [files...] [--strict] [--quiet]')
  process.exit(2)
}

// --- catalog of known furniture types (mirrors src/lib/furniture.js CATALOG) ---
const KNOWN_FURNITURE_TYPES = new Set([
  'sofa', 'armchair', 'coffee-table', 'tv-stand', 'bookshelf', 'rug',
  'bed-double', 'bed-single', 'nightstand', 'wardrobe', 'dresser',
  'counter', 'sink', 'stove', 'fridge', 'island', 'dining-table', 'chair',
  'toilet', 'bathtub', 'shower', 'vanity',
  'desk', 'office-chair', 'filing-cabinet',
  'plant', 'tree', 'box',
])

const clampRange = (lo, hi) => ({ lo, hi })

Object.defineProperty(Number.prototype, 'inRange', { value: function (r) { return this >= r.lo && this <= r.hi }, configurable: true })

let hadError = false
let hadWarning = false

function err(msg) { console.error(`  ✗ ERROR: ${msg}`); hadError = true }
function warn(msg) { if (!QUIET) console.error(`  ⚠ WARN:  ${msg}`) || (hadWarning = true); else hadWarning = true }
function ok(msg) { if (!QUIET) console.log(`  ✓ ${msg}`) }
function isNum(v) { return typeof v === 'number' && Number.isFinite(v) }
function isStr(v) { return typeof v === 'string' && v.length > 0 }
function hexColor(v) { return typeof v === 'string' && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v) }
function hypot(x1, y1, x2, y2) { return Math.hypot(x2 - x1, y2 - y1) }

function validateProject(obj, file) {
  let errors = 0
  hadError = false
  hadWarning = false
  const E = (m) => { err(m); errors++ }

  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    E('Top-level value is not an object.')
    return errors
  }

  if (obj.version !== 1) E(`"version" must be 1 (got ${JSON.stringify(obj.version)})`)
  if (!isStr(obj.name)) E('"name" must be a non-empty string.')
  if (!isStr(obj.activeFloorId)) E('"activeFloorId" must be a non-empty string.')

  // settings
  const s = obj.settings
  if (!s || typeof s !== 'object' || Array.isArray(s)) { E('"settings" is missing or not an object.') }
  else {
    if (s.units !== 'm' && s.units !== 'ft') E(`"settings.units" must be "m" or "ft" (got ${JSON.stringify(s.units)})`)
    const wh = clampRange(2.4, 6)
    if (!isNum(s.wallHeight) || !s.wallHeight.inRange(wh)) E(`"settings.wallHeight" must be a number in [2.4, 6] (got ${JSON.stringify(s.wallHeight)})`)
    const wt = clampRange(0.05, 0.6)
    if (!isNum(s.wallThickness) || !s.wallThickness.inRange(wt)) E(`"settings.wallThickness" must be a number in [0.05, 0.6] (got ${JSON.stringify(s.wallThickness)})`)
    const gs = clampRange(0.01, 1)
    if (!isNum(s.gridSize) || !s.gridSize.inRange(gs)) E(`"settings.gridSize" must be a number in [0.01, 1] (got ${JSON.stringify(s.gridSize)})`)
  }

  // floors
  if (!Array.isArray(obj.floors) || obj.floors.length === 0) {
    E('"floors" must be a non-empty array.')
    return errors
  }

  const floorIds = new Map()   // id -> index
  const globalFurnitureIds = new Set()
  const globalOpeningIds = new Set()
  let activeFloorFound = false

  obj.floors.forEach((fl, fi) => {
    const where = `floors[${fi}]`
    if (!fl || typeof fl !== 'object' || Array.isArray(fl)) { E(`${where} is not an object.`); return }

    if (!isStr(fl.id)) { E(`${where}.id must be a non-empty string.`) }
    else {
      if (floorIds.has(fl.id)) E(`${where}.id "${fl.id}" duplicates floor at index ${floorIds.get(fl.id)}.`)
      floorIds.set(fl.id, fi)
    }
    if (fl.id === obj.activeFloorId) activeFloorFound = true

    if (!isStr(fl.name)) E(`${where}.name must be a non-empty string (defaulted if empty is NOT allowed here).`)
    const lvl = clampRange(-10, 30)
    if (!isNum(fl.level) || !fl.level.inRange(lvl)) E(`${where}.level must be a number in [-10, 30] (got ${JSON.stringify(fl.level)})`)

    for (const arrKey of ['walls', 'furniture', 'openings']) {
      if (!Array.isArray(fl[arrKey])) E(`${where}.${arrKey} must be an array.`)
    }

    const wallIds = new Set()
    ;(Array.isArray(fl.walls) ? fl.walls : []).forEach((w, wi) => {
      const wwhere = `${where}.walls[${wi}]`
      if (!w || typeof w !== 'object') { E(`${wwhere} is not an object.`); return }
      if (!isStr(w.id)) E(`${wwhere}.id must be a non-empty string.`)
      else {
        if (wallIds.has(w.id)) E(`${wwhere}.id "${w.id}" duplicates a wall on this floor.`)
        wallIds.add(w.id)
      }
      for (const c of ['x1', 'y1', 'x2', 'y2']) if (!isNum(w[c])) E(`${wwhere}.${c} must be a number (got ${JSON.stringify(w[c])})`)
      const L = hypot(w.x1 ?? 0, w.y1 ?? 0, w.x2 ?? 0, w.y2 ?? 0)
      if (isNum(w.x1) && isNum(w.y1) && isNum(w.x2) && isNum(w.y2) && L < 1e-4) E(`${wwhere} has zero length (start == end).`)
      const wt = clampRange(0.05, 0.6)
      if (!isNum(w.thickness) || !w.thickness.inRange(wt)) E(`${wwhere}.thickness must be a number in [0.05, 0.6] (got ${JSON.stringify(w.thickness)})`)
    })

    ;(Array.isArray(fl.furniture) ? fl.furniture : []).forEach((f, ii) => {
      const fwhere = `${where}.furniture[${ii}]`
      if (!f || typeof f !== 'object') { E(`${fwhere} is not an object.`); return }
      if (!isStr(f.id)) E(`${fwhere}.id must be a non-empty string.`)
      else {
        if (globalFurnitureIds.has(f.id)) E(`${fwhere}.id "${f.id}" duplicates a furniture id on another floor.`)
        globalFurnitureIds.add(f.id)
      }
      if (!isStr(f.type)) E(`${fwhere}.type must be a string.`)
      else if (!KNOWN_FURNITURE_TYPES.has(f.type)) warn(`${fwhere}.type "${f.type}" is not in the catalog (will render as a generic box).`)
      for (const c of ['x', 'y', 'rotation']) if (!isNum(f[c])) E(`${fwhere}.${c} must be a number (got ${JSON.stringify(f[c])})`)
      const wR = clampRange(0.05, 10)
      if (!isNum(f.width) || !f.width.inRange(wR)) E(`${fwhere}.width must be in [0.05, 10] (got ${JSON.stringify(f.width)})`)
      const dR = clampRange(0.05, 10)
      if (!isNum(f.depth) || !f.depth.inRange(dR)) E(`${fwhere}.depth must be in [0.05, 10] (got ${JSON.stringify(f.depth)})`)
      const hR = clampRange(0.05, 4)
      if (!isNum(f.height) || !f.height.inRange(hR)) E(`${fwhere}.height must be in [0.05, 4] (got ${JSON.stringify(f.height)})`)
      if (f.color != null && !hexColor(f.color)) E(`${fwhere}.color must be a #hex string (got ${JSON.stringify(f.color)})`)
      if (f.label != null && typeof f.label !== 'string') E(`${fwhere}.label must be a string if present.`)
    })

    ;(Array.isArray(fl.openings) ? fl.openings : []).forEach((o, oi) => {
      const owhere = `${where}.openings[${oi}]`
      if (!o || typeof o !== 'object') { E(`${owhere} is not an object.`); return }
      if (!isStr(o.id)) E(`${owhere}.id must be a non-empty string.`)
      else {
        if (globalOpeningIds.has(o.id)) E(`${owhere}.id "${o.id}" duplicates an opening id on another floor.`)
        globalOpeningIds.add(o.id)
      }
      if (o.type !== 'door' && o.type !== 'window') E(`${owhere}.type must be "door" or "window" (got ${JSON.stringify(o.type)})`)
      if (!isStr(o.wallId)) E(`${owhere}.wallId must be a non-empty string.`)
      else if (!wallIds.has(o.wallId)) E(`${owhere}.wallId "${o.wallId}" does not match any wall on this floor.`)
      if (!isNum(o.offset) || o.offset < 0) E(`${owhere}.offset must be >= 0 (got ${JSON.stringify(o.offset)})`)
      const wR = clampRange(0.3, 3)
      if (!isNum(o.width) || !o.width.inRange(wR)) E(`${owhere}.width must be in [0.3, 3] (got ${JSON.stringify(o.width)})`)
      const hR = clampRange(0.3, 4)
      if (!isNum(o.height) || !o.height.inRange(hR)) E(`${owhere}.height must be in [0.3, 4] (got ${JSON.stringify(o.height)})`)
      const sR = clampRange(0, 3)
      if (!isNum(o.sill) || !o.sill.inRange(sR)) E(`${owhere}.sill must be in [0, 3] (got ${JSON.stringify(o.sill)})`)
      if (o.hinge !== 0 && o.hinge !== 1) E(`${owhere}.hinge must be 0 or 1 (got ${JSON.stringify(o.hinge)})`)
      if (o.side !== 1 && o.side !== -1) E(`${owhere}.side must be 1 or -1 (got ${JSON.stringify(o.side)})`)
      // offset within wall span?
      if (isNum(o.offset) && isStr(o.wallId)) {
        const wall = fl.walls.find((w) => w.id === o.wallId)
        if (wall && isNum(wall.x1) && isNum(wall.y1) && isNum(wall.x2) && isNum(wall.y2)) {
          const L = hypot(wall.x1, wall.y1, wall.x2, wall.y2)
          if (o.offset < o.width / 2 - 1e-6 || o.offset > L - o.width / 2 + 1e-6) {
            warn(`${owhere}: offset ${o.offset} places the opening outside the wall span [${o.width / 2}, ${L - o.width / 2}]. It will be clamped on load.`)
          }
          // sensible door sill
          if (o.type === 'door' && o.sill > 0.05) warn(`${owhere}: door has sill ${o.sill} (doors usually have sill 0).`)
          if (o.type === 'window' && o.sill < 0.3) warn(`${owhere}: window has sill ${o.sill} (windows usually have sill ~1.0).`)
        }
      }
    })
  })

  if (!activeFloorFound) {
    E(`"activeFloorId" "${obj.activeFloorId}" does not match any floor id.`)
  }

  return errors
}

function main() {
  let totalErrors = 0
  for (const file of files) {
    let raw
    try {
      raw = fs.readFileSync(path.resolve(file), 'utf8')
    } catch (e) {
      console.error(`\n=== ${file} ===\n  ✗ ERROR: cannot read file: ${e.message}`)
      totalErrors++
      hadError = true
      continue
    }
    let obj
    try {
      obj = JSON.parse(raw)
    } catch (e) {
      console.error(`\n=== ${file} ===\n  ✗ ERROR: invalid JSON: ${e.message}`)
      totalErrors++
      hadError = true
      continue
    }
    console.error(`\n=== ${file} ===`)
    const nErr = validateProject(obj, file)
    if (!hadError && (!hadWarning || !STRICT)) {
      console.error(`  ✓ valid${hadWarning ? ' (with warnings)' : ''}`)
    } else if (hadError) {
      totalErrors++
    }
  }
  console.error('')
  if (totalErrors > 0 || (STRICT && hadWarning && totalErrors === 0 && hadError)) {
    console.error(`❌ ${STRICT && hadWarning ? 'validation failed (errors and/or warnings treated as failures)' : 'validation failed with errors'}.`)
    process.exit(1)
  }
  if (STRICT && hadWarning) {
    console.error('❌ validation failed (--strict: warnings treated as errors).')
    process.exit(1)
  }
  console.error('✓ all files valid.')
  process.exit(0)
}

main()