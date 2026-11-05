import React, { useRef, useState } from 'react';
import { VoucherData } from './CheckoutModal';
import { SUMMIT_EVENT } from '../data/summitData';
import { BannerGraphic } from './BannerGraphic';
import { formatCurrency } from '../utils/formatters';
import { compressPhotoToDataUrl } from '../utils/imageCompressor';
import {
  Printer,
  Download,
  X,
  CheckCircle2,
  Clock,
  MapPin,
  IdCard,
  ShieldCheck,
  Share2,
  Camera,
  Image as ImageIcon,
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
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [badgePhoto, setBadgePhoto] = useState<string | null>(() => {
    try {
      return localStorage.getItem('performance360_badge_photo') || null;
    } catch {
      return null;
    }
  });

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    try {
      const dataUrl = await compressPhotoToDataUrl(file, 640, 0.85);
      setBadgePhoto(dataUrl);
      try {
        localStorage.setItem('performance360_badge_photo', dataUrl);
      } catch {
        // ignore
      }
    } catch (err) {
      console.error('Erro ao processar foto:', err);
    } finally {
      if (e.target) e.target.value = '';
    }
  };

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

            {/* Badge Photo & Buyer Information Section (Replacing QR Code) */}
            <div className="p-5 rounded-2xl bg-white text-black flex flex-col sm:flex-row items-center justify-between gap-5 print-page-break border border-neutral-300">
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="user"
                className="hidden"
                onChange={handlePhotoSelect}
              />
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoSelect}
              />

              <div className="flex items-center gap-4 w-full sm:w-auto">
                {/* Photo Frame in place of QR Code */}
                <div className="relative w-24 h-32 sm:w-28 sm:h-36 bg-neutral-100 border-2 border-neutral-300 rounded-xl overflow-hidden shrink-0 flex items-center justify-center shadow-inner group">
                  {badgePhoto ? (
                    <>
                      <img
                        src={badgePhoto}
                        alt="Foto do Crachá"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 print:hidden">
                        <button
                          type="button"
                          onClick={() => cameraInputRef.current?.click()}
                          className="p-1.5 rounded-full bg-black/80 text-white hover:bg-[#E50914] transition"
                          title="Tirar foto"
                        >
                          <Camera className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => galleryInputRef.current?.click()}
                          className="p-1.5 rounded-full bg-black/80 text-white hover:bg-[#E50914] transition"
                          title="Galeria"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-2 text-center">
                      <Camera className="w-6 h-6 text-neutral-400 mb-1" />
                      <span className="text-[10px] font-bold text-neutral-700 leading-tight">
                        Foto Crachá
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 font-bold block">
                    FOTO DO CRACHÁ OFICIAL
                  </span>
                  <h4 className="text-base font-extrabold font-display">
                    {voucher.badgeName}
                  </h4>
                  <p className="text-xs text-neutral-600 max-w-xs mt-0.5">
                    {voucher.companyRole || 'Participante VIP'} · CPF: {voucher.cpf}
                  </p>

                  <div className="print:hidden flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#E50914] hover:bg-[#b80710] text-white text-[11px] font-bold transition shadow-sm cursor-pointer"
                    >
                      <Camera className="w-3 h-3" />
                      <span>Tirar Foto</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => galleryInputRef.current?.click()}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-[11px] font-bold transition shadow-sm cursor-pointer"
                    >
                      <ImageIcon className="w-3 h-3" />
                      <span>Galeria</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="w-full sm:w-auto text-left sm:text-right font-mono text-xs text-neutral-600 sm:border-l sm:border-neutral-200 sm:pl-6 space-y-1">
                <div>Emitido em: {voucher.purchaseDate}</div>
                <div className="font-bold text-black text-sm">
                  ID: {voucher.voucherId}
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold flex items-center sm:justify-end gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>IDENTIFICAÇÃO CADASTRADA</span>
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
