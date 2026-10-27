import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ACCESSORIES,
  LEVELS,
  OPS,
  ROUND_SIZE,
  STRINGS,
} from './data.js'
import { makeRound, tokenize } from './game.js'

const SAVE_KEY = 'cosmo-math-v1'
const DEFAULT_SAVE = {
  stars: 0,
  seen: [],
  equipped: 'none',
  muted: false,
  level: 1,
  op: 'mix',
  lang: 'en',
}

function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return DEFAULT_SAVE
    return { ...DEFAULT_SAVE, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_SAVE
  }
}

// ---------------------------------------------------------------------------
// Tiny WebAudio sound kit — no assets, everything is synthesised.
// ---------------------------------------------------------------------------
const sound = {
  ctx: null,
  muted: false,
  ready() {
    if (this.muted) return null
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    if (!this.ctx) this.ctx = new AC()
    if (this.ctx.state === 'suspended') this.ctx.resume()
    return this.ctx
  },
  tone(freq, when, dur, type = 'sine', vol = 0.14) {
    const ctx = this.ready()
    if (!ctx) return
    const t0 = ctx.currentTime + when
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, t0)
    gain.gain.setValueAtTime(0.0001, t0)
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.015)
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
    osc.connect(gain).connect(ctx.destination)
    osc.start(t0)
    osc.stop(t0 + dur + 0.02)
  },
  pop() {
    this.tone(620, 0, 0.09, 'triangle', 0.1)
    this.tone(940, 0.05, 0.1, 'sine', 0.08)
  },
  correct(combo = 0) {
    const base = 523.25
    this.tone(base, 0, 0.14, 'sine', 0.12)
    this.tone(base * 1.26, 0.09, 0.16, 'sine', 0.12)
    this.tone(base * 1.5, 0.19, 0.24, 'sine', 0.12)
    if (combo) this.tone(base * 2, 0.3, 0.22, 'triangle', 0.09)
  },
  wrong() {
    this.tone(320, 0, 0.16, 'sine', 0.1)
    this.tone(240, 0.12, 0.2, 'sine', 0.09)
  },
  fanfare() {
    const notes = [523.25, 659.25, 783.99, 1046.5]
    notes.forEach((f, i) => this.tone(f, i * 0.12, 0.3, 'triangle', 0.1))
    this.tone(1318.5, 0.52, 0.4, 'sine', 0.08)
  },
  tap() {
    this.tone(520, 0, 0.05, 'square', 0.04)
  },
}

const pick = (list) => list[Math.floor(Math.random() * list.length)]
const nextUnlock = (stars) => ACCESSORIES.find((a) => a.cos > stars) || null

