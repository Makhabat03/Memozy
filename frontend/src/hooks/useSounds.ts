import { useCallback, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { ThemeName } from '../themes';

export type SoundName =
  | 'cardFlip' | 'waterDrop' | 'correct' | 'incorrect'
  | 'levelUp' | 'streakContinue' | 'deckComplete' | 'badgeEarned' | 'combo';

type Fn = (ctx: AudioContext) => void;
type Palette = Record<SoundName, Fn>;

function createAudioContext(): AudioContext {
  return new (window.AudioContext || (window as any).webkitAudioContext)();
}

// ── Low-level helpers ──────────────────────────────────────────────────────

function t(ctx: AudioContext, freq: number, dur: number, type: OscillatorType = 'sine', vol = 0.3, d = 0) {
  const o = ctx.createOscillator(); const g = ctx.createGain();
  o.connect(g); g.connect(ctx.destination);
  o.type = type;
  o.frequency.setValueAtTime(freq, ctx.currentTime + d);
  g.gain.setValueAtTime(vol, ctx.currentTime + d);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + d + dur);
  o.start(ctx.currentTime + d); o.stop(ctx.currentTime + d + dur + 0.02);
}

function sw(ctx: AudioContext, f1: number, f2: number, dur: number, type: OscillatorType = 'sine', vol = 0.3, d = 0) {
  const o = ctx.createOscillator(); const g = ctx.createGain();
  o.connect(g); g.connect(ctx.destination);
  o.type = type;
  o.frequency.setValueAtTime(f1, ctx.currentTime + d);
  o.frequency.exponentialRampToValueAtTime(f2, ctx.currentTime + d + dur);
  g.gain.setValueAtTime(vol, ctx.currentTime + d);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + d + dur);
  o.start(ctx.currentTime + d); o.stop(ctx.currentTime + d + dur + 0.02);
}

// ── Default palette (minimal) ──────────────────────────────────────────────

const defaultPalette: Palette = {
  waterDrop: (ctx) => {
    const o = ctx.createOscillator(); const g = ctx.createGain();
    const f = ctx.createBiquadFilter();
    o.connect(f); f.connect(g); g.connect(ctx.destination);
    f.type = 'bandpass'; f.Q.value = 12;
    f.frequency.setValueAtTime(1600, ctx.currentTime);
    f.frequency.exponentialRampToValueAtTime(280, ctx.currentTime + 0.18);
    o.type = 'sine';
    o.frequency.setValueAtTime(1400, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(260, ctx.currentTime + 0.18);
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.45, ctx.currentTime + 0.008);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
    o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.22);
  },
  cardFlip: (ctx) => t(ctx, 440, 0.08, 'sawtooth', 0.12),
  correct: (ctx) => t(ctx, 523.25, 0.15, 'sine', 0.3),
  incorrect: (ctx) => t(ctx, 130, 0.15, 'square', 0.18),
  combo: (ctx) => {
    t(ctx, 659.25, 0.1, 'sine', 0.25, 0);
    t(ctx, 783.99, 0.1, 'sine', 0.3, 0.08);
    t(ctx, 1046.5, 0.15, 'sine', 0.35, 0.16);
  },
  levelUp: (ctx) => {
    t(ctx, 523.25, 0.2, 'sine', 0.3, 0);
    t(ctx, 659.25, 0.2, 'sine', 0.3, 0.2);
    t(ctx, 783.99, 0.3, 'sine', 0.4, 0.4);
  },
  streakContinue: (ctx) => {
    t(ctx, 880, 0.1, 'sine', 0.2, 0);
    t(ctx, 1046.5, 0.15, 'sine', 0.25, 0.1);
    t(ctx, 1318.5, 0.2, 'sine', 0.3, 0.2);
  },
  deckComplete: (ctx) => {
    [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98].forEach((f, i) =>
      t(ctx, f, 0.25, 'sine', 0.28 + i * 0.02, i * 0.15)
    );
  },
  badgeEarned: (ctx) => {
    [783.99, 1046.5, 1318.5, 1567.98].forEach((f, i) =>
      t(ctx, f, 0.18, 'sine', 0.25, i * 0.1)
    );
  },
};

// ── Theme overrides ────────────────────────────────────────────────────────

