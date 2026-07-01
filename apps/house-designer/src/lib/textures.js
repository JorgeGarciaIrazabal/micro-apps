import * as THREE from 'three'
import { hexToRgb, shade } from './color.js'

// Small procedural CanvasTextures for 3D materials (no binary assets).
// Cached per kind:color so scene rebuilds don't regenerate canvases.
// Deterministic pseudo-random keeps textures stable across rebuilds.

const cache = new Map()

function mulberry(seed) {
  let a = seed >>> 0
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function canvasTexture(key, draw) {
  if (cache.has(key)) return cache.get(key)
  const c = document.createElement('canvas')
  c.width = 128
  c.height = 128
  draw(c.getContext('2d'))
  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.colorSpace = THREE.SRGBColorSpace
  cache.set(key, tex)
  return tex
}

// Horizontal plank stripes with slight tone jitter + thin grain lines.
export function makeWoodTexture(baseColor) {
  return canvasTexture(`wood:${baseColor}`, (ctx) => {
    const rnd = mulberry(7)
    ctx.fillStyle = baseColor
    ctx.fillRect(0, 0, 128, 128)
    const rows = 8
    for (let i = 0; i < rows; i++) {
      const f = 0.9 + rnd() * 0.22
      ctx.fillStyle = shade(baseColor, f)
      ctx.fillRect(0, i * 16, 128, 16)
      ctx.strokeStyle = shade(baseColor, 0.72)
      ctx.globalAlpha = 0.35
      ctx.beginPath()
      ctx.moveTo(0, i * 16 + 0.5)
      ctx.lineTo(128, i * 16 + 0.5)
      ctx.stroke()
      // faint grain squiggles
      ctx.globalAlpha = 0.12
      for (let k = 0; k < 3; k++) {
        const y = i * 16 + 3 + rnd() * 11
        ctx.beginPath()
        ctx.moveTo(0, y)
        for (let x = 0; x <= 128; x += 16) ctx.lineTo(x, y + (rnd() - 0.5) * 2.5)
        ctx.stroke()
      }
      ctx.globalAlpha = 1
    }
  })
}

// Fine speckle noise for upholstery.
export function makeFabricTexture(baseColor) {
  return canvasTexture(`fabric:${baseColor}`, (ctx) => {
    const rnd = mulberry(13)
    ctx.fillStyle = baseColor
    ctx.fillRect(0, 0, 128, 128)
    const { r, g, b } = hexToRgb(baseColor)
    const img = ctx.getImageData(0, 0, 128, 128)
    for (let i = 0; i < img.data.length; i += 4) {
      const n = (rnd() - 0.5) * 26
      img.data[i] = Math.max(0, Math.min(255, r + n))
      img.data[i + 1] = Math.max(0, Math.min(255, g + n))
      img.data[i + 2] = Math.max(0, Math.min(255, b + n))
    }
    ctx.putImageData(img, 0, 0)
  })
}

// Vertical sky gradient for the scene background.
export function makeSkyTexture(horizon = '#e8ddca', zenith = '#cfdde9') {
  return canvasTexture(`sky:${horizon}:${zenith}`, (ctx) => {
    const grad = ctx.createLinearGradient(0, 0, 0, 128)
    grad.addColorStop(0, zenith)
    grad.addColorStop(0.72, shade(zenith, 1.12))
    grad.addColorStop(1, horizon)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 128, 128)
  })
}

// Soft radial ground patch (opaque center fading out) drawn under the house.
export function makeGroundTexture(color = '#b9c0ae') {
  return canvasTexture(`ground:${color}`, (ctx) => {
    const grad = ctx.createRadialGradient(64, 64, 8, 64, 64, 64)
    const { r, g, b } = hexToRgb(color)
    grad.addColorStop(0, `rgba(${r},${g},${b},0.85)`)
    grad.addColorStop(0.7, `rgba(${r},${g},${b},0.5)`)
    grad.addColorStop(1, `rgba(${r},${g},${b},0)`)
    ctx.clearRect(0, 0, 128, 128)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 128, 128)
  })
}
