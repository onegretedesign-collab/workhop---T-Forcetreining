import React, { useState, useEffect } from 'react';
import { SUMMIT_EVENT } from '../data/summitData';
import { formatCPF, validateCPF, formatPhone, formatCurrency } from '../utils/formatters';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import {
  User,
  Mail,
  Phone,
  CreditCard,
  QrCode,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Edit3,
  Loader2,
  Lock,
} from 'lucide-react';

export interface BuyerData {
  fullName: string;
  email: string;
  phone: string;
  cpf: string;
  companyRole?: string;
  registeredAt?: string;
}

const STORAGE_KEY = 'performance360_buyer_data';

export const TicketCheckoutCard: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [companyRole, setCompanyRole] = useState('');

  // Form errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [leadSaved, setLeadSaved] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string>(SUMMIT_EVENT.checkoutUrl);

  // Load from localStorage if previously filled
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data: BuyerData = JSON.parse(saved);
        if (data.fullName) setFullName(data.fullName);
        if (data.email) setEmail(data.email);
        if (data.phone) setPhone(data.phone);
        if (data.cpf) setCpf(data.cpf);
        if (data.companyRole) setCompanyRole(data.companyRole);
      }
    } catch {
      // ignore
    }
  }, []);

  const validate = (): boolean => {
    const errs: { [key: string]: string } = {};

    if (!fullName.trim() || fullName.trim().length < 3) {
      errs.fullName = 'Informe seu nome completo para o crachá oficial';
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Informe um e-mail válido para receber seu voucher';
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      errs.phone = 'Informe seu WhatsApp com DDD (10 ou 11 dígitos)';
    }

    if (!cpf.trim() || !validateCPF(cpf)) {
      errs.cpf = 'Informe um CPF válido para identificação';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAdvance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    const buyer: BuyerData = {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      cpf: cpf.trim(),
      companyRole: companyRole.trim(),
      registeredAt: new Date().toISOString(),
    };

    let createdSaleId = '';
    try {
      // Save locally so the post-payment return page can access it automatically
      localStorage.setItem(STORAGE_KEY, JSON.stringify(buyer));

      // Register intent in Firestore sales as pending
      await addDoc(collection(db, 'sales'), {
        customerName: buyer.fullName,
        email: buyer.email,
        phone: buyer.phone,
        cpf: buyer.cpf,
        ticketType: 'Passaporte Oficial Performance 360º',
        attendeesCount: 1,
        amount: SUMMIT_EVENT.price,
        paymentMethod: 'credit_card',
        status: 'pending',
        notes: `Inscrição iniciada no site. Aguardando pagamento Mercado Pago. Cargo: ${buyer.companyRole || 'Não informado'}`,
        origin: 'online',
        createdAt: serverTimestamp(),
      });
      setLeadSaved(true);
    } catch (err) {
      console.warn('Erro ao registrar intenção no banco:', err);
    } finally {
      setIsSaving(false);
      setStep(2);
    }
  };

  return (
    <div className="mt-8 pt-6 border-t border-neutral-800">
      {step === 1 ? (
        /* STEP 1: Buyer Data Form */
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#E50914] font-bold block">
                Passo 1 de 2 · Identificação Oficial
              </span>
              <h4 className="text-base font-bold text-white mt-0.5">
                Preencha os dados do comprador
              </h4>
            </div>
            <span className="text-xs font-semibold text-neutral-400 bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded-full">
              Crachá Nominal
            </span>
          </div>

          <form onSubmit={handleAdvance} className="space-y-3.5">
            {/* Nome Completo */}
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Nome Completo (como sairá no crachá) <span className="text-[#E50914]">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
                  }}
                  placeholder="Ex: Carlos Eduardo de Oliveira"
                  className={`w-full pl-9 pr-3 py-2.5 bg-neutral-950 border rounded-xl text-xs sm:text-sm text-white placeholder-neutral-600 focus:outline-none transition ${
                    errors.fullName ? 'border-[#E50914] focus:border-[#E50914]' : 'border-neutral-800 focus:border-[#E50914]'
                  }`}
                />
                <User className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
              </div>
              {errors.fullName && (
                <p className="mt-1 text-[11px] text-[#E50914] flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.fullName}</span>
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
                      if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                    }}
                    placeholder="carlos@email.com"
                    className={`w-full pl-9 pr-3 py-2.5 bg-neutral-950 border rounded-xl text-xs sm:text-sm text-white placeholder-neutral-600 focus:outline-none transition ${
                      errors.email ? 'border-[#E50914] focus:border-[#E50914]' : 'border-neutral-800 focus:border-[#E50914]'
                    }`}
                  />
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                </div>
                {errors.email && (
                  <p className="mt-1 text-[11px] text-[#E50914] flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  WhatsApp / Celular <span className="text-[#E50914]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(formatPhone(e.target.value));
                      if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                    }}
                    placeholder="(11) 98765-4321"
                    maxLength={15}
                    className={`w-full pl-9 pr-3 py-2.5 bg-neutral-950 border rounded-xl text-xs sm:text-sm text-white placeholder-neutral-600 focus:outline-none transition font-mono ${
                      errors.phone ? 'border-[#E50914] focus:border-[#E50914]' : 'border-neutral-800 focus:border-[#E50914]'
                    }`}
                  />
                  <Phone className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-[11px] text-[#E50914] flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.phone}</span>
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
                    if (errors.cpf) setErrors((prev) => ({ ...prev, cpf: '' }));
                  }}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className={`w-full px-3 py-2.5 bg-neutral-950 border rounded-xl text-xs sm:text-sm text-white placeholder-neutral-600 focus:outline-none transition font-mono ${
                    errors.cpf ? 'border-[#E50914] focus:border-[#E50914]' : 'border-neutral-800 focus:border-[#E50914]'
                  }`}
                />
                {errors.cpf && (
                  <p className="mt-1 text-[11px] text-[#E50914] flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.cpf}</span>
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
                  placeholder="Ex: Treinador / Nutricionista"
                  className="w-full px-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs sm:text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#E50914] transition"
                />
              </div>
            </div>

            {/* Avançar Button */}
            <button
              type="submit"
              disabled={isSaving}
              className="w-full mt-4 py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base text-white bg-[#E50914] hover:bg-[#b80710] transition-all shadow-xl shadow-[#E50914]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 group"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Salvando dados...</span>
                </>
              ) : (
                <>
                  <span>Avançar para Finalização de Compra</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        /* STEP 2: Checkout & Compre Aqui */
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">
                Passo 2 de 2 · Finalização do Pedido
              </span>
              <h4 className="text-base font-bold text-white mt-0.5">
                Revise e finalize seu pagamento
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-white transition px-2.5 py-1 rounded-lg border border-neutral-800 hover:bg-neutral-900 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#E50914]" />
              <span>Editar dados</span>
            </button>
          </div>

          {/* Buyer summary review box */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800/80">
              <span className="text-neutral-400">Participante:</span>
              <span className="font-bold text-white text-right">{fullName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-400">CPF:</span>
              <span className="font-mono text-neutral-300">{cpf}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Contato:</span>
              <span className="text-neutral-300">{phone} · {email}</span>
            </div>
            {companyRole && (
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Crachá:</span>
                <span className="text-neutral-300">{companyRole}</span>
              </div>
            )}
            <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between">
              <span className="text-neutral-400">Total a pagar:</span>
              <span className="text-base font-extrabold text-emerald-400 font-mono">
                {formatCurrency(SUMMIT_EVENT.price)}
              </span>
            </div>
          </div>

          {/* Callout alert before redirect */}
          <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 text-neutral-300 text-xs flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="text-white font-semibold block mb-0.5">
                Pagamento 100% Protegido pelo Mercado Pago
              </span>
              Ao clicar em <strong className="text-white font-bold">Compre Aqui</strong>, você será direcionado ao link oficial do Mercado Pago para efetuar o Pix ou Cartão. Após a confirmação, você retornará para receber seu voucher digital e crachá nominal.
            </div>
          </div>

          {/* Official COMPRE AQUI Button requested by user */}
          <a
            href={paymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 px-6 rounded-xl font-bold text-base text-white bg-[#E50914] hover:bg-[#b80710] transition-all shadow-xl shadow-[#E50914]/30 flex items-center justify-center gap-2 cursor-pointer group hover:scale-[1.01]"
          >
            <Lock className="w-4 h-4" />
            <span>Compre Aqui (Pagar no Mercado Pago)</span>
            <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </a>

          {/* Payment submethods */}
          <div className="flex items-center justify-center gap-4 text-[11px] text-neutral-400 pt-1">
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <QrCode className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pix Instantâneo</span>
            </span>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <CreditCard className="w-3.5 h-3.5 text-blue-400" />
              <span>Cartão de Crédito em até 12x</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
