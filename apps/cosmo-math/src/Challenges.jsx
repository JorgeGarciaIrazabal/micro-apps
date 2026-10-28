import QuestGame from './QuestGames.jsx'
import Minigame from './Minigames.jsx'
import { useEffect, useMemo, useRef, useState } from 'react'
import { WORD_PROBLEMS } from './data.js'
import { helperLayout, withRemoved } from './game.js'

// ---------------------------------------------------------------------------
// Shared option bubbles
// ---------------------------------------------------------------------------
function OptionGrid({ options, answer, solved, onAttempt }) {
  const [wrong, setWrong] = useState([])

  useEffect(() => {
    setWrong([])
  }, [options, answer])

  const tap = (option) => {
    if (solved || wrong.includes(option)) return
    if (option === answer) {
      onAttempt(true)
      return
    }
    setWrong((prev) => [...prev, option])
    onAttempt(false)
  }

  return (
    <div className="options" role="group">
      {options.map((option, i) => {
        const isWrong = wrong.includes(option)
        const isRight = solved && option === answer
        return (
          <button
            key={`${option}-${i}`}
            type="button"
            className={`bubble bubble--${i % 4} ${isWrong ? 'bubble--wrong' : ''} ${
              isRight ? 'bubble--right' : ''
            }`}
            onClick={() => tap(option)}
            disabled={isWrong || solved}
          >
            <span className="bubble-shine" aria-hidden="true" />
            <span className="bubble-num">{option}</span>
          </button>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Counting beans
// ---------------------------------------------------------------------------
function HelperPanel({ layout, t, question }) {
  const [counted, setCounted] = useState({})

  useEffect(() => {
    setCounted({})
  }, [question.id])

  const total = useMemo(() => {
    return Object.entries(counted).reduce((sum, [key, on]) => {
      if (!on) return sum
      const [gi, ti] = key.split('-').map(Number)
      const token = layout.groups[gi]?.tokens[ti]
      return token ? sum + token.value : sum
    }, 0)
  }, [counted, layout])

  const toggle = (gi, ti, token) => {
    if (token.state === 'gone' || token.state === 'given') return
    setCounted((prev) => ({ ...prev, [`${gi}-${ti}`]: !prev[`${gi}-${ti}`] }))
  }

  return (
    <div className="helper">
      <div className="helper-head">
        <span className="helper-title">🫘 {t.countWithMe}</span>
        <span className={`helper-count ${total > 0 ? 'is-live' : ''}`}>
          {t.counted}: {total}
        </span>
      </div>

      <div className="helper-groups">
        {layout.groups.map((group, gi) => (
          <div className="helper-group" key={group.key}>
            {gi > 0 && layout.mode !== 'missing' ? (
              <span className="helper-op">{question.op}</span>
            ) : null}
            <div className="tokens">
              {group.tokens.map((token, ti) => {
                const key = `${gi}-${ti}`
                const tappable = token.state === 'plain' || token.state === 'ask'
                return (
                  <button
                    key={key}
                    type="button"
                    className={[
                      'token',
                      token.value === 10 ? 'token--bundle' : '',
                      token.state === 'gone' ? 'token--removed' : '',
                      token.state === 'given' ? 'token--given' : '',
                      token.state === 'ask' ? 'token--ask' : '',
                      counted[key] ? 'token--on' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => toggle(gi, ti, token)}
                    disabled={!tappable}
                    aria-pressed={Boolean(counted[key])}
                    aria-label={tappable ? `${token.value}` : undefined}
                  >
                    {token.value === 10 ? '10' : ''}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <p className="helper-note">
        {layout.mode === 'missing'
          ? t.helperMissingNote.replace('{total}', question.total)
          : layout.mode === 'sub'
            ? t.helperSubNote.replace('{a}', question.a).replace('{b}', question.b)
            : t.helperSumNote}
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Prompts
// ---------------------------------------------------------------------------
function Equation({ challenge, solved }) {
  const hidden = solved ? challenge.answer : '?'
  return (
    <div className={`equation equation--${challenge.type}`}>
      <span className="problem-num">{challenge.a}</span>
      <span className="problem-op">{challenge.op}</span>
      <span className="problem-num">{challenge.b}</span>
      <span className="problem-eq">=</span>
      <span className={`problem-answer ${solved ? 'is-revealed' : ''}`}>{hidden}</span>
    </div>
  )
}

function MissingEquation({ challenge, prompt, solved }) {
  const hideA = challenge.hide === 'a'
  const answer = solved ? challenge.answer : '?'
  return (
    <>
      <div className="equation equation--missing">
        {hideA ? (
          <span className={`gap ${solved ? 'is-revealed' : ''}`}>{answer}</span>
        ) : (
          <span className="problem-num">{challenge.a}</span>
        )}
        <span className="problem-op">+</span>
        {hideA ? (
          <span className="problem-num">{challenge.b}</span>
        ) : (
          <span className={`gap ${solved ? 'is-revealed' : ''}`}>{answer}</span>
        )}
        <span className="problem-eq">=</span>
        <span className="problem-total">{challenge.total}</span>
      </div>
      <p className="prompt-line">{prompt}</p>
    </>
  )
}

function Sequence({ challenge, prompt, solved }) {
  return (
    <>
      <div className="sequence">
        {challenge.terms.map((term, i) =>
          i === challenge.hide ? (
            <span
              key={`gap-${i}`}
              className={`stone stone--gap ${solved ? 'is-filled' : ''}`}
            >
              {solved ? challenge.answer : '?'}
            </span>
          ) : (
            <span key={`${term}-${i}`} className="stone">
              {term}
            </span>
          ),
        )}
      </div>
      <p className="prompt-line">
        {prompt}
        <span className="step-chip">+{challenge.step}</span>
      </p>
    </>
  )
}

function Story({ challenge, lang, solved }) {
  const template =
    WORD_PROBLEMS[lang].find((p) => p.id === challenge.wordId) ||
    WORD_PROBLEMS.en.find((p) => p.id === challenge.wordId)
  const text = template.text.replace('{a}', challenge.a).replace('{b}', challenge.b)
  return (
    <div className={`story ${solved ? 'story--solved' : ''}`}>
      <span className="story-emoji" aria-hidden="true">
        {template.emoji}
      </span>
      <p className="story-text">{text}</p>
    </div>
  )
}

function Compare({ challenge, prompt, t, solved, onAttempt }) {
  const [wrong, setWrong] = useState([])

  useEffect(() => {
    setWrong([])
  }, [challenge.id])

  const tilt = solved
    ? challenge.leftValue > challenge.rightValue
      ? -7
      : challenge.leftValue < challenge.rightValue
        ? 7
        : 0
    : 0

  const choose = (sign) => {
    if (solved) return
    if (sign === challenge.answer) {
      onAttempt(true)
    } else {
      setWrong((prev) => [...prev, sign])
      onAttempt(false)
    }
  }

  const side = (expr, value) => (
    <div className="pan">
      <span className="pan-string" />
      <div className="pan-plate">
        <span className="expr">
          <b>{expr.a}</b>
          <i>{expr.op}</i>
          <b>{expr.b}</b>
        </span>
        <span className={`expr-value ${solved ? 'is-shown' : ''}`}>
          {solved ? `= ${value}` : ''}
        </span>
      </div>
    </div>
  )

  return (
    <>
      <div className="balance">
        <div
          className="balance-beam"
          style={{ transform: `rotate(${tilt}deg)` }}
        >
          {side(challenge.left, challenge.leftValue)}
          {side(challenge.right, challenge.rightValue)}
        </div>
        <span className="balance-stand" aria-hidden="true" />
        <span className="balance-foot" aria-hidden="true" />
      </div>

      <div className="compare-buttons" role="group">
        {['<', '=', '>'].map((sign) => (
          <button
            key={sign}
            type="button"
            className={`sign-btn ${challenge.answer === sign && solved ? 'is-right' : ''} ${
              wrong.includes(sign) ? 'bob' : ''
            }`}
            disabled={solved || wrong.includes(sign)}
            onClick={() => choose(sign)}
          >
            {sign}
          </button>
        ))}
      </div>

      <p className="prompt-line">
        {prompt}
        <span className="croc-hint" title={t.compareHint}>
          🐊
        </span>
      </p>
      <p className="micro-hint">{t.compareHint}</p>
    </>
  )
}

function Pair({ challenge, prompt, solved, onAttempt }) {
  const [selected, setSelected] = useState([])
  const [found, setFound] = useState([])
  const [wrongPair, setWrongPair] = useState([])
  const timer = useRef(null)

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )

  useEffect(() => {
    setSelected([])
    setFound([])
    setWrongPair([])
  }, [challenge.id])

  const tap = (index) => {
    if (solved || found.length > 0) return
    if (selected.includes(index)) {
      setSelected(selected.filter((i) => i !== index))
      return
    }
    const next = [...selected, index]
    if (next.length < 2) {
      setSelected(next)
      return
    }
    const [x, y] = next
    if (challenge.tiles[x] + challenge.tiles[y] === challenge.target) {
      setFound(next)
      setSelected(next)
      onAttempt(true)
    } else {
      setSelected(next)
      setWrongPair(next)
      onAttempt(false)
      timer.current = setTimeout(() => {
        setSelected([])
        setWrongPair([])
      }, 650)
    }
  }

  return (
    <>
      <div className="pair-head">
        <span className="pair-label">= {challenge.target}</span>
        <p className="pair-prompt">
          {prompt.replace('{target}', challenge.target)}
        </p>
      </div>
      <div className="pair-grid">
        {challenge.tiles.map((tile, i) => (
          <button
            key={`${tile}-${i}`}
            type="button"
            className={[
              'tile',
              selected.includes(i) ? 'is-selected' : '',
              found.includes(i) ? 'is-found' : '',
              wrongPair.includes(i) ? 'is-wrong' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => tap(i)}
            disabled={solved}
          >
            {tile}
          </button>
        ))}
      </div>
    </>
  )
}

function Build({ challenge, t, solved, onAttempt }) {
  const [tens, setTens] = useState(0)
  const [ones, setOnes] = useState(0)
  const done = useRef(false)
  const value = tens * 10 + ones

  useEffect(() => {
    setTens(0)
    setOnes(0)
    done.current = false
  }, [challenge.id])

  useEffect(() => {
    if (solved || done.current) return undefined
    if (value === challenge.target) {
      done.current = true
      onAttempt(true)
    }
    return undefined
  }, [value, challenge.target, solved, onAttempt])

  const change = (dt, do1) => {
    if (solved) return
    setTens((prev) => Math.max(0, Math.min(9, prev + dt)))
    setOnes((prev) => Math.max(0, Math.min(9, prev + do1)))
  }

  const sticks = Array.from({ length: tens }, (_, i) => i)
  const dots = Array.from({ length: ones }, (_, i) => i)

  return (
    <>
      <div className="build-head">
        <span className="build-label">{t.buildQ.replace('{target}', challenge.target)}</span>
        <span className={`build-value ${solved ? 'is-solved' : ''}`}>{value}</span>
      </div>

      <div className="place-board">
        <div className="place-col">
          <span className="place-name">{t.tens}</span>
          <div className="place-tens">
            {sticks.map((i) => (
              <span key={i} className="stick" style={{ animationDelay: `${i * 30}ms` }} />
            ))}
          </div>
        </div>
        <div className="place-col">
          <span className="place-name">{t.ones}</span>
          <div className="place-ones">
            {dots.map((i) => (
              <span key={i} className="dot" style={{ animationDelay: `${i * 20}ms` }} />
            ))}
          </div>
        </div>
      </div>

      <div className="build-pads">
        <button type="button" className="pad pad--plus" onClick={() => change(1, 0)} disabled={solved}>
          +10
        </button>
        <button type="button" className="pad pad--plus" onClick={() => change(0, 1)} disabled={solved}>
          +1
        </button>
        <button type="button" className="pad pad--minus" onClick={() => change(-1, 0)} disabled={solved}>
          −10
        </button>
        <button type="button" className="pad pad--minus" onClick={() => change(0, -1)} disabled={solved}>
          −1
        </button>
      </div>
      <p className="prompt-line">{t.buildHint}</p>
    </>
  )
}

// ---------------------------------------------------------------------------
// The wrapper used by the play screen
// ---------------------------------------------------------------------------
export default function ChallengeView({
  challenge,
  t,
  lang,
  solved,
  helperOpen,
  onHelperToggle,
  onAttempt,
}) {
  const layout = useMemo(() => {
    const base = helperLayout(challenge)
    if (!base) return null
    if (challenge.op === '−' && challenge.type !== 'missing') {
      return withRemoved(base, challenge.b)
    }
    return base
  }, [challenge])

  const helperAvailable = Boolean(layout)

  const promptText =
    {
      missing: t.missingQ,
      sequence: t.sequenceQ,
      compare: t.compareQ,
      pair: t.pairQ,
    }[challenge.type] || ''

  let promptNode = null
  if (challenge.type === 'choice') promptNode = <Equation challenge={challenge} solved={solved} />
  if (challenge.type === 'missing')
    promptNode = <MissingEquation challenge={challenge} prompt={promptText} solved={solved} />
  if (challenge.type === 'sequence')
    promptNode = <Sequence challenge={challenge} prompt={promptText} solved={solved} />
  if (challenge.type === 'word')
    promptNode = <Story challenge={challenge} lang={lang} solved={solved} />
  if (challenge.type === 'compare')
    promptNode = (
      <Compare challenge={challenge} prompt={promptText} t={t} solved={solved} onAttempt={onAttempt} />
    )
  if (challenge.type === 'pair')
    promptNode = <Pair challenge={challenge} prompt={promptText} solved={solved} onAttempt={onAttempt} />
  if (challenge.type === 'build')
    promptNode = <Build challenge={challenge} t={t} solved={solved} onAttempt={onAttempt} />

  return (
    <div
      className={`challenge challenge--${challenge.type}`}
      data-type={challenge.type}
      data-op={challenge.op || ''}
    >
      {promptNode}
      {challenge.mode ? <QuestGame challenge={challenge} lang={lang} solved={solved} onAttempt={onAttempt} /> : null}
      {['rocket', 'balance', 'share'].includes(challenge.type) ? <Minigame challenge={challenge} lang={lang} solved={solved} onAttempt={onAttempt} /> : null}

      {['choice', 'missing', 'word', 'sequence'].includes(challenge.type) ? (
        <OptionGrid
          options={challenge.options}
          answer={challenge.answer}
          solved={solved}
          onAttempt={onAttempt}
        />
      ) : null}

      {helperAvailable ? (
        <button
          type="button"
          className={`ghost-btn ${helperOpen ? 'is-open' : ''}`}
          onClick={onHelperToggle}
        >
          🫘 {helperOpen ? t.hideHelper : t.countWithMe}
        </button>
      ) : null}

      {helperAvailable && helperOpen ? (
        <HelperPanel layout={layout} t={t} question={challenge} />
      ) : null}
    </div>
  )
}
