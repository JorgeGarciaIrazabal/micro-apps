import { test } from 'node:test'
import assert from 'node:assert/strict'
import { PLANETS, RUN_SIZE } from '../src/data.js'
import { makeRun, helperLayout, withRemoved } from '../src/game.js'
import { QUESTS } from '../src/quests.js'

test('every world keeps eight math tasks within its number range', () => {
  assert.equal(PLANETS.length, 12)
  assert.equal(new Set(PLANETS.map(p => p.id)).size, 12)
  for (const planet of PLANETS) for (let n = 0; n < 200; n++) {
    const run = makeRun(planet)
    assert.equal(run.length, RUN_SIZE)
    for (const c of run) {
      if (c.type === 'rocket') {
        assert.ok(c.target > c.start && c.target <= planet.max)
        assert.equal((c.target - c.start) % c.step, 0)
      } else if (c.type === 'balance') {
        assert.ok(c.cargo.some((a, i) => c.cargo.some((b, j) => i !== j && a + b + c.fixed === c.target)))
      } else if (c.type === 'share') {
        assert.equal(c.total / c.groups, c.each)
      } else if (c.type === 'sequence') {
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


test('30 break games generate solvable puzzles', () => {
  const types = ['rocket','balance','share',...QUESTS.map(q => q.id)]
  assert.equal(types.length, 30)
  assert.equal(new Set(types).size, 30)
  for (let n = 0; n < 100; n++) for (const type of types) {
    const c = makeRun(PLANETS[n % PLANETS.length], type)[0]
    if (c.mode === 'select' && !c.answer) {
      const possible = Array.from({length:1 << c.values.length},(_,mask) => c.values.filter((_,i)=>mask & (1<<i)))
      assert.ok(possible.some(a => a.reduce((x,y)=>x+y,0)===c.target && (!c.required || a.length === c.required)), type)
    }
    if (c.type === 'target') assert.ok([1,2,3,4,5,6].some(a => c.target%a===0 && c.target/a<=6))
    if (c.type === 'jump') assert.ok(c.target >= 3 && c.target <= 9)
    if (c.mode === 'grid' && c.type === 'area') assert.ok([1,2,3,4].some(a=>c.target%a===0 && c.target/a<=4))
    if (c.type === 'rocket') assert.equal((c.target-c.start)%c.step,0)
    if (c.type === 'balance') assert.ok(c.cargo.some((a,i)=>c.cargo.some((b,j)=>i!==j && a+b+c.fixed===c.target)))
  }
})
