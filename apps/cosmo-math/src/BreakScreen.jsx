import { useEffect, useRef, useState } from 'react'
import { PLANETS } from './data.js'
import { assignedGame, STAGE_SECONDS, SESSION_SECONDS } from './arcade/catalog.js'
import { ArcadeEngine, W, H } from './arcade/engine.js'
import { draw } from './arcade/draw.js'
import './arcade/Arcade.css'

const ACTION = { flap: ['FLAP', 'ALETEAR'], sling: ['LAUNCH', 'LANZAR'], blaster: ['BLAST', 'RAYO'], runner: ['JUMP', 'SALTAR'], asteroid: ['NOVA', 'NOVA'], racer: ['BOOST', 'TURBO'] }
const TEXT = {
  en: { unlocked:'PLAY BREAK UNLOCKED', ready:'Your next little adventure', start:'Let’s play!', skip:'Back to math', pause:'Pause game', resume:'Keep playing', paused:'Taking a breather', pauseNote:'Your game waits for you. Stretch your fingers!', complete:'Adventure complete!', finish:'Back to my mission', score:'SCORE', stage:'STAGE', four:'Four stages. One little adventure.', next:'Then it’s back to your math mission.', good:'You played, explored, and kept going. Nice work!', rescue:'A little shield helps you bounce back after a bump.', hold:'Hold to steer · swipe on the game', swipe:'Slide anywhere on the game to steer', shield:'Shield ready', boost:'Recharge', exit:'Return to lesson', total:'FINAL SCORE', record:'PERSONAL BEST', bonus:'Stardust earned' },
  es: { unlocked:'¡PAUSA DE JUEGO DESBLOQUEADA!', ready:'Tu próxima pequeña aventura', start:'¡A jugar!', skip:'Volver a las mates', pause:'Pausar juego', resume:'Seguir jugando', paused:'Un respiro', pauseNote:'Tu juego te espera. ¡Estira los dedos!', complete:'¡Aventura completada!', finish:'Volver a mi misión', score:'PUNTOS', stage:'ETAPA', four:'Cuatro etapas. Una pequeña aventura.', next:'Después seguimos con tu misión matemática.', good:'Jugaste, exploraste y seguiste adelante. ¡Bien hecho!', rescue:'Un escudo te ayuda a recuperarte tras un choque.', hold:'Mantén para moverte · desliza en el juego', swipe:'Desliza sobre el juego para moverte', shield:'Escudo listo', boost:'Recargando', exit:'Volver a la lección', total:'PUNTUACIÓN FINAL', record:'RÉCORD PERSONAL', bonus:'Polvo de estrellas' },
}
export default function BreakScreen({ planet, lang, completed, total, visit=0, records={}, onContinue, onSolved, onEffect }) {
  const t=TEXT[lang] || TEXT.en, es=lang==='es'
  const [game]=useState(()=>assignedGame(PLANETS.findIndex(p=>p.id===planet.id),completed,visit))
  const engine=useRef(null)
  if(!engine.current)engine.current=new ArcadeEngine(game)
  const canvas=useRef(null), gesture=useRef(null), awarded=useRef(false), onSolvedRef=useRef(onSolved), effects=useRef(onEffect)
  onSolvedRef.current=onSolved;effects.current=onEffect
  const [phase,setPhase]=useState('ready'), [paused,setPaused]=useState(false)
  const [hud,setHud]=useState({score:0,stage:1,progress:0,cooldown:0,busy:false})
  const action=ACTION[game.kind], fourArrows=['snake','asteroid'].includes(game.kind)
  const horizontal=['snake','breakout','blaster','catch','asteroid','jumper','racer'].includes(game.kind)
  const clearInput=()=>{for(const key of Object.keys(engine.current.input))engine.current.input[key]=false;gesture.current=null;engine.current.dragging=false}

  useEffect(()=>{
    const c=canvas.current, context=c?.getContext('2d')
    if(!context)return
    let frame=0, last=performance.now(), lastHud=0, lastEffect=0
    const ratio=Math.min(window.devicePixelRatio||1,2)
    c.width=W*ratio;c.height=H*ratio;context.setTransform(ratio,0,0,ratio,0,0)
    const render=now=>{
      const e=engine.current
      if(phase==='playing'&&!paused){e.update(Math.min((now-last)/1000,.05));if(e.events.length){if(now-lastEffect>110&&e.events.includes('score')){effects.current?.('score');lastEffect=now}e.events=[]}
        if(e.completed){setPhase('complete');if(!awarded.current){awarded.current=true;onSolvedRef.current({id:game.id,score:e.score});effects.current?.('complete')}}
      }
      last=now;draw(context,e)
      if(now-lastHud>120){setHud({score:e.score,stage:e.stage,progress:(e.time%STAGE_SECONDS)/STAGE_SECONDS,cooldown:e.cooldown,busy:!!e.projectile});lastHud=now}
      frame=requestAnimationFrame(render)
    }
    frame=requestAnimationFrame(render)
    return()=>cancelAnimationFrame(frame)
  },[phase,paused,game.id])

  useEffect(()=>{
    const visibility=()=>{if(document.hidden&&phase==='playing'){clearInput();setPaused(true)}}
    const blur=()=>{clearInput();if(phase==='playing')setPaused(true)}
    const keydown=event=>{
      if(phase!=='playing'||paused)return
      const keys={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',a:'left',d:'right',w:'up',s:'down'}
      if(keys[event.key]){event.preventDefault();const key=keys[event.key];engine.current.input[key]=true;if(!event.repeat)engine.current.steer(key==='left'?-1:key==='right'?1:0,key==='up'?-1:key==='down'?1:0)}
      if(event.code==='Space'){event.preventDefault();engine.current.input.held=true;if(!event.repeat)engine.current.action()}
      if(event.key==='Escape'){clearInput();setPaused(true)}
    }
    const keyup=event=>{const keys={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',a:'left',d:'right',w:'up',s:'down'};if(keys[event.key])engine.current.input[keys[event.key]]=false;if(event.code==='Space')engine.current.input.held=false}
    document.addEventListener('visibilitychange',visibility);window.addEventListener('blur',blur);window.addEventListener('keydown',keydown);window.addEventListener('keyup',keyup)
    return()=>{document.removeEventListener('visibilitychange',visibility);window.removeEventListener('blur',blur);window.removeEventListener('keydown',keydown);window.removeEventListener('keyup',keyup);clearInput()}
  },[phase,paused])

  const point=event=>{const rect=canvas.current.getBoundingClientRect();return{x:(event.clientX-rect.left)*W/rect.width,y:(event.clientY-rect.top)*H/rect.height}}
  const pointer=(event,type)=>{
    if(phase!=='playing'||paused)return
    event.preventDefault();const pt=point(event)
    if(type==='down'){canvas.current.setPointerCapture(event.pointerId);gesture.current=pt}
    if(type==='move'&&!gesture.current)return
    if(['snake','racer'].includes(game.kind)&&gesture.current){const dx=pt.x-gesture.current.x,dy=pt.y-gesture.current.y;if(Math.max(Math.abs(dx),Math.abs(dy))>22){if(Math.abs(dx)>Math.abs(dy))engine.current.steer(Math.sign(dx),0);else if(game.kind==='snake')engine.current.steer(0,Math.sign(dy));gesture.current=pt}}
    engine.current.pointer(pt.x,pt.y,type)
    if(type==='up')gesture.current=null
  }
  const control=(key,label,symbol,dx,dy)=> <button key={key} className="arcade-arrow" aria-label={label} disabled={phase!=='playing'||paused} onPointerDown={event=>{event.preventDefault();event.currentTarget.setPointerCapture(event.pointerId);engine.current.input[key]=true;engine.current.steer(dx,dy)}} onPointerUp={()=>{engine.current.input[key]=false}} onPointerCancel={()=>{engine.current.input[key]=false}} onLostPointerCapture={()=>{engine.current.input[key]=false}} onKeyDown={event=>{if(event.key==='Enter'){engine.current.steer(dx,dy);engine.current.input[key]=true}}} onKeyUp={()=>{engine.current.input[key]=false}}>{symbol}</button>
  const best=Math.max(records[game.id]||0,hud.score)
  return <div className={`screen screen--arcade arcade--${game.kind}`} style={{'--game-color':game.color}}>
    <div className="arcade-shell">
      <header className="arcade-header"><div><span className="arcade-eyebrow">{t.unlocked} · {completed}/{total}</span><h1><span>{game.emoji}</span> {game.name[lang]}</h1></div><button className="arcade-pause" aria-label={t.pause} disabled={phase!=='playing'} onClick={()=>{clearInput();setPaused(true)}}>Ⅱ</button></header>
      <div className="arcade-hud"><div><span>{t.score}</span><strong aria-live="off">{hud.score.toString().padStart(4,'0')}</strong></div><div className="arcade-stage-count"><span>{t.stage} {hud.stage}/4</span><div className="arcade-stage-dots">{[1,2,3,4].map(n=><i key={n} className={n<=hud.stage?'is-lit':''}/>)}</div></div><div className="arcade-world"><span>{planet.emoji}</span><small>{planet.name[lang]}</small></div></div>
      <div className="arcade-act-track" aria-hidden="true"><span style={{width:`${phase==='complete'?100:((hud.stage-1)+hud.progress)/4*100}%`}}/></div>
      <p className="arcade-instruction">{game.hint[lang]}</p>
      <div className="arcade-stage">
        <canvas ref={canvas} data-game={game.id} data-kind={game.kind} aria-label={`${game.name[lang]}. ${game.hint[lang]}`} onPointerDown={e=>pointer(e,'down')} onPointerMove={e=>pointer(e,'move')} onPointerUp={e=>pointer(e,'up')} onPointerCancel={()=>{gesture.current=null;engine.current.dragging=false}} />
        {(phase==='ready'||paused||phase==='complete')&&<div className="arcade-overlay">
          {phase==='complete'?<div className="arcade-dialog"><div className="arcade-hero-icon">🏆</div><span className="arcade-eyebrow">{t.complete}</span><h2>{t.good}</h2><div className="arcade-final-score"><span>{t.total}</span><strong>{hud.score}</strong><small>{t.record}: {best}</small></div><p className="arcade-bonus">✨ +12 · {t.bonus}</p><button className="arcade-primary arcade-return" onClick={onContinue}>{t.finish} →</button></div>
          :paused?<div className="arcade-dialog"><div className="arcade-hero-icon">🌙</div><h2>{t.paused}</h2><p>{t.pauseNote}</p><button className="arcade-primary" onClick={()=>setPaused(false)}>{t.resume} ▶</button><button className="arcade-return" onClick={onContinue}>{t.exit} →</button></div>
          :<div className="arcade-dialog"><div className="arcade-hero-icon">{game.emoji}</div><span className="arcade-eyebrow">{t.ready}</span><h2>{game.name[lang]}</h2><p>{game.hint[lang]}</p><div className="arcade-ready-note"><span>✦ ✦ ✦ ✦</span><strong>{t.four}</strong><small>{t.next}</small></div><button className="arcade-primary" onClick={()=>{setPaused(false);setPhase('playing');if(game.kind==='flap')engine.current.action()}}>{t.start} ▶</button><button className="arcade-return" onClick={onContinue}>{t.skip} →</button></div>}
        </div>}
      </div>
      <div className={`arcade-controls ${!horizontal?'arcade-controls--action':''}`}>
        {horizontal&&<div className="arcade-direction-controls">{control('left',es?'Izquierda':'Left','←',-1,0)}{fourArrows&&control('up',es?'Arriba':'Up','↑',0,-1)}{fourArrows&&control('down',es?'Abajo':'Down','↓',0,1)}{control('right',es?'Derecha':'Right','→',1,0)}</div>}
        {action&&<button className={`arcade-action ${hud.cooldown>0?'is-recharging':''}`} aria-label={action[es?1:0]} disabled={phase!=='playing'||paused||(hud.cooldown>0&&game.kind!=='racer')||(game.kind==='sling'&&hud.busy)} onPointerDown={event=>{event.preventDefault();event.currentTarget.setPointerCapture(event.pointerId);engine.current.input.held=true;engine.current.action()}} onPointerUp={()=>{engine.current.input.held=false}} onPointerCancel={()=>{engine.current.input.held=false}} onLostPointerCapture={()=>{engine.current.input.held=false}} onKeyDown={event=>{if(event.key==='Enter')engine.current.action()}}>{hud.cooldown>0?`${Math.ceil(hud.cooldown)} · `:''}{game.kind==='sling'&&hud.busy?(es?'EN VUELO':'IN FLIGHT'):action[es?1:0]} {game.kind==='racer'?'»':'✦'}</button>}
      </div>
      <p className="arcade-footer-note">{game.kind==='sling'?(es?'Tira hacia atrás para apuntar · suelta para lanzar':'Pull back to aim · let go to launch'):horizontal?t.hold:t.rescue}</p>
    </div>
  </div>
}
