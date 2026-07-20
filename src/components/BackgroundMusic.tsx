'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

// Global audio ref shared across renders
let globalAudio: HTMLAudioElement | null = null;
let globalMuted = false;

export default function BackgroundMusic() {
  const [muted, setMuted] = useState(true); // Default muted to ensure user-initiated autoplay policy compliance
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

  // Browser visibility change, blur, and network offline listeners
  useEffect(() => {
    const handlePauseEvents = () => {
      if (globalAudio && !globalAudio.paused) {
        globalAudio.pause();
      }
    };

    const handleResumeEvents = () => {
      if (globalAudio && globalAudio.paused && !globalMuted && navigator.onLine) {
        globalAudio.play().catch(() => {});
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handlePauseEvents();
      } else {
        handleResumeEvents();
      }
    };

    const handleWindowBlur = () => {
      handlePauseEvents();
    };

    const handleWindowFocus = () => {
      handleResumeEvents();
    };

    const handleOffline = () => {
      handlePauseEvents();
    };

    const handleOnline = () => {
      handleResumeEvents();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  // Start music on first user interaction
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
          setMuted(false);
          globalMuted = false;
          // Fade in over 3 seconds
          let vol = 0;
          const fade = setInterval(() => {
            vol = Math.min(vol + 0.01, 0.28);
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
    return () => {
      clearTimeout(t);
      ['click', 'touchstart', 'keydown', 'scroll'].forEach(e => window.removeEventListener(e, onInteract));
    };
  }, []);

  const toggleMute = () => {
    const newMuted = !muted;
    setMuted(newMuted);
    globalMuted = newMuted;

    if (!globalAudio) {
      // Lazy load and play if not started yet
      try {
        const audio = new Audio('/audio/background.mp3');
        audio.loop = true;
        audio.volume = volume;
        audio.play().then(() => {
          globalAudio = audio;
          setStarted(true);
        }).catch(() => {});
      } catch {}
      return;
    }

    globalAudio.muted = newMuted;
    if (newMuted) {
      globalAudio.pause();
    } else {
      globalAudio.play().catch(() => {});
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (globalAudio) {
      globalAudio.volume = v;
      if (v > 0 && muted) {
        globalAudio.muted = false;
        setMuted(false);
        globalMuted = false;
        globalAudio.play().catch(() => {});
      }
    }
  };

  // Wave bar heights
  const bars = [5, 12, 7, 16, 9, 14, 6, 15, 8, 11, 6, 13, 8, 14, 7];
  const waveHeights = bars.map((b, i) =>
    muted ? 2 : Math.max(2, b * (0.4 + 0.6 * Math.sin(wavePhase * 0.08 + i * 0.8)))
  );

  const isPlaying = started && !muted;

  return (
    <div className="fixed bottom-20 right-4 z-[90] flex flex-col items-end space-y-2">
      {/* Volume slider (popover) */}
      {showVolume && (
        <div className="flex items-center space-x-2 px-3 py-2 rounded-2xl border border-white/10 shadow-xl backdrop-blur-xl animate-fade-in"
          style={{ background: 'rgba(10,6,4,0.88)' }}>
          <VolumeX className="w-3 h-3 text-gray-500" />
          <input type="range" min="0" max="0.6" step="0.01" value={volume}
            onChange={handleVolumeChange}
            className="w-24 accent-mint-400 h-1 cursor-pointer"
            style={{ accentColor: '#a7f3d0' }}
          />
          <Volume2 className="w-3 h-3 text-mint-400" />
        </div>
      )}

      {/* Music pill button */}
      <button
        onClick={toggleMute}
        onContextMenu={e => { e.preventDefault(); setShowVolume(v => !v); }}
        title={`${muted ? 'Turn On' : 'Mute'} background music (right-click for volume)`}
        className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-2xl border transition-all duration-500 cursor-pointer backdrop-blur-xl group shadow-lg ${
          isPlaying
            ? 'bg-gradient-to-r from-mint-500/80 to-gold-500/80 border-mint-400/40 shadow-mint-500/10 scale-105 animate-pulse'
            : 'bg-dark-950/80 border-white/10 hover:border-mint-400/40'
        }`}
        style={{ minWidth: '90px' }}
      >
        {/* Wave bars visualizer */}
        <div className="flex items-end space-x-0.5 h-4 shrink-0">
          {waveHeights.slice(0, 6).map((h, i) => (
            <div key={i} className="w-0.5 rounded-full transition-all duration-75"
              style={{
                height: `${h}px`,
                background: muted ? 'rgba(156,163,175,0.5)' : 'linear-gradient(to top, #6ee7b7, #fbbf24)',
                boxShadow: muted ? 'none' : '0 0 3px rgba(110,231,183,0.6)',
              }}
            />
          ))}
        </div>
        
        {/* Icon */}
        <div className={`transition-colors duration-300 ${isPlaying ? 'text-dark-950' : 'text-mint-400 group-hover:text-mint-300'}`}>
          {muted ? <VolumeX className="w-3.5 h-3.5 text-gray-500" /> : <Volume2 className="w-3.5 h-3.5" />}
        </div>

        <span className={`text-[9px] font-extrabold uppercase tracking-wider hidden sm:block ${isPlaying ? 'text-dark-950' : 'text-gray-400 group-hover:text-white'}`}>
          {muted ? 'Off' : 'On'}
        </span>
      </button>
    </div>
  );
}
