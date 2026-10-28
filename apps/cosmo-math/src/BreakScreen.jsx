import { useEffect, useState } from 'react'
import { makeChallenge } from './game.js'
import { QUESTS } from './quests.js'
import Minigame from './Minigames.jsx'
import QuestGame from './QuestGames.jsx'

export const BREAK_GAMES = [
  { id: 'rocket', emoji: '🚀', name: { en: 'Rocket route', es: 'Ruta espacial' } },
  { id: 'balance', emoji: '⚖️', name: { en: 'Cargo balance', es: 'Balanza de carga' } },
  { id: 'share', emoji: '🍓', name: { en: 'Alien picnic', es: 'Picnic alienígena' } },
  ...QUESTS,
]
export default function BreakScreen({ planet, lang, completed, total, onContinue, onSolved, onExit }) {
  const es = lang === 'es'
  const [elapsed, setElapsed] = useState(0)
  const [minutes, setMinutes] = useState(3)
  const [gameId, setGameId] = useState(() => BREAK_GAMES[Math.floor(Math.random()*BREAK_GAMES.length)].id)
  const [challenge, setChallenge] = useState(() => makeChallenge(gameId, planet))
  const [solved, setSolved] = useState(false)
  const [wins, setWins] = useState(0)
  const [showLibrary, setShowLibrary] = useState(false)
  useEffect(() => {
    const started = Date.now()
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 1000)
    return () => clearInterval(timer)
  }, [])
  const choose = id => { setGameId(id); setChallenge(makeChallenge(id, planet)); setSolved(false); setShowLibrary(false) }
  const handleAttempt = ok => { if (ok && !solved) { setSolved(true); setWins(n => n + 1); onSolved() } }
  const Game = challenge.mode ? QuestGame : Minigame
  return <div className="screen screen--break">
    <header className="break-header"><span className="break-brand">🛋️ {es ? 'Pausa de aventura' : 'Adventure break'}</span><button className="icon-btn" aria-label={es?'Mapa galáctico':'Galaxy map'} onClick={onExit}>🏠</button></header>
    <main className="break-body">
      <div className="break-intro"><span className="mission-eyebrow">{completed}/{total} {es?'TAREAS COMPLETADAS':'TASKS COMPLETE'}</span><h1>{es?'¡Buen trabajo! Hora de jugar.':'Nice work! Time for a play break.'}</h1><p>{es?'Tómate de 3 a 10 minutos: elige un juego, prueba ideas y relájate. También puedes estirarte o beber agua. Tus mates te esperan justo aquí.':'Take 3–10 minutes: pick a game, try ideas, and relax. You can stretch or grab some water, too. Your math mission is waiting right here.'}</p></div>
      <div className="break-length"><span>{es ? 'Una pausa de…' : 'Make it a…'}</span>{[3,5,10].map(n => <button key={n} aria-pressed={minutes === n} className={minutes === n ? 'is-selected' : ''} onClick={() => setMinutes(n)}>{n} min</button>)}<span>{es ? 'sin prisas' : 'unhurried break'}</span></div>
      <div className="break-progress" role="progressbar" aria-label={es ? 'Tiempo de descanso' : 'Break time'} aria-valuemin={0} aria-valuemax={minutes*60} aria-valuenow={Math.min(elapsed,minutes*60)}><span style={{width:`${Math.min(100, elapsed/(minutes*60)*100)}%`}} /></div>
      <div className="break-toolbar"><span className="break-clock">🌿 {Math.floor(elapsed/60)}:{String(elapsed%60).padStart(2,'0')} · {wins} {es?'resueltos':'solved'}</span><button className="btn btn--soft" aria-expanded={showLibrary} onClick={()=>setShowLibrary(v=>!v)}>🎮 {es?'Elegir juego':'Choose a game'} · {BREAK_GAMES.length}</button></div>
      {showLibrary ? <div className="game-library">{BREAK_GAMES.map(game=><button className={`game-choice ${game.id===gameId?'is-selected':''}`} key={game.id} onClick={()=>choose(game.id)}><span>{game.emoji}</span>{game.name[lang]}</button>)}</div> : <section className="break-playground" style={{'--accent':planet.accent,'--accent2':planet.accent2}}><Game key={challenge.id} challenge={challenge} lang={lang} solved={solved} onAttempt={handleAttempt}/>{solved&&<div className="break-win" role="status"><p>✨ +3 · {es?'¡Ideas brillantes!':'Bright ideas!'}</p><button className="btn btn--soft" onClick={()=>choose(gameId)}>{es?'Otro acertijo':'Another puzzle'}</button><button className="btn btn--soft" onClick={()=>choose(BREAK_GAMES[(BREAK_GAMES.findIndex(g=>g.id===gameId)+1)%BREAK_GAMES.length].id)}>{es?'Un juego diferente':'A different game'} →</button></div>}</section>}
      <div className="return-to-mission"><div><strong>{elapsed>=600?(es?'Tu misión está lista para continuar.':'Your mission is ready to continue.'):elapsed>=minutes*60?(es?'¡Una buena pausa! Vuelve cuando quieras.':'A lovely break! Return whenever you’re ready.'):(es?'Sin prisas. Puedes volver cuando quieras.':'No rush. You can return whenever you’re ready.')}</strong><span>{es?`Siguiente: tarea ${completed+1} de ${total}`:`Up next: task ${completed+1} of ${total}`}</span></div><button className="btn btn--primary" onClick={onContinue}>{es?'Continuar las mates':'Back to my math mission'} →</button></div>
    </main>
  </div>
}
