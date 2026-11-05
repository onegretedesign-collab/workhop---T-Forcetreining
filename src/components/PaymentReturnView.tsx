import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { SUMMIT_EVENT } from '../data/summitData';
import { formatCPF, validateCPF, formatPhone, formatCurrency } from '../utils/formatters';
import { compressPhotoToDataUrl } from '../utils/imageCompressor';
import { BuyerData } from './TicketCheckoutCard';
import {
  CheckCircle2,
  Ticket,
  Printer,
  Share2,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  User,
  Mail,
  Phone,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  CreditCard,
  MessageCircle,
  Paperclip,
  Camera,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react';

interface PaymentReturnViewProps {
  onBackToSite: () => void;
}

const STORAGE_KEY = 'performance360_buyer_data';
const PHOTO_STORAGE_KEY = 'performance360_badge_photo';
const RECORDED_SESSION_KEY = 'performance360_recorded_sale_id';
const ORGANIZER_WHATSAPP = '5564993367849'; // (64) 99336-7849

export const PaymentReturnView: React.FC<PaymentReturnViewProps> = ({ onBackToSite }) => {
  const [buyer, setBuyer] = useState<BuyerData | null>(null);
  const [voucherCode, setVoucherCode] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Badge Photo State (Captured from camera or selected from device gallery)
  const [badgePhoto, setBadgePhoto] = useState<string | null>(() => {
    try {
      return localStorage.getItem(PHOTO_STORAGE_KEY) || null;
    } catch {
      return null;
    }
  });
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [companyRole, setCompanyRole] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Pix Instantâneo' | 'Cartão de Crédito' | 'Boleto Bancário'>('Pix Instantâneo');
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastPurchaseTime, setLastPurchaseTime] = useState<string>('');
  const [whatsappSent, setWhatsappSent] = useState(false);

  useEffect(() => {
    // Generate or retrieve persistent voucher ID for this device session
    let existingVoucher = sessionStorage.getItem('performance360_voucher_code');
    if (!existingVoucher) {
      existingVoucher = `P360-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      sessionStorage.setItem('performance360_voucher_code', existingVoucher);
    }
    setVoucherCode(existingVoucher);

    // Pre-populate fields from localStorage if user completed step 1 earlier
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: BuyerData = JSON.parse(stored);
        if (parsed.fullName) setFullName(parsed.fullName);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.cpf) setCpf(parsed.cpf);
        if (parsed.companyRole) setCompanyRole(parsed.companyRole);
      }
    } catch {
      // ignore
    }

    // Check if already submitted in this session
    const recordedId = sessionStorage.getItem(RECORDED_SESSION_KEY);
    if (recordedId) {
      setIsSubmitted(true);
      const savedTime = sessionStorage.getItem('performance360_purchase_time');
      if (savedTime) setLastPurchaseTime(savedTime);
    }
  }, []);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (JPG, PNG).');
      return;
    }
    try {
      setIsProcessingPhoto(true);
      const dataUrl = await compressPhotoToDataUrl(file, 640, 0.85);
      setBadgePhoto(dataUrl);
      try {
        localStorage.setItem(PHOTO_STORAGE_KEY, dataUrl);
      } catch {
        // quota limit fallback
      }
    } catch (err) {
      console.error('Erro ao processar imagem do crachá:', err);
    } finally {
      setIsProcessingPhoto(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleRemovePhoto = () => {
    setBadgePhoto(null);
    try {
      localStorage.removeItem(PHOTO_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const buildWhatsAppMessage = (
    nameVal: string,
    phoneVal: string,
    emailVal: string,
    cpfVal: string,
    roleVal: string,
    methodVal: string,
    timeVal: string,
    codeVal: string
  ) => {
    return (
      `🚨 *NOVA COMPRA CONFIRMADA - WORKSHOP PERFORMANCE 360º* 🚨\n\n` +
      `👤 *Nome no Crachá:* ${nameVal}\n` +
      `📱 *WhatsApp:* ${phoneVal}\n` +
      `📧 *E-mail:* ${emailVal}\n` +
      `📄 *CPF:* ${cpfVal}\n` +
      `💼 *Cargo / Especialidade:* ${roleVal || 'Participante VIP'}\n\n` +
      (badgePhoto ? `📸 *Foto do Crachá:* Anexada com sucesso para credencial\n\n` : '') +
      `💳 *Método Usado na Compra:* ${methodVal}\n` +
      `⏰ *Data e Hora da Compra:* ${timeVal}\n` +
      `🎫 *Código do Voucher:* ${codeVal}\n` +
      `💰 *Valor Pago:* ${formatCurrency(SUMMIT_EVENT.price)}\n\n` +
      `🏛️ *Evento:* WORKSHOP - T-Forcetreining (Academia Dragon)\n` +
      `📅 *Data do Evento:* 20 de Fevereiro às 15:00\n\n` +
      `✅ _Dados computados com sucesso no Dashboard e crachá liberado!_\n\n` +
      `📎 *POR FAVOR, ENVIE O COMPROVANTE DE PAGAMENTO:* \n` +
      `Anexe o comprovante (Pix ou cartão) nesta conversa para conferência e validação final da sua credencial nominal.`
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: { [key: string]: string } = {};

    if (!fullName.trim() || fullName.trim().length < 3) {
      errs.fullName = 'Informe seu nome completo para o crachá';
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Informe um e-mail válido';
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      errs.phone = 'Informe seu WhatsApp com DDD';
    }

    const cleanCpf = cpf.replace(/\D/g, '');
    if (cleanCpf.length !== 11) {
      errs.cpf = 'Informe seu CPF com 11 dígitos';
    }

    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsSubmitting(true);

    const now = new Date();
    const formattedDateTime = `${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR')}`;
    setLastPurchaseTime(formattedDateTime);
    sessionStorage.setItem('performance360_purchase_time', formattedDateTime);

    const buyerData: BuyerData = {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      cpf: cpf.trim(),
      companyRole: companyRole.trim() || 'Participante VIP',
      registeredAt: now.toISOString(),
    };

    setBuyer(buyerData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(buyerData));

    // 1. Compute and register into Firestore DB for the Dashboard
    try {
      const docRef = await addDoc(collection(db, 'sales'), {
        customerName: buyerData.fullName,
        email: buyerData.email,
        phone: buyerData.phone,
        cpf: buyerData.cpf,
        companyRole: buyerData.companyRole,
        ticketType: 'Passaporte Oficial Performance 360º',
        attendeesCount: 1,
        amount: SUMMIT_EVENT.price,
        paymentMethod: paymentMethod === 'Pix Instantâneo' ? 'pix' : (paymentMethod === 'Cartão de Crédito' ? 'credit_card' : 'bank_transfer'),
        paymentMethodLabel: paymentMethod,
        status: 'confirmed',
        purchaseTime: formattedDateTime,
        voucherCode: voucherCode,
        photoUrl: badgePhoto || '',
        notes: `Compra confirmada Mercado Pago. Método: ${paymentMethod}. Horário: ${formattedDateTime}. Notificado no WhatsApp (64 99336-7849).`,
        origin: 'online',
        createdAt: serverTimestamp(),
      });
      sessionStorage.setItem(RECORDED_SESSION_KEY, docRef.id);
    } catch (err) {
      console.warn('Erro ao salvar no Firestore:', err);
    }

    // 2. Automatically dispatch to WhatsApp 64 99336-7849
    try {
      const message = buildWhatsAppMessage(
        buyerData.fullName,
        buyerData.phone,
        buyerData.email,
        buyerData.cpf,
        buyerData.companyRole || '',
        paymentMethod,
        formattedDateTime,
        voucherCode
      );
      const whatsappUrl = `https://api.whatsapp.com/send?phone=${ORGANIZER_WHATSAPP}&text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      setWhatsappSent(true);
    } catch (err) {
      console.warn('Erro ao abrir WhatsApp:', err);
    } finally {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }
  };

  const handleOpenWhatsAppManual = () => {
    const currentName = buyer?.fullName || fullName;
    const currentPhone = buyer?.phone || phone;
    const currentEmail = buyer?.email || email;
    const currentCpf = buyer?.cpf || cpf;
    const currentRole = buyer?.companyRole || companyRole;
    const currentTime = lastPurchaseTime || `${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`;

    const message = buildWhatsAppMessage(
      currentName,
      currentPhone,
      currentEmail,
      currentCpf,
      currentRole,
      paymentMethod,
      currentTime,
      voucherCode
    );
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${ORGANIZER_WHATSAPP}&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setWhatsappSent(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleResetToNewSubmission = () => {
    sessionStorage.removeItem(RECORDED_SESSION_KEY);
    sessionStorage.removeItem('performance360_purchase_time');
    setIsSubmitted(false);
  };

  const handleCopyReturnLink = () => {
    const returnUrl = `${window.location.origin}/?mode=retorno-pagamento`;
    navigator.clipboard.writeText(returnUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#070707] text-neutral-100 flex flex-col justify-between selection:bg-[#E50914] selection:text-white">
      {/* Hidden file inputs for Camera and Gallery */}
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
            <span>Retorno de Pagamento Oficial</span>
          </div>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 flex flex-col justify-center">
        {!isSubmitted ? (
          /* Buyer Data Collection Form (Returns from Payment Link) */
          <div className="bg-[#111111] border border-neutral-800 rounded-3xl p-6 sm:p-10 shadow-2xl max-w-xl mx-auto w-full animate-in fade-in duration-300">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold block mb-1">
                Pagamento Mercado Pago Concluído
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                Enviar Comprovante & Liberar Crachá
              </h2>
              <p className="text-xs text-neutral-400 mt-1 max-w-md mx-auto">
                Confirme seus dados abaixo para registrar sua vaga no Dashboard e enviar o comprovante no WhatsApp oficial.
              </p>
            </div>

            {fullName && (
              <div className="mb-5 p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs text-neutral-300 leading-relaxed">
                  <span className="font-bold text-white block text-sm mb-0.5">
                    Pré-cadastro localizado com sucesso!
                  </span>
                  Preenchemos seus dados automaticamente. Escolha o método usado e clique no botão verde para enviar o comprovante.
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nome Completo */}
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Nome Completo no Crachá <span className="text-[#E50914]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (formErrors.fullName) setFormErrors((prev) => ({ ...prev, fullName: '' }));
                    }}
                    placeholder="Ex: Carlos Eduardo de Oliveira"
                    className="w-full pl-9 pr-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#E50914]"
                  />
                  <User className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                </div>
                {formErrors.fullName && (
                  <p className="mt-1 text-xs text-[#E50914] flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{formErrors.fullName}</span>
                  </p>
                )}
              </div>

              {/* Email & Telefone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    E-mail <span className="text-[#E50914]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (formErrors.email) setFormErrors((prev) => ({ ...prev, email: '' }));
                      }}
                      placeholder="carlos@email.com"
                      className="w-full pl-9 pr-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#E50914]"
                    />
                    <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                  </div>
                  {formErrors.email && (
                    <p className="mt-1 text-xs text-[#E50914] flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{formErrors.email}</span>
                    </p>
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
                      onChange={(e) => {
                        setPhone(formatPhone(e.target.value));
                        if (formErrors.phone) setFormErrors((prev) => ({ ...prev, phone: '' }));
                      }}
                      placeholder="(64) 99336-7849"
                      className="w-full pl-9 pr-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#E50914] font-mono"
                    />
                    <Phone className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                  </div>
                  {formErrors.phone && (
                    <p className="mt-1 text-xs text-[#E50914] flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{formErrors.phone}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* CPF & Cargo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    CPF <span className="text-[#E50914]">*</span>
                  </label>
                  <input
                    type="text"
                    value={cpf}
                    onChange={(e) => {
                      setCpf(formatCPF(e.target.value));
                      if (formErrors.cpf) setFormErrors((prev) => ({ ...prev, cpf: '' }));
                    }}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className="w-full px-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#E50914] font-mono"
                  />
                  {formErrors.cpf && (
                    <p className="mt-1 text-xs text-[#E50914] flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{formErrors.cpf}</span>
                    </p>
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

              {/* Método de Pagamento Usado */}
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-2">
                  Método usado na compra <span className="text-[#E50914]">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Pix Instantâneo')}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      paymentMethod === 'Pix Instantâneo'
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 font-bold'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <span>⚡ Pix</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Cartão de Crédito')}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      paymentMethod === 'Cartão de Crédito'
                        ? 'bg-[#E50914]/15 border-[#E50914] text-white font-bold'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <span>💳 Cartão</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Boleto Bancário')}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      paymentMethod === 'Boleto Bancário'
                        ? 'bg-blue-500/15 border-blue-500 text-blue-300 font-bold'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <span>🧾 Boleto</span>
                  </button>
                </div>
              </div>

              {/* Foto para o Crachá (Opcional - Tirar Foto ou Escolher da Galeria) */}
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-neutral-300 block">
                    Foto do Crachá Nominal (Opcional)
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    {badgePhoto ? 'Foto Carregada' : 'Pode anexar agora ou depois'}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative w-12 h-14 rounded-lg bg-neutral-900 border border-neutral-700 overflow-hidden flex items-center justify-center shrink-0">
                      {isProcessingPhoto ? (
                        <Loader2 className="w-5 h-5 animate-spin text-[#E50914]" />
                      ) : badgePhoto ? (
                        <img src={badgePhoto} alt="Prévia" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-5 h-5 text-neutral-500" />
                      )}
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-bold text-white block">
                        {badgePhoto ? 'Foto vinculada ao crachá' : 'Anexar sua foto'}
                      </span>
                      <p className="text-[11px] text-neutral-400">
                        {badgePhoto ? 'Você pode trocar a qualquer momento' : 'Tire uma foto sua agora ou escolha da sua galeria'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#E50914] hover:bg-[#b80710] text-white text-xs font-bold transition cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Tirar Foto</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => galleryInputRef.current?.click()}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs font-semibold transition cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Galeria</span>
                    </button>
                    {badgePhoto && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="p-2 rounded-lg bg-neutral-900 hover:bg-red-950 border border-neutral-700 hover:border-red-500/50 text-neutral-400 hover:text-red-400 transition cursor-pointer"
                        title="Remover foto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 py-4 px-6 rounded-xl font-extrabold text-base text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 group"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Registrando Compra & Gerando Crachá...</span>
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-5 h-5" />
                    <span>Enviar Comprovante no WhatsApp & Liberar Crachá</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="mt-3 p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-300 flex items-start gap-2.5 leading-relaxed">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Ao clicar no botão verde, seus dados são <strong>registrados no Dashboard em tempo real</strong> e abriremos automaticamente a conversa do WhatsApp <strong>(64 99336-7849)</strong> para você anexar seu comprovante.
                </span>
              </div>
            </form>
          </div>
        ) : (
          /* CONFIRMED DIGITAL VOUCHER & BADGE TICKET */
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            {/* Top Success Notice (Hidden on Print) */}
            <div className="print:hidden p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Dados Computados & Inscrição Confirmada!
                  </h3>
                  <p className="text-xs text-emerald-300">
                    Registrado com sucesso no Dashboard e enviado para o WhatsApp da organização: <strong className="text-white">(64) 99336-7849</strong>. Por favor, anexe o comprovante de pagamento na conversa para validação final.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleOpenWhatsAppManual}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-600/25 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp (64 99336-7849)</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-[#E50914]" />
                  <span>Imprimir</span>
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
                      {buyer?.fullName || fullName}
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-neutral-800 print:border-neutral-300 text-xs">
                      <div>
                        <span className="text-neutral-500 print:text-neutral-600 block">CPF</span>
                        <span className="font-mono font-bold text-neutral-200 print:text-neutral-800">{buyer?.cpf || cpf}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 print:text-neutral-600 block">Cargo / Especialidade</span>
                        <span className="font-semibold text-neutral-200 print:text-neutral-800">{buyer?.companyRole || companyRole || 'Participante VIP'}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 print:text-neutral-600 block">Método de Pagamento</span>
                        <span className="font-semibold text-emerald-400 print:text-emerald-700">{paymentMethod}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 print:text-neutral-600 block">Horário da Confirmação</span>
                        <span className="font-mono text-neutral-200 print:text-neutral-800">{lastPurchaseTime || 'Registrado'}</span>
                      </div>
                    </div>

                    {/* Receipt Request Notice */}
                    <div className="pt-3 border-t border-neutral-800 print:border-neutral-300 flex items-start gap-2.5 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/30">
                      <Paperclip className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-amber-200 print:text-neutral-800 leading-snug">
                        <strong>Comprovante Obrigatório:</strong> Por favor, envie uma foto ou arquivo do comprovante de pagamento na conversa do WhatsApp para confirmação oficial.
                      </p>
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

                {/* Right: Badge Photo & Personal Information */}
                <div className="md:w-72 flex flex-col items-center justify-between p-5 rounded-2xl bg-white text-black shadow-xl border border-neutral-300 print:border-black shrink-0">
                  <div className="w-full text-center">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 font-bold block mb-2">
                      Foto do Crachá Nominal
                    </span>

                    {/* Photo Container in place of the QR Code */}
                    <div className="relative w-36 h-48 sm:w-40 sm:h-52 mx-auto bg-neutral-100 border-2 border-neutral-300 rounded-2xl overflow-hidden shadow-inner flex flex-col items-center justify-center group mb-3">
                      {isProcessingPhoto ? (
                        <div className="flex flex-col items-center justify-center p-4 text-center">
                          <Loader2 className="w-6 h-6 animate-spin text-[#E50914] mb-2" />
                          <span className="text-[11px] font-bold text-neutral-700">Processando foto...</span>
                        </div>
                      ) : badgePhoto ? (
                        <>
                          <img
                            src={badgePhoto}
                            alt="Foto do Crachá"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 print:hidden">
                            <button
                              type="button"
                              onClick={() => cameraInputRef.current?.click()}
                              className="p-2 rounded-full bg-black/80 text-white hover:bg-[#E50914] transition cursor-pointer"
                              title="Tirar outra foto"
                            >
                              <Camera className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => galleryInputRef.current?.click()}
                              className="p-2 rounded-full bg-black/80 text-white hover:bg-[#E50914] transition cursor-pointer"
                              title="Escolher da galeria"
                            >
                              <ImageIcon className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={handleRemovePhoto}
                              className="p-2 rounded-full bg-black/80 text-white hover:bg-red-600 transition cursor-pointer"
                              title="Remover foto"
                            >
                              <Trash2 className="w-4 h-4 text-red-400 hover:text-white" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-3 text-center">
                          <div className="w-14 h-14 rounded-full bg-neutral-200 text-neutral-500 flex items-center justify-center mb-2 shadow-inner">
                            <Camera className="w-7 h-7" />
                          </div>
                          <span className="text-xs font-bold text-neutral-800 leading-tight">
                            Foto para o Crachá
                          </span>
                          <span className="text-[10px] text-neutral-500 mt-1 max-w-[120px]">
                            Tire uma foto ou escolha da galeria
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons: Tirar Foto & Escolher da Galeria */}
                    <div className="print:hidden w-full flex items-center justify-center gap-2 mb-3">
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-[#E50914] hover:bg-[#b80710] text-white text-[11px] font-bold transition shadow-md shadow-[#E50914]/20 cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Tirar Foto</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => galleryInputRef.current?.click()}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-[11px] font-bold transition shadow-sm cursor-pointer"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Galeria</span>
                      </button>
                    </div>

                    {badgePhoto && (
                      <div className="print:hidden text-[11px] text-emerald-600 font-bold mb-2 flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Foto anexada com sucesso!</span>
                      </div>
                    )}
                  </div>

                  {/* Personal Information of the Buyer */}
                  <div className="w-full bg-neutral-50 rounded-xl p-3.5 border border-neutral-200 text-left space-y-1.5 text-xs font-mono">
                    <div className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider pb-1.5 border-b border-neutral-200 flex items-center justify-between">
                      <span>Dados do Comprador</span>
                      <span className="text-[#E50914] font-bold">{voucherCode}</span>
                    </div>

                    <div className="pt-1 space-y-1.5 text-[11px]">
                      <div>
                        <span className="text-neutral-500 font-sans block text-[10px]">Nome Completo</span>
                        <strong className="text-neutral-900 uppercase font-bold text-xs block leading-tight">{buyer?.fullName || fullName}</strong>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-neutral-200">
                        <div>
                          <span className="text-neutral-500 font-sans block text-[10px]">CPF</span>
                          <span className="text-neutral-900 font-bold">{buyer?.cpf || cpf}</span>
                        </div>
                        <div>
                          <span className="text-neutral-500 font-sans block text-[10px]">WhatsApp</span>
                          <span className="text-neutral-900 font-bold">{buyer?.phone || phone}</span>
                        </div>
                      </div>
                      <div className="pt-1 border-t border-neutral-200">
                        <span className="text-neutral-500 font-sans block text-[10px]">E-mail</span>
                        <span className="text-neutral-800 truncate block">{buyer?.email || email}</span>
                      </div>
                      {Boolean(buyer?.companyRole || companyRole) && (
                        <div className="pt-1 border-t border-neutral-200">
                          <span className="text-neutral-500 font-sans block text-[10px]">Cargo / Especialidade</span>
                          <span className="text-neutral-900 font-semibold">{buyer?.companyRole || companyRole}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Guarantee Banner */}
              <div className="mt-8 pt-4 border-t border-neutral-800 print:border-neutral-300 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400 print:text-neutral-700">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Passaporte All-Access Oficial · R$ 200,00 Pago via Mercado Pago ({paymentMethod})</span>
                </div>
                <span className="font-mono text-[11px]">
                  Confirmado: {lastPurchaseTime || new Date().toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>

            {/* Actions: Re-open WhatsApp & Back to Site Button (Hidden on Print) */}
            <div className="print:hidden flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleOpenWhatsAppManual}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/30 transition cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Enviar Confirmação para WhatsApp (64 99336-7849)</span>
              </button>

              <button
                type="button"
                onClick={handleResetToNewSubmission}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white font-semibold text-xs transition cursor-pointer"
              >
                <span>Novo Crachá / Outra Compra</span>
              </button>

              <button
                type="button"
                onClick={onBackToSite}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-bold text-sm transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-[#E50914]" />
                <span>Voltar ao Site Oficial</span>
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
