import React, { useState, useEffect, useRef } from 'react';
import { Speaker } from '../data/summitData';
import { Sparkles, Maximize2, Image as ImageIcon, BookOpen, Clock, ChevronRight, CheckCircle2, Instagram, Ticket } from 'lucide-react';

interface SpeakerPosterCardProps {
  speaker: Speaker;
  onClick?: () => void;
  className?: string;
  isModalView?: boolean;
  onOpenCheckout?: () => void;
}

export const SpeakerPosterCard: React.FC<SpeakerPosterCardProps> = ({
  speaker,
  onClick,
  className = '',
  isModalView = false,
  onOpenCheckout,
}) => {
  const [showPurePhoto, setShowPurePhoto] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isManualRevealed, setIsManualRevealed] = useState<boolean | null>(null);
  const [fadeProgress, setFadeProgress] = useState(0);
  const [scrollRevealed, setScrollRevealed] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Track scroll position on mobile: as user scrolls the screen up, the card travels into view
  // and smoothly fades the photo, revealing the full speaker content
  useEffect(() => {
    if (isModalView) return;

    const handleScroll = () => {
      if (window.innerWidth >= 768) {
        setFadeProgress(0);
        setScrollRevealed(false);
        return;
      }

      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const vh = window.innerHeight;

      // Card mid point relative to viewport
      const cardMid = rect.top + rect.height * 0.45;
      const startPoint = vh * 0.88; // When card is entering lower portion of screen
      const endPoint = vh * 0.42;   // When card reaches prime reading area

      if (cardMid > startPoint) {
        setFadeProgress(0);
        setScrollRevealed(false);
      } else if (cardMid < endPoint) {
        setFadeProgress(1);
        setScrollRevealed(true);
      } else {
        const raw = (startPoint - cardMid) / (startPoint - endPoint);
        const clamped = Math.max(0, Math.min(1, raw));
        setFadeProgress(clamped);
        setScrollRevealed(clamped >= 0.45);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isModalView]);

  const isMobileActive = isMobile && !isModalView;

  // Active revealed state on mobile: manual tap takes precedence, otherwise tracks scroll
  const isRevealedOnMobile = isMobileActive && (
    isManualRevealed !== null ? isManualRevealed : scrollRevealed
  );

  // Smooth photo opacity on mobile
  const effectivePhotoOpacity = isMobileActive
    ? (isManualRevealed !== null
        ? (isManualRevealed ? 0.05 : 1)
        : Math.max(0.05, 1 - fadeProgress * 0.95))
    : 1;

  // Smooth info layer opacity on mobile
  const effectiveInfoOpacity = isMobileActive
    ? (isManualRevealed !== null
        ? (isManualRevealed ? 1 : 0)
        : fadeProgress)
    : 0;

  const handleCardClick = (e: React.MouseEvent) => {
    if (isMobileActive) {
      // Toggle manual reveal on mobile tap
      setIsManualRevealed((prev) => {
        const current = prev !== null ? prev : scrollRevealed;
        return !current;
      });
      return;
    }
    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      ref={cardRef}
      onClick={handleCardClick}
      role={onClick || isMobileActive ? 'button' : undefined}
      tabIndex={onClick || isMobileActive ? 0 : undefined}
      onKeyDown={(e) => {
        if ((onClick || isMobileActive) && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          if (isMobileActive) {
            setIsManualRevealed((prev) => !((prev !== null ? prev : scrollRevealed)));
          } else if (onClick) {
            onClick();
          }
        }
      }}
      className={`group relative select-none rounded-[2rem] sm:rounded-[2.4rem] bg-[#0E0E0E] border ${
        isRevealedOnMobile ? 'border-[#E50914]/70 shadow-2xl shadow-[#E50914]/20' : 'border-neutral-800'
      } ${
        onClick
          ? 'hover:border-[#E50914] cursor-pointer hover:shadow-2xl hover:shadow-[#E50914]/25 hover:-translate-y-1'
          : ''
      } transition-all duration-300 p-5 sm:p-7 flex flex-col justify-between overflow-hidden min-h-[500px] sm:min-h-[520px] ${className}`}
    >
      {/* Background ambient crimson glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#E50914]/15 rounded-full blur-3xl pointer-events-none group-hover:bg-[#E50914]/25 transition-all" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#E50914]/10 rounded-full blur-2xl pointer-events-none" />

      {/* Full speaker photo background */}
      <img
        src={speaker.photoUrl}
        alt={speaker.name}
        style={{
          opacity: effectivePhotoOpacity,
          transform: isRevealedOnMobile ? 'scale(0.98)' : 'scale(1)',
        }}
        className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-all duration-500 pointer-events-none"
        loading="lazy"
      />

      {/* Top subtle dark gradient vignette for readable text (when in photo mode) */}
      {!showPurePhoto && (!isMobileActive || !isRevealedOnMobile) && (
        <div
          style={{ opacity: isMobileActive ? effectivePhotoOpacity : 1 }}
          className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-[#0A0A0A]/95 via-[#0A0A0A]/70 to-transparent pointer-events-none transition-opacity duration-300"
        />
      )}

      {/* Bottom dark gradient vignette for readable speaker name (when in photo mode) */}
      {!showPurePhoto && (!isMobileActive || !isRevealedOnMobile) && (
        <div
          style={{ opacity: isMobileActive ? effectivePhotoOpacity : 1 }}
          className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/85 to-transparent pointer-events-none transition-opacity duration-300"
        />
      )}

      {/* Subtle border highlight */}
      <div className="absolute inset-0 rounded-[2rem] sm:rounded-[2.4rem] ring-1 ring-inset ring-white/10 group-hover:ring-[#E50914]/40 transition-colors pointer-events-none" />

      {/* ========================================================================= */}
      {/* DESKTOP & PHOTO MODE CONTENT: Title, quote & bottom badges                */}
      {/* ========================================================================= */}
      <div
        style={{
          opacity: isMobileActive ? (isRevealedOnMobile ? 0 : 1) : (showPurePhoto ? 0 : 1),
          pointerEvents: isMobileActive && isRevealedOnMobile ? 'none' : 'auto',
        }}
        className={`relative z-10 flex flex-col justify-between h-full flex-1 transition-opacity duration-300 ${
          isMobileActive && isRevealedOnMobile ? 'hidden' : 'flex'
        }`}
      >
        {/* Top Section: Watermark & Hook Quote */}
        <div>
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

              {/* On mobile: quick button to reveal content */}
              {isMobileActive && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsManualRevealed(true);
                  }}
                  className="bg-black/80 hover:bg-[#E50914] text-neutral-200 hover:text-white px-2.5 py-1 rounded-full border border-neutral-700/80 backdrop-blur-md text-[10px] font-mono transition-colors flex items-center gap-1"
                >
                  <BookOpen className="w-3 h-3 text-[#E50914]" />
                  <span>Conteúdo</span>
                </button>
              )}

              <span className="bg-black/70 px-2.5 py-1 rounded-full border border-neutral-800/80 backdrop-blur-md text-neutral-300">
                {speaker.time}
              </span>
            </div>
          </div>

          {/* Hook Quote */}
          <h4 className="mt-2 text-sm sm:text-base font-medium text-white leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            <span>{speaker.hookQuoteTop} </span>
            <span className="text-[#E50914] font-bold underline decoration-[#E50914]/60 underline-offset-4">
              {speaker.hookQuoteHighlight}
            </span>
          </h4>
        </div>

        {/* Center Section: Transparent open area */}
        <div className="flex-1 my-4 flex items-center justify-center relative z-10 pointer-events-none">
          {isModalView && !showPurePhoto && (
            <div className="absolute bottom-2 inset-x-0 mx-auto w-max px-3 py-1 rounded-full bg-black/85 border border-[#E50914]/50 text-[10px] font-mono text-neutral-200 backdrop-blur-md shadow-lg pointer-events-auto">
              PALESTRANTE OFICIAL
            </div>
          )}
        </div>

        {/* Bottom Section: Category, Bold Speaker Name & Branding */}
        <div className="pt-3">
          <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-[#E50914] block drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            {speaker.category}
          </span>

          <h3 className="text-xl sm:text-2xl font-extrabold text-white font-display tracking-tight mt-0.5 group-hover:text-[#ff4d4d] transition-colors leading-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
            {speaker.name}
          </h3>

          {speaker.instagram && (
            <span className="text-xs sm:text-sm font-bold text-[#E50914] font-mono block mt-1 tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
              {speaker.instagram}
            </span>
          )}

          <div className="flex items-center justify-between text-xs text-neutral-300 mt-2 font-mono">
            <span className="text-[11px] truncate max-w-[200px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              {speaker.company}
            </span>
            <span className="text-[9px] text-neutral-400 uppercase tracking-widest bg-black/70 px-2 py-0.5 rounded-full border border-neutral-800/80 backdrop-blur-md">
              T-FORCE '26
            </span>
          </div>

          {/* Mobile indicator prompting tap/scroll to read content */}
          {isMobileActive && (
            <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between">
              <span className="text-[10px] text-neutral-300 font-mono flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#E50914] animate-pulse" />
                <span>Toque para ver o conteúdo</span>
              </span>
              <span className="text-[10px] font-bold text-[#E50914] bg-[#E50914]/15 px-2 py-0.5 rounded-full border border-[#E50914]/30">
                Ler Detalhes ↓
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE REVEALED INFORMATION PANEL: Fades in place of photo                */}
      {/* Allows spectator to read and understand all the speaker's content         */}
      {/* ========================================================================= */}
      {isMobileActive && (
        <div
          style={{
            opacity: effectiveInfoOpacity,
            pointerEvents: isRevealedOnMobile ? 'auto' : 'none',
          }}
          className={`absolute inset-0 z-20 p-5 sm:p-6 bg-[#0E0E0E]/95 backdrop-blur-md flex flex-col justify-between overflow-y-auto transition-opacity duration-300 ${
            isRevealedOnMobile ? 'flex' : 'hidden'
          }`}
        >
          {/* Top Header inside revealed content */}
          <div>
            <div className="flex items-center justify-between pb-2 text-[10px] font-mono tracking-widest uppercase border-b border-neutral-800/80">
              <span className="text-[#E50914] font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>{speaker.category}</span>
              </span>

              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-neutral-300 bg-neutral-900 px-2 py-0.5 rounded-full border border-neutral-800">
                  <Clock className="w-3 h-3 text-[#E50914]" />
                  <span>{speaker.time}</span>
                </span>

                {/* Button to toggle back to photo */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsManualRevealed(false);
                  }}
                  className="bg-neutral-900 hover:bg-[#E50914] text-neutral-200 hover:text-white px-2.5 py-1 rounded-full border border-neutral-700 text-[10px] font-mono transition-colors flex items-center gap-1"
                >
                  <ImageIcon className="w-3 h-3 text-[#E50914]" />
                  <span>Ver Foto</span>
                </button>
              </div>
            </div>

            {/* Speaker Name & Subtitle */}
            <div className="mt-3">
              <h3 className="text-xl font-extrabold text-white font-display tracking-tight leading-snug">
                {speaker.name}
              </h3>
              <p className="text-xs text-neutral-300 font-medium mt-0.5">
                {speaker.role} · <span className="text-neutral-400">{speaker.company}</span>
              </p>
              {speaker.instagram && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#E50914] font-mono mt-1">
                  <Instagram className="w-3 h-3" />
                  <span>{speaker.instagram}</span>
                </span>
              )}
            </div>

            {/* Talk Theme / Title */}
            <div className="mt-3.5 p-3 rounded-xl bg-neutral-900/90 border border-neutral-800/90">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#E50914] block">
                Tema da Palestra
              </span>
              <h4 className="text-sm font-bold text-white mt-1 leading-snug">
                "{speaker.talkTitle}"
              </h4>
            </div>

            {/* Bio / Description */}
            <div className="mt-3">
              <p className="text-xs text-neutral-300 leading-relaxed">
                {speaker.talkDescription}
              </p>
            </div>

            {/* Key Takeaways / What will be taught */}
            {speaker.keyTakeaways && speaker.keyTakeaways.length > 0 && (
              <div className="mt-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
                  O que você vai dominar:
                </span>
                <ul className="space-y-1.5">
                  {speaker.keyTakeaways.map((takeaway, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 text-xs text-neutral-200 leading-snug">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#E50914] shrink-0 mt-0.5" />
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Bottom Actions inside revealed content */}
          <div className="mt-4 pt-3 border-t border-neutral-800 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              {onClick && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-medium text-white flex items-center justify-center gap-1 transition-colors"
                >
                  <span>Ementa Completa</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#E50914]" />
                </button>
              )}

              {onOpenCheckout && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenCheckout();
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#E50914] hover:bg-[#b80710] text-xs font-bold text-white flex items-center justify-center gap-1 shadow-lg shadow-[#E50914]/25 transition-colors"
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span>Garantir Vaga</span>
                </button>
              )}
            </div>

            <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono pt-1">
              <span>Toque no card para alternar foto</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsManualRevealed(false);
                }}
                className="text-[#E50914] underline underline-offset-2 hover:text-white"
              >
                Voltar à foto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

