// Single source of truth for furniture types. Each record holds the catalog
// defaults plus which 2D plan symbol (`symbol`, see FurnitureGraphic.jsx) and
// 3D model (`model`, see furniture3d.js) render it. Adding a type = one record
// here, reusing existing renderers — or add a new symbol/model case first.

const LIVING = 'Living Room'
const BEDROOM = 'Bedroom'
const KITCHEN = 'Kitchen'
const BATHROOM = 'Bathroom'
const OFFICE = 'Office'
const STAIRS = 'Stairs & Balcony'
const OUTDOOR = 'Outdoor & Garden'
const MISC = 'Misc'

export const CATEGORY_ORDER = [LIVING, BEDROOM, KITCHEN, BATHROOM, OFFICE, STAIRS, OUTDOOR, MISC]

export const FURNITURE = {
  // Living room
  'sofa':           { label: 'Sofa', category: LIVING, width: 2.0, depth: 0.9, height: 0.85, color: '#6c8e9f', symbol: 'seat', model: 'seat' },
  'armchair':       { label: 'Armchair', category: LIVING, width: 0.85, depth: 0.85, height: 0.9, color: '#7d6b8d', symbol: 'seat', model: 'seat' },
  'coffee-table':   { label: 'Coffee Table', category: LIVING, width: 1.1, depth: 0.6, height: 0.45, color: '#8a5a3b', symbol: 'table', model: 'table' },
  'tv-stand':       { label: 'TV Stand', category: LIVING, width: 1.6, depth: 0.45, height: 0.55, color: '#3a3a3a', symbol: 'tv-stand', model: 'tv-stand' },
  'bookshelf':      { label: 'Bookshelf', category: LIVING, width: 0.9, depth: 0.35, height: 1.9, color: '#5a3a22', symbol: 'bookshelf', model: 'wood-box' },
  'rug':            { label: 'Rug', category: LIVING, width: 2.4, depth: 1.6, height: 0.05, color: '#b8845a', symbol: 'rug', model: 'rug' },
  'floor-lamp':     { label: 'Floor Lamp', category: LIVING, width: 0.4, depth: 0.4, height: 1.6, color: '#c9a227', symbol: 'lamp', model: 'lamp' },
  'piano':          { label: 'Piano', category: LIVING, width: 1.5, depth: 0.6, height: 1.2, color: '#2b2b2b', symbol: 'piano', model: 'piano' },
  'side-table':     { label: 'Side Table', category: LIVING, width: 0.5, depth: 0.5, height: 0.55, color: '#8a5a3b', symbol: 'table', model: 'table' },
  // Bedroom
  'bed-double':     { label: 'Double Bed', category: BEDROOM, width: 1.6, depth: 2.1, height: 0.55, color: '#9aa7c2', symbol: 'bed', model: 'bed' },
  'bed-single':     { label: 'Single Bed', category: BEDROOM, width: 0.9, depth: 2.0, height: 0.55, color: '#9aa7c2', symbol: 'bed', model: 'bed' },
  'nightstand':     { label: 'Nightstand', category: BEDROOM, width: 0.5, depth: 0.4, height: 0.55, color: '#8a5a3b', symbol: 'nightstand', model: 'wood-box' },
  'wardrobe':       { label: 'Wardrobe', category: BEDROOM, width: 1.5, depth: 0.6, height: 2.1, color: '#6b4e3d', symbol: 'cabinet', model: 'wood-box' },
  'dresser':        { label: 'Dresser', category: BEDROOM, width: 1.2, depth: 0.5, height: 0.9, color: '#7a5a44', symbol: 'cabinet', model: 'wood-box' },
  'crib':           { label: 'Crib', category: BEDROOM, width: 0.7, depth: 1.3, height: 0.9, color: '#c2b2d6', symbol: 'bed', model: 'bed' },
  // Kitchen
  'counter':        { label: 'Counter', category: KITCHEN, width: 2.0, depth: 0.6, height: 0.9, color: '#cfcfcf', symbol: 'counter', model: 'plain-box' },
  'sink':           { label: 'Sink', category: KITCHEN, width: 0.8, depth: 0.6, height: 0.9, color: '#9aa6b2', symbol: 'sink', model: 'washstand' },
  'stove':          { label: 'Stove', category: KITCHEN, width: 0.75, depth: 0.6, height: 0.9, color: '#2f2f2f', symbol: 'stove', model: 'stove' },
  'fridge':         { label: 'Fridge', category: KITCHEN, width: 0.7, depth: 0.7, height: 1.9, color: '#dfe3e6', symbol: 'fridge', model: 'fridge' },
  'island':         { label: 'Island', category: KITCHEN, width: 1.8, depth: 0.9, height: 0.9, color: '#b8b0a4', symbol: 'counter', model: 'plain-box' },
  'dining-table':   { label: 'Dining Table', category: KITCHEN, width: 1.6, depth: 0.9, height: 0.75, color: '#8a5a3b', symbol: 'table', model: 'table' },
  'chair':          { label: 'Chair', category: KITCHEN, width: 0.45, depth: 0.45, height: 0.9, color: '#6b4e3d', symbol: 'chair', model: 'chair' },
  'dishwasher':     { label: 'Dishwasher', category: KITCHEN, width: 0.6, depth: 0.6, height: 0.85, color: '#b9c1c7', symbol: 'appliance', model: 'appliance' },
  // Bathroom
  'toilet':         { label: 'Toilet', category: BATHROOM, width: 0.4, depth: 0.65, height: 0.8, color: '#eef2f5', symbol: 'toilet', model: 'toilet' },
  'bathtub':        { label: 'Bathtub', category: BATHROOM, width: 1.7, depth: 0.75, height: 0.55, color: '#e7edf2', symbol: 'bathtub', model: 'bathtub' },
  'shower':         { label: 'Shower', category: BATHROOM, width: 0.9, depth: 0.9, height: 2.0, color: '#cfe0e8', symbol: 'shower', model: 'shower' },
  'vanity':         { label: 'Vanity', category: BATHROOM, width: 0.9, depth: 0.5, height: 0.85, color: '#d9cfc4', symbol: 'vanity', model: 'washstand' },
  'washing-machine':{ label: 'Washing Machine', category: BATHROOM, width: 0.6, depth: 0.6, height: 0.85, color: '#e8ebee', symbol: 'appliance', model: 'appliance' },
  // Office
  'desk':           { label: 'Desk', category: OFFICE, width: 1.4, depth: 0.7, height: 0.75, color: '#7a5a44', symbol: 'table', model: 'table' },
  'office-chair':   { label: 'Office Chair', category: OFFICE, width: 0.6, depth: 0.6, height: 1.0, color: '#2f2f2f', symbol: 'office-chair', model: 'office-chair' },
  'filing-cabinet': { label: 'Filing Cabinet', category: OFFICE, width: 0.5, depth: 0.6, height: 1.3, color: '#555', symbol: 'cabinet', model: 'plain-box' },
  // Stairs & balcony (structural pieces that behave like furniture)
  'stairs':         { label: 'Stairs', category: STAIRS, width: 1.0, depth: 3.0, height: 3.0, color: '#b09a7a', symbol: 'stairs', model: 'stairs' },
  'balcony':        { label: 'Balcony', category: STAIRS, width: 3.0, depth: 1.5, height: 1.05, color: '#c5c9cf', symbol: 'balcony', model: 'balcony' },
  'railing':        { label: 'Railing', category: STAIRS, width: 2.0, depth: 0.1, height: 1.05, color: '#8b8f96', symbol: 'railing', model: 'railing' },
  // Outdoor & garden
  'plant':          { label: 'Plant', category: OUTDOOR, width: 0.5, depth: 0.5, height: 1.0, color: '#4a7c4a', symbol: 'plant', model: 'plant' },
  'tree':           { label: 'Tree', category: OUTDOOR, width: 1.2, depth: 1.2, height: 3.0, color: '#3d6b3d', symbol: 'tree', model: 'tree' },
  'pool':           { label: 'Pool', category: OUTDOOR, width: 4.0, depth: 2.5, height: 0.5, color: '#5fa8d3', symbol: 'pool', model: 'pool' },
  'bbq':            { label: 'BBQ Grill', category: OUTDOOR, width: 0.6, depth: 0.6, height: 1.0, color: '#3a3a3a', symbol: 'bbq', model: 'bbq' },
  'bench':          { label: 'Bench', category: OUTDOOR, width: 1.5, depth: 0.4, height: 0.45, color: '#8a6a4a', symbol: 'bench', model: 'bench' },
  'outdoor-table':  { label: 'Outdoor Table', category: OUTDOOR, width: 1.2, depth: 0.8, height: 0.72, color: '#9a8a72', symbol: 'table', model: 'table' },
  // Misc
  'box':            { label: 'Custom Box', category: MISC, width: 0.6, depth: 0.6, height: 0.6, color: '#b08968', symbol: 'box', model: 'box' },
}

