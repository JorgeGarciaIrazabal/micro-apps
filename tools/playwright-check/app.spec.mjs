import { test, expect } from '@playwright/test'

// Smoke checks for the House Designer micro-app against its Vite dev server
// (baseURL in playwright.config.mjs → http://127.0.0.1:5182):
//
//   cd apps/house-designer && npx vite --port 5182 --strictPort
//
// File-backed project mode is covered separately in project-file.spec.mjs
// (it needs the root dev server for /__save + the houses watcher).

const SHOTS = 'screenshots'

test.beforeEach(async ({ page }) => {
  page.__errors = []
  page.on('pageerror', (e) => page.__errors.push(String(e)))
  page.on('console', (m) => { if (m.type() === 'error') page.__errors.push(m.text()) })
  // Isolate from any previously autosaved project
  await page.addInitScript(() => localStorage.clear())
})

async function expectNoErrors(page) {
  const real = page.__errors.filter((e) => !/Received NaN|attribute/i.test(e))
  expect(real, `console/page errors: ${JSON.stringify(page.__errors)}`).toEqual([])
}

test('app loads with empty state and core UI', async ({ page }) => {
  await page.goto('/micro-apps/house-designer/')
  await expect(page).toHaveTitle(/House Designer/)
  await expect(page.locator('.brand-text strong')).toHaveText('House Designer')
  for (const t of ['2D', '3D']) {
    await expect(page.locator('.view-toggle button', { hasText: t })).toBeVisible()
  }
  await expect(page.locator('.sample-select')).toBeVisible()
  await expect(page.locator('.btn-open-file')).toBeVisible()
  await expect(page.locator('.btn-save-json')).toBeVisible()
  await expect(page.locator('.empty-card')).toBeVisible()
  await expectNoErrors(page)
  await page.screenshot({ path: `${SHOTS}/01-empty.png` })
})

test('example loads and 2D renders walls + furniture', async ({ page }) => {
  await page.goto('/micro-apps/house-designer/')
  await page.locator('.sample-select').selectOption('tiny-cabin')
  await expect(page.locator('.empty-card')).toBeHidden()
  const svg = page.locator('.stage svg')
  expect(await svg.locator('g.wall line').count()).toBeGreaterThan(0)
  // Furniture pieces are the only groups whose transform includes a rotate().
  expect(await svg.locator('g[transform*="rotate"]').count()).toBeGreaterThan(0)
  await expectNoErrors(page)
  await page.screenshot({ path: `${SHOTS}/02-2d-sample.png` })
})

test('3D view renders the scene', async ({ page }) => {
  await page.goto('/micro-apps/house-designer/')
  await page.locator('.sample-select').selectOption('tiny-cabin')
  await page.locator('.view-toggle button', { hasText: '3D' }).click()
  const canvas = page.locator('.stage canvas')
  await expect(canvas).toBeVisible()
  // WebGL canvas has non-trivial dimensions
  const box = await canvas.boundingBox()
  expect(box.width).toBeGreaterThan(100)
  expect(box.height).toBeGreaterThan(100)
  await expectNoErrors(page)
  await page.screenshot({ path: `${SHOTS}/05-3d.png` })
})

test('language toggle switches to Spanish', async ({ page }) => {
  await page.goto('/micro-apps/house-designer/')
  await page.locator('.lang-toggle button', { hasText: 'ES' }).click()
  await expect(page.locator('.brand-text strong')).toHaveText('Diseñador de Casas')
  await expect(page.locator('.empty-card h2')).toHaveText('Empieza tu planta')
  await expectNoErrors(page)
})

test('undo/redo via keyboard works after loading an example', async ({ page }) => {
  await page.goto('/micro-apps/house-designer/')
  await page.locator('.sample-select').selectOption('tiny-cabin')
  await expect(page.locator('.empty-card')).toBeHidden()
  await page.locator('.stage').click({ position: { x: 20, y: 20 } })
  await page.keyboard.press('Control+z')
  // Undoing the sample load returns to the empty project
  await expect(page.locator('.empty-card')).toBeVisible()
  await page.keyboard.press('Control+Shift+z')
  await expect(page.locator('.empty-card')).toBeHidden()
  await expectNoErrors(page)
})
