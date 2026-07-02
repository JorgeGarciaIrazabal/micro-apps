// Small stroke-based inline SVG icons (24×24 viewBox, currentColor) so the UI
// looks identical on every platform — replaces the old emoji.

function Icon({ children, size = 22, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" {...rest}>
      {children}
    </svg>
  )
}

export const IconSelect = (p) => (
  <Icon {...p}>
    <path d="M5 3l14 8-6.5 1.5L9 19z" fill="currentColor" fillOpacity="0.12" />
  </Icon>
)

export const IconWall = (p) => (
  <Icon {...p}>
    <path d="M3 8h18M3 13h18" />
    <path d="M8 8v5M14 8v5M11 13v5M17 13v5M3 18h18M5 3v5M11 3v5M17 3v5M3 3h18" opacity="0.55" />
  </Icon>
)

export const IconDoor = (p) => (
  <Icon {...p}>
    <path d="M4 20h16" />
    <path d="M6 20V5" />
    <path d="M6 5c8 0 12 6.5 12 15" strokeDasharray="2.5 2.5" opacity="0.7" />
    <path d="M6 5l10 2" />
  </Icon>
)

export const IconDoorDouble = (p) => (
  <Icon {...p}>
    <path d="M3 20h18" />
    <path d="M5 20V6M19 20V6" />
    <path d="M5 6c5 0 7 6 7 14M19 6c-5 0-7 6-7 14" strokeDasharray="2.5 2.5" opacity="0.7" />
  </Icon>
)

export const IconDoorSliding = (p) => (
  <Icon {...p}>
    <path d="M3 10h18" opacity="0.45" />
    <path d="M3 8h10" strokeWidth="2.5" />
    <path d="M11 13h10" strokeWidth="2.5" />
    <path d="M14 17l3 0m0 0l-1.5-1.5M17 17l-1.5 1.5" opacity="0.8" />
  </Icon>
)

export const IconDoorFolding = (p) => (
  <Icon {...p}>
    <path d="M3 16h18" opacity="0.45" />
    <path d="M4 16l3.5-6 3.5 6 3.5-6 3.5 6" strokeWidth="2" />
  </Icon>
)

export const IconWindow = (p) => (
  <Icon {...p}>
    <rect x="3" y="9" width="18" height="6" rx="1" />
    <path d="M3 12h18" opacity="0.7" />
  </Icon>
)

export const IconRuler = (p) => (
  <Icon {...p}>
    <rect x="3" y="9" width="18" height="7" rx="1.5" transform="rotate(-20 12 12.5)" />
    <path d="M8 12.5l.7 2M12 11l.7 2M16 9.6l.7 2" transform="rotate(-20 12 12.5)" opacity="0.8" />
  </Icon>
)

export const IconPlus = (p) => (
  <Icon {...p}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
)
