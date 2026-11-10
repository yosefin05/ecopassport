export default function Stamp({ title, value, sub, tone = 'ok', size = 168, rotate = -9, animate = false, delay = 0, className = '' }) {
  const color = tone === 'ok' ? 'var(--stamp)' : 'var(--alert)';
  return (
    <div
      className={`stamp ${animate ? 'stamp-in' : ''} ${className}`}
      style={{ '--s': `${size}px`, '--r': `${rotate}deg`, color, animationDelay: `${delay}ms` }}
    >
      <div>
        {title && <p className="font-display font-bold" style={{ fontSize: size * 0.1 }}>{title}</p>}
        <p className="font-display font-bold" style={{ fontSize: size * 0.32 }}>{value}</p>
        {sub && <p className="font-extrabold" style={{ fontSize: size * 0.09 }}>{sub}</p>}
      </div>
    </div>
  );
}
