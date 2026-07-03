import { uid, makeFloor } from './project.js'
import {
  wall, opening, place, alongWall, centered, facing, room
} from './sample-layout.js'
import { lintProject } from './layout-linter.js'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'

export function modernApartment() {
  // Outer shell: 10m x 10m, axis-aligned, min-first.
  const cw = {
    bot:   wall(0, 0, 10, 0),   // south, direction +x
    right: wall(10, 0, 10, 10),  // east,  direction +y
    top:   wall(0, 10, 10, 10),  // north, direction +x
    left:  wall(0, 0, 0, 10),    // west,  direction +y
    // Divider between open living/kitchen and bedroom wing.
    divV:  wall(4, 0, 4, 10),    // direction +y, bedrooms on -x side
    // Horizontal dividers inside the bedroom wing.
    bedTop:  wall(0, 6, 4, 6),    // master above
    bathBot: wall(0, 3.5, 4, 3.5), // bed2 below, bathroom above
  }
  const walls = Object.values(cw)

  // Helpers for openings.  `offset` is the center of the opening on the wall.
  const win = (w, offset, width = 1.2, side = 1) =>
    opening('window', w.id, offset, width, side)
  const drr = (w, offset, width = 0.9, side = 1, hinge = 0) =>
    opening('door', w.id, offset, width, side, 'swing', hinge)

  // ── Living / Kitchen (x: 4..10, y: 0..10) ───────────────────────────────
  const living = [
    // Kitchen run along the north wall of the living area.
    alongWall('counter', cw.top, 6.0, 'N'),
    alongWall('sink', cw.top, 7.0, 'N'),
    alongWall('stove', cw.top, 8.0, 'N'),
    alongWall('fridge', cw.top, 9.35, 'N'),
    // Island + dining in the middle of the open space.
    centered('island', room(5.6, 6.6, 1.8, 0.9)),
    centered('dining-table', room(5.6, 4.8, 1.6, 0.9)),
    place('chair', 6.4, 5.55, Math.PI),
    place('chair', 6.4, 4.05, 0),
    place('chair', 5.25, 4.95, Math.PI / 2),
    place('chair', 7.55, 4.95, -Math.PI / 2),
    // Seating area in the lower half of the living room.
    alongWall('sofa', cw.right, 2.5, 'E'),
    alongWall('tv-stand', cw.divV, 2.5, 'W'),
    place('coffee-table', 6.8875, 2.5, 0),
    centered('rug', room(4.5, 1.0, 5.0, 3.0)),
    place('plant', 5.5, 8.5, 0),
  ]

  // ── Master bedroom (x: 0..4, y: 6..10) ──────────────────────────────────
  const master = [
    alongWall('bed-double', cw.top, 2.0, 'N'),
    alongWall('nightstand', cw.top, 1.2, 'N'),
    alongWall('nightstand', cw.top, 2.8, 'N'),
    alongWall('wardrobe', cw.left, 8.0, 'W'),
  ]

  // ── Bedroom 2 (x: 0..4, y: 0..3.5) ─────────────────────────────────────
  const bed2 = [
    alongWall('bed-single', cw.bathBot, 2.0, 'N'),
    place('nightstand', 1.0, 2.5, Math.PI),
    alongWall('wardrobe', cw.left, 1.5, 'W'),
  ]

  // ── Bathroom (x: 0..4, y: 3.5..6) ──────────────────────────────────────
  const bathroom = [
    alongWall('toilet', cw.left, 4.25, 'W'),
    alongWall('vanity', cw.left, 5.25, 'W'),
    alongWall('shower', cw.bathBot, 0.55, 'N'),
  ]

  const furniture = [...living, ...master, ...bed2, ...bathroom]

  // Openings: side = 1 means the left normal of the wall direction.
  // Bottom wall (+x): left normal is +y (into living) -> side=1.
  // Right wall (+y): left normal is -x; living is west (-x) -> side=1.
  // Top wall (+x): left normal is +y; rooms are south (-y) -> side=-1.
  // Left wall (+y): left normal is -x; rooms are east (+x) -> side=-1.
  // divV (+y): left normal is -x; bedrooms are west (-x) -> side=1.
  const openings = [
    // Main entrance.
    drr(cw.bot, 7.0, 0.9, 1),
    // Bedroom doors on the divider.
    drr(cw.divV, 7.5, 0.9, 1),   // master
    drr(cw.divV, 4.75, 0.9, 1),  // bathroom
    drr(cw.divV, 1.75, 0.9, 1),  // bedroom 2
    // Windows.
    win(cw.bot, 7.0, 2.5, 1),    // living front window
    win(cw.right, 7.0, 1.5, 1), // living side window
    win(cw.top, 2.0, 1.5, -1),   // master bedroom window
    win(cw.left, 4.75, 0.8, -1), // bathroom window
    win(cw.left, 1.75, 1.5, -1), // bedroom 2 window
  ]

  const floor = makeFloor('Main', 0)
  floor.walls = walls
  floor.furniture = furniture
  floor.openings = openings

  return {
    version: 1,
    name: 'Modern Apartment',
    settings: {
      units: 'm',
      wallHeight: 2.7,
      wallThickness: 0.15,
      gridSize: 0.1,
    },
    floors: [floor],
    activeFloorId: floor.id,
  }
}

// ── test block ─────────────────────────────────────────────────────────────
const project = modernApartment()
const issues = lintProject(project)
console.log('lint issues:', issues.length)
if (issues.length) {
  console.log(JSON.stringify(issues, null, 2))
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const tmpFile = path.join(__dirname, '.modern-apartment.tmp.json')
fs.writeFileSync(tmpFile, JSON.stringify(project, null, 2))

const result = await new Promise((resolve) => {
  const cp = spawn('node', [
    path.resolve(__dirname, '../../../../.claude/skills/house-design/validate.mjs'),
    tmpFile,
    '--strict',
  ], { stdio: 'inherit' })
  cp.on('close', (code) => resolve(code))
})

fs.unlinkSync(tmpFile)
if (issues.length > 0 || result !== 0) {
  process.exit(1)
}
