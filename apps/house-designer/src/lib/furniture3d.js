import * as THREE from 'three'
import { shade } from './color.js'
import { makeWoodTexture, makeFabricTexture } from './textures.js'

// Composed 3D representations for furniture, built in the item's LOCAL frame:
// x in [-w/2, w/2], z in [-d/2, d/2], y in [0, h] (bottom on the floor at y=0).
// The caller positions the returned group at (f.x, 0, f.y) and rotates it.
// Each piece is assembled from a few boxes/cylinders/spheres so it reads as
// the object (sofa = base + backrest + arms; bed = frame + mattress + pillows
// + headboard; toilet = tank + bowl; etc.) instead of an anonymous box.

// Material finishes: `finish` picks a texture/roughness preset so pieces read
// as their material, not just their color.
//   wood    — plank texture, matte
//   fabric  — speckle texture, very matte (upholstery)
//   ceramic — smooth, slightly glossy (bathroom fixtures)
//   metal   — reflective accents (handles, columns)
export function buildFurniture3D(type, w, d, h, color) {
  const mat = (c, { rough = 0.82, metal = 0.05, opacity = 1, finish = null } = {}) => {
    const params = {
      color: new THREE.Color(c), roughness: rough, metalness: metal,
      transparent: opacity < 1, opacity,
    }
    if (finish === 'wood') { params.map = makeWoodTexture(c); params.color = new THREE.Color('#ffffff'); params.roughness = 0.72 }
    else if (finish === 'fabric') { params.map = makeFabricTexture(c); params.color = new THREE.Color('#ffffff'); params.roughness = 0.96 }
    else if (finish === 'ceramic') { params.roughness = 0.25; params.metalness = 0 }
    else if (finish === 'metal') { params.roughness = 0.35; params.metalness = 0.6 }
    return new THREE.MeshStandardMaterial(params)
  }
  const g = new THREE.Group()
  const dark = shade(color, 0.7)
  const light = shade(color, 1.22)
  const wood = shade('#6b4e3d', 0.95)
  const leaf = shade('#4a7c4a', 1)

  const add = (m, x, y, z) => {
    m.position.set(x, y, z)
    m.castShadow = true
    m.receiveShadow = true
    g.add(m)
    return m
  }
  const box = (bw, bh, bd, x, y, z, c, opts) =>
    add(new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), mat(c, opts)), x, y, z)
  const cyl = (r, ch, x, y, z, c, opts) =>
    add(new THREE.Mesh(new THREE.CylinderGeometry(r, r, ch, 20), mat(c, opts)), x, y, z)
  const sph = (r, x, y, z, c, opts) =>
    add(new THREE.Mesh(new THREE.SphereGeometry(r, 18, 14), mat(c, opts)), x, y, z)

  switch (type) {
    case 'sofa':
    case 'armchair': {
      box(w, h * 0.4, d * 0.85, 0, h * 0.2, d * 0.05, color, { finish: 'fabric' })
      box(w, h * 0.6, d * 0.22, 0, h * 0.7, -d / 2 + d * 0.11, dark, { finish: 'fabric' })
      box(w * 0.1, h * 0.55, d * 0.85, -(w / 2 - w * 0.05), h * 0.275, d * 0.05, shade(color, 0.85), { finish: 'fabric' })
      box(w * 0.1, h * 0.55, d * 0.85, (w / 2 - w * 0.05), h * 0.275, d * 0.05, shade(color, 0.85), { finish: 'fabric' })
      box(w * 0.84, h * 0.12, d * 0.66, 0, h * 0.46, d * 0.08, light, { finish: 'fabric' })
      break
    }
    case 'coffee-table':
    case 'dining-table':
    case 'desk': {
      box(w, h * 0.08, d, 0, h - h * 0.04, 0, color, { finish: 'wood' })
      for (const sx of [-1, 1]) for (const sz of [-1, 1])
        box(w * 0.08, h * 0.92, d * 0.08, sx * (w / 2 - w * 0.06), h * 0.46, sz * (d / 2 - d * 0.06), dark, { finish: 'wood' })
      break
    }
    case 'chair': {
      box(w * 0.95, h * 0.08, d * 0.95, 0, h * 0.5, 0, color)
      box(w * 0.9, h * 0.5, d * 0.08, 0, h * 0.75, -d / 2 + d * 0.04, dark)
      for (const sx of [-1, 1]) for (const sz of [-1, 1])
        box(w * 0.08, h * 0.5, d * 0.08, sx * (w / 2 - w * 0.06), h * 0.25, sz * (d / 2 - d * 0.06), dark)
      break
    }
    case 'office-chair': {
      box(w * 0.9, h * 0.1, d * 0.9, 0, h * 0.5, 0, color)
      box(w * 0.8, h * 0.45, d * 0.08, 0, h * 0.78, -d / 2 + d * 0.04, dark)
      cyl(w * 0.05, h * 0.45, 0, h * 0.27, 0, dark, { finish: 'metal' })
      box(w * 0.85, h * 0.06, d * 0.85, 0, h * 0.03, 0, dark)
      break
    }
    case 'bed-double':
    case 'bed-single': {
      const pillows = type === 'bed-double' ? 2 : 1
      const pw = type === 'bed-double' ? w * 0.4 : w * 0.55
      box(w, h * 0.3, d, 0, h * 0.15, 0, shade(color, 0.6), { finish: 'wood' })           // frame
      box(w * 0.96, h * 0.45, d * 0.94, 0, h * 0.45, 0, color, { finish: 'fabric' })        // mattress
      box(w, h * 1.5, d * 0.1, 0, h * 0.75, -d / 2 + d * 0.05, shade(color, 0.5), { finish: 'wood' }) // headboard
      const py = h * 0.675 + h * 0.1
      for (let i = 0; i < pillows; i++) {
        const x = pillows === 1 ? 0 : (i === 0 ? -w * 0.22 : w * 0.22)
        box(pw, h * 0.2, d * 0.18, x, py, -d / 2 + d * 0.16, light, { finish: 'fabric' })
      }
      break
    }
    case 'nightstand':
    case 'wardrobe':
    case 'dresser':
    case 'bookshelf': {
      box(w, h, d, 0, h / 2, 0, color, { finish: 'wood' })
      break
    }
    case 'filing-cabinet':
    case 'counter':
    case 'island': {
      box(w, h, d, 0, h / 2, 0, color)
      break
    }
    case 'tv-stand': {
      box(w, h, d, 0, h / 2, 0, color, { finish: 'wood' })
      box(w * 0.5, h * 0.55, d * 0.05, 0, h + h * 0.28, -d / 2 + d * 0.08, dark) // TV slab
      break
    }
    case 'sink':
    case 'vanity': {
      box(w, h * 0.85, d, 0, h * 0.425, 0, color)                    // cabinet
      box(w * 0.7, h * 0.12, d * 0.6, 0, h * 0.92, 0, light, { finish: 'ceramic' })         // basin
      box(w * 0.05, h * 0.22, d * 0.05, 0, h * 1.02, -d / 2 + d * 0.12, dark, { finish: 'metal' }) // faucet
      break
    }
    case 'stove': {
      box(w, h, d, 0, h / 2, 0, color)
      for (const sx of [-1, 1]) for (const sz of [-1, 1])
        cyl(Math.min(w, d) * 0.1, h * 0.04, sx * w * 0.22, h + h * 0.02, sz * d * 0.22, dark)
      break
    }
    case 'fridge': {
      box(w, h, d, 0, h / 2, 0, color)
      box(w * 0.98, h * 0.04, d * 0.98, 0, h * 0.7, 0, light)        // freezer seam
      box(w * 0.04, h * 0.5, d * 0.04, w / 2, h * 0.5, 0, dark, { finish: 'metal' })      // handle
      break
    }
    case 'toilet': {
      box(w * 0.9, h * 0.5, d * 0.3, 0, h * 0.75, -d / 2 + d * 0.15, color, { finish: 'ceramic' }) // tank
      cyl(w * 0.42, h * 0.45, 0, h * 0.225, d * 0.12, light, { finish: 'ceramic' })                // bowl
      break
    }
    case 'bathtub': {
      box(w, h, d, 0, h / 2, 0, color, { finish: 'ceramic' })
      box(w * 0.86, h * 0.4, d * 0.8, 0, h * 0.8, 0, light)          // water surface
      break
    }
    case 'shower': {
      box(w, h * 0.08, d, 0, h * 0.04, 0, light)                     // base
      for (const sx of [-1, 1]) for (const sz of [-1, 1])
        box(w * 0.04, h * 0.92, d * 0.04, sx * (w / 2 - w * 0.02), h * 0.5, sz * (d / 2 - d * 0.02), light,
          { opacity: 0.35, rough: 0.1 })                              // glass posts
      break
    }
    case 'plant': {
      cyl(w * 0.4, h * 0.3, 0, h * 0.15, 0, wood)                    // pot
      sph(w * 0.45, 0, h * 0.7, 0, leaf)                             // foliage
      break
    }
    case 'tree': {
      cyl(w * 0.12, h * 0.4, 0, h * 0.2, 0, wood)                    // trunk
      sph(w * 0.45, 0, h * 0.7, 0, leaf)                            // canopy
      break
    }
    case 'rug': {
      box(w, Math.max(0.02, h), d, 0, Math.max(0.02, h) / 2, 0, color, { finish: 'fabric' })
      break
    }
    default: {
      box(w, h, d, 0, h / 2, 0, color)
    }
  }
  return g
}