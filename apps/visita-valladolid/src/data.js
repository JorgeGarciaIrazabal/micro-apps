// Datos verificados para "Visita a Valladolid: guía para la familia"

export const MALL_BENCHMARKS = {
  rio: {
    id: 'rio',
    name: 'RÍO Shopping',
    mapsQuery: 'RÍO Shopping, Calle Me Falta un Tornillo 3, Arroyo de la Encomienda, Valladolid',
    shortDesc: 'Arroyo de la Encomienda (junto a A-62)',
  },
  vallsur: {
    id: 'vallsur',
    name: 'Vallsur',
    mapsQuery: 'Centro Comercial Vallsur, Paseo de Zorrilla, Valladolid',
    shortDesc: 'Sur de Valladolid (Paseo de Zorrilla)',
  },
}

export function mapsPlaceUrl(query) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

export function mapsDriveUrl(origin, destination) {
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=driving`
}

export function mapsMultiStopUrl(stops) {
  if (!stops || stops.length < 2) return mapsPlaceUrl(stops?.[0] || 'Valladolid, España')
  const origin = stops[0]
  const destination = stops[stops.length - 1]
  const waypoints = stops.slice(1, -1)
  const params = new URLSearchParams({
    api: '1',
    origin,
    destination,
    travelmode: 'driving',
  })
  if (waypoints.length > 0) {
    params.set('waypoints', waypoints.join('|'))
  }
  return `https://www.google.com/maps/dir/?${params.toString()}`
}

