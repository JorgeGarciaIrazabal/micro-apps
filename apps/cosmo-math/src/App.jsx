import { useEffect, useMemo, useRef, useState } from 'react'
import {
  FIRST_BONUS,
  LOOKS,
  MEDAL_BONUS,
  PLANETS,
  RUN_SIZE,
  STRINGS,
} from './data.js'
import { makeRun } from './game.js'
import { Confetti, Cosmo, StarField } from './Cosmo.jsx'
import ChallengeView from './Challenges.jsx'
import BreakScreen from './BreakScreen.jsx'
import RewardsScreen, { ProgressBanner, companion, badges, rankName } from './Rewards.jsx'

const SAVE_KEY = 'cosmo-math-v2'
const DEFAULT_SAVE = {
  dust: 0,
  best: {},
  owned: [],
  equipped: 'none',
  muted: false,
  lang: 'en',
  xp: 0,
  games: 0,
  comeback: 0,
  projects: [],
  arcadeVisits: 0,
  arcadeBest: {},
}

function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return DEFAULT_SAVE
    const parsed = JSON.parse(raw)
    return {
      ...DEFAULT_SAVE,
      ...parsed,
      lang: parsed.lang === 'es' ? 'es' : 'en',
      projects: Array.isArray(parsed.projects) ? parsed.projects : [],
      arcadeBest: parsed.arcadeBest && typeof parsed.arcadeBest === 'object' ? parsed.arcadeBest : {},
      best: parsed.best || {},
      owned: Array.isArray(parsed.owned) ? parsed.owned : [],
    }
  } catch {
    return DEFAULT_SAVE
  }
}

