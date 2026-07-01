import { uid, makeFloor } from './project.js'
import { makeFurniture } from './furniture.js'

// A small demo so the app feels alive on first open and exercises multi-floor +
// doors/windows. Ground = studio apartment; Upper = a bedroom stacked at 3 m.
export function sampleProject() {
  const w = (x1, y1, x2, y2, t = 0.15) => ({ id: uid('w'), x1, y1, x2, y2, thickness: t })
  const f = (type, x, y, rot) => ({ ...makeFurniture(type, x, y), id: uid('f'), rotation: rot })

  // ---- Ground floor: 6.0 x 5.0 studio ----
  const gWalls = [
    w(0, 0, 6, 0),       // bottom
    w(6, 0, 6, 5),       // right
    w(6, 5, 0, 5),       // top
    w(0, 5, 0, 2.1),     // left lower (door gap)
    w(0, 1.5, 0, 0),     // left upper
    w(2.2, 0, 2.2, 2.6), // partition (kitchen/living)
    w(2.2, 2.6, 0, 2.6), // partition top
  ]
  const gFurniture = [
    f('sofa', 4.2, 1.0, 0),
    f('coffee-table', 4.2, 2.0, 0),
    f('tv-stand', 5.7, 2.4, Math.PI / 2),
    f('rug', 4.2, 1.6, 0),
    f('dining-table', 1.0, 3.8, 0),
    f('chair', 1.0, 3.0, 0),
    f('chair', 1.0, 4.6, 0),
    f('fridge', 0.4, 0.4, 0),
    f('counter', 1.5, 0.3, 0),
    f('stove', 0.8, 0.3, 0),
    f('bed-double', 1.0, 1.3, 0),
    f('nightstand', 2.1, 1.2, 0),
    f('plant', 5.5, 0.5, 0),
  ]
  const gOpenings = [
    { id: uid('o'), type: 'door', wallId: gWalls[0].id, offset: 0.9, width: 0.9, height: 2.1, sill: 0, hinge: 0, side: 1 },
    { id: uid('o'), type: 'window', wallId: gWalls[2].id, offset: 3.0, width: 1.4, height: 1.2, sill: 1.0, hinge: 0, side: 1 },
    { id: uid('o'), type: 'window', wallId: gWalls[1].id, offset: 2.5, width: 1.2, height: 1.2, sill: 1.0, hinge: 0, side: 1 },
  ]
  const ground = makeFloor('Ground', 0)
  ground.walls = gWalls
  ground.furniture = gFurniture
  ground.openings = gOpenings

  // ---- Upper floor: 4.0 x 4.0 bedroom at level 3.0 m ----
  const uWalls = [
    w(0, 0, 4, 0),  // bottom
    w(4, 0, 4, 4),  // right
    w(4, 4, 0, 4),  // top
    w(0, 4, 0, 0),  // left
  ]
  const uFurniture = [
    f('bed-double', 1.4, 1.2, 0),
    f('nightstand', 2.7, 1.1, 0),
    f('plant', 3.4, 3.4, 0),
  ]
  const uOpenings = [
    { id: uid('o'), type: 'door', wallId: uWalls[0].id, offset: 0.9, width: 0.9, height: 2.1, sill: 0, hinge: 1, side: -1 },
    { id: uid('o'), type: 'window', wallId: uWalls[1].id, offset: 2.0, width: 1.2, height: 1.2, sill: 1.0, hinge: 0, side: 1 },
  ]
  const upper = makeFloor('Upper', 3.0)
  upper.walls = uWalls
  upper.furniture = uFurniture
  upper.openings = uOpenings

  return {
    version: 1,
    name: 'Studio + Bedroom',
    settings: { wallHeight: 2.7, wallThickness: 0.15 },
    floors: [ground, upper],
    activeFloorId: ground.id,
  }
}