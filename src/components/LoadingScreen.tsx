'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

// ── Water ripple particle type ────────────────────────────────────────────────
interface Ripple {
  x: number; y: number;
  r: number; maxR: number;
  alpha: number; speed: number;
  color: string;
}
interface Drop {
  x: number; y: number;
  vy: number; vx: number;
  r: number; alpha: number;
  splashed: boolean;
  trail: { x: number; y: number; r: number; alpha: number }[];
}

const WATER_COLORS = ['rgba(56,189,248,', 'rgba(125,211,252,', 'rgba(14,165,233,', 'rgba(186,230,253,', 'rgba(255,255,255,'];

// ── Canvas Water Splash Loading Screen ───────────────────────────────────────
export default function LoadingScreen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);
  const splashAudioCtxRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const ripplesRef = useRef<Ripple[]>([]);
  const dropsRef = useRef<Drop[]>([]);
  const phaseRef = useRef<'drops' | 'flood' | 'reveal' | 'done'>('drops');

  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const [logoScale, setLogoScale] = useState(0);
  const [logoOpacity, setLogoOpacity] = useState(0);
  const [textVisible, setTextVisible] = useState(false);
  const [floodLevel, setFloodLevel] = useState(0); // 0→100 percent from bottom
  const [showProgress, setShowProgress] = useState(false);
  const [progress, setProgress] = useState(0);
  const [musicStarted, setMusicStarted] = useState(false);

  // ── Web Audio: water splash burst sound ────────────────────────────────────
  const playSplashSound = useCallback((intensity: number = 1) => {
    try {
      if (!splashAudioCtxRef.current) {
        splashAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = splashAudioCtxRef.current;
      const bufSize = ctx.sampleRate * 0.18;
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        // White noise decaying exponentially → realistic water splash
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSize * 0.12)) * intensity;
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      // Bandpass filter → warm water splash frequency
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 800 + Math.random() * 600;
      bp.Q.value = 0.8;
      // Low shelf for body
      const ls = ctx.createBiquadFilter();
      ls.type = 'lowshelf';
      ls.frequency.value = 300;
      ls.gain.value = 6;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.55 * intensity, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      src.connect(bp); bp.connect(ls); ls.connect(gain); gain.connect(ctx.destination);
      src.start(ctx.currentTime);
    } catch {}
  }, []);

  // ── Start background music ──────────────────────────────────────────────────
  const startBackgroundMusic = useCallback(() => {
    if (musicStarted) return;
    try {
      const audio = new Audio('/audio/background.mp3');
      audio.loop = true;
      audio.volume = 0;
      audio.play().then(() => {
        setMusicStarted(true);
        bgAudioRef.current = audio;
        // Fade in slowly over 3 seconds
        let vol = 0;
        const fadeIn = setInterval(() => {
          vol = Math.min(vol + 0.02, 0.32);
          audio.volume = vol;
          if (vol >= 0.32) clearInterval(fadeIn);
        }, 100);
      }).catch(() => {});
    } catch {}
  }, [musicStarted]);

  // ── Canvas animation loop ──────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx2d = canvas.getContext('2d')!;
    startTimeRef.current = performance.now();

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Spawn drops at random intervals during first 1.8s
    let dropInterval: any;
    let dropCount = 0;
    const spawnDrop = () => {
      const W = canvas.width, H = canvas.height;
      const x = W * 0.1 + Math.random() * W * 0.8;
      dropsRef.current.push({
        x, y: -20,
        vx: (Math.random() - 0.5) * 2,
        vy: 6 + Math.random() * 8,
        r: 4 + Math.random() * 8,
        alpha: 0.9 + Math.random() * 0.1,
        splashed: false,
        trail: []
      });
      dropCount++;
      if (dropCount > 28) { clearInterval(dropInterval); }
    };
    dropInterval = setInterval(spawnDrop, 80);
    // First immediate drops
    for (let i = 0; i < 5; i++) setTimeout(() => spawnDrop(), i * 30);

    // ── Main render loop ──────────────────────────────────────────────────────
    let floodH = 0; // pixels of flood from bottom
    let revealProgress = 0;

    const render = () => {
      const W = canvas.width, H = canvas.height;
      const elapsed = performance.now() - startTimeRef.current;

      // ── Phase logic ────────────────────────────────────────────────────────
      if (elapsed < 1900) {
        phaseRef.current = 'drops';
        setProgress(Math.min((elapsed / 1900) * 40, 40));
      } else if (elapsed < 3200) {
        if (phaseRef.current !== 'flood') {
          phaseRef.current = 'flood';
          clearInterval(dropInterval);
        }
        const p = (elapsed - 1900) / 1300;
        floodH = H * easeInOut(p);
        setFloodLevel(Math.round(easeInOut(p) * 100));
        setProgress(40 + p * 40);
      } else if (elapsed < 4200) {
        if (phaseRef.current !== 'reveal') {
          phaseRef.current = 'reveal';
          setShowProgress(true);
          playSplashSound(1.5);
        }
        revealProgress = (elapsed - 3200) / 1000;
        setProgress(80 + revealProgress * 18);
        setLogoScale(0.5 + easeOutBack(revealProgress) * 0.5);
        setLogoOpacity(Math.min(revealProgress * 3, 1));
        if (revealProgress > 0.5) setTextVisible(true);
      } else if (elapsed < 5000) {
        if (phaseRef.current !== 'done') {
          phaseRef.current = 'done';
          setProgress(100);
        }
      } else {
        // Fade out
        setFading(true);
        setTimeout(() => setVisible(false), 800);
        cancelAnimationFrame(animFrameRef.current);
        return;
      }

      // ── Clear ──────────────────────────────────────────────────────────────
      ctx2d.clearRect(0, 0, W, H);

      // ── Sky / background ───────────────────────────────────────────────────
      const skyGrad = ctx2d.createLinearGradient(0, 0, 0, H);
      skyGrad.addColorStop(0, '#020b18');
      skyGrad.addColorStop(0.4, '#051a2e');
      skyGrad.addColorStop(1, '#030d1a');
      ctx2d.fillStyle = skyGrad;
      ctx2d.fillRect(0, 0, W, H);

      // ── Stars ──────────────────────────────────────────────────────────────
      if (phaseRef.current === 'drops' || phaseRef.current === 'flood') {
        for (let i = 0; i < 120; i++) {
          const sx = ((i * 137.5) % W);
          const sy = ((i * 97.3) % (H * 0.6));
          const alpha = 0.3 + 0.5 * Math.abs(Math.sin(elapsed * 0.0005 + i));
          ctx2d.beginPath();
          ctx2d.arc(sx, sy, 0.8 + (i % 3) * 0.4, 0, Math.PI * 2);
          ctx2d.fillStyle = `rgba(200,220,255,${alpha})`;
          ctx2d.fill();
        }
      }

      // ── Flood water ───────────────────────────────────────────────────────
      if (phaseRef.current === 'flood' || phaseRef.current === 'reveal' || phaseRef.current === 'done') {
        const fH = phaseRef.current === 'flood' ? floodH : H;
        if (fH > 0) {
          const wGrad = ctx2d.createLinearGradient(0, H - fH, 0, H);
          wGrad.addColorStop(0, 'rgba(14,100,180,0.92)');
          wGrad.addColorStop(0.5, 'rgba(10,70,140,0.97)');
          wGrad.addColorStop(1, 'rgba(5,40,90,1)');
          ctx2d.fillStyle = wGrad;

          // Wavy water surface
          ctx2d.beginPath();
          ctx2d.moveTo(0, H - fH);
          const waveAmp = fH > 10 ? 12 + Math.sin(elapsed * 0.002) * 4 : 0;
          const waveFreq = 0.008;
          for (let wx = 0; wx <= W; wx += 4) {
            const wy = H - fH + Math.sin(wx * waveFreq + elapsed * 0.003) * waveAmp
              + Math.sin(wx * waveFreq * 2.3 + elapsed * 0.005) * (waveAmp * 0.4);
            ctx2d.lineTo(wx, wy);
          }
          ctx2d.lineTo(W, H); ctx2d.lineTo(0, H); ctx2d.closePath();
          ctx2d.fill();

          // Water shimmer / caustic light
          for (let c = 0; c < 8; c++) {
            const cx2 = (W * 0.1 + c * W * 0.115 + Math.sin(elapsed * 0.001 + c) * 40);
            const cy2 = H - fH * 0.3 - Math.cos(elapsed * 0.002 + c) * (fH * 0.15);
            if (cy2 > H - fH) {
              const rGrad = ctx2d.createRadialGradient(cx2, cy2, 0, cx2, cy2, 80 + c * 15);
              rGrad.addColorStop(0, `rgba(125,211,252,${0.12 + Math.sin(elapsed * 0.003 + c) * 0.06})`);
              rGrad.addColorStop(1, 'rgba(125,211,252,0)');
              ctx2d.fillStyle = rGrad;
              ctx2d.beginPath();
              ctx2d.ellipse(cx2, cy2, 80 + c * 10, 30 + c * 5, 0, 0, Math.PI * 2);
              ctx2d.fill();
            }
          }
        }
      }

      // ── Rain drops (falling water) ─────────────────────────────────────────
      const drops = dropsRef.current;
      const ripples = ripplesRef.current;
      const aliveDrops: Drop[] = [];

      for (const drop of drops) {
        // Physics
        drop.vy += 0.6; // gravity
        drop.x += drop.vx;
        drop.y += drop.vy;

        // Trail
        drop.trail.push({ x: drop.x, y: drop.y, r: drop.r * 0.5, alpha: drop.alpha * 0.3 });
        if (drop.trail.length > 8) drop.trail.shift();

        // Draw trail
        for (let t = 0; t < drop.trail.length; t++) {
          const tr = drop.trail[t];
          const a = (t / drop.trail.length) * tr.alpha * 0.5;
          ctx2d.beginPath();
          ctx2d.ellipse(tr.x, tr.y, tr.r * 0.4, tr.r * 1.6, 0, 0, Math.PI * 2);
          ctx2d.fillStyle = `rgba(125,211,252,${a})`;
          ctx2d.fill();
        }

        // Draw drop body
        const dGrad = ctx2d.createRadialGradient(drop.x - drop.r * 0.3, drop.y - drop.r * 0.3, 0, drop.x, drop.y, drop.r);
        dGrad.addColorStop(0, `rgba(220,240,255,${drop.alpha})`);
        dGrad.addColorStop(0.5, `rgba(56,189,248,${drop.alpha * 0.8})`);
        dGrad.addColorStop(1, `rgba(14,100,180,${drop.alpha * 0.4})`);
        ctx2d.beginPath();
        ctx2d.arc(drop.x, drop.y, drop.r, 0, Math.PI * 2);
        ctx2d.fillStyle = dGrad;
        ctx2d.fill();
        // Specular highlight
        ctx2d.beginPath();
        ctx2d.arc(drop.x - drop.r * 0.3, drop.y - drop.r * 0.3, drop.r * 0.25, 0, Math.PI * 2);
        ctx2d.fillStyle = `rgba(255,255,255,${drop.alpha * 0.7})`;
        ctx2d.fill();

        // Hit ground or screen bottom
        const groundY = H - (phaseRef.current === 'flood' ? floodH : 0);
        if (drop.y + drop.r >= (phaseRef.current === 'flood' ? H - floodH : H * 0.98)) {
          if (!drop.splashed) {
            drop.splashed = true;
            playSplashSound(0.3 + Math.random() * 0.5);
            // Spawn ripple
            for (let ri = 0; ri < 3; ri++) {
              ripples.push({
                x: drop.x + (Math.random() - 0.5) * 20,
                y: phaseRef.current === 'flood' ? H - floodH : H * 0.97,
                r: 0,
                maxR: 40 + drop.r * 8 + ri * 20,
                alpha: 0.7 - ri * 0.15,
                speed: 1.5 + ri * 0.8,
                color: WATER_COLORS[Math.floor(Math.random() * WATER_COLORS.length)]
              });
            }
            // Splash particles — upward droplets
            for (let sp = 0; sp < 8; sp++) {
              const angle = -Math.PI * 0.5 + (Math.random() - 0.5) * Math.PI * 1.2;
              const speed = 2 + Math.random() * 6;
              dropsRef.current.push({
                x: drop.x + (Math.random() - 0.5) * 20,
                y: drop.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 3,
                r: 1.5 + Math.random() * 3,
                alpha: 0.8,
                splashed: false,
                trail: []
              });
            }
          }
        } else {
          aliveDrops.push(drop);
        }
      }
      dropsRef.current = aliveDrops.filter(d => d.y < H + 50 && d.alpha > 0.05);

      // ── Ripples ────────────────────────────────────────────────────────────
      const aliveRipples: Ripple[] = [];
      for (const rip of ripples) {
        rip.r += rip.speed;
        rip.alpha *= 0.94;
        if (rip.r < rip.maxR && rip.alpha > 0.01) {
          ctx2d.beginPath();
          ctx2d.ellipse(rip.x, rip.y, rip.r, rip.r * 0.3, 0, 0, Math.PI * 2);
          ctx2d.strokeStyle = `${rip.color}${rip.alpha})`;
          ctx2d.lineWidth = 1.5;
          ctx2d.stroke();
          // Inner ripple
          if (rip.r > 10) {
            ctx2d.beginPath();
            ctx2d.ellipse(rip.x, rip.y, rip.r * 0.6, rip.r * 0.18, 0, 0, Math.PI * 2);
            ctx2d.strokeStyle = `${rip.color}${rip.alpha * 0.5})`;
            ctx2d.lineWidth = 0.8;
            ctx2d.stroke();
          }
          aliveRipples.push(rip);
        }
      }
      ripplesRef.current = aliveRipples;

      // ── Screen-wide water splash burst at flood start ─────────────────────
      if (phaseRef.current === 'reveal') {
        // Water surface distortion / caustic overlay
        const distAlpha = Math.max(0, 1 - revealProgress * 1.5);
        if (distAlpha > 0) {
          for (let wave = 0; wave < 6; wave++) {
            ctx2d.beginPath();
            ctx2d.moveTo(0, H * (0.1 + wave * 0.15));
            for (let wx = 0; wx <= W; wx += 6) {
              const wy = H * (0.1 + wave * 0.15) +
                Math.sin(wx * 0.02 + elapsed * 0.01 + wave) * (30 + wave * 10) +
                Math.cos(wx * 0.008 + elapsed * 0.007) * 20;
              ctx2d.lineTo(wx, wy);
            }
            ctx2d.strokeStyle = `rgba(56,189,248,${distAlpha * 0.12})`;
            ctx2d.lineWidth = 1.5;
            ctx2d.stroke();
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      clearInterval(dropInterval);
      window.removeEventListener('resize', resize);
    };
  }, [playSplashSound]);

  // Start music on first user interaction or after 2s
  useEffect(() => {
    const onInteract = () => {
      startBackgroundMusic();
      window.removeEventListener('click', onInteract);
      window.removeEventListener('touchstart', onInteract);
      window.removeEventListener('keydown', onInteract);
    };
    window.addEventListener('click', onInteract);
    window.addEventListener('touchstart', onInteract);
    window.addEventListener('keydown', onInteract);
    // Also try auto after 2s
    const t = setTimeout(startBackgroundMusic, 2000);
    return () => { clearTimeout(t); window.removeEventListener('click', onInteract); window.removeEventListener('touchstart', onInteract); window.removeEventListener('keydown', onInteract); };
  }, [startBackgroundMusic]);

  if (!visible) return null;

  return (
    <div className={`fixed inset-0 z-[500] overflow-hidden transition-all duration-700 ${fading ? 'opacity-0' : 'opacity-100'}`}>
      {/* Canvas — realistic water animation */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ display: 'block' }} />

      {/* Logo + text (reveal phase) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        style={{ opacity: logoOpacity, transform: `scale(${logoScale})`, transition: 'none' }}>
        {/* Glow ring */}
        <div className="relative">
          <div className="absolute -inset-8 rounded-full animate-ping"
            style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.25) 0%, transparent 70%)', animationDuration: '1.5s' }} />
          <div className="absolute -inset-4 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.15) 0%, transparent 70%)', animation: 'pulse 2s infinite' }} />
          {/* Logo */}
          <div className="relative w-28 h-28 rounded-[28px] overflow-hidden border-2 shadow-2xl"
            style={{
              borderColor: 'rgba(125,211,252,0.6)',
              boxShadow: '0 0 60px rgba(56,189,248,0.5), 0 0 120px rgba(14,100,180,0.3), inset 0 0 20px rgba(125,211,252,0.1)',
              backdropFilter: 'blur(12px)',
            }}>
            <img src="/logo.png" alt="Wings River Café" className="w-full h-full object-cover" />
            {/* Water refraction overlay */}
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(135deg, rgba(125,211,252,0.15) 0%, transparent 50%, rgba(14,100,180,0.1) 100%)' }} />
          </div>
        </div>

        {/* Text */}
        <div className={`mt-6 text-center transition-all duration-700 ${textVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h1 className="font-serif font-black text-white text-3xl sm:text-4xl tracking-tight"
            style={{ textShadow: '0 0 40px rgba(56,189,248,0.7), 0 2px 20px rgba(0,0,0,0.8)' }}>
            Wings River Café
          </h1>
          <p className="text-sky-300 text-sm font-semibold tracking-[0.3em] uppercase mt-1.5"
            style={{ textShadow: '0 0 20px rgba(56,189,248,0.5)' }}>
            Taste · Eat · Rides
          </p>
          {/* Water drop separator */}
          <div className="flex items-center justify-center space-x-2 mt-3">
            {[0, 0.15, 0.3].map((delay, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-sky-400"
                style={{ animation: `bounce 1s ${delay}s infinite`, boxShadow: '0 0 8px rgba(56,189,248,0.8)' }} />
            ))}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {showProgress && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-48">
          <div className="h-0.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%`, background: 'linear-gradient(90deg, rgba(56,189,248,0.8), rgba(125,211,252,1))' }} />
          </div>
          <p className="text-center text-[9px] text-sky-400/60 mt-2 tracking-widest uppercase font-semibold">Loading experience…</p>
        </div>
      )}

      {/* Music indicator dot */}
      {musicStarted && (
        <div className="absolute top-4 right-4 flex items-center space-x-1.5">
          {[0, 0.2, 0.4].map((d, i) => (
            <div key={i} className="w-0.5 bg-sky-400/60 rounded-full"
              style={{ height: `${8 + i * 4}px`, animation: `scaleY 1s ${d}s infinite alternate`, transformOrigin: 'bottom' }} />
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes scaleY { from { transform: scaleY(0.3); } to { transform: scaleY(1.2); } }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
      `}</style>
    </div>
  );
}

// Easing helpers
function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}
function easeOutBack(t: number): number {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}
