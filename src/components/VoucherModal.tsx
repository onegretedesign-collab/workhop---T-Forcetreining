import React, { useRef } from 'react';
import { VoucherData } from './CheckoutModal';
import { SUMMIT_EVENT } from '../data/summitData';
import { BannerGraphic } from './BannerGraphic';
import { formatCurrency } from '../utils/formatters';
import {
  Printer,
  Download,
  X,
  CheckCircle2,
  Clock,
  MapPin,
  IdCard,
  QrCode,
  ShieldCheck,
  Share2,
} from 'lucide-react';

interface VoucherModalProps {
  voucher: VoucherData | null;
  isOpen: boolean;
  onClose: () => void;
}

export const VoucherModal: React.FC<VoucherModalProps> = ({
  voucher,
  isOpen,
  onClose,
}) => {
  const printableRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !voucher) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(voucher, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Voucher_${voucher.voucherId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-2xl bg-[#111111] border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-6 animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="voucher-modal-title"
      >
        {/* Modal Top Actions (no-print) */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-[#161616]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
              Pagamento Aprovado · Voucher Oficial Gerado
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar voucher"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Voucher Ticket Document */}
        <div
          ref={printableRef}
          className="print-only-container flex-1 overflow-y-auto max-h-[75vh] bg-[#0E0E0E] text-white"
        >
          {/* Official Banner Incorporated at the Top */}
          <div className="relative w-full h-36 sm:h-44 overflow-hidden border-b border-neutral-800">
            <BannerGraphic
              bannerUrl={voucher.bannerUrl}
              className="w-full h-full"
              showTitleOverlay={true}
            />
            {/* Authenticity Watermark Strip */}
            <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-md px-3 py-1 rounded-full border border-neutral-700/80 text-[10px] font-mono text-neutral-300">
              VOUCHER OFICIAL #{voucher.voucherId}
            </div>
          </div>

          {/* Ticket Body Content */}
          <div className="p-5 sm:p-7 space-y-5">
            {/* Participant Badge Highlight */}
            <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] sm:text-[11px] uppercase font-mono tracking-wider text-[#E50914] font-bold block mb-1">
                  Crachá Físico Nominal Cadastrado
                </span>
                <h3
                  id="voucher-modal-title"
                  className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight"
                >
                  {voucher.badgeName}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 font-mono mt-0.5">
                  {voucher.companyRole || 'PARTICIPANTE VIP'}
                </p>
              </div>

              <div className="sm:text-right font-mono">
                <span className="text-[10px] text-neutral-500 block uppercase">
                  Código de Validação
                </span>
                <span className="text-sm sm:text-base font-bold text-white tracking-wider">
                  {voucher.voucherId}
                </span>
                <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                  PAGO VIA MERCADO PAGO
                </span>
              </div>
            </div>

            {/* Data Grid: Participant & Purchase details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-xs font-mono">
              <div className="p-3 rounded-xl bg-neutral-900/40 border border-neutral-800/80">
                <span className="text-neutral-500 block mb-1">CPF</span>
                <span className="text-white font-bold">{voucher.cpf}</span>
              </div>

              <div className="p-3 rounded-xl bg-neutral-900/40 border border-neutral-800/80">
                <span className="text-neutral-500 block mb-1">TELEFONE</span>
                <span className="text-white font-bold truncate block">
                  {voucher.phone}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-neutral-900/40 border border-neutral-800/80">
                <span className="text-neutral-500 block mb-1">PAGAMENTO</span>
                <span className="text-white font-bold uppercase">
                  {voucher.paymentMethod === 'pix'
                    ? 'Pix'
                    : `${voucher.installments || 1}x Cartão`}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-neutral-900/40 border border-neutral-800/80">
                <span className="text-neutral-500 block mb-1">TOTAL PAGO</span>
                <span className="text-emerald-400 font-bold">
                  {formatCurrency(voucher.totalPaid)}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-900/40 border border-neutral-800/80 text-xs font-mono flex items-center justify-between">
              <span className="text-neutral-400">E-mail Cadastrado:</span>
              <span className="text-white font-medium">{voucher.email}</span>
            </div>

            {/* Logistics & Arrival Reminder */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-[#170405] to-[#120304] border border-[#E50914]/30 space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono text-[#E50914] font-bold uppercase tracking-wider">
                <Clock className="w-4 h-4" />
                <span>Instruções Importantes de Credenciamento</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-[#E50914] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Chegada às 07:30</strong>
                    <span className="text-neutral-300">
                      Welcome Coffee, networking inicial e abertura dos totens de credenciamento.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#E50914] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Local do Evento</strong>
                    <span className="text-neutral-300">
                      {SUMMIT_EVENT.venue} ({SUMMIT_EVENT.address})
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E50914]/20 flex items-center gap-2 text-[11px] text-neutral-300">
                <IdCard className="w-4 h-4 text-[#E50914] shrink-0" />
                <span>
                  Apresente este voucher no smartphone ou impresso para retirar seu crachá físico nominal com cordão oficial na recepção.
                </span>
              </div>
            </div>

            {/* QR Code Validation Section */}
            <div className="p-5 rounded-2xl bg-white text-black flex flex-col sm:flex-row items-center justify-between gap-5 print-page-break">
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 bg-white border-2 border-black p-1 rounded-xl shrink-0 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {/* Stylized QR Matrix */}
                    <rect width="100" height="100" fill="#ffffff" />
                    <rect x="5" y="5" width="28" height="28" fill="#000000" />
                    <rect x="10" y="10" width="18" height="18" fill="#ffffff" />
                    <rect x="14" y="14" width="10" height="10" fill="#000000" />

                    <rect x="67" y="5" width="28" height="28" fill="#000000" />
                    <rect x="72" y="10" width="18" height="18" fill="#ffffff" />
                    <rect x="76" y="14" width="10" height="10" fill="#000000" />

                    <rect x="5" y="67" width="28" height="28" fill="#000000" />
                    <rect x="10" y="72" width="18" height="18" fill="#ffffff" />
                    <rect x="14" y="76" width="10" height="10" fill="#000000" />

                    <rect x="38" y="10" width="8" height="8" fill="#000000" />
                    <rect x="50" y="16" width="8" height="8" fill="#000000" />
                    <rect x="42" y="42" width="16" height="16" fill="#E50914" rx="2" />
                    <rect x="68" y="40" width="8" height="8" fill="#000000" />
                    <rect x="80" y="50" width="8" height="8" fill="#000000" />
                    <rect x="38" y="72" width="8" height="8" fill="#000000" />
                    <rect x="50" y="80" width="8" height="8" fill="#000000" />
                    <rect x="68" y="72" width="8" height="8" fill="#000000" />
                    <rect x="80" y="82" width="10" height="10" fill="#000000" />
                  </svg>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 block">
                    LEITURA ÓPTICA DE ACESSO
                  </span>
                  <h4 className="text-base font-extrabold font-display">
                    QR Code de Acesso Rápido
                  </h4>
                  <p className="text-xs text-neutral-700 max-w-xs mt-0.5">
                    Válido para entrada única e emissão instantânea do crachá nominal na data do evento.
                  </p>
                </div>
              </div>

              <div className="text-right font-mono text-xs text-neutral-600 sm:border-l sm:border-neutral-200 sm:pl-6">
                <div>Emitido em: {voucher.purchaseDate}</div>
                <div className="font-bold text-black mt-0.5">
                  ID: {voucher.voucherId}
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center justify-end gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>ASSINATURA DIGITAL VÁLIDA</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons (no-print) */}
        <div className="no-print flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-neutral-800 bg-[#161616]">
          <button
            type="button"
            onClick={handleDownloadJSON}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-neutral-300 hover:text-white rounded-lg border border-neutral-700/80 hover:bg-neutral-800 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#E50914]" />
            <span>Baixar JSON</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#E50914] hover:bg-[#b80710] rounded-xl transition-all shadow-lg shadow-[#E50914]/25"
            >
              <Printer className="w-4 h-4" />
              <span>Salvar / Imprimir Voucher</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-neutral-400 hover:text-white transition-colors"
            >
              Concluir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
