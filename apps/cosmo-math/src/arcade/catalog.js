const families = [
  ['snake', '🐍', ['Stardust Snake', 'Garden Gobbler', 'Portal Python'], ['Serpiente estelar', 'Glotón del jardín', 'Pitón de portales'], 'Swipe or use the arrows to steer. Gobble glowing fruit and grow!', 'Desliza o usa las flechas. ¡Come fruta brillante y crece!'],
  ['flap', '🪽', ['Moonbird', 'Bubble Wings', 'Firefly Flight'], ['Pájaro lunar', 'Alas de burbuja', 'Vuelo de luciérnaga'], 'Tap to flap. Fly through the openings and scoop up stars.', 'Toca para aletear. Pasa por los huecos y recoge estrellas.'],
  ['sling', '☄️', ['Meteor Mayhem', 'Balloon Bandits', 'Lunar Knockdown'], ['Lluvia de meteoros', 'Bandidos de globos', 'Derribo lunar'], 'Pull the comet back, then let go! Knock down the wobbly alien towers.', 'Tira del cometa y suelta. ¡Derriba las torres alienígenas!'],
  ['breakout', '🧱', ['Prism Breaker', 'Bumper Galaxy', 'Crystal Smash'], ['Rompeprismas', 'Galaxia de rebotes', 'Destroza cristales'], 'Slide to move your paddle. Bounce the ball and smash the crystals.', 'Desliza para mover la pala. Rebota la pelota y rompe los cristales.'],
  ['blaster', '🚀', ['Star Defender', 'Saucer Swarm', 'Comet Patrol'], ['Defensor estelar', 'Enjambre de platillos', 'Patrulla de cometas'], 'Slide to steer. Your ship fires automatically. Tap BLAST for a super shot!', 'Desliza para pilotar. La nave dispara sola. ¡Toca RAYO para un superdisparo!'],
  ['runner', '🦊', ['Moon Dash', 'Mushroom Sprint', 'Lava Leap'], ['Carrera lunar', 'Esprint de setas', 'Salto de lava'], 'Tap to jump over obstacles. Tap again in the air for a double jump!', 'Toca para saltar obstáculos. ¡Toca otra vez en el aire para un salto doble!'],
  ['catch', '🧺', ['Starberry Shower', 'Cosmic Kitchen', 'Rainbow Rain'], ['Lluvia de bayas', 'Cocina cósmica', 'Lluvia de arcoíris'], 'Slide your basket to catch treats. Dodge the chunky moon rocks!', 'Mueve la cesta para atrapar premios. ¡Esquiva las rocas lunares!'],
  ['asteroid', '🛸', ['Asteroid Drift', 'Nebula Rescue', 'Meteor Storm'], ['Deriva de asteroides', 'Rescate nebuloso', 'Tormenta de meteoros'], 'Drag your ship through space. Collect crystals. Tap NOVA to clear a path!', 'Arrastra la nave. Recoge cristales. ¡Toca NOVA para despejar el camino!'],
  ['jumper', '🐸', ['Cloud Hopper', 'Jelly Jump', 'Treetop Bounce'], ['Saltanubes', 'Salto gelatinoso', 'Rebote entre árboles'], 'Slide left and right to land on platforms. Your little explorer jumps by itself!', 'Desliza de lado a lado para caer en plataformas. ¡Tu explorador salta solo!'],
  ['racer', '🏎️', ['Saturn Speedway', 'Neon Rally', 'Penguin Slide'], ['Circuito Saturno', 'Rally neón', 'Deslizamiento pingüino'], 'Swipe sideways to change lanes. Dodge traffic and collect energy. Hold BOOST to zoom!', 'Desliza de lado para cambiar de carril. Esquiva y recoge energía. ¡Mantén TURBO para acelerar!'],
]
export const ARCADE_GAMES = Array.from({ length: 3 }, (_, variant) => families.map(([kind, emoji, en, es, hintEn, hintEs], family) => ({
  id: `${kind}-${variant}`, kind, variant, emoji,
  name: { en: en[variant], es: es[variant] },
  hint: { en: hintEn, es: hintEs },
  color: ['#79f2bd', '#9bc9ff', '#ffbb85', '#d9a2ff', '#77e5ff', '#ffd38a', '#ff96bc', '#9db0ff', '#a5ef86', '#ffa9dc'][family],
}))).flat()
export const STAGE_SECONDS = 50
export const STAGES = 4
export const SESSION_SECONDS = STAGE_SECONDS * STAGES
export function assignedGame(worldIndex, checkpoint, visit = 0) {
  return ARCADE_GAMES[(worldIndex * 2 + (checkpoint === 6 ? 1 : 0) + visit * 7) % ARCADE_GAMES.length]
}
