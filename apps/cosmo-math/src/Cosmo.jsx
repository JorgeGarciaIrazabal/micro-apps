import { useMemo } from 'react'

// ---------------------------------------------------------------------------
// Cosmo, the space-faring alien. Pure SVG so he stays crisp on any tablet.
// ---------------------------------------------------------------------------
export function Cosmo({ mood = 'idle', look = null, size = 'clamp(180px, 34vh, 300px)' }) {
  const happy = mood === 'happy'
  return (
    <div className={`cosmo cosmo--${mood}`} style={{ '--cosmo-size': size }}>
      <svg viewBox="0 0 200 200" role="img" aria-label="Cosmo the alien">
        <defs>
          <radialGradient id="cosmoBody" cx="34%" cy="24%" r="82%">
            <stop offset="0%" stopColor="#c9fff1" />
            <stop offset="42%" stopColor="#5eeac0" />
            <stop offset="100%" stopColor="#12a884" />
          </radialGradient>
          <radialGradient id="cosmoEye" cx="40%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#dcf7f1" />
          </radialGradient>
        </defs>

        <ellipse cx="100" cy="188" rx="54" ry="8" fill="#03010c" opacity="0.35" />

        <g className="cosmo-float">
          <ellipse cx="76" cy="179" rx="17" ry="9" fill="#0f9a79" />
          <ellipse cx="124" cy="179" rx="17" ry="9" fill="#0f9a79" />

          <path d="M80 54 Q66 28 54 22" stroke="#3fd0a7" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M120 54 Q134 28 146 22" stroke="#3fd0a7" strokeWidth="6" fill="none" strokeLinecap="round" />
          <circle className="antenna-ball" cx="52" cy="20" r="9" fill="#ffd166" />
          <circle className="antenna-ball alt" cx="148" cy="20" r="9" fill="#ff77ab" />

          <path
            d="M100 44 C146 44 169 80 169 118 C169 158 139 184 100 184 C61 184 31 158 31 118 C31 80 54 44 100 44 Z"
            fill="url(#cosmoBody)"
          />
          <ellipse cx="100" cy="146" rx="44" ry="31" fill="#e8fff8" opacity="0.3" />

          <g className="cosmo-eyes">
            <ellipse cx="77" cy="99" rx="18" ry="20" fill="url(#cosmoEye)" />
            <ellipse cx="123" cy="99" rx="18" ry="20" fill="url(#cosmoEye)" />
            {happy ? (
              <>
                <path d="M68 100 Q77 90 86 100" stroke="#2a1c46" strokeWidth="4.5" fill="none" strokeLinecap="round" />
                <path d="M114 100 Q123 90 132 100" stroke="#2a1c46" strokeWidth="4.5" fill="none" strokeLinecap="round" />
              </>
            ) : (
              <>
                <ellipse cx="79" cy="102" rx="9" ry="10" fill="#2a1c46" />
                <ellipse cx="125" cy="102" rx="9" ry="10" fill="#2a1c46" />
                <circle cx="82" cy="98" r="3.2" fill="#fff" />
                <circle cx="128" cy="98" r="3.2" fill="#fff" />
              </>
            )}
          </g>

          <ellipse cx="56" cy="126" rx="9" ry="6" fill="#ff6f9c" opacity="0.5" />
          <ellipse cx="144" cy="126" rx="9" ry="6" fill="#ff6f9c" opacity="0.5" />

          {happy ? (
            <g className="cosmo-mouth">
              <path d="M82 132 Q100 168 118 132 Q100 142 82 132 Z" fill="#37204a" />
              <ellipse cx="100" cy="150" rx="10" ry="6" fill="#ff6f9c" />
            </g>
          ) : mood === 'oops' ? (
            <ellipse cx="100" cy="144" rx="7" ry="8" fill="#37204a" />
          ) : (
            <path
              d="M87 139 Q100 150 113 139"
              stroke="#1d7c63"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
            />
          )}
        </g>
      </svg>

      {look ? (
        <span
          className="cosmo-acc"
          key={look.id}
          style={{
            top: `${look.top}%`,
            left: `${look.left}%`,
            transform: `translate(-50%, -50%) rotate(${look.rot}deg)`,
            fontSize: `calc(var(--cosmo-size) * ${0.36 * look.scale})`,
          }}
        >
          {look.emoji}
        </span>
      ) : null}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Decorations
// ---------------------------------------------------------------------------
export function StarField() {
  const stars = useMemo(
    () =>
      Array.from({ length: 80 }, (_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: 1 + Math.random() * 2.4,
        delay: Math.random() * 4,
        dur: 2.4 + Math.random() * 3,
        warm: Math.random() > 0.7,
      })),
    [],
  )
  return (
    <div className="starfield" aria-hidden="true">
      {stars.map((s) => (
        <span
          key={s.id}
          className={s.warm ? 'star warm' : 'star'}
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.dur}s`,
          }}
        />
      ))}
      <span className="planet planet-a" />
      <span className="planet planet-b" />
      <span className="planet planet-c" />
    </div>
  )
}

export function Confetti() {
  const colors = ['#ffd166', '#ff6f9c', '#5eeac0', '#9b8cff', '#ffa45c']
  const pieces = useMemo(
    () =>
      Array.from({ length: 54 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.9,
        dur: 2 + Math.random() * 1.8,
        rot: Math.random() * 360,
        drift: (Math.random() - 0.5) * 160,
        color: colors[i % colors.length],
        size: 7 + Math.random() * 9,
      })),
    [],
  )
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            left: `${p.left}%`,
            background: p.color,
            width: `${p.size}px`,
            height: `${p.size * 0.6}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
            '--drift': `${p.drift}px`,
            '--spin': `${p.rot}deg`,
          }}
        />
      ))}
    </div>
  )
}
