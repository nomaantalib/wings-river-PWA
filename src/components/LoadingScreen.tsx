'use client';

import React, { useEffect, useState, useRef } from 'react';

// ─── Scene frames for the animated intro ───────────────────────────────────
const SCENES = [
  {
    id: 'jetski',
    duration: 1100,
    label: 'Lucknow Water Sports',
    sublabel: 'Feel the Thrill',
    bg: 'from-[#0a1628] via-[#0d3258] to-[#061525]',
  },
  {
    id: 'food',
    duration: 1100,
    label: 'Wings River Café',
    sublabel: 'Gourmet Multicuisine',
    bg: 'from-[#1a0a05] via-[#3b1a08] to-[#1a0a05]',
  },
  {
    id: 'river',
    duration: 900,
    label: 'Gomti Riverfront',
    sublabel: 'Scenic & Serene',
    bg: 'from-[#061525] via-[#0a2840] to-[#051020]',
  },
  {
    id: 'outro',
    duration: 600,
    label: 'Wings River Café',
    sublabel: 'Welcome',
    bg: 'from-[#0a0a0a] via-[#141414] to-[#0a0a0a]',
  },
];

const TOTAL_DURATION = SCENES.reduce((acc, s) => acc + s.duration, 0); // ~3700ms

// ─── SVG Scene Animations ────────────────────────────────────────────────
function JetSkiScene({ active }: { active: boolean }) {
  return (
    <div className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ${active ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
      {/* Water */}
      <svg viewBox="0 0 800 400" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a6b9e" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0d3a5c" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0a1628" />
            <stop offset="100%" stopColor="#1a4a7a" />
          </linearGradient>
        </defs>
        {/* Sky */}
        <rect x="0" y="0" width="800" height="220" fill="url(#skyGrad)" />
        {/* Sun */}
        <circle cx="650" cy="80" r="50" fill="#ff6b1a" opacity="0.85">
          <animate attributeName="r" values="48;54;48" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.8;1;0.8" dur="3s" repeatCount="indefinite" />
        </circle>
        {/* Sun glow */}
        <circle cx="650" cy="80" r="70" fill="#ff6b1a" opacity="0.2">
          <animate attributeName="r" values="68;80;68" dur="3s" repeatCount="indefinite" />
        </circle>
        {/* Water */}
        <rect x="0" y="200" width="800" height="200" fill="url(#waterGrad)" />
        {/* Waves */}
        <g opacity="0.6">
          <path d="M0,220 Q100,210 200,220 Q300,230 400,220 Q500,210 600,220 Q700,230 800,220" fill="none" stroke="#4fc3e8" strokeWidth="2">
            <animate attributeName="d" values="M0,220 Q100,210 200,220 Q300,230 400,220 Q500,210 600,220 Q700,230 800,220;M0,225 Q100,215 200,225 Q300,215 400,225 Q500,215 600,225 Q700,215 800,225;M0,220 Q100,210 200,220 Q300,230 400,220 Q500,210 600,220 Q700,230 800,220" dur="2s" repeatCount="indefinite" />
          </path>
          <path d="M0,240 Q100,230 200,240 Q300,250 400,240 Q500,230 600,240 Q700,250 800,240" fill="none" stroke="#4fc3e8" strokeWidth="1.5" opacity="0.5">
            <animate attributeName="d" values="M0,240 Q100,230 200,240 Q300,250 400,240 Q500,230 600,240 Q700,250 800,240;M0,245 Q100,255 200,245 Q300,235 400,245 Q500,255 600,245 Q700,235 800,245;M0,240 Q100,230 200,240 Q300,250 400,240 Q500,230 600,240 Q700,250 800,240" dur="2.5s" repeatCount="indefinite" />
          </path>
        </g>
        {/* Realistic Animated Jet Ski moving across whole screen from left to right end */}
        <g>
          <animateTransform
            attributeName="transform"
            type="translate"
            values="-340,0; -100,-5; 200,3; 500,-7; 800,3; 1120,0"
            keyTimes="0; 0.2; 0.45; 0.7; 0.88; 1"
            calcMode="spline"
            keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1"
            dur="3.2s"
            repeatCount="indefinite"
          />

          {/* Trailing Water Spray & Wake Foam (Behind on the left) */}
          <g>
            <path d="M 0 258 C 30 240, 70 270, 110 254" fill="none" stroke="#e0f2fe" strokeWidth="4" opacity="0.9" />
            <path d="M 20 256 C 50 244, 90 266, 120 252" fill="none" stroke="#38bdf8" strokeWidth="2.5" opacity="0.8" />
            <circle cx="40" cy="248" r="5" fill="#ffffff" opacity="0.95">
              <animate attributeName="r" values="3;6;3" dur="0.4s" repeatCount="indefinite" />
            </circle>
            <circle cx="70" cy="245" r="4" fill="#bae6fd" opacity="0.85">
              <animate attributeName="r" values="2;5;2" dur="0.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="95" cy="250" r="6" fill="#ffffff" opacity="0.9">
              <animate attributeName="r" values="4;7;4" dur="0.3s" repeatCount="indefinite" />
            </circle>
          </g>

          {/* Jet Ski Craft Hull (Realistic Water Sports Craft) */}
          <g filter="drop-shadow(0px 8px 10px rgba(0,0,0,0.5))">
            {/* Water spray arc under nose */}
            <path d="M 200 255 Q 230 268 265 250" stroke="#bae6fd" strokeWidth="3" fill="none" />
            {/* Bottom Hull */}
            <path d="M 110 254 L 140 254 L 235 248 L 265 244 L 255 255 L 150 258 Z" fill="#F59E0B" stroke="#78350F" strokeWidth="1.5" />
            {/* Upper Deck Body */}
            <path d="M 135 254 L 165 240 L 225 238 L 250 244 L 225 248 Z" fill="#111827" />
            {/* Glossy Yellow Side Panel */}
            <path d="M 145 252 L 180 242 L 230 241 L 242 245 L 210 251 Z" fill="#FBBF24" />
            {/* Front Tinted Windshield Visor */}
            <path d="M 215 238 L 230 230 L 245 243 Z" fill="#38BDF8" opacity="0.8" />
            {/* Handlebars */}
            <line x1="200" y1="230" x2="215" y2="228" stroke="#D1D5DB" strokeWidth="3.5" strokeLinecap="round" />

            {/* Rider */}
            {/* Life Vest Body */}
            <path d="M 175 228 C 170 215, 195 210, 205 228 Z" fill="#EF4444" />
            <path d="M 182 216 L 202 216" stroke="#FEF08A" strokeWidth="2" />
            {/* Arms holding handlebars */}
            <path d="M 190 220 L 208 227" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" />
            {/* Helmet & Visor */}
            <circle cx="188" cy="208" r="10" fill="#1E293B" />
            <path d="M 190 204 Q 198 208 195 212" stroke="#38BDF8" strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>
        </g>
      </svg>

      {/* Text overlay */}
      <div className="relative z-10 text-center">
        <div className={`transition-all duration-500 ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '300ms' }}>
          <p className="text-blue-300 text-xs font-bold uppercase tracking-[6px] mb-2">🌊 Adventure Awaits</p>
          <h1 className="font-serif text-4xl sm:text-6xl font-extrabold text-white drop-shadow-2xl">Lucknow<br />Water Sports</h1>
          <p className="text-yellow-400 font-bold mt-2 text-sm tracking-widest">Feel the Thrill · Splash · Make Memories</p>
        </div>
      </div>
    </div>
  );
}

function FoodScene({ active }: { active: boolean }) {
  return (
    <div className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ${active ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
      <svg viewBox="0 0 800 400" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="tableGrad" cx="50%" cy="80%" r="60%">
            <stop offset="0%" stopColor="#8B4513" />
            <stop offset="100%" stopColor="#3d1f07" />
          </radialGradient>
          <radialGradient id="candleGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff8c00" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ff8c00" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Background */}
        <rect width="800" height="400" fill="#1a0a05" />
        {/* Ambient warm glow */}
        <ellipse cx="400" cy="200" rx="350" ry="200" fill="#8B4513" opacity="0.12" />

        {/* Table */}
        <ellipse cx="400" cy="310" rx="280" ry="40" fill="#5a2e0a" />
        <ellipse cx="400" cy="305" rx="280" ry="38" fill="url(#tableGrad)" />

        {/* Main dish — biryani bowl */}
        <ellipse cx="310" cy="285" rx="65" ry="20" fill="#c9902e" />
        <ellipse cx="310" cy="278" rx="60" ry="17" fill="#e8a83e" />
        {/* Rice grains */}
        <g fill="#f5e6a0" opacity="0.9">
          {[0,1,2,3,4,5,6,7,8].map(i => (
            <ellipse key={i} cx={295 + (i % 3) * 15} cy={274 + Math.floor(i / 3) * 6} rx="4" ry="2" />
          ))}
        </g>
        {/* Saffron color top */}
        <ellipse cx="310" cy="274" rx="30" ry="10" fill="#e05c00" opacity="0.6" />

        {/* Burger */}
        <g>
          <ellipse cx="490" cy="288" rx="50" ry="14" fill="#c9902e" />
          <rect x="445" y="275" width="100" height="18" rx="6" fill="#f4c57a" />
          <rect x="448" y="270" width="96" height="8" rx="3" fill="#e74c3c" opacity="0.8" />
          <rect x="448" y="268" width="96" height="5" rx="2" fill="#27ae60" opacity="0.9" />
          <ellipse cx="490" cy="267" rx="50" ry="14" fill="#d4a04a" />
          {/* Sesame seeds */}
          <g fill="#f5e6a0" opacity="0.6">
            <ellipse cx="478" cy="264" rx="3" ry="1.5" />
            <ellipse cx="492" cy="261" rx="3" ry="1.5" />
            <ellipse cx="505" cy="265" rx="3" ry="1.5" />
          </g>
        </g>

        {/* Pizza slice */}
        <g transform="translate(400, 280)">
          <path d="M0,-30 L-25,10 L25,10 Z" fill="#e8a83e" />
          <path d="M0,-28 L-22,8 L22,8 Z" fill="#e74c3c" opacity="0.8" />
          {/* Cheese dots */}
          <circle cx="-5" cy="-5" r="5" fill="#f5e6a0" opacity="0.9" />
          <circle cx="8" cy="2" r="4" fill="#f5e6a0" opacity="0.9" />
          {/* Crust */}
          <path d="M-25,10 L25,10" stroke="#c9902e" strokeWidth="8" strokeLinecap="round" />
        </g>

        {/* Drink glass */}
        <g>
          <rect x="540" y="265" width="35" height="45" rx="4" fill="#a8e4f0" opacity="0.5" />
          <rect x="542" y="267" width="31" height="41" rx="3" fill="#4fc3e8" opacity="0.3" />
          {/* Straw */}
          <rect x="562" y="255" width="4" height="30" rx="2" fill="#ff6b9d" />
          {/* Mint leaf */}
          <ellipse cx="566" cy="255" rx="6" ry="4" fill="#27ae60" />
          {/* Ice cubes */}
          <rect x="545" y="280" width="10" height="10" rx="2" fill="white" opacity="0.5" />
          <rect x="558" y="285" width="10" height="10" rx="2" fill="white" opacity="0.4" />
        </g>

        {/* Candle - center */}
        <g>
          <rect x="393" y="258" width="14" height="30" rx="2" fill="#f5f0e0" />
          {/* Flame */}
          <ellipse cx="400" cy="254" rx="5" ry="8" fill="#ff8c00">
            <animate attributeName="rx" values="5;4;6;5" dur="0.8s" repeatCount="indefinite" />
            <animate attributeName="ry" values="8;10;7;8" dur="0.8s" repeatCount="indefinite" />
            <animate attributeName="cy" values="254;252;256;254" dur="0.8s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="400" cy="257" rx="3" ry="5" fill="#ffdd00" opacity="0.8">
            <animate attributeName="rx" values="3;2;4;3" dur="0.8s" repeatCount="indefinite" />
          </ellipse>
          {/* Candle glow */}
          <ellipse cx="400" cy="255" rx="40" ry="30" fill="url(#candleGlow)">
            <animate attributeName="rx" values="40;50;40" dur="1.2s" repeatCount="indefinite" />
            <animate attributeName="ry" values="30;38;30" dur="1.2s" repeatCount="indefinite" />
          </ellipse>
        </g>

        {/* Cutlery - fork */}
        <g transform="translate(220, 290)" stroke="#c0c0c0" strokeWidth="2.5" fill="none">
          <line x1="0" y1="-20" x2="0" y2="20" />
          <line x1="-5" y1="-20" x2="-5" y2="-5" />
          <line x1="5" y1="-20" x2="5" y2="-5" />
          <path d="M-5,-5 Q0,0 5,-5" />
        </g>
        {/* Knife */}
        <g transform="translate(580, 290)">
          <line x1="0" y1="-20" x2="0" y2="20" stroke="#c0c0c0" strokeWidth="3" />
          <path d="M0,-20 L4,-10 L0,10" fill="#c0c0c0" opacity="0.8" />
        </g>

        {/* Stars / fairy lights */}
        {[50,150,250,600,680,720].map((x, i) => (
          <circle key={i} cx={x} cy={30 + i * 15} r="2" fill="#ffd700" opacity="0.7">
            <animate attributeName="opacity" values="0.7;0.2;0.7" dur={`${1 + i * 0.3}s`} repeatCount="indefinite" />
          </circle>
        ))}
        {/* String lights */}
        <path d="M0,50 Q200,30 400,50 Q600,70 800,50" stroke="#ffd700" strokeWidth="1" fill="none" opacity="0.4" />
      </svg>

      <div className="relative z-10 text-center">
        <div className={`transition-all duration-500 ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '300ms' }}>
          <p className="text-amber-400 text-xs font-bold uppercase tracking-[6px] mb-2">🍽️ Gourmet Delights</p>
          <h1 className="font-serif text-4xl sm:text-6xl font-extrabold text-white drop-shadow-2xl">Wings River<br />Café</h1>
          <p className="text-gold-400 font-bold mt-2 text-sm tracking-widest" style={{ color: '#FFD700' }}>Multicuisine · Riverside Dining</p>
        </div>
      </div>
    </div>
  );
}

