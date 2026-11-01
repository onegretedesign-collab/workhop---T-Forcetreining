import React, { useState } from 'react';
import { SPEAKERS } from '../data/summitData';
import { SpeakerPosterCard } from './SpeakerPosterCard';
import { SpeakerDetailModal } from './SpeakerDetailModal';
import { Sparkles } from 'lucide-react';

interface SpeakersSectionProps {
  onOpenCheckout?: () => void;
}

export const SpeakersSection: React.FC<SpeakersSectionProps> = ({ onOpenCheckout }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenSpeaker = (index: number) => {
    setCurrentIndex(index);
    setModalOpen(true);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % SPEAKERS.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + SPEAKERS.length) % SPEAKERS.length);
  };

  const currentSpeaker = SPEAKERS[currentIndex];

  return (
    <section id="palestrantes" className="py-20 sm:py-28 bg-[#0A0A0A] border-b border-neutral-900 relative">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-10 w-96 h-96 bg-[#E50914]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#E50914]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#E50914] font-semibold mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Line-up Oficial · 6 Keynotes</span>
            </div>
            {/* Title styled with Poppins and red period just like the video */}
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white font-display tracking-tight">
              Palestrantes que <span className="text-[#E50914]">Inspiram.</span>
            </h2>
            <p className="mt-3 text-sm sm:text-base text-neutral-400 max-w-xl">
              Clique em qualquer palestrante para expandir os detalhes da palestra, biografia completa e ementa.
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-800 bg-neutral-900/60 text-xs font-mono font-medium text-neutral-300 shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#E50914] animate-pulse" />
            <span>6 Palestrantes Confirmados</span>
          </div>
        </div>

        {/* 6-Cards Grid: 3 cards on top and 3 cards below */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {SPEAKERS.map((speaker, index) => (
            <div key={speaker.id} className="flex justify-center">
              <SpeakerPosterCard
                speaker={speaker}
                onClick={() => handleOpenSpeaker(index)}
                className="w-full max-w-[380px]"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Expanded Split Modal (Matches the video view with Left/Right card navigation) */}
      <SpeakerDetailModal
        speaker={currentSpeaker}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onNext={handleNext}
        onPrev={handlePrev}
        currentIndex={currentIndex}
        totalSpeakers={SPEAKERS.length}
        onOpenCheckout={onOpenCheckout}
      />
    </section>
  );
};
