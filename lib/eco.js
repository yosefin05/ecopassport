export const LEVELS = [
  { min: 0, name: 'Bibit' },
  { min: 100, name: 'Tunas' },
  { min: 300, name: 'Pohon Muda' },
  { min: 600, name: 'Pohon Rindang' },
  { min: 1000, name: 'Penjaga Hutan' },
];

// Ganti dengan reward/sponsor asli kalian
export const REWARDS = [
  { id: 'r1', points: 100, title: 'Diskon 10% minuman', desc: 'Berlaku di kafe mitra.', icon: 'Coffee' },
  { id: 'r2', points: 250, title: 'Tote bag eco', desc: 'Tas kain edisi EcoPassport.', icon: 'ShoppingBag' },
  { id: 'r3', points: 500, title: 'Bibit pohon gratis', desc: 'Tanam, lalu foto hasilnya.', icon: 'Sprout' },
  { id: 'r4', points: 1000, title: 'Voucher belanja Rp50.000', desc: 'Untuk produk ramah lingkungan.', icon: 'Ticket' },
];

export function getLevel(points) {
  let i = 0;
  LEVELS.forEach((l, k) => { if (points >= l.min) i = k; });
  const cur = LEVELS[i];
  const next = LEVELS[i + 1] || null;
  const pct = next ? Math.round(((points - cur.min) / (next.min - cur.min)) * 100) : 100;
  return { cur, next, pct, toNext: next ? next.min - points : 0 };
}

const dayKey = (d) => { const x = new Date(d); return `${x.getFullYear()}-${x.getMonth()}-${x.getDate()}`; };

export function calcStreak(logs) {
  const days = new Set(logs.map((l) => dayKey(l.created_at)));
  const d = new Date();
  if (!days.has(dayKey(d))) d.setDate(d.getDate() - 1);
  let streak = 0;
  while (days.has(dayKey(d))) { streak++; d.setDate(d.getDate() - 1); }
  return streak;
}

export function getBadges(s) {
  return [
    { id: 'first', title: 'Langkah Pertama', desc: 'Kirim 1 aksi', icon: 'Footprints', earned: s.actions >= 1 },
    { id: 'three', title: 'Konsisten', desc: 'Kirim 3 aksi', icon: 'Target', earned: s.actions >= 3 },
    { id: 'streak', title: 'Api Hijau', desc: 'Streak 3 hari', icon: 'Flame', earned: s.streak >= 3 },
    { id: 'carbon', title: 'Penghemat Karbon', desc: 'Hemat 1 kg CO₂', icon: 'Cloud', earned: s.carbon >= 1 },
    { id: 'gold', title: 'Cap Emas', desc: 'Skor 90 ke atas', icon: 'Star', earned: s.best >= 90 },
    { id: 'tree', title: 'Pohon Muda', desc: 'Capai 300 poin', icon: 'Sprout', earned: s.points >= 300 },
  ];
}

// Mobil rata-rata ±0,12 kg CO₂ per km: dipakai sebagai perbandingan kasar
export const kmEquivalent = (kg) => Math.round((Number(kg) / 0.12) * 10) / 10;

export const rewardCode = (name, id) => {
  let h = 7;
  for (const c of `${name}-${id}`) h = (h * 31 + c.charCodeAt(0)) % 1679616;
  return `ECO-${h.toString(36).toUpperCase().padStart(4, '0')}`;
};

export const formatDate = (d) =>
  new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

// Kompres foto di browser: lebih cepat diunggah dan aman dari batas ukuran body
export function compressImage(file, max = 1280, quality = 0.82) {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) return resolve(file);
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const r = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * r);
      c.height = Math.round(img.height * r);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      c.toBlob((b) => {
        URL.revokeObjectURL(url);
        resolve(b ? new File([b], 'aksi.jpg', { type: 'image/jpeg' }) : file);
      }, 'image/jpeg', quality);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}
