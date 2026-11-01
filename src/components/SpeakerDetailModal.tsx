import React, { useEffect, useState } from 'react';
import { Speaker } from '../data/summitData';
import { SpeakerPosterCard } from './SpeakerPosterCard';
import { ChevronLeft, ChevronRight, X, Calendar, Share2, Check, ArrowRight } from 'lucide-react';

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
  currentIndex,
  totalSpeakers,
  onOpenCheckout,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onNext, onPrev, onClose]);

  if (!isOpen || !speaker) return null;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `Palestra de ${speaker.name} no WORKSHOP - T-Forcetreining: "${speaker.talkTitle}"`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownloadCalendar = () => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//WORKSHOP - T-FORCETREINING 2026//PT-BR
BEGIN:VEVENT
SUMMARY:${speaker.talkTitle} - ${speaker.name}
DESCRIPTION:${speaker.talkDescription}
LOCATION:WTC Events Center, Auditório Master Pro - São Paulo
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${speaker.name.replace(/\s+/g, '_')}_WORKSHOP_T_FORCETREINING.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 lg:p-8 bg-black/90 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="speaker-modal-title"
    >
      {/* Modal Dialog Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl bg-[#0D0D0D] border border-neutral-800 rounded-[2.2rem] shadow-2xl p-6 sm:p-10 lg:p-12 my-6 overflow-hidden"
      >
        {/* Close Button top-right */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar palestra"
          className="absolute top-5 right-5 sm:top-7 sm:right-7 p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors z-30"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Counter indicator */}
        <div className="absolute top-6 left-8 text-xs font-mono text-neutral-500 hidden sm:block">
          PALESTRANTE {currentIndex + 1} DE {totalSpeakers}
        </div>

        {/* Main Split Grid (Matches Video layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mt-4 sm:mt-2">
          {/* Left Column: Poster Card with floating Left and Right circular arrow buttons */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            {/* The Left Navigation Arrow on the edge of the card */}
            <button
              type="button"
              onClick={onPrev}
              aria-label="Palestrante anterior"
              className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#181818] border border-neutral-700 hover:border-[#E50914] text-white hover:bg-[#E50914] shadow-2xl flex items-center justify-center transition-all cursor-pointer group"
            >
              <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
            </button>

            {/* Poster Card Container */}
            <div className="w-full max-w-[340px] sm:max-w-[370px]">
              <SpeakerPosterCard speaker={speaker} isModalView={true} />
            </div>

            {/* The Right Navigation Arrow on the edge of the card */}
            <button
              type="button"
              onClick={onNext}
              aria-label="Próximo palestrante"
              className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#181818] border border-neutral-700 hover:border-[#E50914] text-white hover:bg-[#E50914] shadow-2xl flex items-center justify-center transition-all cursor-pointer group"
            >
              <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Right Column: Speaker Detail Content */}
          <div className="lg:col-span-7 space-y-5 text-left">
            {/* Category / Track label */}
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-widest text-[#E50914]">
                {speaker.category}
              </span>
              <span aria-hidden="true" className="text-neutral-600">·</span>
              <span className="text-xs font-mono text-neutral-400">
                {speaker.time} · PALCO MASTER
              </span>
            </div>

            {/* Speaker Name */}
            <h2
              id="speaker-modal-title"
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-display tracking-tight leading-tight"
            >
              {speaker.name}
            </h2>

            {/* Role & Company */}
            <p className="text-sm font-semibold text-neutral-300 font-mono">
              {speaker.role} · <span className="text-[#E50914]">{speaker.company}</span>
            </p>

            {/* Talk Title */}
            <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 block mb-1">
                TEMA DA SESSÃO
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                "{speaker.talkTitle}"
              </h3>
            </div>

            {/* Detailed Description (Just like in the video) */}
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-xl">
              {speaker.talkDescription}
            </p>

            {/* Key Takeaways */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#E50914] font-semibold block">
                Destaques do Conteúdo
              </span>
              <ul className="space-y-1 text-xs text-neutral-400">
                {speaker.keyTakeaways.slice(0, 2).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#E50914] font-bold">›</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons (Matches the video: FECHAR PALESTRA and VOLTAR) */}
            <div className="pt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs uppercase tracking-wider transition-all"
              >
                Fechar Palestra
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-xl border border-[#E50914] text-[#E50914] hover:bg-[#E50914] hover:text-white font-bold text-xs uppercase tracking-wider transition-all"
              >
                Voltar
              </button>

              {onOpenCheckout && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCheckout();
                  }}
                  className="px-6 py-3 rounded-xl bg-[#E50914] hover:bg-[#b80710] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#E50914]/20 inline-flex items-center gap-1.5"
                >
                  <span>Garanta já sua vaga</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={handleDownloadCalendar}
                title="Adicionar ao Calendário (.ics)"
                className="p-3 rounded-xl bg-neutral-900 border border-neutral-700 hover:text-white text-neutral-400 transition-colors ml-auto hidden sm:flex"
              >
                <Calendar className="w-4 h-4 text-[#E50914]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
