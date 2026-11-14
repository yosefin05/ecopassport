export function normalizeUserName(value) {
  if (typeof value !== 'string') return null;

  const name = value.trim();
  if (!name || name.length > 24 || /[\u0000-\u001f\u007f]/.test(name)) return null;

  return name;
}
