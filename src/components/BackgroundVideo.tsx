'use client';

import React, { useState, useRef, useEffect } from 'react';

const VIDEOS = [
  '/videos/gemini_generated_video_5c810dd6.mp4',
  '/videos/gemini_generated_video_d2d858f7.mp4',
];

export default function BackgroundVideo() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoEnded = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentVideoIndex((prev) => (prev + 1) % VIDEOS.length);
      setIsTransitioning(false);
    }, 400);
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay policy fallback
      });
    }
  }, [currentVideoIndex]);

  return (
    <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none select-none bg-[#070a0f]">
      <video
        ref={videoRef}
        key={VIDEOS[currentVideoIndex]}
        autoPlay
        muted
        playsInline
        preload="metadata"
        onEnded={handleVideoEnded}
        style={{
          opacity: isTransitioning ? 0 : 1,
          transition: 'opacity 0.5s ease-in-out',
        }}
        className="w-full h-full object-cover filter brightness-[0.38] contrast-[1.08] saturate-[0.85]"
      >
        <source src={VIDEOS[currentVideoIndex]} type="video/mp4" />
      </video>

      {/* Ambient Dark Overlay */}
      <div className="absolute inset-0 bg-[#070a0f]/75 backdrop-blur-[2px]" />
    </div>
  );
}
