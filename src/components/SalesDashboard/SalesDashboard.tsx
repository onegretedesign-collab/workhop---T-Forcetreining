import React, { useState, useEffect, useMemo } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  addDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { SaleRecord, SaleFormData, PaymentMethod, SaleStatus } from '../../types/sale';
import {
  calculateSalesSummary,
  formatCurrencyBRL,
  exportSalesToCSV,
  PAYMENT_METHOD_LABELS,
  STATUS_LABELS,
} from '../../utils/salesCalculations';
import { SaleFormModal } from './SaleFormModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { SalesReportModal } from './SalesReportModal';
import { BuyersPrintModal } from './BuyersPrintModal';
import {
  ArrowLeft,
  Plus,
  FileSpreadsheet,
  FileText,
  UserCheck,
  Copy,
  Check,
  Search,
  Filter,
  DollarSign,
  Users,
  CreditCard,
  TrendingUp,
  Edit2,
  Trash2,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  XCircle,
  Sparkles,
  RefreshCw,
  Building2,
  Calendar,
  AlertCircle,
  ArrowUpDown,
} from 'lucide-react';

interface SalesDashboardProps {
  onBackToSite: () => void;
}

export const SalesDashboard: React.FC<SalesDashboardProps> = ({ onBackToSite }) => {
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | SaleStatus>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | PaymentMethod>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'name_asc'>('date_desc');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<SaleRecord | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingSale, setDeletingSale] = useState<SaleRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isBuyersModalOpen, setIsBuyersModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Real-time Firestore sync
  useEffect(() => {
    setIsLoading(true);
    const q = query(collection(db, 'sales'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loaded: SaleRecord[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          loaded.push({
            id: docSnap.id,
            customerName: data.customerName || 'Participante',
            email: data.email || '',
            phone: data.phone || '',
            cpf: data.cpf || '',
            ticketType: data.ticketType || 'Passaporte Completo',
            attendeesCount: Number(data.attendeesCount) || 1,
            amount: Number(data.amount) || 0,
            paymentMethod: (
              data.paymentMethod === 'Pix Instantâneo' || data.paymentMethod === 'pix' ? 'pix' :
              data.paymentMethod === 'Cartão de Crédito' || data.paymentMethod === 'credit_card' ? 'credit_card' :
              (data.paymentMethod as PaymentMethod) || 'pix'
            ),
            status: (data.status as SaleStatus) || 'confirmed',
            notes: data.notes || '',
            origin: data.origin === 'online' ? 'online' : 'manual',
            companyRole: data.companyRole || '',
            voucherCode: data.voucherCode || '',
            purchaseTime: data.purchaseTime || '',
            checkedIn: Boolean(data.checkedIn),
            checkInTime: data.checkInTime || '',
            checkInStaff: data.checkInStaff || '',
            createdAt:
              data.createdAt?.toDate?.()?.toISOString() ||
              (typeof data.createdAt === 'string' ? data.createdAt : new Date().toISOString()),
            updatedAt:
              data.updatedAt?.toDate?.()?.toISOString() ||
              (typeof data.updatedAt === 'string' ? data.updatedAt : undefined),
          });
        });
        setSales(loaded);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Firestore sales listener error:', err);
        setError('Não foi possível sincronizar com o banco de dados em tempo real.');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Create or Update sale
  const handleSaveSale = async (formData: SaleFormData, id?: string) => {
    if (id) {
      // Edit existing
      const saleRef = doc(db, 'sales', id);
      await setDoc(
        saleRef,
        {
          ...formData,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      showToast('Registro de venda atualizado com sucesso!');
    } else {
      // Create new manual sale
      await addDoc(collection(db, 'sales'), {
        ...formData,
        origin: 'manual',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      showToast('Nova venda manual registrada no sistema!');
    }
  };

  // Delete sale
  const handleConfirmDelete = async () => {
    if (!deletingSale) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'sales', deletingSale.id));
      showToast('Venda removida com sucesso!');
      setIsDeleteModalOpen(false);
      setDeletingSale(null);
    } catch (err) {
      console.error('Delete error:', err);
      showToast('Erro ao remover o registro.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Summary Metrics calculations
  const summary = useMemo(() => calculateSalesSummary(sales, 500), [sales]);

  // Filtered & Sorted Sales
  const filteredSales = useMemo(() => {
    return sales
      .filter((s) => {
        // Status filter
        if (statusFilter !== 'all' && s.status !== statusFilter) return false;
        // Payment filter
        if (paymentFilter !== 'all' && s.paymentMethod !== paymentFilter) return false;
        // Search term
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchName = (s.customerName || '').toLowerCase().includes(term);
          const matchEmail = (s.email || '').toLowerCase().includes(term);
          const matchPhone = (s.phone || '').toLowerCase().includes(term);
          const matchCpf = (s.cpf || '').toLowerCase().includes(term);
          const matchTicket = (s.ticketType || '').toLowerCase().includes(term);
          const matchNotes = (s.notes || '').toLowerCase().includes(term);
          if (!matchName && !matchEmail && !matchPhone && !matchCpf && !matchTicket && !matchNotes) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'date_asc') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortBy === 'amount_desc') {
          return (b.amount || 0) - (a.amount || 0);
        }
        if (sortBy === 'name_asc') {
          return (a.customerName || '').localeCompare(b.customerName || '');
        }
        return 0;
      });
  }, [sales, statusFilter, paymentFilter, searchTerm, sortBy]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-neutral-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#0E0E0E]/95 backdrop-blur-md border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToSite}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white text-xs font-semibold transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar ao Site</span>
            </button>

            <div className="h-5 w-px bg-neutral-800 hidden sm:block" />

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#E50914] uppercase tracking-wider">
                  Performance 360º
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-700/50 text-emerald-400 text-[10px] font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Sincronizado
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Painel de Gestão e Vendas
              </h1>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
            <button
              type="button"
              onClick={() => setIsBuyersModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-bold transition shadow cursor-pointer border border-amber-500/30"
              title="Visualizar e Imprimir Lista de Presença para a Portaria"
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Imprimir Lista de Compradores</span>
            </button>

            <button
              type="button"
              onClick={() => setIsReportModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold transition shadow cursor-pointer border border-neutral-700"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Relatório Explicativo</span>
            </button>

            <button
              type="button"
              onClick={() => exportSalesToCSV(sales, 'Performance 360')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold transition shadow cursor-pointer border border-neutral-700"
              title="Baixar planilha para Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Exportar CSV</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEditingSale(null);
                setIsFormModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E50914] hover:bg-[#b80710] text-white text-xs font-bold transition shadow-lg shadow-[#E50914]/25 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Venda Manual</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {error && (
          <div className="p-4 bg-red-950/60 border border-red-800 rounded-2xl flex items-center gap-3 text-red-200 text-xs">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}


        {/* Section: KPI Cards (Faturamento e Lotação) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Faturamento Confirmado */}
          <div className="relative p-5 rounded-2xl bg-[#121212] border border-neutral-800 overflow-hidden group hover:border-neutral-700 transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-neutral-400">
                Faturamento Total (Entradas)
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono tracking-tight">
              {formatCurrencyBRL(summary.totalConfirmedRevenue)}
            </div>
            <div className="mt-2 text-[11px] text-neutral-400 flex items-center justify-between">
              <span>{summary.confirmedTransactions} pagamentos confirmados</span>
              {summary.totalPendingRevenue > 0 && (
                <span className="text-amber-400 font-mono">
                  +{formatCurrencyBRL(summary.totalPendingRevenue)} pendente
                </span>
              )}
            </div>
          </div>

          {/* Card 2: Quantidade de Pessoas / Lotação */}
          <div className="relative p-5 rounded-2xl bg-[#121212] border border-neutral-800 overflow-hidden group hover:border-neutral-700 transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-neutral-400">
                Participantes Confirmados
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#E50914]/10 border border-[#E50914]/20 flex items-center justify-center text-[#E50914]">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                {summary.confirmedAttendees}
              </span>
              <span className="text-xs text-neutral-500 font-mono">
                / {summary.capacityTotal} pessoas
              </span>
            </div>
            <div className="mt-2.5">
              <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-[#E50914] h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, summary.spotsOccupiedPercentage)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
                <span>{summary.spotsOccupiedPercentage}% da Academia Dragon</span>
                <span className="text-emerald-400">{summary.spotsRemaining} vagas livres</span>
              </div>
            </div>
          </div>

          {/* Card 3: Ticket Médio */}
          <div className="relative p-5 rounded-2xl bg-[#121212] border border-neutral-800 overflow-hidden group hover:border-neutral-700 transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-neutral-400">
                Ticket Médio por Participante
              </span>
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono tracking-tight">
              {formatCurrencyBRL(summary.averageTicket)}
            </div>
            <p className="mt-2 text-[11px] text-neutral-400">
              Valor médio gerado por pessoa credenciada
            </p>
          </div>

          {/* Card 4: Detalhe de Pagamento Rápido */}
          <div className="relative p-5 rounded-2xl bg-[#121212] border border-neutral-800 overflow-hidden group hover:border-neutral-700 transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-neutral-400">
                Entradas por Canal
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1 mt-1 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-400">PIX:</span>
                <span className="font-mono text-emerald-400 font-semibold">
                  {formatCurrencyBRL(
                    summary.paymentMethodBreakdown.find((p) => p.method === 'pix')?.amount || 0
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Cartão:</span>
                <span className="font-mono text-blue-400 font-semibold">
                  {formatCurrencyBRL(
                    summary.paymentMethodBreakdown.find((p) => p.method === 'credit_card')?.amount || 0
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Dinheiro:</span>
                <span className="font-mono text-amber-300 font-semibold">
                  {formatCurrencyBRL(
                    summary.paymentMethodBreakdown.find((p) => p.method === 'cash')?.amount || 0
                  )}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Toolbar with Search and Filters */}
        <section className="bg-[#121212] border border-neutral-800 rounded-2xl p-4 space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome, WhatsApp, e-mail, CPF, lote ou observação..."
                className="w-full pl-9 pr-3 py-2 bg-neutral-900 border border-neutral-700/80 rounded-xl text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#E50914]"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white text-xs"
                >
                  ✕ Limpar
                </button>
              )}
            </div>

            {/* Filter controls */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 bg-neutral-900 border border-neutral-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-[#E50914] cursor-pointer"
              >
                <option value="all">Status: Todos</option>
                <option value="confirmed">Confirmados / Pagos</option>
                <option value="pending">Pendentes</option>
                <option value="cancelled">Cancelados</option>
              </select>

              {/* Payment Filter */}
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value as any)}
                className="px-3 py-2 bg-neutral-900 border border-neutral-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-[#E50914] cursor-pointer"
              >
                <option value="all">Pagamento: Todos</option>
                <option value="pix">PIX</option>
                <option value="credit_card">Cartão</option>
                <option value="cash">Dinheiro</option>
                <option value="bank_transfer">Transferência</option>
                <option value="complimentary">Cortesia</option>
              </select>

              {/* Sort selector */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-neutral-900 border border-neutral-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-[#E50914] cursor-pointer"
              >
                <option value="date_desc">Mais Recentes</option>
                <option value="date_asc">Mais Antigos</option>
                <option value="amount_desc">Maior Valor</option>
                <option value="name_asc">Nome (A-Z)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-neutral-400 pt-1 border-t border-neutral-850">
            <span>
              Exibindo <strong className="text-white">{filteredSales.length}</strong> de{' '}
              <strong className="text-white">{sales.length}</strong> vendas cadastradas
            </span>
          </div>
        </section>

        {/* Section: Sales Table / List */}
        <section className="bg-[#121212] border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-neutral-400">
              <RefreshCw className="w-7 h-7 text-[#E50914] animate-spin" />
              <p className="text-sm">Carregando dados de vendas do Firestore...</p>
            </div>
          ) : filteredSales.length === 0 ? (
            <div className="py-16 text-center px-4">
              <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto text-neutral-500 mb-3">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">
                Nenhum registro encontrado
              </h3>
              <p className="text-xs text-neutral-400 max-w-md mx-auto mb-5">
                {searchTerm || statusFilter !== 'all' || paymentFilter !== 'all'
                  ? 'Nenhuma venda corresponde aos filtros selecionados. Tente limpar os filtros de busca.'
                  : 'Nenhuma venda foi registrada ainda no sistema de controle. Adicione uma venda manual ou aguarde novas compras.'}
              </p>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingSale(null);
                    setIsFormModalOpen(true);
                  }}
                  className="px-4 py-2 bg-[#E50914] hover:bg-[#b80710] text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  + Cadastrar Venda Manual
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#171717] border-b border-neutral-800 text-neutral-400 uppercase font-mono font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">Participante (Crachá)</th>
                    <th className="py-3.5 px-4">Ingresso / Lote</th>
                    <th className="py-3.5 px-4 text-center">Pessoas</th>
                    <th className="py-3.5 px-4">Pagamento</th>
                    <th className="py-3.5 px-4 text-right">Valor (R$)</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4">Data</th>
                    <th className="py-3.5 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/70">
                  {filteredSales.map((sale) => {
                    const isConfirmed = sale.status === 'confirmed';
                    const isPending = sale.status === 'pending';
                    const isCancelled = sale.status === 'cancelled';

                    return (
                      <tr
                        key={sale.id}
                        className="hover:bg-neutral-900/50 transition group"
                      >
                        {/* Participante Info */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white text-sm">
                            {sale.customerName}
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-neutral-400 mt-0.5">
                            {sale.phone && (
                              <a
                                href={`https://wa.me/55${sale.phone.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-emerald-400 hover:underline"
                                title="Chamar no WhatsApp"
                              >
                                <Phone className="w-3 h-3" />
                                <span>{sale.phone}</span>
                              </a>
                            )}
                            {sale.email && (
                              <span className="inline-flex items-center gap-1 text-neutral-400 truncate max-w-[150px]">
                                <Mail className="w-3 h-3" />
                                <span>{sale.email}</span>
                              </span>
                            )}
                          </div>
                          {sale.notes && (
                            <p className="text-[10px] text-neutral-500 italic mt-0.5 truncate max-w-[260px]">
                              Obs: {sale.notes}
                            </p>
                          )}
                        </td>

                        {/* Ingresso / Lote */}
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-neutral-200 block">
                            {sale.ticketType}
                          </span>
                          <span className="text-[10px] text-neutral-500 uppercase font-mono">
                            {sale.origin === 'online' ? '🌐 Checkout Online' : '🏢 Caixa Manual'}
                          </span>
                        </td>

                        {/* Quantidade de Pessoas */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-bold text-white font-mono">
                            {sale.attendeesCount}
                          </span>
                        </td>

                        {/* Forma de Pagamento */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                              sale.paymentMethod === 'pix'
                                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'
                                : sale.paymentMethod === 'credit_card'
                                ? 'bg-blue-950/80 text-blue-300 border border-blue-700/60'
                                : sale.paymentMethod === 'cash'
                                ? 'bg-amber-950/80 text-amber-300 border border-amber-700/60'
                                : sale.paymentMethod === 'complimentary'
                                ? 'bg-purple-950/80 text-purple-300 border border-purple-700/60'
                                : 'bg-neutral-800 text-neutral-300'
                            }`}
                          >
                            {PAYMENT_METHOD_LABELS[sale.paymentMethod] || sale.paymentMethod}
                          </span>
                        </td>

                        {/* Valor Total */}
                        <td className="py-3.5 px-4 text-right">
                          <span className="font-mono font-bold text-sm text-emerald-400">
                            {formatCurrencyBRL(sale.amount)}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                              isConfirmed
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : isPending
                                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                : 'bg-red-500/15 text-red-400 border border-red-500/30'
                            }`}
                          >
                            {isConfirmed ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : isPending ? (
                              <Clock className="w-3 h-3" />
                            ) : (
                              <XCircle className="w-3 h-3" />
                            )}
                            <span>{STATUS_LABELS[sale.status] || sale.status}</span>
                          </span>
                        </td>

                        {/* Data / Hora */}
                        <td className="py-3.5 px-4 text-neutral-400 text-[11px] whitespace-nowrap">
                          {sale.createdAt ? new Date(sale.createdAt).toLocaleDateString('pt-BR') : '-'}
                          <span className="block text-[10px] text-neutral-500">
                            {sale.createdAt ? new Date(sale.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </td>

                        {/* Ações */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingSale(sale);
                                setIsFormModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white transition cursor-pointer"
                              title="Editar venda"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDeletingSale(sale);
                                setIsDeleteModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-neutral-900 hover:bg-red-950/60 text-neutral-400 hover:text-red-400 transition cursor-pointer"
                              title="Excluir venda"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* Modals */}
      <SaleFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingSale(null);
        }}
        onSubmit={handleSaveSale}
        initialData={editingSale}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingSale(null);
        }}
        onConfirm={handleConfirmDelete}
        sale={deletingSale}
        isDeleting={isDeleting}
      />

      <SalesReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        summary={summary}
        sales={sales}
      />

      <BuyersPrintModal
        isOpen={isBuyersModalOpen}
        onClose={() => setIsBuyersModalOpen(false)}
        sales={sales}
      />
    </div>
  );
};
