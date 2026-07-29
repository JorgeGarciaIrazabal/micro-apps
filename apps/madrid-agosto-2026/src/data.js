// Madrid family trip — 1–14 August 2026
// Bilingual (EN/ES). Translatable strings are { en, es }; plain strings (names, times, phones) stay as-is.

const maps = (q) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`

export const trip = {
  title: 'Madrid · Agosto 2026',
  subtitle: {
    en: 'Family trip agenda — prefab showrooms, American-style towns & easy sights for a 5-year-old and grandparents (70+)',
    es: 'Agenda del viaje — showrooms de casas prefabricadas, pueblos estilo americano y planes fáciles para una niña de 5 años y los abuelos (70+)',
  },
  dateRange: '1 – 14 August 2026',
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
  showroomsSummary: { en: '🏭 Showrooms — real houses you can enter', es: '🏭 Showrooms — casas reales que se pueden recorrer' },
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
    en: 'August showroom check (28 Jul): Acerormigón is officially closed Aug 3–17, so it is excluded. Casaredia’s live calendar currently offers Aug 10 slots; Modulartis and Canexel remain appointment-only and must confirm Aug 6 in writing. Recheck every booking 2–3 days ahead.',
    es: 'Comprobación de showrooms (28 jul): Acerormigón cierra oficialmente del 3 al 17 de agosto, por eso queda fuera. El calendario de Casaredia ofrece ahora citas el 10 de agosto; Modulartis y Canexel siguen siendo solo con cita y deben confirmar por escrito el 6 de agosto. Reconfirma todo 2–3 días antes.' } },
  { icon: '🏗️', text: {
    en: 'Plot viewings are not walk-in. Call a local inmobiliaria in each town a few days ahead to see parcels / meet an agent.',
    es: 'Ver parcelas no es sin cita. Llama a una inmobiliaria local de cada pueblo unos días antes para ver parcelas / hablar con un agente.' } },
  { icon: '🚫', text: {
    en: 'Tren de la Fresa to Aranjuez does NOT run in August (Mar–Jun only) — we drive.',
    es: 'El Tren de la Fresa a Aranjuez NO circula en agosto (solo mar–jun) — vamos en coche.' } },
]

export const days = [
  {
    id: 'aug01', dow: { en: 'Sat', es: 'Sáb' }, label: 'Aug 1', emoji: '🛬',
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
    id: 'aug02', dow: { en: 'Sun', es: 'Dom' }, label: 'Aug 2', emoji: '🏘️',
    title: { en: 'SE towns + Chinchón (castles + postcard plaza)', es: 'Pueblos SE + Chinchón (castillos + plaza de postal)' },
    corridor: { en: 'Southeast (A-3)', es: 'Sureste (A-3)' },
    heat: null, tags: ['town', 'culture', 'kids', 'seniors', 'food', 'booking'],
    summary: {
      en: 'The Urtajo subdivision, Chinchón’s medieval plaza for a long Sunday lunch, and a castle keep for the little one.',
      es: 'La urbanización de Urtajo, la plaza medieval de Chinchón para una comida larga de domingo y una torre del homenaje para la peque.' },
    stops: [
      { icon: '📍', kind: { en: 'Subdivision scouting', es: 'Ver urbanización' }, title: { en: 'Urtajo', es: 'Urtajo' }, place: { en: 'Colmenar de Oreja municipality · beside Villaconejos', es: 'Término de Colmenar de Oreja · junto a Villaconejos' }, drive: '~1h',
        desc: { en: 'Focus the house search on Urtajo itself: drive its residential streets, compare the large detached-house plots, and check road access, shade, upkeep and proximity to everyday services in Villaconejos. After the viewings, stop at Colmenar de Oreja’s beautiful arcaded Plaza Mayor.', es: 'Centrar la búsqueda de casas en el propio Urtajo: recorrer sus calles residenciales, comparar las grandes parcelas con chalet y comprobar accesos, sombra, mantenimiento y cercanía a los servicios diarios de Villaconejos. Después de las visitas, parar en la bonita Plaza Mayor porticada de Colmenar de Oreja.' },
        tags: ['town', 'culture', 'booking'], booking: { en: 'Pre-arrange house viewings in Urtajo', es: 'Concierta antes visitas a casas en Urtajo' },
        links: [{ label: { en: 'Urtajo map', es: 'Mapa Urtajo' }, type: 'map', url: maps('Urbanizacion Urtajo Colmenar de Oreja') }, { label: { en: 'Idealista · Urtajo homes', es: 'Idealista · casas en Urtajo' }, type: 'plots', url: 'https://www.idealista.com/geo/venta-viviendas/urtajo/' }, { label: { en: '🏠 €253.9k · 183m² · 3bed · 2bath', es: '🏠 253,9k€ · 183m² · 3 dorm · 2 baños' }, type: 'web', url: 'https://www.idealista.com/inmueble/112107698/' }, { label: { en: '🏠 €250k · 152m² · 3bed · 2bath', es: '🏠 250k€ · 152m² · 3 dorm · 2 baños' }, type: 'web', url: 'https://www.idealista.com/inmueble/111929823/' }, { label: { en: 'Urtajo · Sports courts', es: 'Urtajo · Área Deportiva (Pistas)' }, type: 'map', url: maps('Área Deportiva Pistas Urtajo Colmenar de Oreja') }, { label: { en: 'Colmenar · Plaza Mayor', es: 'Colmenar · Plaza Mayor' }, type: 'map', url: maps('Plaza Mayor Colmenar de Oreja') }] },
      { icon: '🍽️', kind: { en: 'Lunch', es: 'Comida' }, title: { en: 'Chinchón — medieval Plaza Mayor', es: 'Chinchón — Plaza Mayor medieval' }, place: { en: 'Chinchón', es: 'Chinchón' }, drive: '10–15 min',
        desc: { en: 'Famous medieval square; long Sunday lunch of cochinillo/cordero at Mesón Cuevas del Vino, La Casa del Pregonero, Café de la Iberia or the Parador. Reserve.', es: 'Famosa plaza medieval; comida larga de domingo de cochinillo/cordero en Mesón Cuevas del Vino, La Casa del Pregonero, Café de la Iberia o el Parador. Reservar.' },
        tags: ['food', 'culture', 'kids', 'seniors', 'booking'], booking: { en: 'Reserve — busy August Sunday', es: 'Reservar — domingo de agosto con mucha gente' },
        links: [
          { label: { en: 'Cuevas del Vino ☎', es: 'Cuevas del Vino ☎' }, type: 'phone', url: 'tel:+34918940206' },
          { label: { en: 'La Casa del Pregonero ☎', es: 'La Casa del Pregonero ☎' }, type: 'phone', url: 'tel:+34918940696' },
          { label: { en: 'Parador ☎', es: 'Parador ☎' }, type: 'phone', url: 'tel:+34918940836' },
          { label: { en: 'Map', es: 'Mapa' }, type: 'map', url: maps('Plaza Mayor Chinchon') }] },
      { icon: '🏰', kind: { en: 'Optional', es: 'Opcional' }, title: { en: 'Villarejo de Salvanés — castle keep', es: 'Villarejo de Salvanés — torre del homenaje' }, place: { en: 'Madrid', es: 'Madrid' }, drive: '20–25 min',
        desc: { en: 'Castle keep tower (kid: castle; weekend theatrical tours for children) + old town + subdivision. Skip if everyone’s done.', es: 'Torre del homenaje (peque: castillo; visitas teatralizadas infantiles los findes) + casco + urbanización. Sáltatelo si estáis cansados.' },
        tags: ['town', 'kids', 'culture'], links: [{ label: { en: 'Idealista · plots', es: 'Idealista · parcelas' }, type: 'plots', url: 'https://www.idealista.com/venta-terrenos/villarejo-de-salvanes-madrid/' }, { label: { en: '🏠 €237k · 199m² · 4bed · 2bath', es: '🏠 237k€ · 199m² · 4 dorm · 2 baños' }, type: 'web', url: 'https://www.idealista.com/inmueble/111315701/' }, { label: { en: '🏠 €245k · 208m² · 3bed · 2bath', es: '🏠 245k€ · 208m² · 3 dorm · 2 baños' }, type: 'web', url: 'https://www.idealista.com/inmueble/109911730/' }, { label: { en: 'Castle + Tercios Museum', es: 'Castillo + Museo de los Tercios' }, type: 'web', url: 'https://turismovillarejodesalvanes.com/puntos-de-interes-turistico/la-torre-del-homenaje/' }, { label: { en: 'Castle map', es: 'Mapa del castillo' }, type: 'map', url: maps('Castillo Villarejo de Salvanes') }] },
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
      { icon: '👥', kind: { en: 'Evening · 18:00', es: 'Tarde · 18:00' }, title: { en: 'Ismael & family', es: 'Ismael y familia' }, place: { en: 'Tres Cantos (their home)', es: 'Tres Cantos (su casa)' }, time: '18:00',
        desc: { en: "Meet Ismael and family at 6 pm. Address: C. Letonia 1, 28760 Tres Cantos, Madrid (Portal 1, Ático).", es: "Ver a Ismael y su familia a las 18:00. Dirección: C. Letonia 1, 28760 Tres Cantos, Madrid (Portal 1, Ático)." },
        tags: ['friends'], links: [{ label: { en: 'Map', es: 'Mapa' }, type: 'map', url: maps('Calle Letonia 1 28760 Tres Cantos Madrid') }] },
    ],
  },
  {
    id: 'aug04', dow: { en: 'Tue', es: 'Mar' }, label: 'Aug 4', emoji: '🌍',
    title: { en: 'EAST — Parque Europa + Alcalá + Eurovillas', es: 'ESTE — Parque Europa + Alcalá + Eurovillas' },
    corridor: { en: 'East (A-2 / A-3)', es: 'Este (A-2 / A-3)' },
    heat: null, tags: ['town', 'culture', 'kids', 'seniors', 'food', 'booking'],
    summary: {
      en: 'A playful mini-tour of Europe before the heat, then UNESCO Alcalá de Henares for lunch and the grid-style Eurovillas subdivision.',
      es: 'Una mini-vuelta por Europa antes del calor, luego Alcalá de Henares (Patrimonio) para comer y después la urbanización en cuadrícula de Eurovillas.' },
    stops: [
      { icon: '🌍', kind: { en: 'Family morning', es: 'Mañana en familia' }, title: { en: 'Parque Europa', es: 'Parque Europa' }, place: { en: 'Torrejón de Ardoz', es: 'Torrejón de Ardoz' }, drive: '25–30 min E', time: '09:00',
        desc: { en: 'Free mini-Europe walk with 18 monument replicas and a real Berlin Wall fragment. Make it a landmark hunt for the kid; flat paths and benches keep it easy for the grandparents. Optional paid boats and children’s activities may open later. Go at opening and leave before the heat.', es: 'Paseo gratuito por una mini-Europa con 18 réplicas de monumentos y un fragmento real del Muro de Berlín. Para la peque, búsqueda de monumentos; caminos llanos y bancos para los abuelos. Las barcas y actividades infantiles opcionales son de pago y pueden abrir más tarde. Ir al abrir y salir antes del calor.' },
        tags: ['kids', 'seniors', 'culture'],
        links: [{ label: { en: 'Official site', es: 'Web oficial' }, type: 'web', url: 'https://parqueeuropa.ayto-torrejon.es/parque' }, { label: { en: 'Hours', es: 'Horarios' }, type: 'web', url: 'https://parqueeuropa.ayto-torrejon.es/horario-parque-europa' }, { label: { en: 'Activities', es: 'Actividades' }, type: 'web', url: 'https://parqueeuropa.ayto-torrejon.es/node/1396' }, { label: { en: 'Activity map · PDF', es: 'Mapa de actividades · PDF' }, type: 'web', url: 'https://multiaventurapark.com/doc/Mapa_actividades_Parque_Europa_Multiaventurapark.pdf' }, { label: { en: 'Map', es: 'Mapa' }, type: 'map', url: maps('Parque Europa Torrejon de Ardoz') }] },
      { icon: '🦢', kind: { en: 'Sight + lunch', es: 'Visita + comida' }, title: { en: 'Alcalá de Henares', es: 'Alcalá de Henares' }, place: { en: '15–20 min from Torrejón', es: 'a 15–20 min de Torrejón' }, drive: '15–20 min',
        desc: { en: 'Kid: hunt the stork nests on every tower, Cervantes’ birth-house, candied almonds. Grandparents: flat arcaded Calle Mayor, Plaza de Cervantes. UNESCO, shaded. Lunch at Hostería del Estudiante (Parador).', es: 'Peque: buscar los nidos de cigüeña en cada torre, casa natal de Cervantes, garrapiñadas. Abuelos: Calle Mayor porticada y llana, Plaza de Cervantes. Patrimonio, con sombra. Comida en la Hostería del Estudiante (Parador).' },
        tags: ['culture', 'kids', 'seniors', 'food'], links: [{ label: { en: 'Cervantes house', es: 'Casa de Cervantes' }, type: 'web', url: 'https://www.museocasanatalcervantes.org/' }, { label: { en: 'Map', es: 'Mapa' }, type: 'map', url: maps('Plaza de Cervantes Alcala de Henares') }, { label: { en: 'Lunch', es: 'Comida' }, type: 'food', url: maps('Hosteria del Estudiante Alcala de Henares') }] },
      { icon: '📍', kind: { en: 'Town scouting', es: 'Ver pueblo' }, title: { en: 'Nuevo Baztán / Eurovillas', es: 'Nuevo Baztán / Eurovillas' }, place: { en: 'Madrid (A-3 belt)', es: 'Madrid (corredor A-3)' }, drive: '25 min',
        desc: { en: 'Walk the grid-style American subdivision + town centre. Palacio de Goyeneche gardens (kid can run). Arrange a plot viewing in advance.', es: 'Pasear la urbanización americana en cuadrícula + centro del pueblo. Jardines del Palacio de Goyeneche (la peque puede correr). Concierta antes ver una parcela.' },
        tags: ['town', 'booking'], booking: { en: 'Pre-arrange a plot viewing with a local inmobiliaria', es: 'Concierta antes ver una parcela con una inmobiliaria local' },
        links: [{ label: { en: 'Idealista · plots', es: 'Idealista · parcelas' }, type: 'plots', url: 'https://www.idealista.com/venta-terrenos/nuevo-baztan-madrid/' }, { label: { en: '🏠 €296k · 150m² · 4bed · 3bath', es: '🏠 296k€ · 150m² · 4 dorm · 3 baños' }, type: 'web', url: 'https://www.idealista.com/inmueble/107680369/' }, { label: { en: '🏠 €290k · 119m² · 4bed · 2bath', es: '🏠 290k€ · 119m² · 4 dorm · 2 baños' }, type: 'web', url: 'https://www.idealista.com/inmueble/111528542/' }, { label: { en: 'Palace + historic square', es: 'Palacio + plaza histórica' }, type: 'web', url: 'https://turismo.ayto-nuevobaztan.es/que-visitar/conjunto-historico/' }, { label: { en: 'Eurovillas map', es: 'Mapa Eurovillas' }, type: 'map', url: maps('Eurovillas Nuevo Baztan') }] },
    ],
  },
  {
    id: 'aug05', dow: { en: 'Wed', es: 'Mié' }, label: 'Aug 5', emoji: '🧱',
    title: { en: 'NORTH — Galápagos / Montelar + Valdeluz', es: 'NORTE — Galápagos / Montelar + Valdeluz' },
    corridor: { en: 'North (A-1)', es: 'Norte (A-1)' },
    heat: null, tags: ['town', 'kids', 'food', 'booking', 'seniors'],
    summary: {
      en: 'The gated Montelar community with a pumptrack for the kid, then Valdeluz condos on the way home.',
      es: 'La urbanización cerrada de Montelar con un pumptrack para la peque y luego los pisos de Valdeluz de vuelta.' },
    stops: [
      { icon: '📍', kind: { en: 'Town scouting', es: 'Ver pueblo' }, title: { en: 'Galápagos / Montelar', es: 'Galápagos / Montelar' }, place: { en: 'Guadalajara', es: 'Guadalajara' }, drive: '30–40 min',
        desc: { en: 'Gated American-style community, giant plots, 24h security. Kid: the Pumptrack Park + kids’ climbing wall + parks. Grown-ups: El Casar town centre & market. Lunch in El Casar. Arrange a plot viewing.', es: 'Urbanización americana cerrada, parcelas enormes, seguridad 24h. Peque: Pumptrack Park + rocódromo infantil + parques. Mayores: centro y mercado de El Casar. Comida en El Casar. Concierta ver una parcela.' },
        tags: ['town', 'kids', 'food', 'booking'], booking: { en: 'Pre-arrange a plot viewing', es: 'Concierta antes ver una parcela' },
        links: [{ label: { en: 'Idealista · plots', es: 'Idealista · parcelas' }, type: 'plots', url: 'https://www.idealista.com/venta-terrenos/galapagos-guadalajara/' }, { label: { en: '🏠 €291.5k · 162m² · 4bed · 3bath', es: '🏠 291,5k€ · 162m² · 4 dorm · 3 baños' }, type: 'web', url: 'https://www.idealista.com/inmueble/111969117/' }, { label: { en: 'Town info', es: 'Info pueblo' }, type: 'web', url: 'https://www.galapagos.es/' }, { label: { en: 'Pumptrack', es: 'Pumptrack' }, type: 'map', url: maps('Pumptrack Park Montelar Galapagos') }, { label: { en: 'Map', es: 'Mapa' }, type: 'map', url: maps('Montelar Galapagos Guadalajara') }] },
      { icon: '🏢', kind: { en: 'Condo scouting', es: 'Ver pisos' }, title: { en: 'Valdeluz', es: 'Valdeluz' }, place: { en: ' Guadalajara', es: ' Guadalajara' }, drive: '15 min toward Madrid',
        desc: { en: 'Condo shortlist: under €300k, over 110 m², 3–4 bedrooms and at least 2 bathrooms. Compare the private developments and their terraces, storage, parking and shared amenities.', es: 'Selección de pisos: menos de 300.000 €, más de 110 m², 3–4 dormitorios y al menos 2 baños. Compara las urbanizaciones privadas, terrazas, trasteros, garajes y zonas comunes.' },
        tags: ['town'], links: [{ label: { en: 'Idealista · condos', es: 'Idealista · pisos' }, type: 'web', url: 'https://www.idealista.com/geo/venta-viviendas/valdeluz/' }, { label: { en: '🏢 €239.9k · 165m² · 3bed · 2bath', es: '🏢 239,9k€ · 165m² · 3 dorm · 2 baños' }, type: 'web', url: 'https://www.idealista.com/inmueble/111845875/' }, { label: { en: 'Lake viewpoint', es: 'Mirador del Lago' }, type: 'map', url: maps('Mirador del Lago Valdeluz Yebes Guadalajara') }, { label: { en: 'Sports centre', es: 'Centro deportivo' }, type: 'map', url: maps('Centro Deportivo Municipal Valdeluz Yebes') }] },
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
      { icon: '🌲', kind: { en: 'Pilot house · wood', es: 'Casa piloto · madera' }, title: { en: 'Canexel — 450 m² pilot chalet', es: 'Canexel — chalet piloto de 450 m²' }, place: { en: 'Guadarrama (C/ Valle del Alberche 20E)', es: 'Guadarrama (C/ Valle del Alberche 20E)' }, drive: '10 min',
        desc: { en: 'This is a genuine full-size visit: Canexel’s Madrid headquarters occupies its 450 m² Canadian/American-style pilot chalet. Walk the two floors and basement, inspect the timber construction and finishes, and ask about a current nearby build. It is appointment-only.', es: 'Esta sí es una visita a tamaño completo: la sede madrileña de Canexel ocupa su chalet piloto de 450 m² estilo canadiense/americano. Recorre sus dos plantas y sótano, examina la construcción de madera y los acabados y pregunta por una obra cercana en curso. Solo con cita.' },
        tags: ['showroom', 'booking'], booking: { en: 'Call 918 513 000 · request written confirmation for Aug 6', es: 'Llama al 918 513 000 · pide confirmación escrita para el 6 ago' },
        links: [{ label: { en: 'Pilot chalet details', es: 'Detalles chalet piloto' }, type: 'web', url: 'https://www.canexel.es/blog/canexel-instala-placas-solares-en-su-chalet-piloto/' }, { label: { en: 'Madrid office', es: 'Sede Madrid' }, type: 'web', url: 'https://www.canexel.es/arquitectura/' }, { label: { en: 'Call', es: 'Llamar' }, type: 'phone', url: 'tel:+34918513000' }, { label: { en: 'Map', es: 'Mapa' }, type: 'map', url: maps('Canexel Guadarrama Valle del Alberche 20') }] },
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
        tags: ['town'], links: [{ label: { en: 'Idealista · plots', es: 'Idealista · parcelas' }, type: 'plots', url: 'https://www.idealista.com/venta-terrenos/el-espinar-segovia/' }, { label: { en: '🏠 €299k · 134m² · 3bed · 2bath', es: '🏠 299k€ · 134m² · 3 dorm · 2 baños' }, type: 'web', url: 'https://www.idealista.com/inmueble/111789376/' }, { label: { en: '🏠 €280k · 128m² · 3bed · 2bath (new)', es: '🏠 280k€ · 128m² · 3 dorm · 2 baños (obra nueva)' }, type: 'web', url: 'https://www.idealista.com/inmueble/111643332/' }, { label: { en: 'Town info', es: 'Info pueblo' }, type: 'web', url: 'https://elespinar.es/' }, { label: { en: 'Map', es: 'Mapa' }, type: 'map', url: maps('Los Angeles de San Rafael El Espinar Segovia') }] },

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
      { icon: '👥', kind: { en: 'Evening · 17:00', es: 'Noche · 17:00' }, title: { en: 'BBQ with friends', es: 'BBQ con amigos' }, place: { en: "Torrejón de la Calzada (friend's house)", es: "Torrejón de la Calzada (casa de amigos)" }, drive: '~45 min S', time: '17:00',
        desc: { en: "BBQ with friends at 5 pm in Torrejón de la Calzada.", es: "BBQ con amigos a las 17:00 en Torrejón de la Calzada." },
        tags: ['friends', 'food'], links: [{ label: { en: 'Map', es: 'Mapa' }, type: 'map', url: maps('Torrejón de la Calzada Madrid') }] },
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
        tags: ['town', 'nature'], links: [{ label: { en: 'Idealista · homes', es: 'Idealista · casas' }, type: 'web', url: 'https://www.idealista.com/venta-viviendas/sotillo-de-la-adrada-avila/' }, { label: { en: '🏠 €289k · 228m² · 3bed · 3bath', es: '🏠 289k€ · 228m² · 3 dorm · 3 baños' }, type: 'web', url: 'https://www.idealista.com/inmueble/112004243/' }, { label: { en: '🏠 €183k · 150m² · 3bed · 2bath', es: '🏠 183k€ · 150m² · 3 dorm · 2 baños' }, type: 'web', url: 'https://www.idealista.com/inmueble/105287574/' }, { label: { en: 'Inmobiliaria', es: 'Inmobiliaria' }, type: 'web', url: 'https://grupoexcon.com/inmobiliaria/' }, { label: { en: 'Plaza de la Concordia', es: 'Plaza de la Concordia' }, type: 'map', url: maps('Plaza de la Concordia Sotillo de la Adrada') }] },
    ],
  },
  {
    id: 'aug10', dow: { en: 'Mon', es: 'Lun' }, label: 'Aug 10', emoji: '🏭',
    title: { en: 'BIG SHOW — Casaredia + restful afternoon', es: 'GRAN EXPOSICIÓN — Casaredia + tarde tranquila' },
    corridor: { en: 'South Madrid / Getafe', es: 'Sur de Madrid / Getafe' },
    heat: null, tags: ['showroom', 'booking', 'rest', 'kids', 'seniors', 'water'],
    summary: {
      en: 'The trip’s large multi-house exhibition: walk several modular and mobile homes in Getafe in the morning, then keep the afternoon light.',
      es: 'La gran exposición con varias casas del viaje: recorrer por la mañana distintas casas modulares y mobile homes en Getafe y dejar la tarde ligera.' },
    stops: [
      { icon: '🏭', kind: { en: 'Priority showroom · 10:00', es: 'Showroom prioritario · 10:00' }, title: { en: 'Casaredia — 12,000 m² multi-house exhibition', es: 'Casaredia — exposición de 12.000 m² con varias casas' }, place: { en: 'Getafe (C. Estrategia 15)', es: 'Getafe (C. Estrategia 15)' }, drive: '25–35 min', time: '10:00',
        desc: { en: 'The best big-show option open during the trip: walk through several new and used homes, not just samples. Ask to compare the full-size Universal Grand Luxe 120 (120 m², 3 bedrooms, 2 bathrooms) with the other modular and mobile models. The live calendar currently shows Aug 10 appointments; reserve a full guided visit and phone-confirm.', es: 'La mejor gran exposición abierta durante el viaje: entrar en varias casas nuevas y de ocasión, no solo ver muestras. Pide comparar la Universal Grand Luxe 120 a tamaño real (120 m², 3 dormitorios, 2 baños) con los demás modelos modulares y móviles. El calendario en directo ofrece ahora citas el 10 de agosto; reserva una visita guiada completa y confirma por teléfono.' },
        tags: ['showroom', 'booking'], booking: { en: 'Book Aug 10 online · Madrid: 638 939 450', es: 'Reservar online el 10 ago · Madrid: 638 939 450' },
        links: [{ label: { en: 'Book appointment', es: 'Reservar cita' }, type: 'book', url: 'https://casaredia.com/cita-online/' }, { label: { en: 'Exhibition + models', es: 'Exposición + modelos' }, type: 'web', url: 'https://casaredia.com/madrid/' }, { label: { en: 'Independent walkthrough', es: 'Visita independiente' }, type: 'web', url: 'https://cadenaser.com/nacional/2025/10/29/casas-prefabricadas-es-una-alternativa-real-a-la-crisis-de-la-vivienda-cadena-ser/' }, { label: { en: 'Call', es: 'Llamar' }, type: 'phone', url: 'tel:+34638939450' }, { label: { en: 'Map', es: 'Mapa' }, type: 'map', url: maps('Casaredia Getafe Calle Estrategia 15') }] },
      { icon: '😴', kind: { en: 'Rest', es: 'Descanso' }, title: { en: 'Downshift', es: 'Bajar el ritmo' }, place: { en: 'Home / neighbourhood', es: 'Casa / barrio' },
        desc: { en: 'Home, lunch and a short shaded stroll. Recover mid-trip before the Segovia overnight.', es: 'Casa, comida y paseo corto a la sombra. Recuperar a mitad de viaje antes de la noche en Segovia.' }, tags: ['rest'], links: [] },
      { icon: '🐧', kind: { en: 'Optional fun-but-easy', es: 'Opcional divertido y fácil' }, title: { en: 'Faunia bioparque', es: 'Faunia bioparque' }, place: { en: 'SE Madrid', es: 'SE de Madrid' }, drive: '25–30 min',
        desc: { en: 'Hourly tropical storm, penguins, water-play "estacas del aguador", partly indoor/AC. Kid highlight; grandparents stroll & sit. Great hot-day fallback.', es: 'Tormenta tropical cada hora, pingüinos, juegos de agua "estacas del aguador", parte cubierta/con aire. Triunfo con la peque; abuelos pasean y se sientan. Gran plan para día de calor.' },
        tags: ['kids', 'seniors', 'water', 'nature'], links: [{ label: { en: 'Website', es: 'Web' }, type: 'web', url: 'https://www.faunia.es/' }, { label: { en: 'Map', es: 'Mapa' }, type: 'map', url: maps('Faunia Madrid') }] },
    ],
  },
  {
    id: 'aug11', dow: { en: 'Tue', es: 'Mar' }, label: 'Aug 11', emoji: '👥',
    title: { en: 'Visit friends — Carlos & Lidia', es: 'Visita a amigos — Carlos y Lidia' },
    corridor: { en: 'Home / flexible', es: 'Casa / flexible' },
    heat: null, tags: ['friends', 'rest', 'kids', 'seniors', 'food'],
    summary: {
      en: 'A day between trips to see Carlos and Lidia — relaxed, kid- and grandparent-friendly.',
      es: 'Un día entre excursiones para ver a Carlos y Lidia — tranquilo, apto para la peque y los abuelos.' },
    stops: [
      { icon: '👥', kind: { en: 'Morning / day', es: 'Mañana / día' }, title: { en: 'Carlos & Lidia', es: 'Carlos y Lidia' }, place: { en: 'Their place / flexible', es: 'Su casa / flexible' },
        desc: { en: 'Catch up with Carlos and Lidia — a relaxed mid-trip day with no long drive.', es: 'Poneos al día con Carlos y Lidia — un día tranquilo a mitad de viaje sin desplazamientos largos.' }, tags: ['friends'], links: [] },
      { icon: '😴', kind: { en: 'Optional rest', es: 'Descanso opcional' }, title: { en: 'Downshift', es: 'Bajar el ritmo' }, place: { en: 'Home / neighbourhood', es: 'Casa / barrio' },
        desc: { en: 'Pool, home, short shaded stroll if energy is low — recover mid-trip.', es: 'Piscina, casa, paseo corto a la sombra si falta energía — recuperar a mitad de viaje.' }, tags: ['rest'], links: [] },
    ],
  },
  {
    id: 'aug12', dow: { en: 'Wed', es: 'Mié' }, label: 'Aug 12', emoji: '🎂',
    title: { en: 'Duruelo + El Guijar — family & grandma’s birthday', es: 'Duruelo + El Guijar — familia y cumpleaños de la abuela' },
    corridor: { en: 'North (A-1) · NE Segovia', es: 'Norte (A-1) · NE de Segovia' },
    heat: 'cooler', tags: ['town', 'culture', 'seniors', 'kids', 'food', 'rest', 'friends'],
    summary: {
      en: 'Family day: stay at your uncle’s in Duruelo, visit the family house in El Guijar, and celebrate grandma’s birthday. Overnight before the Segovia day tomorrow.',
      es: 'Día familiar: noche en casa de tu tío en Duruelo, visita a la casa familiar en El Guijar y celebración del cumpleaños de la abuela. Noche allí antes del día de Segovia de mañana.' },
    stops: [
      { icon: '🎂', kind: { en: 'Arrive · family day', es: 'Llegada · día en familia' }, title: { en: 'Duruelo — uncle’s house + grandma’s birthday', es: 'Duruelo — casa del tío + cumpleaños de la abuela' }, place: { en: 'Duruelo, NE Segovia', es: 'Duruelo, NE de Segovia' }, drive: '~90 min',
        desc: { en: 'Arrive at your uncle’s in Duruelo — walk the village (Iglesia de la Natividad, oak & juniper scenery), relaxed family lunch, and celebrate grandma’s birthday with cake, photos and a village stroll.', es: 'Llegada a casa de tu tío en Duruelo — pasear el pueblo (Iglesia de la Natividad, paisaje de encinas y sabinas), comida tranquila en familia y celebración del cumpleaños de la abuela con tarta, fotos y paseo por el pueblo.' },
        tags: ['town', 'culture', 'food', 'friends', 'kids', 'seniors'], links: [{ label: { en: 'Duruelo map', es: 'Mapa Duruelo' }, type: 'map', url: maps('Duruelo Segovia') }] },
      { icon: '🏠', kind: { en: 'Afternoon visit', es: 'Visita tarde' }, title: { en: 'El Guijar — family house', es: 'El Guijar — casa familiar' }, place: { en: 'El Guijar / Valdevacas', es: 'El Guijar / Valdevacas' }, drive: 'short',
        desc: { en: 'Visit the family house in El Guijar — oak & juniper scenery, village stroll. Bring kid entertainment for the drive.', es: 'Visitar la casa familiar en El Guijar — paisaje de encinas y sabinas, paseo por el pueblo. Llevad entretenimiento para la peque en el coche.' },
        tags: ['town', 'culture'], links: [{ label: { en: 'El Guijar map', es: 'Mapa El Guijar' }, type: 'map', url: maps('El Guijar Segovia') }] },
      { icon: '🏠', kind: { en: 'Overnight', es: 'Noche' }, title: { en: 'Overnight at the family house (El Guijar)', es: 'Noche en la casa familiar (El Guijar)' }, place: { en: 'El Guijar / Valdevacas', es: 'El Guijar / Valdevacas' },
        desc: { en: 'Sleep at the family house in El Guijar — tomorrow is a short drive to Segovia.', es: 'Dormir en la casa familiar en El Guijar — mañana es un trayecto corto a Segovia.' },
        tags: ['rest'], links: [{ label: { en: 'El Guijar map', es: 'Mapa El Guijar' }, type: 'map', url: maps('El Guijar Segovia') }] },
    ],
  },
  {
    id: 'aug13', dow: { en: 'Thu', es: 'Jue' }, label: 'Aug 13', emoji: '🏰',
    title: { en: 'Segovia (from El Guijar) + Villacastín', es: 'Segovia (desde El Guijar) + Villacastín' },
    corridor: { en: 'NW (A-6 / AP-61)', es: 'NO (A-6 / AP-61)' },
    heat: 'cooler', tags: ['culture', 'kids', 'seniors', 'food', 'town', 'booking'],
    summary: {
      en: 'Short drive from the overnight to Segovia — Alcázar, aqueduct, cochinillo lunch — then tick Villacastín on the drive home.',
      es: 'Trayecto corto desde la noche allí a Segovia — Alcázar, acueducto, cochinillo — y de vuelta marcamos Villacastín.' },
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
        tags: ['town'], links: [{ label: { en: 'Idealista · plots', es: 'Idealista · parcelas' }, type: 'plots', url: 'https://www.idealista.com/venta-terrenos/villacastin-segovia/' }, { label: { en: '🏠 €257.5k · 235m² · 4bed · 2bath (Maello)', es: '🏠 257,5k€ · 235m² · 4 dorm · 2 baños (Maello)' }, type: 'web', url: 'https://www.idealista.com/inmueble/111717462/' }, { label: { en: '🏠 €195k · 160m² · 4bed · 2bath (Zarzuela)', es: '🏠 195k€ · 160m² · 4 dorm · 2 baños (Zarzuela)' }, type: 'web', url: 'https://www.idealista.com/inmueble/110877957/' }, { label: { en: 'Sierra Cathedral', es: 'Catedral de la Sierra' }, type: 'web', url: 'https://www.turismocastillayleon.com/es/patrimonio-cultura/iglesias-ermitas/iglesia-san-esteban-san-sebastian' }, { label: { en: 'Town map', es: 'Mapa del pueblo' }, type: 'map', url: maps('Villacastin Segovia') }] },
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
  { type: { en: 'Concrete (finished house)', es: 'Hormigón (casa acabada)' }, name: 'Modulartis piloto', where: { en: 'Sierra NW (on booking)', es: 'Sierra NO (al reservar)' }, book: '910 467 187', day: 'Aug 6', star: true, url: 'https://modulartis.com/casa-piloto-modulartis/' },
  { type: { en: 'Wood (450 m² pilot chalet)', es: 'Madera (chalet piloto de 450 m²)' }, name: 'Canexel', where: { en: 'Guadarrama (C/ Valle del Alberche 20E)', es: 'Guadarrama (C/ Valle del Alberche 20E)' }, book: '918 513 000 · written confirmation', day: 'Aug 6', star: true, url: 'https://www.canexel.es/blog/canexel-instala-placas-solares-en-su-chalet-piloto/' },
  { type: { en: '12,000 m² · multiple walk-through homes', es: '12.000 m² · varias casas visitables' }, name: 'Casaredia', where: { en: 'Getafe (C. Estrategia 15)', es: 'Getafe (C. Estrategia 15)' }, book: '638 939 450 · live calendar', day: 'Aug 10', star: true, url: 'https://casaredia.com/cita-online/' },
  { type: { en: 'Concrete (optional, in-city)', es: 'Hormigón (opcional, en ciudad)' }, name: 'Atlántida Homes', where: { en: 'Retiro (C/ Pez Austral 2)', es: 'Retiro (C/ Pez Austral 2)' }, book: '914 09 71 80', day: '—', star: false, url: 'https://atlantidahomes.com/casas-prefabricadas-madrid/' },
]

export const woodNote = {
  en: 'Gardenhouse24 and Tocar Madera were both dropped — cabins/tiny-homes only, too small. Canexel is the real full-size wood option: its Guadarrama headquarters is itself a 450 m² pilot chalet in Canadian/American style. The visit is not walk-in; get written confirmation for Aug 6.',
  es: 'Gardenhouse24 y Tocar Madera descartados — solo cabañas/tiny-homes, demasiado pequeñas. Canexel es la opción real de madera a tamaño completo: su sede de Guadarrama es un chalet piloto de 450 m² estilo canadiense/americano. No se visita sin cita; consigue confirmación por escrito para el 6 de agosto.',
}

export const townsRef = [
  { name: 'Nuevo Baztán (Eurovillas)', region: { en: 'Madrid', es: 'Madrid' }, kid: { en: 'Palacio gardens to run in', es: 'Jardines del Palacio para correr' }, day: 'Aug 4', idealista: 'https://www.idealista.com/venta-terrenos/nuevo-baztan-madrid/', interest: { icon: '🏛️', label: { en: 'Palace + square', es: 'Palacio + plaza' }, url: 'https://turismo.ayto-nuevobaztan.es/que-visitar/conjunto-historico/' } },
  { name: 'Galápagos (Montelar)', region: { en: 'Guadalajara', es: 'Guadalajara' }, kid: { en: 'Pumptrack + climbing wall + parks', es: 'Pumptrack + rocódromo + parques' }, day: 'Aug 5', idealista: 'https://www.idealista.com/venta-terrenos/galapagos-guadalajara/', interest: { icon: '🚲', label: { en: 'Pumptrack', es: 'Pumptrack' }, url: maps('Pumptrack Park Montelar Galapagos Guadalajara') } },
  { name: 'Valdeluz', region: { en: 'Guadalajara', es: 'Guadalajara' }, kid: { en: 'Condo scouting — 3-bed from ~155k', es: 'Ver pisos — 3 dorms desde ~155k' }, day: 'Aug 5', idealista: 'https://www.idealista.com/geo/venta-viviendas/valdeluz/', interest: { icon: '🌅', label: { en: 'Lake viewpoint', es: 'Mirador del Lago' }, url: maps('Mirador del Lago Valdeluz Yebes Guadalajara') } },
  { name: 'El Espinar (Los Ángeles de San Rafael)', region: { en: 'Segovia', es: 'Segovia' }, kid: { en: 'La Panera natural pool', es: 'Piscina natural La Panera' }, day: 'Aug 7', idealista: 'https://www.idealista.com/venta-terrenos/el-espinar-segovia/', interest: { icon: '💦', label: { en: 'La Panera', es: 'La Panera' }, url: 'https://elespinar.es/la-panera/' } },
  { name: 'Sotillo de la Adrada (Valle del Tiétar)', region: { en: 'Ávila', es: 'Ávila' }, kid: { en: 'Gredos views, community pools', es: 'Vistas a Gredos, piscinas comunitarias' }, day: 'Aug 9', idealista: 'https://www.idealista.com/venta-viviendas/sotillo-de-la-adrada-avila/', interest: { icon: '☕', label: { en: 'Main square', es: 'Plaza principal' }, url: maps('Plaza de la Concordia Sotillo de la Adrada') } },
  { name: 'Urtajo (Colmenar de Oreja)', region: { en: 'Madrid', es: 'Madrid' }, kid: { en: 'Urtajo houses + Colmenar Plaza Mayor', es: 'Casas en Urtajo + Plaza Mayor de Colmenar' }, day: 'Aug 2', idealista: 'https://www.idealista.com/geo/venta-viviendas/urtajo/', interest: { icon: '🏛️', label: { en: 'Colmenar plaza', es: 'Plaza de Colmenar' }, url: maps('Plaza Mayor Colmenar de Oreja') } },
  { name: 'Villarejo de Salvanés', region: { en: 'Madrid', es: 'Madrid' }, kid: { en: 'Castle keep + kids’ theatrical tours', es: 'Torre del homenaje + visitas teatralizadas' }, day: 'Aug 2', idealista: 'https://www.idealista.com/venta-terrenos/villarejo-de-salvanes-madrid/', interest: { icon: '🏰', label: { en: 'Castle keep', es: 'Torre del homenaje' }, url: 'https://turismovillarejodesalvanes.com/puntos-de-interes-turistico/la-torre-del-homenaje/' } },
  { name: 'Villacastín', region: { en: 'Segovia', es: 'Segovia' }, kid: { en: 'Drive-through on the way home', es: 'De paso de vuelta' }, day: 'Aug 13', idealista: 'https://www.idealista.com/venta-terrenos/villacastin-segovia/', interest: { icon: '⛪', label: { en: 'Sierra Cathedral', es: 'Catedral de la Sierra' }, url: 'https://www.turismocastillayleon.com/es/patrimonio-cultura/iglesias-ermitas/iglesia-san-esteban-san-sebastian' } },
  { name: 'Duruelo + El Guijar / Valdevacas', region: { en: 'Segovia', es: 'Segovia' }, kid: { en: "Uncle's village + family house — grandma's birthday", es: "Pueblo del tío + casa familiar — cumple de la abuela" }, day: 'Aug 12', idealista: 'https://www.idealista.com/venta-terrenos/sepulveda-segovia/', interest: { icon: '⛪', label: { en: 'Duruelo church', es: 'Iglesia de Duruelo' }, url: 'https://turismosierrasegovia.es/iglesia-de-la-natividad/' } },
]

export const bookingChecklist = [
  { id: 'b1', text: { en: 'Book all three real-house visits: Modulartis + Canexel on Aug 6, then Casaredia’s multi-house exhibition on Aug 10', es: 'Reservar las tres visitas a casas reales: Modulartis + Canexel el 6 ago y la exposición de varias casas de Casaredia el 10 ago' },
    links: [
      { label: { en: 'Modulartis ☎', es: 'Modulartis ☎' }, type: 'phone', url: 'tel:+34910467187' },
      { label: { en: 'Canexel ☎', es: 'Canexel ☎' }, type: 'phone', url: 'tel:+34918513000' },
      { label: { en: 'Book Casaredia', es: 'Reservar Casaredia' }, type: 'book', url: 'https://casaredia.com/cita-online/' },
      { label: { en: 'Casaredia ☎', es: 'Casaredia ☎' }, type: 'phone', url: 'tel:+34638939450' },
    ] },
  { id: 'b2', text: { en: 'Arrange property viewings with local agents — Eurovillas, Galápagos and Urtajo', es: 'Concertar visitas de propiedades con agentes locales — Eurovillas, Galápagos y Urtajo' },
    links: [
      { label: { en: 'Plots · Eurovillas', es: 'Parcelas · Eurovillas' }, type: 'web', url: 'https://www.idealista.com/venta-terrenos/nuevo-baztan-madrid/' },
      { label: { en: 'Plots · Galápagos', es: 'Parcelas · Galápagos' }, type: 'web', url: 'https://www.idealista.com/venta-terrenos/galapagos-guadalajara/' },
      { label: { en: 'Homes · Urtajo', es: 'Casas · Urtajo' }, type: 'web', url: 'https://www.idealista.com/geo/venta-viviendas/urtajo/' },
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
  { id: 'b5', text: { en: 'Reserve Chinchón lunch — Aug 2', es: 'Reservar comida en Chinchón — 2 ago' },
    links: [
      { label: { en: 'Cuevas del Vino ☎', es: 'Cuevas del Vino ☎' }, type: 'phone', url: 'tel:+34918940206' },
      { label: { en: 'La Casa del Pregonero ☎', es: 'La Casa del Pregonero ☎' }, type: 'phone', url: 'tel:+34918940696' },
      { label: { en: 'Parador ☎', es: 'Parador ☎' }, type: 'phone', url: 'tel:+34918940836' },
      { label: { en: 'Parador ✉', es: 'Parador ✉' }, type: 'email', url: 'mailto:chinchon@parador.es' },
    ] },
  { id: 'b7', text: { en: 'Buy Aranjuez Palace + Segovia Alcázar tickets online', es: 'Comprar entradas Palacio de Aranjuez + Alcázar de Segovia online' },
    links: [
      { label: { en: 'Aranjuez Palace', es: 'Palacio Aranjuez' }, type: 'book', url: 'https://www.patrimonionacional.es/visita/palacio-real-de-aranjuez' },
      { label: { en: 'Segovia Alcázar', es: 'Alcázar Segovia' }, type: 'book', url: 'https://www.alcazardesegovia.com/informacion/entradas/' },
    ] },
  { id: 'b8', text: { en: 'Pack swimsuits (La Panera, Aug 7) + kid car entertainment (Aug 12)', es: 'Preparar bañadores (La Panera, 7 ago) + entretenimiento coche peque (12 ago)' } },
]
