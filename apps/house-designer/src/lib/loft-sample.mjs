import { uid, makeFloor } from './project.js'
import {
  wall, place, alongWall, centered, facing, room, door, opening
} from './sample-layout.js'
import { lintProject } from './layout-linter.js'

function flr(name, level, walls, furniture, openings) {
  const fl = makeFloor(name, level)
  fl.walls = walls
  fl.furniture = furniture
  fl.openings = openings
  return fl
}

function project(name, floors) {
  return {
    version: 1,
    name,
    settings: { units: 'm', wallHeight: 2.7, wallThickness: 0.15, gridSize: 0.1 },
    floors,
    activeFloorId: floors[0].id,
  }
}

export function openLoft() {
  // 12 x 9 m open-plan loft. One enclosed bathroom; everything else flows.
  const W = 12
  const D = 9
  const bw = 2.4 // bathroom width
  const bd = 2.2 // bathroom depth

  // Walls defined min-first.
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

  // --- sleeping area (north wall, clear of bathroom) ---
  const sleep = [
    alongWall('bed-double', shell.top, 6.5, 'N'),
    alongWall('nightstand', shell.top, 5.2, 'N'),
    alongWall('nightstand', shell.top, 7.8, 'N'),
    alongWall('wardrobe', shell.left, 7.5, 'W'),
  ]

  // --- living area (south, away from bathroom) ---
  const living = [
    alongWall('sofa', shell.bot, 7.5, 'S'),
    centered('coffee-table', room(6.95, 1.3, 1.1, 0.6)),
    place('tv-stand', 9.5, 3.0, Math.PI),
    centered('rug', room(6.3, 0.4, 2.4, 1.6)),
    centered('floor-lamp', room(9.0, 1.0, 0.4, 0.4)),
  ]

  // --- dining area (center-left) ---
  const dining = [
    centered('dining-table', room(4.2, 4.05, 1.6, 0.9)),
    facing('chair', 3.5, 4.5, 5.0, 4.5, 'front'),
    facing('chair', 6.5, 4.5, 5.0, 4.5, 'front'),
    facing('chair', 5.0, 5.6, 5.0, 4.5, 'back'),
    facing('chair', 5.0, 3.4, 5.0, 4.5, 'back'),
  ]

  // --- kitchen (east wall) ---
  const kitchen = [
    alongWall('fridge', shell.right, 7.5, 'E'),
    alongWall('counter', shell.right, 5.5, 'E'),
    alongWall('sink', shell.right, 4.0, 'E'),
    alongWall('stove', shell.right, 3.0, 'E'),
    centered('island', room(8.6, 4.55, 1.8, 0.9)),
  ]

  // --- bathroom fixtures ---
  const bathroom = [
    alongWall('toilet', bath.right, 0.5, 'E'),
    alongWall('vanity', bath.top, 0.6, 'N'),
    alongWall('shower', shell.left, 0.9, 'W'),
  ]

  // --- a little greenery in the open space ---
  const decor = [
    place('plant', 3.5, 6.5),
  ]

  const furniture = [...sleep, ...living, ...dining, ...kitchen, ...bathroom, ...decor]

  // Helper so windows pass the structural validator (side must be 1 or -1).
  const win = (w, along, width = 1.2) => opening('window', w.id, along - width / 2, width, 1)

  const openings = [
    door(shell.bot, 10.0, 0.9, '+y'),     // main entrance
    door(bath.top, 1.5, 0.8, '+y'),       // bathroom, swings into loft
    win(shell.bot, 5.0, 2.0),             // large loft window front
    win(shell.top, 7.0, 2.0),             // bedroom window
    win(shell.left, 5.0, 1.5),            // side window
    win(shell.right, 7.5, 1.2),           // kitchen window
  ]

  const floor = flr('Main', 0, walls, furniture, openings)
  return project('Open Loft', [floor])
}

const issues = lintProject(openLoft())
console.log('openLoft lint issues:', issues.length)
if (issues.length) {
  console.log(JSON.stringify(issues, null, 2))
}
