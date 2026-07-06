// Build-time encryption. Reads ENCRYPTION_PASSWORD from .env, encrypts the
// plaintext budget data (src/data.plain.js) and writes src/encrypted-data.json.
//
// Run:  npm run encrypt   (re-run whenever you edit src/data.plain.js)
//
// Only the encrypted output is committed & shipped. The plaintext and the
// password never leave your machine. Params must match src/crypto.js.

import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const APP_DIR = path.resolve(__dirname, '..')
const ROOT_DIR = path.resolve(APP_DIR, '..', '..')
const ITERATIONS = 250000

function readPassword() {
  if (process.env.ENCRYPTION_PASSWORD) return process.env.ENCRYPTION_PASSWORD
  for (const envPath of [path.join(APP_DIR, '.env'), path.join(ROOT_DIR, '.env')]) {
    if (!fs.existsSync(envPath)) continue
    for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
      const m = line.match(/^\s*ENCRYPTION_PASSWORD\s*=\s*(.*?)\s*$/)
      if (m) return m[1].replace(/^["']|["']$/g, '')
    }
  }
  return null
}

const password = readPassword()
if (!password) {
  console.error('✖ ENCRYPTION_PASSWORD not found in environment or .env')
  process.exit(1)
}

const { CATEGORIES, RECURRING, ONETIME, DEFAULT_PARAMS } = await import('../src/data.plain.js')
const plaintext = JSON.stringify({ CATEGORIES, RECURRING, ONETIME, DEFAULT_PARAMS })

const salt = crypto.randomBytes(16)
const iv = crypto.randomBytes(12)
const key = crypto.pbkdf2Sync(password, salt, ITERATIONS, 32, 'sha256')
const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
const ct = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
const tag = cipher.getAuthTag() // 16 bytes, appended so Web Crypto can verify

const out = {
  v: 1,
  kdf: 'PBKDF2-SHA256',
  cipher: 'AES-256-GCM',
  iterations: ITERATIONS,
  salt: salt.toString('base64'),
  iv: iv.toString('base64'),
  ct: Buffer.concat([ct, tag]).toString('base64'),
}

const outPath = path.join(APP_DIR, 'src', 'encrypted-data.json')
fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n')
console.log(`✔ Encrypted ${plaintext.length} bytes → src/encrypted-data.json`)
console.log('  Plaintext stays local (data.plain.js is gitignored); only ciphertext ships.')
