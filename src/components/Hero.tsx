import React from 'react';
import { SUMMIT_EVENT } from '../data/summitData';
import { BannerGraphic } from './BannerGraphic';
import { Calendar, MapPin, Clock, ArrowRight, Sparkles } from 'lucide-react';

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Unboxed clean metadata kicker */}
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-neutral-400 font-mono mb-4">
          <span className="text-[#E50914] font-bold tracking-wider">
            {SUMMIT_EVENT.edition.toUpperCase()}
          </span>
          <span aria-hidden="true" className="text-neutral-600">·</span>
          <span>{SUMMIT_EVENT.date}</span>
          <span aria-hidden="true" className="text-neutral-600">·</span>
          <span>São Paulo, Brasil</span>
          <span aria-hidden="true" className="text-neutral-600">·</span>
          <span className="text-neutral-300 font-semibold">Credenciamento 07:30</span>
        </div>

        {/* Main Headline & Value Proposition */}
        <div className="max-w-4xl">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white font-display leading-[1.08] text-balance">
            Tecnologia Disruptiva &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E50914] via-[#ff4d4d] to-[#ff8080]">
              Design de Alto Impacto
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-neutral-300 max-w-2xl leading-relaxed">
            Seis referências mundiais em inteligência artificial, engenharia quântica, fintechs e sistemas exponenciais. Experiência presencial com credenciamento expresso às 07:30 e entrega de crachá físico nominal.
          </p>

          {/* Action CTA */}
          <div className="mt-8 flex items-center">
            <button
              type="button"
              onClick={onOpenCheckout}
              className="inline-flex items-center justify-center gap-2.5 px-7 py-4 text-sm sm:text-base font-bold text-white bg-[#E50914] hover:bg-[#b80710] rounded-xl transition-all shadow-xl shadow-[#E50914]/25 hover:shadow-[#E50914]/40"
            >
              <span>Garanta já sua vaga</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic & Responsive Hero Banner Container */}
        <div className="mt-12 sm:mt-16 relative group">
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#E50914]/30 via-neutral-800 to-[#E50914]/20 blur-xl opacity-50 group-hover:opacity-75 transition-opacity pointer-events-none" />

          <div className="relative rounded-2xl overflow-hidden border border-neutral-800 bg-[#0E0E0E] shadow-2xl">
            {/* Top Toolbar of the banner */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-[#141414] border-b border-neutral-800 text-xs">
              <div className="flex items-center gap-2 text-neutral-400">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E50914]" />
                <span className="font-mono text-white font-medium">
                  BANNER OFICIAL · WORKSHOP - T-FORCETREINING
                </span>
                <span className="hidden sm:inline font-mono text-[11px] text-neutral-500">
                  (1920 × 1080px)
                </span>
              </div>
              <span className="text-xs font-mono text-neutral-500">
                PALCO PRINCIPAL
              </span>
            </div>

            {/* Banner Graphic Viewport configured in 1920x1080 ratio */}
            <div className="w-full aspect-[1920/1080] relative">
              <BannerGraphic
                bannerUrl={bannerUrl}
                className="w-full h-full"
                showTitleOverlay={true}
              />
            </div>
          </div>
        </div>

        {/* Quick event highlights strip */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-neutral-800/80">
          <div className="flex items-start gap-3.5 p-4 rounded-xl bg-neutral-900/40 border border-neutral-800">
            <div className="w-10 h-10 rounded-lg bg-[#E50914]/10 border border-[#E50914]/25 flex items-center justify-center text-[#E50914] shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-mono text-neutral-400 block">
                Credenciamento
              </span>
              <span className="text-sm font-bold text-white">
                07:30 da manhã em ponto
              </span>
              <p className="text-xs text-neutral-400 mt-0.5">
                Welcome Coffee e leitura do voucher para emissão do crachá.
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
              <span className="text-sm font-bold text-white">
                WTC Events Center · SP
              </span>
              <p className="text-xs text-neutral-400 mt-0.5">
                Auditório Master Pro com infraestrutura acústica imersiva.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-xl bg-neutral-900/40 border border-neutral-800">
            <div className="w-10 h-10 rounded-lg bg-[#E50914]/10 border border-[#E50914]/25 flex items-center justify-center text-[#E50914] shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-mono text-neutral-400 block">
                Ingresso All-Access
              </span>
              <span className="text-sm font-bold text-white">
                Crachá Nominal Físico
              </span>
              <p className="text-xs text-neutral-400 mt-0.5">
                Voucher digital instantâneo com checkout Mercado Pago.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
