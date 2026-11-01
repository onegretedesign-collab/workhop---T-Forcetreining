import React from 'react';

interface SpeakerAvatarProps {
  seed: string;
  name: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const SpeakerAvatar: React.FC<SpeakerAvatarProps> = ({
  seed,
  name,
  className = '',
  size = 'md',
}) => {
  // Speaker SVG stylized artistic illustrations with red accent lighting
  const initials = name
    .split(' ')
    .filter((n) => !n.startsWith('Dra.') && !n.startsWith('Dr.'))
    .slice(0, 2)
    .map((n) => n[0])
    .join('');

  const sizeClasses = {
    sm: 'w-12 h-12 text-sm',
    md: 'w-20 h-20 text-lg',
    lg: 'w-32 h-32 text-2xl',
    xl: 'w-48 h-48 text-3xl',
  }[size];

  // Tailored SVG artistic avatar gradients per speaker
  const avatarVisuals: Record<string, { bg: string; grad: string; accent: string; icon: string }> = {
    sofia: {
      bg: 'from-neutral-900 to-[#140304]',
      grad: '#E50914',
      accent: '#ff4d4d',
      icon: 'AI',
    },
    marcus: {
      bg: 'from-neutral-900 to-[#120606]',
      grad: '#b80710',
      accent: '#E50914',
      icon: 'DS',
    },
    helena: {
      bg: 'from-neutral-900 to-[#190305]',
      grad: '#E50914',
      accent: '#ff6666',
      icon: 'SEC',
    },
    rodrigo: {
      bg: 'from-neutral-900 to-[#0e0404]',
      grad: '#E50914',
      accent: '#ff3333',
      icon: 'OPS',
    },
    beatriz: {
      bg: 'from-neutral-900 to-[#180405]',
      grad: '#d40812',
      accent: '#ff5050',
      icon: 'FIN',
    },
    gabriel: {
      bg: 'from-neutral-900 to-[#110304]',
      grad: '#E50914',
      accent: '#ff4444',
      icon: 'DAT',
    },
  };

  const visual = avatarVisuals[seed] || {
    bg: 'from-neutral-900 to-neutral-950',
    grad: '#E50914',
    accent: '#ff4d4d',
    icon: 'SPK',
  };

  return (
    <div
      className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${visual.bg} border border-neutral-800 flex items-center justify-center shrink-0 ${sizeClasses} ${className}`}
    >
      <svg
        className="absolute inset-0 w-full h-full opacity-40 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="20%" cy="20%" r="35%" fill={visual.grad} fillOpacity="0.3" filter="blur(8px)" />
        <circle cx="80%" cy="80%" r="40%" fill="#E50914" fillOpacity="0.25" filter="blur(10px)" />
        <path
          d="M0,40 Q30,10 60,40 T120,40"
          stroke="#E50914"
          strokeWidth="1"
          strokeOpacity="0.3"
          fill="none"
        />
      </svg>

      {/* Stylized monogram & human tech indicator */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <span className="font-extrabold tracking-tight text-white font-display">
          {initials}
        </span>
        <span className="text-[9px] tracking-wider font-mono text-[#E50914] font-semibold mt-0.5 uppercase">
          {visual.icon}
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-[#E50914] to-transparent opacity-80" />
    </div>
  );
};
