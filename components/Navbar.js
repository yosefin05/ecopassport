'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Leaf, Camera, Trophy, BookOpen } from 'lucide-react';
import { useUser } from './UserProvider';
import Avatar from './Avatar';

const links = [
  { href: '/', label: 'Beranda', icon: Leaf },
  { href: '/upload', label: 'Scan', icon: Camera },
  { href: '/leaderboard', label: 'Peringkat', icon: Trophy },
  { href: '/profile', label: 'Paspor', icon: BookOpen },
];

export default function Navbar() {
  const path = usePathname();
  const { name, openModal } = useUser();

  return (
    <>
      <header className="sticky top-3 z-40 px-3 pt-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 rounded-full border-[2.5px] border-[var(--ink)] bg-white px-3 py-2 shadow-[4px_4px_0_var(--ink)]">
          <Link href="/" className="font-display flex items-center gap-2 text-xl font-bold">
            <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-[var(--ink)] bg-[var(--lime)]"><Leaf size={18} /></span>
            EcoPassport<span className="hidden sm:inline">&nbsp;AI</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Navigasi utama">
            {links.map(({ href, label }) => (
              <Link key={href} href={href} className={`rounded-full border-2 px-4 py-1.5 text-sm font-extrabold transition ${path === href ? 'border-[var(--ink)] bg-[var(--lime)]' : 'border-transparent hover:bg-[var(--bg)]'}`}>
                {label}
              </Link>
            ))}
          </nav>
          <button onClick={openModal} className="flex items-center gap-2 rounded-full border-2 border-[var(--ink)] bg-[var(--bg)] py-0.5 pl-0.5 pr-3 text-sm font-extrabold">
            <Avatar name={name || '?'} size={30} />
            {name || 'Isi namamu'}
          </button>
        </div>
      </header>

      <nav aria-label="Navigasi bawah" className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-4 items-end rounded-[2rem] border-[2.5px] border-[var(--ink)] bg-white px-2 pb-1.5 pt-2 shadow-[4px_4px_0_var(--ink)] md:hidden">
        {links.map(({ href, label, icon: Icon }) => {
          const active = path === href;
          const scan = href === '/upload';
          return (
            <Link key={href} href={href} className="flex flex-col items-center gap-0.5 text-[11px] font-extrabold">
              <span className={`grid place-items-center rounded-full ${scan ? '-mt-8 h-14 w-14 border-[2.5px] border-[var(--ink)] bg-[var(--sun)] shadow-[3px_3px_0_var(--ink)]' : `h-9 w-9 ${active ? 'border-2 border-[var(--ink)] bg-[var(--lime)]' : ''}`}`}>
                <Icon size={scan ? 24 : 18} />
              </span>
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
