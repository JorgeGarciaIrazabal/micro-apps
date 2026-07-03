import { lintProject } from './layout-linter.js'
import { modernApartment } from './modern-sample.mjs'

const p = modernApartment()
const issues = lintProject(p)
for (const i of issues) {
  if (i.rule === 'door-swing-blocked') {
    console.log(i.message)
    const door = i.element
    const floor = i.floor
    const furnId = i.message.match(/\(([^(]+)\)$/)?.[1]
    const furn = floor.furniture.find(f => f.id === furnId)
    console.log('door', JSON.stringify(door, null, 2))
    console.log('furn', JSON.stringify(furn, null, 2))
  }
}
