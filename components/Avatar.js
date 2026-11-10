const COLORS = ['#c8f25d', '#ffd84d', '#ffa6c1', '#8fd8f7', '#a8ebc4', '#ff9d7d'];

export default function Avatar({ name = '?', size = 40 }) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 997;
  return (
    <span
      className="font-display grid shrink-0 place-items-center rounded-full border-[2.5px] border-[var(--ink)] font-bold text-[var(--ink)]"
      style={{ width: size, height: size, background: COLORS[h % COLORS.length], fontSize: size * 0.45 }}
      aria-hidden="true"
    >
      {name.trim().charAt(0).toUpperCase() || '?'}
    </span>
  );
}
