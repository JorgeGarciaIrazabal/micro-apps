import { useState } from 'react'

const COPY = {
  en: {
    label: 'FLIGHT SCHOOL · HANDS-ON MATH', rocket: 'Plot a rocket route',
    rocketHint: 'Use the thrusters to land exactly on the glowing station. You can fly backward, too!',
    balance: 'Repair the cargo balance', balanceHint: 'Tap cargo to load or unload it. Make both sides weigh the same.',
    share: 'Host an alien picnic', shareHint: 'Tap a plate to give it one berry. Share every berry equally. Use − to take one back.',
    check: 'Test my plan', ready: 'Mission accomplished!', reset: 'Start over',
    rocketMiss: 'Check the distance to the station. Which thruster will get you closer?',
    balanceMiss: 'Compare the totals. Try loading or unloading a different crate.',
    shareMiss: 'Every plate needs the same amount, and no berries should be left.',
    left: 'Left to share', station: 'Station', here: 'You are at', fixed: 'Fixed cargo',
    plate: 'Plate', back: 'Take one back', loaded: 'Loaded',
  },
  es: {
    label: 'ESCUELA ESPACIAL · MATES EN ACCIÓN', rocket: 'Traza una ruta espacial',
    rocketHint: 'Usa los propulsores para llegar justo a la estación iluminada. ¡También puedes retroceder!',
    balance: 'Repara la balanza de carga', balanceHint: 'Toca la carga para subirla o bajarla. Iguala el peso de los dos lados.',
    share: 'Organiza un picnic alienígena', shareHint: 'Toca un plato para darle una baya. Reparte todas por igual. Usa − para recuperar una.',
    check: 'Probar mi plan', ready: '¡Misión cumplida!', reset: 'Empezar de nuevo',
    rocketMiss: 'Mira la distancia a la estación. ¿Qué propulsor te acercará?',
    balanceMiss: 'Compara los totales. Prueba a subir o bajar otra caja.',
    shareMiss: 'Todos los platos necesitan la misma cantidad, sin que sobren bayas.',
    left: 'Por repartir', station: 'Estación', here: 'Estás en', fixed: 'Carga fija',
    plate: 'Plato', back: 'Recuperar una', loaded: 'A bordo',
  },
}

export default function Minigame({ challenge: c, lang, solved, onAttempt }) {
  const t = COPY[lang] || COPY.en
  const [position, setPosition] = useState(c.start || 0)
  const [loaded, setLoaded] = useState([])
  const [plates, setPlates] = useState(Array(c.groups || 0).fill(0))
  const [tested, setTested] = useState(false)
  const [moves, setMoves] = useState(0)
  const remaining = c.total - plates.reduce((a, b) => a + b, 0)
  const weight = (c.fixed || 0) + loaded.reduce((sum, i) => sum + c.cargo[i], 0)
  const correct = c.type === 'rocket' ? position === c.target : c.type === 'balance' ? weight === c.target : remaining === 0 && plates.every(n => n === c.each)
  const edit = (fn) => { if (!solved) { fn(); setTested(false); setMoves(n => n + 1) } }
  return <div className={`minigame minigame--${c.type}`}>
    <span className="mission-eyebrow">{t.label}</span>
    <h2>{t[c.type]}</h2>
    <p className="mission-instructions">{t[`${c.type}Hint`]}</p>
    {c.type === 'rocket' && <>
      <div className="flight-readout"><span>🚀 {t.here} <strong>{position}</strong></span><span>🛰️ {t.station} <strong>{c.target}</strong></span></div>
      <div className="flight-track" aria-hidden="true">
        <span className="flight-goal" style={{ left: `${c.target / (c.target + c.step * 2) * 100}%` }}>🛰️</span>
        <span className={`flight-ship ${solved ? 'has-landed' : ''}`} style={{ left: `${position / (c.target + c.step * 2) * 100}%` }}>🚀</span>
        {Array.from({ length: (c.target + c.step * 2 - c.start) / c.step + 1 }, (_, i) => c.start + i * c.step).map(n => <span className="flight-tick" key={n} style={{ left: `${n / (c.target + c.step * 2) * 100}%` }}>{n}</span>)}
      </div>
      <div className="mission-tools">{[-c.step, c.step, c.step * 2].map(n => <button key={n} className="mission-tool" disabled={solved || position + n < c.start || position + n > c.target + c.step * 2} onClick={() => edit(() => setPosition(p => p + n))}>{n > 0 ? '+' : '−'}{Math.abs(n)} <span>🔥</span></button>)}</div>
    </>}
    {c.type === 'balance' && <>
      <div className="balance-beam" style={{ '--tilt': `${Math.max(-10, Math.min(10, (weight - c.target) * 2))}deg` }}>
        <div className="balance-pan"><span>📦 {t.fixed}: {c.fixed}</span><strong>{weight}</strong><span>{loaded.map(i => c.cargo[i]).join(' + ') || '—'}</span></div>
        <span className="balance-sign">{weight === c.target ? '=' : weight < c.target ? '<' : '>'}</span>
        <div className="balance-pan"><span>🪨</span><strong>{c.target}</strong></div>
      </div>
      <div className="mission-tools">{c.cargo.map((n, i) => <button key={i} className={`mission-tool ${loaded.includes(i) ? 'is-selected' : ''}`} aria-pressed={loaded.includes(i)} disabled={solved} onClick={() => edit(() => setLoaded(prev => prev.includes(i) ? prev.filter(v => v !== i) : [...prev, i]))}>📦 {n}<small>{loaded.includes(i) ? t.loaded : '+'}</small></button>)}</div>
      <p className="mission-equation">{c.fixed}{loaded.map(i => ` + ${c.cargo[i]}`).join('')} = {weight}</p>
    </>}
    {c.type === 'share' && <>
      <div className="berry-basket">🧺 {t.left}: <strong>{remaining} / {c.total}</strong></div>
      <div className="picnic-plates">{plates.map((n, i) => <div className="picnic-place" key={i}>
        <button className="picnic-plate" aria-label={`${t.plate} ${i + 1}: ${n}`} disabled={solved || remaining === 0} onClick={() => edit(() => setPlates(prev => prev.map((v, j) => j === i ? v + 1 : v)))}><span>{['👽','🤖','👾','🐙'][i]}</span><span className="plate-berries">{'🍓'.repeat(n) || '◯'}</span><strong>{n}</strong></button>
        <button className="plate-remove" aria-label={`${t.back}: ${t.plate} ${i + 1}`} disabled={solved || n === 0} onClick={() => edit(() => setPlates(prev => prev.map((v, j) => j === i ? v - 1 : v)))}>−</button>
      </div>)}</div>
      {solved && <p className="mission-equation">{c.total} ÷ {c.groups} = {c.each}</p>}
    </>}
    <p className={`mission-feedback ${solved ? 'is-success' : ''}`} role="status">{solved ? `✓ ${t.ready}` : tested ? t[`${c.type}Miss`] : '\u00a0'}</p>
    <div className="mission-actions"><button className="btn btn--primary" disabled={solved || moves === 0} onClick={() => { setTested(true); onAttempt(correct) }}>{t.check}</button><button className="ghost-btn" disabled={solved} onClick={() => edit(() => { setPosition(c.start || 0); setLoaded([]); setPlates(Array(c.groups || 0).fill(0)) })}>{t.reset}</button></div>
  </div>
}
