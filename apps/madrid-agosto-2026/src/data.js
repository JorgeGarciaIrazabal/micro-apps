// Madrid family trip — 2–14 August 2026
// Bilingual (EN/ES). Translatable strings are { en, es }; plain strings (names, times, phones) stay as-is.

const maps = (q) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`

export const trip = {
  title: 'Madrid · Agosto 2026',
  subtitle: {
    en: 'Family trip agenda — prefab showrooms, American-style towns & easy sights for a 5-year-old and grandparents (70+)',
    es: 'Agenda del viaje — showrooms de casas prefabricadas, pueblos estilo americano y planes fáciles para una niña de 5 años y los abuelos (70+)',
  },
  dateRange: '2 – 14 August 2026',
  homeBase: { en: 'Peñagrande / NW Madrid', es: 'Peñagrande / NO de Madrid' },
  travellers: { en: 'You + partner + daughter (5) + parents (70+)', es: 'Vosotros + hija (5) + abuelos (70+)' },
  car: { en: 'Family car', es: 'Coche familiar' },
}

export const ui = {
  filter: { en: 'Filter:', es: 'Filtrar:' },
  clear: { en: '✕ clear', es: '✕ limpiar' },
  realityTitle: { en: '☀️ August reality checks — read first', es: '☀️ Claves de agosto — léelo primero' },
  prev: { en: '← Prev day', es: '← Día anterior' },
  next: { en: 'Next day →', es: 'Día siguiente →' },
  noStops: { en: 'No stops match the current filter on this day.', es: 'Ningún punto coincide con el filtro en este día.' },
  coolDay: { en: '❄️ cooler day', es: '❄️ día más fresco' },
  checklistTitle: { en: '✅ Book this week', es: '✅ Reservar esta semana' },
  referenceTitle: { en: '📚 Reference', es: '📚 Referencia' },
  showroomsSummary: { en: '🏭 Showrooms — one of each build type', es: '🏭 Showrooms — uno de cada tipo de construcción' },
  townsSummary: { en: '📍 American-style / low-density towns', es: '📍 Pueblos estilo americano / baja densidad' },
  woodCaveat: { en: '🌲 Wood caveat: ', es: '🌲 Nota sobre madera: ' },
  statDays: { en: 'days', es: 'días' },
  statShowrooms: { en: 'showrooms', es: 'showrooms' },
  statTowns: { en: 'towns', es: 'pueblos' },
  statBooked: { en: 'booked', es: 'reservado' },
  excludedTown: { en: 'Excluded — 4h+ away', es: 'Excluido — a más de 4h' },
  foot: {
    en: 'Draft agenda · iterate freely · times are rough August car estimates. Links open in a new tab.',
    es: 'Agenda borrador · para iterar · los tiempos son estimaciones en coche en agosto. Los enlaces abren en otra pestaña.',
  },
}

// Tag taxonomy — used for the filter chips and stop badges.
export const tags = {
  showroom: { label: { en: 'Showroom', es: 'Showroom' }, icon: '🏭', color: '#7c5cff' },
  town: { label: { en: 'Town scouting', es: 'Ver pueblo' }, icon: '📍', color: '#e0662b' },
  kids: { label: { en: 'Kid-friendly', es: 'Para niños' }, icon: '🧒', color: '#00a3a3' },
  seniors: { label: { en: 'Grandparent-easy', es: 'Fácil abuelos' }, icon: '👵', color: '#c9457f' },
  food: { label: { en: 'Food', es: 'Comida' }, icon: '🍽️', color: '#b8860b' },
  nature: { label: { en: 'Nature', es: 'Naturaleza' }, icon: '🌳', color: '#3d9140' },
  culture: { label: { en: 'Culture', es: 'Cultura' }, icon: '🏛️', color: '#4a72c4' },
  water: { label: { en: 'Water / cool-off', es: 'Agua / refrescarse' }, icon: '💦', color: '#1f9bd8' },
  friends: { label: { en: 'Friends', es: 'Amigos' }, icon: '👥', color: '#e0662b' },
  rest: { label: { en: 'Rest', es: 'Descanso' }, icon: '😴', color: '#8a8f98' },
  booking: { label: { en: 'Needs booking', es: 'Reservar' }, icon: '⚠️', color: '#d64545' },
}

export const realityChecks = [
  { icon: '🔥', text: {
    en: 'Heat 35–40 °C in Madrid & SE towns. Main sight before ~13:30, long lunch, siesta, out again after 19:00. Sierra days are 5–8° cooler — save them for the hottest forecasts.',
    es: 'Calor 35–40 °C en Madrid y pueblos del sureste. El plan principal antes de las 13:30, comida larga, siesta y salir de nuevo tras las 19:00. Los días de sierra son 5–8° más frescos — guárdalos para los días de más calor.' } },
  { icon: '🚪', text: {
    en: 'August closures: many firms shut ~Aug 10–18. Every showroom is by appointment — book week 1 (Aug 4–6) and phone-confirm 2–3 days ahead.',
    es: 'Cierres de agosto: muchas empresas cierran ~10–18 ago. Todos los showrooms son con cita — reserva la semana 1 (4–6 ago) y confirma por teléfono 2–3 días antes.' } },
  { icon: '🏗️', text: {
    en: 'Plot viewings are not walk-in. Call a local inmobiliaria in each town a few days ahead to see parcels / meet an agent.',
    es: 'Ver parcelas no es sin cita. Llama a una inmobiliaria local de cada pueblo unos días antes para ver parcelas / hablar con un agente.' } },
  { icon: '🚫', text: {
    en: 'Tren de la Fresa to Aranjuez does NOT run in August (Mar–Jun only) — we drive.',
    es: 'El Tren de la Fresa a Aranjuez NO circula en agosto (solo mar–jun) — vamos en coche.' } },
]

export const days = [
  {
    id: 'aug02', dow: { en: 'Sun', es: 'Dom' }, label: 'Aug 2', emoji: '🛬',
    title: { en: 'Arrival & gentle start', es: 'Llegada y arranque tranquilo' },
    corridor: { en: 'Home / in-city', es: 'Casa / ciudad' },
    heat: null, tags: ['seniors', 'kids', 'rest'],
    summary: {
      en: 'Land, settle in, collect the car, groceries. Nothing demanding — just an easy evening stroll to shake off the travel.',
      es: 'Llegar, instalarse, coger el coche, compra. Nada exigente — un paseo tranquilo por la tarde para soltar el viaje.' },
    stops: [
      { icon: '🏠', kind: { en: 'Settle in', es: 'Instalarse' }, title: { en: 'Home base + car + groceries', es: 'Casa base + coche + compra' }, place: { en: 'Peñagrande, NW Madrid', es: 'Peñagrande, NO de Madrid' },
        desc: { en: 'Unpack, food shop, get the family car ready for the week of day-trips.', es: 'Deshacer maletas, compra y dejar el coche listo para la semana de excursiones.' }, tags: ['rest'], links: [] },
      { icon: '🌅', kind: { en: 'Easy evening', es: 'Tarde tranquila' }, title: { en: 'Templo de Debod + Parque del Oeste', es: 'Templo de Debod + Parque del Oeste' }, place: { en: 'Madrid centre', es: 'Centro de Madrid' }, drive: '15–20 min',
        desc: { en: 'Sunset over the Egyptian temple, playground for the little one, plenty of benches. Or first-night dinner at Plaza Mayor.', es: 'Atardecer sobre el templo egipcio, parque infantil para la peque y muchos bancos. O cena de la primera noche en la Plaza Mayor.' },
        tags: ['kids', 'seniors'], links: [{ label: { en: 'Map', es: 'Mapa' }, type: 'map', url: maps('Templo de Debod Madrid') }] },
    ],
  },
  {
    id: 'aug03', dow: { en: 'Mon', es: 'Lun' }, label: 'Aug 3', emoji: '🚣',
    title: { en: 'Gentle Madrid morning + friends', es: 'Mañana tranquila en Madrid + amigos' },
    corridor: { en: 'In-city', es: 'Ciudad' },
    heat: null, tags: ['kids', 'seniors', 'friends', 'culture'],
    summary: {
      en: 'Cool-morning family classic in El Retiro, early lunch, then ~2h with friends in the afternoon. Evening free.',
      es: 'Clásico familiar por la mañana (más fresco) en El Retiro, comida temprana y ~2h con amigos por la tarde. Noche libre.' },
    stops: [
      { icon: '🚣', kind: { en: 'Morning', es: 'Mañana' }, title: { en: 'El Retiro — rowboat + puppet theatre', es: 'El Retiro — barca + teatro de títeres' }, place: { en: 'Parque del Retiro', es: 'Parque del Retiro' }, drive: '15–20 min',
        desc: { en: 'Rowboat on the lake (kid hit), free summer puppet theatre (Teatro de Títeres, mornings), Palacio de Cristal, ice cream. Flat, shaded, benches for the grandparents.', es: 'Barca en el estanque (triunfo con la peque), teatro de títeres gratis (por las mañanas), Palacio de Cristal, helado. Llano, con sombra y bancos para los abuelos.' },
        tags: ['kids', 'seniors', 'culture'], links: [{ label: { en: 'Map', es: 'Mapa' }, type: 'map', url: maps('Estanque del Retiro Madrid barcas') }] },
      { icon: '👥', kind: { en: 'Afternoon', es: 'Tarde' }, title: { en: 'Friends (~2 hours)', es: 'Amigos (~2 horas)' }, place: { en: 'In/near Madrid', es: 'En/cerca de Madrid' },
        desc: { en: 'Keep it in-city — no long drive. Evening free to rest before the busy week.', es: 'En la ciudad — sin desplazamientos largos. Noche libre para descansar antes de la semana intensa.' }, tags: ['friends'], links: [] },
    ],
  },
  {
    id: 'aug04', dow: { en: 'Tue', es: 'Mar' }, label: 'Aug 4', emoji: '🧊',
    title: { en: 'EAST — EcoSip (SIP) + Alcalá + Eurovillas', es: 'ESTE — EcoSip (SIP) + Alcalá + Eurovillas' },
    corridor: { en: 'East (A-2 / A-3)', es: 'Este (A-2 / A-3)' },
    heat: null, tags: ['showroom', 'town', 'culture', 'kids', 'seniors', 'food', 'booking'],
    summary: {
      en: 'SIP-panel showroom first thing, then UNESCO Alcalá de Henares for lunch, then the grid-style Eurovillas subdivision.',
      es: 'Showroom de paneles SIP a primera hora, luego Alcalá de Henares (Patrimonio) para comer y después la urbanización en cuadrícula de Eurovillas.' },
    stops: [
      { icon: '🧊', kind: { en: 'Showroom · SIP', es: 'Showroom · SIP' }, title: { en: 'EcoSip House', es: 'EcoSip House' }, place: { en: 'Coslada (Av. de Moscú 1)', es: 'Coslada (Av. de Moscú 1)' }, drive: '30–35 min E', time: '09:30',
        desc: { en: 'SIP panels + VIROC façade — the only SIP specialist based in Madrid. ~45 min.', es: 'Paneles SIP + fachada VIROC — el único especialista en SIP con base en Madrid. ~45 min.' },
        tags: ['showroom', 'booking'], booking: { en: 'WhatsApp/call 665 964 071 / 617 008 642 first', es: 'WhatsApp/llama antes al 665 964 071 / 617 008 642' },
        links: [{ label: { en: 'Website', es: 'Web' }, type: 'web', url: 'https://www.ecosiphouse.com/precios-y-servicios/' }, { label: { en: 'Call', es: 'Llamar' }, type: 'phone', url: 'tel:+34665964071' }, { label: { en: 'Map', es: 'Mapa' }, type: 'map', url: maps('EcoSip House Av de Moscu 1 Coslada') }] },
      { icon: '🦢', kind: { en: 'Sight + lunch', es: 'Visita + comida' }, title: { en: 'Alcalá de Henares', es: 'Alcalá de Henares' }, place: { en: '20 min from Coslada', es: 'a 20 min de Coslada' }, drive: '20 min',
        desc: { en: 'Kid: hunt the stork nests on every tower, Cervantes’ birth-house, candied almonds. Grandparents: flat arcaded Calle Mayor, Plaza de Cervantes. UNESCO, shaded. Lunch at Hostería del Estudiante (Parador).', es: 'Peque: buscar los nidos de cigüeña en cada torre, casa natal de Cervantes, garrapiñadas. Abuelos: Calle Mayor porticada y llana, Plaza de Cervantes. Patrimonio, con sombra. Comida en la Hostería del Estudiante (Parador).' },
        tags: ['culture', 'kids', 'seniors', 'food'], links: [{ label: { en: 'Cervantes house', es: 'Casa de Cervantes' }, type: 'web', url: 'https://www.museocasanatalcervantes.org/' }, { label: { en: 'Map', es: 'Mapa' }, type: 'map', url: maps('Plaza de Cervantes Alcala de Henares') }, { label: { en: 'Lunch', es: 'Comida' }, type: 'food', url: maps('Hosteria del Estudiante Alcala de Henares') }] },
      { icon: '📍', kind: { en: 'Town scouting', es: 'Ver pueblo' }, title: { en: 'Nuevo Baztán / Eurovillas', es: 'Nuevo Baztán / Eurovillas' }, place: { en: 'Madrid (A-3 belt)', es: 'Madrid (corredor A-3)' }, drive: '25 min',
        desc: { en: 'Walk the grid-style American subdivision + town centre. Palacio de Goyeneche gardens (kid can run). Arrange a plot viewing in advance.', es: 'Pasear la urbanización americana en cuadrícula + centro del pueblo. Jardines del Palacio de Goyeneche (la peque puede correr). Concierta antes ver una parcela.' },
        tags: ['town', 'booking'], booking: { en: 'Pre-arrange a plot viewing with a local inmobiliaria', es: 'Concierta antes ver una parcela con una inmobiliaria local' },
        links: [{ label: { en: 'Idealista · plots', es: 'Idealista · parcelas' }, type: 'plots', url: 'https://www.idealista.com/venta-terrenos/nuevo-baztan-madrid/' }, { label: { en: 'Town info', es: 'Info pueblo' }, type: 'web', url: 'https://turismo.ayto-nuevobaztan.es/es/servicios-y-actividades/' }, { label: { en: 'Map', es: 'Mapa' }, type: 'map', url: maps('Eurovillas Nuevo Baztan') }] },
    ],
  },
  {
    id: 'aug05', dow: { en: 'Wed', es: 'Mié' }, label: 'Aug 5', emoji: '🧱',
    title: { en: 'NORTH — Acerormigón (concrete/steel) + Galápagos', es: 'NORTE — Acerormigón (hormigón/acero) + Galápagos' },
    corridor: { en: 'North (A-1)', es: 'Norte (A-1)' },
    heat: null, tags: ['showroom', 'town', 'kids', 'food', 'booking', 'seniors'],
    summary: {
      en: 'The biggest steel+concrete house expo in the region, the gated Montelar community with a pumptrack for the kid, then Valdeluz condos on the way home.',
      es: 'La mayor exposición de casas de acero+hormigón de la región, la urbanización cerrada de Montelar con un pumptrack para la peque y luego los pisos de Valdeluz de vuelta.' },
    stops: [
      { icon: '🧱', kind: { en: 'Showroom · concrete/steel', es: 'Showroom · hormigón/acero' }, title: { en: 'Acerormigón', es: 'Acerormigón' }, place: { en: 'S.S. de los Reyes (A-1 km 27)', es: 'S.S. de los Reyes (A-1 km 27)' }, drive: '20–25 min N', time: '09:30',
        desc: { en: 'Biggest steel+concrete house expo in the region — 1- & 2-storey models in one visit, ideal for comparing. ~1h. (Mon–Thu; Fri mornings only.)', es: 'La mayor exposición de casas de acero+hormigón de la región — modelos de 1 y 2 plantas en una visita, ideal para comparar. ~1h. (Lun–Jue; Vie solo mañanas.)' },
        tags: ['showroom', 'booking'], booking: { en: 'Cita previa 682 49 58 46', es: 'Cita previa 682 49 58 46' },
        links: [{ label: { en: 'Website', es: 'Web' }, type: 'web', url: 'https://acerormigon.es/visitanos/' }, { label: { en: 'Call', es: 'Llamar' }, type: 'phone', url: 'tel:+34682495846' }, { label: { en: 'Map', es: 'Mapa' }, type: 'map', url: maps('Acerormigon San Sebastian de los Reyes') }] },
      { icon: '📍', kind: { en: 'Town scouting', es: 'Ver pueblo' }, title: { en: 'Galápagos / Montelar', es: 'Galápagos / Montelar' }, place: { en: 'Guadalajara', es: 'Guadalajara' }, drive: '30–40 min',
        desc: { en: 'Gated American-style community, giant plots, 24h security. Kid: the Pumptrack Park + kids’ climbing wall + parks. Grown-ups: El Casar town centre & market. Lunch in El Casar. Arrange a plot viewing.', es: 'Urbanización americana cerrada, parcelas enormes, seguridad 24h. Peque: Pumptrack Park + rocódromo infantil + parques. Mayores: centro y mercado de El Casar. Comida en El Casar. Concierta ver una parcela.' },
        tags: ['town', 'kids', 'food', 'booking'], booking: { en: 'Pre-arrange a plot viewing', es: 'Concierta antes ver una parcela' },
        links: [{ label: { en: 'Idealista · plots', es: 'Idealista · parcelas' }, type: 'plots', url: 'https://www.idealista.com/venta-terrenos/galapagos-guadalajara/' }, { label: { en: 'Town info', es: 'Info pueblo' }, type: 'web', url: 'https://www.galapagos.es/' }, { label: { en: 'Pumptrack', es: 'Pumptrack' }, type: 'map', url: maps('Pumptrack Park Montelar Galapagos') }, { label: { en: 'Map', es: 'Mapa' }, type: 'map', url: maps('Montelar Galapagos Guadalajara') }] },
      { icon: '🏢', kind: { en: 'Condo scouting', es: 'Ver pisos' }, title: { en: 'Valdeluz', es: 'Valdeluz' }, place: { en: ' Guadalajara', es: ' Guadalajara' }, drive: '15 min toward Madrid',
        desc: { en: 'Controversial high-density PAU — 3-bed condos from ~155k, 90–120 m². A cautionary tale of over-development; worth seeing what bulk affordable housing looks like vs the American-style plots. Idealista shows 68 listings.', es: 'PAU de alta densidad polémico — pisos de 3 dorms desde ~155k, 90–120 m². Un caso de sobre-desarrollo; vale la pena ver cómo es la vivienda económica en bloque frente a las parcelas estilo americano. Idealista muestra 68 anuncios.' },
        tags: ['town'], links: [{ label: { en: 'Idealista · condos', es: 'Idealista · pisos' }, type: 'web', url: 'https://www.idealista.com/geo/venta-viviendas/valdeluz/' }, { label: { en: 'Map', es: 'Mapa' }, type: 'map', url: maps('Valdeluz 19139 Guadalajara Spain') }] },
      { icon: '🛍️', kind: { en: 'Optional', es: 'Opcional' }, title: { en: 'CC Plaza Norte 2', es: 'CC Plaza Norte 2' }, place: { en: 'S.S. de los Reyes', es: 'S.S. de los Reyes' }, drive: '20 min',
        desc: { en: 'AC mall on the way home if anyone wants a cool-down and shops.', es: 'Centro comercial con aire de vuelta a casa si alguien quiere refrescarse y comprar.' }, tags: ['seniors'], links: [{ label: { en: 'Website', es: 'Web' }, type: 'web', url: 'https://www.plazanorte2.com' }, { label: { en: 'Map', es: 'Mapa' }, type: 'map', url: maps('Plaza Norte 2 San Sebastian de los Reyes') }] },
    ],
  },
  {
    id: 'aug06', dow: { en: 'Thu', es: 'Jue' }, label: 'Aug 6', emoji: '🌲',
    title: { en: 'SIERRA compare — Modulartis (concrete) + Canexel (wood)', es: 'SIERRA comparar — Modulartis (hormigón) + Canexel (madera)' },
    corridor: { en: 'NW sierra (A-6)', es: 'Sierra NO (A-6)' },
    heat: 'cooler', tags: ['showroom', 'nature', 'food', 'booking'],
    summary: {
      en: 'Walk a finished concrete home, then feel real wood construction — both in the cooler sierra, with a relaxed lunch.',
      es: 'Recorrer una casa de hormigón acabada y luego tocar construcción de madera real — ambos en la sierra (más fresca), con una comida tranquila.' },
    stops: [
      { icon: '🏠', kind: { en: 'Showroom · concrete', es: 'Showroom · hormigón' }, title: { en: 'Modulartis — piloto house', es: 'Modulartis — casa piloto' }, place: { en: 'Sierra NW (exact spot on booking)', es: 'Sierra NO (ubicación al reservar)' }, drive: '~40 min',
        desc: { en: 'Walk a fully finished concrete modular home — the best "how would we actually live here" visit.', es: 'Recorrer una casa modular de hormigón totalmente acabada — la mejor visita para imaginar cómo se vive de verdad.' },
        tags: ['showroom', 'booking'], booking: { en: 'Form or 910 467 187', es: 'Formulario o 910 467 187' },
        links: [{ label: { en: 'Website', es: 'Web' }, type: 'web', url: 'https://modulartis.com/casa-piloto-modulartis/' }, { label: { en: 'Call', es: 'Llamar' }, type: 'phone', url: 'tel:+34910467187' }, { label: { en: 'Map', es: 'Mapa' }, type: 'map', url: maps('Modulartis Madrid') }] },
      { icon: '🌲', kind: { en: 'Showroom · wood', es: 'Showroom · madera' }, title: { en: 'Canexel — Guadarrama', es: 'Canexel — Guadarrama' }, place: { en: 'Guadarrama (C/ Valle del Alberche 20E)', es: 'Guadarrama (C/ Valle del Alberche 20E)' }, drive: '10 min',
        desc: { en: 'Full-size Canadian/American-style wood houses (300+ built) — on-theme with the American-style towns. Their Madrid base is right here in Guadarrama; call ahead to see a model or a nearby finished house.', es: 'Casas de madera completas estilo canadiense/americano (+300 construidas) — en línea con los pueblos estilo americano. Su base en Madrid está aquí en Guadarrama; llama antes para ver un modelo o una casa terminada cercana.' },
        tags: ['showroom', 'booking'], booking: { en: 'Call 918 513 000 to arrange a model / finished-house visit', es: 'Llama al 918 513 000 para concertar ver un modelo / casa terminada' },
        links: [{ label: { en: 'Website', es: 'Web' }, type: 'web', url: 'https://www.canexel.es/casas-madera-madrid/' }, { label: { en: 'Call', es: 'Llamar' }, type: 'phone', url: 'tel:+34918513000' }, { label: { en: 'Map', es: 'Mapa' }, type: 'map', url: maps('Canexel Guadarrama Valle del Alberche 20') }] },
      { icon: '🍽️', kind: { en: 'Lunch', es: 'Comida' }, title: { en: 'Relaxed sierra lunch', es: 'Comida tranquila de sierra' }, place: { en: 'Guadarrama / Cercedilla', es: 'Guadarrama / Cercedilla' },
        desc: { en: 'Cooler mountain air, casual asador. Grandparents + kid downshift for the afternoon.', es: 'Aire de montaña más fresco, asador informal. Abuelos + peque bajan el ritmo por la tarde.' },
        tags: ['food', 'nature'], links: [{ label: { en: 'Map', es: 'Mapa' }, type: 'map', url: maps('asador Guadarrama Madrid') }] },
    ],
  },
  {
    id: 'aug07', dow: { en: 'Fri', es: 'Vie' }, label: 'Aug 7', emoji: '💦',
    title: { en: 'Rest-ish pool day — El Espinar + La Panera', es: 'Día de piscina/descanso — El Espinar + La Panera' },
    corridor: { en: 'NW sierra (A-6)', es: 'Sierra NO (A-6)' },
    heat: 'cooler', tags: ['town', 'water', 'kids', 'seniors', 'nature', 'rest'],
    summary: {
      en: 'A restful sierra day that still ticks a town: quick look at El Espinar, a natural pool among the pines, and a relaxed sierra lunch.',
      es: 'Un día de sierra relajado que además marca un pueblo: vistazo a El Espinar, piscina natural entre pinos y una comida tranquila de sierra.' },
    stops: [
      { icon: '📍', kind: { en: 'Town (quick)', es: 'Pueblo (rápido)' }, title: { en: 'El Espinar / Los Ángeles de San Rafael', es: 'El Espinar / Los Ángeles de San Rafael' }, place: { en: 'Segovia', es: 'Segovia' }, drive: '45–55 min',
        desc: { en: 'A quick look at the pine-forest American-style town + subdivision on the way to the pool.', es: 'Un vistazo rápido al pueblo estilo americano entre pinares + urbanización de camino a la piscina.' },
        tags: ['town'], links: [{ label: { en: 'Idealista · plots', es: 'Idealista · parcelas' }, type: 'plots', url: 'https://www.idealista.com/venta-terrenos/el-espinar-segovia/' }, { label: { en: 'Town info', es: 'Info pueblo' }, type: 'web', url: 'https://elespinar.es/' }, { label: { en: 'Map', es: 'Mapa' }, type: 'map', url: maps('Los Angeles de San Rafael El Espinar Segovia') }] },

      { icon: '💦', kind: { en: 'Cool-off', es: 'Refrescarse' }, title: { en: 'Área Recreativa La Panera', es: 'Área Recreativa La Panera' }, place: { en: 'El Espinar', es: 'El Espinar' },
        desc: { en: 'Natural pool among pines, picnic tables, BBQ, snack bar, football pitch. Kid swims, grandparents relax in the shade. Restful and cooler.', es: 'Piscina natural entre pinos, mesas de picnic, barbacoas, chiringuito, campo de fútbol. La peque nada, los abuelos descansan a la sombra. Descanso y más fresco.' },
        tags: ['water', 'kids', 'seniors', 'nature', 'rest'], links: [{ label: { en: 'Info', es: 'Info' }, type: 'web', url: 'https://elespinar.es/la-panera/' }, { label: { en: 'Map', es: 'Mapa' }, type: 'map', url: maps('Area Recreativa La Panera El Espinar') }] },
      { icon: '🍽️', kind: { en: 'Lunch', es: 'Comida' }, title: { en: 'Restaurante La Sierra — El Espinar', es: 'Restaurante La Sierra — El Espinar' }, place: { en: 'El Espinar', es: 'El Espinar' },
        desc: { en: 'Family-friendly sierra restaurant — good menú del día with chuletón, kid-friendly options. Relaxed mountain air after the pool.', es: 'Restaurante de sierra apto para familias — buen menú del día con chuletón, opciones para la peque. Aire de montaña relajado después de la piscina.' },
        tags: ['food', 'kids', 'seniors'], links: [{ label: { en: 'La Sierra info', es: 'Info La Sierra' }, type: 'web', url: 'https://rutaculinaria.com/restaurante-en-el-espinar-la-sierra-60985' }, { label: { en: 'Map', es: 'Mapa' }, type: 'map', url: maps('Restaurante La Sierra El Espinar Segovia') }] },
    ],
  },
  {
    id: 'aug08', dow: { en: 'Sat', es: 'Sáb' }, label: 'Aug 8', emoji: '🚤',
    title: { en: 'Family marquee — Aranjuez + friends evening', es: 'Gran día familiar — Aranjuez + amigos por la noche' },
    corridor: { en: 'South (A-4)', es: 'Sur (A-4)' },
    heat: null, tags: ['culture', 'kids', 'seniors', 'water', 'food', 'friends', 'booking'],
    summary: {
      en: 'The best all-ages day: royal palace, shaded gardens, a boat on the Tajo and the little tourist train. Friends in the evening.',
      es: 'El mejor día para todas las edades: palacio real, jardines con sombra, barco por el Tajo y el trenecito turístico. Amigos por la noche.' },
    stops: [
      { icon: '🏰', kind: { en: 'Morning', es: 'Mañana' }, title: { en: 'Aranjuez — Palace + gardens + boat', es: 'Aranjuez — Palacio + jardines + barco' }, place: { en: 'Aranjuez', es: 'Aranjuez' }, drive: '50–60 min', time: '~10:00',
        desc: { en: 'Royal Palace, shaded Jardín de la Isla / del Príncipe, a boat on the Tajo, and the Chiquitrén little tourist train (kid gold; grandparents ride too). Start early for shade + parking.', es: 'Palacio Real, Jardín de la Isla / del Príncipe con sombra, barco por el Tajo y el Chiquitrén (triunfo con la peque; los abuelos también). Empezar pronto por la sombra y el aparcamiento.' },
        tags: ['culture', 'kids', 'seniors', 'water'], links: [{ label: { en: 'Palace tickets', es: 'Entradas Palacio' }, type: 'web', url: 'https://www.patrimonionacional.es/visita/palacio-real-de-aranjuez' }, { label: { en: 'Map', es: 'Mapa' }, type: 'map', url: maps('Palacio Real de Aranjuez') }] },
      { icon: '🍽️', kind: { en: 'Lunch', es: 'Comida' }, title: { en: 'El Rana Verde / Casa José', es: 'El Rana Verde / Casa José' }, place: { en: 'Aranjuez', es: 'Aranjuez' },
        desc: { en: 'El Rana Verde: classic riverside, kid-friendly. Casa José: upscale. Reserve in August.', es: 'El Rana Verde: clásico junto al río, apto para niños. Casa José: alta cocina. Reservar en agosto.' },
        tags: ['food', 'booking'], booking: { en: 'Reserve — Aug is busy', es: 'Reservar — agosto está lleno' }, links: [
          { label: { en: 'Book El Rana Verde', es: 'Reservar El Rana Verde' }, type: 'book', url: 'https://www.elranaverde.com/reservas.php' },
          { label: { en: 'El Rana Verde ☎', es: 'El Rana Verde ☎' }, type: 'phone', url: 'tel:+34918911325' },
          { label: { en: 'Casa José ☎', es: 'Casa José ☎' }, type: 'phone', url: 'tel:+34918911488' },
          { label: { en: 'Map', es: 'Mapa' }, type: 'map', url: maps('El Rana Verde Aranjuez') }] },
      { icon: '👥', kind: { en: 'Evening', es: 'Noche' }, title: { en: 'Friends', es: 'Amigos' }, place: { en: 'In/near Madrid', es: 'En/cerca de Madrid' },
        desc: { en: 'Back late afternoon; evening with friends.', es: 'Vuelta a media tarde; noche con amigos.' }, tags: ['friends'], links: [] },
    ],
  },
  {
    id: 'aug09', dow: { en: 'Sun', es: 'Dom' }, label: 'Aug 9', emoji: '🧱',
    title: { en: 'Ávila (UNESCO walls) + Sotillo de la Adrada', es: 'Ávila (muralla UNESCO) + Sotillo de la Adrada' },
    corridor: { en: 'NW / SW (A-6 / N-403 / A-5)', es: 'NO / SO (A-6 / N-403 / A-5)' },
    heat: 'cooler', tags: ['culture', 'kids', 'seniors', 'food', 'town', 'booking'],
    summary: {
      en: 'Walk atop the Ávila UNESCO medieval walls (kid heaven), then drive south through the Tiétar valley to scout affordable retirement homes in Sotillo de la Adrada.',
      es: 'Pasear por la muralla medieval de Ávila (Patrimonio, paraíso para la peque) y luego bajar al valle del Tiétar a ver casas asequibles para jubilarse en Sotillo de la Adrada.' },
    stops: [
      { icon: '🧱', kind: { en: 'Morning', es: 'Mañana' }, title: { en: 'Ávila — walk the Walls + old town', es: 'Ávila — muralla + casco antiguo' }, place: { en: 'Ávila', es: 'Ávila' }, drive: '~1h15', time: '~10:00',
        desc: { en: 'UNESCO 11th-century walls — you can walk on top (kid gold); grandparents do the flat sections + cathedral. Basílica de San Vicente, Plaza del Mercado Grande. Cool mountain air at 1,131 m. 40% discount pass at the Visitor Centre.', es: 'Muralla del siglo XI (Patrimonio) — se puede caminar por encima (triunfo para la peque); abuelos hacen los tramos llanos + catedral. Basílica de San Vicente, Plaza del Mercado Grande. Aire de montaña a 1.131 m. Bono 40% de descuento en el Centro de Visitantes.' },
        tags: ['culture', 'kids', 'seniors'], links: [{ label: { en: 'Ávila tourism', es: 'Turismo Ávila' }, type: 'web', url: 'https://www.avilaturismo.com/' }, { label: { en: 'Walls info', es: 'Info muralla' }, type: 'web', url: 'https://www.avilaturismo.com/en/what-to-visit/walls-of-avila' }, { label: { en: 'Map', es: 'Mapa' }, type: 'map', url: maps('Muralla de Avila') }] },
      { icon: '🍽️', kind: { en: 'Lunch', es: 'Comida' }, title: { en: 'Ávila — chuletón + yemas', es: 'Ávila — chuletón + yemas' }, place: { en: 'Ávila old town', es: 'Casco de Ávila' },
        desc: { en: 'Famous Ávila chuletón (T-bone) and yemas de Santa Teresa (egg-yolk sweets). Try La Bruja or Mesón del Rastro. Reserve — August Sunday.', es: 'Famoso chuletón de Ávila y yemas de Santa Teresa. Prueba La Bruja o Mesón del Rastro. Reservar — domingo de agosto.' },
        tags: ['food', 'booking'], booking: { en: 'Reserve — busy August Sunday', es: 'Reservar — domingo de agosto con mucha gente' }, links: [
          { label: { en: 'Map · restaurants', es: 'Mapa · restaurantes' }, type: 'food', url: maps('restaurantes casco antiguo Avila chuletón') }, { label: { en: 'Map', es: 'Mapa' }, type: 'map', url: maps('Casco antiguo Ávila restaurantes') }] },
      { icon: '📍', kind: { en: 'Retirement scouting', es: 'Ver pueblo' }, title: { en: 'Sotillo de la Adrada (Valle del Tiétar)', es: 'Sotillo de la Adrada (Valle del Tiétar)' }, place: { en: 'Ávila (N-403 / A-5)', es: 'Ávila (N-403 / A-5)' }, drive: '45 min S',
        desc: { en: 'Valle del Tiétar — 3-bed homes >110 m² from 150–250k, under 300k (54 listings). Pine forests, Gredos views, community pools. ~1h15 back to Madrid via A-5. A real retirement option to compare with the American-style plot towns.', es: 'Valle del Tiétar — casas de 3 dorms >110 m² desde 150–250k, por debajo de 300k (54 anuncios). Pinares, vistas a Gredos, piscinas comunitarias. ~1h15 de vuelta a Madrid por la A-5. Una opción real de jubilación para comparar con los pueblos de parcelas estilo americano.' },
        tags: ['town', 'nature'], links: [{ label: { en: 'Idealista · homes', es: 'Idealista · casas' }, type: 'web', url: 'https://www.idealista.com/venta-viviendas/sotillo-de-la-adrada-avila/' }, { label: { en: 'Inmobiliaria', es: 'Inmobiliaria' }, type: 'web', url: 'https://grupoexcon.com/inmobiliaria/' }, { label: { en: 'Map', es: 'Mapa' }, type: 'map', url: maps('Sotillo de la Adrada Avila') }] },
    ],
  },
  {
    id: 'aug10', dow: { en: 'Mon', es: 'Lun' }, label: 'Aug 10', emoji: '🏘️',
    title: { en: 'SE towns + Chinchón (castles + postcard plaza)', es: 'Pueblos SE + Chinchón (castillos + plaza de postal)' },
    corridor: { en: 'Southeast (A-3)', es: 'Sureste (A-3)' },
    heat: null, tags: ['town', 'culture', 'kids', 'seniors', 'food', 'booking'],
    summary: {
      en: 'The Urtajo subdivision, Chinchón’s medieval plaza for a long lunch, and a castle keep for the little one.',
      es: 'La urbanización de Urtajo, la plaza medieval de Chinchón para una comida larga y una torre del homenaje para la peque.' },
    stops: [
      { icon: '📍', kind: { en: 'Town scouting', es: 'Ver pueblo' }, title: { en: 'Colmenar de Oreja (Urtajo)', es: 'Colmenar de Oreja (Urtajo)' }, place: { en: 'Madrid', es: 'Madrid' }, drive: '~1h',
        desc: { en: 'The "Urtajo" American-style subdivision + historic Plaza Mayor porticada (BIC) + market. Arrange a plot viewing.', es: 'La urbanización americana "Urtajo" + Plaza Mayor porticada histórica (BIC) + mercado. Concierta ver una parcela.' },
        tags: ['town', 'culture', 'booking'], booking: { en: 'Pre-arrange a plot viewing', es: 'Concierta antes ver una parcela' },
        links: [{ label: { en: 'Idealista · plots', es: 'Idealista · parcelas' }, type: 'plots', url: 'https://www.idealista.com/venta-terrenos/colmenar-de-oreja-madrid/' }, { label: { en: 'Tourism', es: 'Turismo' }, type: 'web', url: 'http://turismo.aytocdo.com/' }, { label: { en: 'Map', es: 'Mapa' }, type: 'map', url: maps('Plaza Mayor Colmenar de Oreja') }] },
      { icon: '🍽️', kind: { en: 'Lunch', es: 'Comida' }, title: { en: 'Chinchón — medieval Plaza Mayor', es: 'Chinchón — Plaza Mayor medieval' }, place: { en: 'Chinchón', es: 'Chinchón' }, drive: '10–15 min',
        desc: { en: 'Famous medieval square; long lunch of cochinillo/cordero at Mesón Cuevas del Vino, La Casa del Pregonero, Café de la Iberia or the Parador. Reserve.', es: 'Famosa plaza medieval; comida larga de cochinillo/cordero en Mesón Cuevas del Vino, La Casa del Pregonero, Café de la Iberia o el Parador. Reservar.' },
        tags: ['food', 'culture', 'kids', 'seniors', 'booking'], booking: { en: 'Reserve', es: 'Reservar' },
        links: [
          { label: { en: 'Cuevas del Vino ☎', es: 'Cuevas del Vino ☎' }, type: 'phone', url: 'tel:+34918940206' },
          { label: { en: 'La Casa del Pregonero ☎', es: 'La Casa del Pregonero ☎' }, type: 'phone', url: 'tel:+34918940696' },
          { label: { en: 'Parador ☎', es: 'Parador ☎' }, type: 'phone', url: 'tel:+34918940836' },
          { label: { en: 'Map', es: 'Mapa' }, type: 'map', url: maps('Plaza Mayor Chinchon') }] },
      { icon: '🏰', kind: { en: 'Optional', es: 'Opcional' }, title: { en: 'Villarejo de Salvanés — castle keep', es: 'Villarejo de Salvanés — torre del homenaje' }, place: { en: 'Madrid', es: 'Madrid' }, drive: '20–25 min',
        desc: { en: 'Castle keep tower (kid: castle; weekend theatrical tours for children) + old town + subdivision. Skip if everyone’s done.', es: 'Torre del homenaje (peque: castillo; visitas teatralizadas infantiles los findes) + casco + urbanización. Sáltatelo si estáis cansados.' },
        tags: ['town', 'kids', 'culture'], links: [{ label: { en: 'Idealista · plots', es: 'Idealista · parcelas' }, type: 'plots', url: 'https://www.idealista.com/venta-terrenos/villarejo-de-salvanes-madrid/' }, { label: { en: 'Tourism', es: 'Turismo' }, type: 'web', url: 'https://www.turismovillarejodesalvanes.com/index.php' }, { label: { en: 'Map', es: 'Mapa' }, type: 'map', url: maps('Castillo Villarejo de Salvanes') }] },
    ],
  },
  {
    id: 'aug11', dow: { en: 'Tue', es: 'Mar' }, label: 'Aug 11', emoji: '😴',
    title: { en: 'Rest day (or easy Faunia)', es: 'Día de descanso (o Faunia tranquilo)' },
    corridor: { en: 'Home / SE', es: 'Casa / SE' },
    heat: null, tags: ['rest', 'kids', 'seniors', 'water'],
    summary: {
      en: 'A true downshift for the heat — or an easy animal-park day if the little one has energy.',
      es: 'Un descanso de verdad por el calor — o un día fácil de parque de animales si la peque tiene energía.' },
    stops: [
      { icon: '😴', kind: { en: 'Rest', es: 'Descanso' }, title: { en: 'Downshift', es: 'Bajar el ritmo' }, place: { en: 'Home / neighbourhood', es: 'Casa / barrio' },
        desc: { en: 'Pool, home, short shaded stroll. Recover mid-trip.', es: 'Piscina, casa, paseo corto a la sombra. Recuperar fuerzas a mitad de viaje.' }, tags: ['rest'], links: [] },
      { icon: '🐧', kind: { en: 'Optional fun-but-easy', es: 'Opcional divertido y fácil' }, title: { en: 'Faunia bioparque', es: 'Faunia bioparque' }, place: { en: 'SE Madrid', es: 'SE de Madrid' }, drive: '25–30 min',
        desc: { en: 'Hourly tropical storm, penguins, water-play "estacas del aguador", partly indoor/AC. Kid highlight; grandparents stroll & sit. Great hot-day fallback.', es: 'Tormenta tropical cada hora, pingüinos, juegos de agua "estacas del aguador", parte cubierta/con aire. Triunfo con la peque; abuelos pasean y se sientan. Gran plan para día de calor.' },
        tags: ['kids', 'seniors', 'water', 'nature'], links: [{ label: { en: 'Website', es: 'Web' }, type: 'web', url: 'https://www.faunia.es/' }, { label: { en: 'Map', es: 'Mapa' }, type: 'map', url: maps('Faunia Madrid') }] },
    ],
  },
  {
    id: 'aug12', dow: { en: 'Wed', es: 'Mié' }, label: 'Aug 12', emoji: '📍',
    title: { en: 'Duruelo + El Guijar (overnight)', es: 'Duruelo + El Guijar (noche allí)' },
    corridor: { en: 'North (A-1) · NE Segovia', es: 'Norte (A-1) · NE de Segovia' },
    heat: 'cooler', tags: ['town', 'culture', 'seniors', 'kids', 'food', 'rest', 'booking'],
    summary: {
      en: 'Two tiny NE-Segovia villages to show the family, then a relaxed overnight in El Guijar before the Segovia day tomorrow.',
      es: 'Dos pueblitos del NE de Segovia para enseñar a la familia y luego noche tranquila en El Guijar antes del día de Segovia de mañana.' },
    stops: [
      { icon: '⛪', kind: { en: 'Villages + lunch', es: 'Pueblos + comida' }, title: { en: 'Duruelo + El Guijar / Valdevacas', es: 'Duruelo + El Guijar / Valdevacas' }, place: { en: 'NE Segovia', es: 'NE de Segovia' }, drive: '~90 min',
        desc: { en: 'Show the family these two tiny villages — Duruelo: Iglesia de la Natividad (Renaissance frescoes). El Guijar/Valdevacas: Iglesia de la Virgen del Rosario; oak & juniper scenery. Have a relaxed lunch in a local mesón. Bring kid entertainment for the drive.', es: 'Enseñad a la familia estos dos pueblitos — Duruelo: Iglesia de la Natividad (frescos renacentistas). El Guijar/Valdevacas: Iglesia de la Virgen del Rosario; paisaje de encinas y sabinas. Comida tranquila en un mesón local. Llevad entretenimiento para la peque en el coche.' },
        tags: ['town', 'culture', 'food'], links: [{ label: { en: 'Duruelo map', es: 'Mapa Duruelo' }, type: 'map', url: maps('Duruelo Segovia') }, { label: { en: 'El Guijar map', es: 'Mapa El Guijar' }, type: 'map', url: maps('El Guijar Segovia') }] },
      { icon: '🏠', kind: { en: 'Overnight', es: 'Noche' }, title: { en: 'Stay overnight in El Guijar', es: 'Noche en El Guijar' }, place: { en: 'El Guijar / Valdevacas', es: 'El Guijar / Valdevacas' },
        desc: { en: 'Sleep in a rural house (casa rural) in El Guijar — tiny village, dark skies, total quiet. Book early; few options in a hamlet this small. Tomorrow is a short drive to Segovia.', es: 'Dormir en una casa rural en El Guijar — pueblito, cielos oscuros, silencio total. Reservad pronto; pocas opciones en una aldea tan pequeña. Mañana es un trayecto corto a Segovia.' },
        tags: ['rest', 'booking'], booking: { en: 'Book a casa rural early — very limited stock', es: 'Reservad una casa rural pronto — muy pocas opciones' },
        links: [{ label: { en: 'EscapadaRural · El Guijar', es: 'EscapadaRural · El Guijar' }, type: 'web', url: 'https://www.escapadarural.com/buscar?q=El+Guijar+Segovia' }, { label: { en: 'Valdevacas map', es: 'Mapa Valdevacas' }, type: 'map', url: maps('Valdevacas de Montejo Segovia') }] },
    ],
  },
  {
    id: 'aug13', dow: { en: 'Thu', es: 'Jue' }, label: 'Aug 13', emoji: '🏰',
    title: { en: 'Segovia (from El Guijar) + Villacastín', es: 'Segovia (desde El Guijar) + Villacastín' },
    corridor: { en: 'NW (A-6 / AP-61)', es: 'NO (A-6 / AP-61)' },
    heat: 'cooler', tags: ['culture', 'kids', 'seniors', 'food', 'town', 'booking', 'showroom'],
    summary: {
      en: 'Short drive from the overnight to Segovia — Alcázar, aqueduct, cochinillo lunch — then tick Villacastín on the drive home. Optional showroom overflow in the evening.',
      es: 'Trayecto corto desde la noche allí a Segovia — Alcázar, acueducto, cochinillo — y de vuelta marcamos Villacastín. Showroom opcional por la tarde.' },
    stops: [
      { icon: '🏰', kind: { en: 'Morning', es: 'Mañana' }, title: { en: 'Segovia — Alcázar + Aqueduct', es: 'Segovia — Alcázar + Acueducto' }, place: { en: 'Segovia', es: 'Segovia' }, drive: '~50 min from El Guijar',
        desc: { en: 'Alcázar (the castle that inspired Disney — kid heaven; grandparents: flat courtyard, tower optional), Roman Aqueduct, Plaza Mayor, cathedral. Mostly flat old town.', es: 'Alcázar (el castillo que inspiró a Disney — paraíso para la peque; abuelos: patio llano, torre opcional), Acueducto romano, Plaza Mayor, catedral. Casco casi todo llano.' },
        tags: ['culture', 'kids', 'seniors'], links: [{ label: { en: 'Alcázar', es: 'Alcázar' }, type: 'web', url: 'https://www.alcazardesegovia.com/' }, { label: { en: 'Map', es: 'Mapa' }, type: 'map', url: maps('Alcazar de Segovia') }] },
      { icon: '🍽️', kind: { en: 'Lunch · cochinillo', es: 'Comida · cochinillo' }, title: { en: 'Cándido / José María / Casa Duque', es: 'Cándido / José María / Casa Duque' }, place: { en: 'Segovia', es: 'Segovia' },
        desc: { en: 'Roast suckling pig under the aqueduct. Reserve — busy August day.', es: 'Cochinillo asado junto al acueducto. Reservar — día de agosto con mucha gente.' },
        tags: ['food', 'booking'], booking: { en: 'Reserve — busy August day', es: 'Reservar — día de agosto con mucha gente' }, links: [
          { label: { en: 'Book Cándido', es: 'Reservar Cándido' }, type: 'book', url: 'https://mesondecandido.es/en/reservations/' },
          { label: { en: 'Cándido ☎', es: 'Cándido ☎' }, type: 'phone', url: 'tel:+34921425911' },
          { label: { en: 'Book José María', es: 'Reservar José María' }, type: 'book', url: 'https://www.restaurantejosemaria.com/en/bookings/' },
          { label: { en: 'Casa Duque ☎', es: 'Casa Duque ☎' }, type: 'phone', url: 'tel:+34921462487' },
          { label: { en: 'Map', es: 'Mapa' }, type: 'map', url: maps('Meson Cándido Segovia Acueducto') }] },
      { icon: '📍', kind: { en: 'On the way home', es: 'De vuelta a casa' }, title: { en: 'Villacastín (drive-through)', es: 'Villacastín (de paso)' }, place: { en: 'Segovia (A-6)', es: 'Segovia (A-6)' }, drive: '+15 min',
        desc: { en: 'Crossroads American-style town — ticks another town with no real detour.', es: 'Pueblo estilo americano en el cruce de caminos — marca otro pueblo sin apenas desvío.' },
        tags: ['town'], links: [{ label: { en: 'Idealista · plots', es: 'Idealista · parcelas' }, type: 'plots', url: 'https://www.idealista.com/venta-terrenos/villacastin-segovia/' }, { label: { en: 'Map', es: 'Mapa' }, type: 'map', url: maps('Villacastin Segovia') }] },
      { icon: '📦', kind: { en: 'Optional showroom', es: 'Showroom opcional' }, title: { en: 'Casaredia (modular / mobil)', es: 'Casaredia (modular / mobil)' }, place: { en: 'Getafe', es: 'Getafe' }, drive: '30–40 min',
        desc: { en: 'The type you de-prioritised — visit only if still curious about modular/mobil. Appointment needed.', es: 'El tipo que dejasteis en segundo plano — visitad solo si aún os pica la curiosidad por modular/mobil. Con cita.' },
        tags: ['showroom', 'booking'], booking: { en: 'Appointment (web form)', es: 'Cita (formulario web)' }, links: [{ label: { en: 'Website', es: 'Web' }, type: 'web', url: 'https://casaredia.com/madrid/' }, { label: { en: 'Map', es: 'Mapa' }, type: 'map', url: maps('Casaredia Getafe Estrategia 15') }] },
    ],
  },
  {
    id: 'aug14', dow: { en: 'Fri', es: 'Vie' }, label: 'Aug 14', emoji: '🛫',
    title: { en: 'Departure', es: 'Vuelta' },
    corridor: { en: 'Home / airport', es: 'Casa / aeropuerto' },
    heat: null, tags: ['rest'],
    summary: { en: 'Buffer for packing, car return and the airport. Nothing scheduled.', es: 'Margen para hacer maletas, devolver el coche y el aeropuerto. Sin planes.' },
    stops: [
      { icon: '🧳', kind: { en: 'Wrap up', es: 'Cierre' }, title: { en: 'Pack + car + airport', es: 'Maletas + coche + aeropuerto' }, place: { en: 'Home → airport', es: 'Casa → aeropuerto' },
        desc: { en: 'Easy morning, no plans.', es: 'Mañana tranquila, sin planes.' }, tags: ['rest'], links: [] },
    ],
  },
]

export const showrooms = [
  { type: { en: 'SIP', es: 'SIP' }, name: 'EcoSip House', where: { en: 'Coslada (Av. de Moscú 1)', es: 'Coslada (Av. de Moscú 1)' }, book: '665 964 071 / 617 008 642', day: 'Aug 4', star: true, url: 'https://www.ecosiphouse.com/precios-y-servicios/' },
  { type: { en: 'Concrete / steel', es: 'Hormigón / acero' }, name: 'Acerormigón', where: { en: 'S.S. de los Reyes (A-1 km 27)', es: 'S.S. de los Reyes (A-1 km 27)' }, book: '682 49 58 46 · Mon–Thu, Fri AM', day: 'Aug 5', star: true, url: 'https://acerormigon.es/visitanos/' },
  { type: { en: 'Concrete (finished house)', es: 'Hormigón (casa acabada)' }, name: 'Modulartis piloto', where: { en: 'Sierra NW (on booking)', es: 'Sierra NO (al reservar)' }, book: '910 467 187', day: 'Aug 6', star: true, url: 'https://modulartis.com/casa-piloto-modulartis/' },
  { type: { en: 'Wood (full-size)', es: 'Madera (tamaño real)' }, name: 'Canexel', where: { en: 'Guadarrama (C/ Valle del Alberche 20E)', es: 'Guadarrama (C/ Valle del Alberche 20E)' }, book: '918 513 000 · American/Canadian style', day: 'Aug 6', star: true, url: 'https://www.canexel.es/casas-madera-madrid/' },
  { type: { en: 'Modular / mobil (optional)', es: 'Modular / mobil (opcional)' }, name: 'Casaredia', where: { en: 'Getafe (C. Estrategia 15)', es: 'Getafe (C. Estrategia 15)' }, book: 'web form', day: 'Aug 13', star: false, url: 'https://casaredia.com/madrid/' },
  { type: { en: 'Concrete (optional, in-city)', es: 'Hormigón (opcional, en ciudad)' }, name: 'Atlántida Homes', where: { en: 'Retiro (C/ Pez Austral 2)', es: 'Retiro (C/ Pez Austral 2)' }, book: '914 09 71 80', day: '—', star: false, url: 'https://atlantidahomes.com/casas-prefabricadas-madrid/' },
]

export const woodNote = {
  en: 'Gardenhouse24 and Tocar Madera were both dropped — cabins/tiny-homes only, too small. The one real full-size wood option is Canexel (Guadarrama, right on the Aug 6 route) — they build Canadian/American-style family houses; call 918 513 000 to see a model or a nearby finished build.',
  es: 'Gardenhouse24 y Tocar Madera descartados — solo cabañas/tiny-homes, demasiado pequeñas. La única opción real de madera a tamaño real es Canexel (Guadarrama, justo en la ruta del 6 ago) — construyen casas familiares estilo canadiense/americano; llama al 918 513 000 para ver un modelo o una obra terminada cercana.',
}

export const townsRef = [
  { name: 'Nuevo Baztán (Eurovillas)', region: { en: 'Madrid', es: 'Madrid' }, kid: { en: 'Palacio gardens to run in', es: 'Jardines del Palacio para correr' }, day: 'Aug 4', idealista: 'https://www.idealista.com/venta-terrenos/nuevo-baztan-madrid/' },
  { name: 'Galápagos (Montelar)', region: { en: 'Guadalajara', es: 'Guadalajara' }, kid: { en: 'Pumptrack + climbing wall + parks', es: 'Pumptrack + rocódromo + parques' }, day: 'Aug 5', idealista: 'https://www.idealista.com/venta-terrenos/galapagos-guadalajara/' },
  { name: 'Valdeluz', region: { en: 'Guadalajara', es: 'Guadalajara' }, kid: { en: 'Condo scouting — 3-bed from ~155k', es: 'Ver pisos — 3 dorms desde ~155k' }, day: 'Aug 5', idealista: 'https://www.idealista.com/geo/venta-viviendas/valdeluz/' },
  { name: 'El Espinar (Los Ángeles de San Rafael)', region: { en: 'Segovia', es: 'Segovia' }, kid: { en: 'La Panera natural pool', es: 'Piscina natural La Panera' }, day: 'Aug 7', idealista: 'https://www.idealista.com/venta-terrenos/el-espinar-segovia/' },
  { name: 'Sotillo de la Adrada (Valle del Tiétar)', region: { en: 'Ávila', es: 'Ávila' }, kid: { en: 'Gredos views, community pools', es: 'Vistas a Gredos, piscinas comunitarias' }, day: 'Aug 9', idealista: 'https://www.idealista.com/venta-viviendas/sotillo-de-la-adrada-avila/' },
  { name: 'Colmenar de Oreja (Urtajo)', region: { en: 'Madrid', es: 'Madrid' }, kid: { en: 'Plaza + market', es: 'Plaza + mercado' }, day: 'Aug 10', idealista: 'https://www.idealista.com/venta-terrenos/colmenar-de-oreja-madrid/' },
  { name: 'Villarejo de Salvanés', region: { en: 'Madrid', es: 'Madrid' }, kid: { en: 'Castle keep + kids’ theatrical tours', es: 'Torre del homenaje + visitas teatralizadas' }, day: 'Aug 10', idealista: 'https://www.idealista.com/venta-terrenos/villarejo-de-salvanes-madrid/' },
  { name: 'Villacastín', region: { en: 'Segovia', es: 'Segovia' }, kid: { en: 'Drive-through on the way home', es: 'De paso de vuelta' }, day: 'Aug 13', idealista: 'https://www.idealista.com/venta-terrenos/villacastin-segovia/' },
  { name: 'Duruelo + El Guijar / Valdevacas', region: { en: 'Segovia', es: 'Segovia' }, kid: { en: 'Oak & juniper scenery, village churches', es: 'Encinas y sabinas, iglesias de pueblo' }, day: 'Aug 12', idealista: 'https://www.idealista.com/venta-terrenos/sepulveda-segovia/' },
]

export const bookingChecklist = [
  { id: 'b1', text: { en: 'Confirm showroom appointments before the Aug 10–18 shutdown — EcoSip (Aug 4), Acerormigón (Aug 5), Modulartis + Canexel (Aug 6)', es: 'Confirmar citas de showroom antes del cierre del 10–18 ago — EcoSip (4 ago), Acerormigón (5 ago), Modulartis + Canexel (6 ago)' },
    links: [
      { label: { en: 'EcoSip ☎', es: 'EcoSip ☎' }, type: 'phone', url: 'tel:+34665964071' },
      { label: { en: 'Acerormigón ☎', es: 'Acerormigón ☎' }, type: 'phone', url: 'tel:+34682495846' },
      { label: { en: 'Modulartis ☎', es: 'Modulartis ☎' }, type: 'phone', url: 'tel:+34910467187' },
      { label: { en: 'Canexel ☎', es: 'Canexel ☎' }, type: 'phone', url: 'tel:+34918513000' },
    ] },
  { id: 'b2', text: { en: 'Arrange plot viewings with local agents — Eurovillas, Galápagos, Colmenar', es: 'Concertar visitas de parcelas con agentes locales — Eurovillas, Galápagos, Colmenar' },
    links: [
      { label: { en: 'Plots · Eurovillas', es: 'Parcelas · Eurovillas' }, type: 'web', url: 'https://www.idealista.com/venta-terrenos/nuevo-baztan-madrid/' },
      { label: { en: 'Plots · Galápagos', es: 'Parcelas · Galápagos' }, type: 'web', url: 'https://www.idealista.com/venta-terrenos/galapagos-guadalajara/' },
      { label: { en: 'Plots · Colmenar', es: 'Parcelas · Colmenar' }, type: 'web', url: 'https://www.idealista.com/venta-terrenos/colmenar-de-oreja-madrid/' },
    ] },
  { id: 'b3', text: { en: 'Reserve Aranjuez lunch — Aug 8', es: 'Reservar comida en Aranjuez — 8 ago' },
    links: [
      { label: { en: 'Book El Rana Verde', es: 'Reservar El Rana Verde' }, type: 'book', url: 'https://www.elranaverde.com/reservas.php' },
      { label: { en: 'El Rana Verde ☎', es: 'El Rana Verde ☎' }, type: 'phone', url: 'tel:+34918911325' },
      { label: { en: 'Casa José ☎', es: 'Casa José ☎' }, type: 'phone', url: 'tel:+34918911488' },
    ] },
  { id: 'b4', text: { en: 'Reserve Segovia cochinillo — Aug 13', es: 'Reservar cochinillo en Segovia — 13 ago' },
    links: [
      { label: { en: 'Book Cándido', es: 'Reservar Cándido' }, type: 'book', url: 'https://mesondecandido.es/en/reservations/' },
      { label: { en: 'Cándido ☎', es: 'Cándido ☎' }, type: 'phone', url: 'tel:+34921425911' },
      { label: { en: 'Book José María', es: 'Reservar José María' }, type: 'book', url: 'https://www.restaurantejosemaria.com/en/bookings/' },
      { label: { en: 'José María ✉', es: 'José María ✉' }, type: 'email', url: 'mailto:reservas@restaurantejosemaria.com' },
      { label: { en: 'Casa Duque ☎', es: 'Casa Duque ☎' }, type: 'phone', url: 'tel:+34921462487' },
    ] },
  { id: 'b5', text: { en: 'Reserve Chinchón lunch — Aug 10', es: 'Reservar comida en Chinchón — 10 ago' },
    links: [
      { label: { en: 'Cuevas del Vino ☎', es: 'Cuevas del Vino ☎' }, type: 'phone', url: 'tel:+34918940206' },
      { label: { en: 'La Casa del Pregonero ☎', es: 'La Casa del Pregonero ☎' }, type: 'phone', url: 'tel:+34918940696' },
      { label: { en: 'Parador ☎', es: 'Parador ☎' }, type: 'phone', url: 'tel:+34918940836' },
      { label: { en: 'Parador ✉', es: 'Parador ✉' }, type: 'email', url: 'mailto:chinchon@parador.es' },
    ] },
  { id: 'b6', text: { en: 'Book a casa rural in El Guijar — Aug 12 overnight (very limited stock)', es: 'Reservar casa rural en El Guijar — noche del 12 ago (muy pocas opciones)' },
    links: [
      { label: { en: 'EscapadaRural · El Guijar', es: 'EscapadaRural · El Guijar' }, type: 'web', url: 'https://www.escapadarural.com/buscar?q=El+Guijar+Segovia' },
    ] },
  { id: 'b7', text: { en: 'Buy Aranjuez Palace + Segovia Alcázar tickets online', es: 'Comprar entradas Palacio de Aranjuez + Alcázar de Segovia online' },
    links: [
      { label: { en: 'Aranjuez Palace', es: 'Palacio Aranjuez' }, type: 'book', url: 'https://www.patrimonionacional.es/visita/palacio-real-de-aranjuez' },
      { label: { en: 'Segovia Alcázar', es: 'Alcázar Segovia' }, type: 'book', url: 'https://www.alcazardesegovia.com/informacion/entradas/' },
    ] },
  { id: 'b8', text: { en: 'Pack swimsuits (La Panera, Aug 7) + kid car entertainment (Aug 12)', es: 'Preparar bañadores (La Panera, 7 ago) + entretenimiento coche peque (12 ago)' } },
]
