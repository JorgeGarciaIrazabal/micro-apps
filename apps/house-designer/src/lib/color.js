// Small color helpers for procedural furniture graphics.

export function hexToRgb(hex) {
  const m = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/.exec(String(hex || '').trim())
  if (m) return { r: +m[1], g: +m[2], b: +m[3] }
  let h = String(hex || '#888888').replace('#', '').trim()
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  const n = parseInt(h, 16)
  if (Number.isNaN(n)) return { r: 136, g: 136, b: 136 }
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

// Shade a hex color: f < 1 darkens (toward black), f > 1 lightens (toward white).
export function shade(hex, f) {
  const { r, g, b } = hexToRgb(hex)
  let R, G, B
  if (f < 1) {
    const p = 1 - f
    R = Math.round(r * (1 - p)); G = Math.round(g * (1 - p)); B = Math.round(b * (1 - p))
  } else {
    const p = f - 1
    R = Math.round(r + (255 - r) * p); G = Math.round(g + (255 - g) * p); B = Math.round(b + (255 - b) * p)
  }
  return `rgb(${R},${G},${B})`
}