const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
// Each entry specifies a mathematical action and a playable interaction.
export const QUESTS = [
  ['order', '🪐', 'Orbit sorter', 'Ordena las órbitas', 'Arrange the planets from smallest to largest.', 'Ordena los planetas de menor a mayor.', 'order'],
  ['reverse', '☄️', 'Comet countdown', 'Cuenta atrás', 'Arrange the comets from largest to smallest.', 'Ordena los cometas de mayor a menor.', 'order'],
  ['recipe', '🧪', 'Potion recipe', 'Receta de pociones', 'Choose exactly three ingredients that add up to the recipe.', 'Elige exactamente tres ingredientes que sumen la receta.', 'select'],
  ['change', '🪙', 'Moon money', 'Monedas lunares', 'Choose coins to pay the exact price.', 'Elige monedas para pagar el precio exacto.', 'select'],
  ['multiply', '🌻', 'Array garden', 'Jardín de grupos', 'Plant the requested rows and columns by tapping the soil.', 'Planta las filas y columnas indicadas tocando la tierra.', 'grid'],
  ['fraction', '🍕', 'Meteor pizza', 'Pizza meteórica', 'Colour the requested fraction of the pizza slices.', 'Colorea la fracción indicada de la pizza.', 'grid'],
  ['mirror', '🦋', 'Symmetry wings', 'Alas simétricas', 'Copy the left wing onto the right as a mirror image.', 'Copia el ala izquierda a la derecha como un espejo.', 'grid'],
  ['memory', '📡', 'Signal pairs', 'Parejas de señales', 'Flip cards and match each sum with its answer.', 'Voltea cartas y une cada suma con su resultado.', 'memory'],
  ['clock', '🕰️', 'Time pilot', 'Piloto del tiempo', 'Set the clock to the departure time.', 'Ajusta el reloj a la hora de salida.', 'clock'],
  ['jump', '🐸', 'Moon frog', 'Rana lunar', 'Hop along the lily pads. Land on the target in exactly three hops.', 'Salta por los nenúfares. Llega a la meta en exactamente tres saltos.', 'path'],
  ['maze', '🧑‍🚀', 'Sum trail', 'Camino de sumas', 'Move right or down. Collect numbers to reach the exit total.', 'Avanza a la derecha o abajo. Suma los números hasta la meta.', 'path'],
  ['machine', '🏭', 'Number factory', 'Fábrica numérica', 'Set the machine’s addition dial so every input becomes its output.', 'Ajusta la suma para transformar cada entrada en su salida.', 'dial'],
  ['estimate', '📍', 'Landing zone', 'Zona de aterrizaje', 'Move the slider to the exact landing coordinate.', 'Mueve el control hasta la coordenada de aterrizaje.', 'dial'],
  ['round', '🎯', 'Rounding radar', 'Radar de redondeo', 'Set the radar to the nearest ten.', 'Ajusta el radar a la decena más cercana.', 'dial'],
  ['equation', '🔧', 'Equation mechanic', 'Mecánico de ecuaciones', 'Tap tiles to build a true equation. Use every tile.', 'Toca las fichas para crear una igualdad. Usa todas.', 'tiles'],
  ['code', '🔐', 'Vault decoder', 'Descifra la caja', 'Solve the clues and enter the three-digit code in order.', 'Resuelve las pistas e introduce el código de tres cifras en orden.', 'tiles'],
  ['odd', '🛸', 'Odd-number rescue', 'Rescate de impares', 'Select every odd-numbered escape pod.', 'Selecciona todas las cápsulas con números impares.', 'select'],
  ['even', '⚡', 'Even circuit', 'Circuito par', 'Switch on every even-numbered battery.', 'Enciende todas las baterías con números pares.', 'select'],
  ['difference', '🌡️', 'Temperature repair', 'Repara el termostato', 'Raise or lower the temperature to the requested level.', 'Sube o baja la temperatura hasta el nivel indicado.', 'dial'],
  ['count', '🔎', 'Creature census', 'Censo de criaturas', 'Count only the moonbugs. Set the scanner to their number.', 'Cuenta solo los bichos lunares. Ajusta el escáner a esa cantidad.', 'dial'],
  ['tenframe', '💡', 'Ten-frame lights', 'Luces de diez', 'Turn on enough extra lights to make ten in total.', 'Enciende las luces que faltan para llegar a diez.', 'grid'],
  ['area', '🧱', 'Habitat architect', 'Arquitecto del refugio', 'Build a rectangle with the requested area. Tap every square it occupies.', 'Construye un rectángulo con el área indicada. Toca cada casilla que ocupa.', 'grid'],
  ['skip', '🎵', 'Rhythm sequencer', 'Secuenciador de ritmo', 'Tap the next four beats of the number pattern, in order.', 'Toca los cuatro números siguientes del patrón, en orden.', 'tiles'],
  ['complement', '🌉', 'Bridge to twenty', 'Puente a veinte', 'Select two bridge pieces that add up to twenty.', 'Elige dos piezas del puente que sumen veinte.', 'select'],
  ['divisors', '🍪', 'Cookie crew', 'Tripulación de galletas', 'Choose every crew size that can share the cookies equally, with none left.', 'Elige todos los tamaños de grupo que pueden repartir las galletas sin que sobren.', 'select'],
  ['compare-sort', '⚖️', 'Mass inspector', 'Inspector de masas', 'Solve the cargo labels, then sort them from lightest to heaviest.', 'Resuelve las etiquetas y ordena las cargas de menor a mayor.', 'order'],
  ['target', '🎲', 'Dice engineer', 'Ingeniero de dados', 'Set the two dice so their product matches the engine target.', 'Ajusta los dos dados para que su producto coincida con la meta.', 'dice'],
].map(([id, emoji, en, es, hintEn, hintEs, mode]) => ({ id, emoji, name: { en, es }, hint: { en: hintEn, es: hintEs }, mode }))