const OVERRIDES: Partial<Record<ThemeName, Partial<Palette>>> = {
  darkFuturistic: {
    waterDrop: (ctx) => sw(ctx, 900, 200, 0.09, 'square', 0.22),
    correct: (ctx) => {
      t(ctx, 440, 0.08, 'sawtooth', 0.2, 0);
      t(ctx, 587.33, 0.08, 'sawtooth', 0.22, 0.08);
      t(ctx, 880, 0.15, 'sawtooth', 0.25, 0.16);
    },
    incorrect: (ctx) => t(ctx, 220, 0.18, 'square', 0.28),
    combo: (ctx) => sw(ctx, 200, 1400, 0.2, 'sawtooth', 0.28),
    levelUp: (ctx) => {
      [220, 330, 440, 660, 880, 1320].forEach((f, i) =>
        t(ctx, f, 0.15, 'sawtooth', 0.18 + i * 0.025, i * 0.1)
      );
    },
    deckComplete: (ctx) => {
      [220, 330, 440, 587, 880, 1174, 1760].forEach((f, i) =>
        t(ctx, f, 0.2, 'sawtooth', 0.16 + i * 0.03, i * 0.12)
      );
    },
    streakContinue: (ctx) => {
      t(ctx, 660, 0.1, 'square', 0.2, 0);
      t(ctx, 880, 0.12, 'square', 0.22, 0.09);
      t(ctx, 1320, 0.15, 'square', 0.25, 0.18);
    },
  },

  cosmic: {
    waterDrop: (ctx) => {
      sw(ctx, 1200, 300, 0.28, 'sine', 0.22);
      sw(ctx, 1207, 307, 0.28, 'sine', 0.16); // chorus via detuned pair
    },
    correct: (ctx) => {
      t(ctx, 1046.5, 0.35, 'sine', 0.2, 0);
      t(ctx, 1318.5, 0.35, 'sine', 0.22, 0.1);
      t(ctx, 1567.98, 0.45, 'sine', 0.25, 0.2);
    },
    incorrect: (ctx) => {
      t(ctx, 55, 0.35, 'sine', 0.3);
      t(ctx, 58, 0.35, 'sine', 0.25);
    },
    combo: (ctx) => {
      sw(ctx, 400, 2200, 0.3, 'sine', 0.25);
      sw(ctx, 403, 2205, 0.3, 'sine', 0.18);
    },
    levelUp: (ctx) => {
      [261.63, 329.63, 392, 523.25, 659.25, 1046.5].forEach((f, i) =>
        t(ctx, f, 0.38, 'sine', 0.2 + i * 0.03, i * 0.18)
      );
    },
    deckComplete: (ctx) => {
      [261.63, 329.63, 392, 523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) =>
        t(ctx, f, 0.42, 'sine', 0.18 + i * 0.025, i * 0.15)
      );
    },
    streakContinue: (ctx) => {
      t(ctx, 659.25, 0.2, 'sine', 0.2, 0);
      t(ctx, 783.99, 0.22, 'sine', 0.22, 0.15);
      t(ctx, 1046.5, 0.28, 'sine', 0.25, 0.3);
    },
  },

  nature: {
    correct: (ctx) => {
      t(ctx, 523.25, 0.22, 'triangle', 0.28, 0);
      t(ctx, 659.25, 0.22, 'triangle', 0.3, 0.15);
    },
    incorrect: (ctx) => t(ctx, 150, 0.22, 'triangle', 0.22),
    combo: (ctx) => {
      [1318.5, 1567.98, 1760, 2093].forEach((f, i) =>
        t(ctx, f, 0.1, 'sine', 0.2, i * 0.06)
      );
    },
    levelUp: (ctx) => {
      [392, 523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
        t(ctx, f, 0.28, 'triangle', 0.25, i * 0.15)
      );
    },
    deckComplete: (ctx) => {
      [392, 523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) =>
        t(ctx, f, 0.32, 'triangle', 0.22 + i * 0.02, i * 0.14)
      );
    },
    streakContinue: (ctx) => {
      [659.25, 783.99, 1046.5].forEach((f, i) =>
        t(ctx, f, 0.15, 'triangle', 0.2, i * 0.1)
      );
    },
  },

  anime: {
    waterDrop: (ctx) => sw(ctx, 1800, 600, 0.1, 'sine', 0.32),
    correct: (ctx) => {
      t(ctx, 659.25, 0.08, 'sine', 0.3, 0);
      t(ctx, 783.99, 0.08, 'sine', 0.32, 0.07);
      t(ctx, 1046.5, 0.13, 'sine', 0.36, 0.14);
    },
    incorrect: (ctx) => sw(ctx, 500, 120, 0.18, 'sine', 0.28),
    combo: (ctx) => {
      [880, 1046.5, 1318.5, 1760].forEach((f, i) =>
        t(ctx, f, 0.09, 'sine', 0.28, i * 0.06)
      );
    },
    levelUp: (ctx) => {
      [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) =>
        t(ctx, f, 0.15, 'sine', 0.3, i * 0.1)
      );
    },
    deckComplete: (ctx) => {
      [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98, 2093].forEach((f, i) =>
        t(ctx, f, 0.18, 'sine', 0.3, i * 0.1)
      );
    },
    streakContinue: (ctx) => {
      t(ctx, 880, 0.1, 'sine', 0.25, 0);
      t(ctx, 1046.5, 0.12, 'sine', 0.28, 0.08);
      t(ctx, 1318.5, 0.16, 'sine', 0.32, 0.16);
    },
  },

  ocean: {
    waterDrop: (ctx) => {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      const f = ctx.createBiquadFilter();
      o.connect(f); f.connect(g); g.connect(ctx.destination);
      f.type = 'bandpass'; f.Q.value = 8;
      f.frequency.setValueAtTime(400, ctx.currentTime);
      f.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.38);
      o.type = 'sine';
      o.frequency.setValueAtTime(350, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.38);
      g.gain.setValueAtTime(0, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.42);
      o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.44);
    },
    correct: (ctx) => {
      sw(ctx, 200, 600, 0.13, 'sine', 0.25, 0);
      sw(ctx, 300, 900, 0.13, 'sine', 0.22, 0.09);
      sw(ctx, 400, 1200, 0.16, 'sine', 0.2, 0.18);
    },
    incorrect: (ctx) => t(ctx, 80, 0.28, 'sine', 0.32),
    combo: (ctx) => {
      [200, 300, 450, 680, 1000].forEach((f, i) =>
        sw(ctx, f, f * 2.6, 0.12, 'sine', 0.2, i * 0.07)
      );
    },
    levelUp: (ctx) => {
      [130.81, 196, 261.63, 392, 523.25, 784].forEach((f, i) =>
        sw(ctx, f * 0.85, f * 1.15, 0.28, 'sine', 0.22, i * 0.16)
      );
    },
    deckComplete: (ctx) => {
      [130.81, 196, 261.63, 392, 523.25, 784, 1046.5].forEach((f, i) =>
        sw(ctx, f * 0.9, f * 1.1, 0.32, 'sine', 0.2 + i * 0.02, i * 0.16)
      );
    },
    streakContinue: (ctx) => {
      [196, 261.63, 392].forEach((f, i) =>
        sw(ctx, f, f * 1.5, 0.18, 'sine', 0.22, i * 0.12)
      );
    },
  },

  cute: {
    waterDrop: (ctx) => sw(ctx, 1500, 580, 0.13, 'sine', 0.32),
    correct: (ctx) => {
      t(ctx, 880, 0.09, 'sine', 0.3, 0);
      t(ctx, 1046.5, 0.09, 'sine', 0.32, 0.08);
      t(ctx, 1318.5, 0.16, 'sine', 0.36, 0.16);
    },
    incorrect: (ctx) => sw(ctx, 420, 200, 0.2, 'sine', 0.25),
    combo: (ctx) => {
      [1046.5, 1318.5, 1567.98, 2093].forEach((f, i) =>
        t(ctx, f, 0.09, 'sine', 0.28, i * 0.07)
      );
    },
    levelUp: (ctx) => {
      [659.25, 783.99, 1046.5, 1318.5, 1567.98].forEach((f, i) =>
        t(ctx, f, 0.2, 'sine', 0.3, i * 0.12)
      );
    },
    deckComplete: (ctx) => {
      [659.25, 783.99, 1046.5, 1318.5, 1567.98, 2093, 2637].forEach((f, i) =>
        t(ctx, f, 0.18, 'sine', 0.3, i * 0.1)
      );
    },
    streakContinue: (ctx) => {
      t(ctx, 1046.5, 0.1, 'sine', 0.25, 0);
      t(ctx, 1318.5, 0.12, 'sine', 0.28, 0.09);
      t(ctx, 1567.98, 0.16, 'sine', 0.32, 0.18);
    },
  },
};

function getPalette(theme: ThemeName): Palette {
  return { ...defaultPalette, ...OVERRIDES[theme] };
}

// ── Hook ───────────────────────────────────────────────────────────────────

export function useSounds() {
  const { themeName } = useTheme();
  const ctxRef = useRef<AudioContext | null>(null);
  const themeRef = useRef<ThemeName>(themeName);

  useEffect(() => { themeRef.current = themeName; }, [themeName]);

  const play = useCallback((name: SoundName) => {
    try {
      if (!ctxRef.current || ctxRef.current.state === 'closed') {
        ctxRef.current = createAudioContext();
      }
      const ctx = ctxRef.current;
      const resume = ctx.state === 'suspended' ? ctx.resume() : Promise.resolve();
      resume.then(() => {
        const fn = getPalette(themeRef.current)[name];
        if (fn) fn(ctx);
      });
    } catch {
      // Audio not available
    }
  }, []);

  return { play };
}
