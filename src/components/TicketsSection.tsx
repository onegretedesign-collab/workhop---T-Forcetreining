import React from 'react';
import { SUMMIT_EVENT, TICKET_BENEFITS } from '../data/summitData';
import { formatCurrency } from '../utils/formatters';
import { TicketCheckoutCard } from './TicketCheckoutCard';
import { Check, ShieldCheck, Ticket, Sparkles } from 'lucide-react';

interface TicketsSectionProps {
  onOpenCheckout: () => void;
}

export const TicketsSection: React.FC<TicketsSectionProps> = ({ onOpenCheckout }) => {
  return (
    <section id="ingressos" className="py-20 sm:py-28 bg-[#0A0A0A] border-b border-neutral-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#E50914] font-semibold mb-2">
            <Ticket className="w-4 h-4" />
            <span>Passaporte All-Access Exclusivo</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-display tracking-tight">
            Ingresso Nominal · Acesso Completo
          </h2>
          <p className="mt-4 text-base text-neutral-400">
            Valor único e transparente com todos os benefícios inclusos, crachá físico personalizado e emissão instantânea de voucher digital.
          </p>
        </div>

        {/* Central Single Ticket Card */}
        <div className="max-w-5xl mx-auto relative group">
          {/* Subtle glow border */}
          <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-[#E50914] via-[#ff4d4d] to-[#E50914] opacity-30 group-hover:opacity-60 blur-lg transition duration-500" />

          <div className="relative rounded-3xl bg-[#111111] border border-neutral-800 p-8 sm:p-12 shadow-2xl flex flex-col lg:flex-row gap-8 lg:gap-10 items-stretch">
            {/* Left: Pricing & Badge Highlights */}
            <div className="lg:w-1/2 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-neutral-800 pb-8 lg:pb-0 lg:pr-8">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#E50914] font-bold">
                  PASSAPORTE EXCLUSIVO
                </span>
                <h3 className="text-2xl font-bold text-white font-display mt-1">
                  Congresso Presencial
                  <span className="block text-[#E50914]">Performance 360º</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Acesso total ao evento na Academia Dragon.
                </p>

                {/* Prominent nominal badge callout box */}
                <div className="mt-6 p-4 rounded-xl bg-[#E50914]/10 border border-[#E50914]/30">
                  <div className="flex items-center gap-2 text-[#E50914] text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    <span>Destaque Especial</span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1">
                    Crachá Físico Nominal Incluído
                  </h4>
                  <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                    Sua credencial de policarbonato será impressa com seu nome e cargo oficial para networking de alto nível durante todo o evento.
                  </p>
                </div>
              </div>

              {/* Price Tag */}
              <div className="mt-8 pt-6 border-t border-neutral-800">
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
                  <span className="text-4xl sm:text-5xl font-extrabold text-white font-display tracking-tight shrink-0">
                    {formatCurrency(SUMMIT_EVENT.price)}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-emerald-400 whitespace-nowrap bg-emerald-500/10 border border-emerald-500/25 px-3 py-1 rounded-full inline-flex items-center gap-1.5 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    à vista via Pix
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-neutral-400 mt-2 font-normal leading-relaxed">
                  ou em até 12x no cartão de crédito via Mercado Pago
                </p>

                {/* Interactive Buyer Registration & Checkout Flow */}
                <TicketCheckoutCard />
              </div>
            </div>

            {/* Right: Full Benefits List */}
            <div className="lg:w-1/2 lg:pl-4 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block mb-4">
                  O que está incluso no seu passaporte:
                </span>

                <ul className="grid grid-cols-1 gap-3.5">
                  {TICKET_BENEFITS.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-[#E50914]/15 border border-[#E50914]/40 flex items-center justify-center text-[#E50914] shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs sm:text-sm text-neutral-300 leading-snug">
                        {benefit}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Guarantees */}
              <div className="mt-8 pt-6 border-t border-neutral-800 flex items-center gap-3 text-xs text-neutral-400">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>
                  Compra 100% segura com ambiente Mercado Pago. Cancelamento e reembolso integral em até 7 dias após a compra sem burocracia.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