const pick = (list) => list[Math.floor(Math.random() * list.length)]
const starsFor = (n) => [1, 2, 3].map((i) => i <= n)

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
  coin() {
    this.tone(880, 0, 0.07, 'triangle', 0.1)
    this.tone(1174, 0.06, 0.12, 'triangle', 0.1)
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

// ---------------------------------------------------------------------------
// Small shared UI
// ---------------------------------------------------------------------------
function DustChip({ amount, label }) {
  return (
    <span className="dust-chip" aria-label={`${amount} ${label}`}>
      <span className="dust-glyph">✨</span>
      <strong>{amount}</strong>
    </span>
  )
}

function Medals({ count, size = 'normal' }) {
  return (
    <span className={`medals medals--${size}`} aria-label={`best ${count} of 3`}>
      {starsFor(count).map((on, i) => (
        <span key={i} className={`medal ${on ? 'is-on' : ''}`} style={{ animationDelay: `${i * 120}ms` }}>
          ★
        </span>
      ))}
    </span>
  )
}

function TopControls({ save, t, onToggleSound, onToggleLang, onShop, onHome, dust }) {
  return (
    <div className="top-controls">
      {onHome ? (
        <button className="icon-btn" onClick={onHome} aria-label={t.map}>
          🏠
        </button>
      ) : null}
      <DustChip amount={dust} label={t.dust} />
      {onShop ? (
        <button className="icon-btn" onClick={onShop} aria-label={t.shop}>
          🛍️
        </button>
      ) : null}
      {onToggleLang ? (
        <button
          className="icon-btn lang-btn"
          onClick={onToggleLang}
          aria-label={save.lang === 'en' ? 'Cambiar a español' : 'Switch to English'}
        >
          {save.lang === 'en' ? 'EN' : 'ES'}
        </button>
      ) : null}
      {onToggleSound ? (
        <button
          className="icon-btn"
          onClick={onToggleSound}
          aria-label={save.muted ? t.soundOff : t.soundOn}
        >
          {save.muted ? '🔇' : '🔊'}
        </button>
      ) : null}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Galaxy map
// ---------------------------------------------------------------------------
function MapScreen({ save, t, onPlay, onShop, onRewards, onToggleSound, onToggleLang }) {
  const look = LOOKS.find((l) => l.id === save.equipped) || null
  const completed = (id) => (save.best[id] || 0) > 0
  const unlocked = (index) => index === 0 || completed(PLANETS[index - 1].id)
  const nextPlanet = PLANETS.find((p, i) => unlocked(i) && !completed(p.id))
  const done = PLANETS.every((p) => completed(p.id))

  return (
    <div className="screen screen--map">
      <header className="map-header">
        <div className="brand">
          <Cosmo look={look} size="clamp(56px, 9vh, 82px)" />
          <div className="brand-text">
            <h1 className="title">{t.title}</h1>
            <p className="subtitle">{t.subtitle}</p>
          </div>
        </div>
        <TopControls
          save={save}
          t={t}
          dust={save.dust}
          onShop={onShop}
          onToggleSound={onToggleSound}
          onToggleLang={onToggleLang}
        />
      </header>

      <div className="map-body">
        <ProgressBanner save={save} lang={save.lang} onOpen={onRewards} />
        <div className="map-heading">
          <h2>{done ? t.allDone : t.choosePlanet}</h2>
          {done ? <p className="map-note">{t.keepPractising}</p> : null}
        </div>

        <ol className="path">
          {PLANETS.map((planet, i) => {
            const open = unlocked(i)
            const medals = save.best[planet.id] || 0
            const isNext = nextPlanet?.id === planet.id
            const prev = PLANETS[i - 1]
            return (
              <li className="path-item" key={planet.id}>
                <button
                  type="button"
                  className={`planet-card ${open ? '' : 'is-locked'} ${isNext ? 'is-next' : ''}`}
                  style={{ '--accent': planet.accent, '--accent2': planet.accent2 }}
                  onClick={() => {
                    if (!open) {
                      sound.wrong()
                      return
                    }
                    onPlay(planet.id)
                  }}
                  aria-disabled={!open}
                >
                  <span className="planet-orb" aria-hidden="true">
                    {planet.emoji}
                  </span>
                  <span className="planet-info">
                    <span className="planet-name">{planet.name[save.lang]}</span>
                    <span className="planet-blurb">
                      {open
                        ? planet.blurb[save.lang]
                        : t.finishToUnlock.replace('{planet}', prev.name[save.lang])}
                    </span>
                    {open ? (
                      <Medals count={medals} />
                    ) : (
                      <span className="lock-row">🔒 {t.locked}</span>
                    )}
                  </span>
                  <span className={`planet-go ${isNext ? 'is-live' : ''}`}>
                    {open ? '▶' : '🔒'}
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Play screen
// ---------------------------------------------------------------------------
function PlayScreen({ planet, save, t, forcedType, onFinish, onExit, onToggleSound }) {
  const [run] = useState(() => makeRun(planet, forcedType))
  const [index, setIndex] = useState(0)
  const [takingBreak, setTakingBreak] = useState(false)
  const breakGamesRef = useRef(0)
  const arcadeBestRef = useRef({ ...save.arcadeBest })
  const [solved, setSolved] = useState(false)
  const [missed, setMissed] = useState(false)
  const [helperOpen, setHelperOpen] = useState(false)
  const [mood, setMood] = useState('idle')
  const [speech, setSpeech] = useState(t.letsGo)
  const [combo, setCombo] = useState(0)
  const [comboFlash, setComboFlash] = useState(false)
  const [floaters, setFloaters] = useState([])

  const dustRef = useRef(0)
  const firstTryRef = useRef(0)
  const missedRef = useRef(false)
  const solvedRef = useRef(false)
  const timers = useRef([])

  const challenge = run[index]
  const look = LOOKS.find((l) => l.id === save.equipped) || null

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
    setSpeech(t.letsGo)
  }

  const handleAttempt = (ok) => {
    if (solvedRef.current) return

    if (ok) {
      solvedRef.current = true
      setSolved(true)
      setMood('happy')
      setSpeech(pick(t.correctSpeech))
      sound.pop()

      const firstTry = !missedRef.current
      const nextCombo = firstTry ? combo + 1 : 0
      const comboBonus = firstTry && nextCombo % 3 === 0 ? 2 : 0
      const gained = (firstTry ? 2 : 1) + comboBonus
      dustRef.current += gained
      if (firstTry) firstTryRef.current += 1

      setCombo(nextCombo)
      if (comboBonus) {
        setComboFlash(true)
        later(() => setComboFlash(false), 1200)
        setFloaters([{ id: Date.now(), text: `+${gained} ✨ ${t.combo}`, tone: 'combo' }])
      } else {
        setFloaters([{ id: Date.now(), text: `+${gained} ✨`, tone: 'ok' }])
      }
      later(() => setFloaters([]), 1150)

      sound.correct(comboBonus)

      later(() => {
        if (index + 1 >= run.length) {
          onFinish({
            dust: dustRef.current,
            firstTry: firstTryRef.current,
            total: run.length,
            games: breakGamesRef.current,
            arcadeBest: arcadeBestRef.current,
          })
          return
        }
        solvedRef.current = false
        missedRef.current = false
        setIndex(index + 1)
        if (!forcedType && [3, 6].includes(index + 1)) setTakingBreak(true)
        setSolved(false)
        setMissed(false)
        setHelperOpen(false)
        setMood('idle')
        setSpeech(t.letsGo)
      }, 1450)
      return
    }

    missedRef.current = true
    setMissed(true)
    setHelperOpen(true)
    setMood('oops')
    setSpeech(pick(t.wrongSpeech))
    sound.wrong()
    later(resetMood, 1300)
  }

  const handleExit = () => {
    onExit(dustRef.current, { games: breakGamesRef.current, arcadeBest: arcadeBestRef.current })
  }

  if (takingBreak) return <BreakScreen key={index} planet={planet} lang={save.lang} completed={index} total={run.length}
    visit={save.arcadeVisits} records={arcadeBestRef.current}
    onContinue={() => { setTakingBreak(false); setSpeech(save.lang === 'es' ? '¡Vamos con la siguiente idea!' : 'Ready for your next bright idea!') }}
    onEffect={event => { if (event === 'score') sound.pop(); if (event === 'power') sound.coin(); if (event === 'launch') sound.tap(); if (event === 'complete') sound.fanfare() }}
    onSolved={({ id, score }) => {
      dustRef.current += 12
      breakGamesRef.current += 1
      arcadeBestRef.current[id] = Math.max(arcadeBestRef.current[id] || 0, score)
    }} />

  return (
    <div className="screen screen--play">
      <header className="play-header">
        <div className="play-header-left">
          <button className="icon-btn" onClick={handleExit} aria-label={t.map}>
            🏠
          </button>
          <span className="play-planet" style={{ '--accent': planet.accent }}>
            <span>{planet.emoji}</span>
            <strong>{planet.name[save.lang]}</strong>
          </span>
        </div>
        <div className="play-header-right">
          <DustChip amount={save.dust + dustRef.current} label={t.dust} />
          <button
            className="icon-btn"
            onClick={onToggleSound}
            aria-label={save.muted ? t.soundOff : t.soundOn}
          >
            {save.muted ? '🔇' : '🔊'}
          </button>
        </div>
      </header>

      <div className="round-strip">
        <div className="round-pips" aria-label={`${index + 1} ${t.of} ${run.length}`}>
          {run.map((item, i) => (
            <span
              title={t.challenge}
              key={item.id + i}
              className={`pip ${i < index || (i === index && solved) ? 'pip--done' : ''} ${
                i === index && !solved ? 'pip--now' : ''
              }`}
            />
          ))}
        </div>
      </div>

      <div className="play-body">
        <div className="cosmo-stage">
          <div className={`speech ${mood === 'happy' ? 'speech--happy' : ''}`}>{speech}</div>
          <Cosmo mood={mood} look={look} size="clamp(120px, 24vh, 210px)" />
          <div className="combo-pill">{combo >= 2 ? `🔥 ${t.combo} ×${combo}` : ''}</div>
        </div>

        <section
          className="challenge-card"
          style={{ '--accent': planet.accent, '--accent2': planet.accent2 }}
        >
          <ChallengeView
            key={`${challenge.id}-${index}`}
            challenge={challenge}
            t={t}
            lang={save.lang}
            solved={solved}
            helperOpen={helperOpen}
            onHelperToggle={() => {
              sound.tap()
              setHelperOpen((v) => !v)
            }}
            onAttempt={handleAttempt}
          />
          {missed && !solved ? <p className="encourage">{pick(t.almost)}</p> : null}
        </section>
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
// Results
// ---------------------------------------------------------------------------
function ResultsScreen({ planet, result, save, t, onAgain, onShop, onMap, onExplore, onRewards }) {
  const look = LOOKS.find((l) => l.id === save.equipped) || null
  return (
    <div className="screen screen--results">
      <Confetti />
      <div className="results-card">
        <div className="results-hero">
          <Cosmo mood="happy" look={look} size="clamp(120px, 20vh, 190px)" />
          <div>
            <h1 className="results-title">{t.resultsTitle}</h1>
            <p className="results-planet">
              {planet.emoji} {planet.name[save.lang]}
            </p>
          </div>
        </div>

        <div className="results-medal">
          <Medals count={result.medal} size="large" />
          <span className="results-medal-label">
            {t.medal} · {result.firstTry}/{result.total} {t.firstTry}
          </span>
        </div>

        <div className="results-stats">
          <div className="results-stat">
            <span className="results-stat-value">+{result.gained}</span>
            <span className="results-stat-label">{t.dustEarned}</span>
          </div>
          <div className="results-stat">
            <span className="results-stat-value">{save.best[planet.id] || 0}/3</span>
            <span className="results-stat-label">{t.best}</span>
          </div>
        </div>

        <div className="mission-rewards" aria-live="polite">
          <strong>+{result.xp} XP · {rankName(save, save.lang)}</strong>
          <p>{result.firstTry < result.total ? (save.lang === 'es' ? '¡Seguiste intentándolo y lo lograste! Eso es aprender.' : 'You kept trying and figured it out. That’s learning!') : (save.lang === 'es' ? '¡Gran estrategia! ¿Puedes resolverlo de otra manera?' : 'Great thinking! Could you solve it a different way?')}</p>
          {result.firstClear && <p className="rescued-friend">{companion(planet.id, save.lang).emoji} {save.lang === 'es' ? '¡Nuevo amigo rescatado!' : 'New friend rescued!'} <strong>{companion(planet.id, save.lang).name}</strong></p>}
          {result.badges.map(b => <p key={b.name[0]}>{b.emoji} {save.lang === 'es' ? 'Nueva insignia' : 'Badge earned'}: <strong>{b.name[save.lang === 'es' ? 1 : 0]}</strong></p>)}
          <button className="btn btn--soft" onClick={onRewards}>🏡 {save.lang === 'es' ? 'Visitar mi refugio' : 'Visit my sanctuary'}</button>
        </div>

        {result.improved ? <p className="results-new-best">✨ {t.newBest}</p> : null}

        {result.unlocked ? (
          <div className="unlock-card">
            <span className="unlock-emoji">{result.unlocked.emoji}</span>
            <div className="unlock-text">
              <strong>{t.unlockedPlanet}</strong>
              <span>{result.unlocked.name[save.lang]}</span>
            </div>
            <button className="btn btn--primary btn--small" onClick={onExplore}>
              {t.explore}
            </button>
          </div>
        ) : (
          <p className="results-hint">{t.keepPractising}</p>
        )}

        <div className="results-actions">
          <button className="btn btn--primary" onClick={onAgain}>
            ▶ {t.replay}
          </button>
          <button className="btn btn--soft" onClick={onShop}>
            🛍️ {t.shop}
          </button>
          <button className="btn btn--ghost" onClick={onMap}>
            {t.toMap}
          </button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Shop
// ---------------------------------------------------------------------------
function ShopScreen({ save, t, onBack, onBuy, onEquip, onToggleSound, onReset }) {
  const [confirmReset, setConfirmReset] = useState(false)
  const equipped = LOOKS.find((l) => l.id === save.equipped) || null

  return (
    <div className="screen screen--shop">
      <header className="shop-header">
        <div className="play-header-left">
          <button className="icon-btn" onClick={onBack} aria-label={t.map}>
            ←
          </button>
          <h1 className="shop-title">{t.shopTitle}</h1>
        </div>
        <div className="play-header-right">
          <DustChip amount={save.dust} label={t.dust} />
          <button
            className="icon-btn"
            onClick={onToggleSound}
            aria-label={save.muted ? t.soundOff : t.soundOn}
          >
            {save.muted ? '🔇' : '🔊'}
          </button>
        </div>
      </header>

      <div className="shop-body">
        <div className="shop-preview">
          <Cosmo look={equipped} size="clamp(150px, 26vh, 240px)" />
          <p className="shop-preview-name">{equipped ? equipped.name[save.lang] : t.none}</p>
          <p className="shop-hint">{t.shopHint}</p>
        </div>

        <div className="shop-grid">
          <button
            type="button"
            className={`look look--none ${!equipped ? 'is-on' : ''}`}
            onClick={() => onEquip('none')}
          >
            <span className="look-emoji">👽</span>
            <span className="look-name">{t.none}</span>
            <span className="look-cost">{!equipped ? t.wearing : ''}</span>
          </button>

          {LOOKS.map((item) => {
            const owned = save.owned.includes(item.id)
            const isOn = save.equipped === item.id
            const affordable = save.dust >= item.price
            return (
              <button
                key={item.id}
                type="button"
                className={`look ${owned ? 'is-owned' : ''} ${isOn ? 'is-on' : ''} ${
                  owned || affordable ? '' : 'is-short'
                }`}
                onClick={() => (owned ? onEquip(item.id) : onBuy(item))}
              >
                <span className="look-emoji">{owned ? item.emoji : '🔒'}</span>
                <span className="look-name">{item.name[save.lang]}</span>
                <span className={`look-cost ${owned ? 'is-owned' : ''}`}>
                  {owned ? (isOn ? t.wearing : t.owned) : `✨ ${item.price}`}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <button
        type="button"
        className={`reset-btn ${confirmReset ? 'is-confirming' : ''}`}
        onClick={() => {
          if (confirmReset) onReset()
          else setConfirmReset(true)
        }}
      >
        {confirmReset ? t.resetConfirm : t.reset}
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
const FORCED_TYPES = ['choice', 'missing', 'pair', 'compare', 'sequence', 'build', 'word']

export default function App() {
  const [save, setSave] = useState(loadSave)
  const [screen, setScreen] = useState('map')
  const [planetId, setPlanetId] = useState(PLANETS[0].id)
  const [runKey, setRunKey] = useState(0)
  const [result, setResult] = useState(null)
  const [toast, setToast] = useState(null)
  const [toastKey, setToastKey] = useState(0)

  const t = STRINGS[save.lang] || STRINGS.en
  const planet = PLANETS.find((p) => p.id === planetId) || PLANETS[0]

  const forcedType = useMemo(() => {
    if (!import.meta.env.DEV) return null
    const value = new URLSearchParams(window.location.search).get('type')
    return FORCED_TYPES.includes(value) ? value : null
  }, [])

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

  useEffect(() => {
    if (!toast) return undefined
    const id = setTimeout(() => setToast(null), 2300)
    return () => clearTimeout(id)
  }, [toast, toastKey])

  const showToast = (message) => {
    setToast(message)
    setToastKey((k) => k + 1)
  }

  const startPlanet = (id) => {
    sound.ready()
    sound.tap()
    setPlanetId(id)
    setRunKey((k) => k + 1)
    setScreen('play')
  }

  const finishRun = (run) => {
    const prevBest = save.best[planet.id] || 0
    const medal = run.firstTry >= RUN_SIZE ? 3 : run.firstTry >= 6 ? 2 : 1
    const best = Math.max(prevBest, medal)
    const firstClear = prevBest === 0
    const bonus = (firstClear ? FIRST_BONUS : 0) + MEDAL_BONUS[medal]
    const gained = run.dust + bonus
    const index = PLANETS.findIndex((p) => p.id === planet.id)
    const next = PLANETS[index + 1] || null

    const xp = run.total * 10
    const updated = {
      ...save,
      dust: save.dust + gained,
      best: { ...save.best, [planet.id]: best },
      xp: Math.max(save.xp, Object.values(save.best).filter(n => n > 0).length * 80) + xp,
      games: save.games + run.games,
      arcadeVisits: save.arcadeVisits + run.games,
      arcadeBest: run.arcadeBest,
      comeback: save.comeback + (run.firstTry < run.total ? 1 : 0),
    }
    const previousBadges = badges(save)
    const earned = badges(updated).filter((badge, i) => badge.done && !previousBadges[i].done)
    setSave(updated)
    setResult({
      xp,
      badges: earned,
      medal,
      best,
      firstClear,
      gained,
      dust: run.dust,
      bonus,
      total: run.total,
      firstTry: run.firstTry,
      improved: prevBest > 0 && medal > prevBest,
      unlocked: firstClear ? next : null,
    })
    setScreen('results')
    sound.fanfare()
  }

  const exitRun = (dust, arcade) => {
    if (dust > 0) {
      setSave(prev => ({ ...prev, dust: prev.dust + dust, games: prev.games + arcade.games, arcadeVisits: prev.arcadeVisits + arcade.games, arcadeBest: arcade.arcadeBest }))
    }
    setScreen('map')
  }

  const buyLook = (item) => {
    if (save.owned.includes(item.id)) {
      setSave({ ...save, equipped: item.id })
      sound.pop()
      return
    }
    if (save.dust < item.price) {
      sound.wrong()
      showToast(t.needMore.replace('{n}', item.price - save.dust))
      return
    }
    setSave({
      ...save,
      dust: save.dust - item.price,
      owned: [...save.owned, item.id],
      equipped: item.id,
    })
    sound.coin()
    sound.fanfare()
    showToast(`✨ −${item.price} · ${item.name[save.lang]}`)
  }

  const equipLook = (id) => {
    sound.pop()
    setSave({ ...save, equipped: id })
  }

  const toggleSound = () => {
    const nextMuted = !save.muted
    sound.muted = nextMuted
    if (!nextMuted) sound.tap()
    setSave((prev) => ({ ...prev, muted: nextMuted }))
  }

  const toggleLang = () => {
    setSave((prev) => ({ ...prev, lang: prev.lang === 'en' ? 'es' : 'en' }))
  }

  const resetProgress = () => {
    try {
      localStorage.removeItem(SAVE_KEY)
    } catch {
      /* ignore */
    }
    setSave(DEFAULT_SAVE)
    setScreen('map')
  }

  return (
    <div className="app">
      <StarField />

      {screen === 'map' ? (
        <MapScreen
          save={save}
          t={t}
          onPlay={startPlanet}
          onRewards={() => setScreen('rewards')}
          onShop={() => {
            sound.tap()
            setScreen('shop')
          }}
          onToggleSound={toggleSound}
          onToggleLang={toggleLang}
        />
      ) : null}

      {screen === 'play' ? (
        <PlayScreen
          key={runKey}
          planet={planet}
          save={save}
          t={t}
          forcedType={forcedType}
          onFinish={finishRun}
          onExit={exitRun}
          onToggleSound={toggleSound}
        />
      ) : null}

      {screen === 'results' && result ? (
        <ResultsScreen
          planet={planet}
          result={result}
          save={save}
          t={t}
          onAgain={() => startPlanet(planet.id)}
          onRewards={() => setScreen('rewards')}
          onShop={() => {
            sound.tap()
            setScreen('shop')
          }}
          onMap={() => setScreen('map')}
          onExplore={() => startPlanet(result.unlocked.id)}
        />
      ) : null}

      {screen === 'rewards' ? <RewardsScreen save={save} lang={save.lang} onBack={() => setScreen('map')} onBuild={item => {
        setSave(prev => prev.projects.includes(item.id) || prev.dust < item.cost ? prev : ({ ...prev, dust: prev.dust - item.cost, projects: [...prev.projects, item.id] }))
        sound.fanfare()
        showToast(`🏡 ${item.name[save.lang === 'es' ? 1 : 0]}`)
      }} /> : null}

      {screen === 'shop' ? (
        <ShopScreen
          save={save}
          t={t}
          onBack={() => setScreen('map')}
          onBuy={buyLook}
          onEquip={equipLook}
          onToggleSound={toggleSound}
          onReset={resetProgress}
        />
      ) : null}

      {toast ? <div className="toast">{toast}</div> : null}
    </div>
  )
}