function RiverScene({ active }: { active: boolean }) {
  return (
    <div className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ${active ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
      <svg viewBox="0 0 800 400" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="nightSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#020b18" />
            <stop offset="50%" stopColor="#061525" />
            <stop offset="100%" stopColor="#0a2840" />
          </linearGradient>
          <linearGradient id="riverNight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0d3a5c" />
            <stop offset="100%" stopColor="#071e2e" />
          </linearGradient>
        </defs>
        <rect width="800" height="400" fill="url(#nightSky)" />
        {/* Stars */}
        {[
          [60,30],[180,55],[320,20],[420,45],[560,25],[680,40],[740,15],
          [100,80],[260,65],[500,70],[640,60],[760,75],[40,110],[200,100]
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="1.5" fill="white" opacity="0.6">
            <animate attributeName="opacity" values="0.6;0.2;0.6" dur={`${1.5 + i * 0.2}s`} repeatCount="indefinite" />
          </circle>
        ))}
        {/* Moon */}
        <circle cx="680" cy="60" r="28" fill="#f8f0d0">
          <animate attributeName="opacity" values="0.9;1;0.9" dur="4s" repeatCount="indefinite" />
        </circle>
        <circle cx="690" cy="52" r="22" fill="#0a1628" />

        {/* Silhouette skyline */}
        <rect x="0" y="170" width="800" height="20" fill="#020b18" />
        {/* Trees */}
        <g fill="#020b18">
          {[20,60,90,130].map((x, i) => (
            <polygon key={i} points={`${x},170 ${x + 15},200 ${x + 30},170`} />
          ))}
          {[650,700,740,770].map((x, i) => (
            <polygon key={i} points={`${x},170 ${x + 15},200 ${x + 30},170`} />
          ))}
        </g>
        {/* Buildings */}
        <rect x="200" y="140" width="40" height="60" fill="#041020" />
        <rect x="250" y="155" width="30" height="45" fill="#041020" />
        <rect x="530" y="130" width="50" height="70" fill="#041020" />
        <rect x="590" y="150" width="35" height="50" fill="#041020" />
        {/* Building lights */}
        {[210,225,240,540,555,570].map((x, i) => (
          <rect key={i} x={x} y={145 + (i % 3) * 12} width="6" height="5" rx="1" fill="#ffd700" opacity="0.6">
            <animate attributeName="opacity" values="0.6;0.1;0.6" dur={`${2 + i * 0.5}s`} repeatCount="indefinite" />
          </rect>
        ))}

        {/* River */}
        <rect x="0" y="200" width="800" height="200" fill="url(#riverNight)" />
        {/* Moon reflection on water */}
        <path d="M660,210 Q680,240 700,210" stroke="#f8f0d0" strokeWidth="2" fill="none" opacity="0.3">
          <animate attributeName="d" values="M660,210 Q680,240 700,210;M655,215 Q680,245 705,215;M660,210 Q680,240 700,210" dur="3s" repeatCount="indefinite" />
        </path>
        {/* River shimmer */}
        {[100,250,400,550,700].map((x, i) => (
          <line key={i} x1={x} y1={220 + i * 8} x2={x + 40} y2={222 + i * 8} stroke="#4fc3e8" strokeWidth="1" opacity="0.3">
            <animate attributeName="opacity" values="0.3;0.6;0.3" dur={`${2 + i * 0.4}s`} repeatCount="indefinite" />
          </line>
        ))}
        {/* Café fairy lights reflection */}
        {[300,340,380,420,460].map((x, i) => (
          <ellipse key={i} cx={x} cy={215 + i * 3} rx="8" ry="4" fill="#ffd700" opacity="0.15">
            <animate attributeName="opacity" values="0.1;0.3;0.1" dur={`${1.5 + i * 0.3}s`} repeatCount="indefinite" />
          </ellipse>
        ))}
        {/* Café terrace with string lights */}
        <rect x="280" y="168" width="240" height="32" fill="#0a1e10" />
        <path d="M280,168 Q400,155 520,168" fill="#0d2a14" />
        {/* String lights */}
        {[295,320,345,370,395,420,445,470,495].map((x, i) => (
          <circle key={i} cx={x} cy={163 + Math.sin(i * 0.7) * 4} r="3" fill="#ffd700" opacity="0.8">
            <animate attributeName="opacity" values="0.8;0.3;0.8" dur={`${1 + i * 0.15}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </svg>

      <div className="relative z-10 text-center">
        <div className={`transition-all duration-500 ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '250ms' }}>
          <p className="text-mint-300 text-xs font-bold uppercase tracking-[6px] mb-2" style={{ color: '#8FD3C7' }}>🌙 Gomti Riverfront</p>
          <h1 className="font-serif text-4xl sm:text-6xl font-extrabold text-white drop-shadow-2xl">Lucknow's<br />Most Scenic Café</h1>
        </div>
      </div>
    </div>
  );
}

function OutroScene({ active }: { active: boolean }) {
  return (
    <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-600 ${active ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0 bg-dark-950" />
      {/* Radial burst */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`w-96 h-96 rounded-full border border-mint-400/20 transition-all duration-700 ${active ? 'scale-150 opacity-0' : 'scale-0 opacity-100'}`}
          style={{ transition: 'all 0.8s ease-out' }} />
      </div>
      <div className="relative z-10 flex flex-col items-center space-y-4">
        <img
          src="/logo.png"
          alt="Wings River Café"
          className={`w-28 h-28 rounded-2xl object-cover shadow-2xl border-2 border-gold-400/40 transition-all duration-500 ${active ? 'scale-110 opacity-100' : 'scale-50 opacity-0'}`}
          style={{ transitionDelay: '100ms' }}
        />
        <div className={`text-center transition-all duration-500 ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '250ms' }}>
          <h2 className="font-serif text-3xl font-extrabold text-white">Wings River Café</h2>
          <p className="text-xs text-mint-300 tracking-widest font-semibold mt-1" style={{ color: '#8FD3C7' }}>LUCKNOW WATER SPORTS · LAXMAN MELA GROUND</p>
        </div>
        {/* Loading dots */}
        <div className={`flex space-x-2 mt-2 transition-all duration-300 ${active ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '400ms' }}>
          {[0, 150, 300].map((delay) => (
            <div
              key={delay}
              className="w-2.5 h-2.5 rounded-full animate-bounce"
              style={{
                background: 'linear-gradient(135deg, #8FD3C7, #FFD700)',
                animationDelay: `${delay}ms`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────
export default function LoadingScreen() {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Play ambient water, engine, sizzle & chime sound via Web Audio API
  const playWaterSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const tNow = ctx.currentTime;

      // 1. Create a common noise buffer for water spray & food sizzle
      const bufferSize = ctx.sampleRate * 4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = buffer;
      noiseNode.loop = true;

      // Filter for noise (we animate frequency over time)
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.Q.value = 1.0;

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0, tNow);

      noiseNode.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noiseNode.start();

      // ── SCENE 1: Jet Ski Water Spray & Engine Hum (0.0s to 1.1s) ──────────
      // Spray: bandpass around 900Hz
      noiseFilter.frequency.setValueAtTime(950, tNow);
      noiseGain.gain.linearRampToValueAtTime(0.08, tNow + 0.1);
      
      // Engine Hum: sawtooth oscillator modulated
      const engineOsc = ctx.createOscillator();
      const engineGain = ctx.createGain();
      engineOsc.type = 'sawtooth';
      engineOsc.frequency.setValueAtTime(55, tNow);
      engineGain.gain.setValueAtTime(0, tNow);
      engineGain.gain.linearRampToValueAtTime(0.12, tNow + 0.2);

      // Modulator for engine vibration (LFO)
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 8; // Hz vibration
      lfoGain.gain.value = 6;  // Mod depth
      lfo.connect(lfoGain);
      lfoGain.connect(engineOsc.frequency);

      engineOsc.connect(engineGain);
      engineGain.connect(ctx.destination);
      lfo.start();
      engineOsc.start();

      // Fade out Jet Ski (ends at 1.1s)
      noiseGain.gain.setValueAtTime(0.08, tNow + 0.9);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, tNow + 1.1);
      engineGain.gain.setValueAtTime(0.12, tNow + 0.9);
      engineGain.gain.exponentialRampToValueAtTime(0.001, tNow + 1.15);

      // Clean up engine osc nodes
      setTimeout(() => {
        try { lfo.stop(); engineOsc.stop(); } catch {}
      }, 1300);

      // ── SCENE 2: Food Sizzling Platter (1.1s to 2.2s) ───────────────────
      const tSizzle = tNow + 1.1;
      // Highpass/Bandpass at 7500Hz for high sizzle sound
      setTimeout(() => {
        try {
          noiseFilter.type = 'highpass';
          noiseFilter.frequency.setValueAtTime(6500, tSizzle);
        } catch {}
      }, 1080);
      noiseGain.gain.setValueAtTime(0, tSizzle);
      noiseGain.gain.linearRampToValueAtTime(0.09, tSizzle + 0.1);
      noiseGain.gain.setValueAtTime(0.09, tSizzle + 0.9);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, tSizzle + 1.1);

      // ── SCENE 3: Gentle River Waves (2.2s to 3.1s) ──────────────────────
      const tWaves = tNow + 2.2;
      setTimeout(() => {
        try {
          noiseFilter.type = 'bandpass';
          noiseFilter.Q.value = 0.6;
          noiseFilter.frequency.setValueAtTime(320, tWaves);
        } catch {}
      }, 2180);
      // Wave sound swell (0.28Hz LFO effect simulated via envelopes)
      noiseGain.gain.setValueAtTime(0, tWaves);
      noiseGain.gain.linearRampToValueAtTime(0.08, tWaves + 0.3); // swell
      noiseGain.gain.linearRampToValueAtTime(0.02, tWaves + 0.65); // fall
      noiseGain.gain.linearRampToValueAtTime(0.001, tWaves + 0.9); // fade

      // ── SCENE 4: Welcome Chime Chord (3.1s to 3.7s) ─────────────────────
      const tChime = tNow + 3.1;
      const oscC = ctx.createOscillator();
      const oscE = ctx.createOscillator();
      const oscG = ctx.createOscillator();
      const chimeGain = ctx.createGain();

      oscC.frequency.value = 523.25; // C5
      oscE.frequency.value = 659.25; // E5
      oscG.frequency.value = 783.99; // G5

      oscC.type = 'sine';
      oscE.type = 'sine';
      oscG.type = 'sine';

      chimeGain.gain.setValueAtTime(0, tChime);
      chimeGain.gain.linearRampToValueAtTime(0.07, tChime + 0.05);
      chimeGain.gain.exponentialRampToValueAtTime(0.001, tChime + 0.6);

      oscC.connect(chimeGain);
      oscE.connect(chimeGain);
      oscG.connect(chimeGain);
      chimeGain.connect(ctx.destination);

      oscC.start(tChime);
      oscE.start(tChime);
      oscG.start(tChime);

      setTimeout(() => {
        try {
          oscC.stop(); oscE.stop(); oscG.stop();
          noiseNode.stop();
        } catch {}
      }, 4000);

    } catch {
      // silently ignore if audio not supported
    }
  };

  const [isFastIntro, setIsFastIntro] = useState(false);

  useEffect(() => {
    const hasSeen = typeof window !== 'undefined' ? sessionStorage.getItem('wings_intro_seen') : null;
    
    if (hasSeen) {
      // Fast 700ms branding reveal for returning navigation in same session
      setIsFastIntro(true);
      setSceneIndex(3);
      const fTimer = setTimeout(() => setFadeOut(true), 600);
      const uTimer = setTimeout(() => setVisible(false), 1200);
      return () => {
        clearTimeout(fTimer);
        clearTimeout(uTimer);
      };
    }

    // Mark intro seen for current session
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('wings_intro_seen', 'true');
    }

    // Play full ambient sound and scene progression
    playWaterSound();

    let elapsed = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    SCENES.forEach((scene, index) => {
      const t = setTimeout(() => {
        setSceneIndex(index);
      }, elapsed);
      timers.push(t);
      elapsed += scene.duration;
    });

    // Fade out and unmount with 60fps ease
    const fadeTimer = setTimeout(() => setFadeOut(true), TOTAL_DURATION);
    const unmountTimer = setTimeout(() => setVisible(false), TOTAL_DURATION + 800);
    timers.push(fadeTimer, unmountTimer);

    return () => {
      timers.forEach(clearTimeout);
      audioCtxRef.current?.close();
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[300] transition-all duration-700 gpu-accelerated ${
        fadeOut ? 'opacity-0 scale-105 blur-sm pointer-events-none' : 'opacity-100 scale-100 blur-0'
      }`}
      style={{
        background: '#000',
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {/* Scene 0: Jet Ski */}
      <div className={`absolute inset-0 bg-gradient-to-br ${SCENES[0].bg} transition-opacity duration-500 ${sceneIndex === 0 ? 'opacity-100' : 'opacity-0'}`}>
        <JetSkiScene active={sceneIndex === 0} />
      </div>

      {/* Scene 1: Food */}
      <div className={`absolute inset-0 bg-gradient-to-br ${SCENES[1].bg} transition-opacity duration-500 ${sceneIndex === 1 ? 'opacity-100' : 'opacity-0'}`}>
        <FoodScene active={sceneIndex === 1} />
      </div>

      {/* Scene 2: River Night */}
      <div className={`absolute inset-0 bg-gradient-to-br ${SCENES[2].bg} transition-opacity duration-500 ${sceneIndex === 2 ? 'opacity-100' : 'opacity-0'}`}>
        <RiverScene active={sceneIndex === 2} />
      </div>

      {/* Scene 3: Outro / Logo */}
      <div className={`absolute inset-0 transition-opacity duration-500 ${sceneIndex === 3 ? 'opacity-100' : 'opacity-0'}`}>
        <OutroScene active={sceneIndex === 3} />
      </div>

      {/* Progress bar at top */}
      {!isFastIntro && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 z-50">
          <div
            className="h-full bg-gradient-to-r from-mint-400 via-gold-400 to-mint-300 transition-all duration-700 ease-out"
            style={{
              width: `${((sceneIndex + 1) / SCENES.length) * 100}%`,
            }}
          />
        </div>
      )}

      {/* Skip Intro Button */}
      {!isFastIntro && (
        <button
          onClick={() => { setFadeOut(true); setTimeout(() => setVisible(false), 500); }}
          className="absolute top-5 right-5 z-50 px-4 py-1.5 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/20 text-white/90 text-xs font-bold transition-all hover:scale-105 active:scale-95"
        >
          Skip Intro ➔
        </button>
      )}

      {/* Scene dots indicator */}
      {!isFastIntro && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-50">
          {SCENES.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-500 ${
                i === sceneIndex ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/30'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
