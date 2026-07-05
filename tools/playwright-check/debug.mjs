import { chromium } from '@playwright/test'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
const errs = []
page.on('pageerror', (e) => errs.push('PAGEERROR: ' + (e.stack || e)))
await page.goto('http://127.0.0.1:5182/micro-apps/house-designer/')
await page.waitForTimeout(400)

const probe = async (label) => {
  const r = await page.evaluate(() => {
    const svg = document.querySelector('.stage svg')
    return {
      rootChildren: document.getElementById('root')?.children.length,
      svgW: svg?.getAttribute('width'),
      svgH: svg?.getAttribute('height'),
      stageW: document.querySelector('.stage')?.getBoundingClientRect().width,
      gTransform: svg?.querySelectorAll('g[transform]').length,
      linesUnderG: svg?.querySelectorAll('g[transform] > g > line').length,
      allLines: svg?.querySelectorAll('line').length,
      toolActive: document.querySelector('.tool-btn.active')?.textContent?.trim(),
    }
  })
  console.log(label, JSON.stringify(r))
}

await page.locator('.tool-btn', { hasText: 'Wall' }).click()
await probe('after Wall click: ')
const svg = page.locator('.stage svg')
await svg.click({ position: { x: 200, y: 150 } })
await probe('after click 1: ')
await svg.click({ position: { x: 360, y: 150 } })
await probe('after click 2: ')
await page.keyboard.press('Escape')
await page.waitForTimeout(300)
await probe('after Escape: ')
console.log('ERRORS:', JSON.stringify(errs, null, 0))
await page.screenshot({ path: 'screenshots/debug-wall.png' })
await browser.close()