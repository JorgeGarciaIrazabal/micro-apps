// Question generation for Cosmo's Math Planet.
// Difficulty stays "friendly": no borrowing/carrying jumps at level 3.

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

function addition(level) {
  if (level === 1) {
    const a = rand(1, 8)
    return { a, b: rand(1, 10 - a), op: '+' }
  }
  if (level === 2) {
    const a = rand(3, 15)
    return { a, b: rand(1, Math.min(9, 20 - a)), op: '+' }
  }
  // Level 3 — tens plus tens, or tens plus ones (never crosses a ten).
  if (Math.random() < 0.5) {
    const a = 10 * rand(1, 7)
    return { a, b: 10 * rand(1, (90 - a) / 10), op: '+' }
  }
  return { a: 10 * rand(2, 8), b: rand(1, 9), op: '+' }
}

function subtraction(level) {
  if (level === 1) {
    const a = rand(3, 10)
    return { a, b: rand(1, a - 1), op: '−' }
  }
  if (level === 2) {
    const a = rand(8, 20)
    return { a, b: rand(1, Math.min(a - 1, 10)), op: '−' }
  }
  // Level 3 — take away whole tens, or take ones away without borrowing.
  if (Math.random() < 0.5) {
    const tens = rand(2, 9)
    return { a: tens * 10, b: 10 * rand(1, tens - 1), op: '−' }
  }
  const ones = rand(1, 9)
  return { a: 10 * rand(2, 8) + ones, b: rand(1, ones), op: '−' }
}

function buildOptions(a, b, op) {
  const answer = op === '+' ? a + b : a - b
  const pool = shuffle([
    answer + 1,
    answer - 1,
    answer + 2,
    answer - 2,
    answer + 10,
    answer - 10,
    a + b,
    Math.abs(a - b),
    answer + 3,
  ])
  const options = [answer]
  for (const candidate of pool) {
    if (options.length === 4) break
    if (candidate < 0 || candidate > 110) continue
    if (options.includes(candidate)) continue
    options.push(candidate)
  }
  let filler = answer + 4
  while (options.length < 4) {
    if (!options.includes(filler)) options.push(filler)
    filler += 1
  }
  return { answer, options: shuffle(options) }
}

export function makeRound(level, op, size) {
  const questions = []
  const seen = new Set()
  let guard = 0
  while (questions.length < size && guard < 600) {
    guard += 1
    const useSub = op === 'sub' || (op === 'mix' && Math.random() < 0.5)
    const draft = useSub ? subtraction(level) : addition(level)
    const key = `${draft.a}${draft.op}${draft.b}`
    if (seen.has(key)) continue
    if (draft.op === '−' && draft.b >= draft.a) continue
    seen.add(key)
    questions.push({ ...draft, ...buildOptions(draft.a, draft.b, draft.op), id: key })
  }
  return questions
}

// Counting beans: small numbers become single beans, larger ones become
// "ten bundles" plus loose beans so 47 is four bundles + seven beans.
export function tokenize(n) {
  if (n <= 20) return Array.from({ length: n }, () => 1)
  const tens = Math.floor(n / 10)
  const ones = n % 10
  return [
    ...Array.from({ length: tens }, () => 10),
    ...Array.from({ length: ones }, () => 1),
  ]
}
