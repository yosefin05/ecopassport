// Pembungkus fetch ke 3 endpoint backend: /api/scan, /api/leaderboard, /api/user
async function getJson(url, opts) {
  const res = await fetch(url, opts);
  try {
    return await res.json();
  } catch {
    throw new Error('Respons server tidak valid.');
  }
}

export const getLeaderboard = () => getJson('/api/leaderboard', { cache: 'no-store' });
export const getUser = (name) => getJson(`/api/user?name=${encodeURIComponent(name)}`, { cache: 'no-store' });
export function scanImage(file, userName) {
  const fd = new FormData();
  fd.append('image', file);
  fd.append('user_name', userName);
  return getJson('/api/scan', { method: 'POST', body: fd });
}
