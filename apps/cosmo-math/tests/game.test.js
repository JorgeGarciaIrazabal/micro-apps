import { test } from 'node:test'
import assert from 'node:assert/strict'
import { PLANETS, RUN_SIZE } from '../src/data.js'
import { makeRun, helperLayout, withRemoved } from '../src/game.js'

test('every world keeps eight math tasks within its number range', () => {
  assert.equal(PLANETS.length, 12)
  assert.equal(new Set(PLANETS.map(p => p.id)).size, 12)
  for (const planet of PLANETS) for (let n = 0; n < 200; n++) {
    const run = makeRun(planet)
    assert.equal(run.length, RUN_SIZE)
    for (const c of run) {
      if (c.type === 'sequence') {
        assert.ok(c.terms.every(v => v >= 0 && v <= planet.max))
        assert.equal(c.terms[c.hide], c.answer)
      } else if (['choice', 'word'].includes(c.type)) {
        assert.equal(c.answer, c.op === '+' ? c.a + c.b : c.a - c.b)
        assert.ok(c.answer >= 0 && c.answer <= planet.max)
      }
      if (c.options) {
        assert.equal(new Set(c.options).size, 4)
        assert.ok(c.options.includes(c.answer))
      }
    }
  }
})

test('subtraction beans preserve both the starting number and amount removed when borrowing', () => {
  for (let a = 3; a <= 100; a++) for (let b = 1; b < a; b++) {
    const layout = withRemoved(helperLayout({ type: 'choice', op: '−', a, b }), b)
    const tokens = layout.groups[0].tokens
    assert.equal(tokens.reduce((s, t) => s + t.value, 0), a)
    assert.equal(tokens.filter(t => t.state === 'gone').reduce((s, t) => s + t.value, 0), b)
  }
})
