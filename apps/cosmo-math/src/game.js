// Challenge generation for Cosmo's Math Odyssey.
// Every planet has its own mix of seven challenge types.

import { PLANETS, RUN_SIZE, WORD_PROBLEMS } from './data.js'

export function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffle(list) {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

const pick = (list) => list[Math.floor(Math.random() * list.length)]

// ---------------------------------------------------------------------------
// Arithmetic kernels
// ---------------------------------------------------------------------------
function addWithin(max) {
  if (max <= 10) {
    const a = rand(1, 8)
    return { a, b: rand(1, 10 - a), op: '+' }
  }
  if (Math.random() < 0.55) {
    const a = rand(7, 15)
    return { a, b: rand(2, Math.min(9, 20 - a)), op: '+' }
  }
  const a = rand(2, 9)
  return { a, b: rand(2, 9), op: '+' }
}

function subWithin(max) {
  if (max <= 10) {
    const a = rand(3, 10)
    return { a, b: rand(1, a - 1), op: '−' }
  }
  const a = rand(9, 20)
  return { a, b: rand(2, Math.min(a - 1, 12)), op: '−' }
}

// Tens and ones, never crossing a ten (friendly for age 7).
function yardAdd() {
  if (Math.random() < 0.5) {
    const t1 = rand(1, 6)
    return { a: t1 * 10, b: 10 * rand(1, 9 - t1), op: '+' }
  }
  return { a: 10 * rand(2, 8), b: rand(1, 9), op: '+' }
}

function yardSub() {
  if (Math.random() < 0.5) {
    const tens = rand(3, 9)
    return { a: tens * 10, b: 10 * rand(1, tens - 1), op: '−' }
  }
  const ones = rand(1, 9)
  return { a: 10 * rand(2, 8) + ones, b: rand(1, ones), op: '−' }
}

function arithmetic(planet, forceOp) {
  const stage = planet.stage
  const op =
    forceOp ||
    (stage === 3
      ? Math.random() < 0.7
        ? '−'
        : '+'
      : Math.random() < 0.5
        ? '+'
        : '−')

  if (stage === 4) return op === '+' ? yardAdd() : yardSub()
  if (stage === 5) {
    if (Math.random() < 0.45) return op === '+' ? yardAdd() : yardSub()
    return op === '+' ? addWithin(20) : subWithin(20)
  }
  const max = stage === 1 ? 10 : 20
  return op === '+' ? addWithin(max) : subWithin(max)
}

function optionsFor(answer, extra = []) {
  const out = [answer]
  const candidates = shuffle([
    answer + 1,
    answer - 1,
    answer + 2,
    answer - 2,
    answer + 10,
    answer - 10,
    answer + 3,
    ...extra,
  ])
  for (const candidate of candidates) {
    if (out.length >= 4) break
    if (candidate < 0 || candidate > 120) continue
    if (out.includes(candidate)) continue
    out.push(candidate)
  }
  let filler = answer + 4
  while (out.length < 4) {
    if (!out.includes(filler)) out.push(filler)
    filler += 1
  }
  return shuffle(out)
}

// ---------------------------------------------------------------------------
// Challenge builders
// ---------------------------------------------------------------------------
function makeChoice(planet) {
  const { a, b, op } = arithmetic(planet)
  const answer = op === '+' ? a + b : a - b
  return {
    id: `choice:${a}${op}${b}`,
    type: 'choice',
    a,
    b,
    op,
    answer,
    options: optionsFor(answer, [op === '+' ? Math.abs(a - b) : a + b]),
  }
}

function makeMissing(planet) {
  const { a, b } = arithmetic(planet, '+')
  const total = a + b
  const hideA = a <= 8 && Math.random() < 0.35
  const answer = hideA ? a : b
  return {
    id: `missing:${a}+${b}`,
    type: 'missing',
    a,
    b,
    total,
    hide: hideA ? 'a' : 'b',
    answer,
    op: '+',
    options: optionsFor(answer, [total, total - answer + 1]),
  }
}

function wrapValue(value, planet) {
  if (planet.stage >= 4 && value >= 10) {
    const ones = value % 10
    if (ones > 0) return { a: value - ones, op: '+', b: ones }
    return { a: value - 10, op: '+', b: 10 }
  }
  if (value >= 2 && Math.random() < 0.55) {
    const a = rand(1, value - 1)
    return { a, op: '+', b: value - a }
  }
  const b = rand(1, 9)
  return { a: value + b, op: '−', b }
}

function makeCompare(planet) {
  const max = planet.stage === 1 ? 10 : planet.stage >= 4 ? 90 : 20
  const equal = Math.random() < 0.28
  let lv = rand(4, max)
  let rv = lv
  if (!equal) {
    let guard = 0
    while (rv === lv && guard < 30) {
      rv = rand(4, max)
      guard += 1
    }
    if (rv === lv) rv = lv === max ? max - 1 : lv + 1
  }
  const left = wrapValue(lv, planet)
  const right = wrapValue(rv, planet)
  return {
    id: `compare:${left.a}${left.op}${left.b}|${right.a}${right.op}${right.b}`,
    type: 'compare',
    left,
    right,
    leftValue: lv,
    rightValue: rv,
    answer: lv < rv ? '<' : lv > rv ? '>' : '=',
  }
}

function makeSequence(planet) {
  const step = pick(planet.steps)
  const slots = step >= 10 ? 5 : step === 5 ? 3 : 6
  const start = step * rand(1, slots)
  const terms = Array.from({ length: 5 }, (_, i) => start + i * step)
  const hide = rand(1, 3)
  const answer = terms[hide]
  return {
    id: `seq:${terms.join(',')}:${hide}`,
    type: 'sequence',
    terms,
    hide,
    step,
    answer,
    options: optionsFor(answer, [answer + step, answer - step, answer + 1]),
  }
}

function makePair() {
  const tiles = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 8)
  return {
    id: `pair:${tiles.join('')}`,
    type: 'pair',
    target: 10,
    tiles,
    answer: 10,
  }
}