export const FALLBACK = FURNITURE.box

// Resolve a (possibly unknown) type to its registry record.
export function defFor(type) {
  return FURNITURE[type] ?? FALLBACK
}

// ---- derived catalog views (shape unchanged for FurniturePanel etc.) ------
export const CATALOG = CATEGORY_ORDER.map((category) => ({
  category,
  items: Object.entries(FURNITURE)
    .filter(([, def]) => def.category === category)
    .map(([type, def]) => ({ type, ...def })),
}))

export const BY_TYPE = Object.fromEntries(
  Object.entries(FURNITURE).map(([type, def]) => [type, { type, ...def }]),
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
// 3D and render a plan symbol in 2D. Defaults follow common sizes. `key` is
// the catalog/tool identifier; `style` is the door leaf mechanism stored on
// the opening (see DOOR_STYLES in project.js).
export const STRUCTURE = [
  { key: 'door', type: 'door', style: 'swing', label: 'Door', width: 0.9, height: 2.1, sill: 0 },
  { key: 'door-double', type: 'door', style: 'double', label: 'Double Door', width: 1.5, height: 2.1, sill: 0 },
  { key: 'door-sliding', type: 'door', style: 'sliding', label: 'Sliding Door', width: 1.6, height: 2.1, sill: 0 },
  { key: 'door-folding', type: 'door', style: 'folding', label: 'Folding Door', width: 1.2, height: 2.1, sill: 0 },
  { key: 'window', type: 'window', style: 'swing', label: 'Window', width: 1.2, height: 1.2, sill: 1.0 },
]

export const STRUCTURE_BY_KEY = Object.fromEntries(STRUCTURE.map((s) => [s.key, s]))

// Default opening fields for a catalog key (used when placing on a wall).
export function openingDefaults(key) {
  const def = STRUCTURE_BY_KEY[key] || STRUCTURE_BY_KEY.door
  return { type: def.type, style: def.style, width: def.width, height: def.height, sill: def.sill, hinge: 0, side: 1 }
}
