#!/usr/bin/env node
// Dev orchestrator: serves the static landing at /micro-apps/ and proxies each
// app's Vite dev server (incl. websocket HMR) under /micro-apps/<app>/*.
//
// Pure Node builtins — no root deps required. Run: `node scripts/dev-server.js`
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import http from 'node:http'
import net from 'node:net'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const ROOT = path.resolve(path.dirname(__filename), '..')
const PORT = parseInt(process.env.PORT || '8000', 10)
const BASE = '/micro-apps/'

// --- discover apps -----------------------------------------------------------
const apps = []
for (const entry of fs.readdirSync(path.join(ROOT, 'apps'))) {
  const appDir = path.join(ROOT, 'apps', entry)
  if (!fs.statSync(appDir).isDirectory()) continue
  const pkgPath = path.join(appDir, 'package.json')
  if (!fs.existsSync(pkgPath)) continue
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
  if (!pkg.scripts?.dev) continue
  // derive base from vite.config.js (fallback to convention)
  let base = `${BASE}${entry}/`
  const cfgPath = path.join(appDir, 'vite.config.js')
  if (fs.existsSync(cfgPath)) {
    const cfg = fs.readFileSync(cfgPath, 'utf8')
    const m = cfg.match(/base\s*:\s*['"]([^'"]+)['"]/)
    if (m) base = m[1]
  }
  apps.push({ name: entry, dir: appDir, base, port: 0 })
}

if (apps.length === 0) {
  console.error('\u2717 no Vite apps found under apps/*')
  process.exit(1)
}

// assign deterministic ports (5173+)
apps.forEach((a, i) => { a.port = 5173 + i })

// --- launch each app's vite dev server ---------------------------------------
const procs = []
for (const a of apps) {
  if (!fs.existsSync(path.join(a.dir, 'node_modules'))) {
    console.error(`\u2717 ${a.name}: node_modules missing. Run "npm install" in apps/${a.name} first.`)
    process.exit(1)
  }
  const p = spawn('npm', ['run', 'dev', '--', '--port', String(a.port), '--strictPort', '--host'], {
    cwd: a.dir,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  p.stdout.on('data', (d) => process.stdout.write(`[${a.name}] ${d}`))
  p.stderr.on('data', (d) => process.stderr.write(`[${a.name}] ${d}`))
  p.on('exit', (code) => console.log(`[${a.name}] vite exited (code ${code})`))
  procs.push(p)
}

// --- SSE for landing hot-reload ---------------------------------------------
const landingWatchers = new Set()
let landingTs = 0
try {
  fs.watch(path.join(ROOT, 'index.html'), () => {
    landingTs = Date.now()
    for (const res of landingWatchers) {
      res.write(`event: reload\ndata: ${landingTs}\n\n`)
    }
  })
} catch {}

const LANDING_SNIPPET = `
<script>(function(){
  const es = new EventSource('/micro-apps/__hmr');
  es.addEventListener('reload', () => location.reload());
})();</script>
`

function serveLanding(res) {
  try {
    let html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')
    if (html.includes('</body>')) html = html.replace('</body>', `${LANDING_SNIPPET}</body>`)
    else html += LANDING_SNIPPET
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
    res.end(html)
  } catch (e) {
    res.writeHead(500); res.end('landing read error: ' + e.message)
  }
}

// --- HTTP proxy ---------------------------------------------------------------
function pickApp(urlPath) {
  for (const a of apps) {
    if (urlPath === a.base || urlPath.startsWith(a.base)) return a
  }
  return null
}

function proxy(req, res, a) {
  const target = new URL(req.url, `http://localhost:${a.port}`)
  const upstream = http.request(target, {
    method: req.method,
    headers: { ...req.headers, host: target.host },
  }, (upRes) => {
    res.writeHead(upRes.statusCode, upRes.headers)
    upRes.pipe(res)
  })
  upstream.on('error', (e) => { res.writeHead(502); res.end('bad gateway: ' + e.message) })
  req.pipe(upstream)
}

const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0]

  // landing page (matches prod URL structure)
  if (urlPath === '/') {
    res.writeHead(302, { location: BASE })
    return res.end()
  }
  if (urlPath === BASE || urlPath === '/micro-apps' || urlPath === path.posix.join(BASE, 'index.html')) {
    return serveLanding(res)
  }

  // SSE endpoint for landing HMR
  if (urlPath === path.posix.join(BASE, '__hmr')) {
    res.writeHead(200, {
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache',
      connection: 'keep-alive',
    })
    res.write('retry: 1000\n\n')
    landingWatchers.add(res)
    req.on('close', () => landingWatchers.delete(res))
    return
  }

  const a = pickApp(urlPath)
  if (a) return proxy(req, res, a)

  res.writeHead(404); res.end('not found')
})

// websocket upgrades (HMR) — relay raw TCP; Node's http.request rejects ws:
server.on('upgrade', (req, socket) => {
  const urlPath = (req.url || '').split('?')[0]
  const a = pickApp(urlPath)
  if (!a) { socket.destroy(); return }
  const upstream = net.connect(a.port, 'localhost', () => {
    let raw = `${req.method} ${req.url} HTTP/1.1\r\n`
    for (const [k, v] of Object.entries(req.headers)) raw += `${k}: ${v}\r\n`
    raw += '\r\n'
    upstream.write(raw)
    upstream.pipe(socket)
    socket.pipe(upstream)
  })
  upstream.on('error', () => socket.destroy())
  socket.on('error', () => upstream.destroy())
})

// --- cleanup ------------------------------------------------------------------
function shutdown() {
  for (const p of procs) { try { p.kill('SIGTERM') } catch {} }
  server.close()
  process.exit(0)
}
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

server.listen(PORT, () => {
  console.log(`\n\u2705 dev server up: http://localhost:${PORT}${BASE}`)
  console.log(`   landing:  ${BASE}`)
  for (const a of apps) console.log(`   ${a.name.padEnd(28)} \u2192 ${a.base} (vite :${a.port})\n`)
})