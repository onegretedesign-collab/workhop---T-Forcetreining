import React, { useState } from 'react';
import { Speaker } from '../data/summitData';
import { Sparkles, Maximize2 } from 'lucide-react';

interface SpeakerPosterCardProps {
  speaker: Speaker;
  onClick?: () => void;
  className?: string;
  isModalView?: boolean;
}

export const SpeakerPosterCard: React.FC<SpeakerPosterCardProps> = ({
  speaker,
  onClick,
  className = '',
  isModalView = false,
}) => {
  const [showPurePhoto, setShowPurePhoto] = useState(false);

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`group relative select-none rounded-[2rem] sm:rounded-[2.4rem] bg-[#0E0E0E] border border-neutral-800 ${
        onClick
          ? 'hover:border-[#E50914] cursor-pointer hover:shadow-2xl hover:shadow-[#E50914]/25 hover:-translate-y-1'
          : ''
      } transition-all duration-300 p-6 sm:p-7 flex flex-col justify-between overflow-hidden min-h-[480px] sm:min-h-[520px] ${className}`}
    >
      {/* Background ambient crimson glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#E50914]/15 rounded-full blur-3xl pointer-events-none group-hover:bg-[#E50914]/25 transition-all" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#E50914]/10 rounded-full blur-2xl pointer-events-none" />

      {/* Full speaker photo background - completely replaces circular avatar */}
      <img
        src={speaker.photoUrl}
        alt={speaker.name}
        className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 pointer-events-none"
        loading="lazy"
      />

      {/* Top subtle dark gradient vignette for readable text */}
      {!showPurePhoto && (
        <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-[#0A0A0A]/95 via-[#0A0A0A]/70 to-transparent pointer-events-none transition-opacity duration-300" />
      )}

      {/* Bottom dark gradient vignette for readable speaker name */}
      {!showPurePhoto && (
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/85 to-transparent pointer-events-none transition-opacity duration-300" />
      )}

      {/* Subtle border highlight */}
      <div className="absolute inset-0 rounded-[2rem] sm:rounded-[2.4rem] ring-1 ring-inset ring-white/10 group-hover:ring-[#E50914]/40 transition-colors pointer-events-none" />

      {/* Top Section: Watermark & Hook Quote */}
      <div
        className={`relative z-10 transition-opacity duration-300 ${
          showPurePhoto ? 'opacity-0 hover:opacity-100' : ''
        }`}
      >
        <div className="flex items-center justify-between pb-2 text-[10px] font-mono tracking-widest uppercase">
          <span className="text-[#E50914] font-semibold flex items-center gap-1 bg-black/70 px-2.5 py-1 rounded-full border border-neutral-800/80 backdrop-blur-md">
            <Sparkles className="w-3 h-3" />
            <span>T-FORCE '26</span>
          </span>
          <div className="flex items-center gap-2">
            {isModalView && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPurePhoto((prev) => !prev);
                }}
                title={showPurePhoto ? 'Mostrar informações' : 'Ver foto limpa'}
                className="bg-black/70 hover:bg-[#E50914] text-neutral-300 hover:text-white px-2 py-1 rounded-full border border-neutral-800/80 backdrop-blur-md text-[9px] font-mono transition-colors flex items-center gap-1"
              >
                <Maximize2 className="w-2.5 h-2.5" />
                <span>{showPurePhoto ? 'Poster' : 'Foto'}</span>
              </button>
            )}
            <span className="bg-black/70 px-2.5 py-1 rounded-full border border-neutral-800/80 backdrop-blur-md text-neutral-300">
              {speaker.time}
            </span>
          </div>
        </div>

        {/* Hook Quote (matches the video style: white headline with bold highlighted word) */}
        <h4 className="mt-2 text-sm sm:text-base font-medium text-white leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
          <span>{speaker.hookQuoteTop} </span>
          <span className="text-[#E50914] font-bold underline decoration-[#E50914]/60 underline-offset-4">
            {speaker.hookQuoteHighlight}
          </span>
        </h4>
      </div>

      {/* Center Section: Transparent open area for the full photo without circle */}
      <div className="flex-1 my-4 flex items-center justify-center relative z-10 pointer-events-none">
        {isModalView && !showPurePhoto && (
          <div className="absolute bottom-2 inset-x-0 mx-auto w-max px-3 py-1 rounded-full bg-black/85 border border-[#E50914]/50 text-[10px] font-mono text-neutral-200 backdrop-blur-md shadow-lg pointer-events-auto">
            PALESTRANTE OFICIAL
          </div>
        )}
      </div>

      {/* Bottom Section: Category, Bold Speaker Name & Branding */}
      <div
        className={`relative z-10 pt-3 transition-opacity duration-300 ${
          showPurePhoto ? 'opacity-0 hover:opacity-100' : ''
        }`}
      >
        <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-[#E50914] block drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
          {speaker.category}
        </span>

        <h3 className="text-xl sm:text-2xl font-extrabold text-white font-display tracking-tight mt-0.5 group-hover:text-[#ff4d4d] transition-colors leading-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
          {speaker.name}
        </h3>

        <div className="flex items-center justify-between text-xs text-neutral-300 mt-2 font-mono">
          <span className="text-[11px] truncate max-w-[200px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            {speaker.company}
          </span>
          <span className="text-[9px] text-neutral-400 uppercase tracking-widest bg-black/70 px-2 py-0.5 rounded-full border border-neutral-800/80 backdrop-blur-md">
            T-FORCE '26
          </span>
        </div>
      </div>
    </div>
  );
};
