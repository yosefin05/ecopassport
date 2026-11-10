'use client';
import { useEffect, useState } from 'react';

const COLORS = ['#c8f25d', '#ffd84d', '#ffa6c1', '#8fd8f7', '#a8ebc4', '#ff7a59'];

export default function Confetti({ count = 40 }) {
  const [pieces, setPieces] = useState([]);
  useEffect(() => {
    setPieces(Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.7,
      dur: 1.8 + Math.random() * 1.6,
      size: 7 + Math.random() * 8,
      rot: Math.random() * 360,
      round: i % 3 === 0,
      color: COLORS[i % COLORS.length],
    })));
  }, [count]);
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {pieces.map((p) => (
        <span key={p.id} className="confetti" style={{
          left: `${p.left}%`, width: p.size, height: p.round ? p.size : p.size * 0.5,
          background: p.color, borderRadius: p.round ? '50%' : 2, border: '1.5px solid #0b3b2a',
          animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`, '--rot': `${p.rot}deg`,
        }} />
      ))}
    </div>
  );
}
