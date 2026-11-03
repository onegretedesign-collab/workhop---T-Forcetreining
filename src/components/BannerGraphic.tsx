import React from 'react';

interface BannerGraphicProps {
  bannerUrl: string;
  className?: string;
  showTitleOverlay?: boolean;
  compact?: boolean;
}

export const BannerGraphic: React.FC<BannerGraphicProps> = ({
  bannerUrl,
  className = '',
  showTitleOverlay = false,
  compact = false,
}) => {
  const isCustomImage =
    bannerUrl.startsWith('data:') ||
    bannerUrl.startsWith('http://') ||
    bannerUrl.startsWith('https://') ||
    bannerUrl.startsWith('/assets/');

  if (isCustomImage) {
    return (
      <div className={`relative overflow-hidden bg-[#0A0A0A] flex items-center justify-center ${className}`}>
        <img
          src={bannerUrl}
          alt="Banner Oficial WORKSHOP - T-Forcetreining"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
          loading="eager"
          decoding="async"
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            if (!target.src.includes('banner-dragon.png')) {
              target.src = '/assets/banner-dragon.png';
            }
          }}
        />

        {showTitleOverlay && (
          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 pointer-events-none bg-gradient-to-t from-[#0A0A0A]/85 via-transparent to-transparent">
            <span className="text-xs uppercase tracking-widest text-[#E50914] font-semibold">
              WORKSHOP - T-FORCETREINING · CONGRESSO
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mt-1">
              PERFORMANCE 360º
            </h2>
          </div>
        )}
      </div>
    );
  }

  // Preset 1: Crimson Vortex (Default)
  if (bannerUrl === 'preset://crimson-vortex' || !bannerUrl) {
    return (
      <div className={`relative overflow-hidden bg-[#0A0A0A] ${className}`}>
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1920 1080"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="vortexGlow" cx="65%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#E50914" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#E50914" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#0A0A0A" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="laserLine" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E50914" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ff4d4d" stopOpacity="0.1" />
            </linearGradient>
            <pattern id="gridDots" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.2" fill="#E50914" fillOpacity="0.18" />
            </pattern>
          </defs>

          {/* Dark textured base */}
          <rect width="100%" height="100%" fill="#0A0A0A" />
          <rect width="100%" height="100%" fill="url(#gridDots)" />
          <circle cx="70%" cy="35%" r="420" fill="url(#vortexGlow)" />

          {/* Dynamic geometric arcs and angles */}
          <path
            d="M -100 600 Q 400 100 1200 400 T 2000 200"
            fill="none"
            stroke="url(#laserLine)"
            strokeWidth="3.5"
            strokeDasharray="8 6"
            opacity="0.75"
          />
          <path
            d="M 100 700 Q 600 200 1400 500"
            fill="none"
            stroke="#E50914"
            strokeWidth="1.5"
            opacity="0.4"
          />
          <circle cx="72%" cy="38%" r="160" fill="none" stroke="#E50914" strokeWidth="1.5" opacity="0.35" />
          <circle cx="72%" cy="38%" r="90" fill="none" stroke="#E50914" strokeWidth="2" strokeDasharray="6 4" opacity="0.5" />
          <circle cx="72%" cy="38%" r="14" fill="#E50914" opacity="0.9" />

          {/* Accent geometric lines */}
          <line x1="15%" y1="80%" x2="85%" y2="20%" stroke="#E50914" strokeWidth="1" opacity="0.2" />
        </svg>

        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/70 to-transparent pointer-events-none" />
        
        {showTitleOverlay && (
          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 pointer-events-none">
            <span className="text-xs uppercase tracking-widest text-[#E50914] font-semibold">
              WORKSHOP - T-FORCETREINING 2026 · SÃO PAULO
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mt-1">
              TECNOLOGIA, DESIGN & FUTURO
            </h2>
          </div>
        )}
      </div>
    );
  }

  // Preset 2: Cyber Grid
  if (bannerUrl === 'preset://cyber-grid') {
    return (
      <div className={`relative overflow-hidden bg-[#0A0A0A] ${className}`}>
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="cyberSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1a0204" />
              <stop offset="60%" stopColor="#0A0A0A" />
              <stop offset="100%" stopColor="#0A0A0A" />
            </linearGradient>
            <linearGradient id="cyberRed" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#E50914" stopOpacity="0" />
              <stop offset="50%" stopColor="#E50914" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#E50914" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#cyberSky)" />
          {/* Perspective grid lines */}
          {[-400, -200, 0, 200, 400, 600, 800, 1000, 1200, 1400, 1600].map((x, i) => (
            <line
              key={i}
              x1={x}
              y1="400"
              x2={700 + (x - 700) * 2.8}
              y2="900"
              stroke="#E50914"
              strokeWidth="1.2"
              strokeOpacity="0.3"
            />
          ))}
          {[420, 460, 520, 600, 720].map((y, i) => (
            <line
              key={`h-${i}`}
              x1="0"
              y1={y}
              x2="100%"
              y2={y}
              stroke="#E50914"
              strokeWidth="1"
              strokeOpacity={0.15 + i * 0.08}
            />
          ))}
          <line x1="0" y1="400" x2="100%" y2="400" stroke="url(#cyberRed)" strokeWidth="2.5" />
        </svg>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent pointer-events-none" />
      </div>
    );
  }

  // Preset 3: Minimal Red Studio Glow
  if (bannerUrl === 'preset://minimal-red-glow') {
    return (
      <div className={`relative overflow-hidden bg-[#0A0A0A] ${className}`}>
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#E50914]/30 blur-[100px]" />
        <div className="absolute -bottom-24 left-1/4 w-80 h-80 rounded-full bg-[#E50914]/20 blur-[90px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-transparent to-[#0A0A0A]/60" />
      </div>
    );
  }

  // Preset 4: Neural Circuit Core
  return (
    <div className={`relative overflow-hidden bg-[#0A0A0A] ${className}`}>
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E50914" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0A0A0A" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="#0A0A0A" />
        <circle cx="50%" cy="50%" r="300" fill="url(#coreGlow)" />
        <circle cx="50%" cy="50%" r="180" fill="none" stroke="#E50914" strokeWidth="1" opacity="0.3" />
        <circle cx="50%" cy="50%" r="120" fill="none" stroke="#E50914" strokeWidth="1.5" strokeDasharray="4 8" opacity="0.4" />
        <circle cx="50%" cy="50%" r="60" fill="none" stroke="#E50914" strokeWidth="2" opacity="0.6" />
      </svg>
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent pointer-events-none" />
    </div>
  );
};