// ---------------------------------------------------------------------------
// Cosmo, the hungry alien (pure SVG so he stays crisp on any tablet)
// ---------------------------------------------------------------------------
function Cosmo({ mood = 'idle', accessory = null, size = 'clamp(180px, 34vh, 300px)' }) {
  const bigMouth = mood === 'happy'
  return (
    <div className={`cosmo cosmo--${mood}`} style={{ '--cosmo-size': size }}>
      <svg viewBox="0 0 200 200" role="img" aria-label="Cosmo the alien">
        <defs>
          <radialGradient id="cosmoBody" cx="34%" cy="24%" r="82%">
            <stop offset="0%" stopColor="#c9fff1" />
            <stop offset="42%" stopColor="#5eeac0" />
            <stop offset="100%" stopColor="#12a884" />
          </radialGradient>
          <radialGradient id="cosmoEye" cx="40%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#dcf7f1" />
          </radialGradient>
        </defs>

        <ellipse cx="100" cy="188" rx="54" ry="8" fill="#03010c" opacity="0.35" />

        <g className="cosmo-float">
          {/* feet */}
          <ellipse cx="76" cy="179" rx="17" ry="9" fill="#0f9a79" />
          <ellipse cx="124" cy="179" rx="17" ry="9" fill="#0f9a79" />

          {/* antennae */}
          <path
            d="M80 54 Q66 28 54 22"
            stroke="#3fd0a7"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M120 54 Q134 28 146 22"
            stroke="#3fd0a7"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
          />
          <circle className="antenna-ball" cx="52" cy="20" r="9" fill="#ffd166" />
          <circle className="antenna-ball alt" cx="148" cy="20" r="9" fill="#ff77ab" />

          {/* body */}
          <path
            d="M100 44 C146 44 169 80 169 118 C169 158 139 184 100 184 C61 184 31 158 31 118 C31 80 54 44 100 44 Z"
            fill="url(#cosmoBody)"
          />
          <ellipse cx="100" cy="146" rx="44" ry="31" fill="#e8fff8" opacity="0.3" />

          {/* eyes */}
          <g className="cosmo-eyes">
            <ellipse cx="77" cy="99" rx="18" ry="20" fill="url(#cosmoEye)" />
            <ellipse cx="123" cy="99" rx="18" ry="20" fill="url(#cosmoEye)" />
            {mood === 'happy' ? (
              <>
                <path
                  d="M68 100 Q77 90 86 100"
                  stroke="#2a1c46"
                  strokeWidth="4.5"
                  fill="none"
                  strokeLinecap="round"
                />
                <path
                  d="M114 100 Q123 90 132 100"
                  stroke="#2a1c46"
                  strokeWidth="4.5"
                  fill="none"
                  strokeLinecap="round"
                />
              </>
            ) : (
              <>
                <ellipse cx="79" cy="102" rx="9" ry="10" fill="#2a1c46" />
                <ellipse cx="125" cy="102" rx="9" ry="10" fill="#2a1c46" />
                <circle cx="82" cy="98" r="3.2" fill="#fff" />
                <circle cx="128" cy="98" r="3.2" fill="#fff" />
              </>
            )}
          </g>

          {/* cheeks */}
          <ellipse cx="56" cy="126" rx="9" ry="6" fill="#ff6f9c" opacity="0.5" />
          <ellipse cx="144" cy="126" rx="9" ry="6" fill="#ff6f9c" opacity="0.5" />

          {/* mouth */}
          {bigMouth ? (
            <g className="cosmo-mouth">
              <path d="M82 132 Q100 168 118 132 Q100 142 82 132 Z" fill="#37204a" />
              <ellipse cx="100" cy="150" rx="10" ry="6" fill="#ff6f9c" />
            </g>
          ) : mood === 'oops' ? (
            <ellipse cx="100" cy="144" rx="7" ry="8" fill="#37204a" />
          ) : (
            <path
              d="M87 139 Q100 150 113 139"
              stroke="#1d7c63"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
            />
          )}
        </g>
      </svg>

      {accessory ? (
        <span
          className="cosmo-acc"
          key={accessory.id}
          style={{
            top: `${accessory.top}%`,
            left: `${accessory.left}%`,
            transform: `translate(-50%, -50%) rotate(${accessory.rot}deg)`,
            fontSize: `calc(var(--cosmo-size) * ${0.36 * accessory.scale})`,
          }}
        >
          {accessory.emoji}
        </span>
      ) : null}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Background bits
// ---------------------------------------------------------------------------
function StarField() {
  const stars = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: 1 + Math.random() * 2.4,
        delay: Math.random() * 4,
        dur: 2.4 + Math.random() * 3,
        warm: Math.random() > 0.7,
      })),
    [],
  )
  return (
    <div className="starfield" aria-hidden="true">
      {stars.map((s) => (
        <span
          key={s.id}
          className={s.warm ? 'star warm' : 'star'}
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.dur}s`,
          }}
        />
      ))}
      <span className="planet planet-a" />
      <span className="planet planet-b" />
      <span className="planet planet-c" />
    </div>
  )
}

function Confetti() {
  const colors = ['#ffd166', '#ff6f9c', '#5eeac0', '#9b8cff', '#ffa45c']
  const pieces = useMemo(
    () =>
      Array.from({ length: 54 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.9,
        dur: 2 + Math.random() * 1.8,
        rot: Math.random() * 360,
        drift: (Math.random() - 0.5) * 160,
        color: colors[i % colors.length],
        size: 7 + Math.random() * 9,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            left: `${p.left}%`,
            background: p.color,
            width: `${p.size}px`,
            height: `${p.size * 0.6}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
            '--drift': `${p.drift}px`,
            '--spin': `${p.rot}deg`,
          }}
        />
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Top bar
// ---------------------------------------------------------------------------
function TopBar({ t, save, onToggleLang, onToggleSound, onHome, starCount }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        {onHome ? (
          <button className="icon-btn" onClick={onHome} aria-label={t.home}>
            🏠
          </button>
        ) : (
          <span className="brand-dot">👽</span>
        )}
        <span className="star-chip" aria-label={`${starCount} ${t.stars}`}>
          <span className="star-glyph">⭐</span>
          <strong>{starCount}</strong>
        </span>
      </div>
      <div className="topbar-right">
        <button
          className="icon-btn lang-btn"
          onClick={onToggleLang}
          aria-label={save.lang === 'en' ? 'Cambiar a español' : 'Switch to English'}
        >
          {save.lang === 'en' ? 'EN' : 'ES'}
        </button>
        <button
          className="icon-btn"
          onClick={onToggleSound}
          aria-label={save.muted ? t.soundOff : t.soundOn}
        >
          {save.muted ? '🔇' : '🔊'}
        </button>
      </div>
    </header>
  )
}

