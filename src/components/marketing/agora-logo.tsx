/**
 * Agora brand assets, recreated as SVG from the supplied logo image:
 * black tile, gold ornamental crest, serif "Agora" wordmark, spaced tagline.
 * The wordmark uses the site's Instrument Serif (with Georgia fallback) so it
 * stays crisp at any size.
 */

const GOLD_TEXT = "#ead9a3";

function OrnamentDefs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#e6c77d" />
        <stop offset="0.55" stopColor="#c3a054" />
        <stop offset="1" stopColor="#7c5c22" />
      </linearGradient>
    </defs>
  );
}

/* Symmetric filigree crest: central finial + mirrored double scrolls. */
function Crest({ gradientId, y = 0 }: { gradientId: string; y?: number }) {
  const half = (
    <g
      fill="none"
      stroke={`url(#${gradientId})`}
      strokeWidth="3.4"
      strokeLinecap="round"
    >
      <path d="M6 30 C 30 12, 58 12, 76 26 C 86 34, 82 46, 71 45 C 63 44, 61 34, 69 31" />
      <path d="M10 38 C 28 30, 44 31, 56 39 C 63 44, 60 52, 53 51 C 48 50, 47 44, 52 42" />
      <path d="M4 34 C 12 40, 22 43, 32 44" />
    </g>
  );
  return (
    <g transform={`translate(0 ${y})`}>
      <g transform="translate(184 0)">{half}</g>
      <g transform="translate(176 0) scale(-1 1)">{half}</g>
      <path
        d="M180 6 l7 13 -7 13 -7 -13 z"
        fill={`url(#${gradientId})`}
      />
      <circle cx="180" cy="42" r="3" fill={`url(#${gradientId})`} />
    </g>
  );
}

/** Full square lockup: crest + wordmark + tagline on a black tile. */
export function AgoraLogo({ size = 160 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 360 360"
      width={size}
      height={size}
      role="img"
      aria-label="Agora. You chose the horizon. We read the wind."
    >
      <OrnamentDefs id="agora-gold-full" />
      <rect width="360" height="360" rx="14" fill="#0c0c0e" />
      <Crest gradientId="agora-gold-full" y={92} />
      <text
        x="180"
        y="228"
        textAnchor="middle"
        fontFamily="var(--font-mk-serif), Georgia, 'Times New Roman', serif"
        fontSize="88"
        fill={GOLD_TEXT}
      >
        Agora
      </text>
      <text
        x="186"
        y="272"
        textAnchor="middle"
        fontFamily="var(--font-geist-mono), ui-monospace, monospace"
        fontSize="13.5"
        letterSpacing="4.5"
        fill={GOLD_TEXT}
      >
        You chose the horizon.
      </text>
      <text
        x="186"
        y="294"
        textAnchor="middle"
        fontFamily="var(--font-geist-mono), ui-monospace, monospace"
        fontSize="13.5"
        letterSpacing="4.5"
        fill={GOLD_TEXT}
      >
        We read the wind.
      </text>
    </svg>
  );
}

/** Compact mark for the nav and footer: crest + serif A on a black tile. */
export function AgoraMark({ size = 30 }: { size?: number }) {
  return (
    <svg viewBox="0 0 360 360" width={size} height={size} aria-hidden="true">
      <OrnamentDefs id="agora-gold-mark" />
      <rect width="360" height="360" rx="48" fill="#0c0c0e" />
      <Crest gradientId="agora-gold-mark" y={58} />
      <text
        x="180"
        y="298"
        textAnchor="middle"
        fontFamily="var(--font-mk-serif), Georgia, 'Times New Roman', serif"
        fontSize="190"
        fill={GOLD_TEXT}
      >
        A
      </text>
    </svg>
  );
}
