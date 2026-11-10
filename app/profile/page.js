'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Camera, Footprints, Target, Flame, Cloud, Star, Sprout, Leaf as LeafIcon, UserRound, TreeDeciduous, TreePine, Trees, Car } from 'lucide-react';
import Avatar from '@/components/Avatar';
import Stamp from '@/components/Stamp';
import { Leaf, Sparkle, Blob } from '@/components/Ornaments';
import { useUser } from '@/components/UserProvider';
import { getUser } from '@/lib/api';
import { LEVELS, getLevel, calcStreak, getBadges, kmEquivalent, formatDate } from '@/lib/eco';

const ICONS = { Footprints, Target, Flame, Cloud, Star, Sprout };
const LEVEL_ICONS = [Sprout, Sprout, TreeDeciduous, TreePine, Trees];
const BCOLORS = ['lime', 'sun', 'pink', 'sky', 'mint', 'coral'];

export default function ProfilePage() {
  const { name, ready, openModal } = useUser();
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!name) return;
    setData(null); setErr('');
    getUser(name)
      .then((j) => (j.success ? setData(j) : setErr(j.message || 'Gagal memuat paspor.')))
      .catch(() => setErr('Tidak bisa terhubung ke server.'));
  }, [name]);

  if (ready && !name) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="card c-mint relative p-10">
          <Sparkle className="bob absolute -right-3 -top-4 w-10" />
          <span className="mx-auto grid h-20 w-20 place-items-center rounded-full border-[2.5px] border-[var(--ink)] bg-white"><UserRound size={36} /></span>
          <h1 className="font-display mt-4 text-4xl font-bold">Paspormu menunggu namamu</h1>
          <p className="mt-2 text-[var(--muted)]">Isi nama untuk melihat riwayat cap, level, dan lencana.</p>
          <button onClick={openModal} className="btn btn-ink mt-6">Isi namamu</button>
        </div>
      </main>
    );
  }
  if (err) return <main className="mx-auto max-w-xl px-4 py-16"><p role="alert" className="rounded-2xl border-2 border-[var(--ink)] bg-[#ffd2c7] p-4 font-extrabold">{err}</p></main>;
  if (!data) return <main className="mx-auto max-w-3xl px-4 py-12"><div className="card h-72 animate-pulse" /></main>;

  const logs = data.logs || [];
  const points = data.user.green_points;
  const carbon = logs.reduce((a, l) => a + Number(l.carbon_saved || 0), 0);
  const streak = calcStreak(logs);
  const best = logs.reduce((m, l) => Math.max(m, l.score || 0), 0);
  const lv = getLevel(points);
  const LvIcon = LEVEL_ICONS[LEVELS.indexOf(lv.cur)] || Sprout;
  const badges = getBadges({ points, actions: logs.length, carbon, streak, best });
  const stats = [
    ['Poin hijau', points, 'lime', LeafIcon],
    ['Karbon dihemat', `${carbon.toFixed(2)} kg`, 'sky', Cloud],
    ['Total aksi', logs.length, 'pink', Camera],
    ['Streak harian', `${streak} hari`, 'sun', Flame],
  ];

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 md:py-12">
      <section className="card c-mint relative overflow-hidden p-6">
        <Blob className="absolute -right-10 -top-12 h-44 w-44" fill="var(--lime)" />
        <Sparkle className="bob absolute right-8 top-6 w-9" />
        <Leaf className="wig absolute bottom-4 right-6 w-12" fill="#fff" />
        <div className="relative flex items-center gap-4">
          <Avatar name={name} size={76} />
          <div className="min-w-0">
            <h1 className="font-display truncate text-4xl font-bold">{name}</h1>
            <p className="chip c-white mt-1"><LvIcon size={16} /> Level {lv.cur.name}</p>
          </div>
        </div>
        <div className="relative mt-6">
          <div className="h-6 overflow-hidden rounded-full border-[2.5px] border-[var(--ink)] bg-white"><div className="stripes h-full bg-[var(--sun)] transition-all duration-700" style={{ width: `${Math.max(lv.pct, 4)}%` }} /></div>
          <p className="mt-2 text-sm font-extrabold">{lv.next ? `${lv.toNext} poin lagi menuju ${lv.next.name}` : 'Level tertinggi tercapai.'}</p>
        </div>
      </section>

      <section aria-label="Statistik" className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map(([label, val, c, Icon], i) => (
          <div key={label} className={`card c-${c} p-4 ${i % 2 ? 'rotate-1' : '-rotate-1'}`}>
            <Icon size={20} />
            <p className="mt-2 text-xs font-extrabold">{label}</p>
            <p className="font-display text-2xl font-bold">{val}</p>
          </div>
        ))}
      </section>
      {carbon > 0 && <p className="chip c-white mt-4"><Car size={16} /> Karbonmu setara kira-kira {kmEquivalent(carbon)} km tanpa mobil.</p>}

      <section className="mt-12">
        <h2 className="font-display text-3xl font-bold">Lencana</h2>
        <ul className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {badges.map((b, i) => {
            const Icon = ICONS[b.icon];
            return (
              <li key={b.id} className={`card flex flex-col items-center p-4 text-center ${b.earned ? '' : 'opacity-50 grayscale'}`}>
                <span className={`grid h-16 w-16 place-items-center rounded-full border-[2.5px] border-[var(--ink)] c-${b.earned ? BCOLORS[i % 6] : 'white'} ${b.earned ? 'wig' : ''}`}><Icon size={28} /></span>
                <p className="font-display mt-2 text-lg font-bold leading-tight">{b.title}</p>
                <p className="text-xs font-bold text-[var(--muted)]">{b.desc}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-3xl font-bold">Cap di pasporku</h2>
        {logs.length === 0 ? (
          <div className="card c-sun mt-5 p-8 text-center">
            <p className="font-display text-2xl font-bold">Paspormu masih kosong.</p>
            <Link href="/upload" className="btn btn-ink mt-4"><Camera size={20} /> Dapatkan cap pertama</Link>
          </div>
        ) : (
          <div className="card ruled mt-5 grid grid-cols-2 gap-x-3 gap-y-6 p-5 sm:grid-cols-3">
            {logs.map((l, i) => (
              <div key={l.id} className="flex flex-col items-center text-center">
                <Stamp value={l.score} size={96} rotate={[-9, 7, -4, 11][i % 4]} />
                <p className="mt-2 w-full truncate text-sm font-extrabold">{l.action_title}</p>
                <p className="text-xs font-bold text-[var(--muted)]">{formatDate(l.created_at)}</p>
                <p className="text-xs font-extrabold text-[var(--ink)]">{Number(l.carbon_saved || 0).toFixed(2)} kg CO₂</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
