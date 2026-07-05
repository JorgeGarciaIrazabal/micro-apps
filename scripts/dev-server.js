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

// --- houses/ data files: save endpoint + change watcher -----------------------
// Apps loaded with ?project=/micro-apps/houses/<f>.house.json&save=1 PUT their
// state back through /micro-apps/__save and refetch on `houses-changed` SSE
// events (agent edits the same files directly on disk).
const HOUSES_DIR = path.join(ROOT, 'houses')
const selfWrites = new Map() // rel path -> body of last /__save write (echo suppression)

function housesRelPath(raw) {
  // Accept "houses/name.house.json" (optionally prefixed with BASE); reject the rest.
  if (typeof raw !== 'string') return null
  let rel = raw.startsWith(BASE) ? raw.slice(BASE.length) : raw.replace(/^\//, '')
  if (!/^houses\/[\w][\w .()-]*\.house\.json$/.test(rel)) return null
  const abs = path.resolve(ROOT, rel)
  if (!abs.startsWith(HOUSES_DIR + path.sep)) return null
  return rel
}

function handleSave(req, res, query) {
  const rel = housesRelPath(query.get('path'))
  if (!rel) { res.writeHead(400, { 'content-type': 'application/json' }); return res.end('{"ok":false,"error":"invalid path"}') }
  const chunks = []
  let size = 0
  req.on('data', (c) => {
    size += c.length
    if (size > 5 * 1024 * 1024) { req.destroy(); return }
    chunks.push(c)
  })
  req.on('end', () => {
    const body = Buffer.concat(chunks).toString('utf8')
    try { JSON.parse(body) } catch {
      res.writeHead(400, { 'content-type': 'application/json' })
      return res.end('{"ok":false,"error":"body is not valid JSON"}')
    }
    try {
      fs.mkdirSync(HOUSES_DIR, { recursive: true })
      const abs = path.join(ROOT, rel)
      const tmp = abs + '.tmp'
      fs.writeFileSync(tmp, body)
      fs.renameSync(tmp, abs)
      selfWrites.set(rel, body)
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end('{"ok":true}')
    } catch (e) {
      res.writeHead(500, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ ok: false, error: e.message }))
    }
  })
}

function handleHousesList(res) {
  let files = []
  try {
    files = fs.readdirSync(HOUSES_DIR)
      .filter((f) => f.endsWith('.house.json'))
      .map((f) => {
        const st = fs.statSync(path.join(HOUSES_DIR, f))
        return { path: `houses/${f}`, name: f.replace(/\.house\.json$/, ''), size: st.size, modified: st.mtimeMs }
      })
  } catch {}
  res.writeHead(200, { 'content-type': 'application/json' })
  res.end(JSON.stringify({ houses: files }))
}

// Watch houses/ and notify SSE listeners (debounced per file; skip our own
// /__save echoes so an app saving its project doesn't reload itself).
const housesDebounce = new Map() // rel path -> timer
try {
  fs.mkdirSync(HOUSES_DIR, { recursive: true })
  fs.watch(HOUSES_DIR, (_ev, filename) => {
    if (!filename || !filename.endsWith('.house.json')) return
    const rel = `houses/${filename}`
    clearTimeout(housesDebounce.get(rel))
    housesDebounce.set(rel, setTimeout(() => {
      housesDebounce.delete(rel)
      // Echo suppression by CONTENT: only skip if the file still holds exactly
      // what /__save last wrote — an agent edit moments after a user save must
      // still broadcast.
      try {
        if (selfWrites.get(rel) === fs.readFileSync(path.join(ROOT, rel), 'utf8')) return
      } catch {}
      for (const res of landingWatchers) {
        res.write(`event: houses-changed\ndata: ${JSON.stringify({ path: rel })}\n\n`)
      }
    }, 150))
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
  const reqUrl = new URL(req.url, 'http://localhost')
  const urlPath = reqUrl.pathname

  // houses/ data endpoints
  if (urlPath === path.posix.join(BASE, '__save') && (req.method === 'PUT' || req.method === 'POST')) {
    return handleSave(req, res, reqUrl.searchParams)
  }
  if (urlPath === path.posix.join(BASE, '__houses') && req.method === 'GET') {
    return handleHousesList(res)
  }

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

  // Serve static files from root directory if it starts with BASE
  if (urlPath.startsWith(BASE)) {
    const relativePath = urlPath.slice(BASE.length)
    const filePath = path.join(ROOT, relativePath)
    
    // Safety check: ensure file is inside ROOT
    if (filePath.startsWith(ROOT) && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase()
      const mimeTypes = {
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.svg': 'image/svg+xml',
        '.json': 'application/json',
        '.gif': 'image/gif',
        '.ico': 'image/x-icon'
      }
      const contentType = mimeTypes[ext] || 'application/octet-stream'
      res.writeHead(200, { 'content-type': contentType })
      fs.createReadStream(filePath).pipe(res)
      return
    }
  }

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