export const TOWNS = [
  {
    id: 'arroyo',
    name: 'Arroyo de la Encomienda',
    shortName: 'Arroyo',
    priority: 'principal',
    loop: 'oeste',
    inOneDay: true,
    badge: 'Referencia de comodidad',
    tagline: 'Servicios a mano, vida familiar moderna y paseos junto al Pisuerga.',
    whyConsidered:
      'Es nuestra referencia de comodidad diaria. Queremos comparar La Flecha (tiendas y servicios de cada día) con La Vega y el entorno del Parque del Socayo (paseos junto al río y vida familiar), y ver si las calles residenciales se sienten tranquilas lejos de las avenidas más comerciales.',
    whatToCheck: [
      'Comparar el ritmo de La Flecha frente a la tranquilidad de La Vega y Parque del Socayo.',
      'Pasear por calles residenciales interiores para ver si el ruido comercial desaparece.',
      'Ver el ambiente de familias y parques en un horario normal.',
    ],
    stops: [
      {
        name: 'La Flecha (comercios y servicios)',
        detail: 'Zona más práctica para recados diarios, tiendas, cafeterías y servicios.',
        mapsQuery: 'La Flecha, Arroyo de la Encomienda, Valladolid',
      },
      {
        name: 'La Vega y Parque del Socayo',
        detail: 'Zona residencial familiar junto al Pisuerga, parques y paseos amplios.',
        mapsQuery: 'Parque del Socayo, Arroyo de la Encomienda, Valladolid',
      },
    ],
    mallRefs: [
      {
        mallId: 'rio',
        label: 'RÍO Shopping',
        estimate: '4–7 min (2–4 km)',
        originQuery: 'Parque del Socayo, Arroyo de la Encomienda, Valladolid',
        note: 'Muy cómodo desde cualquier barrio del municipio; desde La Flecha unos 4–6 min y desde La Vega unos 5–7 min.',
      },
    ],
    familyLife:
      'Colegios, centro de salud, pistas de pádel y la Escuela Municipal de Danza en el Edificio Multiusos de La Vega. Muy orientado a familias jóvenes.',
    marketNotes:
      'En el entorno de 260.000 €–350.000 € aparecen chalets adosados y pareados de 3–4 dormitorios con patio/jardín y garaje en La Flecha y La Vega (por ejemplo, entorno C/ Bartolomé de las Casas ~350.000 €). En obra nueva destacan promociones junto al Socayo (Ribera de la Vega, desde ~345.000 €) y La Flecha (Bellavista Homes, con aerotermia). Solares urbanos puntuales en La Flecha rondan 95.000 €–115.000 €.',
    idealistaLinks: [
      {
        label: 'Chalets hasta 350.000 € en Arroyo',
        type: 'casas',
        url: 'https://www.idealista.com/venta-viviendas/arroyo-de-la-encomienda-valladolid/con-precio-hasta_350000,chalets/',
      },
      {
        label: 'Viviendas de 3+ dorm. hasta 350.000 €',
        type: 'casas',
        url: 'https://www.idealista.com/venta-viviendas/arroyo-de-la-encomienda-valladolid/con-precio-hasta_350000,de-tres-dormitorios,de-cuatro-cinco-habitaciones-o-mas/',
      },
      {
        label: 'Parcelas y terrenos hasta 120.000 €',
        type: 'terrenos',
        url: 'https://www.idealista.com/venta-terrenos/arroyo-de-la-encomienda-valladolid/con-precio-hasta_120000/',
      },
    ],
  },
  {
    id: 'laguna',
    name: 'Laguna de Duero',
    shortName: 'Laguna',
    priority: 'principal',
    loop: 'sur',
    inOneDay: true,
    badge: 'Pueblo consolidado',
    tagline: 'Servicios completos, colegios, sanidad y el Parque del Lago.',
    whyConsidered:
      'Opción muy sólida de localidad grande y hecha, con colegios, centro de salud, comercios y ocio. La gran pregunta de la visita es si desde la calle concreta donde viviríamos (Fuente Juana o el entorno de Bosque Real) sentiríamos conexión real con el pueblo o aislamiento.',
    whatToCheck: [
      'Visitar primero el casco urbano y la zona del Lago para tomar el pulso al pueblo.',
      'Ir después a Fuente Juana y las calles residenciales próximas a Bosque Real.',
      'Comprobar si el día a día desde esas urbanizaciones invita a bajar al centro o obliga siempre a coger el coche.',
    ],
    stops: [
      {
        name: 'Centro urbano y Parque del Lago',
        detail: 'Corazón del municipio: tiendas, centro de salud, colegios y paseo del lago.',
        mapsQuery: 'Parque del Lago, Laguna de Duero, Valladolid',
      },
      {
        name: 'Fuente Juana y entorno de Bosque Real',
        detail: 'Zonas residenciales de unifamiliares a 5–8 min en coche del centro y del Lago.',
        mapsQuery: 'Urbanización Fuente Juana, Laguna de Duero, Valladolid',
      },
    ],
    mallRefs: [
      {
        mallId: 'vallsur',
        label: 'Vallsur',
        estimate: '10–15 min (8–11 km)',
        originQuery: 'Urbanización Fuente Juana, Laguna de Duero, Valladolid',
        note: 'Acceso ágil por VA-30 / N-601 hacia Paseo de Zorrilla.',
      },
    ],
    familyLife:
      'Amplia red de colegios públicos y concertados, institutos, centro de salud, polideportivos y pistas de pádel. Muy consolidado todo el año.',
    marketNotes:
      'Oferta interesante de adosados y pareados de 3–4 dormitorios con garaje y jardín en Fuente Juana, Prado Boyal y Senda de los Ingleses entre ~260.000 € y 345.000 €. Hay obra nueva puntual en Fuente Juana (entorno C/ Fuente del Cisne / Fuente de la Fama) con aerotermia. Los chalets independientes en Bosque Real suelen superar los 480.000 €.',
    idealistaLinks: [
      {
        label: 'Chalets hasta 350.000 € en Laguna',
        type: 'casas',
        url: 'https://www.idealista.com/venta-viviendas/laguna-de-duero-valladolid/con-precio-hasta_350000,chalets/',
      },
      {
        label: 'Viviendas de 3+ dorm. hasta 350.000 €',
        type: 'casas',
        url: 'https://www.idealista.com/venta-viviendas/laguna-de-duero-valladolid/con-precio-hasta_350000,de-tres-dormitorios,de-cuatro-cinco-habitaciones-o-mas/',
      },
      {
        label: 'Parcelas y terrenos hasta 120.000 €',
        type: 'terrenos',
        url: 'https://www.idealista.com/venta-terrenos/laguna-de-duero-valladolid/con-precio-hasta_120000/',
      },
    ],
  },
  {
    id: 'zaratan',
    name: 'Zaratán',
    shortName: 'Zaratán',
    priority: 'principal',
    loop: 'oeste',
    inOneDay: false,
    badge: 'Pueblo cercano',
    tagline: 'Escala más pequeña, pegado a Valladolid y con nueva zona residencial.',
    whyConsidered:
      'Una alternativa de pueblo más manejable muy pegada a la capital y a RÍO Shopping. Queremos comparar el casco antiguo con la zona nueva junto al CEIP Violeta Monreal y caminar entre ambas para ver qué resulta cómodo a pie.',
    whatToCheck: [
      'Recorrer el casco antiguo para ver comercios, plazas y servicios básicos.',
      'Ir a la zona residencial nueva junto al CEIP Violeta Monreal (Travesía del Camino de Arrieros).',
      'Hacer el tramo a pie entre las viviendas nuevas y las tiendas o el centro para valorar cuestas, aceras y distancias reales.',
    ],
    stops: [
      {
        name: 'Casco antiguo y Plaza Mayor',
        detail: 'Comercio tradicional, vida local y servicios del centro.',
        mapsQuery: 'Plaza Mayor, Zaratán, Valladolid',
      },
      {
        name: 'Zona nueva junto al CEIP Violeta Monreal',
        detail: 'Travesía del Camino de Arrieros: calles residenciales modernas y entorno escolar.',
        mapsQuery: 'CEIP Violeta Monreal, Zaratán, Valladolid',
      },
    ],
    mallRefs: [
      {
        mallId: 'rio',
        label: 'RÍO Shopping',
        estimate: '5–8 min (3–4 km)',
        originQuery: 'CEIP Violeta Monreal, Zaratán, Valladolid',
        note: 'A un salto por los enlaces del alfoz; muy cómodo para compras grandes.',
      },
    ],
    familyLife:
      'Escala tranquila con colegio nuevo (CEIP Violeta Monreal), parques y proximidad directa a Valladolid oeste y Arroyo para actividades extraescolares.',
    marketNotes:
      'Buena relación calidad-precio frente a Arroyo. En el entorno del CEIP Violeta Monreal hay promociones modernas de adosados con parcela privada por debajo de 300.000 € (como Villas Peral de Zaratán, 3–4 dorm.) y autopromociones recientes, además de chalets de segunda mano y solares urbanos.',
    idealistaLinks: [
      {
        label: 'Chalets hasta 350.000 € en Zaratán',
        type: 'casas',
        url: 'https://www.idealista.com/venta-viviendas/zaratan-valladolid/con-precio-hasta_350000,chalets/',
      },
      {
        label: 'Parcelas y terrenos hasta 120.000 €',
        type: 'terrenos',
        url: 'https://www.idealista.com/venta-terrenos/zaratan-valladolid/con-precio-hasta_120000/',
      },
    ],
  },
  {
    id: 'simancas',
    name: 'Simancas',
    shortName: 'Simancas',
    priority: 'principal',
    loop: 'oeste',
    inOneDay: false,
    badge: 'Río, pinar y paisaje',
    tagline: 'Casco histórico con encanto y urbanizaciones entre pinares.',
    whyConsidered:
      'Destaca por el entorno: paisaje, río Pisuerga y pinares. Hay que separar bien la visita al casco histórico del recorrido hacia Camino Viejo y El Coto de Simancas, y comprobar a qué distancia quedan los recados diarios y los dos centros comerciales desde las casas reales.',
    whatToCheck: [
      'Ver el casco histórico (Castillo, puente medieval) por separado de las urbanizaciones.',
      'Conducir hasta Camino Viejo de Simancas y la Urb. El Coto de Simancas (a ~4–5 km del centro).',
      'Evaluar la distancia real a supermercados, colegios y recados diarios, y comparar tiempos a Vallsur y a RÍO Shopping desde la zona residencial.',
    ],
    stops: [
      {
        name: 'Casco histórico de Simancas',
        detail: 'Entorno del Archivo General, calles con historia y puente sobre el Pisuerga.',
        mapsQuery: 'Plaza Mayor, Simancas, Valladolid',
      },
      {
        name: 'Camino Viejo y Urb. El Coto de Simancas',
        detail: 'Zona residencial entre pinares (entorno El Pichón / Camino Viejo). Comprobar vida diaria y accesos.',
        mapsQuery: 'Urbanización El Coto de Simancas, Valladolid',
      },
    ],
    mallRefs: [
      {
        mallId: 'vallsur',
        label: 'Vallsur (desde El Coto)',
        estimate: '8–10 min (4–6 km)',
        originQuery: 'Urbanización El Coto de Simancas, Valladolid',
        note: 'Muy directo hacia Valladolid sur por el Camino Viejo / VA-30.',
      },
      {
        mallId: 'rio',
        label: 'RÍO Shopping (desde El Coto)',
        estimate: '10–12 min (10–12 km)',
        originQuery: 'Urbanización El Coto de Simancas, Valladolid',
        note: 'Buen enlace por A-62 y rondas; conviene comparar ambos trayectos.',
      },
    ],
    familyLife:
      'Pinares, ribera del Pisuerga, colegios en el eje Camino Viejo / Simancas y oferta ecuestre e hípica en el entorno (además de fácil acceso a la Real Sociedad Hípica de Valladolid).',
    marketNotes:
      'El presupuesto de 350.000 € puede quedar justo para independientes grandes en El Coto, pero aparecen pareados/adosados y viviendas en el eje de Camino Viejo y Simancas. También salen solares urbanos puntuales hasta 120.000 € (verificar siempre si es suelo urbano consolidado o urbanizable).',
    idealistaLinks: [
      {
        label: 'Chalets hasta 350.000 € en Simancas',
        type: 'casas',
        url: 'https://www.idealista.com/venta-viviendas/simancas-valladolid/con-precio-hasta_350000,chalets/',
      },
      {
        label: 'Viviendas en Camino Viejo de Simancas',
        type: 'casas',
        url: 'https://www.idealista.com/venta-viviendas/valladolid/camino-viejo-de-simancas/con-precio-hasta_350000/',
      },
      {
        label: 'Parcelas y terrenos hasta 120.000 €',
        type: 'terrenos',
        url: 'https://www.idealista.com/venta-terrenos/simancas-valladolid/con-precio-hasta_120000/',
      },
    ],
  },
  {
    id: 'boecillo',
    name: 'Boecillo',
    shortName: 'Boecillo',
    priority: 'principal',
    loop: 'sur',
    inOneDay: true,
    badge: 'Favorito de Jorge',
    tagline: 'Pinares, amplitud y gran potencial tanto en chalets como en parcelas.',
    whyConsidered:
      'Uno de los pueblos que Jorge quiere mantener sí o sí en la lista. Visitad primero el casco urbano y comparadlo con urbanizaciones como Pago del Nogal o El Peregrino, buscando el equilibrio entre espacio, pinar, vecinos todo el año y servicios cerca.',
    whatToCheck: [
      'Empezar por el casco urbano de Boecillo para ver comercios, plaza, colegio y ambiente.',
      'Visitar después Pago del Nogal y El Peregrino por separado para ver parcelas, jardines y vida vecinal.',
      'Medir el trayecto real hasta Vallsur desde cada urbanización (no solo desde el pueblo).',
    ],
    stops: [
      {
        name: 'Casco urbano de Boecillo',
        detail: 'Primera parada: tiendas básicas, colegio, plaza y pulso diario del pueblo.',
        mapsQuery: 'Plaza Condes de Gamazo, Boecillo, Valladolid',
      },
      {
        name: 'Urbanización Pago del Nogal',
        detail: 'Zona consolidada de chalets y adosados con zonas verdes cerca del pinar.',
        mapsQuery: 'Urbanización Pago del Nogal, Boecillo, Valladolid',
      },
      {
        name: 'Urbanización El Peregrino',
        detail: 'Entorno tranquilo de pinares con parcelas y viviendas unifamiliares.',
        mapsQuery: 'Urbanización El Peregrino, Boecillo, Valladolid',
      },
    ],
    mallRefs: [
      {
        mallId: 'vallsur',
        label: 'Vallsur (desde Pago del Nogal)',
        estimate: '10–14 min (11–13 km)',
        originQuery: 'Urbanización Pago del Nogal, Boecillo, Valladolid',
        note: 'Salida directa por N-601 / VA-30. Comprobar también desde El Peregrino (~12–15 min).',
      },
      {
        mallId: 'vallsur',
        label: 'Vallsur (desde El Peregrino)',
        estimate: '12–15 min (12–14 km)',
        originQuery: 'Urbanización El Peregrino, Boecillo, Valladolid',
        note: 'Ruta independiente para validar el tope de 20 min desde esta urbanización.',
      },
    ],
    familyLife:
      'Entorno muy verde rodeado de pinares, parques infantiles, zonas deportivas y clubes de pádel/tenis en urbanizaciones. Cercanía a Laguna y al sur de Valladolid para refuerzo de servicios.',
    marketNotes:
      'En Pago del Nogal aparecen pareados y adosados de 3–4 dormitorios con jardín y garaje entre ~260.000 € y 330.000 €. La obra nueva llave en mano es escasa, pero Boecillo destaca por su oferta de parcelas urbanas asequibles (30.000 €–60.000 € en núcleo y El Peregrino), muy interesante para una casa modular de ~120 m² en una planta.',
    idealistaLinks: [
      {
        label: 'Chalets hasta 350.000 € en Boecillo',
        type: 'casas',
        url: 'https://www.idealista.com/venta-viviendas/boecillo-valladolid/con-precio-hasta_350000,chalets/',
      },
      {
        label: 'Viviendas en Pago del Nogal',
        type: 'casas',
        url: 'https://www.idealista.com/venta-viviendas/boecillo/pago-el-nogal/',
      },
      {
        label: 'Parcelas urbanas hasta 120.000 €',
        type: 'terrenos',
        url: 'https://www.idealista.com/venta-terrenos/boecillo-valladolid/con-precio-hasta_120000/',
      },
    ],
  },
  {
    id: 'cisterniga',
    name: 'La Cistérniga',
    shortName: 'La Cistérniga',
    priority: 'principal',
    loop: 'sur',
    inOneDay: false,
    badge: 'Práctica al sureste',
    tagline: 'Muy conectada, precios competitivos y calles residenciales amplias.',
    whyConsidered:
      'Opción práctica al sureste de Valladolid con buena relación metros/precio. Queremos comparar el centro del pueblo con las calles residenciales nuevas alrededor de la Calle Tordesillas, comprobar qué tal se va a pie a todo y prestar atención al tráfico o ruido de las carreteras de acceso.',
    whatToCheck: [
      'Recorrer el centro urbano y comprobar comercios, centro de salud, parques y ambiente.',
      'Pasear por la zona nueva alrededor de la Calle Tordesillas para medir el paseo real a tiendas, parques y colegios.',
      'Escuchar el nivel de ruido y tráfico en los accesos y calles cercanas a la N-122 / rondas.',
    ],
    stops: [
      {
        name: 'Centro urbano de La Cistérniga',
        detail: 'Plaza Mayor, comercios cotidianos, centro de salud y parques municipales.',
        mapsQuery: 'Plaza Mayor, La Cistérniga, Valladolid',
      },
      {
        name: 'Entorno Calle Tordesillas',
        detail: 'Calles residenciales nuevas de unifamiliares y adosados; comprobar paseos y silencio.',
        mapsQuery: 'Calle Tordesillas, La Cistérniga, Valladolid',
      },
    ],
    mallRefs: [
      {
        mallId: 'vallsur',
        label: 'Vallsur',
        estimate: '12–18 min (11–13 km)',
        originQuery: 'Calle Tordesillas, La Cistérniga, Valladolid',
        note: 'Trayecto por VA-20 / rondas; conviene probarlo en hora normal para ver tráfico.',
      },
    ],
    familyLife:
      'Dispone de colegios de Infantil y Primaria, polideportivos, parques y centro de salud. Dato a tener en cuenta a futuro: muchos alumnos de Secundaria/Bachillerato se desplazan a Valladolid.',
    marketNotes:
      'Los chalets adosados y unifamiliares seminuevos o recientes suelen moverse cómodamente por debajo de los 350.000 €, con buenas superficies y calles amplias en la zona de expansión junto a C/ Tordesillas.',
    idealistaLinks: [
      {
        label: 'Chalets hasta 350.000 € en La Cistérniga',
        type: 'casas',
        url: 'https://www.idealista.com/venta-viviendas/la-cisterniga-valladolid/con-precio-hasta_350000,chalets/',
      },
      {
        label: 'Parcelas y terrenos hasta 120.000 €',
        type: 'terrenos',
        url: 'https://www.idealista.com/venta-terrenos/la-cisterniga-valladolid/con-precio-hasta_120000/',
      },
    ],
  },
  {
    id: 'aldeamayor',
    name: 'Aldeamayor de San Martín / Aldeamayor Golf',
    shortName: 'Aldeamayor Golf',
    priority: 'opcional',
    loop: 'sur',
    inOneDay: false,
    badge: 'Opcional · Parcelas amplias',
    tagline: 'Dos realidades distintas: pueblo tradicional y gran urbanización de golf.',
    whyConsidered:
      'Muy útil si sobra tiempo para ver cómo se sienten las parcelas más grandes y una urbanización planificada. Hay que tratar el centro de Aldeamayor y Aldeamayor Golf como dos paradas separadas, comprobar cuánta vida hay un día normal y anotar las cuotas fijas de urbanización.',
    whatToCheck: [
      'Visitar el centro de Aldeamayor de San Martín y Aldeamayor Golf como dos paradas independientes.',
      'Ver si Aldeamayor Golf se siente habitado un día laborable y qué se puede hacer caminando.',
      'Medir el trayecto real desde la urbanización hasta Vallsur para confirmar si entra en los ~20 min.',
      'Preguntar o anotar las cuotas recurrentes: Entidad Urbanística de Conservación (EUC) + posible subcomunidad.',
    ],
    stops: [
      {
        name: 'Aldeamayor de San Martín (centro)',
        detail: 'Primera parada: núcleo tradicional, comercios y servicios del municipio.',
        mapsQuery: 'Plaza Mayor, Aldeamayor de San Martín, Valladolid',
      },
      {
        name: 'Urbanización Aldeamayor Golf',
        detail: 'Parada aparte: parcelas amplias, zonas verdes y campo de golf. Comprobar vida diaria y cuotas EUC.',
        mapsQuery: 'Aldeamayor Golf, Aldeamayor de San Martín, Valladolid',
      },
    ],
    mallRefs: [
      {
        mallId: 'vallsur',
        label: 'Vallsur (desde Aldeamayor Golf)',
        estimate: '15–18 min (17–18 km)',
        originQuery: 'Aldeamayor Golf, Aldeamayor de San Martín, Valladolid',
        note: 'Está cerca del límite de ~20 min: importante comprobar el tiempo real puerta a puerta.',
      },
    ],
    familyLife:
      'Mucha tranquilidad, parcelas amplias, zonas deportivas y piscinas en la urbanización. Ojo con los costes fijos: Aldeamayor Golf cuenta con Entidad Urbanística de Conservación (EUC) obligatoria para viales y zonas verdes, a veces sumada a subcomunidad.',
    marketNotes:
      'Una de las zonas con más oferta dentro del presupuesto: adosados desde ~190.000 €–270.000 €, chalets independientes con parcela generosa entre 270.000 € y 350.000 €, y abundante oferta de parcelas urbanas para autoconstrucción.',
    idealistaLinks: [
      {
        label: 'Chalets hasta 350.000 € en Aldeamayor',
        type: 'casas',
        url: 'https://www.idealista.com/venta-viviendas/aldeamayor-de-san-martin-valladolid/con-precio-hasta_350000,chalets/',
      },
      {
        label: 'Parcelas urbanas hasta 120.000 €',
        type: 'terrenos',
        url: 'https://www.idealista.com/venta-terrenos/aldeamayor-de-san-martin-valladolid/con-precio-hasta_120000/',
      },
    ],
  },
  {
    id: 'herrera',
    name: 'Herrera de Duero (Tudela de Duero)',
    shortName: 'Herrera de Duero',
    priority: 'opcional',
    loop: 'sur',
    inOneDay: false,
    badge: 'Opcional · Ribera tranquila',
    tagline: 'Núcleo pequeño junto al río Duero y pinares, dentro de Tudela de Duero.',
    whyConsidered:
      'Alternativa más tranquila y de pueblo pequeño junto al río si os atrae un ritmo muy pausado. Lo esencial aquí es comprobar qué servicios existen de verdad en Herrera, para qué hace falta coger el coche (Tudela de Duero o Valladolid) y cómo se siente fuera de fin de semana.',
    whatToCheck: [
      'Pasear por Herrera de Duero en horario normal para ver si hay vida vecinal más allá del fin de semana.',
      'Anotar qué recados básicos hay en el propio núcleo y cuáles obligan a ir a Tudela de Duero (8–10 min) o Valladolid.',
      'Comprobar el trayecto en coche hasta Vallsur.',
    ],
    stops: [
      {
        name: 'Herrera de Duero (núcleo y ribera)',
        detail: 'Pedanía rodeada de pinares junto al Duero; revisar comercios y ambiente entre semana.',
        mapsQuery: 'Herrera de Duero, Tudela de Duero, Valladolid',
      },
      {
        name: 'Referencia de servicios: Tudela de Duero',
        detail: 'Cabecera municipal a ~9 km (8–10 min) con supermercados, farmacias y servicios principales.',
        mapsQuery: 'Tudela de Duero, Valladolid',
      },
    ],
    mallRefs: [
      {
        mallId: 'vallsur',
        label: 'Vallsur (desde Herrera de Duero)',
        estimate: '12–15 min (13–14 km)',
        originQuery: 'Herrera de Duero, Tudela de Duero, Valladolid',
        note: 'Acceso bastante directo hacia Valladolid sur por la ronda.',
      },
    ],
    familyLife:
      'Entorno muy tranquilo de ribera y pinar con pequeño comercio y hostelería local; la mayoría de farmacias, supermercados y gestiones diarias se concentran en Tudela de Duero (~8–10 min) o Valladolid.',
    marketNotes:
      'En el municipio de Tudela de Duero y Herrera aparecen pareados y chalets desde ~200.000 €–350.000 € con parcelas generosas, además de parcelas para edificar en un ambiente mucho más rural.',
    idealistaLinks: [
      {
        label: 'Chalets hasta 350.000 € en Tudela / Herrera',
        type: 'casas',
        url: 'https://www.idealista.com/venta-viviendas/tudela-de-duero-valladolid/con-precio-hasta_350000,chalets/',
      },
      {
        label: 'Parcelas y terrenos hasta 120.000 €',
        type: 'terrenos',
        url: 'https://www.idealista.com/venta-terrenos/tudela-de-duero-valladolid/con-precio-hasta_120000/',
      },
    ],
  },
]