function makeBuild(planet) {
  const tens = rand(2, 8)
  const ones = rand(1, 9)
  const target = tens * 10 + ones
  return {
    id: `build:${planet.id}:${target}`,
    type: 'build',
    target,
    answer: target,
  }
}

function makeWord(planet) {
  const op = planet.stage === 3 ? '−' : Math.random() < 0.6 ? '−' : '+'
  const template = pick(WORD_PROBLEMS.en.filter((p) => p.op === op))
  const { a, b } = arithmetic(planet, op)
  const answer = op === '+' ? a + b : a - b
  return {
    id: `word:${template.id}:${a}:${b}`,
    type: 'word',
    wordId: template.id,
    op,
    a,
    b,
    answer,
    options: optionsFor(answer, [op === '+' ? Math.abs(a - b) : a + b]),
  }
}

function makeChallenge(type, planet) {
  switch (type) {
    case 'pair':
      return makePair(planet)
    case 'missing':
      return makeMissing(planet)
    case 'compare':
      return makeCompare(planet)
    case 'sequence':
      return makeSequence(planet)
    case 'build':
      return makeBuild(planet)
    case 'word':
      return makeWord(planet)
    case 'choice':
    default:
      return makeChoice(planet)
  }
}

export function makeRun(planet, forcedType) {
  const types = forcedType ? Array(RUN_SIZE).fill(forcedType) : planet.types
  const run = []
  const seen = new Set()
  for (const type of types.slice(0, RUN_SIZE)) {
    let challenge
    let guard = 0
    do {
      challenge = makeChallenge(type, planet)
      guard += 1
    } while (seen.has(challenge.id) && guard < 60)
    seen.add(challenge.id)
    run.push(challenge)
  }
  return run
}

// Counting beans: small numbers become single beans, larger ones become
// "ten bundles" plus loose beans so 47 is four bundles + seven beans.
function beans(n) {
  if (n <= 20) return Array.from({ length: n }, () => 1)
  const tens = Math.floor(n / 10)
  const ones = n % 10
  return [
    ...Array.from({ length: tens }, () => 10),
    ...Array.from({ length: ones }, () => 1),
  ]
}

export function helperLayout(challenge) {
  if (!challenge) return null
  if (challenge.type === 'missing') {
    const given = challenge.hide === 'a' ? challenge.b : challenge.a
    return {
      mode: 'missing',
      groups: [
        { key: 'given', tokens: beans(given).map((value) => ({ value, state: 'given' })) },
        {
          key: 'ask',
          tokens: Array.from({ length: challenge.answer }, () => ({ value: 1, state: 'ask' })),
        },
      ],
    }
  }
  if (!['choice', 'word'].includes(challenge.type)) return null
  if (challenge.op === '−') {
    return {
      mode: 'sub',
      groups: [
        {
          key: 'a',
          tokens: beans(challenge.a).map((value, index) => ({
            value,
            state: 'plain',
            index,
          })),
        },
      ],
    }
  }
  return {
    mode: 'sum',
    groups: [
      { key: 'a', tokens: beans(challenge.a).map((value) => ({ value, state: 'plain' })) },
      { key: 'b', tokens: beans(challenge.b).map((value) => ({ value, state: 'plain' })) },
    ],
  }
}

// For subtraction we fade the last `b` worth of beans (counted from the end).
export function withRemoved(layout, b) {
  if (!layout || layout.mode !== 'sub') return layout
  const tokens = layout.groups[0].tokens.map((token) => ({ ...token }))
  let left = b
  for (let i = tokens.length - 1; i >= 0 && left > 0; i -= 1) {
    if (tokens[i].value <= left) {
      tokens[i].state = 'gone'
      left -= tokens[i].value
    }
  }
  return { ...layout, groups: [{ key: 'a', tokens }] }
}
