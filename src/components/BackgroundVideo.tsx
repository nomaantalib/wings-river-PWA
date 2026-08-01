'use client';

import React, { useState, useRef, useEffect } from 'react';

// Both Gemini videos play in continuation, looping seamlessly
const VIDEOS = [
  '/videos/gemini_generated_video_d2d858f7.mp4',
  '/videos/gemini_generated_video_5c810dd6.mp4',
];

export default function BackgroundVideo() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [nextVideoIndex, setNextVideoIndex]     = useState(1);
  const [isTransitioning, setIsTransitioning]   = useState(false);

  const currentRef = useRef<HTMLVideoElement>(null);
  const nextRef    = useRef<HTMLVideoElement>(null);

  // Play current video on mount / index change
  useEffect(() => {
    if (currentRef.current) {
      currentRef.current.play().catch(() => {});
    }
  }, [currentVideoIndex]);

  // Pre-load next video
  useEffect(() => {
    if (nextRef.current) {
      nextRef.current.load();
    }
  }, [nextVideoIndex]);

  const handleVideoEnded = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      const next = (currentVideoIndex + 1) % VIDEOS.length;
      setCurrentVideoIndex(next);
      setNextVideoIndex((next + 1) % VIDEOS.length);
      setIsTransitioning(false);
    }, 500);
  };

  return (
    <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none select-none bg-[#070a0f]">
      {/* Current video */}
      <video
        ref={currentRef}
        key={`current-${currentVideoIndex}`}
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={handleVideoEnded}
        style={{
          opacity: isTransitioning ? 0 : 1,
          transition: 'opacity 0.6s ease-in-out',
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
        className="filter brightness-[0.38] contrast-[1.08] saturate-[0.85]"
      >
        <source src={VIDEOS[currentVideoIndex]} type="video/mp4" />
      </video>

      {/* Next video preloaded hidden */}
      <video
        ref={nextRef}
        key={`next-${nextVideoIndex}`}
        muted
        playsInline
        preload="auto"
        style={{ display: 'none' }}
      >
        <source src={VIDEOS[nextVideoIndex]} type="video/mp4" />
      </video>

      {/* Ambient Dark Overlay */}
      <div className="absolute inset-0 bg-[#070a0f]/75 backdrop-blur-[2px]" />
    </div>
  );
}