export const FULL_DAY_ROUTE = {
  title: 'Ruta de día completo por Valladolid y 5 pueblos',
  subtitle:
    'Un único recorrido en arco (sin dar rodeos) de noroeste a sur: 5 pueblos clave incluido Zaratán, más Valladolid ciudad y sus dos centros comerciales de referencia.',
  driveSummaryBase:
    'Unos 40–50 min de coche en total entre todas las paradas (~35 km), perfecto para repartir entre mañana, comida en Valladolid y tarde.',
  driveSummaryWithExtras:
    'Entre 50 y 70 min de coche en total según los desvíos opcionales que añadáis al final de la tarde.',
  baseStops: [
    {
      id: 'zaratan',
      type: 'town',
      townId: 'zaratan',
      moment: 'Mañana · Inicio',
      title: 'Zaratán',
      subtitle: 'Casco antiguo / Plaza Mayor y zona nueva junto al CEIP Violeta Monreal',
      mapsQuery: 'CEIP Violeta Monreal, Zaratán, Valladolid',
    },
    {
      id: 'arroyo',
      type: 'town',
      townId: 'arroyo',
      moment: 'Mañana',
      title: 'RÍO Shopping y Arroyo de la Encomienda',
      subtitle: 'Referencia comercial oeste (RÍO Shopping), La Flecha y La Vega / Parque del Socayo',
      mapsQuery: 'RÍO Shopping, Arroyo de la Encomienda, Valladolid',
      extraMapLink: {
        label: 'Parque del Socayo',
        query: 'Parque del Socayo, Arroyo de la Encomienda, Valladolid',
      },
    },
    {
      id: 'simancas',
      type: 'town',
      townId: 'simancas',
      moment: 'Final de la mañana',
      title: 'Simancas (casco histórico y El Coto)',
      subtitle: 'Puente sobre el Pisuerga y, aparte, Camino Viejo y Urb. El Coto de Simancas',
      mapsQuery: 'Urbanización El Coto de Simancas, Valladolid',
      extraMapLink: {
        label: 'Casco histórico',
        query: 'Plaza Mayor, Simancas, Valladolid',
      },
    },
    {
      id: 'valladolid-ciudad',
      type: 'city',
      moment: 'Mediodía · Ideal para comer',
      title: 'Valladolid ciudad y C.C. Vallsur',
      subtitle:
        'Entrada por Paseo de Zorrilla: parada en Vallsur (centro comercial de referencia sur) y paseo/comida por el entorno de Campo Grande y centro de Valladolid.',
      mapsQuery: 'Centro Comercial Vallsur, Paseo de Zorrilla, Valladolid',
      cityPlaces: [
        {
          label: 'C.C. Vallsur',
          query: 'Centro Comercial Vallsur, Paseo de Zorrilla, Valladolid',
        },
        {
          label: 'Campo Grande / Paseo de Zorrilla',
          query: 'Campo Grande, Valladolid',
        },
      ],
    },
    {
      id: 'laguna',
      type: 'town',
      townId: 'laguna',
      moment: 'Primera hora de la tarde',
      title: 'Laguna de Duero',
      subtitle: 'Centro urbano y Parque del Lago comparados con Fuente Juana y entorno Bosque Real',
      mapsQuery: 'Parque del Lago, Laguna de Duero, Valladolid',
    },
    {
      id: 'boecillo',
      type: 'town',
      townId: 'boecillo',
      moment: 'Tarde',
      title: 'Boecillo',
      subtitle: 'Casco urbano primero y después Urb. Pago del Nogal y Urb. El Peregrino',
      mapsQuery: 'Plaza Condes de Gamazo, Boecillo, Valladolid',
    },
  ],
  optionalStops: [
    {
      id: 'aldeamayor',
      type: 'town',
      townId: 'aldeamayor',
      moment: 'Opcional · Tarde',
      title: 'Aldeamayor de San Martín / Aldeamayor Golf',
      subtitle: 'Centro del pueblo y urbanización Aldeamayor Golf por separado (cuotas EUC)',
      mapsQuery: 'Aldeamayor Golf, Aldeamayor de San Martín, Valladolid',
    },
    {
      id: 'herrera',
      type: 'town',
      townId: 'herrera',
      moment: 'Opcional · Tarde',
      title: 'Herrera de Duero (Tudela de Duero)',
      subtitle: 'Núcleo pequeño junto al Duero y pinares; comprobar servicios locales',
      mapsQuery: 'Herrera de Duero, Tudela de Duero, Valladolid',
    },
    {
      id: 'cisterniga',
      type: 'town',
      townId: 'cisterniga',
      moment: 'Opcional · Final de la tarde',
      title: 'La Cistérniga',
      subtitle: 'Centro urbano y calles residenciales nuevas alrededor de Calle Tordesillas',
      mapsQuery: 'Calle Tordesillas, La Cistérniga, Valladolid',
    },
  ],
  legs: {
    'zaratan->arroyo': '5–8 min (~3–4 km hacia RÍO Shopping y La Flecha)',
    'arroyo->simancas': '6–8 min (~4–5 km bajando hacia el Pisuerga y Simancas)',
    'simancas->valladolid-ciudad':
      '8–10 min (~5 km desde El Coto por el Camino Viejo hasta Vallsur y Paseo de Zorrilla)',
    'valladolid-ciudad->laguna': '10–15 min (~8–10 km saliendo por Paseo de Zorrilla / VA-30)',
    'laguna->boecillo': '5–8 min (~5–6 km hacia el sur por CL-600)',
    'boecillo->aldeamayor': '9–11 min (~9 km por CL-600 hacia pinares)',
    'boecillo->herrera': '7–9 min (~7 km hacia la ribera del Duero)',
    'boecillo->cisterniga': '12–15 min (~11 km por VA-30 hacia el sureste)',
    'aldeamayor->herrera': '8–10 min (~7–8 km por carretera de pinar)',
    'aldeamayor->cisterniga': '14–16 min (~14 km subiendo hacia el norte)',
    'herrera->cisterniga': '8–10 min (~6–8 km hacia La Cistérniga)',
  },
}

