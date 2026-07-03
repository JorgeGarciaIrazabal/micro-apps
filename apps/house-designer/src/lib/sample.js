import { uid, makeFloor } from './project.js'
import { makeFurniture } from './furniture/registry.js'
import {
  wall, opening, place, alongWall, centered, facing, row, spacedRow, room, WT, HT
} from './sample-layout.js'

export const SAMPLES = [
  { key: 'tiny-cabin', label: 'Tiny Cabin' },
]

export function getSample(key) {
  const map = {
    'tiny-cabin': tinyCabin,
  }
  return (map[key] || tinyCabin)()
}

export { tinyCabin as sampleProject }

// ─── helpers ────────────────────────────────────────────────────────────────

function w(x1, y1, x2, y2, t = 0.15) { return wall(x1, y1, x2, y2) }
function f(type, x, y, rot = 0) { return { ...makeFurniture(type, x, y), id: uid('f'), rotation: rot } }
function door(wallId, offset, { width = 0.9, hinge = 0, side = 1 } = {}) {
  return { id: uid('o'), type: 'door', wallId, offset, width, height: 2.1, sill: 0, hinge, side }
}
function win(wallId, offset, width = 1.2) {
  return { id: uid('o'), type: 'window', wallId, offset, width, height: 1.1, sill: 0.9, hinge: 0, side: 1 }
}
function flr(name, level, walls, furniture, openings) {
  const fl = makeFloor(name, level)
  fl.walls = walls; fl.furniture = furniture; fl.openings = openings
  return fl
}
function project(name, floors) {
  return { version: 1, name, settings: { units: 'm', wallHeight: 2.7, wallThickness: 0.15, gridSize: 0.1 }, floors, activeFloorId: floors[0].id }
}

// ─── 1. Tiny Cabin ──────────────────────────────────────────────────────────
// 1 floor, 6.5×5.5m — living+kitchen, 1 bedroom, bathroom

function tinyCabin() {
  const cw = {
    bot:   wall(0, 0, 6.5, 0),
    right: wall(6.5, 0, 6.5, 5.5),
    top:   wall(6.5, 5.5, 0, 5.5),
    left:  wall(0, 5.5, 0, 0),
    bathV: wall(4.5, 0, 4.5, 3.2),    // living | bathroom
    midH:  wall(0, 3.2, 6.5, 3.2),    // living+bath | bedroom
  }
  const walls = Object.values(cw)

  // Living + kitchen (0..4.5 x 0..3.2)
  const living = [
    // Sofa on the right side of the bottom wall, away from the kitchenette.
    alongWall('sofa', cw.bot, 3.0, 'S'),
    centered('coffee-table', room(2.45, 1.0, 1.1, 0.6)),
    // Compact kitchenette along the left wall; shorter counter so it fits.
    place('counter', 0.385, 1.6, -Math.PI / 2, { width: 1.0 }),
    alongWall('sink', cw.left, 2.55, 'W'),
  ]

  // Bedroom (0..6.5 x 3.2..5.5)
  const bedroom = [
    alongWall('bed-double', cw.top, 3.25, 'N'),
    alongWall('nightstand', cw.top, 1.5, 'N'),
    alongWall('nightstand', cw.top, 5.5, 'N'),
    alongWall('wardrobe', cw.left, 4.35, 'W'),
  ]

  // Bathroom (4.5..6.5 x 0..3.2)
  const bathroom = [
    alongWall('toilet', cw.bathV, 0.6, 'W'),
    alongWall('vanity', cw.right, 0.7, 'E'),
    alongWall('shower', cw.bathV, 2.2, 'W'),
  ]

  const furn = [...living, ...bedroom, ...bathroom]
  const openings = [
    door(cw.bot.id, 3.8),                       // main door (living front), clear of sofa
    door(cw.bathV.id, 1.5, { width: 0.8, side: 1 }),     // bathroom, swing into living
    door(cw.midH.id, 5.5),                      // bedroom door away from bed foot
    win(cw.bot.id, 0.8, 1.0),                   // living front
    win(cw.left.id, 4.0, 0.9),                  // left wall (offset from y=5.5: y=1.5)
    win(cw.top.id, 3.0, 1.4),                   // bedroom back (offset from x=6.5: x=3.5)
    win(cw.right.id, 1.5, 0.5),                 // bathroom right
  ]
  const floor = flr('Main', 0, walls, furn, openings)
  return project('Tiny Cabin', [floor])
}
