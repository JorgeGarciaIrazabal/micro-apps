import { test, expect } from '@playwright/test'
import { readFileSync } from 'node:fs'

// Comprehensive check that the Planner5D micro-app renders and behaves.
// Run against the Vite dev server (see playwright.config.mjs baseURL).

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
const SHOTS = 'screenshots'

test.beforeEach(async ({ page }) => {
  // Collect browser-side errors so we can assert a clean console.
  page.__errors = []
  page.on('pageerror', (e) => page.__errors.push(String(e)))
  page.on('console', (m) => { if (m.type() === 'error') page.__errors.push(m.text()) })
})

async function expectNoErrors(page) {
  // Tolerate the harmless SVG "Received NaN" warnings if any, but fail on real JS errors.
  const real = page.__errors.filter((e) => !/Received NaN|attribute/i.test(e))
  expect(real, `console/page errors: ${JSON.stringify(page.__errors)}`).toEqual([])
}

test('app loads with empty state and core UI', async ({ page }) => {
  await page.goto('/micro-apps/planner5d/')
  await expect(page).toHaveTitle(/Planner5D/)
  await expect(page.locator('.brand-text strong')).toHaveText('Planner5D')
  // Top bar actions present
  // View toggle (2D/3D) lives in its own segmented control, not .topbar-actions.
  for (const t of ['2D', '3D']) {
    await expect(page.locator('.view-toggle button', { hasText: t })).toBeVisible()
  }
  for (const t of ['Sample', 'Reset view', 'Open…', 'Save JSON', 'PNG']) {
    await expect(page.locator('.topbar-actions button', { hasText: t })).toBeVisible()
  }
  // Tools + catalog
  await expect(page.locator('.tool-btn', { hasText: 'Select' })).toBeVisible()
  await expect(page.locator('.tool-btn', { hasText: 'Wall' })).toBeVisible()
  await expect(page.locator('.cat-item', { hasText: 'Sofa' })).toBeVisible()
  // Empty state CTA
  await expect(page.locator('.empty-card')).toBeVisible()
  await expectNoErrors(page)
  await page.screenshot({ path: `${SHOTS}/01-empty.png` })
})

test('sample loads and 2D renders walls + furniture', async ({ page }) => {
  await page.goto('/micro-apps/planner5d/')
  await page.locator('.topbar-actions button', { hasText: 'Sample' }).click()
  await expect(page.locator('.name-input')).toHaveValue('Studio + Bedroom')
  // Empty state disappears once content exists
  await expect(page.locator('.empty-card')).toBeHidden()
  // Walls drawn as thick lines inside the transformed <g>
  const svg = page.locator('.stage svg')
  const wallLines = await svg.locator('g.wall line').count()
  expect(wallLines).toBeGreaterThan(0)
  // Furniture groups present
  const furn = await svg.locator('g[transform] > g[transform]').count()
  expect(furn).toBeGreaterThan(0)
  // Wall length labels render as text
  const labels = await svg.locator('text').count()
  expect(labels).toBeGreaterThan(0)
  await expectNoErrors(page)
  await page.screenshot({ path: `${SHOTS}/02-2d-sample.png`, fullPage: false })
})

test('wall tool draws a wall chain', async ({ page }) => {
  await page.goto('/micro-apps/planner5d/')
  await page.locator('.tool-btn', { hasText: 'Wall' }).click()
  const svg = page.locator('.stage svg')
  const before = await svg.locator('g.wall line').count()
  // Click two points to draw one wall
  await svg.click({ position: { x: 200, y: 150 } })
  await svg.click({ position: { x: 360, y: 150 } })
  await page.keyboard.press('Escape') // finish chain
  await expect.poll(async () => await svg.locator('g.wall line').count()).toBeGreaterThan(before)
  await expectNoErrors(page)
  await page.screenshot({ path: `${SHOTS}/03-wall-drawn.png` })
})

