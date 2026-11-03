import React, { useState, useEffect } from 'react';
import { SaleRecord, SaleFormData, PaymentMethod, SaleStatus } from '../../types/sale';
import { formatPhone, formatCPF } from '../../utils/formatters';
import { X, Check, Loader2, AlertCircle, DollarSign, User, Mail, Phone, FileText, Tag, Users } from 'lucide-react';

interface SaleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SaleFormData, id?: string) => Promise<void>;
  initialData?: SaleRecord | null;
}

const TICKET_PRESETS = [
  { label: 'Passaporte Completo (R$ 200,00)', name: 'Passaporte Completo', price: 200 },
  { label: 'VIP Premium Dragon (R$ 350,00)', name: 'VIP Premium Dragon', price: 350 },
  { label: 'Lote Promocional Antecipado (R$ 150,00)', name: 'Lote Promocional Antecipado', price: 150 },
  { label: 'Cortesia / Patrocinador (R$ 0,00)', name: 'Cortesia / Patrocinador', price: 0 },
  { label: 'Personalizado / Outro', name: 'Personalizado', price: 0 },
];

export const SaleFormModal: React.FC<SaleFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [ticketType, setTicketType] = useState('Passaporte Completo');
  const [attendeesCount, setAttendeesCount] = useState<number>(1);
  const [amount, setAmount] = useState<number>(200);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [status, setStatus] = useState<SaleStatus>('confirmed');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setCustomerName(initialData.customerName || '');
      setEmail(initialData.email || '');
      setPhone(initialData.phone || '');
      setCpf(initialData.cpf || '');
      setTicketType(initialData.ticketType || 'Passaporte Completo');
      setAttendeesCount(initialData.attendeesCount || 1);
      setAmount(initialData.amount ?? 200);
      setPaymentMethod(initialData.paymentMethod || 'pix');
      setStatus(initialData.status || 'confirmed');
      setNotes(initialData.notes || '');
    } else {
      setCustomerName('');
      setEmail('');
      setPhone('');
      setCpf('');
      setTicketType('Passaporte Completo');
      setAttendeesCount(1);
      setAmount(200);
      setPaymentMethod('pix');
      setStatus('confirmed');
      setNotes('');
    }
    setErrorMessage(null);
  }, [initialData, isOpen]);

  const handlePresetChange = (selectedName: string) => {
    setTicketType(selectedName);
    const preset = TICKET_PRESETS.find((p) => p.name === selectedName);
    if (preset && preset.name !== 'Personalizado') {
      setAmount(preset.price * attendeesCount);
      if (preset.price === 0) {
        setPaymentMethod('complimentary');
      }
    }
  };

  const handleAttendeesChange = (count: number) => {
    const validCount = Math.max(1, count);
    setAttendeesCount(validCount);
    const preset = TICKET_PRESETS.find((p) => p.name === ticketType);
    if (preset && preset.name !== 'Personalizado') {
      setAmount(preset.price * validCount);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim()) {
      setErrorMessage('Por favor, informe o nome do participante.');
      return;
    }

    if (amount < 0) {
      setErrorMessage('O valor não pode ser negativo.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(
        {
          customerName: customerName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          cpf: cpf.trim(),
          ticketType: ticketType.trim() || 'Passaporte Completo',
          attendeesCount: Math.max(1, Number(attendeesCount) || 1),
          amount: Number(amount) || 0,
          paymentMethod,
          status,
          notes: notes.trim(),
        },
        initialData?.id
      );
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar registro de venda.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isEditing = Boolean(initialData);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div
        className="relative w-full max-w-2xl bg-[#121212] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-6 animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-[#171717]">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-[#E50914] block">
              Controle de Caixa · Performance 360º
            </span>
            <h2 className="text-lg font-bold text-white">
              {isEditing ? 'Editar Venda / Participante' : 'Cadastrar Nova Venda Manual'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl flex items-start gap-2.5 text-red-200 text-xs">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section: Participante */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#E50914]" />
              <span>Nome do Participante (Crachá) *</span>
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Ex: Carlos Eduardo Silva"
              required
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#E50914]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-neutral-400" />
                <span>WhatsApp / Telefone</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="(11) 99999-9999"
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#E50914]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-neutral-400" />
                <span>E-mail</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@email.com"
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#E50914]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-neutral-400" />
                <span>CPF (Opcional)</span>
              </label>
              <input
                type="text"
                value={cpf}
                onChange={(e) => setCpf(formatCPF(e.target.value))}
                placeholder="000.000.000-00"
                maxLength={14}
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#E50914]"
              />
            </div>
          </div>

          {/* Section: Valores & Ingresso */}
          <div className="pt-2 border-t border-neutral-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-neutral-300 mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-neutral-400" />
                <span>Tipo de Ingresso / Lote</span>
              </label>
              <select
                value={ticketType}
                onChange={(e) => handlePresetChange(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-[#E50914]"
              >
                {TICKET_PRESETS.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-neutral-400" />
                <span>Qtd de Pessoas</span>
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={attendeesCount}
                onChange={(e) => handleAttendeesChange(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-[#E50914]"
              />
            </div>
          </div>

          {/* Valores & Forma de Pagamento */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>Valor Total Cobrado (R$) *</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                required
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-sm font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Forma de Pagamento
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-[#E50914]"
              >
                <option value="pix">PIX Instantâneo</option>
                <option value="credit_card">Cartão de Crédito</option>
                <option value="cash">Dinheiro em Espécie</option>
                <option value="bank_transfer">Transferência / TED</option>
                <option value="complimentary">Cortesia / Patrocinador</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Status da Venda
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as SaleStatus)}
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-[#E50914]"
              >
                <option value="confirmed">Confirmado / Pago</option>
                <option value="pending">Pendente / Aguardando</option>
                <option value="cancelled">Cancelado / Estornado</option>
              </select>
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Observações de Caixa (Opcional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Pago direto na recepção da Academia Dragon em 2x no cartão de crédito físico."
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#E50914]"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-neutral-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-xl transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-bold text-white bg-[#E50914] hover:bg-[#b80710] rounded-xl transition shadow-lg shadow-[#E50914]/30 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{isEditing ? 'Atualizar Venda' : 'Salvar Venda'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
