"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './sceneStyles.module.css';

type Scene = {
  id: number;
  startMs: number;
  endMs: number;
  text: string;
  visual: 'couple' | 'mother' | 'eyes' | 'transition' | 'baby' | 'parents' | 'fade';
};

const SCENES: Scene[] = [
  { id: 1, startMs: 0, endMs: 2000, text: 'Every journey is different?', visual: 'couple' },
  { id: 2, startMs: 2000, endMs: 4000, text: 'But some journeys test every bit of your strength.', visual: 'mother' },
  { id: 3, startMs: 4000, endMs: 7000, text: 'Sleepless nights. Fear. Prayers.', visual: 'eyes' },
  { id: 4, startMs: 7000, endMs: 9000, text: 'Yet? they never gave up.', visual: 'transition' },
  { id: 5, startMs: 9000, endMs: 12000, text: 'Because this little life is their whole world.', visual: 'baby' },
  { id: 6, startMs: 12000, endMs: 15000, text: 'Strong parents raise strong miracles.', visual: 'parents' },
  { id: 7, startMs: 15000, endMs: 17000, text: '', visual: 'fade' }
];

function useTimeline(durationMs: number, playing: boolean) {
  const [now, setNow] = useState(0);
  const raf = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) {
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = null;
      startRef.current = null;
      return;
    }

    const tick = (t: number) => {
      if (startRef.current == null) startRef.current = t;
      const elapsed = t - startRef.current;
      const clamped = Math.min(elapsed, durationMs);
      setNow(clamped);
      if (clamped < durationMs) {
        raf.current = requestAnimationFrame(tick);
      }
    };

    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [durationMs, playing]);

  return now;
}

function startLullaby() {
  const AudioCtx = typeof window !== 'undefined' ? (window.AudioContext || (window as any).webkitAudioContext) : null;
  if (!AudioCtx) return () => {};

  const ctx = new AudioCtx();
  const master = ctx.createGain();
  master.gain.value = 0.08; // gentle
  master.connect(ctx.destination);

  const bpm = 72;
  const beat = 60 / bpm; // seconds

  const notesHz = [261.63, 329.63, 392.0, 523.25]; // C E G C'

  const scheduleNote = (time: number, freq: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.3, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, time + beat * 0.95);
    osc.connect(gain);
    gain.connect(master);
    osc.start(time);
    osc.stop(time + beat);
  };

  const start = ctx.currentTime + 0.05;
  for (let bar = 0; bar < 8; bar++) {
    for (let i = 0; i < notesHz.length; i++) {
      const when = start + (bar * 4 + i) * beat;
      scheduleNote(when, notesHz[i]);
    }
  }

  return () => ctx.close();
}

export default function Page() {
  const totalMs = 17000;
  const [playing, setPlaying] = useState(false);
  const now = useTimeline(totalMs, playing);
  const stopAudioRef = useRef<null | (() => void)>(null);

  useEffect(() => {
    if (!playing && stopAudioRef.current) {
      stopAudioRef.current();
      stopAudioRef.current = null;
    }
  }, [playing]);

  const currentScene = useMemo(() => SCENES.find(s => now >= s.startMs && now < s.endMs) ?? SCENES[SCENES.length - 1], [now]);
  const progress = Math.min(now / totalMs, 1);

  const handleStart = () => {
    if (!playing) {
      setPlaying(true);
      stopAudioRef.current = startLullaby();
    }
  };

  const handleReplay = () => {
    setPlaying(false);
    setTimeout(() => setPlaying(true), 50);
    if (stopAudioRef.current) stopAudioRef.current();
    stopAudioRef.current = startLullaby();
  };

  return (
    <main className={styles.container}>
      <div className={styles.stage}>
        <Visual visual={currentScene.visual} playing={playing} />
        {currentScene.text && (
          <div className={styles.caption}>
            <p>{currentScene.text}</p>
          </div>
        )}
        {!playing && (
          <button className={styles.startButton} onClick={handleStart}>
            Play Story with Music
          </button>
        )}
        {playing && now >= totalMs && (
          <button className={styles.replayButton} onClick={handleReplay}>
            Replay
          </button>
        )}
        <div className={styles.progress}>
          <div className={styles.progressBar} style={{ transform: `scaleX(${progress})` }} />
        </div>
      </div>
      <footer className={styles.footer}>
        <span>Strong Parents | Strong Miracles</span>
      </footer>
    </main>
  );
}

