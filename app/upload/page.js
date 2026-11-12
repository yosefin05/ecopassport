'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Camera, ImagePlus, RotateCcw, Trophy, AlertTriangle, X, Leaf as LeafIcon, CloudOff, Cloud, Car } from 'lucide-react';
import Stamp from '@/components/Stamp';
import Confetti from '@/components/Confetti';
import { Leaf, Sparkle, Earth } from '@/components/Ornaments';
import { useUser } from '@/components/UserProvider';
import { scanImage } from '@/lib/api';
import { compressImage, kmEquivalent } from '@/lib/eco';

const STAGES = [
  'Mengunggah fotomu…',
  'Gemini sedang melihat fotomu…',
  'Menghitung karbon yang kamu hemat…',
  'Menyiapkan capmu…',
];
const TIPS = [
  ['Objek aksi terlihat jelas di tengah foto', 'mint'],
  ['Cahaya cukup, foto tidak buram', 'sun'],
  ['Satu aksi per foto', 'pink'],
];
const DUPLICATE_PHOTO_MESSAGE = 'Foto ini sudah pernah digunakan untuk mencatat aktivitas. Gunakan foto aktivitas lain yang belum pernah dikirim.';

export default function UploadPage() {
  const { name, setName } = useUser();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | success | rejected
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [stage, setStage] = useState(0);
  const [drag, setDrag] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const camRef = useRef(null);
  const galRef = useRef(null);

  useEffect(() => {
    if (status !== 'loading') return;
    setStage(0);
    const t = setInterval(() => setStage((s) => Math.min(s + 1, STAGES.length - 1)), 1800);
    return () => clearInterval(t);
  }, [status]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  function pick(f) {
    if (!f) return;
    if (!f.type.startsWith('image/')) { setError('File harus berupa gambar (JPG, PNG, atau WEBP).'); return; }
    setError(''); setFile(f); setPreview(URL.createObjectURL(f));
  }
  function reset() { setFile(null); setPreview(null); setResult(null); setError(''); setStatus('idle'); }

  async function submit() {
    const user = (name || nameInput).trim();
    if (!user) { setError('Isi namamu dulu supaya poinnya tercatat.'); return; }
    if (!name) setName(user);
    setError(''); setStatus('loading');
    try {
      const small = await compressImage(file);
      const json = await scanImage(small, user);
      if (json.success) { setResult(json); setStatus('success'); }
      else if (json.httpStatus === 409) { setError(DUPLICATE_PHOTO_MESSAGE); setStatus('idle'); }
      else if (json.is_valid === false) { setResult(json); setStatus('rejected'); }
      else { setError(json.message || 'Terjadi kesalahan di server.'); setStatus('idle'); }
    } catch {
      setError('Tidak bisa terhubung ke server. Periksa koneksimu, lalu kirim ulang.');
      setStatus('idle');
    }
  }

  const carbon = Number(result?.carbon_saved || 0);

  return (
    <main className="relative mx-auto max-w-2xl px-4 py-8 md:py-12">
      <Sparkle className="bob absolute right-6 top-4 w-9" />
      <Leaf className="wig absolute left-0 top-24 hidden w-10 md:block" fill="var(--lime)" />
      <h1 className="font-display text-4xl font-bold md:text-5xl">Scan aksi hijaumu</h1>
      <p className="mt-2 text-[var(--muted)]">Foto satu aksi ramah lingkungan. AI akan memeriksanya dalam beberapa detik.</p>

      {status === 'idle' && (
        <div className="card rise mt-6 p-5">
          {error && (
            <div role="alert" className="shake mb-4 flex items-start gap-3 rounded-2xl border-2 border-[var(--ink)] bg-[#ffd2c7] p-4">
              <CloudOff size={20} className="mt-0.5 shrink-0" /><p className="font-extrabold">{error}</p>
            </div>
          )}
          {!preview ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files?.[0]); }}
              className={`relative grid place-items-center overflow-hidden rounded-2xl border-[3px] border-dashed border-[var(--ink)] p-8 text-center transition ${drag ? 'c-lime' : 'c-mint'}`}
            >
              <Earth className="turn w-24" />
              <p className="font-display mt-4 text-2xl font-bold">Tarik foto ke sini</p>
              <p className="text-sm font-bold text-[var(--ink)]/70">atau pilih dengan tombol di bawah</p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <button onClick={() => camRef.current?.click()} className="btn btn-ink"><Camera size={20} /> Ambil foto</button>
                <button onClick={() => galRef.current?.click()} className="btn"><ImagePlus size={20} /> Pilih dari galeri</button>
              </div>
              <ul className="mt-6 flex flex-wrap justify-center gap-2">
                {TIPS.map(([t, c]) => <li key={t} className={`chip c-${c} text-xs`}>{t}</li>)}
              </ul>
            </div>
          ) : (
            <div>
              <div className="relative overflow-hidden rounded-2xl border-[2.5px] border-[var(--ink)] bg-[var(--bg)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Foto aksi yang akan dikirim" className="max-h-[420px] w-full object-contain" />
                <button onClick={reset} aria-label="Hapus foto" className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full border-2 border-[var(--ink)] bg-white"><X size={18} /></button>
              </div>
              {!name && (
                <label className="mt-4 block">
                  <span className="text-sm font-extrabold">Namamu untuk papan peringkat</span>
                  <input value={nameInput} onChange={(e) => setNameInput(e.target.value)} maxLength={24} placeholder="Contoh: Viska" className="field mt-1" />
                </label>
              )}
              <button onClick={submit} className="btn btn-ink mt-5 w-full"><LeafIcon size={20} /> Kirim ke AI</button>
            </div>
          )}
          <input ref={camRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => pick(e.target.files?.[0])} />
          <input ref={galRef} type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files?.[0])} />
        </div>
      )}

      {status === 'loading' && (
        <div className="card rise mt-6 p-5" aria-busy="true">
          <div className="relative overflow-hidden rounded-2xl border-[2.5px] border-[var(--ink)] bg-[var(--ink)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="" className="max-h-[420px] w-full object-contain opacity-60" />
            <div className="beam" />
          </div>
          <div className="dots mt-6 text-center" aria-hidden="true"><span /><span /><span /></div>
          <p aria-live="polite" className="font-display mt-2 text-center text-2xl font-bold">{STAGES[stage]}</p>
          <p className="mt-1 text-center text-sm text-[var(--muted)]">Biasanya tidak sampai 10 detik.</p>
        </div>
      )}

      {status === 'success' && result && (
        <>
          <Confetti />
          <div className="card rise mt-6 overflow-hidden">
            <div className="c-mint relative flex justify-center border-b-[2.5px] border-[var(--ink)] py-10">
              <Sparkle className="bob absolute left-8 top-6 w-9" />
              <Sparkle className="wig absolute right-10 top-10 w-6" fill="var(--pink)" />
              <Leaf className="wig absolute bottom-4 left-12 w-10" fill="var(--lime)" />
              <Leaf className="bob absolute bottom-6 right-10 w-9 -scale-x-100" fill="#fff" />
              <Stamp title="Terverifikasi" value={`+${result.score}`} sub="poin hijau" size={190} animate />
            </div>
            <div className="p-6 text-center">
              <h2 className="font-display text-3xl font-bold">{result.action_title}</h2>
              <p className="mx-auto mt-2 max-w-md text-[var(--muted)]">{result.message}</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border-[2.5px] border-[var(--ink)] bg-[var(--pink)] p-4 text-left">
                  <p className="flex items-center gap-1 text-sm font-extrabold"><Cloud size={16} /> Karbon dihemat</p>
                  <p className="font-display text-3xl font-bold">{carbon.toFixed(2)} kg</p>
                </div>
                <div className="rounded-2xl border-[2.5px] border-[var(--ink)] bg-[var(--sky)] p-4 text-left">
                  <p className="flex items-center gap-1 text-sm font-extrabold"><Car size={16} /> Setara kira-kira</p>
                  <p className="font-display text-3xl font-bold">{kmEquivalent(carbon)} km</p>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button onClick={reset} className="btn btn-ink"><Camera size={20} /> Scan aksi lain</button>
                <Link href="/leaderboard" className="btn c-sun"><Trophy size={20} /> Lihat peringkat</Link>
              </div>
            </div>
          </div>
        </>
      )}

      {status === 'rejected' && result && (
        <div className="card rise mt-6 overflow-hidden">
          <div className="flex justify-center border-b-[2.5px] border-[var(--ink)] bg-[#ffd2c7] py-10">
            <div className="shake"><Stamp title="Belum lolos" value="0" sub="poin" tone="no" size={170} animate /></div>
          </div>
          <div className="p-6 text-center">
            <h2 className="font-display text-3xl font-bold">Fotonya belum terbaca sebagai aksi hijau</h2>
            <p className="mx-auto mt-2 max-w-md text-[var(--muted)]">{result.message}</p>
            <ul className="mt-5 flex flex-wrap justify-center gap-2">
              {TIPS.map(([t, c]) => <li key={t} className={`chip c-${c} text-xs`}><AlertTriangle size={14} /> {t}</li>)}
            </ul>
            <button onClick={reset} className="btn btn-ink mt-6"><RotateCcw size={20} /> Coba foto lain</button>
          </div>
        </div>
      )}
    </main>
  );
}