// ---------------------------------------------------------------------------
// Counting beans
// ---------------------------------------------------------------------------
function HelperPanel({ question, t }) {
  const [counted, setCounted] = useState({})

  const groups = useMemo(() => {
    if (question.op === '−') {
      const tokens = tokenize(question.a).map((value) => ({ value, removed: false }))
      let left = question.b
      for (let i = tokens.length - 1; i >= 0 && left > 0; i -= 1) {
        if (tokens[i].value <= left) {
          tokens[i].removed = true
          left -= tokens[i].value
        }
      }
      return [{ key: 'a', tokens }]
    }
    return [
      { key: 'a', tokens: tokenize(question.a).map((value) => ({ value, removed: false })) },
      { key: 'b', tokens: tokenize(question.b).map((value) => ({ value, removed: false })) },
    ]
  }, [question])

  useEffect(() => {
    setCounted({})
  }, [question.id])

  const total = Object.entries(counted).reduce((sum, [key, on]) => {
    if (!on) return sum
    const [groupIndex, tokenIndex] = key.split('-').map(Number)
    const token = groups[groupIndex]?.tokens[tokenIndex]
    return token && !token.removed ? sum + token.value : sum
  }, 0)

  const toggle = (groupIndex, tokenIndex, token) => {
    if (token.removed) return
    sound.tap()
    setCounted((prev) => ({
      ...prev,
      [`${groupIndex}-${tokenIndex}`]: !prev[`${groupIndex}-${tokenIndex}`],
    }))
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
        {groups.map((group, gi) => (
          <div className="helper-group" key={group.key}>
            {gi > 0 ? <span className="helper-op">{question.op}</span> : null}
            <div className="tokens">
              {group.tokens.map((token, ti) => {
                const key = `${gi}-${ti}`
                return (
                  <button
                    key={key}
                    type="button"
                    className={[
                      'token',
                      token.value === 10 ? 'token--bundle' : '',
                      token.removed ? 'token--removed' : '',
                      counted[key] ? 'token--on' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => toggle(gi, ti, token)}
                    aria-pressed={Boolean(counted[key])}
                    aria-label={token.removed ? 'taken away' : `${token.value}`}
                  >
                    {token.value === 10 ? '10' : ''}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      {question.op === '−' ? (
        <p className="helper-note">
          {t.helperSubNote
            .replace('{a}', question.a)
            .replace('{b}', question.b)}
        </p>
      ) : null}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Play screen
// ---------------------------------------------------------------------------
function PlayScreen({ save, t, onFinish, onExit, onAddStars, onToggleSound }) {
  const [questions] = useState(() => makeRound(save.level, save.op, ROUND_SIZE))
  const [index, setIndex] = useState(0)
  const [wrong, setWrong] = useState([])
  const [solved, setSolved] = useState(false)
  const [helperOpen, setHelperOpen] = useState(false)
  const [mood, setMood] = useState('idle')
  const [speech, setSpeech] = useState(t.feedMe)
  const [combo, setCombo] = useState(0)
  const [comboFlash, setComboFlash] = useState(false)
  const [floaters, setFloaters] = useState([])

  const starsRef = useRef(0)
  const perfectRef = useRef(0)
  const solvedRef = useRef(false)
  const timers = useRef([])

  const question = questions[index]
  const accessory = ACCESSORIES.find((a) => a.id === save.equipped) || null

  useEffect(
    () => () => {
      timers.current.forEach((id) => clearTimeout(id))
    },
    [],
  )

  const later = (fn, ms) => {
    const id = setTimeout(fn, ms)
    timers.current.push(id)
    return id
  }

  const resetMood = () => {
    if (solvedRef.current) return
    setMood('idle')
    setSpeech(t.feedMe)
  }

  const handleAnswer = (option) => {
    if (solved || wrong.includes(option)) return

    if (option === question.answer) {
      solvedRef.current = true
      setSolved(true)
      setMood('happy')
      setSpeech(pick(t.correctSpeech))
      sound.pop()

      const firstTry = wrong.length === 0
      const nextCombo = firstTry ? combo + 1 : 0
      const comboBonus = firstTry && nextCombo % 3 === 0 ? 2 : 0
      const gained = (firstTry ? 2 : 1) + comboBonus
      starsRef.current += gained
      if (firstTry) perfectRef.current += 1

      setCombo(nextCombo)
      if (comboBonus) {
        sound.correct(1)
        setComboFlash(true)
        later(() => setComboFlash(false), 1200)
        setFloaters([
          { id: Date.now(), text: `+${gained} ⭐ ${t.combo}`, tone: 'combo' },
        ])
      } else {
        sound.correct(0)
        setFloaters([{ id: Date.now(), text: `+${gained} ⭐`, tone: 'ok' }])
      }

      later(() => setFloaters([]), 1100)

      later(() => {
        if (index + 1 >= questions.length) {
          onFinish({
            stars: starsRef.current,
            perfect: perfectRef.current,
            total: questions.length,
          })
          return
        }
        solvedRef.current = false
        setIndex(index + 1)
        setWrong([])
        setSolved(false)
        setHelperOpen(false)
        setMood('idle')
        setSpeech(t.feedMe)
      }, 1150)
      return
    }

    setWrong((prev) => [...prev, option])
    setMood('oops')
    setSpeech(pick(t.wrongSpeech))
    setHelperOpen(true)
    sound.wrong()
    later(resetMood, 1300)
  }

  const handleExit = () => {
    onAddStars(starsRef.current)
    onExit()
  }

  const progressPct = (index / questions.length) * 100

  return (
    <div className="screen screen--play">
      <header className="topbar">
        <div className="topbar-left">
          <button className="icon-btn" onClick={handleExit} aria-label={t.home}>
            🏠
          </button>
          <div className="round-pips" aria-label={`${t.question} ${Math.min(index + 1, questions.length)} ${t.of} ${questions.length}`}>
            {questions.map((q, i) => (
              <span
                key={q.id}
                className={`pip ${i < index || (i === index && solved) ? 'pip--done' : ''} ${
                  i === index && !solved ? 'pip--now' : ''
                }`}
              />
            ))}
          </div>
        </div>
        <div className="topbar-right">
          <span className="star-chip" aria-label={`${save.stars + starsRef.current} ${t.stars}`}>
            <span className="star-glyph">⭐</span>
            <strong>{save.stars + starsRef.current}</strong>
          </span>
          <button
            className="icon-btn"
            onClick={onToggleSound}
            aria-label={save.muted ? t.soundOff : t.soundOn}
          >
            {save.muted ? '🔇' : '🔊'}
          </button>
        </div>
      </header>

      <div className="progress-line" aria-hidden="true">
        <span style={{ width: `${progressPct}%` }} />
      </div>

      <div className="play-body">
        <div className="cosmo-stage">
          <div className={`speech ${mood === 'happy' ? 'speech--happy' : ''}`}>
            {speech}
          </div>
          <Cosmo mood={mood} accessory={accessory} size="clamp(150px, 27vh, 250px)" />
          <div className="combo-pill">
            {combo >= 2 ? `🔥 ${t.combo} ×${combo}` : ''}
          </div>
        </div>

        <div className="quiz">
          <div className={`problem ${solved ? 'problem--solved' : ''}`}>
            <span className="problem-num">{question.a}</span>
            <span className="problem-op">{question.op}</span>
            <span className="problem-num">{question.b}</span>
            <span className="problem-eq">=</span>
            <span className={`problem-answer ${solved ? 'is-revealed' : ''}`}>
              {solved ? question.answer : '?'}
            </span>
          </div>

          <div className="options" role="group" aria-label={t.whatIs}>
            {question.options.map((option, i) => {
              const isWrong = wrong.includes(option)
              const isRight = solved && option === question.answer
              return (
                <button
                  key={`${question.id}-${option}`}
                  type="button"
                  className={`bubble bubble--${i % 4} ${isWrong ? 'bubble--wrong' : ''} ${
                    isRight ? 'bubble--right' : ''
                  }`}
                  onClick={() => handleAnswer(option)}
                  disabled={isWrong || solved}
                >
                  <span className="bubble-shine" aria-hidden="true" />
                  <span className="bubble-num">{option}</span>
                </button>
              )
            })}
          </div>

          <div className="helper-bar">
            <button
              type="button"
              className={`ghost-btn ${helperOpen ? 'is-open' : ''}`}
              onClick={() => {
                sound.tap()
                setHelperOpen((v) => !v)
              }}
            >
              🫘 {helperOpen ? t.hideHelper : t.countWithMe}
            </button>
          </div>

          {helperOpen ? (
            <HelperPanel question={question} t={t} />
          ) : (
            <p className="encourage">
              {wrong.length > 0 ? t.almost : t.tagline}
            </p>
          )}
        </div>
      </div>

      {floaters.map((f) => (
        <div key={f.id} className={`floater floater--${f.tone}`}>
          {f.text}
        </div>
      ))}

      {comboFlash ? <Confetti /> : null}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Round end
// ---------------------------------------------------------------------------
function RoundEndScreen({ result, save, t, onAgain, onWardrobe, onHome }) {
  const next = nextUnlock(save.stars)
  const unlocked = result.unlocked || []
  return (
    <div className="screen screen--end">
      <Confetti />
      <div className="end-card">
        <div className="end-top">
          <Cosmo mood="happy" accessory={ACCESSORIES.find((a) => a.id === save.equipped)} size="clamp(140px, 24vh, 220px)" />
          <div>
            <h1 className="end-title">{t.roundDone}</h1>
            <p className="end-sub">
              ⭐ {result.perfect} / {result.total} {t.firstTry}
            </p>
          </div>
        </div>

        <div className="end-stats">
          <div className="end-stat">
            <span className="end-stat-value">+{result.stars}</span>
            <span className="end-stat-label">{t.roundStars}</span>
          </div>
          <div className="end-stat">
            <span className="end-stat-value">{save.stars}</span>
            <span className="end-stat-label">{t.totalStars}</span>
          </div>
        </div>

        {unlocked.length > 0 ? (
          <div className="unlock-card">
            <span className="unlock-emojis">
              {unlocked.map((item) => (
                <span key={item.id} className="unlock-emoji">
                  {item.emoji}
                </span>
              ))}
            </span>
            <div>
              <strong>{t.newUnlock}</strong>
              <span>{unlocked.map((item) => item.name[save.lang]).join(' · ')}</span>
            </div>
          </div>
        ) : next ? (
          <div className="next-unlock">
            {next.emoji} <strong>{next.cos - save.stars}</strong> {t.nextUnlock}
          </div>
        ) : (
          <div className="next-unlock">{t.allUnlocked}</div>
        )}

        <div className="end-actions">
          <button className="btn btn--primary" onClick={onAgain}>
            ▶ {t.playAgain}
          </button>
          <button className="btn btn--soft" onClick={onWardrobe}>
            {unlocked.length > 0 ? '✨ ' : ''}
            {t.dress}
          </button>
          <button className="btn btn--ghost" onClick={onHome}>
            {t.home}
          </button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Wardrobe
// ---------------------------------------------------------------------------
function WardrobeScreen({ save, t, onEquip, onBack, onPlay }) {
  const equipped = ACCESSORIES.find((a) => a.id === save.equipped) || null
  return (
    <div className="screen screen--wardrobe">
      <header className="topbar">
        <div className="topbar-left">
          <button className="icon-btn" onClick={onBack} aria-label={t.home}>
            🏠
          </button>
          <h1 className="topbar-title">{t.wardrobe}</h1>
        </div>
        <div className="topbar-right">
          <span className="star-chip">
            <span className="star-glyph">⭐</span>
            <strong>{save.stars}</strong>
          </span>
        </div>
      </header>

      <div className="wardrobe-body">
        <div className="wardrobe-preview">
          <Cosmo mood="idle" accessory={equipped} size="clamp(170px, 30vh, 280px)" />
          <p className="wardrobe-name">
            {equipped ? equipped.name[save.lang] : t.takeOff}
          </p>
          <p className="wardrobe-hint">{t.wardrobeHint}</p>
          <button className="btn btn--primary btn--wide" onClick={onPlay}>
            ▶ {t.play}
          </button>
        </div>

        <div className="wardrobe-grid">
          <button
            type="button"
            className={`look look--none ${!equipped ? 'is-on' : ''}`}
            onClick={() => onEquip('none')}
          >
            <span className="look-emoji">🚫</span>
            <span className="look-name">{t.takeOff}</span>
          </button>

          {ACCESSORIES.map((item) => {
            const unlocked = save.stars >= item.cos
            const isOn = equipped?.id === item.id
            return (
              <button
                key={item.id}
                type="button"
                className={`look ${unlocked ? '' : 'is-locked'} ${isOn ? 'is-on' : ''}`}
                onClick={() => {
                  if (!unlocked) {
                    sound.wrong()
                    return
                  }
                  sound.pop()
                  onEquip(item.id)
                }}
                aria-label={`${item.name[save.lang]}${unlocked ? '' : ` — ${item.cos} stars`}`}
              >
                <span className="look-emoji">{unlocked ? item.emoji : '🔒'}</span>
                <span className="look-name">{item.name[save.lang]}</span>
                <span className="look-cost">{unlocked ? (isOn ? '✓' : '') : `⭐ ${item.cos}`}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Home
// ---------------------------------------------------------------------------
function HomeScreen({ save, t, onPlay, onWardrobe, onLevel, onSelectOp, onToggleLang, onToggleSound, stars }) {
  const accessory = ACCESSORIES.find((a) => a.id === save.equipped) || null
  const next = nextUnlock(save.stars)
  const toNext = next ? next.cos - save.stars : 0

  return (
    <div className="screen screen--home">
      <TopBar
        t={t}
        save={save}
        starCount={stars}
        onToggleLang={onToggleLang}
        onToggleSound={onToggleSound}
      />

      <div className="home-body">
        <div className="home-hero">
          <div className="speech speech--home">{t.feedMe}</div>
          <Cosmo mood="idle" accessory={accessory} size="clamp(190px, 34vh, 320px)" />
          <h1 className="title">{t.title}</h1>
          <p className="tagline">{t.tagline}</p>
        </div>

        <div className="home-panel">
          <section className="panel-block">
            <h2 className="panel-title">{t.chooseLevel}</h2>
            <div className="chips chips--levels">
              {LEVELS.map((level) => (
                <button
                  key={level.id}
                  type="button"
                  className={`chip chip--level ${save.level === level.id ? 'is-on' : ''}`}
                  onClick={() => onLevel(level.id)}
                >
                  <span className="chip-emoji">{level.emoji}</span>
                  <span className="chip-text">
                    <strong>{t.levelNames[level.id]}</strong>
                    <small>{t.levelHints[level.id]}</small>
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="panel-block">
            <h2 className="panel-title">{t.chooseOp}</h2>
            <div className="chips chips--ops">
              {OPS.map((op) => (
                <button
                  key={op.id}
                  type="button"
                  className={`chip chip--op ${save.op === op.id ? 'is-on' : ''}`}
                  onClick={() => onSelectOp(op.id)}
                >
                  <span className="chip-emoji">{op.emoji}</span>
                  <span className="chip-text">
                    <strong>{t[op.id]}</strong>
                  </span>
                </button>
              ))}
            </div>
          </section>

          <button className="btn btn--primary btn--hero" onClick={onPlay}>
            ▶ {t.play}
          </button>

          <button className="btn btn--soft" onClick={onWardrobe}>
            🎩 {t.dress}
          </button>

          {next ? (
            <div className="next-unlock next-unlock--home">
              <span className="next-emoji">{next.emoji}</span>
              <span>
                <strong>{toNext}</strong> {t.nextUnlock}
              </span>
              <div className="mini-bar">
                <span style={{ width: `${Math.min(100, (save.stars / next.cos) * 100)}%` }} />
              </div>
            </div>
          ) : (
            <div className="next-unlock next-unlock--home">{t.allUnlocked}</div>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
export default function App() {
  const [save, setSave] = useState(loadSave)
  const [screen, setScreen] = useState('home')
  const [result, setResult] = useState(null)
  const [roundKey, setRoundKey] = useState(0)

  const t = STRINGS[save.lang] || STRINGS.en

  useEffect(() => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(save))
    } catch {
      /* private mode — the game still works for this session */
    }
    sound.muted = save.muted
  }, [save])

  useEffect(() => {
    document.documentElement.lang = save.lang
  }, [save.lang])

  const startRound = () => {
    sound.ready()
    setRoundKey((k) => k + 1)
    setScreen('play')
  }

  const finishRound = (roundResult) => {
    const total = save.stars + roundResult.stars
    const unlocked = ACCESSORIES.filter((a) => a.cos <= total && !save.seen.includes(a.id))
    const nextSave = {
      ...save,
      stars: total,
      seen: [...save.seen, ...unlocked.map((a) => a.id)],
    }
    setSave(nextSave)
    setResult({ ...roundResult, unlocked })
    setScreen('roundEnd')
    sound.fanfare()
  }

  const addStars = (amount) => {
    if (!amount) return
    setSave((prev) => ({ ...prev, stars: prev.stars + amount }))
  }

  const setLevel = (level) => {
    sound.tap()
    setSave((prev) => ({ ...prev, level }))
  }

  const setOp = (op) => {
    sound.tap()
    setSave((prev) => ({ ...prev, op }))
  }

  const toggleLang = () => {
    setSave((prev) => ({ ...prev, lang: prev.lang === 'en' ? 'es' : 'en' }))
  }

  const toggleSound = () => {
    const nextMuted = !save.muted
    sound.muted = nextMuted
    if (!nextMuted) sound.tap()
    setSave((prev) => ({ ...prev, muted: nextMuted }))
  }

  return (
    <div className="app">
      <StarField />

      {screen === 'home' ? (
        <HomeScreen
          save={save}
          t={t}
          stars={save.stars}
          onPlay={startRound}
          onWardrobe={() => {
            sound.tap()
            setScreen('wardrobe')
          }}
          onLevel={setLevel}
          onSelectOp={setOp}
          onToggleLang={toggleLang}
          onToggleSound={toggleSound}
        />
      ) : null}

      {screen === 'play' ? (
        <PlayScreen
          key={roundKey}
          save={save}
          t={t}
          onFinish={finishRound}
          onExit={() => setScreen('home')}
          onAddStars={addStars}
          onToggleSound={toggleSound}
        />
      ) : null}

      {screen === 'roundEnd' && result ? (
        <RoundEndScreen
          result={result}
          save={save}
          t={t}
          onAgain={startRound}
          onWardrobe={() => {
            sound.tap()
            setScreen('wardrobe')
          }}
          onHome={() => setScreen('home')}
        />
      ) : null}

      {screen === 'wardrobe' ? (
        <WardrobeScreen
          save={save}
          t={t}
          onEquip={(id) => {
            setSave((prev) => ({ ...prev, equipped: id }))
          }}
          onBack={() => setScreen('home')}
          onPlay={startRound}
        />
      ) : null}
    </div>
  )
}
