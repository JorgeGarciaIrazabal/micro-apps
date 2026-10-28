import { PLANETS } from './data.js'

const friends = ['🐛', '🦊', '🐢', '🤖', '🐱', '🦉', '🐝', '🦎', '🐧', '🦋', '🐙', '🐉']
const names = [
  ['Pip the moonbug', 'Pip, el bicho lunar'], ['Prism the fox', 'Prisma, el zorro'],
  ['Boba the turtle', 'Boba, la tortuga'], ['Bolt the robot', 'Chispa, el robot'],
  ['Miso the starcat', 'Miso, el gato estelar'], ['Luma the owl', 'Luma, la lechuza'],
  ['Buzz the bee', 'Zumba, la abeja'], ['Ember the lizard', 'Brasa, la lagartija'],
  ['Tick the penguin', 'Tic, el pingüino'], ['Nova the butterfly', 'Nova, la mariposa'],
  ['Inky the octopus', 'Tinta, el pulpo'], ['Orbit the dragon', 'Órbita, el dragón'],
]
export function companion(id, lang) {
  const i = PLANETS.findIndex(p => p.id === id)
  return { emoji: friends[i], name: names[i]?.[lang === 'es' ? 1 : 0] }
}
export const PROJECTS = [
  { id: 'garden', emoji: '🌳', cost: 25, name: ['Moon orchard', 'Huerto lunar'], detail: ['Grow a home for your rescued friends.', 'Cultiva un hogar para tus amigos.'] },
  { id: 'pond', emoji: '⛲', cost: 40, name: ['Bubble lagoon', 'Laguna de burbujas'], detail: ['A splashy place for the crew to play.', 'Un lugar para que la tripulación juegue.'] },
  { id: 'lab', emoji: '🔬', cost: 60, name: ['Discovery lab', 'Laboratorio'], detail: ['Your crew’s very own science station.', 'La estación científica de tu tripulación.'] },
  { id: 'telescope', emoji: '🔭', cost: 80, name: ['Stargazing tower', 'Torre estelar'], detail: ['Give your explorers a window to the stars.', 'Una ventana a las estrellas para tus exploradores.'] },
  { id: 'beacon', emoji: '📡', cost: 100, name: ['Friendship beacon', 'Faro de la amistad'], detail: ['Send a welcome signal across the galaxy.', 'Envía una bienvenida a toda la galaxia.'] },
  { id: 'ship', emoji: '🛸', cost: 140, name: ['Crew starship', 'Nave de la tripulación'], detail: ['A home among the stars for everyone you rescued.', 'Un hogar entre estrellas para todos tus amigos.'] },
]
export function progress(save) {
  const explored = PLANETS.filter(p => save.best[p.id] > 0).length
  const xp = Math.max(save.xp || 0, explored * 80)
  const rank = Math.min(5, Math.floor(xp / 240))
  return { explored, xp, rank, next: rank < 5 ? 240 - xp % 240 : 0 }
}
const ranks = {
  en: ['Stargazer', 'Space Scout', 'Pathfinder', 'Star Navigator', 'Galaxy Guardian', 'Cosmic Captain'],
  es: ['Observador estelar', 'Explorador espacial', 'Pionero', 'Navegante estelar', 'Guardián galáctico', 'Capitán cósmico'],
}
export function rankName(save, lang) { return ranks[lang][progress(save).rank] }
export function badges(save) {
  const p = progress(save)
  return [
    { emoji: '🚩', name: ['First landing', 'Primer aterrizaje'], detail: ['Explore one world', 'Explora un mundo'], done: p.explored >= 1 },
    { emoji: '🧭', name: ['Hands-on hero', 'Héroe en acción'], detail: [`${Math.min(save.games || 0, 6)}/6 minigames completed`, `${Math.min(save.games || 0, 6)}/6 minijuegos completados`], done: save.games >= 6 },
    { emoji: '🌈', name: ['Never give up', 'Sigue intentándolo'], detail: ['Finish a mission after trying again', 'Termina una misión después de reintentarlo'], done: save.comeback > 0 },
    { emoji: '🫶', name: ['Rescue team', 'Equipo de rescate'], detail: [`${Math.min(p.explored, 6)}/6 friends rescued`, `${Math.min(p.explored, 6)}/6 amigos rescatados`], done: p.explored >= 6 },
    { emoji: '🏡', name: ['Home builder', 'Constructor'], detail: [`${Math.min(save.projects.length, 3)}/3 sanctuary projects`, `${Math.min(save.projects.length, 3)}/3 proyectos del refugio`], done: save.projects.length >= 3 },
    { emoji: '🏆', name: ['Galaxy guardian', 'Guardián galáctico'], detail: [`${p.explored}/${PLANETS.length} worlds explored`, `${p.explored}/${PLANETS.length} mundos explorados`], done: p.explored === PLANETS.length },
  ]
}
export function ProgressBanner({ save, lang, onOpen }) {
  const p = progress(save)
  const es = lang === 'es'
  return <button className="progress-banner" onClick={onOpen}>
    <span className="progress-emblem">🧑‍🚀</span><span className="progress-copy"><strong>{rankName(save, lang)}</strong><span>{p.explored}/{PLANETS.length} {es ? 'amigos rescatados' : 'friends rescued'} · {p.xp} XP</span><span className="xp-track"><span style={{ width: `${p.next ? (240 - p.next) / 240 * 100 : 100}%` }} /></span></span>
    <span className="progress-link">{es ? 'Mi refugio' : 'My sanctuary'} →</span>
  </button>
}
export default function RewardsScreen({ save, lang, onBack, onBuild }) {
  const es = lang === 'es'
  const l = es ? 1 : 0
  const p = progress(save)
  return <div className="screen screen--rewards">
    <header className="shop-header"><button className="icon-btn" onClick={onBack} aria-label={es ? 'Mapa galáctico' : 'Galaxy map'}>←</button><h1>{es ? 'Tu refugio espacial' : 'Your space sanctuary'}</h1><span className="dust-chip">✨ {save.dust}</span></header>
    <main className="rewards-body">
      <p className="sanctuary-intro">{es ? 'Cada misión trae un nuevo amigo a casa. ¡Construye algo increíble para todos!' : 'Every mission brings a new friend home. Build something wonderful for your crew!'}</p>
      <ProgressBanner save={save} lang={lang} onOpen={() => document.getElementById('crew').scrollIntoView({ behavior: 'smooth' })} />
      <p className="rank-note">{p.next ? (es ? `${p.next} XP para el siguiente rango. Cada reto resuelto cuenta, ¡también al reintentarlo!` : `${p.next} XP to your next rank. Every solved challenge counts, including retries!`) : (es ? '¡Capitán cósmico! Sigue explorando y ayudando a tus amigos.' : 'Cosmic Captain! Keep exploring and helping your friends.')}</p>
      <div className="sanctuary-scene" aria-label={es ? 'Tu refugio construido' : 'Your built sanctuary'}><span className="scene-moon">🌙</span><div className="scene-buildings">{PROJECTS.filter(item => save.projects.includes(item.id)).map(item => <span key={item.id} title={item.name[l]}>{item.emoji}</span>)}{!save.projects.length && <span>⛺</span>}</div><div className="scene-friends">{PLANETS.filter(world => save.best[world.id]).map(world => <span key={world.id} title={companion(world.id, lang).name}>{companion(world.id, lang).emoji}</span>)}</div></div>
      <h2>{es ? 'Construye con tu polvo de estrellas' : 'Put your stardust to work'}</h2>
      <div className="reward-grid">{PROJECTS.map(item => {
        const built = save.projects.includes(item.id)
        return <article className={`reward-card ${built ? 'is-earned' : ''}`} key={item.id}><span className="reward-emoji">{item.emoji}</span><h3>{item.name[l]}</h3><p>{item.detail[l]}</p><button className="btn btn--soft" disabled={built || save.dust < item.cost} onClick={() => onBuild(item)}>{built ? (es ? '✓ Construido' : '✓ Built') : `✨ ${item.cost} · ${es ? 'Construir' : 'Build'}`}</button>{!built && save.dust < item.cost && <small>{es ? 'Te faltan' : 'Earn'} {item.cost - save.dust} ✨ {es ? '' : 'more'}</small>}</article>
      })}</div>
      <h2 id="crew">{es ? 'Pasaporte de rescate' : 'Rescue passport'} · {p.explored}/{PLANETS.length}</h2>
      <div className="crew-grid">{PLANETS.map(world => { const rescued = save.best[world.id] > 0; const friend = companion(world.id, lang); return <article key={world.id} className={`crew-card ${rescued ? 'is-earned' : ''}`}><span>{rescued ? friend.emoji : '🥚'}</span><strong>{friend.name}</strong><small>{rescued ? '✓ ' : '🔒 '}{world.name[lang]}</small></article> })}</div>
      <h2>{es ? 'Insignias de aventura' : 'Adventure badges'}</h2>
      <div className="reward-grid badges-grid">{badges(save).map(b => <article key={b.name[0]} className={`reward-card ${b.done ? 'is-earned' : ''}`}><span className="reward-emoji">{b.emoji}</span><h3>{b.done ? '✓ ' : ''}{b.name[l]}</h3><p>{b.detail[l]}</p></article>)}</div>
    </main>
  </div>
}
