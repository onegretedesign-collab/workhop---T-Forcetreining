import React, { useEffect } from 'react';
import { Speaker, SUMMIT_EVENT } from '../data/summitData';
import { SpeakerPosterCard } from './SpeakerPosterCard';
import { ChevronLeft, ChevronRight, X, ArrowRight, Instagram } from 'lucide-react';

interface SpeakerDetailModalProps {
  speaker: Speaker | null;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  currentIndex: number;
  totalSpeakers: number;
  onOpenCheckout?: () => void;
}

export const SpeakerDetailModal: React.FC<SpeakerDetailModalProps> = ({
  speaker,
  isOpen,
  onClose,
  onNext,
  onPrev,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'Escape') onClose();
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onNext, onPrev, onClose]);

  if (!isOpen || !speaker) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 lg:p-12 bg-black/95 backdrop-blur-2xl overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="speaker-modal-title"
    >
      {/* Top-Right Circular Close Button (as in image_1d23f7cb.png) */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar"
        className="fixed top-5 right-5 sm:top-8 sm:right-8 z-50 w-11 h-11 rounded-full bg-white/10 hover:bg-[#E50914] text-white flex items-center justify-center transition-all cursor-pointer border border-white/10 hover:border-[#E50914] shadow-xl group"
      >
        <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
      </button>

      {/* Center Layout: Card on Left + Information on Right */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-6xl w-full mx-auto my-auto py-6 sm:py-10 flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16"
      >
        {/* Left Column: Poster Card with Circular Navigation Arrows on the borders */}
        <div className="relative flex items-center justify-center shrink-0 w-full max-w-[320px] sm:max-w-[360px]">
          {/* Left Arrow Button (ChevronLeft) */}
          <button
            type="button"
            onClick={onPrev}
            aria-label="Palestrante anterior"
            className="absolute -left-4 sm:-left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#E50914] hover:bg-[#b80710] text-white shadow-2xl flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95 border border-white/20"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* The Poster Card */}
          <div className="w-full">
            <SpeakerPosterCard speaker={speaker} isModalView={true} />
          </div>

          {/* Right Arrow Button (ChevronRight) */}
          <button
            type="button"
            onClick={onNext}
            aria-label="Próximo palestrante"
            className="absolute -right-4 sm:-right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#E50914] hover:bg-[#b80710] text-white shadow-2xl flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95 border border-white/20"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Right Column: Speaker Detail Content (styled faithfully to image_1d23f7cb.png) */}
        <div className="flex-1 max-w-xl text-left space-y-4">
          {/* Category / Area in accent color (matches `SOCIAL MEDIA`) */}
          <div className="text-xs sm:text-sm font-mono font-bold uppercase tracking-widest text-[#E50914] flex items-center gap-2">
            <span>{speaker.category}</span>
            <span className="text-neutral-600">·</span>
            <span className="text-neutral-400">{speaker.time}</span>
          </div>

          {/* Big Bold Speaker Name (matches `Criações que inspiram`) */}
          <h2
            id="speaker-modal-title"
            className="text-3xl sm:text-5xl font-extrabold text-white font-display tracking-tight leading-tight"
          >
            {speaker.name}
          </h2>

          {/* Instagram & Área de Atuação */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {speaker.instagram && (
              <a
                href={`https://instagram.com/${speaker.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold font-mono text-[#E50914] hover:text-white transition-colors bg-[#E50914]/10 hover:bg-[#E50914] border border-[#E50914]/30 px-3.5 py-1.5 rounded-full"
                title={`Ver perfil ${speaker.instagram} no Instagram`}
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>{speaker.instagram}</span>
              </a>
            )}

            <span className="text-xs sm:text-sm font-mono text-neutral-200 font-semibold">
              {speaker.role}
            </span>
          </div>

          {/* Talk Theme */}
          <div className="pt-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-bold block mb-1">
              Tema da Sessão:
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
              "{speaker.talkTitle}"
            </h3>
          </div>

          {/* Detailed Description (matches paragraph text in image_1d23f7cb.png) */}
          <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-normal pt-1">
            {speaker.talkDescription}
          </p>

          {/* Key Takeaways */}
          {speaker.keyTakeaways && speaker.keyTakeaways.length > 0 && (
            <div className="pt-1">
              <ul className="space-y-1.5 text-xs sm:text-sm text-neutral-400">
                {speaker.keyTakeaways.map((takeaway, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#E50914] font-bold">›</span>
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Bottom Action Buttons (matches `FECHAR PROJETO` and `VOLTAR` in image_1d23f7cb.png) */}
          <div className="pt-5 flex flex-wrap items-center gap-3">
            {/* Primary Filled Pill Button */}
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3.5 rounded-full bg-[#E50914] hover:bg-[#b80710] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#E50914]/30 cursor-pointer"
            >
              Fechar Palestra
            </button>

            {/* Secondary Outlined Pill Button */}
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3.5 rounded-full border border-neutral-600 hover:border-white text-neutral-200 hover:text-white font-bold text-xs uppercase tracking-wider transition-all bg-transparent cursor-pointer"
            >
              Voltar
            </button>

            {/* Quick Ticket Checkout Button */}
            <a
              href={SUMMIT_EVENT.checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-7 py-3.5 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-[#E50914] text-white font-bold text-xs uppercase tracking-wider transition-all inline-flex items-center gap-2 cursor-pointer shadow-md"
            >
              <span>Garanta já sua vaga</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#E50914]" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
