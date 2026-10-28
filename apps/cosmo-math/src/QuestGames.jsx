import { useState } from 'react'
const same = (a,b) => JSON.stringify(a) === JSON.stringify(b)
export default function QuestGame({ challenge: c, lang, solved, onAttempt }) {
  const es = lang === 'es'
  const [selected, setSelected] = useState([])
  const [dial, setDial] = useState(c.start || 0)
  const [dice, setDice] = useState([1,1])
  const [hour, setHour] = useState(12)
  const [minute, setMinute] = useState(0)
  const [flipped, setFlipped] = useState([])
  const [matched, setMatched] = useState([])
  const [tested, setTested] = useState(false)
  const [path, setPath] = useState(c.type === 'maze' ? [0] : [])
  const toggle = i => { setTested(false); setSelected(a => a.includes(i) ? a.filter(v => v !== i) : [...a,i]) }
  const total = c.values ? selected.reduce((s,i) => s + c.values[i],0) : 0
  const current = c.type === 'maze' ? path.reduce((s,i) => s + c.cells[i],0) : path.reduce((s,v) => s + v,0)
  const rectangle = () => {
    if (!selected.length) return false
    const rows = selected.map(i => Math.floor(i/4)), cols = selected.map(i => i%4)
    const h = Math.max(...rows)-Math.min(...rows)+1, w = Math.max(...cols)-Math.min(...cols)+1
    return h*w === selected.length && (c.type !== 'multiply' || (h === c.rows && w === c.cols))
  }
  const valid = () => {
    switch(c.mode) {
      case 'order': return same(selected, c.answer)
      case 'select': return c.answer ? same([...selected].sort((a,b)=>a-b),c.answer) : total === c.target && (!c.required || selected.length === c.required)
      case 'grid':
        if(c.type === 'mirror') return same([...selected].sort((a,b)=>a-b), c.pattern.map(i => Math.floor(i/2)*2+1-i%2).sort((a,b)=>a-b))
        return selected.length === c.target && (!['area','multiply'].includes(c.type) || rectangle())
      case 'memory': return matched.length === 6
      case 'clock': return hour === c.hour && minute === c.minute
      case 'path': return c.type === 'maze' ? path.at(-1) === 8 && current === c.target : path.length === 3 && current === c.target
      case 'dial': return dial === c.target
      case 'dice': return dice[0]*dice[1] === c.target
      case 'tiles': {
        const text = selected.map(i => c.tiles[i]).join('')
        if(c.type === 'code') return text === c.digits.join('')
        if(c.type === 'skip') return same(selected.map(i => c.tiles[i]),c.sequence)
        return selected.length === 5 && [c.answer, c.answer.split('+')[1]?.split('=')[0]+'+'+c.answer.split('+')[0]+'='+c.answer.split('=')[1]].includes(text)
      }
      default: return false
    }
  }
  const status = solved ? (es ? '¡Bien pensado! Misión completada.' : 'Good thinking! Mission complete.') : tested ? (es ? 'Prueba otra estrategia. Puedes cambiar tu plan.' : 'Try another strategy. You can change your plan.') : '\u00a0'
  const reset = () => { setSelected([]); setPath(c.type === 'maze' ? [0] : []); setFlipped([]); setMatched([]); setTested(false); setDial(c.start || 0) }
  return <div className={`quest-game quest--${c.type}`}>
    <h2>{c.emoji} {c.name[lang]}</h2><p className="mission-instructions">{c.hint[lang]}</p>
    {c.mode === 'order' && <><div className="tile-slots">{selected.map(i => <span key={i}>{c.items[i].label}</span>)}{Array(c.items.length-selected.length).fill(0).map((_,i) => <span key={`empty${i}`}>?</span>)}</div><div className="mission-tools">{c.items.map((item,i) => <button className="mission-tool" key={i} disabled={solved || selected.includes(i)} onClick={() => setSelected(a=>[...a,i])}>{item.label}</button>)}</div></>}
    {c.mode === 'select' && <>{c.target && <p className="quest-target">{c.type === 'divisors' ? '🍪' : '🎯'} {c.target}{c.type !== 'divisors' && <small>{es ? 'Tu total' : 'Your total'}: {total}{c.required ? ` · ${selected.length}/${c.required}` : ''}</small>}</p>}<div className="mission-tools">{c.values.map((n,i) => <button key={i} className={`mission-tool ${selected.includes(i) ? 'is-selected' : ''}`} aria-pressed={selected.includes(i)} disabled={solved} onClick={()=>toggle(i)}>{n}</button>)}</div></>}
    {c.mode === 'grid' && <>
      <p className="quest-target">{c.type === 'multiply' ? `${c.rows} × ${c.cols}` : c.type === 'fraction' ? `${c.target} / ${c.total}` : c.type === 'mirror' ? '🦋' : c.type === 'tenframe' ? `${c.given} + ? = 10` : `${c.target} ▧`}</p>
      {c.type === 'mirror' ? <div className="mirror-wings"><div className="pixel-grid wing-grid" aria-label={es ? 'Ala modelo' : 'Reference wing'}>{Array.from({length:8},(_,i)=><span key={i} className={`pixel ${c.pattern.includes(i)?'is-selected':''}`} />)}</div><span>┊</span><div className="pixel-grid wing-grid">{Array.from({length:8},(_,i)=><button key={i} aria-label={`${es?'Casilla':'Cell'} ${i+1}`} aria-pressed={selected.includes(i)} disabled={solved} onClick={()=>toggle(i)} className={`pixel ${selected.includes(i)?'is-selected':''}`} />)}</div></div> : <div className={`pixel-grid ${c.type === 'tenframe' ? 'ten-grid' : ''} ${c.type === 'fraction' ? 'pizza-grid' : ''}`}>{Array.from({length:c.type === 'fraction'?8:c.type==='tenframe'?10:16},(_,i)=>{const given=c.type==='tenframe'&&i<c.given;return <button key={i} aria-label={`${es?'Casilla':'Cell'} ${i+1}`} aria-pressed={given||selected.includes(i)} disabled={solved||given} onClick={()=>toggle(i)} className={`pixel ${given||selected.includes(i)?'is-selected':''}`}>{given?'💡':selected.includes(i)?c.type==='multiply'?'🌻':c.type==='fraction'?'🍕':'✦':''}</button>})}</div>}
      <p>{es?'Seleccionadas':'Selected'}: {selected.length}</p>
    </>}
    {c.mode === 'memory' && <div className="memory-grid">{c.cards.map((card,i)=>{const visible=flipped.includes(i)||matched.includes(i); return <button className={`memory-card ${matched.includes(i)?'is-selected':''}`} key={i} disabled={solved||visible} aria-label={visible?card.label:`${es?'Carta':'Card'} ${i+1}`} onClick={()=>{
      const next=flipped.length===2?[i]:[...flipped,i];setFlipped(next)
      if(next.length===2 && c.cards[next[0]].pair===c.cards[next[1]].pair) {setMatched(a=>[...a,...next]);setFlipped([])}
    }}>{visible?card.label:'📡'}</button>})}</div>}
    {c.mode === 'clock' && <>
      <p className="quest-target">{c.hour}:{String(c.minute).padStart(2,'0')}</p>
      <svg className="teaching-clock" viewBox="0 0 200 200" role="img" aria-label={`${hour}:${String(minute).padStart(2,'0')}`}><circle cx="100" cy="100" r="94" fill="#ffffff0c" stroke="#b4a5df"/>{Array.from({length:12},(_,i)=>{const angle=(i+1)*Math.PI/6;return <text key={i} x={100+77*Math.sin(angle)} y={105-77*Math.cos(angle)} textAnchor="middle" fill="white" fontSize="14">{i+1}</text>})}<line x1="100" y1="100" x2="100" y2="48" stroke="#ffd166" strokeWidth="6" strokeLinecap="round" transform={`rotate(${hour*30+minute/2} 100 100)`}/><line x1="100" y1="100" x2="100" y2="30" stroke="#5eeac0" strokeWidth="4" strokeLinecap="round" transform={`rotate(${minute*6} 100 100)`}/><circle cx="100" cy="100" r="5" fill="white"/></svg>
      <div className="clock-controls"><label>{es?'Hora':'Hour'}<input aria-label={es?'Hora':'Hour'} type="range" min="1" max="12" value={hour} disabled={solved} onChange={e=>setHour(+e.target.value)}/>{hour}</label><label>{es?'Minutos':'Minutes'}<input aria-label={es?'Minutos':'Minutes'} type="range" min="0" max="45" step="15" value={minute} disabled={solved} onChange={e=>setMinute(+e.target.value)}/>{minute}</label></div>
    </>}
    {c.mode === 'path' && <><p className="quest-target">{current} → 🎯 {c.target}</p>{c.type==='maze'?<div className="pixel-grid maze-grid">{c.cells.map((n,i)=>{const last=path.at(-1);const available=!path.includes(i)&&(i===last+3||(last%3<2&&i===last+1));return <button className={`pixel ${path.includes(i)?'is-selected':''}`} key={i} disabled={solved||!available} onClick={()=>setPath(a=>[...a,i])}>{n}{i===8?' 🏁':''}</button>})}</div>:<><div className="frog-trail">🐸 {path.join(' + ')}{path.length?` = ${current}`:''}</div><div className="mission-tools">{c.steps.map(n=><button className="mission-tool" disabled={solved||path.length===3} key={n} onClick={()=>setPath(a=>[...a,n])}>+{n}</button>)}</div><p>{path.length}/3 {es?'saltos':'hops'}</p></>}</>}
    {c.mode === 'dial' && <>
      <div className="dial-clue">{c.type==='machine'?c.inputs.map(n=><span key={n}>{n} → {n+c.answer}</span>):c.type==='count'?<div className="creature-cloud">{c.creatures.map((v,i)=><span key={i}>{v}</span>)}</div>:c.type==='round'?c.number:c.type==='difference'?`${c.start}° → ${c.target}°`:`🎯 ${c.target}`}</div>
      <output className="dial-value">{c.type==='machine'?'+ ':''}{dial}{c.type==='difference'?'°':''}</output>
      <label className="number-slider"><span>0</span><input aria-label={es?'Tu respuesta':'Your answer'} type="range" min="0" max={c.max} step={c.step||1} value={dial} disabled={solved} onChange={e=>{setDial(+e.target.value);setTested(false)}}/><span>{c.max}</span></label>
      <div className="mission-tools">{[-(c.step||1),c.step||1].map(n=><button className="mission-tool" key={n} disabled={solved||dial+n<0||dial+n>c.max} onClick={()=>setDial(a=>a+n)}>{n>0?'+':'−'}{Math.abs(n)}</button>)}</div>
    </>}
    {c.mode === 'tiles' && <>
      {c.type==='code'&&<div className="code-clues">{c.clues.map((v,i)=><span key={i}>{i+1}. {v}</span>)}</div>}
      {c.type==='skip'&&<p className="quest-target">{c.start-c.step}, {c.start}, … (+{c.step})</p>}
      <div className="tile-slots">{selected.map((i,j)=><span key={j}>{c.tiles[i]}</span>)}{!selected.length&&<span>?</span>}</div>
      <div className="mission-tools">{c.tiles.map((v,i)=><button className="mission-tool" disabled={solved||(c.type!=='code'&&selected.includes(i))||selected.length>=(c.type==='code'?3:c.type==='skip'?4:5)} key={i} onClick={()=>setSelected(a=>[...a,i])}>{v}</button>)}</div>
    </>}
    {c.mode==='dice'&&<><p className="quest-target">🎯 {c.target}</p><div className="dice-controls">{dice.map((n,i)=><label key={i}>{es?'Dado':'Die'} {i+1}<output>{['⚀','⚁','⚂','⚃','⚄','⚅'][n-1]}</output><input type="range" aria-label={`${es?'Dado':'Die'} ${i+1}`} min="1" max="6" value={n} disabled={solved} onChange={e=>{const v=+e.target.value;setDice(a=>a.map((x,j)=>j===i?v:x))}}/></label>)}</div><p className="mission-equation">{dice[0]} × {dice[1]} = {dice[0]*dice[1]}</p></>}
    <p className="mission-feedback" role="status">{status}</p><div className="mission-actions"><button className="btn btn--primary" disabled={solved} onClick={()=>{setTested(true);onAttempt(valid())}}>{es?'Probar mi plan':'Test my plan'}</button><button className="ghost-btn" disabled={solved} onClick={reset}>{es?'Empezar de nuevo':'Start over'}</button>{['tiles','order'].includes(c.mode)&&<button className="ghost-btn" disabled={solved||!selected.length} onClick={()=>setSelected(a=>a.slice(0,-1))}>↶ {es?'Deshacer':'Undo'}</button>}</div>
  </div>
}