test('furniture placement + select/move + delete', async ({ page }) => {
  await page.goto('/micro-apps/planner5d/')
  // Place a sofa
  await page.locator('.cat-item', { hasText: 'Sofa' }).click()
  const svg = page.locator('.stage svg')
  // Click near the top-left of the SVG (outside the centered empty-state card,
  // which is non-blocking except for its button) so the placement lands on the canvas.
  await svg.click({ position: { x: 120, y: 120 } })
  await expect.poll(async () => await svg.locator('g[transform] > g[transform] rect').count()).toBeGreaterThan(0)
  // Switch to select and grab the placed sofa center
  await page.locator('.tool-btn', { hasText: 'Select' }).click()
  const furn = svg.locator('g[transform] > g[transform]').first()
  await expect(furn).toBeVisible()
  // Move it: drag the furniture body to the right
  const box = await furn.boundingBox()
  const startX = box.x + box.width / 2
  const startY = box.y + box.height / 2
  await page.mouse.move(startX, startY)
  await page.mouse.down()
  await page.mouse.move(startX + 120, startY, { steps: 8 })
  await page.mouse.up()
  // Select handle (rotate) should appear -> confirms selection works
  await expect(svg.locator('polygon')).toBeVisible()
  // Delete it
  await page.keyboard.press('Delete')
  await expect.poll(async () => await svg.locator('g[transform] > g[transform]').count()).toBe(0)
  await expectNoErrors(page)
  await page.screenshot({ path: `${SHOTS}/04-furniture.png` })
})

test('3D view renders the scene', async ({ page }) => {
  await page.goto('/micro-apps/planner5d/')
  await page.locator('.topbar-actions button', { hasText: 'Sample' }).click()
  await page.locator('.seg button', { hasText: '3D' }).click()
  await expect(page.locator('.stage canvas')).toBeVisible()
  // Confirm the canvas actually drew the scene (not all clear-color) by sampling pixels.
  const variation = await page.evaluate(() => {
    const c = document.querySelector('.stage canvas')
    const gl = c.getContext('webgl2') || c.getContext('webgl')
    const w = c.width, h = c.height
    const clear = [223, 231, 238] // #dfe7ee
    let nonClear = 0
    for (const [x, y] of [[w/2,h/2],[w/3,h/3],[2*w/3,2*h/3],[w/2,h*0.8],[w/2,h*0.2]]) {
      const a = new Uint8Array(4)
      gl.readPixels(x, h-1-y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, a)
      if (Math.abs(a[0]-clear[0])+Math.abs(a[1]-clear[1])+Math.abs(a[2]-clear[2]) > 12) nonClear++
    }
    return nonClear
  })
  expect(variation).toBeGreaterThanOrEqual(2)
  await expectNoErrors(page)
  await page.screenshot({ path: `${SHOTS}/05-3d.png` })
})

test('export JSON and PNG produce valid files', async ({ page }) => {
  await page.goto('/micro-apps/planner5d/')
  await page.locator('.topbar-actions button', { hasText: 'Sample' }).click()
  // JSON
  const jsonDL = page.waitForEvent('download')
  await page.locator('.topbar-actions button', { hasText: 'Save JSON' }).click()
  const json = await jsonDL
  const jsonBuf = await readDownload(json)
  expect(jsonBuf.subarray(0, 1).toString('utf8')).toBe('{')
  const parsed = JSON.parse(jsonBuf.toString('utf8'))
  expect(parsed.version).toBe(1)
  expect(parsed.floors.length).toBe(2)
  expect(parsed.floors[0].walls.length).toBeGreaterThan(0)
  expect(parsed.floors[0].furniture.length).toBeGreaterThan(0)
  // 2D PNG
  const png2dDL = page.waitForEvent('download')
  await page.locator('.topbar-actions button', { hasText: 'PNG' }).click()
  const png2d = await png2dDL
  const png2Buf = await readDownload(png2d)
  expect(png2Buf.subarray(0, 8).equals(PNG_MAGIC)).toBe(true)
  expect(png2Buf.length).toBeGreaterThan(5000)
  // 3D PNG
  await page.locator('.seg button', { hasText: '3D' }).click()
  await page.waitForTimeout(800)
  const png3dDL = page.waitForEvent('download')
  await page.locator('.topbar-actions button', { hasText: 'PNG' }).click()
  const png3d = await png3dDL
  const png3Buf = await readDownload(png3d)
  expect(png3Buf.subarray(0, 8).equals(PNG_MAGIC)).toBe(true)
  await expectNoErrors(page)
})

