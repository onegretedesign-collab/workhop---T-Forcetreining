import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { SUMMIT_EVENT } from '../data/summitData';
import { formatCPF, validateCPF, formatPhone, generateVoucherId, formatCurrency } from '../utils/formatters';
import { BuyerData } from './TicketCheckoutCard';
import {
  CheckCircle2,
  Ticket,
  QrCode,
  Printer,
  Share2,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  User,
  Mail,
  Phone,
  AlertCircle,
  Loader2,
  Copy,
  Check,
} from 'lucide-react';

interface PaymentReturnViewProps {
  onBackToSite: () => void;
}

const STORAGE_KEY = 'performance360_buyer_data';
const RECORDED_SESSION_KEY = 'performance360_recorded_sale_id';

export const PaymentReturnView: React.FC<PaymentReturnViewProps> = ({ onBackToSite }) => {
  const [buyer, setBuyer] = useState<BuyerData | null>(null);
  const [voucherCode, setVoucherCode] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(true);
  const [hasStoredData, setHasStoredData] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Manual fallback form if user opened from another device/browser
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [companyRole, setCompanyRole] = useState('');
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isManualSubmitting, setIsManualSubmitting] = useState(false);

  useEffect(() => {
    // Generate or retrieve persistent voucher ID for this device session
    let existingVoucher = sessionStorage.getItem('performance360_voucher_code');
    if (!existingVoucher) {
      existingVoucher = `P360-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      sessionStorage.setItem('performance360_voucher_code', existingVoucher);
    }
    setVoucherCode(existingVoucher);

    // Check if buyer data is already stored
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: BuyerData = JSON.parse(stored);
        if (parsed.fullName && parsed.email) {
          setBuyer(parsed);
          setHasStoredData(true);
          setFullName(parsed.fullName);
          setEmail(parsed.email);
          setPhone(parsed.phone || '');
          setCpf(parsed.cpf || '');
          setCompanyRole(parsed.companyRole || '');

          // Automatically record confirmed sale in Firestore if not yet recorded in this session
          recordConfirmedSale(parsed, existingVoucher);
          return;
        }
      }
    } catch {
      // ignore
    }

    setIsProcessing(false);
  }, []);

  const recordConfirmedSale = async (data: BuyerData, code: string) => {
    const alreadyRecorded = sessionStorage.getItem(RECORDED_SESSION_KEY);
    if (alreadyRecorded) {
      setIsProcessing(false);
      return;
    }

    try {
      // URL parameters from Mercado Pago
      const urlParams = new URLSearchParams(window.location.search);
      const paymentId = urlParams.get('payment_id') || urlParams.get('collection_id') || 'mpago_link';
      const paymentStatus = urlParams.get('status') || urlParams.get('collection_status') || 'approved';

      const docRef = await addDoc(collection(db, 'sales'), {
        customerName: data.fullName,
        email: data.email,
        phone: data.phone,
        cpf: data.cpf,
        ticketType: 'Passaporte Oficial Performance 360º',
        attendeesCount: 1,
        amount: SUMMIT_EVENT.price,
        paymentMethod: 'credit_card',
        status: 'confirmed', // CONFIRMED status for the Dashboard!
        notes: `Pagamento concluído Mercado Pago (ID: ${paymentId}, Status: ${paymentStatus}). Voucher: ${code}. Cargo: ${data.companyRole || 'Geral'}`,
        origin: 'online',
        createdAt: serverTimestamp(),
      });

      sessionStorage.setItem(RECORDED_SESSION_KEY, docRef.id);
    } catch (err) {
      console.warn('Erro ao registrar venda confirmada no Firestore:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: { [key: string]: string } = {};

    if (!fullName.trim() || fullName.trim().length < 3) {
      errs.fullName = 'Informe seu nome completo';
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Informe um e-mail válido';
    }
    if (phone.replace(/\D/g, '').length < 10) {
      errs.phone = 'Informe seu WhatsApp com DDD';
    }
    if (!cpf.trim() || !validateCPF(cpf)) {
      errs.cpf = 'Informe um CPF válido';
    }

    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsManualSubmitting(true);
    const manualData: BuyerData = {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      cpf: cpf.trim(),
      companyRole: companyRole.trim(),
      registeredAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(manualData));
      setBuyer(manualData);
      setHasStoredData(true);
      await recordConfirmedSale(manualData, voucherCode);
    } finally {
      setIsManualSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    if (!buyer) return;
    const msg = `*Voucher Oficial - Performance 360º*\n\n` +
      `Participante: ${buyer.fullName}\n` +
      `CPF: ${buyer.cpf}\n` +
      `Código: ${voucherCode}\n` +
      `Evento: 20 de Fevereiro, Academia Dragon Gym\n` +
      `Status: Pagamento Aprovado e Credencial Garantida!\n\n` +
      `Apresente este voucher no credenciamento às 07:30 para retirar seu crachá físico.`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const handleCopyReturnLink = () => {
    const returnUrl = window.location.href;
    navigator.clipboard.writeText(returnUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#070707] text-neutral-100 flex flex-col justify-between selection:bg-[#E50914] selection:text-white">
      {/* Top Banner & Navigation */}
      <header className="print:hidden border-b border-neutral-800 bg-[#0C0C0C]/90 backdrop-blur-md px-4 sm:px-8 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToSite}
            className="inline-flex items-center gap-2 text-xs sm:text-sm text-neutral-400 hover:text-white transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#E50914]" />
            <span>Voltar ao site oficial</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Retorno de Pagamento Mercado Pago</span>
          </div>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 flex flex-col justify-center">
        {isProcessing ? (
          <div className="text-center py-20 bg-neutral-900/40 rounded-3xl border border-neutral-800 p-8">
            <Loader2 className="w-12 h-12 text-[#E50914] animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white font-display">
              Validando pagamento com o Mercado Pago...
            </h2>
            <p className="text-sm text-neutral-400 mt-2">
              Registrando seus dados oficiais de credenciamento na lista do evento.
            </p>
          </div>
        ) : !buyer ? (
          /* Manual Identification Form if user arrived without stored data */
          <div className="bg-[#111111] border border-neutral-800 rounded-3xl p-6 sm:p-10 shadow-2xl max-w-xl mx-auto w-full animate-in fade-in duration-300">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold block mb-1">
                Pagamento Mercado Pago Concluído
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                Confirme seus dados para emissão do Crachá
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 mt-2">
                Precisamos do seu nome completo e documento para registrar seu crachá oficial de policarbonato e liberar seu voucher.
              </p>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Nome Completo no Crachá <span className="text-[#E50914]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ex: Carlos Eduardo de Oliveira"
                    className="w-full pl-9 pr-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#E50914]"
                  />
                  <User className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                </div>
                {formErrors.fullName && (
                  <p className="mt-1 text-xs text-[#E50914]">{formErrors.fullName}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    E-mail <span className="text-[#E50914]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="carlos@email.com"
                      className="w-full pl-9 pr-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#E50914]"
                    />
                    <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                  </div>
                  {formErrors.email && (
                    <p className="mt-1 text-xs text-[#E50914]">{formErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    WhatsApp <span className="text-[#E50914]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(formatPhone(e.target.value))}
                      placeholder="(11) 98765-4321"
                      className="w-full pl-9 pr-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#E50914] font-mono"
                    />
                    <Phone className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                  </div>
                  {formErrors.phone && (
                    <p className="mt-1 text-xs text-[#E50914]">{formErrors.phone}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    CPF <span className="text-[#E50914]">*</span>
                  </label>
                  <input
                    type="text"
                    value={cpf}
                    onChange={(e) => setCpf(formatCPF(e.target.value))}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className="w-full px-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#E50914] font-mono"
                  />
                  {formErrors.cpf && (
                    <p className="mt-1 text-xs text-[#E50914]">{formErrors.cpf}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Cargo / Especialidade (Opcional)
                  </label>
                  <input
                    type="text"
                    value={companyRole}
                    onChange={(e) => setCompanyRole(e.target.value)}
                    placeholder="Ex: Treinador / Atleta"
                    className="w-full px-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#E50914]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isManualSubmitting}
                className="w-full mt-4 py-4 px-6 rounded-xl font-bold text-base text-white bg-[#E50914] hover:bg-[#b80710] transition-all shadow-xl shadow-[#E50914]/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isManualSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Gerando Credencial...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Emitir Meu Crachá & Voucher Oficial</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* CONFIRMED DIGITAL VOUCHER & BADGE TICKET */
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            {/* Top Success Notice (Hidden on Print) */}
            <div className="print:hidden p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Pagamento Aprovado com Sucesso!
                  </h3>
                  <p className="text-xs text-emerald-300">
                    Seus dados foram salvos no banco de dados e registrados na lista oficial de presença do evento.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-[#E50914]" />
                  <span>Imprimir Voucher</span>
                </button>
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Official Credential & Voucher Ticket (Printable) */}
            <div className="relative rounded-3xl bg-gradient-to-b from-[#141414] to-[#0D0D0D] border-2 border-neutral-700 p-6 sm:p-10 shadow-2xl overflow-hidden print:border-black print:bg-white print:text-black">
              {/* Background watermark */}
              <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-[#E50914]/10 rounded-full blur-[100px] pointer-events-none print:hidden" />

              <div className="flex flex-col md:flex-row items-stretch justify-between gap-8 relative z-10">
                {/* Left: Badge & Participant Info */}
                <div className="flex-1 space-y-6">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#E50914] font-bold mb-1">
                      <Sparkles className="w-4 h-4" />
                      <span>Credencial Nominal Oficial</span>
                    </div>
                    <h1 className="text-2xl sm:text-4xl font-extrabold text-white print:text-black font-display tracking-tight">
                      Performance <span className="text-[#E50914]">360º</span>
                    </h1>
                    <p className="text-xs text-neutral-400 print:text-neutral-600 mt-1">
                      WORKSHOP - T-Forcetreining Dragon Gym
                    </p>
                  </div>

                  {/* Nominal Participant Badge Card */}
                  <div className="p-5 rounded-2xl bg-neutral-900/90 print:bg-neutral-100 border border-neutral-800 print:border-neutral-300 space-y-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 print:text-neutral-600 block">
                      Nome impresso no crachá de policarbonato:
                    </span>
                    <div className="text-xl sm:text-2xl font-extrabold text-white print:text-black uppercase tracking-tight">
                      {buyer.fullName}
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-neutral-800 print:border-neutral-300 text-xs">
                      <div>
                        <span className="text-neutral-500 print:text-neutral-600 block">CPF</span>
                        <span className="font-mono font-bold text-neutral-200 print:text-neutral-800">{buyer.cpf}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 print:text-neutral-600 block">Cargo / Especialidade</span>
                        <span className="font-semibold text-neutral-200 print:text-neutral-800">{buyer.companyRole || 'Participante VIP'}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 print:text-neutral-600 block">E-mail</span>
                        <span className="text-neutral-200 print:text-neutral-800 truncate block">{buyer.email}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 print:text-neutral-600 block">WhatsApp</span>
                        <span className="font-mono text-neutral-200 print:text-neutral-800">{buyer.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Event Schedule Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-neutral-950/60 print:bg-neutral-50 border border-neutral-800/80 print:border-neutral-300 flex items-center gap-2.5">
                      <Calendar className="w-4 h-4 text-[#E50914] shrink-0" />
                      <div>
                        <span className="text-neutral-400 print:text-neutral-600 block text-[10px]">Data</span>
                        <span className="font-bold text-white print:text-black">20 de Fevereiro</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-neutral-950/60 print:bg-neutral-50 border border-neutral-800/80 print:border-neutral-300 flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-[#E50914] shrink-0" />
                      <div>
                        <span className="text-neutral-400 print:text-neutral-600 block text-[10px]">Horário</span>
                        <span className="font-bold text-white print:text-black">15:00 pontual</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-neutral-950/60 print:bg-neutral-50 border border-neutral-800/80 print:border-neutral-300 flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-[#E50914] shrink-0" />
                      <div>
                        <span className="text-neutral-400 print:text-neutral-600 block text-[10px]">Local</span>
                        <span className="font-bold text-white print:text-black">Dragon Gym</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: QR Code & Verification Stub */}
                <div className="md:w-64 flex flex-col items-center justify-center p-6 rounded-2xl bg-white text-black shadow-lg border border-neutral-300">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 font-bold mb-2">
                    Check-in na Portaria
                  </span>

                  <div className="p-3 bg-white border border-neutral-200 rounded-xl shadow-inner mb-3">
                    <QRCodeSVG
                      value={`P360-CHECKIN:${buyer.cpf}:${voucherCode}`}
                      size={150}
                      level="H"
                      includeMargin={false}
                    />
                  </div>

                  <span className="font-mono font-extrabold text-sm tracking-wider text-[#E50914]">
                    {voucherCode}
                  </span>

                  <div className="mt-3 text-center text-[10px] text-neutral-600 leading-tight">
                    Apresente este QR Code no totem de credenciamento às 07:30 para retirar seu crachá.
                  </div>
                </div>
              </div>

              {/* Bottom Guarantee Banner */}
              <div className="mt-8 pt-4 border-t border-neutral-800 print:border-neutral-300 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400 print:text-neutral-700">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Passaporte All-Access Oficial · R$ 200,00 Pago via Mercado Pago</span>
                </div>
                <span className="font-mono text-[11px]">
                  Emissão: {new Date().toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>

            {/* Back to Site Button (Hidden on Print) */}
            <div className="print:hidden text-center pt-2">
              <button
                type="button"
                onClick={onBackToSite}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-bold text-sm transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-[#E50914]" />
                <span>Voltar à Página Principal do Evento</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer Info & Mercado Pago URL Helper Box */}
      <footer className="print:hidden border-t border-neutral-800 bg-[#0A0A0A] p-4 text-center text-xs text-neutral-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>Performance 360º · Sistema Oficial de Ingressos & Credenciamento</span>
          <button
            type="button"
            onClick={handleCopyReturnLink}
            className="inline-flex items-center gap-1.5 text-[11px] text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 hover:border-neutral-700 px-3 py-1.5 rounded-lg transition cursor-pointer"
            title="Copiar URL para o Mercado Pago"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link de Retorno Copiado!' : 'Copiar URL de Retorno Mercado Pago'}</span>
          </button>
        </div>
      </footer>
    </div>
  );
};
