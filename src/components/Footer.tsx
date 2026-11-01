import React from 'react';
import { SUMMIT_EVENT } from '../data/summitData';
import { ShieldCheck, MapPin, Mail, ArrowUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#070707] border-t border-neutral-900 py-12 sm:py-16 text-neutral-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-10 border-b border-neutral-900">
          <div>
            <div className="flex flex-col justify-center tracking-tight">
              <span className="text-white font-extrabold text-2xl font-display leading-tight">
                Workshop
              </span>
              <span className="text-xs font-mono tracking-[0.2em] text-[#E50914] font-bold uppercase leading-none mt-1">
                T-Forcetreining
              </span>
            </div>
            <p className="mt-2 text-xs text-neutral-400 max-w-md leading-relaxed">
              O principal summit presencial do Brasil para líderes em tecnologia, design de produtos digitais, cibersegurança e infraestrutura quântica.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 font-mono text-xs">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#E50914]" />
              <span>{SUMMIT_EVENT.venue} · São Paulo</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#E50914]" />
              <span>contato@tforcetreining.com.br</span>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-neutral-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              © 2026 WORKSHOP - T-Forcetreining. Todos os direitos reservados. CNPJ 42.109.841/0001-90.
            </span>
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors"
          >
            <span>Voltar ao topo</span>
            <ArrowUp className="w-3.5 h-3.5 text-[#E50914]" />
          </button>
        </div>
      </div>
    </footer>
  );
};
