'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Crown, Camera, Lock, Gift, X, RefreshCw, Coffee, ShoppingBag, Sprout, Ticket, Trophy } from 'lucide-react';
import Avatar from '@/components/Avatar';
import Confetti from '@/components/Confetti';
import { Sparkle, Leaf } from '@/components/Ornaments';
import { useUser } from '@/components/UserProvider';
import { getLeaderboard, getUser } from '@/lib/api';
import { REWARDS, rewardCode } from '@/lib/eco';

const ICONS = { Coffee, ShoppingBag, Sprout, Ticket };
const RCOLORS = ['pink', 'sky', 'sun', 'mint'];
const PODIUM = [{ h: 'h-40', c: 'sun' }, { h: 'h-28', c: 'sky' }, { h: 'h-20', c: 'pink' }];

export default function LeaderboardPage() {
  const { name } = useUser();
  const [board, setBoard] = useState(null);
  const [me, setMe] = useState(null);
  const [err, setErr] = useState('');
  const [claim, setClaim] = useState(null);
  const [spin, setSpin] = useState(false);

  const load = useCallback(async () => {
    setSpin(true);
    try {
      const [b, u] = await Promise.all([getLeaderboard(), name ? getUser(name) : Promise.resolve(null)]);
      if (b.success) { setBoard(b.data); setErr(''); } else setErr(b.message || 'Gagal memuat peringkat.');
      if (u?.success) setMe(u.user);
    } catch { setErr('Tidak bisa terhubung ke server.'); }
    setSpin(false);
  }, [name]);

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  const top = board?.slice(0, 3) || [];
  const rest = board?.slice(3) || [];
  const order = [1, 0, 2]; // tampilan podium: peringkat 2, 1, 3
  const leaderPts = board?.[0]?.green_points || 1;
  const myPoints = me?.green_points ?? board?.find((u) => u.name === name)?.green_points ?? 0;
  const inBoard = board?.some((u) => u.name === name);
  const gap = board && board.length >= 10 && name && !inBoard ? board[9].green_points - myPoints + 1 : null;

  return (
    <main className="relative mx-auto max-w-3xl px-4 py-8 md:py-12">
      <div className="flex items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="wig grid h-14 w-14 shrink-0 place-items-center rounded-full border-[2.5px] border-[var(--ink)] bg-[var(--sun)] shadow-[3px_3px_0_var(--ink)]"><Trophy size={26} /></span>
          <div>
            <h1 className="font-display text-4xl font-bold md:text-5xl">Papan peringkat</h1>
            <p className="text-[var(--muted)]">10 pemain dengan poin hijau tertinggi.</p>
          </div>
        </div>
        <button onClick={load} aria-label="Segarkan" className="btn btn-icon"><RefreshCw size={18} className={spin ? 'animate-spin' : ''} /></button>
      </div>

      {err && <p role="alert" className="mt-6 rounded-2xl border-2 border-[var(--ink)] bg-[#ffd2c7] p-4 font-extrabold">{err}</p>}
      {board === null && !err && <div className="card mt-6 h-64 animate-pulse" />}

      {board?.length === 0 && (
        <div className="card c-mint mt-6 p-8 text-center">
          <p className="font-display text-3xl font-bold">Belum ada yang mendapat cap.</p>
          <p className="mt-1 text-[var(--muted)]">Kirim aksi pertamamu dan jadilah nomor satu.</p>
          <Link href="/upload" className="btn btn-ink mt-5"><Camera size={20} /> Scan sekarang</Link>
        </div>
      )}

      {top.length > 0 && (
        <section aria-label="Tiga teratas" className="relative mt-10 grid grid-cols-3 items-end gap-3">
          <Sparkle className="bob absolute -top-4 left-1/2 w-8" />
          {order.map((k) => {
            const u = top[k];
            if (!u) return <div key={k} />;
            return (
              <div key={u.id} className="flex flex-col items-center text-center">
                {k === 0 && <Crown className="bob mb-1 text-[var(--ink)]" size={30} fill="var(--sun)" />}
                <Avatar name={u.name} size={k === 0 ? 68 : 54} />
                <p className="mt-2 w-full truncate font-extrabold">{u.name}</p>
                <p className="text-sm font-extrabold text-[var(--muted)]">{u.green_points} poin</p>
                <div className={`${PODIUM[k].h} c-${PODIUM[k].c} font-display mt-2 w-full rounded-t-2xl border-[2.5px] border-b-0 border-[var(--ink)] pt-2 text-4xl font-bold`}>{u.rank}</div>
              </div>
            );
          })}
        </section>
      )}
      {top.length > 0 && <div className="h-1.5 rounded-full bg-[var(--ink)]" />}

      {rest.length > 0 && (
        <ol className="mt-5 space-y-3">
          {rest.map((u) => (
            <li key={u.id} className={`card flex items-center gap-3 p-3 ${u.name === name ? 'c-lime' : ''}`}>
              <span className="font-display grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-[var(--ink)] bg-white text-lg font-bold">{u.rank}</span>
              <Avatar name={u.name} size={38} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-extrabold">{u.name}{u.name === name && ' (kamu)'}</p>
                <div className="mt-1 h-2.5 overflow-hidden rounded-full border-2 border-[var(--ink)] bg-white"><div className="h-full bg-[var(--ink)]" style={{ width: `${(u.green_points / leaderPts) * 100}%` }} /></div>
              </div>
              <span className="font-display text-xl font-bold">{u.green_points}</span>
            </li>
          ))}
        </ol>
      )}

      {gap !== null && <p className="chip c-sun mt-4"><b>{name}</b>, kamu belum masuk 10 besar. Butuh {gap} poin lagi.</p>}

      <section className="relative mt-16">
        <Leaf className="wig absolute -top-6 right-2 w-12" fill="var(--lime)" />
        <h2 className="font-display text-4xl font-bold">Hadiah</h2>
        <p className="mt-1 text-[var(--muted)]">
          {name ? <>Poinmu sekarang <b className="text-[var(--ink)]">{myPoints}</b>. Hadiah terbuka otomatis saat poinmu cukup.</> : 'Isi namamu di pojok atas untuk melihat hadiah yang bisa kamu buka.'}
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {REWARDS.map((r, i) => {
            const Icon = ICONS[r.icon] || Gift;
            const open = myPoints >= r.points;
            const pct = Math.min(100, Math.round((myPoints / r.points) * 100));
            return (
              <div key={r.id} className={`card relative p-5 ${open ? `c-${RCOLORS[i % 4]}` : ''}`}>
                {open && <Sparkle className="bob absolute -right-3 -top-4 w-9" />}
                <div className="flex items-start justify-between">
                  <span className="grid h-14 w-14 place-items-center rounded-2xl border-[2.5px] border-[var(--ink)] bg-white"><Icon size={26} /></span>
                  <span className="chip c-white">{r.points} poin</span>
                </div>
                <h3 className="font-display mt-3 text-2xl font-bold">{r.title}</h3>
                <p className="text-sm font-bold text-[var(--ink)]/70">{r.desc}</p>
                {open ? (
                  <button onClick={() => setClaim(r)} className="btn btn-ink mt-4 w-full"><Gift size={18} /> Klaim hadiah</button>
                ) : (
                  <div className="mt-4">
                    <div className="h-4 overflow-hidden rounded-full border-2 border-[var(--ink)] bg-white"><div className="stripes h-full bg-[var(--lime)] transition-all" style={{ width: `${pct}%` }} /></div>
                    <p className="mt-1.5 flex items-center gap-1 text-xs font-extrabold text-[var(--muted)]"><Lock size={13} /> Kurang {r.points - myPoints} poin</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {claim && (
        <>
          <Confetti count={50} />
          <div className="fixed inset-0 z-50 grid place-items-center bg-[var(--ink)]/60 p-4" onClick={() => setClaim(null)}>
            <div role="dialog" aria-modal="true" aria-label="Kode hadiah" className="card rise relative w-full max-w-sm overflow-hidden p-6 text-center" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setClaim(null)} aria-label="Tutup" className="absolute right-3 top-3 rounded-full p-1 hover:bg-[var(--bg)]"><X size={20} /></button>
              <Gift size={36} className="mx-auto" />
              <p className="font-display mt-2 text-3xl font-bold">{claim.title}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">Tunjukkan kode ini ke panitia untuk menukarnya.</p>
              <p className="font-display c-lime mt-5 rounded-2xl border-[3px] border-dashed border-[var(--ink)] py-4 text-4xl font-bold tracking-wider">{rewardCode(name, claim.id)}</p>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
