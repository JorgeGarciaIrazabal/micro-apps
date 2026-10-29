const copy = {
  combo: ['Combo ×{combo}!', '¡Combo ×{combo}!'],
  restack: ['A fresh tower is on its way!', '¡Preparamos otra torre!'],
  tower: ['Tower {round} — ready!', '¡Torre {round} preparada!'],
  clear: ['Amazing! All clear!', '¡Increíble! ¡Todo despejado!'],
  split: ['Triple trouble!', '¡Triple sorpresa!'], dash: ['Comet boost!', '¡Impulso meteórico!'], boom: ['Chain reaction!', '¡Reacción en cadena!'],
  portal: ['Portal hop!', '¡Salto de portal!'],
  perfect: ['Perfect ring!', '¡Anillo perfecto!'], burst: ['Crystal chain!', '¡Cadena de cristales!'],
  ghost: ['Ghost snake!', '¡Serpiente fantasma!'],
  bubble: ['Bubble shield!', '¡Escudo burbuja!'],
  multi: ['Multiball!', '¡Multipelota!'],
  triple: ['Triple blaster!', '¡Triple rayo!'], boss: ['Here comes the big saucer!', '¡Llega el gran platillo!'], bossClear: ['Big saucer defeated!', '¡Gran platillo derrotado!'],
  wings: ['Moon wings!', '¡Alas lunares!'],
  magnet: ['Berry magnet!', '¡Imán de bayas!'],
  slow: ['Slow motion!', '¡Cámara lenta!'], rescue: ['Space friend rescued!', '¡Amigo espacial rescatado!'],
  rocket: ['Rocket boost!', '¡Impulso cohete!'], spring: ['Super bounce!', '¡Superrebote!'],
  turbo: ['Turbo shield!', '¡Escudo turbo!'], close: ['Close call! Bonus points!', '¡Por los pelos! ¡Puntos extra!'],
}
export function flavorText(key, lang, data={}) {
  let text=copy[key]?.[lang==='es'?1:0] || ''
  for(const [name,value] of Object.entries(data))text=text.replace(`{${name}}`,value)
  return text
}
const twists = {
  snake: ['Find golden fruit for ghost powers. Portals can whisk you across the garden!', 'Busca fruta dorada para ser fantasma. ¡Los portales te llevan al otro lado del jardín!'],
  flap: ['Aim through the star rings. Golden rings give you a bubble shield!', 'Apunta a los anillos. ¡Los dorados te dan un escudo burbuja!'],
  sling: ['Glass shatters, wood topples, and stone is heavy. Hit a spark barrel for a chain reaction! Tap the button in flight for a special power.', 'El cristal se rompe, la madera cae y la piedra pesa. ¡Golpea un barril para crear una reacción en cadena! Toca el botón en pleno vuelo para usar un poder.'],
  breakout: ['Star bricks set off chain reactions. Catch a power star for a wider paddle and multiball!', 'Los ladrillos con estrella crean reacciones en cadena. ¡Atrapa un poder para conseguir una pala ancha y varias pelotas!'],
  blaster: ['Catch power stars for triple shots. Watch for the giant saucer and its glowing shots!', 'Atrapa poderes para disparar por tres. ¡Cuidado con el gran platillo y sus rayos brillantes!'],
  runner: ['Follow the star trails. A power star gives you floaty moon wings!', 'Sigue los caminos de estrellas. ¡Un poder te da alas lunares para flotar!'],
  catch: ['Catch treats in a row to grow your combo. A magnet pulls nearby berries into your basket!', 'Atrapa premios seguidos para aumentar tu combo. ¡El imán acerca las bayas a tu cesta!'],
  asteroid: ['Look for little friends in rescue pods. Catch a power star to slow the storm!', 'Busca amigos en cápsulas de rescate. ¡Atrapa un poder para frenar la tormenta!'],
  jumper: ['Golden springs bounce you higher. Catch a rocket star for a ride through the clouds!', 'Los muelles dorados te hacen saltar más alto. ¡Atrapa un poder cohete para subir entre las nubes!'],
  racer: ['Sneak past traffic for close-call bonuses. Collect power stars for a turbo shield!', 'Adelanta cerca de otros coches para ganar puntos extra. ¡Recoge poderes para conseguir un escudo turbo!'],
}
export function twistText(kind,lang,variant=0){
 if(kind==='snake'&&variant!==2)return lang==='es'?'¡Busca fruta dorada para atravesar tu cola con el poder fantasma!':'Find golden fruit to glide through your tail with ghost powers!'
 return twists[kind][lang==='es'?1:0]
}
export const SHOT_NAMES = {
  heavy: { en:'Boulder',es:'Roca' }, split:{en:'Triple comet',es:'Triple cometa'},bomb:{en:'Star bomb',es:'Bomba estelar'},
}
export const SHOT_ACTIONS = {heavy:['DASH','IMPULSO'],split:['SPLIT','TRIPLE'],bomb:['BOOM','BOOM']}
const goals = {
  snake:['Find the golden fruit!', '¡Busca la fruta dorada!'],flap:['Fly through the star rings!', '¡Pasa por los anillos!'],
  breakout:['Catch stars for multiball!', '¡Atrapa poderes multipelota!'],blaster:['Watch for the giant saucer!', '¡Cuidado con el gran platillo!'],
  runner:['Follow the star trail!', '¡Sigue el camino de estrellas!'],catch:['Keep your catching combo!', '¡Atrapa premios seguidos!'],
  asteroid:['Find the rescue pods!', '¡Busca las cápsulas de rescate!'],jumper:['Look for golden springs!', '¡Busca los muelles dorados!'],racer:['Near misses earn a bonus!', '¡Adelantar cerca da puntos!'],
}
export function goalText(kind,lang){return goals[kind]?.[lang==='es'?1:0]||''}
