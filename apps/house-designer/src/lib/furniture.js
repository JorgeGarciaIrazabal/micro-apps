// Furniture catalog for House Designer. Each entry is parametric: stored in the
// project as a box (width x depth x height in meters) with a color and label.
// Dimensions are realistic defaults so the 3D view reads correctly.

export const CATALOG = [
  {
    category: 'Living Room',
    items: [
      { type: 'sofa', label: 'Sofa', icon: '🛋️', width: 2.0, depth: 0.9, height: 0.85, color: '#6c8e9f' },
      { type: 'armchair', label: 'Armchair', icon: '🪑', width: 0.85, depth: 0.85, height: 0.9, color: '#7d6b8d' },
      { type: 'coffee-table', label: 'Coffee Table', icon: '☕', width: 1.1, depth: 0.6, height: 0.45, color: '#8a5a3b' },
      { type: 'tv-stand', label: 'TV Stand', icon: '📺', width: 1.6, depth: 0.45, height: 0.55, color: '#3a3a3a' },
      { type: 'bookshelf', label: 'Bookshelf', icon: '📚', width: 0.9, depth: 0.35, height: 1.9, color: '#5a3a22' },
      { type: 'rug', label: 'Rug', icon: '🟫', width: 2.4, depth: 1.6, height: 0.02, color: '#b8845a' },
    ],
  },
  {
    category: 'Bedroom',
    items: [
      { type: 'bed-double', label: 'Double Bed', icon: '🛏️', width: 1.6, depth: 2.1, height: 0.55, color: '#9aa7c2' },
      { type: 'bed-single', label: 'Single Bed', icon: '🛌', width: 0.9, depth: 2.0, height: 0.55, color: '#9aa7c2' },
      { type: 'nightstand', label: 'Nightstand', icon: '🛗', width: 0.5, depth: 0.4, height: 0.55, color: '#8a5a3b' },
      { type: 'wardrobe', label: 'Wardrobe', icon: '🚪', width: 1.5, depth: 0.6, height: 2.1, color: '#6b4e3d' },
      { type: 'dresser', label: 'Dresser', icon: '🗄️', width: 1.2, depth: 0.5, height: 0.9, color: '#7a5a44' },
    ],
  },
  {
    category: 'Kitchen',
    items: [
      { type: 'counter', label: 'Counter', icon: '⬜', width: 2.0, depth: 0.6, height: 0.9, color: '#cfcfcf' },
      { type: 'sink', label: 'Sink', icon: '🚰', width: 0.8, depth: 0.6, height: 0.9, color: '#9aa6b2' },
      { type: 'stove', label: 'Stove', icon: '🍳', width: 0.75, depth: 0.6, height: 0.9, color: '#2f2f2f' },
      { type: 'fridge', label: 'Fridge', icon: '🧊', width: 0.7, depth: 0.7, height: 1.9, color: '#dfe3e6' },
      { type: 'island', label: 'Island', icon: '🔲', width: 1.8, depth: 0.9, height: 0.9, color: '#b8b0a4' },
      { type: 'dining-table', label: 'Dining Table', icon: '🍽️', width: 1.6, depth: 0.9, height: 0.75, color: '#8a5a3b' },
      { type: 'chair', label: 'Chair', icon: '🪑', width: 0.45, depth: 0.45, height: 0.9, color: '#6b4e3d' },
    ],
  },
  {
    category: 'Bathroom',
    items: [
      { type: 'toilet', label: 'Toilet', icon: '🚽', width: 0.4, depth: 0.65, height: 0.8, color: '#eef2f5' },
      { type: 'bathtub', label: 'Bathtub', icon: '🛁', width: 1.7, depth: 0.75, height: 0.55, color: '#e7edf2' },
      { type: 'shower', label: 'Shower', icon: '🚿', width: 0.9, depth: 0.9, height: 2.0, color: '#cfe0e8' },
      { type: 'vanity', label: 'Vanity', icon: '🪞', width: 0.9, depth: 0.5, height: 0.85, color: '#d9cfc4' },
    ],
  },
  {
    category: 'Office',
    items: [
      { type: 'desk', label: 'Desk', icon: '🖥️', width: 1.4, depth: 0.7, height: 0.75, color: '#7a5a44' },
      { type: 'office-chair', label: 'Office Chair', icon: '💺', width: 0.6, depth: 0.6, height: 1.0, color: '#2f2f2f' },
      { type: 'filing-cabinet', label: 'Filing Cabinet', icon: '🗃️', width: 0.5, depth: 0.6, height: 1.3, color: '#555' },
    ],
  },
  {
    category: 'Outdoor & Misc',
    items: [
      { type: 'plant', label: 'Plant', icon: '🪴', width: 0.5, depth: 0.5, height: 1.0, color: '#4a7c4a' },
      { type: 'tree', label: 'Tree', icon: '🌳', width: 1.2, depth: 1.2, height: 3.0, color: '#3d6b3d' },
      { type: 'box', label: 'Custom Box', icon: '📦', width: 0.6, depth: 0.6, height: 0.6, color: '#b08968' },
    ],
  },
]

// Flat lookup by type for fast default resolution.
export const BY_TYPE = Object.fromEntries(
  CATALOG.flatMap((c) => c.items.map((it) => [it.type, it])),
)

// Build a furniture instance (project entry) from a catalog item placed at x,y.
export function makeFurniture(type, x, y, overrides = {}) {
  const def = BY_TYPE[type] || BY_TYPE.box
  return {
    id: undefined, // assigned by caller via uid
    type: def.type,
    x, y,
    rotation: 0,
    width: def.width,
    depth: def.depth,
    height: def.height,
    color: def.color,
    label: def.label,
    ...overrides,
  }
}

// Structural openings placed on walls (doors / windows). These cut the wall in
// 3D and render a plan symbol in 2D. Defaults follow common sizes.
export const STRUCTURE = [
  { type: 'door', label: 'Door', icon: '🚪', width: 0.9, height: 2.1, sill: 0 },
  { type: 'window', label: 'Window', icon: '🪟', width: 1.2, height: 1.2, sill: 1.0 },
]

export const STRUCTURE_BY_TYPE = Object.fromEntries(STRUCTURE.map((s) => [s.type, s]))

// Default opening dimensions for a given type (used when placing on a wall).
export function openingDefaults(type) {
  const def = STRUCTURE_BY_TYPE[type] || STRUCTURE_BY_TYPE.door
  return { type: def.type, width: def.width, height: def.height, sill: def.sill, hinge: 0, side: 1 }
}