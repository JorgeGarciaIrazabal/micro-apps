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
  'floor-lamp', 'piano', 'side-table',
  'bed-double', 'bed-single', 'nightstand', 'wardrobe', 'dresser', 'crib',
  'counter', 'sink', 'stove', 'fridge', 'island', 'dining-table', 'chair', 'dishwasher',
  'toilet', 'bathtub', 'shower', 'vanity', 'washing-machine',
  'desk', 'office-chair', 'filing-cabinet',
  'stairs', 'balcony', 'railing',
  'plant', 'tree', 'pool', 'bbq', 'bench', 'outdoor-table', 'box',
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
    if (!isNum(s.wallHeight)) E(`"settings.wallHeight" must be a number (got ${JSON.stringify(s.wallHeight)})`)
    else if (!s.wallHeight.inRange(wh)) warn(`"settings.wallHeight" ${s.wallHeight} is outside [2.4, 6] and will be clamped on load.`)
    const wt = clampRange(0.05, 0.6)
    if (!isNum(s.wallThickness)) E(`"settings.wallThickness" must be a number (got ${JSON.stringify(s.wallThickness)})`)
    else if (!s.wallThickness.inRange(wt)) warn(`"settings.wallThickness" ${s.wallThickness} is outside [0.05, 0.6] and will be clamped on load.`)
    const gs = clampRange(0.01, 1)
    if (!isNum(s.gridSize)) E(`"settings.gridSize" must be a number (got ${JSON.stringify(s.gridSize)})`)
    else if (!s.gridSize.inRange(gs)) warn(`"settings.gridSize" ${s.gridSize} is outside [0.01, 1] and will be clamped on load.`)
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
    if (!isNum(fl.level)) E(`${where}.level must be a number (got ${JSON.stringify(fl.level)})`)
    else if (!fl.level.inRange(lvl)) warn(`${where}.level ${fl.level} is outside [-10, 30] and will be clamped on load.`)

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
      if (!isNum(w.thickness)) E(`${wwhere}.thickness must be a number (got ${JSON.stringify(w.thickness)})`)
      else if (!w.thickness.inRange(wt)) warn(`${wwhere}.thickness ${w.thickness} is outside [0.05, 0.6] and will be clamped on load.`)
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
      if (!isNum(f.width)) E(`${fwhere}.width must be a number (got ${JSON.stringify(f.width)})`)
      else if (!f.width.inRange(wR)) warn(`${fwhere}.width ${f.width} is outside [0.05, 10] and will be clamped on load.`)
      const dR = clampRange(0.05, 10)
      if (!isNum(f.depth)) E(`${fwhere}.depth must be a number (got ${JSON.stringify(f.depth)})`)
      else if (!f.depth.inRange(dR)) warn(`${fwhere}.depth ${f.depth} is outside [0.05, 10] and will be clamped on load.`)
      const hR = clampRange(0.05, 4)
      if (!isNum(f.height)) E(`${fwhere}.height must be a number (got ${JSON.stringify(f.height)})`)
      else if (!f.height.inRange(hR)) warn(`${fwhere}.height ${f.height} is outside [0.05, 4] and will be clamped on load.`)
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
      if (o.style !== undefined && !['swing', 'double', 'sliding', 'folding'].includes(o.style)) {
        warn(`${owhere}.style ${JSON.stringify(o.style)} is not one of swing/double/sliding/folding and will fall back to "swing" on load.`)
      }
      if (!isStr(o.wallId)) E(`${owhere}.wallId must be a non-empty string.`)
      else if (!wallIds.has(o.wallId)) E(`${owhere}.wallId "${o.wallId}" does not match any wall on this floor.`)
      if (!isNum(o.offset)) E(`${owhere}.offset must be a number (got ${JSON.stringify(o.offset)})`)
      else if (o.offset < 0) warn(`${owhere}.offset ${o.offset} is < 0 and will be clamped to 0 on load.`)
      const wR = clampRange(0.3, 3)
      if (!isNum(o.width)) E(`${owhere}.width must be a number (got ${JSON.stringify(o.width)})`)
      else if (!o.width.inRange(wR)) warn(`${owhere}.width ${o.width} is outside [0.3, 3] and will be clamped on load.`)
      const hR = clampRange(0.3, 4)
      if (!isNum(o.height)) E(`${owhere}.height must be a number (got ${JSON.stringify(o.height)})`)
      else if (!o.height.inRange(hR)) warn(`${owhere}.height ${o.height} is outside [0.3, 4] and will be clamped on load.`)
      const sR = clampRange(0, 3)
      if (!isNum(o.sill)) E(`${owhere}.sill must be a number (got ${JSON.stringify(o.sill)})`)
      else if (!o.sill.inRange(sR)) warn(`${owhere}.sill ${o.sill} is outside [0, 3] and will be clamped on load.`)
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