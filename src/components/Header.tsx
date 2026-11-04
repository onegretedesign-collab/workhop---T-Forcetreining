import React, { useState } from 'react';
import { SUMMIT_EVENT } from '../data/summitData';
import { Ticket, Menu, X, BarChart3 } from 'lucide-react';

interface HeaderProps {
  onOpenCheckout: () => void;
  onOpenMural?: () => void;
  onOpenDashboard?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCheckout,
  onOpenMural,
  onOpenDashboard,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0A0A0A]/90 backdrop-blur-md border-b border-neutral-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-8">
        {/* Brand wordmark: Performance 360º */}
        <a
          href="#"
          className="flex flex-col justify-center group tracking-tight whitespace-nowrap shrink-0"
          aria-label="Performance 360º"
        >
          <span className="text-white font-extrabold text-lg sm:text-xl font-display leading-tight group-hover:text-[#ff4d4d] transition-colors">
            Performance <span className="text-[#E50914]">360º</span>
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
            href="#galeria"
            className="hover:text-white hover:text-[#E50914] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <span>Galeria</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </a>
          <a
            href="#faq"
            className="hover:text-white hover:text-[#E50914] transition-colors whitespace-nowrap shrink-0"
          >
            Dúvidas Frequentes
          </a>
        </nav>

        {/* Zone 3: Primary action */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {onOpenDashboard && (
            <button
              type="button"
              onClick={onOpenDashboard}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 text-xs font-semibold text-neutral-300 hover:text-white transition-colors cursor-pointer"
              title="Acessar Painel de Controle de Vendas"
            >
              <BarChart3 className="w-3.5 h-3.5 text-[#E50914]" />
              <span>Painel de Vendas</span>
            </button>
          )}

          <a
            href="#galeria"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 text-xs font-semibold text-neutral-200 hover:text-white transition-colors cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Galeria de Fotos</span>
          </a>

          <a
            href={SUMMIT_EVENT.checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-[#E50914] hover:bg-[#b80710] rounded-lg transition-all shadow-md shadow-[#E50914]/25 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Ticket className="w-4 h-4" />
            <span>Garanta já sua vaga</span>
          </a>

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
          {onOpenDashboard && (
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenDashboard();
              }}
              className="w-full text-left px-3 py-2 text-sm font-bold text-[#E50914] hover:bg-neutral-900 rounded-lg flex items-center gap-2 border border-[#E50914]/30 bg-[#E50914]/10"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Painel de Gestão e Vendas</span>
            </button>
          )}
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
            href="#galeria"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-neutral-200 hover:text-[#E50914] hover:bg-neutral-900 rounded-lg"
          >
            Galeria de Fotos (Ao Vivo)
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