function Visual({ visual, playing }: { visual: Scene['visual']; playing: boolean }) {
  return (
    <div className={styles.visual} data-visual={visual} data-playing={playing ? '1' : '0'}>
      {/* Decorative SVGs are inline for deployment simplicity */}
      {visual === 'couple' && (
        <svg className={styles.svg} viewBox="0 0 200 120" aria-hidden>
          <defs>
            <linearGradient id="g1" x1="0" x2="1">
              <stop offset="0%" stopColor="#1f2937" />
              <stop offset="100%" stopColor="#374151" />
            </linearGradient>
          </defs>
          <rect width="200" height="120" fill="url(#g1)" />
          <circle cx="70" cy="60" r="18" fill="#9CA3AF" />
          <circle cx="130" cy="60" r="18" fill="#9CA3AF" />
          <rect x="50" y="78" width="100" height="28" rx="6" fill="#6B7280" />
          <rect x="60" y="45" width="20" height="8" rx="2" fill="#D1D5DB" />
          <rect x="120" y="45" width="20" height="8" rx="2" fill="#D1D5DB" />
        </svg>
      )}
      {visual === 'mother' && (
        <svg className={styles.svg} viewBox="0 0 200 120" aria-hidden>
          <defs>
            <linearGradient id="g2" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
          <rect width="200" height="120" fill="url(#g2)" />
          <circle cx="80" cy="55" r="20" fill="#F3F4F6" />
          <ellipse cx="120" cy="70" rx="26" ry="16" fill="#FDF2F8" />
          <rect x="60" y="75" width="80" height="24" rx="10" fill="#F59E0B" opacity="0.2" />
        </svg>
      )}
      {visual === 'eyes' && (
        <svg className={styles.svg} viewBox="0 0 200 120" aria-hidden>
          <rect width="200" height="120" fill="#111827" />
          <ellipse cx="70" cy="60" rx="28" ry="14" fill="#F9FAFB" />
          <circle cx="70" cy="60" r="6" fill="#1F2937" />
          <ellipse cx="130" cy="60" rx="28" ry="14" fill="#F9FAFB" />
          <circle cx="130" cy="60" r="6" fill="#1F2937" />
        </svg>
      )}
      {visual === 'transition' && (
        <svg className={styles.svg} viewBox="0 0 200 120" aria-hidden>
          <defs>
            <linearGradient id="g3" x1="0" x2="1">
              <stop offset="0%" stopColor="#1F2937" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>
          <rect width="200" height="120" fill="url(#g3)" />
          <path d="M0,100 C60,80 140,40 200,20 L200,120 L0,120 Z" fill="#34D399" opacity="0.5" />
        </svg>
      )}
      {visual === 'baby' && (
        <svg className={styles.svg} viewBox="0 0 200 120" aria-hidden>
          <defs>
            <linearGradient id="g4" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#fde68a" />
              <stop offset="100%" stopColor="#fca5a5" />
            </linearGradient>
          </defs>
          <rect width="200" height="120" fill="url(#g4)" />
          <circle cx="100" cy="60" r="16" fill="#FDE68A" />
          <path d="M68,80 C100,68 100,68 132,80" stroke="#fff" strokeWidth="10" strokeLinecap="round" fill="none" />
        </svg>
      )}
      {visual === 'parents' && (
        <svg className={styles.svg} viewBox="0 0 200 120" aria-hidden>
          <defs>
            <linearGradient id="g5" x1="0" x2="1">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
          <rect width="200" height="120" fill="url(#g5)" />
          <circle cx="70" cy="60" r="15" fill="#F3E8FF" />
          <circle cx="130" cy="60" r="15" fill="#FCE7F3" />
          <circle cx="100" cy="75" r="10" fill="#FEF3C7" />
        </svg>
      )}
      {visual === 'fade' && (
        <svg className={styles.svg} viewBox="0 0 200 120" aria-hidden>
          <rect width="200" height="120" fill="#000" />
        </svg>
      )}
    </div>
  );
}
