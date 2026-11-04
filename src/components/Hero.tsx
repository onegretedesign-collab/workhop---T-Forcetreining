import React from 'react';
import { SUMMIT_EVENT } from '../data/summitData';
import { BannerGraphic } from './BannerGraphic';
import { AddToCalendarButton } from './AddToCalendarButton';
import { MapPin, Clock, ArrowRight } from 'lucide-react';

interface HeroProps {
  bannerUrl: string;
  onOpenCheckout: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  bannerUrl,
  onOpenCheckout,
}) => {
  return (
    <section className="relative pt-6 pb-16 sm:pb-24 overflow-hidden border-b border-neutral-900">
      {/* Background radial accent glow */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#E50914]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[350px] h-[350px] bg-[#E50914]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Dragon 3D Illuminated Watermark Accent scaled +35% and opacity increased by +10% to 50% */}
        <div className="absolute -right-4 sm:-right-6 lg:-right-8 top-4 sm:-top-2 lg:-top-16 w-[405px] sm:w-[620px] lg:w-[756px] pointer-events-none z-0 select-none opacity-50">
          <img
            src="https://i.postimg.cc/ydZ6wzfN/IMG-8889.png"
            alt="Dragon Logo Glow"
            className="w-full h-auto object-contain drop-shadow-[0_0_50px_rgba(229,9,20,0.55)]"
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              if (!target.src.includes('hero-accent-dragon.png')) {
                target.src = '/assets/hero-accent-dragon.png';
              }
            }}
          />
        </div>


        {/* Main Headline - Official Logo replacing text in matching size */}
        <div className="max-w-4xl relative z-30">
          <h1 className="sr-only">
            Performance 360º: Hipertrofia, Hormonal, Nutrição, Tratamento de lesões de uma forma simples.
          </h1>

          <div className="w-full flex flex-col items-start">
            <div className="w-full max-w-[320px] sm:max-w-[420px]">
              <img
                src="/assets/logo-performance-360-trimmed.png"
                alt="Performance 360º"
                className="w-full h-auto object-contain filter drop-shadow-[0_8px_30px_rgba(0,0,0,0.8)]"
                loading="eager"
                decoding="async"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  if (!target.src.includes('LOGO-CONGRESSO-O-MUNDO-DA-MUSCULACAO-01-branco.png')) {
                    target.src = 'https://i.postimg.cc/bJ6pMtVR/LOGO-CONGRESSO-O-MUNDO-DA-MUSCULACAO-01-branco.png';
                  }
                }}
              />
            </div>

            {/* Action CTA: side-by-side (frente a frente) on mobile and centered with the page */}
            <div className="mt-6 sm:mt-8 w-full flex flex-row items-center justify-center sm:justify-start gap-2 sm:gap-3.5 flex-nowrap">
              <a
                href="#ingressos"
                className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-6 py-2.5 sm:py-3.5 text-xs sm:text-sm font-bold text-white bg-[#E50914] hover:bg-[#b80710] rounded-xl transition-all shadow-xl shadow-[#E50914]/25 hover:shadow-[#E50914]/40 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Garanta já sua vaga</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </a>

              <AddToCalendarButton />
            </div>
          </div>
        </div>

        {/* Dynamic & Responsive Hero Banner Container */}
        <div className="mt-12 sm:mt-16 relative z-10 group">
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#E50914]/30 via-neutral-800 to-[#E50914]/20 blur-xl opacity-50 group-hover:opacity-75 transition-opacity pointer-events-none" />

          <div className="relative rounded-2xl overflow-hidden border border-neutral-800 bg-[#0E0E0E] shadow-2xl">
            {/* Banner Graphic Viewport configured in 16:9 ratio */}
            <div className="w-full aspect-[16/9] relative bg-black">
              <BannerGraphic
                bannerUrl={bannerUrl}
                className="w-full h-full"
                showTitleOverlay={false}
              />
            </div>
          </div>
        </div>

        {/* Quick event highlights strip - 2 cards */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8 border-t border-neutral-800/80">
          <div className="flex items-start gap-3.5 p-4 rounded-xl bg-neutral-900/40 border border-neutral-800">
            <div className="w-10 h-10 rounded-lg bg-[#E50914]/10 border border-[#E50914]/25 flex items-center justify-center text-[#E50914] shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-mono text-neutral-400 block">
                Credenciamento
              </span>
              <span className="text-sm sm:text-base font-bold text-white">
                15:00
              </span>
              <p className="text-xs text-neutral-400 mt-0.5">
                Coffee break e entrega dos crachás
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-xl bg-neutral-900/40 border border-neutral-800">
            <div className="w-10 h-10 rounded-lg bg-[#E50914]/10 border border-[#E50914]/25 flex items-center justify-center text-[#E50914] shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-mono text-neutral-400 block">
                Localização
              </span>
              <span className="text-sm sm:text-base font-bold text-white">
                Academia Dragon
              </span>
              <p className="text-xs text-neutral-400 mt-0.5">
                Palco principal para o Performance 360º
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
