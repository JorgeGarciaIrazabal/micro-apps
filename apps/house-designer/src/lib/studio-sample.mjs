import { uid, makeFloor } from './project.js'
import {
  wall,
  opening,
  alongWall,
  centered,
  room,
} from './sample-layout.js'

// ─── local helpers ──────────────────────────────────────────────────────────

function flr(name, level, walls, furniture, openings) {
  const fl = makeFloor(name, level)
  fl.walls = walls
  fl.furniture = furniture
  fl.openings = openings
  return fl
}

function makeProject(name, floors) {
  return {
    version: 1,
    name,
    settings: {
      units: 'm',
      wallHeight: 2.7,
      wallThickness: 0.15,
      gridSize: 0.1,
    },
    floors,
    activeFloorId: floors[0].id,
  }
}

// The app interprets opening.offset as the distance from the wall start to the
// center of the opening, so these wrappers pass offset directly.
function door(w, offset, width = 0.9, side = 1, style = 'swing', hinge = 0) {
  return opening('door', w.id, offset, width, side, style, hinge)
}

function win(w, offset, width = 1.2) {
  return opening('window', w.id, offset, width, 1, 'swing', 0)
}

// ─── studioApartment ──────────────────────────────────────────────────────────
// Compact studio: one open living/sleeping/kitchen space + one bathroom.

export function studioApartment() {
  // Outer shell 7.5 m × 5.0 m; bathroom 2.0 m × 2.0 m in bottom-right corner.
  const outer = {
    bot: wall(0, 0, 7.5, 0),       // south
    right: wall(7.5, 0, 7.5, 5.0),  // east
    top: wall(7.5, 5.0, 0, 5.0),    // north
    left: wall(0, 5.0, 0, 0),       // west
  }
  const bath = {
    bot: wall(5.5, 2.0, 7.5, 2.0),  // north wall of bathroom / south edge of upper room
    left: wall(5.5, 0, 5.5, 2.0),   // west wall of bathroom
  }
  const walls = [outer.bot, outer.right, outer.top, outer.left, bath.bot, bath.left]

  // ── sleeping + living zone (open L-shaped room, y > 2.0 and/or x < 5.5) ───
  const living = [
    // Bed in the top-left corner, headboard against the north wall.
    alongWall('bed-double', outer.top, 1.0, 'N'),
    // Sofa on the north wall, well separated from the bed.
    alongWall('sofa', outer.top, 4.5, 'N'),
    // Coffee table centered between the bed and the sofa.
    centered('coffee-table', room(2.95, 2.7, 1.1, 0.6)),
  ]

  // ── kitchenette along the south wall of the open area ──────────────────────
  // Available run: x = 0 .. 5.5 m. Fridge + short counter + sink fit cleanly.
  const kitchen = [
    alongWall('fridge', outer.bot, 0.5, 'S'),
    { ...alongWall('counter', outer.bot, 1.5, 'S'), width: 1.2 },
    alongWall('sink', outer.bot, 2.7, 'S'),
  ]

  // ── bathroom fixtures ──────────────────────────────────────────────────────
  const bathroom = [
    // Shower in the back-left corner of the bathroom.
    alongWall('shower', bath.left, 1.3, 'W'),
    // Toilet on the north wall of the bathroom (against the shared partition).
    alongWall('toilet', bath.bot, 1.5, 'N'),
    // Vanity on the south wall, under the bathroom window.
    alongWall('vanity', outer.bot, 6.5, 'S'),
  ]

  const furniture = [...living, ...kitchen, ...bathroom]

  // ── openings ───────────────────────────────────────────────────────────────
  const openings = [
    // Main entrance: sliding door on the south wall, clear of the kitchenette.
    door(outer.bot, 4.0, 0.9, 1, 'sliding', 0),
    // Bathroom door: sliding to avoid swing-arc conflicts in the small room.
    door(bath.left, 1.0, 0.8, 1, 'sliding', 0),
    // Windows.
    win(outer.top, 2.5, 1.2),
    win(outer.left, 2.5, 0.9),
    win(outer.right, 4.0, 0.6),
  ]

  const floor = flr('Main', 0, walls, furniture, openings)
  return makeProject('Studio Apartment', [floor])
}

// ─── test block ─────────────────────────────────────────────────────────────

import { lintProject } from './layout-linter.js'
import fs from 'node:fs'
import path from 'node:path'

const proj = studioApartment()
const issues = lintProject(proj)
console.log('lint issues:', issues.length)
if (issues.length > 0) {
  console.log(JSON.stringify(issues, null, 2))
}

const tmpFile = path.resolve('/tmp/studio-apartment.json')
fs.writeFileSync(tmpFile, JSON.stringify(proj, null, 2))
console.log('wrote', tmpFile)
