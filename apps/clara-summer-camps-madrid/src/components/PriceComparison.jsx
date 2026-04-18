export default function PriceComparison({ camps }) {
  const campsWithPrices = camps.filter(c => c.pricing.length > 0)
  const campsWithoutPrices = camps.filter(c => c.pricing.length === 0)

  const getWeeklyPrice = (camp) => {
    const weekly = camp.pricing.find(p =>
      (p.duration.includes('semana') || p.duration.includes('5 dia')) && !p.note?.includes('comedor')
    )
    return weekly ? (typeof weekly.price === 'number' ? weekly.price : null) : null
  }

  const getMonthlyPrice = (camp) => {
    const monthly = camp.pricing.find(p =>
      (p.duration.includes('mes') || p.duration.includes('20 dia') || p.duration === '4 semanas')
      && !p.note?.includes('comedor')
    )
    return monthly ? (typeof monthly.price === 'number' ? monthly.price : null) : null
  }

  const maxWeekly = Math.max(...campsWithPrices.map(c => getWeeklyPrice(c) || 0))

  return (
    <div className="price-comparison">
      <h2>Comparativa de precios</h2>
      <div className="price-table-wrapper">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Campamento</th>
              <th>Semanal</th>
              <th>Mensual (~4 sem)</th>
              <th className="bar-col">Comparativa semanal</th>
            </tr>
          </thead>
          <tbody>
            {campsWithPrices
              .sort((a, b) => (getWeeklyPrice(a) || 999) - (getWeeklyPrice(b) || 999))
              .map(camp => {
                const weekly = getWeeklyPrice(camp)
                const monthly = getMonthlyPrice(camp)
                const pct = weekly ? (weekly / maxWeekly) * 100 : 0
                return (
                  <tr key={camp.id}>
                    <td className="camp-name-cell">
                      <span className="camp-name">{camp.name}</span>
                      {!camp.claraEligible && <span className="ineligible-mark"> (no apta)</span>}
                    </td>
                    <td className="price-cell">{weekly ? `${weekly} EUR` : '-'}</td>
                    <td className="price-cell">{monthly ? `${monthly} EUR` : '-'}</td>
                    <td className="bar-col">
                      {weekly && (
                        <div className="price-bar-container">
                          <div
                            className="price-bar"
                            style={{
                              width: `${pct}%`,
                              background: camp.claraEligible
                                ? `hsl(${120 - (pct * 1.2)}, 70%, 45%)`
                                : '#ccc',
                            }}
                          />
                          <span className="price-bar-label">{weekly} EUR</span>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            {campsWithoutPrices.map(camp => (
              <tr key={camp.id} className="no-price-row">
                <td className="camp-name-cell">
                  <span className="camp-name">{camp.name}</span>
                  {!camp.claraEligible && <span className="ineligible-mark"> (no apta)</span>}
                </td>
                <td className="price-cell" colSpan={3}>
                  Precio no disponible online - contactar directamente
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