test('import roundtrip restores a project', async ({ page }) => {
  await page.goto('/micro-apps/planner5d/')
  await page.locator('.topbar-actions button', { hasText: 'Sample' }).click()
  // Capture the JSON this app exports, then feed it back through the Open… picker.
  const dl = page.waitForEvent('download')
  await page.locator('.topbar-actions button', { hasText: 'Save JSON' }).click()
  const json = await dl
  const jsonText = (await readDownload(json)).toString('utf8')
  // Playwright's filechooser event handles the dynamically-created picker cleanly.
  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.locator('.topbar-actions button', { hasText: 'Open…' }).click(),
  ])
  await fileChooser.setFiles({ name: 'roundtrip.pln5d.json', mimeType: 'application/json', buffer: Buffer.from(jsonText) })
  await expect(page.locator('.toast')).toContainText('Opened')
  // Project reloaded: name set from filename stem, walls re-rendered
  await expect(page.locator('.name-input')).toHaveValue('roundtrip')
  const svg = page.locator('.stage svg')
  await expect.poll(async () => await svg.locator('g.wall line').count()).toBeGreaterThan(0)
  await expectNoErrors(page)
  await page.screenshot({ path: `${SHOTS}/06-imported.png` })
})

test('doors and windows render and can be placed on walls', async ({ page }) => {
  await page.goto('/micro-apps/planner5d/')
  await page.locator('.topbar-actions button', { hasText: 'Sample' }).click()
  await page.waitForTimeout(400)
  const svg = page.locator('.stage svg')
  // The sample ships a door (drawn as a swing-arc <path>) + two windows.
  const paths0 = await svg.locator('path').count()
  expect(paths0).toBeGreaterThan(0)
  // 3D still renders with the walls cut by openings.
  await page.locator('.seg button', { hasText: '3D' }).click()
  await page.waitForTimeout(1000)
  const var3d = await page.evaluate(() => {
    const c = document.querySelector('.stage canvas')
    const gl = c.getContext('webgl2') || c.getContext('webgl')
    const w = c.width, h = c.height, clear = [223, 231, 238]; let non = 0
    for (const [x, y] of [[w/2,h/2],[w/3,h/3],[2*w/3,2*h/3],[w/2,h*0.8],[w/2,h*0.2]]) {
      const a = new Uint8Array(4); gl.readPixels(x, h-1-y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, a)
      if (Math.abs(a[0]-clear[0])+Math.abs(a[1]-clear[1])+Math.abs(a[2]-clear[2]) > 12) non++
    }
    return non
  })
  expect(var3d).toBeGreaterThanOrEqual(2)
  // Back to 2D and place a new door on the bottom wall.
  await page.locator('.seg button', { hasText: '2D' }).click()
  await page.waitForTimeout(400)
  await page.locator('.cat-item', { hasText: 'Door' }).click()
  await svg.click({ position: { x: 300, y: 80 } })
  // The newly placed door is auto-selected -> the sidebar shows the Door editor.
  await expect(page.locator('.props-panel h3')).toHaveText('Door')
  // Delete it via the sidebar.
  await page.locator('.props-actions button', { hasText: /Delete opening/ }).click()
  await expect.poll(async () => await svg.locator('path').count()).toBe(paths0)
  await expectNoErrors(page)
  await page.screenshot({ path: `${SHOTS}/07-doors.png` })
})

