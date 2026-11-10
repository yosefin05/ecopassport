// Kumpulan ornamen SVG. Semua murni dekoratif (aria-hidden).
const S = 'var(--ink)';

export function Leaf({ className = '', fill = 'var(--leaf, #3fbf72)', stroke = S }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <path d="M8 56C8 28 24 8 56 8c0 32-18 48-44 48z" fill={fill} stroke={stroke} strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M10 54L40 24" stroke={stroke} strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

export function Sparkle({ className = '', fill = 'var(--sun)', stroke = S }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <path d="M32 3C34 22 42 30 61 32 42 34 34 42 32 61 30 42 22 34 3 32 22 30 30 22 32 3z" fill={fill} stroke={stroke} strokeWidth="3.5" strokeLinejoin="round" />
    </svg>
  );
}

export function Cloud({ className = '', fill = '#fff' }) {
  const shapes = (
    <>
      <circle cx="40" cy="38" r="18" /><circle cx="66" cy="28" r="24" /><circle cx="92" cy="40" r="16" />
      <rect x="28" y="38" width="76" height="20" rx="10" />
    </>
  );
  return (
    <svg viewBox="0 0 130 70" className={className} aria-hidden="true">
      <g fill={S} stroke={S} strokeWidth="8" strokeLinejoin="round">{shapes}</g>
      <g fill={fill}>{shapes}</g>
    </svg>
  );
}

export function Blob({ className = '', fill = 'var(--mint)' }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true" preserveAspectRatio="none">
      <path d="M100 12C142 6 190 44 188 100S150 192 100 190 12 150 12 100 58 18 100 12z" fill={fill} stroke={S} strokeWidth="3" />
    </svg>
  );
}

export function Squiggle({ className = '', stroke = S }) {
  return (
    <svg viewBox="0 0 120 12" className={className} aria-hidden="true" preserveAspectRatio="none">
      <path d="M2 6Q12-2 22 6T42 6 62 6 82 6 102 6 118 6" fill="none" stroke={stroke} strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

export function Wave({ className = '', fill = S }) {
  return (
    <svg viewBox="0 0 200 40" className={className} aria-hidden="true" preserveAspectRatio="none">
      <path d="M0 22Q25 0 50 22T100 22 150 22 200 22V40H0z" fill={fill} />
    </svg>
  );
}

export function Earth({ className = '' }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <circle cx="100" cy="100" r="92" fill="var(--sky)" stroke={S} strokeWidth="5" />
      <path d="M44 74c10-22 38-28 54-16s6 32-10 38-28 22-44 6z" fill="#4fcf84" stroke={S} strokeWidth="4" strokeLinejoin="round" />
      <path d="M112 118c16-12 42-6 48 16s-22 38-42 26-16-32-6-42z" fill="#4fcf84" stroke={S} strokeWidth="4" strokeLinejoin="round" />
      <path d="M130 44c10-6 22-2 24 8" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
      <circle cx="62" cy="140" r="5" fill="#fff" opacity=".7" />
    </svg>
  );
}
