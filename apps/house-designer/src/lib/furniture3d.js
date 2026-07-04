import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { shade } from './color.js'
import { makeWoodTexture, makeFabricTexture } from './textures.js'
import { defFor } from './furniture/registry.js'

// Composed 3D representations for furniture, built in the item's LOCAL frame:
// x in [-w/2, w/2], z in [-d/2, d/2], y in [0, h] (bottom on the floor at y=0).
// The caller positions the returned group at (f.x, 0, f.y) and rotates it.
// Each piece is assembled from a few boxes/cylinders/spheres so it reads as
// the object (sofa = base + backrest + arms; bed = frame + mattress + pillows
// + headboard; toilet = tank + bowl; etc.) instead of an anonymous box.

// Material finishes: `finish` picks a texture/roughness preset so pieces read
// as their material, not just their color.
//   wood    — plank texture, satin varnish (light clearcoat)
//   fabric  — speckle texture, very matte with sheen (upholstery)
//   ceramic — clearcoated gloss (bathroom fixtures)
//   metal   — reflective accents (handles, columns)
export function buildFurniture3D(type, w, d, h, color) {
  const mat = (c, { rough = 0.82, metal = 0.05, opacity = 1, finish = null, emissive = null, emissiveIntensity = 0.6 } = {}) => {
    const params = {
      color: new THREE.Color(c), roughness: rough, metalness: metal,
      transparent: opacity < 1, opacity,
    }
    if (finish === 'wood') {
      params.map = makeWoodTexture(c); params.color = new THREE.Color('#ffffff')
      params.roughness = 0.58; params.clearcoat = 0.28; params.clearcoatRoughness = 0.45
    } else if (finish === 'fabric') {
      params.map = makeFabricTexture(c); params.color = new THREE.Color('#ffffff')
      params.roughness = 0.96; params.sheen = 0.55; params.sheenRoughness = 0.75
      params.sheenColor = new THREE.Color(shade(c, 1.35))
    } else if (finish === 'ceramic') {
      params.roughness = 0.14; params.metalness = 0; params.clearcoat = 1; params.clearcoatRoughness = 0.08
    } else if (finish === 'metal') {
      params.roughness = 0.28; params.metalness = 0.8
    }
    if (emissive) { params.emissive = new THREE.Color(emissive); params.emissiveIntensity = emissiveIntensity }
    return new THREE.MeshPhysicalMaterial(params)
  }
  const flatMat = (c, opts) => {
    const m = mat(c, opts)
    m.flatShading = true
    return m
  }
  const g = new THREE.Group()
  const dark = shade(color, 0.7)
  const light = shade(color, 1.22)
  const wood = shade('#6b4e3d', 0.95)
  const leaf = shade('#4a7c4a', 1)

  const add = (m, x, y, z) => {
    m.position.set(x, y, z)
    m.castShadow = !m.material.transparent // glass/water shouldn't cast box shadows
    m.receiveShadow = true
    g.add(m)
    return m
  }
  // Bevel any box thick enough to show it — sharp digital corners read as
  // fake, while a small rounded edge catches realistic light glints.
  const boxGeo = (bw, bh, bd) => {
    const t = Math.min(bw, bh, bd)
    if (t < 0.06) return new THREE.BoxGeometry(bw, bh, bd)
    return new RoundedBoxGeometry(bw, bh, bd, 2, Math.min(0.03, t * 0.22))
  }
  const box = (bw, bh, bd, x, y, z, c, opts) =>
    add(new THREE.Mesh(boxGeo(bw, bh, bd), mat(c, opts)), x, y, z)
  const cyl = (r, ch, x, y, z, c, opts) =>
    add(new THREE.Mesh(new THREE.CylinderGeometry(r, r, ch, 20), mat(c, opts)), x, y, z)
  const sph = (r, x, y, z, c, opts) =>
    add(new THREE.Mesh(new THREE.SphereGeometry(r, 18, 14), mat(c, opts)), x, y, z)
  // Tapered cylinder (different top/bottom radii) — pots, trunks, pedestals.
  const tcyl = (rt, rb, ch, x, y, z, c, opts) =>
    add(new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, ch, 24), mat(c, opts)), x, y, z)
  // Ellipsoid given full extents — bowls, lids, leaves.
  const ell = (ew, eh, ed, x, y, z, c, opts) => {
    const m = add(new THREE.Mesh(new THREE.SphereGeometry(0.5, 24, 16), mat(c, opts)), x, y, z)
    m.scale.set(ew, eh, ed)
    return m
  }
  // Flat-shaded icosahedron — low-poly foliage that reads stylized, not blobby.
  const blob = (r, x, y, z, c) =>
    add(new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), flatMat(c, { rough: 0.9 })), x, y, z)
  // Squashed sphere so cushions read as stuffed, not as bricks.
  const pillow = (pw, ph, pd, x, y, z, c) => {
    const m = add(new THREE.Mesh(new THREE.SphereGeometry(0.5, 20, 14), mat(c, { finish: 'fabric' })), x, y, z)
    m.scale.set(pw, ph, pd)
    return m
  }

  switch (defFor(type).model) {
    case 'seat': {
      box(w, h * 0.4, d * 0.85, 0, h * 0.2, d * 0.05, color, { finish: 'fabric' })
      box(w, h * 0.6, d * 0.22, 0, h * 0.7, -d / 2 + d * 0.11, dark, { finish: 'fabric' })
      box(w * 0.1, h * 0.55, d * 0.85, -(w / 2 - w * 0.05), h * 0.275, d * 0.05, shade(color, 0.85), { finish: 'fabric' })
      box(w * 0.1, h * 0.55, d * 0.85, (w / 2 - w * 0.05), h * 0.275, d * 0.05, shade(color, 0.85), { finish: 'fabric' })
      box(w * 0.84, h * 0.12, d * 0.66, 0, h * 0.46, d * 0.08, light, { finish: 'fabric' })
      if (type === 'sofa') {
        // throw pillows leaning against the backrest
        for (const sx of w > 1.4 ? [-1, 1] : [1]) {
          const p = pillow(w * 0.2, h * 0.26, d * 0.14, sx * w * 0.26, h * 0.58, -d / 2 + d * 0.3, shade(color, 1.35))
          p.rotation.x = -0.35
        }
      }
      break
    }
    case 'table': {
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
    case 'bed': {
      const pillows = type === 'bed-double' ? 2 : 1
      const pw = type === 'bed-double' ? w * 0.4 : w * 0.55
      box(w, h * 0.3, d, 0, h * 0.15, 0, shade(color, 0.6), { finish: 'wood' })           // frame
      box(w * 0.96, h * 0.45, d * 0.94, 0, h * 0.45, 0, color, { finish: 'fabric' })        // mattress
      box(w, h * 1.5, d * 0.1, 0, h * 0.75, -d / 2 + d * 0.05, shade(color, 0.5), { finish: 'wood' }) // headboard
      box(w * 0.98, h * 0.16, d * 0.55, 0, h * 0.68, d * 0.19, shade(color, 1.12), { finish: 'fabric' }) // duvet
      const py = h * 0.675 + h * 0.1
      for (let i = 0; i < pillows; i++) {
        const x = pillows === 1 ? 0 : (i === 0 ? -w * 0.22 : w * 0.22)
        pillow(pw, h * 0.28, d * 0.17, x, py, -d / 2 + d * 0.16, light)
      }
      break
    }
    case 'wood-box': {
      box(w, h, d, 0, h / 2, 0, color, { finish: 'wood' })
      break
    }
    case 'plain-box': {
      box(w, h, d, 0, h / 2, 0, color)
      break
    }
    case 'tv-stand': {
      box(w, h, d, 0, h / 2, 0, color, { finish: 'wood' })
      box(w * 0.5, h * 0.55, d * 0.05, 0, h + h * 0.28, -d / 2 + d * 0.08, dark) // TV slab
      break
    }
    case 'washstand': {
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
      // cistern against the wall (-z), with lid slab and flush button
      box(w * 0.92, h * 0.4, d * 0.22, 0, h * 0.55, -d / 2 + d * 0.11, color, { finish: 'ceramic' })
      box(w * 0.98, h * 0.06, d * 0.26, 0, h * 0.78, -d / 2 + d * 0.11, light, { finish: 'ceramic' })
      cyl(w * 0.09, h * 0.015, 0, h * 0.815, -d / 2 + d * 0.11, '#c8ccd0', { finish: 'metal' })
      // tapered pedestal foot rising into the bowl
      const ped = tcyl(0.5, 0.32, 1, 0, h * 0.19, d * 0.04, color, { finish: 'ceramic' })
      ped.scale.set(w * 0.6, h * 0.38, d * 0.52)
      // oval bowl + closed seat lid
      ell(w * 0.96, h * 0.22, d * 0.72, 0, h * 0.42, d * 0.1, color, { finish: 'ceramic' })
      ell(w * 1.0, h * 0.08, d * 0.76, 0, h * 0.51, d * 0.1, light, { finish: 'ceramic' })
      break
    }
    case 'bathtub': {
      // rounded-rect shell with a real cavity (extruded ring), lying on the floor
      const t = Math.min(w, d) * 0.13                                // wall thickness
      const rad = Math.min(w, d) * 0.22                              // corner radius
      const rr = (hw, hd, cr) => {
        const s = new THREE.Shape()
        s.moveTo(-hw + cr, -hd)
        s.lineTo(hw - cr, -hd); s.absarc(hw - cr, -hd + cr, cr, -Math.PI / 2, 0)
        s.lineTo(hw, hd - cr); s.absarc(hw - cr, hd - cr, cr, 0, Math.PI / 2)
        s.lineTo(-hw + cr, hd); s.absarc(-hw + cr, hd - cr, cr, Math.PI / 2, Math.PI)
        s.lineTo(-hw, -hd + cr); s.absarc(-hw + cr, -hd + cr, cr, Math.PI, Math.PI * 1.5)
        return s
      }
      const outline = rr(w / 2, d / 2, rad)
      outline.holes.push(rr(w / 2 - t, d / 2 - t, Math.max(0.02, rad - t)))
      const shellGeo = new THREE.ExtrudeGeometry(outline, {
        depth: h, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.012, bevelSegments: 2, curveSegments: 20,
      })
      const shell = add(new THREE.Mesh(shellGeo, mat(color, { finish: 'ceramic' })), 0, 0, 0)
      shell.rotation.x = -Math.PI / 2
      box(w - 2 * t, 0.05, d - 2 * t, 0, 0.025, 0, color, { finish: 'ceramic' })                  // tub floor
      box(w - 2.4 * t, 0.025, d - 2.4 * t, 0, h * 0.62, 0, '#7fb4d8', { opacity: 0.65, rough: 0.05 }) // water
      // chrome filler + spout on one end of the rim
      cyl(0.018, 0.16, w / 2 - t * 0.9, h + 0.07, 0, '#c8ccd0', { finish: 'metal' })
      box(0.14, 0.026, 0.026, w / 2 - t * 0.9 - 0.07, h + 0.14, 0, '#c8ccd0', { finish: 'metal' })
      break
    }
    case 'shower': {
      const chrome = '#c2cad1'
      const glass = { opacity: 0.18, rough: 0.05 }
      // ceramic tray with recessed inner surface + drain
      box(w, 0.09, d, 0, 0.045, 0, light, { finish: 'ceramic' })
      box(w * 0.84, 0.02, d * 0.84, 0, 0.095, 0, shade(color, 1.08), { finish: 'ceramic' })
      cyl(Math.min(w, d) * 0.05, 0.012, 0, 0.108, 0, '#9aa2a8', { finish: 'metal' })
      // glass cubicle: four panels, chrome corner posts + top rails
      const gh = h * 0.88
      const gy = 0.09 + gh / 2
      box(w - 0.06, gh, 0.014, 0, gy, d / 2 - 0.02, '#cfe6f2', glass)
      box(w - 0.06, gh, 0.014, 0, gy, -d / 2 + 0.02, '#cfe6f2', glass)
      box(0.014, gh, d - 0.06, -w / 2 + 0.02, gy, 0, '#cfe6f2', glass)
      box(0.014, gh, d - 0.06, w / 2 - 0.02, gy, 0, '#cfe6f2', glass)
      for (const sx of [-1, 1]) for (const sz of [-1, 1])
        box(0.032, gh, 0.032, sx * (w / 2 - 0.02), gy, sz * (d / 2 - 0.02), chrome, { finish: 'metal' })
      box(w, 0.03, 0.03, 0, 0.09 + gh, d / 2 - 0.02, chrome, { finish: 'metal' })
      box(w, 0.03, 0.03, 0, 0.09 + gh, -d / 2 + 0.02, chrome, { finish: 'metal' })
      box(0.03, 0.03, d, -w / 2 + 0.02, 0.09 + gh, 0, chrome, { finish: 'metal' })
      box(0.03, 0.03, d, w / 2 - 0.02, 0.09 + gh, 0, chrome, { finish: 'metal' })
      // door handle bar on the front (+z) panel
      box(0.02, 0.34, 0.02, w * 0.3, h * 0.5, d / 2 + 0.012, chrome, { finish: 'metal' })
      // shower column in the back corner: riser, arm, head + hand control
      cyl(0.015, h * 0.72, -w / 2 + 0.1, h * 0.45, -d / 2 + 0.1, chrome, { finish: 'metal' })
      box(0.24, 0.02, 0.02, -w / 2 + 0.21, h * 0.81, -d / 2 + 0.1, chrome, { finish: 'metal' })
      cyl(0.085, 0.02, -w / 2 + 0.32, h * 0.8, -d / 2 + 0.1, chrome, { finish: 'metal' })
      cyl(0.03, 0.015, -w / 2 + 0.1, h * 0.38, -d / 2 + 0.1, chrome, { finish: 'metal' })
      break
    }
    case 'plant': {
      // tapered terracotta pot with a lip, soil, and a fan of long leaves
      const terra = '#a8664a'
      tcyl(w * 0.3, w * 0.22, h * 0.26, 0, h * 0.13, 0, terra, { rough: 0.75 })
      tcyl(w * 0.34, w * 0.32, h * 0.05, 0, h * 0.275, 0, shade(terra, 1.1), { rough: 0.75 })
      cyl(w * 0.28, h * 0.02, 0, h * 0.3, 0, '#3d2c1e', { rough: 1 })
      const nLeaves = 9
      for (let i = 0; i < nLeaves; i++) {
        const a = (i / nLeaves) * Math.PI * 2 + (i % 2) * 0.35
        const tilt = i < 3 ? 0.16 : 0.4 + (i % 3) * 0.17          // inner ring upright, outer fanned
        const len = h * (0.62 - (i % 3) * 0.07)
        const m = ell(w * 0.17, len, w * 0.05, 0, 0, 0, shade(leaf, 0.9 + (i % 4) * 0.08))
        m.rotation.order = 'YXZ'
        m.rotation.y = a
        m.rotation.x = tilt
        m.position.set(
          Math.sin(a) * Math.sin(tilt) * len * 0.5,
          h * 0.3 + Math.cos(tilt) * len * 0.42,
          Math.cos(a) * Math.sin(tilt) * len * 0.5,
        )
      }
      break
    }
    case 'tree': {
      // tapered trunk + layered low-poly canopy (reads stylized, not lollipop)
      tcyl(w * 0.06, w * 0.1, h * 0.45, 0, h * 0.225, 0, wood, { rough: 0.9 })
      blob(w * 0.5, 0, h * 0.62, 0, shade(leaf, 0.95))
      blob(w * 0.42, w * 0.2, h * 0.72, w * 0.12, shade(leaf, 1.08))
      blob(w * 0.4, -w * 0.22, h * 0.74, -w * 0.14, shade(leaf, 0.86))
      blob(w * 0.3, w * 0.04, h * 0.88, 0, shade(leaf, 1.16))
      break
    }
    case 'rug': {
      box(w, Math.max(0.02, h), d, 0, Math.max(0.02, h) / 2, 0, color, { finish: 'fabric' })
      break
    }
    case 'stairs': {
      // straight run rising toward -z (the 2D arrow direction)
      const steps = Math.max(3, Math.round(h / 0.18))
      const run = d / steps
      const rise = h / steps
      for (let i = 0; i < steps; i++) {
        box(w, rise * (i + 1), run, 0, (rise * (i + 1)) / 2, d / 2 - run * (i + 0.5), color, { finish: 'wood' })
      }
      break
    }
    case 'balcony': {
      // platform + railing on 3 sides; -z edge open (attaches to the house)
      const slabH = 0.12
      const railH = Math.min(h, 1.2)
      box(w, slabH, d, 0, slabH / 2, 0, shade(color, 0.92))
      const railRun = (x1, z1, x2, z2) => {
        const len = Math.hypot(x2 - x1, z2 - z1)
        const n = Math.max(2, Math.round(len / 0.15))
        for (let i = 0; i <= n; i++) {
          const t = i / n
          cyl(0.02, railH - slabH, x1 + (x2 - x1) * t, slabH + (railH - slabH) / 2, z1 + (z2 - z1) * t, shade(color, 0.75), { finish: 'metal' })
        }
        const rail = box(Math.max(len, 0.05), 0.05, 0.06, (x1 + x2) / 2, railH, (z1 + z2) / 2, shade(color, 0.6), { finish: 'metal' })
        rail.rotation.y = -Math.atan2(z2 - z1, x2 - x1)
      }
      const e = 0.04
      railRun(-w / 2 + e, -d / 2 + e, -w / 2 + e, d / 2 - e) // left
      railRun(-w / 2 + e, d / 2 - e, w / 2 - e, d / 2 - e)   // front
      railRun(w / 2 - e, d / 2 - e, w / 2 - e, -d / 2 + e)   // right
      break
    }
    case 'railing': {
      const n = Math.max(2, Math.round(w / 0.15))
      for (let i = 0; i <= n; i++) {
        cyl(0.02, h - 0.05, -w / 2 + (w * i) / n, (h - 0.05) / 2, 0, shade(color, 0.85), { finish: 'metal' })
      }
      box(w, 0.05, Math.max(d, 0.05), 0, h - 0.025, 0, shade(color, 0.6), { finish: 'metal' })
      break
    }
    case 'appliance': {
      box(w, h, d, 0, h / 2, 0, color)
      box(w * 0.94, h * 0.1, d * 0.02, 0, h * 0.88, d / 2, shade(color, 0.8))            // control strip
      const door = cyl(Math.min(w, d) * 0.28, 0.03, 0, h * 0.45, d / 2, '#7f97a6', { rough: 0.15 }) // drum door
      door.rotation.x = Math.PI / 2
      break
    }
    case 'lamp': {
      const r = Math.min(w, d) / 2
      cyl(r * 0.5, 0.03, 0, 0.015, 0, shade(color, 0.5), { finish: 'metal' })      // base
      cyl(0.015, h * 0.72, 0, h * 0.38, 0, shade(color, 0.5), { finish: 'metal' }) // pole
      cyl(r * 0.8, h * 0.22, 0, h * 0.85, 0, shade(color, 1.25),
        { opacity: 0.85, rough: 0.6, emissive: '#ffdf9e', emissiveIntensity: 0.55 }) // lit shade
      sph(r * 0.18, 0, h * 0.8, 0, '#fff3d6', { emissive: '#ffe6ae', emissiveIntensity: 1.4 }) // bulb
      break
    }
    case 'piano': {
      box(w, h, d * 0.6, 0, h / 2, -d * 0.2, color, { finish: 'wood' })                  // upright body
      box(w, h * 0.06, d * 0.95, 0, h * 0.55, 0, shade(color, 0.8), { finish: 'wood' })  // key bed
      box(w * 0.94, h * 0.03, d * 0.34, 0, h * 0.585, d * 0.28, '#f4f1ea')               // keys
      for (const sx of [-1, 1])
        box(w * 0.06, h * 0.55, d * 0.08, sx * (w / 2 - w * 0.04), h * 0.275, d * 0.4, shade(color, 0.8), { finish: 'wood' })
      break
    }
    case 'pool': {
      // rim as 4 edge curbs so the water surface is actually visible
      const lip = Math.min(w, d) * 0.06
      box(w, h, lip, 0, h / 2, -d / 2 + lip / 2, '#ddd8cb', { rough: 0.6 })
      box(w, h, lip, 0, h / 2, d / 2 - lip / 2, '#ddd8cb', { rough: 0.6 })
      box(lip, h, d - 2 * lip, -w / 2 + lip / 2, h / 2, 0, '#ddd8cb', { rough: 0.6 })
      box(lip, h, d - 2 * lip, w / 2 - lip / 2, h / 2, 0, '#ddd8cb', { rough: 0.6 })
      box(w - 2 * lip, h * 0.85, d - 2 * lip, 0, h * 0.425, 0, color, { opacity: 0.8, rough: 0.08 }) // water
      break
    }
    case 'bbq': {
      const r = Math.min(w, d) * 0.42
      for (const sx of [-1, 1])
        cyl(0.02, h * 0.55, sx * r * 0.6, h * 0.275, 0, shade(color, 0.8), { finish: 'metal' })
      cyl(r, h * 0.28, 0, h * 0.65, 0, color, { finish: 'metal' })                       // kettle
      sph(r * 0.98, 0, h * 0.82, 0, shade(color, 1.15), { finish: 'metal' })             // lid
      break
    }
    case 'bench': {
      box(w, h * 0.15, d, 0, h * 0.85, 0, color, { finish: 'wood' })
      for (const sx of [-1, 1])
        box(w * 0.08, h * 0.78, d * 0.9, sx * (w / 2 - w * 0.08), h * 0.39, 0, shade(color, 0.75), { finish: 'wood' })
      break
    }
    default: {
      box(w, h, d, 0, h / 2, 0, color)
    }
  }
  return g
}