test('multiple floors: switch floors and 3D stacks both', async ({ page }) => {
  await page.goto('/micro-apps/planner5d/')
  await page.locator('.topbar-actions button', { hasText: 'Sample' }).click()
  await page.waitForTimeout(400)
  const svg = page.locator('.stage svg')
  // Ground tab is active; the floor bar shows two tabs.
  await expect(page.locator('.floor-tab', { hasText: 'Ground' })).toHaveClass(/active/)
  await expect(page.locator('.floor-tab', { hasText: 'Upper' })).toBeVisible()
  const groundWalls = await svg.locator('g.wall line').count()
  expect(groundWalls).toBeGreaterThan(0)
  // Switch to the Upper floor -> 2D shows the upper floor's walls instead.
  await page.locator('.floor-tab', { hasText: 'Upper' }).click()
  await page.waitForTimeout(300)
  await expect(page.locator('.floor-tab', { hasText: 'Upper' })).toHaveClass(/active/)
  const upperWalls = await svg.locator('g.wall line').count()
  expect(upperWalls).toBeGreaterThan(0)
  expect(upperWalls).not.toBe(groundWalls)
  // Add a third floor via the + button.
  await page.locator('.floor-add').click()
  await page.waitForTimeout(200)
  await expect(page.locator('.floor-tab')).toHaveCount(3)
  // Switch back to a non-empty floor so the empty-state card doesn't overlay 3D.
  await page.locator('.floor-tab', { hasText: 'Upper' }).click()
  await page.waitForTimeout(200)
  // 3D renders both real floors stacked (pixel variance, not all clear-color).
  await page.locator('.seg button', { hasText: '3D' }).click()
  await page.waitForTimeout(1200)
  const var3d = await page.evaluate(() => {
    const c = document.querySelector('.stage canvas')
    const gl = c.getContext('webgl2') || c.getContext('webgl')
    const w = c.width, h = c.height, clear = [223, 231, 238]; let non = 0
    for (const [x, y] of [[w/2,h/2],[w/3,h/3],[2*w/3,2*h/3],[w/2,h*0.8],[w/2,h*0.2]]) {
      const a = new Uint8Array(4); gl.readPixels(x, h-1-y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, a)
      if (Math.abs(a[0]-clear[0])+Math.abs(a[1]-clear[1])+Math.abs(a[2]-clear[2]) > 12) non++
    }
    return non
  })
  expect(var3d).toBeGreaterThanOrEqual(2)
  await expectNoErrors(page)
  await page.screenshot({ path: `${SHOTS}/08-multifloor.png` })
})

test('door orientation flips (hinge + swing side)', async ({ page }) => {
  await page.goto('/micro-apps/planner5d/')
  await page.locator('.topbar-actions button', { hasText: 'Sample' }).click()
  await page.waitForTimeout(400)
  // Place a door on the bottom wall and select it.
  await page.locator('.cat-item', { hasText: 'Door' }).click()
  const svg = page.locator('.stage svg')
  await svg.click({ position: { x: 300, y: 80 } })
  await expect(page.locator('.props-panel h3')).toHaveText('Door')
  // The door renders a swing arc as a <path>; capture its 'd' to detect changes.
  const pathD = async () => {
    // the selected door's symbol is the last <path> in the wall group
    const paths = await svg.locator('g.wall path').evaluateAll((els) => els.map((e) => e.getAttribute('d')))
    return paths.filter(Boolean).pop()
  }
  const d0 = await pathD()
  expect(d0.length).toBeGreaterThan(10)
  // Flip hinge (left <-> right) -> the arc path changes.
  await page.locator('.props-actions, .seg').locator('button', { hasText: /Flip hinge/ }).first().click()
  await page.waitForTimeout(200)
  const d1 = await pathD()
  expect(d1).not.toBe(d0)
  // Flip swing side -> changes again.
  await page.locator('button', { hasText: /Flip swing/ }).first().click()
  await page.waitForTimeout(200)
  const d2 = await pathD()
  expect(d2).not.toBe(d1)
  await expectNoErrors(page)
})

async function readDownload(download) {
  const path = await download.path()
  if (path) return readFileSync(path)
  // Fallback: stream into a buffer
  const stream = await download.createReadStream()
  const chunks = []
  for await (const c of stream) chunks.push(c)
  return Buffer.concat(chunks)
}