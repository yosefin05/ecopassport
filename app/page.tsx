'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Camera,
  Trophy,
  Crown,
  CupSoda,
  Recycle,
  Bike,
  ShoppingBag,
  Lightbulb,
  ImageUp,
  ScanSearch,
  Stamp as StampIcon,
  Gift,
} from 'lucide-react';

import Stamp from '@/components/Stamp';
import CountUp from '@/components/CountUp';
import {
  Leaf,
  Sparkle,
  Cloud,
  Blob,
  Squiggle,
  Earth,
} from '@/components/Ornaments';

import { getLeaderboard } from '@/lib/api';

type LeaderboardUser = {
  name: string;
  green_points: number;
};

type StickerProps = {
  icon: React.ElementType;
  color: string;
  className?: string;
  delay?: number;
};

const STEPS = [
  {
    icon: ImageUp,
    color: 'mint',
    title: 'Foto aksimu',
    text: 'Ambil foto saat kamu membawa tumbler, memilah sampah, atau bersepeda.',
  },
  {
    icon: ScanSearch,
    color: 'sky',
    title: 'AI memeriksa',
    text: 'Gemini mengenali aksi dari foto. Backend memberi poin tetap dan estimasi karbon berbasis benchmark.',
  },
  {
    icon: StampIcon,
    color: 'pink',
    title: 'Dapat cap dan poin',
    text: 'Setiap aksi valid dicap di paspormu dan menaikkan peringkatmu.',
  },
];

const ACTIONS = [
  [CupSoda, 'Bawa tumbler', 'pink'],
  [Recycle, 'Pilah sampah', 'lime'],
  [Bike, 'Bersepeda', 'sky'],
  [ShoppingBag, 'Tas belanja kain', 'sun'],
  [Lightbulb, 'Hemat listrik', 'mint'],
] as const;

const TICKER = [
  'Bawa tumbler',
  'Pilah sampah',
  'Naik sepeda',
  'Tas kain',
  'Matikan lampu',
  'Tanam pohon',
  'Jalan kaki',
];

function Sticker({
  icon: Icon,
  color,
  className = '',
  delay = 0,
}: StickerProps) {
  return (
    <span
      className={`bob absolute grid h-16 w-16 place-items-center rounded-full border-[2.5px] border-[var(--ink)] shadow-[3px_3px_0_var(--ink)] ${className}`}
      style={{
        background: `var(--${color})`,
        animationDelay: `${delay}s`,
      }}
    >
      <Icon size={28} />
    </span>
  );
}

