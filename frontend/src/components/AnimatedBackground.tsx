import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

const AnimatedBackground: React.FC = () => {
  const { themeName } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let particles: any[] = [];
    let W = window.innerWidth;
    let H = window.innerHeight;
    let t = 0;

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
      init();
    };

    // ── DARK FUTURISTIC ── neural network with 3D perspective ──
    const initDarkFuturistic = () => {
      particles = Array.from({ length: 70 }, () => ({
        x: (Math.random() - 0.5) * 1400,
        y: (Math.random() - 0.5) * 900,
        z: Math.random() * 600 + 100,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        vz: (Math.random() - 0.5) * 0.3,
      }));
    };

    const drawDarkFuturistic = () => {
      ctx.fillStyle = '#050510';
      ctx.fillRect(0, 0, W, H);

      // Subtle grid
      ctx.strokeStyle = 'rgba(0,229,255,0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

      const FOV = 500;
      const cx = W / 2, cy = H / 2;

      const proj = particles.map(p => {
        p.x += p.vx; p.y += p.vy; p.z += p.vz;
        if (p.z < 50) p.vz = Math.abs(p.vz);
        if (p.z > 800) p.vz = -Math.abs(p.vz);
        if (Math.abs(p.x) > 800) p.vx *= -1;
        if (Math.abs(p.y) > 600) p.vy *= -1;
        const scale = FOV / (p.z + FOV);
        return { px: cx + p.x * scale, py: cy + p.y * scale, scale };
      });

      // Lines between close nodes
      for (let i = 0; i < proj.length; i++) {
        for (let j = i + 1; j < proj.length; j++) {
          const dx = proj[i].px - proj[j].px;
          const dy = proj[i].py - proj[j].py;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 140) {
            const a = (1 - d / 140) * 0.35;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0,229,255,${a})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(proj[i].px, proj[i].py);
            ctx.lineTo(proj[j].px, proj[j].py);
            ctx.stroke();
          }
        }
      }

      // Nodes
      proj.forEach(({ px, py, scale }) => {
        const r = Math.max(0.5, scale * 3);
        // Glow
        const grd = ctx.createRadialGradient(px, py, 0, px, py, r * 5);
        grd.addColorStop(0, `rgba(0,229,255,${0.2 * scale})`);
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath(); ctx.arc(px, py, r * 5, 0, Math.PI * 2);
        ctx.fillStyle = grd; ctx.fill();
        // Core
        ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,229,255,${0.5 + scale * 0.4})`; ctx.fill();
      });
    };

    // ── COSMIC STARFIELD ── warp-speed stars ──
    const initCosmic = () => {
      particles = Array.from({ length: 220 }, () => ({
        x: (Math.random() - 0.5) * W * 4,
        y: (Math.random() - 0.5) * H * 4,
        z: Math.random() * 1200,
        pz: 0,
        hue: Math.random() > 0.7 ? 280 : Math.random() > 0.5 ? 260 : 0,
      }));
      particles.forEach(p => { p.pz = p.z; });
    };

    const drawCosmic = () => {
      ctx.fillStyle = 'rgba(3,0,28,0.25)';
      ctx.fillRect(0, 0, W, H);

      const cx = W / 2, cy = H / 2;
      particles.forEach(p => {
        p.pz = p.z;
        p.z -= 4;
        if (p.z <= 1) { p.x = (Math.random() - 0.5) * W * 4; p.y = (Math.random() - 0.5) * H * 4; p.z = 1200; p.pz = p.z; }

        const sx = (p.x / p.z) * W + cx;
        const sy = (p.y / p.z) * H + cy;
        const px = (p.x / p.pz) * W + cx;
        const py = (p.y / p.pz) * H + cy;

        if (sx < 0 || sx > W || sy < 0 || sy > H) return;
        const size = Math.max(0.3, (1 - p.z / 1200) * 3);
        const bright = 1 - p.z / 1200;

        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.lineWidth = size;
        ctx.strokeStyle = p.hue === 280 ? `rgba(224,64,251,${bright * 0.8})`
          : p.hue === 260 ? `rgba(124,77,255,${bright * 0.7})`
          : `rgba(255,255,255,${bright})`;
        ctx.stroke();
      });
    };

    // ── NATURE ── 3D falling leaves ──
    const initNature = () => {
      const colors = ['#40916c', '#52b788', '#74c69d', '#95d5b2', '#d4a017', '#588157', '#a7c957'];
      particles = Array.from({ length: 50 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        z: Math.random(),
        vy: 0.4 + Math.random() * 1.2,
        angle: Math.random() * Math.PI * 2,
        angleV: (Math.random() - 0.5) * 0.025,
        size: 6 + Math.random() * 14,
        color: colors[Math.floor(Math.random() * colors.length)],
        phase: Math.random() * Math.PI * 2,
        swaySpeed: 0.0006 + Math.random() * 0.0006,
      }));
    };

    const drawNature = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.y += p.vy * (0.5 + p.z * 0.7);
        p.x += Math.sin(t * p.swaySpeed + p.phase) * 1.2;
        p.angle += p.angleV;
        if (p.y > H + 30) { p.y = -20; p.x = Math.random() * W; }

        const s = p.size * (0.4 + p.z * 0.7);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.globalAlpha = 0.3 + p.z * 0.55;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        // Leaf: two bezier curves
        ctx.moveTo(0, -s);
        ctx.bezierCurveTo(s * 0.8, -s * 0.5, s * 0.8, s * 0.5, 0, s);
        ctx.bezierCurveTo(-s * 0.8, s * 0.5, -s * 0.8, -s * 0.5, 0, -s);
        ctx.fill();
        // Vein
        ctx.strokeStyle = 'rgba(255,255,255,0.25)';
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(0, s); ctx.stroke();
        ctx.restore();
        ctx.globalAlpha = 1;
      });
    };

    // ── ANIME ── cherry blossoms + sparkles ──
    const initAnime = () => {
      const petalColors = ['#ffb7c5', '#ff80ab', '#fce4ec', '#f8bbd0', '#ffffff', '#f48fb1'];
      particles = [
        ...Array.from({ length: 55 }, () => ({
          type: 'petal',
          x: Math.random() * W,
          y: Math.random() * H,
          vy: 0.3 + Math.random() * 1.0,
          angle: Math.random() * Math.PI * 2,
          angleV: (Math.random() - 0.5) * 0.03,
          size: 4 + Math.random() * 9,
          color: petalColors[Math.floor(Math.random() * petalColors.length)],
          phase: Math.random() * Math.PI * 2,
          opacity: 0.4 + Math.random() * 0.5,
          z: Math.random(),
        })),
        ...Array.from({ length: 35 }, () => ({
          type: 'sparkle',
          x: Math.random() * W,
          y: Math.random() * H,
          life: Math.random(),
          maxLife: 60 + Math.random() * 120,
          size: 2 + Math.random() * 5,
          color: ['#ff80ab', '#fff', '#f8bbd0', '#e040fb', '#ffb7c5'][Math.floor(Math.random() * 5)],
        })),
      ];
    };

    const drawAnime = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        if (p.type === 'petal') {
          p.y += p.vy * (0.5 + p.z * 0.6);
          p.x += Math.sin(t * 0.0007 + p.phase) * 1.4;
          p.angle += p.angleV;
          if (p.y > H + 20) { p.y = -20; p.x = Math.random() * W; }
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);
          ctx.globalAlpha = p.opacity * (0.4 + p.z * 0.6);
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * 0.45, p.size, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          ctx.globalAlpha = 1;
        } else {
          p.life += 1;
          if (p.life > p.maxLife) { p.life = 0; p.x = Math.random() * W; p.y = Math.random() * H; }
          const prog = p.life / p.maxLife;
          const alpha = Math.sin(prog * Math.PI) * 0.9;
          const s = p.size * Math.sin(prog * Math.PI);
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.globalAlpha = alpha;
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1.2;
          [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4].forEach(a => {
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * s * 0.3, Math.sin(a) * s * 0.3);
            ctx.lineTo(Math.cos(a) * s, Math.sin(a) * s);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(-Math.cos(a) * s * 0.3, -Math.sin(a) * s * 0.3);
            ctx.lineTo(-Math.cos(a) * s, -Math.sin(a) * s);
            ctx.stroke();
          });
          ctx.restore();
          ctx.globalAlpha = 1;
        }
      });
    };

    // ── OCEAN ── 3D rising bubbles ──
    const initOcean = () => {
      particles = Array.from({ length: 65 }, () => ({
        x: Math.random() * W,
        y: H + Math.random() * H,
        z: Math.random(),
        vy: 0.3 + Math.random() * 1.0,
        size: 4 + Math.random() * 18,
        phase: Math.random() * Math.PI * 2,
        opacity: 0.08 + Math.random() * 0.22,
      }));
    };

    const drawOcean = () => {
      ctx.fillStyle = '#03045e';
      ctx.fillRect(0, 0, W, H);

      // Caustic light beams
      ctx.save();
      for (let i = 0; i < 5; i++) {
        const bx = (W * (i + 0.5)) / 5 + Math.sin(t * 0.003 + i) * 40;
        const grd = ctx.createLinearGradient(bx, 0, bx, H);
        grd.addColorStop(0, 'rgba(72,202,228,0.04)');
        grd.addColorStop(0.5, 'rgba(72,202,228,0.01)');
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.moveTo(bx - 30, 0); ctx.lineTo(bx + 30, 0);
        ctx.lineTo(bx + 80, H); ctx.lineTo(bx - 80, H);
        ctx.fill();
      }
      ctx.restore();

      particles.forEach(p => {
        p.y -= p.vy * (0.4 + p.z * 0.7);
        p.x += Math.sin(t * 0.0008 + p.phase) * 0.7;
        if (p.y < -p.size * 3) { p.y = H + p.size; p.x = Math.random() * W; }

        const r = p.size * (0.3 + p.z * 0.8);
        ctx.save();
        ctx.globalAlpha = p.opacity * (0.3 + p.z * 0.7);
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.strokeStyle = '#90e0ef'; ctx.lineWidth = 0.8; ctx.stroke();
        // Highlight
        ctx.beginPath(); ctx.arc(p.x - r * 0.28, p.y - r * 0.28, r * 0.22, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fill();
        ctx.restore();
        ctx.globalAlpha = 1;
      });
    };

    // ── MINIMAL / CUTE ── very subtle floating orbs ──
    const initSubtle = () => {
      const color = themeName === 'cute' ? '#f472b6' : '#6366f1';
      particles = Array.from({ length: 20 }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        size: 3 + Math.random() * 6,
        opacity: 0.06 + Math.random() * 0.08, color,
      }));
    };

    const drawSubtle = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color; ctx.globalAlpha = p.opacity; ctx.fill(); ctx.globalAlpha = 1;
      });
    };

    const init = () => {
      switch (themeName) {
        case 'darkFuturistic': initDarkFuturistic(); break;
        case 'cosmic': initCosmic(); break;
        case 'nature': initNature(); break;
        case 'anime': initAnime(); break;
        case 'ocean': initOcean(); break;
        default: initSubtle(); break;
      }
    };

    const animate = () => {
      t++;
      switch (themeName) {
        case 'darkFuturistic': drawDarkFuturistic(); break;
        case 'cosmic': drawCosmic(); break;
        case 'nature': drawNature(); break;
        case 'anime': drawAnime(); break;
        case 'ocean': drawOcean(); break;
        default: drawSubtle(); break;
      }
      animId = requestAnimationFrame(animate);
    };

    canvas.width = W;
    canvas.height = H;
    window.addEventListener('resize', resize);
    init();
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [themeName]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    />
  );
};

export default AnimatedBackground;
