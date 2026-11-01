import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

export const FaqSection: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      question: 'Por que o credenciamento se inicia às 07:30 da manhã?',
      answer:
        'A abertura às 07:30 garante que você retire seu crachá físico nominal com calma nos totens expressos, aproveite o Welcome Coffee executivo com baristas parceiros e faça networking antes do início pontual da primeira palestra magna às 08:45.',
    },
    {
      question: 'Preciso imprimir o voucher gerado após a compra?',
      answer:
        'Não é obrigatório! Nossos leitores ópticos de alta velocidade realizam a leitura direta do QR Code na tela do seu smartphone. No entanto, se preferir levar o voucher impresso através do botão "Salvar / Imprimir", a validação é igualmente instantânea.',
    },
    {
      question: 'Posso alterar o nome cadastrado no crachá nominal?',
      answer:
        'Sim! A alteração de titularidade do crachá nominal pode ser solicitada gratuitamente até 72 horas antes do evento diretamente pelo nosso suporte ou balcão de atendimento.',
    },
    {
      question: 'Como funciona a segurança e aprovação do Mercado Pago?',
      answer:
        'O checkout utiliza os protocolos oficiais de segurança e criptografia 256-bit do Mercado Pago. Para pagamentos via Pix, a confirmação e a geração do voucher oficial ocorrem em menos de 5 segundos.',
    },
    {
      question: 'O evento oferece certificado de participação?',
      answer:
        'Sim! Todos os participantes com credencial validada no evento recebem certificado digital de 10 horas complementares assinado digitalmente, além de acesso às gravações em 4K das palestras por 12 meses.',
    },
  ];

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 sm:py-28 bg-[#0D0D0D] border-b border-neutral-900 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#E50914] font-semibold mb-2">
            <HelpCircle className="w-4 h-4" />
            <span>Perguntas Frequentes</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight">
            Tudo o que você precisa saber
          </h2>
          <p className="mt-2 text-sm text-neutral-400">
            Respostas sobre credenciamento, emissão de crachás e suporte ao participante.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-neutral-800 bg-neutral-900/40 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full py-4 px-6 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-white hover:text-[#ff4d4d] transition-colors"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#E50914] transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-4 pt-1 text-xs sm:text-sm text-neutral-300 leading-relaxed border-t border-neutral-800/60 bg-neutral-950/30">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
