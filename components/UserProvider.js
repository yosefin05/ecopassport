'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Leaf, Sparkle } from './Ornaments';

const Ctx = createContext(null);
export const useUser = () => useContext(Ctx);
const KEY = 'ecopassport_name';

export default function UserProvider({ children }) {
  const [name, setNameState] = useState('');
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try { setNameState(localStorage.getItem(KEY) || ''); } catch {}
    setReady(true);
  }, []);

  const setName = (n) => {
    const v = n.trim().slice(0, 24);
    setNameState(v);
    try { localStorage.setItem(KEY, v); } catch {}
  };

  return (
    <Ctx.Provider value={{ name, ready, setName, openModal: () => setOpen(true) }}>
      {children}
      {open && <NameModal current={name} onSave={(n) => { setName(n); setOpen(false); }} onClose={() => setOpen(false)} />}
    </Ctx.Provider>
  );
}

function NameModal({ current, onSave, onClose }) {
  const [v, setV] = useState(current);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[var(--ink)]/60 p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Nama pemain" className="card rise relative w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <Sparkle className="bob absolute -right-4 -top-5 w-10" />
        <Leaf className="wig absolute -left-5 -top-4 w-10" fill="var(--lime)" />
        <button onClick={onClose} aria-label="Tutup" className="absolute right-3 top-3 rounded-full p-1 hover:bg-[var(--bg)]"><X size={20} /></button>
        <h2 className="font-display text-3xl font-bold">Siapa namamu?</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">Nama ini dipakai untuk mencatat poin dan tampil di papan peringkat.</p>
        <input autoFocus value={v} maxLength={24} onChange={(e) => setV(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && v.trim() && onSave(v)} placeholder="Contoh: Viska" className="field mt-4 text-lg" />
        <button onClick={() => onSave(v)} disabled={!v.trim()} className="btn c-lime mt-4 w-full">Simpan nama</button>
      </div>
    </div>
  );
}
