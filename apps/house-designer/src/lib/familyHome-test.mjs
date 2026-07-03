import { uid, makeFloor } from './project.js'
import { makeFurniture } from './furniture/registry.js'
import { wall, opening, alongWall, centered, facing, row, spacedRow, room, WT, HT } from './sample-layout.js'

function w(x1, y1, x2, y2, t = 0.15) { return { id: uid('w'), x1, y1, x2, y2, thickness: t } }
function f(type, x, y, rot = 0)       { return { ...makeFurniture(type, x, y), id: uid('f'), rotation: rot } }
function door(wallId, offset, { width = 0.9, hinge = 0, side = 1 } = {}) {
  return { id: uid('o'), type: 'door', wallId, offset, width, height: 2.1, sill: 0, hinge, side }
}
function win(wallId, offset, width = 1.2) {
  return { id: uid('o'), type: 'window', wallId, offset, width, height: 1.1, sill: 0.9, hinge: 0, side: 1 }
}
function floor(name, level, walls, furniture, openings) {
  const fl = makeFloor(name, level)
  fl.walls = walls; fl.furniture = furniture; fl.openings = openings
  return fl
}
function project(name, floors) {
  return { version: 1, name, settings: { units: 'm', wallHeight: 2.7, wallThickness: 0.15, gridSize: 0.1 }, floors, activeFloorId: floors[0].id }
}