export const REQUIREMENTS = {
  mustHaves: [
    {
      title: 'Precio máximo de 350.000 € en Valladolid',
      detail:
        'La franja de 300.000 €–350.000 € es nuestra guía, y una casa más barata es bienvenida si encaja bien. Solo Madrid justificaría estirar el presupuesto hacia 400.000 €.',
    },
    {
      title: 'Mínimo 3 dormitorios y unos 110–120 m² o más',
      detail:
        'Anotad tanto superficie construida como útil interior si se conoce. No contéis garaje, sótano, porche ni terraza como metros habitables.',
    },
    {
      title: 'Jardín o patio privado y aprovechable',
      detail:
        'Con espacio real para que juegue Clara y para comer fuera. Fijaos en la forma del jardín, privacidad, sol y cuánto queda libre después de aparcar.',
    },
    {
      title: 'Garaje o aparcamiento fiable',
      detail: 'Plaza cómoda y segura en la propia vivienda o acceso directo sin complicaciones.',
    },
    {
      title: 'Interior contemporáneo y en buen estado',
      detail:
        'Cocina y baños modernos, listo para entrar sin gran reforma. Una casa más antigua bien reformada también encaja. En obra nueva, distinguid siempre entre infografías (renders) y fotos reales.',
    },
    {
      title: 'Centro comercial real a unos 20 min en coche',
      detail:
        'Desde la dirección exacta hasta RÍO Shopping o Vallsur según corresponda. Un supermercado aislado no cuenta como centro comercial.',
    },
    {
      title: 'Barrio consolidado con vecinos todo el año',
      detail:
        'Marisa quiere un sitio con vida real todo el año: tiendas, restaurantes, atención sanitaria y actividades para Clara a una distancia razonable.',
    },
  ],
  preferences: [
    {
      title: 'Buen aislamiento y climatización eficiente',
      detail:
        'Buenas ventanas, calefacción y refrigeración eficientes. La aerotermia y las placas solares son un gran plus.',
    },
    {
      title: 'Distribución práctica para familia',
      detail:
        'Una sola planta es ideal. Si tiene dos plantas, un dormitorio y un baño completo en planta baja dan mucha flexibilidad con el tiempo.',
    },
    {
      title: 'Entorno activo y seguro para Clara',
      detail:
        'Buen acceso a colegios, parques, deporte y zonas seguras para pasear o ir en bici. Danza, hípica y pádel cerca son extras muy útiles.',
    },
    {
      title: 'Espacio para la madre de Jorge o invitados',
      detail: 'Un dormitorio extra o zona cómoda de invitados suma puntos, pero no es imprescindible.',
    },
    {
      title: 'Piscina comunitaria solo si las cuotas tienen sentido',
      detail:
        'Preguntad por la cuota ordinaria mensual, qué incluye, posibles derramas previstas y si hay cuotas aparte de urbanización o entidad de conservación (EUC).',
    },
  ],
  ifSpotted: [
    {
      title: 'Datos básicos, sin necesidad de llamar',
      detail:
        'Anotad la dirección exacta o pin del mapa, el nombre visible de la agencia o promotora y qué os ha llamado la atención. No hace falta concertar visitas ni contactar a nadie desde la app.',
    },
    {
      title: 'En obra nueva: “entrega de llaves” exacta',
      detail:
        'Apuntad la fecha anunciada de entrega de llaves para esa fase o unidad concreta, si es estimada y de dónde sale el dato. El fin de obra es un hito distinto. Si no hay fecha publicada, dejadla como desconocida.',
    },
    {
      title: 'Separar precio pedido de gastos y extras',
      detail:
        'Mantened siempre separado el precio anunciado de impuestos, gastos de compraventa, cocina, jardín/paisajismo o arreglos necesarios.',
    },
    {
      title: 'Si veis una parcela o terreno',
      detail:
        'Buscamos suelo residencial urbano / solar de más de 200 m² y hasta 120.000 €, con acceso rodado y suministros. El objetivo total del proyecto es de unos 300.000 €–350.000 € (casa modular contemporánea de ~120 m² en una planta + garaje + jardín amplio). Que un anuncio diga “edificable” no basta: necesitamos dimensiones reales, retranqueos, ocupación y edificabilidad máximas y confirmación del ayuntamiento. No asumáis que el garaje está exento ni tratéis suelo urbanizable o rústico como listo para construir.',
    },
  ],
}

export const VERDICT_OPTIONS = [
  { id: 'encanta', label: 'Nos encanta', emoji: '🌟', tone: 'green' },
  { id: 'interesante', label: 'Interesante', emoji: '👍', tone: 'teal' },
  { id: 'dudas', label: 'Con dudas', emoji: '🤔', tone: 'amber' },
  { id: 'descartar', label: 'No encaja', emoji: '✕', tone: 'muted' },
]
