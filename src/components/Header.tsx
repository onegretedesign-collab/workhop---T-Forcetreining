import React, { useState } from 'react';
import { Ticket, Menu, X } from 'lucide-react';

interface HeaderProps {
  onOpenCheckout: () => void;
  onOpenMural?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCheckout,
  onOpenMural,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0A0A0A]/90 backdrop-blur-md border-b border-neutral-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-8">
        {/* Brand wordmark: 1º CONGRESSO / O Mundo da Musculação */}
        <a
          href="#"
          className="flex flex-col justify-center group tracking-tight whitespace-nowrap shrink-0"
          aria-label="1º Congresso O Mundo da Musculação"
        >
          <span className="text-white font-extrabold text-lg sm:text-xl font-display leading-tight group-hover:text-[#ff4d4d] transition-colors">
            1º CONGRESSO
          </span>
          <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.18em] text-[#E50914] font-bold uppercase leading-none mt-0.5">
            O Mundo da Musculação
          </span>
        </a>

        {/* Zone 2: 4-5 concise single-line nav links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-neutral-300">
          <a
            href="#palestrantes"
            className="hover:text-white hover:text-[#E50914] transition-colors whitespace-nowrap shrink-0"
          >
            Palestrantes
          </a>
          <a
            href="#credenciamento"
            className="hover:text-white hover:text-[#E50914] transition-colors whitespace-nowrap shrink-0"
          >
            Credenciamento
          </a>
          <a
            href="#ingressos"
            className="hover:text-white hover:text-[#E50914] transition-colors whitespace-nowrap shrink-0"
          >
            Ingresso Nominal
          </a>
          <a
            href="#faq"
            className="hover:text-white hover:text-[#E50914] transition-colors whitespace-nowrap shrink-0"
          >
            Dúvidas Frequentes
          </a>
        </nav>

        {/* Zone 3: Primary action */}
        <div className="flex items-center gap-3 shrink-0">
          {onOpenMural && (
            <button
              type="button"
              onClick={onOpenMural}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 text-xs font-semibold text-neutral-200 hover:text-white transition-colors cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Mural ao Vivo</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenCheckout}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-[#E50914] hover:bg-[#b80710] rounded-lg transition-all shadow-md shadow-[#E50914]/25 whitespace-nowrap shrink-0"
          >
            <Ticket className="w-4 h-4" />
            <span>Garanta já sua vaga</span>
          </button>

          {/* Mobile hamburger toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Abrir menu"
            className="md:hidden p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-neutral-800 bg-[#0E0E0E] px-4 pt-2 pb-4 space-y-2">
          <a
            href="#palestrantes"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-neutral-200 hover:text-[#E50914] hover:bg-neutral-900 rounded-lg"
          >
            Palestrantes (6 Keynotes)
          </a>
          <a
            href="#credenciamento"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-neutral-200 hover:text-[#E50914] hover:bg-neutral-900 rounded-lg"
          >
            Credenciamento
          </a>
          <a
            href="#ingressos"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-neutral-200 hover:text-[#E50914] hover:bg-neutral-900 rounded-lg"
          >
            Ingresso Nominal R$ 200
          </a>
          <a
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-neutral-200 hover:text-[#E50914] hover:bg-neutral-900 rounded-lg"
          >
            Dúvidas Frequentes
          </a>
        </div>
      )}
    </header>
  );
};
