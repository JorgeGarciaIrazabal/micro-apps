import { lintProject } from './apps/house-designer/src/lib/layout-linter.js'
import { makeFloor } from './apps/house-designer/src/lib/project.js'
import { wall, alongWall, centered, window, door, room, WT, HT } from './apps/house-designer/src/lib/sample-layout.js'

function floor(name, level, walls, furniture, openings) {
  const fl = makeFloor(name, level)
  fl.walls = walls; fl.furniture = furniture; fl.openings = openings
  return fl
}
function project(name, floors) {
  return { version: 1, name, settings: { units: 'm', wallHeight: 2.7, wallThickness: 0.15, gridSize: 0.1 }, floors, activeFloorId: floors[0].id }
}

function tinyCabin(openBath = false) {
  const cw = {
    bot:   wall(0, 0, 6.5, 0),
    right: wall(6.5, 0, 6.5, 5.5),
    top:   wall(6.5, 5.5, 0, 5.5),
    left:  wall(0, 5.5, 0, 0),
    bathV: wall(4.5, 0, 4.5, 3.2),
    midH:  wall(0, 3.2, 4.5, 3.2),
  }
  if (!openBath) cw.bathTop = wall(4.5, 3.2, 6.5, 3.2)
  const walls = Object.values(cw)

  const furn = [
    // kitchen run along left wall (W) and bottom wall
    alongWall('fridge', cw.left, 0.35, 'W'),
    alongWall('stove', cw.left, 0.875, 'W'),
    alongWall('sink', cw.left, 1.65, 'W'),
    alongWall('counter', cw.bot, 3.45, 'S'),

    // living
    alongWall('sofa', cw.left, 2.55, 'W'),
    alongWall('tv-stand', cw.midH, 3.5, 'N'),
    centered('coffee-table', { x: 1.425, y: 2.1, w: 0.6, h: 0.6 }),
    alongWall('plant', cw.bot, 1.075, 'S'),

    // bedroom
    alongWall('bed-double', cw.top, 3.25, 'N'),
    alongWall('nightstand', cw.top, 2.4, 'N'),
    alongWall('nightstand', cw.top, 4.1, 'N'),
    alongWall('wardrobe', cw.right, 4.35, 'E'),
    alongWall('plant', cw.left, 5.1, 'W'),
    alongWall('floor-lamp', cw.top, 5.5, 'N'),

    // bathroom
    alongWall('toilet', cw.bot, 5.2, 'S'),
    alongWall('vanity', cw.right, 0.45, 'E'),
    alongWall('shower', cw.right, 2.7, 'E'),
  ]

  const openings = [
    door(cw.bot, 2.0, 0.9, '+y'),
    door(cw.bathV, 2.0, 0.8, '+x'),
    door(cw.midH, 2.0, 0.9, '+y'),
    window(cw.bot, 1.3, 1.0),
    window(cw.left, 4.45, 0.9),
    window(cw.top, 3.7, 1.4),
    window(cw.right, 1.75, 0.5),
  ]

  const fl = floor('Main', 0, walls, furn, openings)
  return project('Tiny Cabin', [fl])
}

for (const openBath of [true, false]) {
  const proj = tinyCabin(openBath)
  const issues = lintProject(proj)
  console.log('\n--- openBath:', openBath, 'issues:', issues.length, '---')
  for (const issue of issues.slice(0, 20)) {
    console.log(issue.rule, issue.message)
  }
}
