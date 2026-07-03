#!/usr/bin/env node
// .claude/skills/house-design/lint-layout.mjs
// Standalone layout-quality linter for House Designer project JSON files.
// Imports the same rules used by the app so results stay in sync.
//
// Usage:
//   node lint-layout.mjs <file.house.json> [file2.house.json ...]
//
// Exit codes: 0 = no layout issues; 1 = at least one error or warning.

import fs from 'node:fs'
import path from 'node:path'
import { lintProject } from '../../../apps/house-designer/src/lib/layout-linter.js'

const argv = process.argv.slice(2)
const files = argv.filter((a) => !a.startsWith('--'))
const QUIET = argv.includes('--quiet')

if (files.length === 0) {
  console.error('Usage: node lint-layout.mjs <file.house.json> [files...] [--quiet]')
  process.exit(2)
}

function fmtFile(p) {
  const rel = path.relative(process.cwd(), path.resolve(p))
  return rel.startsWith('..') ? path.resolve(p) : rel
}

let totalErrors = 0
let totalWarnings = 0

for (const file of files) {
  let raw
  try {
    raw = fs.readFileSync(path.resolve(file), 'utf8')
  } catch (e) {
    console.error(`\n=== ${fmtFile(file)} ===`)
    console.error(`  ✗ cannot read file: ${e.message}`)
    totalErrors++
    continue
  }

  let project
  try {
    project = JSON.parse(raw)
  } catch (e) {
    console.error(`\n=== ${fmtFile(file)} ===`)
    console.error(`  ✗ invalid JSON: ${e.message}`)
    totalErrors++
    continue
  }

  const issues = lintProject(project)
  const errors = issues.filter((i) => i.severity === 'error')
  const warnings = issues.filter((i) => i.severity === 'warning')
  totalErrors += errors.length
  totalWarnings += warnings.length

  if (!QUIET || issues.length) {
    console.error(`\n=== ${fmtFile(file)} ===`)
    for (const issue of issues) {
      const icon = issue.severity === 'error' ? '✗' : '⚠'
      const floorName = issue.floor?.name || 'floor'
      console.error(`  ${icon} [${issue.rule}] ${floorName}: ${issue.message}`)
    }
    if (issues.length === 0) console.error(`  ✓ layout clean`)
  }
}

console.error('')
if (totalErrors || totalWarnings) {
  console.error(`❌ layout issues: ${totalErrors} error(s), ${totalWarnings} warning(s)`)
  process.exit(1)
}
console.error('✓ all files layout-clean.')
process.exit(0)
