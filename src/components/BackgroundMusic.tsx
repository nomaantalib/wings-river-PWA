'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

// Global audio ref shared across renders
let globalAudio: HTMLAudioElement | null = null;
let globalMuted = false;

export default function BackgroundMusic() {
  const [muted, setMuted] = useState(false);
  const [started, setStarted] = useState(false);
  const [volume, setVolume] = useState(0.28);
  const [showVolume, setShowVolume] = useState(false);
  const [wavePhase, setWavePhase] = useState(0);
  const intervalRef = useRef<any>(null);

  // Animate the wave bars
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setWavePhase(p => (p + 1) % 360);
    }, 60);
    return () => clearInterval(intervalRef.current);
  }, []);

  // Start music on first interaction or after short delay
  useEffect(() => {
    const initAudio = () => {
      if (globalAudio) {
        setStarted(true);
        setMuted(globalAudio.muted);
        return;
      }
      try {
        const audio = new Audio('/audio/background.mp3');
        audio.loop = true;
        audio.volume = 0;
        audio.play().then(() => {
          globalAudio = audio;
          setStarted(true);
          // Fade in over 4 seconds
          let vol = 0;
          const fade = setInterval(() => {
            vol = Math.min(vol + 0.008, 0.28);
            audio.volume = vol;
            if (vol >= 0.28) clearInterval(fade);
          }, 100);
        }).catch(() => {});
      } catch {}
    };

    const onInteract = () => {
      initAudio();
      ['click', 'touchstart', 'keydown', 'scroll'].forEach(e => window.removeEventListener(e, onInteract));
    };
    ['click', 'touchstart', 'keydown', 'scroll'].forEach(e => window.addEventListener(e, onInteract, { once: true }));
    // Auto-try after 3s
    const t = setTimeout(initAudio, 3000);
    return () => { clearTimeout(t); };
  }, []);

  const toggleMute = () => {
    if (!globalAudio) return;
    const newMuted = !muted;
    globalAudio.muted = newMuted;
    globalMuted = newMuted;
    setMuted(newMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (globalAudio) { globalAudio.volume = v; if (v > 0 && muted) { globalAudio.muted = false; setMuted(false); } }
  };

  if (!started) return null;

  // Wave bar heights
  const bars = [5, 10, 7, 14, 9, 12, 6, 13, 8, 11, 5, 10, 8, 12, 7];
  const waveHeights = bars.map((b, i) =>
    muted ? 2 : Math.max(2, b * (0.5 + 0.5 * Math.sin(wavePhase * 0.06 + i * 0.7)))
  );

  return (
    <div className="fixed bottom-20 right-4 z-[90] flex flex-col items-end space-y-2">
      {/* Volume slider (popover) */}
      {showVolume && (
        <div className="flex items-center space-x-2 px-3 py-2 rounded-2xl border border-white/10 shadow-xl backdrop-blur-xl animate-fade-in"
          style={{ background: 'rgba(10,6,4,0.88)' }}>
          <VolumeX className="w-3 h-3 text-gray-500" />
          <input type="range" min="0" max="0.6" step="0.01" value={volume}
            onChange={handleVolumeChange}
            className="w-24 accent-sky-400 h-1 cursor-pointer"
            style={{ accentColor: '#38bdf8' }}
          />
          <Volume2 className="w-3 h-3 text-sky-400" />
        </div>
      )}

      {/* Music pill button */}
      <button
        onClick={toggleMute}
        onContextMenu={e => { e.preventDefault(); setShowVolume(v => !v); }}
        title={`${muted ? 'Unmute' : 'Mute'} background music (right-click for volume)`}
        className="flex items-center space-x-2 px-3 py-2 rounded-2xl border border-white/10 shadow-xl transition-all hover:scale-105 cursor-pointer backdrop-blur-xl group"
        style={{ background: 'rgba(10,6,4,0.85)', minWidth: '80px' }}
      >
        {/* Wave bars visualizer */}
        <div className="flex items-end space-x-0.5 h-4">
          {waveHeights.slice(0, 5).map((h, i) => (
            <div key={i} className="w-0.5 rounded-full transition-all duration-75"
              style={{
                height: `${h}px`,
                background: muted ? 'rgba(107,114,128,0.6)' : 'linear-gradient(to top, #0ea5e9, #7dd3fc)',
                boxShadow: muted ? 'none' : '0 0 4px rgba(56,189,248,0.5)',
              }}
            />
          ))}
        </div>
        {/* Icon */}
        <div className="text-sky-400 transition-colors group-hover:text-sky-300">
          {muted ? <VolumeX className="w-3.5 h-3.5 text-gray-500" /> : <Volume2 className="w-3.5 h-3.5" />}
        </div>
        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider hidden sm:block">
          {muted ? 'Muted' : 'Music'}
        </span>
      </button>
    </div>
  );
}