const shuffle = a => [...a].sort(() => Math.random() - .5)
export function makeQuest(type) {
  const meta = QUESTS.find(q => q.id === type)
  const c = { ...meta, type, id: `${type}:${Math.random()}` }
  const a = rand(2, 7), b = rand(2, 5)
  switch (type) {
    case 'order': case 'reverse': case 'compare-sort': {
      const values = shuffle([a, a + 2, a + 5, a + 9])
      c.items = values.map((v, i) => ({ value: v, label: type === 'compare-sort' ? `${v - 1} + 1` : `${v}`, id: i }))
      c.answer = [...c.items].sort((x,y) => type === 'reverse' ? y.value - x.value : x.value - y.value).map(v => v.id)
      break
    }
    case 'recipe': c.values = shuffle([1, 3, 4, 6, 8, 9]); c.target = 11; c.required = 3; break
    case 'change': c.values = [1, 2, 2, 5, 5, 10]; c.target = rand(1, 5) * 2 + 5; break
    case 'complement': c.values = shuffle([3, 7, 9, 11, 13, 16]); c.target = 20; c.required = 2; break
    case 'odd': case 'even': c.values = shuffle([a, a + 1, a + 2, a + 3, a + 4, a + 5]); c.answer = c.values.map((v,i) => v % 2 === (type === 'odd' ? 1 : 0) ? i : -1).filter(i => i >= 0); break
    case 'divisors': c.target = [12, 18, 24][rand(0,2)]; c.values = [2,3,4,5,6]; c.answer = c.values.map((v,i) => c.target % v === 0 ? i : -1).filter(i => i >= 0); break
    case 'multiply': c.rows = rand(2,3); c.cols = rand(2,4); c.target = c.rows * c.cols; break
    case 'fraction': c.total = 8; c.target = rand(1,7); break
    case 'mirror': c.pattern = [0,1,2,3,4,5,6,7].filter(() => Math.random() > .45); if (!c.pattern.length) c.pattern = [0,3]; break
    case 'tenframe': c.given = rand(2,8); c.target = 10 - c.given; break
    case 'area': c.target = [4,6,8,9,12][rand(0,4)]; break
    case 'memory': c.cards = shuffle([0,1,2].flatMap((n) => [{ pair: n, label: `${a+n} + ${b}` }, { pair: n, label: `${a+b+n}` }])); break
    case 'clock': c.hour = rand(1,12); c.minute = [0,15,30,45][rand(0,3)]; break
    case 'jump': c.start = 0; c.steps = [1,2,3]; c.target = rand(4,8); break
    case 'maze': c.cells = Array.from({length:9}, () => rand(1,5)); c.target = [0,1,4,5,8].reduce((sum,i) => sum + c.cells[i],0); break
    case 'machine': c.answer = rand(2,9); c.inputs = [2,5,8]; c.target = c.answer; c.max = 12; break
    case 'estimate': c.target = rand(1,20) * 5; c.max = 100; break
    case 'round': c.number = rand(11,89); c.target = Math.round(c.number / 10) * 10; c.max = 100; c.step = 10; break
    case 'difference': c.start = rand(2,10); c.target = rand(12,24); c.max = 30; break
    case 'count': c.target = rand(4,10); c.creatures = shuffle([...Array(c.target).fill('🐛'), ...Array(rand(3,6)).fill('🪨')]); c.max = 16; break
    case 'equation': c.tiles = shuffle([`${a}`, '+', `${b}`, '=', `${a+b}`]); c.answer = `${a}+${b}=${a+b}`; break
    case 'code': c.digits = [a, b, rand(1,9)]; c.clues = [`${a-1} + 1`, `${b+2} − 2`, `${c.digits[2]+1} − 1`]; c.tiles = Array.from({length:10},(_,i) => `${i}`); break
    case 'skip': c.step = [2,3,5][rand(0,2)]; c.start = rand(1,3) * c.step; c.sequence = Array.from({length:4},(_,i) => `${c.start+(i+1)*c.step}`); c.tiles = shuffle([...c.sequence, `${c.start+1}`, `${c.start+5*c.step}`]); break
    case 'target': c.target = rand(2,6)*rand(2,6); break
  }
  return c
}
