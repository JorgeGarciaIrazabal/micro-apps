import { uid, makeFloor } from '../lib/project.js'
import { makeFurniture } from '../lib/furniture/registry.js'
import {
  wall, opening, place, alongWall, centered, facing, row, spacedRow, room, WT, HT, door as layoutDoor
} from './sample-layout.js'

export const SAMPLES = [
  { key: 'tiny-cabin', label: 'Tiny Cabin' },
  { key: 'family-home', label: '120 m² Family Home' },
  { key: 'studio-apartment', label: 'Studio Apartment' },
  { key: 'modern-apartment', label: 'Modern Apartment' },
  { key: 'open-loft', label: 'Open Loft' },
  { key: 'home-office', label: 'Home Office' },
]

export function getSample(key) {
  const map = {
    'tiny-cabin': tinyCabin,
    'family-home': familyHome,
    'studio-apartment': studioApartment,
    'modern-apartment': modernApartment,
    'open-loft': openLoft,
    'home-office': homeOffice,
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
    alongWall('sofa', cw.bot, 2.2, 'S'), // shifted from 3.0 to 2.2 to avoid door swing conflict
    centered('coffee-table', room(1.65, 1.0, 1.1, 0.6)), // shifted table to align with sofa
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

// ─── 2. Family Home ─────────────────────────────────────────────────────────
// 2 floors, 9×7m each — living/kitchen/dining + 2 bedrooms

function familyHome() {
  // Ground floor
  const gw = {
    bot:   wall(0, 0, 9, 0),
    right: wall(9, 0, 9, 7),
    top:   wall(0, 7, 9, 7), // min-first!
    left:  wall(0, 0, 0, 7), // min-first!
    midV:  wall(5, 0, 5, 7),         // living+bath | kitchen+dining
    midHL: wall(0, 4.5, 5, 4.5),     // living | bath+hall
    midHR: wall(5, 4.5, 9, 4.5),     // kitchen | dining
    bathV: wall(2.5, 4.5, 2.5, 7),   // bathroom | hall
  }
  const gWalls = Object.values(gw)

  const gLiving = [
    alongWall('sofa', gw.bot, 2.0, 'S'),
    centered('coffee-table', room(1.45, 1.25, 1.1, 0.6)),
    alongWall('tv-stand', gw.midHL, 2.0, 'N'),
    centered('rug', room(0.8, 0.7, 2.4, 1.6)),
    alongWall('bookshelf', gw.left, 0.8, 'W'),
  ]
  const gBath = [
    alongWall('toilet', gw.bathV, 2.0, 'E'), // y_world = 6.5
    alongWall('vanity', gw.left, 5.025, 'W'), // y_world = 5.025
    alongWall('shower', gw.top, 0.525, 'N'), // x_world = 0.525
  ]
  const gKitchen = [
    alongWall('fridge', gw.bot, 5.5, 'S'),
    alongWall('counter', gw.bot, 7.0, 'S'),
    alongWall('sink', gw.bot, 8.5, 'S'),
    centered('island', room(6.1, 2.05, 1.8, 0.9)),
  ]
  const gDining = [
    centered('dining-table', room(6.2, 5.3, 1.6, 0.9)),
    facing('chair', 7.0, 6.45, 7.0, 5.75, 'front'),
    facing('chair', 7.0, 5.05, 7.0, 5.75, 'front'),
    facing('chair', 8.05, 5.75, 7.0, 5.75, 'front'),
    facing('chair', 5.95, 5.75, 7.0, 5.75, 'front'),
  ]

  const gOpen = [
    door(gw.bot.id, 4.0, { width: 1.0 }),            // main entrance
    door(gw.midHL.id, 3.5),                           // living → hall, swing into hall
    door(gw.bathV.id, 1.3, { width: 0.8, side: 1 }),  // bathroom, offset 1.3 to avoid wall collision
    door(gw.midHR.id, 2.0, { side: -1 }),             // kitchen → dining, swing south (into kitchen)
    win(gw.bot.id, 2.0, 1.2),
    win(gw.right.id, 2.5, 1.2),
    win(gw.top.id, 7.0, 1.2),
    win(gw.left.id, 5.5, 1.0),
  ]
  const ground = flr('Ground', 0, gWalls, [...gLiving, ...gBath, ...gKitchen, ...gDining], gOpen)

  // Upper floor
  const uw = {
    bot:   wall(0, 0, 9, 0),
    right: wall(9, 0, 9, 7),
    top:   wall(0, 7, 9, 7), // min-first!
    left:  wall(0, 0, 0, 7), // min-first!
    midV:  wall(5, 0, 5, 4),          // bedroom1 | bedroom2
    midH:  wall(0, 4, 9, 4),          // bedrooms | hall/bath
    hallH: wall(0, 5, 9, 5),          // hall | bathroom
    bathV: wall(4.5, 5, 4.5, 7),      // hall | bathroom
  }
  const uWalls = Object.values(uw)

  const uBed1 = [
    alongWall('bed-double', uw.midH, 2.0, 'N'),
    alongWall('nightstand', uw.midH, 0.8, 'N'),
    alongWall('nightstand', uw.midH, 3.2, 'N'),
    alongWall('wardrobe', uw.left, 2.0, 'W'),
  ]
  const uBed2 = [
    alongWall('bed-double', uw.right, 1.9, 'E'),
    alongWall('nightstand', uw.right, 0.7, 'E'),
    alongWall('nightstand', uw.right, 3.1, 'E'),
    alongWall('wardrobe', uw.midV, 0.85, 'W'),
    alongWall('desk', uw.midH, 5.85, 'N'),
    facing('office-chair', 5.85, 2.9, 5.85, 3.575, 'front'),
  ]
  const uBath = [
    alongWall('toilet', uw.bathV, 0.6, 'W'), // y_world = 5.6
    alongWall('vanity', uw.top, 7.0, 'N'), // x_world = 7.0
    alongWall('shower', uw.right, 5.55, 'E'), // y_world = 5.55
  ]

  const uOpen = [
    door(uw.midH.id, 4.0),                            // bedroom1
    door(uw.midH.id, 8.0, { hinge: 1 }),              // bedroom2, offset 8.0, hinge=1 to swing away from east wall
    door(uw.bathV.id, 1.3, { width: 0.8, side: 1 }),  // upper bath, offset 1.3 to avoid wall collision
    win(uw.bot.id, 2.0, 1.2),
    win(uw.bot.id, 7.0, 1.2),
    win(uw.top.id, 2.0, 1.2),
    win(uw.right.id, 6.0, 0.9),
  ]
  const upper = flr('Upper', 3.0, uWalls, [...uBed1, ...uBed2, ...uBath], uOpen)

  return project('120 m² Family Home', [ground, upper])
}

// ─── 3. Studio Apartment ────────────────────────────────────────────────────
// Compact studio: one open living/sleeping/kitchen space + one bathroom

function studioApartment() {
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

  const drr = (w, offset, width = 0.9, side = 1, style = 'swing', hinge = 0) =>
    opening('door', w.id, offset, width, side, style, hinge)
  const wn = (w, offset, width = 1.2) =>
    opening('window', w.id, offset, width, 1, 'swing', 0)

  const living = [
    // Bed in the top-left corner, headboard against the north wall.
    alongWall('bed-double', outer.top, 1.0, 'N'),
    // Sofa on the north wall, well separated from the bed.
    alongWall('sofa', outer.top, 4.5, 'N'),
    // Coffee table centered between the bed and the sofa.
    centered('coffee-table', room(2.95, 2.7, 1.1, 0.6)),
  ]

  const kitchen = [
    alongWall('fridge', outer.bot, 0.5, 'S'),
    { ...alongWall('counter', outer.bot, 1.5, 'S'), width: 1.2 },
    alongWall('sink', outer.bot, 2.7, 'S'),
  ]

  const bathroom = [
    alongWall('shower', bath.left, 1.3, 'W'),
    alongWall('toilet', bath.bot, 1.5, 'N'),
    alongWall('vanity', outer.bot, 6.5, 'S'),
  ]

  const furniture = [...living, ...kitchen, ...bathroom]

  const openings = [
    drr(outer.bot, 4.0, 0.9, 1, 'sliding', 0),
    drr(bath.left, 1.0, 0.8, 1, 'sliding', 0),
    wn(outer.top, 2.5, 1.2),
    wn(outer.left, 2.5, 0.9),
    wn(outer.right, 4.0, 0.6),
  ]

  const floor = flr('Main', 0, walls, furniture, openings)
  return project('Studio Apartment', [floor])
}

// ─── 4. Modern Apartment ────────────────────────────────────────────────────
// 2-bedroom modern flat with a large open-plan living/dining/kitchen area

function modernApartment() {
  const cw = {
    bot:   wall(0, 0, 10, 0),
    right: wall(10, 0, 10, 10),
    top:   wall(0, 10, 10, 10),
    left:  wall(0, 0, 0, 10),
    divV:  wall(4, 0, 4, 10),
    bedTop:  wall(0, 6, 4, 6),
    bathBot: wall(0, 3.5, 4, 3.5),
  }
  const walls = Object.values(cw)

  const win = (w, offset, width = 1.2, side = 1) =>
    opening('window', w.id, offset, width, side)
  const drr = (w, offset, width = 0.9, side = 1, hinge = 0) =>
    opening('door', w.id, offset, width, side, 'swing', hinge)

  const living = [
    alongWall('counter', cw.top, 6.5, 'N'),
    alongWall('sink', cw.top, 8.0, 'N'),
    alongWall('stove', cw.top, 8.8, 'N'),
    alongWall('fridge', cw.top, 9.55, 'N'),
    centered('island', room(5.6, 6.6, 1.8, 0.9)),
    centered('dining-table', room(5.6, 4.5, 1.6, 0.9)),
    place('chair', 6.4, 5.7, Math.PI),
    place('chair', 6.4, 4.2, 0),
    place('chair', 5.25, 4.95, Math.PI / 2),
    place('chair', 7.55, 4.95, -Math.PI / 2),
    alongWall('sofa', cw.right, 2.5, 'E'),
    alongWall('tv-stand', cw.divV, 2.5, 'W'),
    place('coffee-table', 6.8875, 2.5, 0),
    centered('rug', room(4.5, 1.0, 5.0, 3.0)),
    place('plant', 5.5, 8.5, 0),
  ]

  const master = [
    alongWall('bed-double', cw.top, 2.0, 'N'),
    alongWall('nightstand', cw.top, 0.9, 'N'),
    alongWall('nightstand', cw.top, 3.1, 'N'),
    alongWall('wardrobe', cw.left, 8.0, 'W'),
  ]

  const bed2 = [
    alongWall('bed-single', cw.bathBot, 2.2, 'N'),
    alongWall('nightstand', cw.bathBot, 3.0, 'N'),
    alongWall('wardrobe', cw.left, 1.5, 'W'),
  ]

  const bathroom = [
    alongWall('toilet', cw.bathBot, 1.0, 'S'),
    alongWall('vanity', cw.bedTop, 1.6, 'N'),
    alongWall('shower', cw.left, 5.47, 'W'),
  ]

  const furniture = [...living, ...master, ...bed2, ...bathroom]

  const openings = [
    drr(cw.bot, 7.0, 0.9, 1),
    drr(cw.divV, 7.6, 0.9, 1),
    drr(cw.divV, 5.2, 0.9, 1),
    drr(cw.divV, 1.75, 0.9, 1),
    win(cw.bot, 7.0, 2.5, 1),
    win(cw.right, 7.0, 1.5, 1),
    win(cw.top, 2.0, 1.5, -1),
    win(cw.left, 4.75, 0.8, -1),
    win(cw.left, 1.75, 1.5, -1),
  ]

  const floor = flr('Main', 0, walls, furniture, openings)
  return project('Modern Apartment', [floor])
}

// ─── 5. Open Loft ───────────────────────────────────────────────────────────
// Large open industrial-style loft with a central dining block and private bath

function openLoft() {
  const W = 12
  const D = 9
  const bw = 2.4
  const bd = 2.2

  const shell = {
    bot:   wall(0, 0, W, 0),
    right: wall(W, 0, W, D),
    top:   wall(0, D, W, D),
    left:  wall(0, 0, 0, D),
  }
  const bath = {
    right: wall(bw, 0, bw, bd),
    top:   wall(0, bd, bw, bd),
  }
  const walls = Object.values(shell).concat(Object.values(bath))

  const drr = (w, along, width = 0.9, swingSide = '+y', hinge = 0) =>
    layoutDoor(w, along, width, swingSide, hinge)
  const wn = (w, along, width = 1.2) =>
    opening('window', w.id, along - width / 2, width, 1)

  const sleep = [
    alongWall('bed-double', shell.top, 6.5, 'N'),
    alongWall('nightstand', shell.top, 5.2, 'N'),
    alongWall('nightstand', shell.top, 7.8, 'N'),
    alongWall('wardrobe', shell.left, 7.5, 'W'),
  ]

  const living = [
    alongWall('sofa', shell.bot, 7.5, 'S'),
    centered('coffee-table', room(6.95, 1.3, 1.1, 0.6)),
    place('tv-stand', 9.5, 3.0, Math.PI),
    centered('rug', room(6.3, 0.4, 2.4, 1.6)),
    centered('floor-lamp', room(9.0, 1.0, 0.4, 0.4)),
  ]

  const dining = [
    centered('dining-table', room(4.2, 4.05, 1.6, 0.9)),
    facing('chair', 3.5, 4.5, 5.0, 4.5, 'front'),
    facing('chair', 6.5, 4.5, 5.0, 4.5, 'front'),
    facing('chair', 5.0, 5.6, 5.0, 4.5, 'back'),
    facing('chair', 5.0, 3.4, 5.0, 4.5, 'back'),
  ]

  const kitchen = [
    alongWall('fridge', shell.right, 7.5, 'E'),
    alongWall('counter', shell.right, 5.5, 'E'),
    alongWall('sink', shell.right, 4.0, 'E'),
    alongWall('stove', shell.right, 3.0, 'E'),
    centered('island', room(8.6, 4.55, 1.8, 0.9)),
  ]

  const bathroom = [
    alongWall('toilet', bath.right, 0.5, 'E'),
    alongWall('vanity', bath.top, 0.6, 'N'),
    alongWall('shower', shell.left, 0.9, 'W'),
  ]

  const decor = [
    place('plant', 3.5, 6.5),
  ]

  const furniture = [...sleep, ...living, ...dining, ...kitchen, ...bathroom, ...decor]

  const openings = [
    drr(shell.bot, 10.0, 0.9, '+y'),
    drr(bath.top, 1.5, 0.8, '+y'),
    wn(shell.bot, 5.0, 2.0),
    wn(shell.top, 7.0, 2.0),
    wn(shell.left, 5.0, 1.5),
    wn(shell.right, 7.5, 1.2),
  ]

  const floor = flr('Main', 0, walls, furniture, openings)
  return project('Open Loft', [floor])
}

// ─── 6. Home Office ─────────────────────────────────────────────────────────
// A professional workplace studio complete with kitchenette and restroom

function homeOffice() {
  const cw = {
    bot:   wall(0, 0, 6, 0),
    right: wall(6, 0, 6, 5),
    top:   wall(0, 5, 6, 5),
    left:  wall(0, 0, 0, 5),
    bathV: wall(2.0, 3.0, 2.0, 5.0),
    bathH: wall(0, 3.0, 2.0, 3.0),
  }
  const walls = Object.values(cw)

  const drr = (w, offset, width = 0.9, side = 1, hinge = 0) =>
    opening('door', w.id, offset, width, side, 'swing', hinge)
  const wn = (w, offset, width = 1.2, side = 1) =>
    opening('window', w.id, offset, width, side)

  const office = [
    alongWall('desk', cw.top, 4.5, 'N'),
    facing('office-chair', 4.5, 3.6, 4.5, 4.25, 'front'),
    alongWall('bookshelf', cw.bathV, 1.0, 'W'),
    alongWall('filing-cabinet', cw.top, 3.2, 'N'),
    place('armchair', 2.5, 1.8, 0),
    place('armchair', 4.1, 1.8, Math.PI),
    place('coffee-table', 3.3, 1.8, Math.PI / 2),
    centered('rug', room(2.3, 1.0, 2.0, 1.6)),
  ]

  const bathroom = [
    alongWall('toilet', cw.left, 3.5, 'W'),
    alongWall('vanity', cw.left, 4.4, 'W'),
  ]

  const kitchen = [
    alongWall('fridge', cw.bot, 5.5, 'S'),
    { ...alongWall('counter', cw.bot, 4.6, 'S'), width: 1.0 },
    alongWall('sink', cw.bot, 3.7, 'S'),
  ]

  const furniture = [...office, ...bathroom, ...kitchen]

  const openings = [
    drr(cw.left, 1.0, 0.9, -1),
    drr(cw.bathH, 1.0, 0.8, -1),
    wn(cw.top, 1.5, 1.2, -1),
    wn(cw.top, 4.5, 1.2, -1),
    wn(cw.right, 2.5, 1.2, 1),
  ]

  const floor = flr('Main', 0, walls, furniture, openings)
  return project('Home Office', [floor])
}
