const kindLabels = {
  en: {
    departure: '🚐 Departure',
    drive: '🚐 Drive',
    checkin: '🏠 Check-in / base',
    supermarket: '🛒 Supermarket',
    'drive-by': '👀 Drive-by',
    scout: '🔍 Scout',
    lunch: '🍽️ Lunch',
    dinner: '🍽️ Dinner',
    showhome: '🏗️ Show home',
    school: '🏫 School',
    rest: '⛽ Rest stop',
    arrival: '🏁 Arrival',
  },
  es: {
    departure: '🚐 Salida',
    drive: '🚐 Trayecto',
    checkin: '🏠 Registro / base',
    supermarket: '🛒 Supermercado',
    'drive-by': '👀 Observación',
    scout: '🔍 Reconocimiento',
    lunch: '🍽️ Almuerzo',
    dinner: '🍽️ Cena',
    showhome: '🏗️ Promoción / Piloto',
    school: '🏫 Colegio',
    rest: '⛽ Descanso',
    arrival: '🏁 Llegada',
  }
}

export default function StopCard({ stop, lang = 'en' }) {
  const labels = kindLabels[lang] || kindLabels['en']
  return (
    <article className={`stop stop-${stop.kind} ${stop.highlight ? 'stop-highlight' : ''}`}>
      <div className="stop-time">
        <span className="stop-time-text">{stop.time}</span>
        <span className="stop-kind">{labels[stop.kind] || stop.kind}</span>
      </div>
      <div className="stop-body">
        <h3>{stop.title}</h3>
        {stop.note && <p>{stop.note}</p>}
        <div className="stop-actions">
          {stop.maps && (
            <a className="maps-btn" href={stop.maps} target="_blank" rel="noreferrer">{lang === 'es' ? 'Abrir en Google Maps ↗' : 'Open in Google Maps ↗'}</a>
          )}
          {stop.extraMaps && (
            <a className="maps-btn secondary" href={stop.extraMaps} target="_blank" rel="noreferrer">{lang === 'es' ? 'Abrir alternativo ↗' : 'Open alternate ↗'}</a>
          )}
        </div>
      </div>
    </article>
  )
}
