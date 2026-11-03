import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { SUMMIT_EVENT } from '../data/summitData';
import {
  formatCPF,
  validateCPF,
  formatPhone,
  formatCurrency,
  generateVoucherId,
  calculateInstallments,
  cleanDigits,
} from '../utils/formatters';
import {
  X,
  CreditCard,
  QrCode,
  ShieldCheck,
  Copy,
  Check,
  Lock,
  Loader2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export interface VoucherData {
  voucherId: string;
  fullName: string;
  badgeName: string;
  cpf: string;
  email: string;
  phone: string;
  companyRole?: string;
  paymentMethod: 'pix' | 'credit_card';
  installments?: number;
  totalPaid: number;
  purchaseDate: string;
  bannerUrl: string;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeBannerUrl: string;
  onSuccess: (voucher: VoucherData) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  activeBannerUrl,
  onSuccess,
}) => {
  // Step 1: Buyer Data
  const [badgeName, setBadgeName] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyRole, setCompanyRole] = useState('');

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card'>('pix');

  // Credit Card fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [selectedInstallment, setSelectedInstallment] = useState(1);

  // Status & Feedback
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [copiedPix, setCopiedPix] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const installmentOptions = calculateInstallments(SUMMIT_EVENT.price, 12);

  // Simulated Pix Copia e Cola Code
  const pixCode = `00020126580014br.gov.bcb.pix0136workshop-t-forcetreining@mercadopago.com5204000053039865406${SUMMIT_EVENT.price.toFixed(
    2
  )}5802BR5925WORKSHOP T-FORCETREINING6009SAO PAULO62070503***6304${Math.random()
    .toString(16)
    .slice(2, 6)
    .toUpperCase()}`;

  const handleCopyPix = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(pixCode);
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 3000);
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = cleanDigits(e.target.value).slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = cleanDigits(e.target.value).slice(0, 4);
    if (raw.length <= 2) {
      setCardExpiry(raw);
    } else {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!badgeName.trim() || badgeName.trim().length < 3) {
      newErrors.badgeName = 'Informe o nome completo para impressão no crachá.';
    }

    if (!cpf.trim()) {
      newErrors.cpf = 'Informe o CPF do titular.';
    } else if (!validateCPF(cpf)) {
      newErrors.cpf = 'CPF inválido. Verifique os dígitos.';
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Informe um endereço de e-mail válido.';
    }

    if (!phone.trim() || cleanDigits(phone).length < 10) {
      newErrors.phone = 'Informe um WhatsApp com DDD válido.';
    }

    if (paymentMethod === 'credit_card') {
      if (cleanDigits(cardNumber).length < 16) {
        newErrors.cardNumber = 'Número de cartão incompleto (16 dígitos).';
      }
      if (!cardHolder.trim() || cardHolder.trim().length < 3) {
        newErrors.cardHolder = 'Nome do titular conforme impresso no cartão.';
      }
      if (cleanDigits(cardExpiry).length < 4) {
        newErrors.cardExpiry = 'Validade inválida (MM/AA).';
      }
      if (cleanDigits(cardCvv).length < 3) {
        newErrors.cardCvv = 'CVV inválido (3 ou 4 dígitos).';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsProcessing(true);

    // Simulate Mercado Pago processing
    setTimeout(() => {
      setIsProcessing(false);
      const chosenInstallment = installmentOptions.find((opt) => opt.count === selectedInstallment);
      const totalPaid =
        paymentMethod === 'credit_card' && chosenInstallment
          ? chosenInstallment.totalAmount
          : SUMMIT_EVENT.price;

      const voucher: VoucherData = {
        voucherId: generateVoucherId(),
        fullName: badgeName.trim().toUpperCase(),
        badgeName: badgeName.trim().toUpperCase(),
        cpf: formatCPF(cpf),
        email: email.trim().toLowerCase(),
        phone: formatPhone(phone),
        companyRole: companyRole.trim().toUpperCase() || 'PARTICIPANTE VIP',
        paymentMethod,
        installments: paymentMethod === 'credit_card' ? selectedInstallment : undefined,
        totalPaid,
        purchaseDate: new Date().toLocaleString('pt-BR'),
        bannerUrl: activeBannerUrl,
      };

      // Automatically register online sale in Firestore sales collection
      addDoc(collection(db, 'sales'), {
        customerName: badgeName.trim().toUpperCase(),
        email: email.trim().toLowerCase(),
        phone: formatPhone(phone),
        cpf: formatCPF(cpf),
        ticketType: 'Passaporte Completo',
        attendeesCount: 1,
        amount: totalPaid,
        paymentMethod: paymentMethod === 'credit_card' ? 'credit_card' : 'pix',
        status: 'confirmed',
        origin: 'online',
        notes: `Compra realizada no checkout do site (${paymentMethod === 'credit_card' ? `Cartão em ${selectedInstallment}x` : 'PIX Instantâneo'}). Crachá: ${badgeName.trim().toUpperCase()}`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }).catch((err) => {
        console.warn('Could not record online sale in Firestore:', err);
      });

      onSuccess(voucher);
    }, 1200);
  };

  const detectedCardBrand = cleanDigits(cardNumber).startsWith('4')
    ? 'Visa'
    : cleanDigits(cardNumber).startsWith('5')
    ? 'Mastercard'
    : 'Cartão';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-3xl bg-[#111111] border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-8 animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
      >
        {/* Mercado Pago Header */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-neutral-800 bg-[#161616]">
          <div className="flex items-center gap-3">
            {/* Mercado Pago stylized logo */}
            <div className="h-8 px-2.5 rounded-lg bg-[#009EE3]/15 border border-[#009EE3]/40 flex items-center gap-1.5 text-[#009EE3]">
              <span className="font-extrabold text-sm tracking-tight">mercado</span>
              <span className="font-light text-sm tracking-tight text-white">pago</span>
            </div>
            <div>
              <h2 id="checkout-title" className="text-base font-bold text-white font-display">
                Checkout Seguro · WORKSHOP - T-FORCETREINING
              </h2>
              <p className="text-xs text-neutral-400">
                Simulação de pagamento oficial com emissão de voucher nominal
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            aria-label="Fechar checkout"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Summary Strip */}
        <div className="px-6 sm:px-8 py-3.5 bg-neutral-950 border-b border-neutral-800/80 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-neutral-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Congresso Presencial · Performance 360º (Crachá Físico Nominal)</span>
          </div>
          <span className="text-white font-bold text-sm">
            {formatCurrency(SUMMIT_EVENT.price)}
          </span>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmitPayment} className="p-6 sm:p-8 space-y-6 flex-1 overflow-y-auto max-h-[70vh]">
          {/* Section 1: Buyer & Badge Information */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-5 h-5 rounded-full bg-[#E50914] text-white text-[11px] font-bold flex items-center justify-center font-mono">
                1
              </span>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                Dados do Participante & Crachá Nominal
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label htmlFor="badgeName" className="block text-xs font-medium text-neutral-300 mb-1">
                  Nome Completo (Para impressão no crachá físico) *
                </label>
                <input
                  id="badgeName"
                  type="text"
                  value={badgeName}
                  onChange={(e) => setBadgeName(e.target.value)}
                  placeholder="Ex: Dra. Juliana Menezes"
                  className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-700 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#E50914]"
                />
                {errors.badgeName && (
                  <p className="mt-1 text-xs text-[#E50914] flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.badgeName}</span>
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="cpf" className="block text-xs font-medium text-neutral-300 mb-1">
                  CPF do Titular *
                </label>
                <input
                  id="cpf"
                  type="text"
                  value={cpf}
                  onChange={(e) => setCpf(formatCPF(e.target.value))}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-700 rounded-xl text-sm text-white font-mono placeholder-neutral-500 focus:outline-none focus:border-[#E50914]"
                />
                {errors.cpf && (
                  <p className="mt-1 text-xs text-[#E50914] flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.cpf}</span>
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-xs font-medium text-neutral-300 mb-1">
                  WhatsApp com DDD *
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  placeholder="(11) 98765-4321"
                  maxLength={15}
                  className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-700 rounded-xl text-sm text-white font-mono placeholder-neutral-500 focus:outline-none focus:border-[#E50914]"
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-[#E50914] flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.phone}</span>
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-medium text-neutral-300 mb-1">
                  E-mail para envio do Voucher *
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-700 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#E50914]"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-[#E50914] flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="companyRole" className="block text-xs font-medium text-neutral-300 mb-1">
                  Cargo & Empresa (Opcional para o crachá)
                </label>
                <input
                  id="companyRole"
                  type="text"
                  value={companyRole}
                  onChange={(e) => setCompanyRole(e.target.value)}
                  placeholder="Ex: CTO · Acme Corp"
                  className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-700 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#E50914]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Payment Method Choice */}
          <div className="pt-4 border-t border-neutral-800">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-5 h-5 rounded-full bg-[#E50914] text-white text-[11px] font-bold flex items-center justify-center font-mono">
                2
              </span>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                Forma de Pagamento (Mercado Pago)
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <button
                type="button"
                onClick={() => setPaymentMethod('pix')}
                className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all text-left ${
                  paymentMethod === 'pix'
                    ? 'border-[#009EE3] bg-[#009EE3]/10 text-white shadow-md'
                    : 'border-neutral-800 bg-neutral-900/50 text-neutral-400 hover:text-white hover:border-neutral-700'
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">
                    Pix Instantâneo
                  </span>
                  <span className="text-[11px] text-emerald-400 font-mono">
                    Aprovação em segundos
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('credit_card')}
                className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all text-left ${
                  paymentMethod === 'credit_card'
                    ? 'border-[#009EE3] bg-[#009EE3]/10 text-white shadow-md'
                    : 'border-neutral-800 bg-neutral-900/50 text-neutral-400 hover:text-white hover:border-neutral-700'
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">
                    Cartão de Crédito
                  </span>
                  <span className="text-[11px] text-neutral-400 font-mono">
                    Em até 12x
                  </span>
                </div>
              </button>
            </div>

            {/* Pix Interface */}
            {paymentMethod === 'pix' && (
              <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 flex flex-col sm:flex-row items-center gap-6">
                {/* Visual QR Code (SVG) */}
                <div className="w-40 h-40 bg-white p-2.5 rounded-2xl shadow-xl flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {/* Stylized QR Matrix */}
                    <rect width="100" height="100" fill="#ffffff" />
                    {/* Corner 1 */}
                    <rect x="5" y="5" width="26" height="26" fill="#000000" />
                    <rect x="9" y="9" width="18" height="18" fill="#ffffff" />
                    <rect x="13" y="13" width="10" height="10" fill="#000000" />
                    {/* Corner 2 */}
                    <rect x="69" y="5" width="26" height="26" fill="#000000" />
                    <rect x="73" y="9" width="18" height="18" fill="#ffffff" />
                    <rect x="77" y="13" width="10" height="10" fill="#000000" />
                    {/* Corner 3 */}
                    <rect x="5" y="69" width="26" height="26" fill="#000000" />
                    <rect x="9" y="73" width="18" height="18" fill="#ffffff" />
                    <rect x="13" y="77" width="10" height="10" fill="#000000" />
                    {/* Data modules */}
                    <rect x="36" y="8" width="6" height="6" fill="#000000" />
                    <rect x="46" y="15" width="6" height="6" fill="#000000" />
                    <rect x="56" y="8" width="6" height="6" fill="#000000" />
                    <rect x="38" y="38" width="24" height="24" fill="#009EE3" rx="4" />
                    <text x="50" y="54" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">MP</text>
                    <rect x="69" y="38" width="6" height="6" fill="#000000" />
                    <rect x="80" y="45" width="6" height="6" fill="#000000" />
                    <rect x="8" y="38" width="6" height="6" fill="#000000" />
                    <rect x="18" y="48" width="6" height="6" fill="#000000" />
                    <rect x="38" y="72" width="6" height="6" fill="#000000" />
                    <rect x="48" y="80" width="6" height="6" fill="#000000" />
                    <rect x="60" y="69" width="6" height="6" fill="#000000" />
                    <rect x="75" y="75" width="6" height="6" fill="#000000" />
                    <rect x="85" y="85" width="8" height="8" fill="#000000" />
                  </svg>
                </div>

                <div className="flex-1 w-full space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400">Tempo para expiração do Pix:</span>
                    <span className="font-mono text-emerald-400 font-bold">14:59 min</span>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider block mb-1">
                      Código Pix Copia e Cola
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={pixCode}
                        className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-xs font-mono text-neutral-300 truncate focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleCopyPix}
                        className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
                      >
                        {copiedPix ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-neutral-400 leading-normal">
                    Abra o app do seu banco ou Mercado Pago, escolha <strong className="text-white">Pagar com Pix</strong> e aponte a câmera para o QR Code ou cole o código acima.
                  </p>
                </div>
              </div>
            )}

            {/* Credit Card Interface */}
            {paymentMethod === 'credit_card' && (
              <div className="space-y-4 p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="cardNumber" className="text-xs font-medium text-neutral-300">
                        Número do Cartão de Crédito *
                      </label>
                      <span className="text-xs font-mono text-neutral-400">
                        {detectedCardBrand}
                      </span>
                    </div>
                    <input
                      id="cardNumber"
                      type="text"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="0000 0000 0000 0000"
                      maxLength={19}
                      className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-sm text-white font-mono placeholder-neutral-500 focus:outline-none focus:border-[#009EE3]"
                    />
                    {errors.cardNumber && (
                      <p className="mt-1 text-xs text-[#E50914] flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{errors.cardNumber}</span>
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="cardHolder" className="block text-xs font-medium text-neutral-300 mb-1">
                      Nome impresso no Cartão *
                    </label>
                    <input
                      id="cardHolder"
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                      placeholder="NOME COMO ESTÁ NO CARTÃO"
                      className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-sm text-white uppercase placeholder-neutral-500 focus:outline-none focus:border-[#009EE3]"
                    />
                    {errors.cardHolder && (
                      <p className="mt-1 text-xs text-[#E50914] flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{errors.cardHolder}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="cardExpiry" className="block text-xs font-medium text-neutral-300 mb-1">
                      Validade (MM/AA) *
                    </label>
                    <input
                      id="cardExpiry"
                      type="text"
                      value={cardExpiry}
                      onChange={handleExpiryChange}
                      placeholder="12/28"
                      maxLength={5}
                      className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-sm text-white font-mono placeholder-neutral-500 focus:outline-none focus:border-[#009EE3]"
                    />
                    {errors.cardExpiry && (
                      <p className="mt-1 text-xs text-[#E50914] flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{errors.cardExpiry}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="cardCvv" className="block text-xs font-medium text-neutral-300 mb-1">
                      Código de Segurança (CVV) *
                    </label>
                    <input
                      id="cardCvv"
                      type="password"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(cleanDigits(e.target.value).slice(0, 4))}
                      placeholder="123"
                      maxLength={4}
                      className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-sm text-white font-mono placeholder-neutral-500 focus:outline-none focus:border-[#009EE3]"
                    />
                    {errors.cardCvv && (
                      <p className="mt-1 text-xs text-[#E50914] flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{errors.cardCvv}</span>
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="installmentsSelect" className="block text-xs font-medium text-neutral-300 mb-1">
                      Opção de Parcelamento
                    </label>
                    <select
                      id="installmentsSelect"
                      value={selectedInstallment}
                      onChange={(e) => setSelectedInstallment(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#009EE3]"
                    >
                      {installmentOptions.map((opt) => (
                        <option key={opt.count} value={opt.count}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-neutral-800">
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 px-6 rounded-xl font-bold text-base text-white bg-[#009EE3] hover:bg-[#0082ba] transition-all shadow-xl shadow-[#009EE3]/25 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processando com Mercado Pago...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>
                    {paymentMethod === 'pix'
                      ? 'Confirmar Pagamento Pix & Gerar Voucher'
                      : `Pagar ${formatCurrency(
                          installmentOptions.find((o) => o.count === selectedInstallment)?.totalAmount ||
                            SUMMIT_EVENT.price
                        )} com Mercado Pago`}
                  </span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 mt-3 text-xs text-neutral-500">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Ambiente de simulação Mercado Pago 256-bit SSL · Emissão Instantânea</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