function familyHome() {
  // ── ground ──
  const gw = {
    bot: wall(0, 0, 9, 0), right: wall(9, 0, 9, 7), top: wall(9, 7, 0, 7), left: wall(0, 7, 0, 0),
    midV:  wall(5, 0, 5, 7),         // living | kitchen (west) / hall | dining (east)
    midHL: wall(0, 4.5, 5, 4.5),     // living | bath+hall
    midHR: wall(5, 4.5, 9, 4.5),     // kitchen | dining
    bathV: wall(2.5, 4.5, 2.5, 7),   // bathroom | hall
  }
  const gWalls = Object.values(gw)
  const gFurn = [
    // living (0→5, 0→4.5)
    alongWall('sofa', gw.left, 5.8, 'W'),
    alongWall('armchair', gw.midV, 3.0, 'E'),
    f('coffee-table', 1.8, 1.2),
    alongWall('tv-stand', gw.midHL, 2.5, 'N'),
    f('rug', 1.45, 1.2),
    alongWall('bookshelf', gw.bot, 1.0, 'S'),
    f('plant', 4.0, 4.0),
    // kitchen (5→9, 0→4.5)
    alongWall('fridge', gw.right, 0.45, 'E'),
    ...spacedRow(gw.bot, 5.4, [
      { type: 'stove' },
      { type: 'counter' },
      { type: 'sink' },
    ]),
    f('island', 7.0, 2.5),
    // dining (5→9, 4.5→7)
    centered('dining-table', { x: 5.8, y: 5.15, w: 2.4, h: 1.2 }, 0),
    facing('chair', 7.0, 6.375, 7.0, 5.7, 'front'),
    facing('chair', 7.0, 5.025, 7.0, 5.7, 'front'),
    facing('chair', 5.975, 5.7, 7.0, 5.7, 'front'),
    facing('chair', 8.025, 5.7, 7.0, 5.7, 'front'),
    // bathroom (0→2.5, 4.5→7)
    alongWall('toilet', gw.left, 1.6, 'W'),
    alongWall('vanity', gw.top, 1.8, 'N'),
    alongWall('shower', gw.left, 0.6, 'W'),
    // hall
    f('plant', 3.7, 6.5),
  ]
  const gOpen = [
    door(gw.bot.id, 3.0, { width: 1.0, side: 1 }),     // front door, swings into living (+y)
    door(gw.midV.id, 2.0, { side: 1 }),               // living → kitchen, swings east (+x)
    door(gw.midHL.id, 3.3, { side: 1 }),               // living → hall, swings north (+y)
    door(gw.bathV.id, 0.7, { width: 0.8, side: 1 }),  // hall → bathroom, swings west (-x)
    door(gw.midHR.id, 1.2, { width: 1.0, side: 1 }),  // kitchen → dining, swings north (+y)
    win(gw.left.id, 5.0, 1.4),                        // living left wall
    win(gw.bot.id, 2.0, 1.2),                         // living front
    win(gw.right.id, 1.8, 1.2),                       // kitchen right
    win(gw.bot.id, 7.0, 1.2),                         // kitchen front
    win(gw.right.id, 5.5, 1.0),                       // dining right
    win(gw.left.id, 1.5, 0.6),                        // bathroom left wall
  ]
  const ground = floor('Ground', 0, gWalls, gFurn, gOpen)

  // ── upper ──
  const uw = {
    bot: wall(0, 0, 9, 0), right: wall(9, 0, 9, 7), top: wall(9, 7, 0, 7), left: wall(0, 7, 0, 0),
    masterV: wall(5, 0, 5, 4),        // master | bed2
    corrTop: wall(0, 4, 9, 4),        // bedrooms | corridor
    corrBot: wall(0, 5, 9, 5),        // corridor | bed3+bath
    bathV:   wall(4.5, 5, 4.5, 7),    // bed3 | bathroom
  }
  const uWalls = Object.values(uw)
  const uFurn = [
    // master (0→5, 0→4)
    alongWall('bed-double', uw.left, 5.0, 'W'),
    alongWall('nightstand', uw.left, 5.8, 'W'),
    alongWall('nightstand', uw.left, 4.2, 'W'),
    alongWall('wardrobe', uw.masterV, 2.0, 'E'),
    f('plant', 0.5, 0.5),
    f('floor-lamp', 4.5, 0.5),
    // bed2 (5→9, 0→4)
    alongWall('bed-double', uw.bot, 7.0, 'S'),
    alongWall('nightstand', uw.bot, 6.0, 'S'),
    alongWall('nightstand', uw.bot, 8.0, 'S'),
    alongWall('wardrobe', uw.right, 2.0, 'E'),
    alongWall('desk', uw.corrTop, 7.5, 'N'),
    facing('office-chair', 7.5, 2.9, 7.5, 3.575, 'front'),
    // bed3 (0→4.5, 5→7)
    alongWall('bed-single', uw.left, 1.0, 'W'),
    alongWall('nightstand', uw.left, 1.45, 'W'),
    alongWall('desk', uw.corrBot, 2.5, 'S'),
    // upper bathroom (4.5→9, 5→7)
    alongWall('toilet', uw.corrBot, 5.0, 'S'),
    alongWall('vanity', uw.corrBot, 6.2, 'S'),
    alongWall('bathtub', uw.right, 6.0, 'E'),
    alongWall('shower', uw.top, 5.0, 'N'),
  ]
  const uOpen = [
    door(uw.corrTop.id, 2.5, { side: 1 }),   // master → corridor, swings north (+y)
    door(uw.corrTop.id, 5.5, { side: 1 }),   // bed2 → corridor, swings north (+y)
    door(uw.corrBot.id, 2.0, { side: -1 }),  // bed3 → corridor, swings south (-y)
    door(uw.corrBot.id, 6.5, { side: -1 }),  // bathroom → corridor, swings south (-y)
    win(uw.bot.id, 2.5, 1.4),                // master front
    win(uw.bot.id, 7.0, 1.2),                // bed2 front
    win(uw.right.id, 2.0, 1.0),              // bed2 right
    win(uw.left.id, 1.5, 1.0),               // bed3 left wall
    win(uw.right.id, 6.0, 0.9),              // bathroom right
  ]
  const upper = floor('Upper', 3.0, uWalls, uFurn, uOpen)

  return project('Family Home', [ground, upper])
}

import { lintProject } from './layout-linter.js'
const issues = lintProject(familyHome())
console.log(JSON.stringify(issues, null, 2))
console.log('count', issues.length)