export default function Home() {
  const [board, setBoard] = useState<LeaderboardUser[] | null>(null);

  useEffect(() => {
    getLeaderboard()
      .then((response) => {
        if (response?.success && Array.isArray(response.data)) {
          setBoard(response.data);
        } else {
          setBoard([]);
        }
      })
      .catch(() => {
        setBoard([]);
      });
  }, []);

  const leader = board?.[0];

  const total =
    board?.reduce((sum, user) => sum + (user.green_points || 0), 0) ?? 0;

  return (
    <main className="mx-auto max-w-6xl px-4">
      {/* HERO */}
      <section className="relative grid items-center gap-8 py-10 md:grid-cols-[1.05fr_.95fr] md:py-16">
        <Cloud className="bob absolute left-[42%] top-0 hidden w-28 md:block" />

        <Sparkle
          className="wig absolute left-0 top-24 hidden w-8 md:block"
          fill="var(--pink)"
        />

        <div className="relative">
          <span className="chip c-pink -rotate-2">
            <Sparkle className="w-4" fill="#fff" />
            Pelacak kebiasaan hijau berbasis AI
          </span>

          <h1 className="font-display mt-5 text-[2.8rem] font-bold leading-[1.02] md:text-[4.4rem]">
            Setiap aksi hijau layak dapat cap di paspormu.
          </h1>

          <Squiggle className="mt-3 h-3 w-40" />

          <p className="mt-5 max-w-md text-lg text-[var(--muted)]">
            Foto aksi ramah lingkunganmu. AI mengenali aksinya, backend menghitung poin
            dan estimasi karbon berbasis benchmark, lalu kamu naik peringkat.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/upload" className="btn btn-ink">
              <Camera size={20} />
              Scan aksi pertamamu
            </Link>

            <Link href="/leaderboard" className="btn c-sun">
              <Trophy size={20} />
              Lihat peringkat
            </Link>
          </div>
        </div>

        <div className="relative mx-auto h-[440px] w-full max-w-[460px]">
          <Blob
            className="absolute inset-0 h-full w-full"
            fill="var(--mint)"
          />

          <div className="absolute bottom-10 left-16 right-2 top-14 rotate-[5deg] rounded-[1.75rem] border-[2.5px] border-[var(--ink)] bg-[var(--ink)] shadow-[6px_6px_0_var(--lime)]">
            <p className="font-display absolute bottom-5 right-5 text-right text-xl font-bold leading-tight text-[var(--lime)]">
              Paspor
              <br />
              Hijau
            </p>
          </div>

          <div className="card absolute bottom-14 left-2 right-14 top-8 -rotate-3 p-4">
            <div className="flex items-center justify-between text-sm font-extrabold">
              <span>Halaman 1</span>
              <span className="chip c-lime">Terverifikasi AI</span>
            </div>

            <div className="ruled relative mt-3 h-[calc(100%-2.6rem)] overflow-hidden rounded-xl border-2 border-dashed border-[var(--ink)]/40">
              <Stamp
                title="Tumbler"
                value="+10"
                sub="Tumbler"
                size={78}
                rotate={10}
                className="absolute left-3 top-3 opacity-45"
              />

              <Stamp
                title="Sepeda"
                value="+15"
                sub="Sepeda"
                size={78}
                rotate={-14}
                className="absolute right-3 top-8 opacity-45"
              />

              <div className="absolute inset-0 grid place-items-center pt-14">
                <Stamp
                  title="Terverifikasi"
                  value="+10"
                  sub="poin hijau"
                  size={150}
                  animate
                  delay={500}
                />
              </div>
            </div>
          </div>

          <Sticker
            icon={CupSoda}
            color="pink"
            className="-right-1 top-2"
          />

          <Sticker
            icon={Bike}
            color="sky"
            className="-left-3 bottom-16"
          />

          <Sticker
            icon={Recycle}
            color="sun"
            className="-right-3 bottom-24"
            delay={2}
          />

          <Leaf
            className="wig absolute bottom-2 left-24 w-12"
            fill="var(--lime)"
          />

          <Sparkle className="bob absolute left-6 top-0 w-9" />

          <Sparkle
            className="wig absolute right-16 top-0 w-6"
            fill="var(--pink)"
          />
        </div>
      </section>

      {/* PITA TEKS BERJALAN */}
      <div
        className="relative -mx-4 my-6 -rotate-1 overflow-hidden border-y-[2.5px] border-[var(--ink)] bg-[var(--ink)] py-3 text-[var(--lime)]"
        aria-hidden="true"
      >
        <div className="marquee font-display flex w-max text-2xl font-semibold">
          {[0, 1].map((k) => (
            <div key={k} className="flex shrink-0 items-center">
              {TICKER.map((text) => (
                <span
                  key={`${text}-${k}`}
                  className="flex items-center gap-6 pr-6"
                >
                  {text}
                  <Sparkle
                    className="w-5"
                    fill="var(--lime)"
                    stroke="var(--lime)"
                  />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* DATA HIDUP */}
      <section
        aria-label="Statistik komunitas"
        className="mt-10 grid gap-5 sm:grid-cols-2"
      >
        {board === null ? (
          <div className="card h-28 animate-pulse sm:col-span-2" />
        ) : board.length === 0 || !leader ? (
          <div className="card c-sun p-6 sm:col-span-2">
            <p className="font-display text-2xl font-bold">
              Papan peringkat masih kosong. Jadilah yang pertama mendapat cap.
            </p>
          </div>
        ) : (
          <>
            <div className="card c-sun relative flex items-center gap-4 overflow-hidden p-5">
              <span className="bob grid h-14 w-14 shrink-0 place-items-center rounded-full border-[2.5px] border-[var(--ink)] bg-white">
                <Crown size={26} />
              </span>

              <div className="min-w-0">
                <p className="text-sm font-extrabold">Sedang memimpin</p>

                <p className="font-display truncate text-2xl font-bold">
                  {leader.name}
                </p>

                <p className="font-extrabold">
                  {leader.green_points} poin hijau
                </p>
              </div>

              <Sparkle
                className="absolute -right-2 -top-2 w-12"
                fill="#fff"
              />
            </div>

            <div className="card c-sky relative overflow-hidden p-5">
              <p className="text-sm font-extrabold">
                Poin hijau dari 10 pemain teratas
              </p>

              <p className="font-display text-5xl font-bold">
                <CountUp value={total} />
              </p>

              <Leaf
                className="wig absolute -bottom-2 right-4 w-14"
                fill="var(--lime)"
              />
            </div>
          </>
        )}
      </section>

      {/* CARA KERJA */}
      <section className="relative py-16">
        <h2 className="font-display text-4xl font-bold md:text-5xl">
          Tiga langkah, satu cap.
        </h2>

        <Squiggle className="mt-2 h-3 w-32" />

        <ol className="mt-12 grid gap-8 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, color, title, text }, index) => (
            <li
              key={title}
              className={`card c-${color} relative p-6 pt-8 ${
                index === 1 ? 'md:translate-y-6' : ''
              }`}
            >
              <span className="font-display absolute -left-3 -top-5 grid h-12 w-12 place-items-center rounded-full border-[2.5px] border-[var(--ink)] bg-white text-2xl font-bold shadow-[3px_3px_0_var(--ink)]">
                {index + 1}
              </span>

              <Icon size={44} strokeWidth={2.2} />

              <h3 className="font-display mt-4 text-2xl font-bold">
                {title}
              </h3>

              <p className="mt-1 font-bold text-[var(--ink)]/75">
                {text}
              </p>

              <Leaf
                className="absolute -bottom-3 -right-3 w-12 rotate-12"
                fill="#fff"
              />
            </li>
          ))}
        </ol>

        <div className="mt-16">
          <p className="font-display text-2xl font-bold">
            Aksi yang bisa kamu foto
          </p>

          <ul className="mt-4 flex flex-wrap gap-3">
            {ACTIONS.map(([Icon, label, color], index) => (
              <li
                key={label}
                className={`chip c-${color} px-4 py-2 text-base ${
                  index % 2 ? 'rotate-2' : '-rotate-2'
                }`}
              >
                <Icon size={18} />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="card c-lime relative overflow-hidden p-8 md:p-12">
        <div className="relative z-10 max-w-xl">
          <h2 className="font-display text-3xl font-bold md:text-5xl">
            Kumpulkan poin, buka hadiah, kalahkan pemimpin papan.
          </h2>

          <p className="mt-3 flex items-center gap-2 font-bold">
            <Gift size={18} />
            Ada empat tingkat hadiah yang terbuka seiring poinmu naik.
          </p>

          <Link href="/upload" className="btn btn-ink mt-6">
            <Camera size={20} />
            Mulai scan sekarang
          </Link>
        </div>

        <Earth
          className="turn absolute -bottom-16 -right-10 w-64 opacity-90 md:-right-6 md:w-80"
        />

        <Sparkle className="bob absolute right-40 top-6 hidden w-10 md:block" />

        <Sparkle
          className="wig absolute bottom-8 right-72 hidden w-6 md:block"
          fill="var(--pink)"
        />
      </section>
    </main>
  );
}