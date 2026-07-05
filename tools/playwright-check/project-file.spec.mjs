import { test, expect } from '@playwright/test'
import { readFileSync, writeFileSync, copyFileSync, rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// File-backed project mode (?project=&save=1&embed=1) against the ROOT DEV
// SERVER (scripts/dev-server.js), which provides /__save and the houses/
// change watcher. Start it first:
//
//   PORT=8020 node scripts/dev-server.js
//   DEV_HOST=http://127.0.0.1:8020 npx playwright test project-file.spec.mjs
//
// The vite-only baseURL from playwright.config.mjs is NOT used here.

const DEV_HOST = process.env.DEV_HOST || 'http://127.0.0.1:8020'
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const FIXTURE = 'houses/__pw-test.house.json'
const FIXTURE_ABS = path.join(ROOT, FIXTURE)
const APP_URL = `${DEV_HOST}/micro-apps/house-designer/?project=/micro-apps/${FIXTURE}&save=1&embed=1`

test.beforeEach(() => {
  copyFileSync(path.join(ROOT, 'houses/tiny-cabin.house.json'), FIXTURE_ABS)
})
test.afterEach(() => {
  rmSync(FIXTURE_ABS, { force: true })
})

async function waitForFileName(name, timeout = 5000) {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    try {
      if (JSON.parse(readFileSync(FIXTURE_ABS, 'utf8')).name === name) return true
    } catch {}
    await new Promise((r) => setTimeout(r, 200))
  }
  return false
}

test('loads the project from the file and hides persistence chrome', async ({ page }) => {
  await page.goto(APP_URL)
  await expect(page.locator('.name-input')).toHaveValue('Tiny Cabin')
  // Walls render (project has content, not the empty state)
  await expect(page.locator('.empty-card')).toBeHidden()
  expect(await page.locator('.stage svg g.wall line').count()).toBeGreaterThan(0)
  // Embed mode hides brand + file/cloud persistence UI
  await expect(page.locator('.brand')).toBeHidden()
  await expect(page.locator('.btn-open-file')).toBeHidden()
  await expect(page.locator('.btn-save-json')).toBeHidden()
  await expect(page.locator('.props-tabs .tab-cloud')).toBeHidden()
})

test('manual edits save back to the file (debounced PUT /__save)', async ({ page }) => {
  await page.goto(APP_URL)
  await expect(page.locator('.name-input')).toHaveValue('Tiny Cabin')
  await page.locator('.name-input').fill('PW Renamed')
  expect(await waitForFileName('PW Renamed')).toBe(true)
})

test('external file edits reload the app and are undoable', async ({ page }) => {
  await page.goto(APP_URL)
  await expect(page.locator('.name-input')).toHaveValue('Tiny Cabin')
  // Simulate the agent editing the file on disk
  const proj = JSON.parse(readFileSync(FIXTURE_ABS, 'utf8'))
  proj.name = 'Agent Edit'
  writeFileSync(FIXTURE_ABS, JSON.stringify(proj, null, 2))
  await expect(page.locator('.name-input')).toHaveValue('Agent Edit', { timeout: 5000 })
  // Ctrl+Z rolls the external edit back…
  await page.locator('.stage').click({ position: { x: 20, y: 20 } })
  await page.keyboard.press('Control+z')
  await expect(page.locator('.name-input')).toHaveValue('Tiny Cabin')
  // …and the rollback syncs back to the file
  expect(await waitForFileName('Tiny Cabin')).toBe(true)
})

test('save endpoint rejects bad paths and bad JSON', async ({ request }) => {
  const traversal = await request.put(`${DEV_HOST}/micro-apps/__save?path=houses/../script.js`, { data: '{}' })
  expect(traversal.status()).toBe(400)
  const badExt = await request.put(`${DEV_HOST}/micro-apps/__save?path=houses/evil.js`, { data: '{}' })
  expect(badExt.status()).toBe(400)
  const badJson = await request.put(`${DEV_HOST}/micro-apps/__save?path=${FIXTURE}`, { data: 'not json' })
  expect(badJson.status()).toBe(400)
})
