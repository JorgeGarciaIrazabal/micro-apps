import { useState } from 'react'
import { tierLabels } from '../data/camps'

export default function CampCard({ camp }) {
  const [expanded, setExpanded] = useState(false)
  const tier = tierLabels[camp.tier]

  const weeklyPrice = camp.pricing.find(p =>
    p.duration.includes('semana') || p.duration.includes('5 dia')
  )

  return (
    <div className={`camp-card tier-${camp.tier}`}>
      <div className="camp-header" onClick={() => setExpanded(!expanded)}>
        <div className="camp-title-row">
          <h3>{camp.name}</h3>
          <span className="tier-badge" style={{ background: tier.bg, color: tier.color }}>
            {tier.label}
          </span>
        </div>
        <div className="camp-subtitle">
          <span className="camp-type">{camp.type}</span>
          <span className="camp-location">{camp.location.distanceFromSanJuan}</span>
          {weeklyPrice && (
            <span className="camp-price-quick">
              {typeof weeklyPrice.price === 'number' ? `${weeklyPrice.price} EUR/sem` : `${weeklyPrice.price} EUR/sem`}
            </span>
          )}
          {!weeklyPrice && camp.pricingNote && (
            <span className="camp-price-quick unknown">Precio: consultar</span>
          )}
        </div>
        <div className="camp-eligible">
          {camp.claraEligible
            ? <span className="eligible-yes">Clara puede inscribirse</span>
            : <span className="eligible-no">Clara NO cumple requisitos</span>
          }
          <span className="eligible-note">{camp.claraEligibleNote}</span>
        </div>
        <div className="camp-activities-preview">
          {camp.activities.slice(0, 5).map(a => (
            <span key={a} className="activity-tag">{a}</span>
          ))}
          {camp.activities.length > 5 && (
            <span className="activity-tag more">+{camp.activities.length - 5} mas</span>
          )}
        </div>
        <button className="expand-btn" aria-label={expanded ? 'Contraer' : 'Expandir'}>
          {expanded ? 'Ver menos' : 'Ver detalles'}
        </button>
      </div>

      {expanded && (
        <div className="camp-details">
          <div className="detail-columns">
            <div className="detail-section">
              <h4>Pros</h4>
              <ul className="pros-list">
                {camp.pros.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
            <div className="detail-section">
              <h4>Contras</h4>
              <ul className="cons-list">
                {camp.cons.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
          </div>

          <div className="detail-section">
            <h4>Horario</h4>
            <div className="schedule-info">
              {camp.schedule.morning && <p><strong>Manana:</strong> {camp.schedule.morning}</p>}
              {camp.schedule.afternoon && <p><strong>Tarde:</strong> {camp.schedule.afternoon}</p>}
              {camp.schedule.earlyCare && <p><strong>Madrugadores:</strong> {camp.schedule.earlyCare}</p>}
              {camp.schedule.extended && <p><strong>Horario extendido:</strong> {camp.schedule.extended}</p>}
              {camp.schedule.preCamp && <p><strong>Pre-campus:</strong> {camp.schedule.preCamp}</p>}
              {camp.schedule.note && <p>{camp.schedule.note}</p>}
              {camp.schedule.options && camp.schedule.options.map((o, i) => <p key={i}>{o}</p>)}
            </div>
          </div>

          <div className="detail-section">
            <h4>Fechas (Julio 2026)</h4>
            <p>{camp.dates.note || `${camp.dates.start} - ${camp.dates.end}`}</p>
            {camp.dates.weeks && (
              <ul>{camp.dates.weeks.map((w, i) => <li key={i}>{w}</li>)}</ul>
            )}
          </div>

          {camp.pricing.length > 0 && (
            <div className="detail-section">
              <h4>Precios</h4>
              <table className="pricing-table">
                <thead>
                  <tr>
                    <th>Duracion</th>
                    <th>Precio</th>
                    {camp.pricing.some(p => p.note) && <th>Nota</th>}
                  </tr>
                </thead>
                <tbody>
                  {camp.pricing.map((p, i) => (
                    <tr key={i}>
                      <td>{p.duration}</td>
                      <td className="price-cell">
                        {typeof p.price === 'number' ? `${p.price} EUR` : `${p.price} EUR`}
                      </td>
                      {camp.pricing.some(pp => pp.note) && <td>{p.note || ''}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
              {camp.pricingNote && <p className="pricing-note">{camp.pricingNote}</p>}
            </div>
          )}
          {camp.pricing.length === 0 && camp.pricingNote && (
            <div className="detail-section">
              <h4>Precios</h4>
              <p className="pricing-note">{camp.pricingNote}</p>
            </div>
          )}

          <div className="detail-section">
            <h4>Actividades completas</h4>
            <div className="activities-full">
              {camp.activities.map(a => (
                <span key={a} className="activity-tag">{a}</span>
              ))}
            </div>
          </div>

          {camp.included.length > 0 && (
            <div className="detail-section">
              <h4>Incluido</h4>
              <ul>{camp.included.map((item, i) => <li key={i}>{item}</li>)}</ul>
            </div>
          )}

          <div className="detail-section">
            <h4>Inscripcion</h4>
            {camp.signup.deadline && (
              <p className="deadline-warning">
                FECHA LIMITE: {camp.signup.deadline}
              </p>
            )}
            <ul>
              {camp.signup.requirements.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>

          <div className="detail-section camp-links">
            <h4>Contacto</h4>
            <div className="contact-info">
              {camp.website && (
                <a href={camp.website} target="_blank" rel="noopener noreferrer" className="link-btn">
                  Web
                </a>
              )}
              {camp.contact.phone && (
                <a href={`tel:${camp.contact.phone.replace(/\s/g, '')}`} className="link-btn phone">
                  {camp.contact.phone}
                  {camp.contact.whatsapp && ' (WhatsApp)'}
                </a>
              )}
              {camp.contact.email && (
                <a href={`mailto:${camp.contact.email}`} className="link-btn email">
                  {camp.contact.email}
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
