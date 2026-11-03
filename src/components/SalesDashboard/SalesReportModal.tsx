import React, { useState } from 'react';
import { SaleRecord } from '../../types/sale';
import {
  SalesReportSummary,
  formatCurrencyBRL,
  exportSalesToCSV,
  generateWhatsAppSummary,
} from '../../utils/salesCalculations';
import {
  X,
  Printer,
  Download,
  Copy,
  Check,
  TrendingUp,
  Users,
  DollarSign,
  PieChart,
  Building2,
  Calendar,
  Clock,
  Sparkles,
} from 'lucide-react';

interface SalesReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: SalesReportSummary;
  sales: SaleRecord[];
}

export const SalesReportModal: React.FC<SalesReportModalProps> = ({
  isOpen,
  onClose,
  summary,
  sales,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyWhatsApp = async () => {
    const text = generateWhatsAppSummary(summary);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleExportCSV = () => {
    exportSalesToCSV(sales, 'Performance 360');
  };

  const emissionDate = new Date().toLocaleString('pt-BR', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-4xl bg-[#101010] border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-6 animate-in fade-in zoom-in-95 duration-150 text-neutral-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Top Bar (hidden on print) */}
        <div className="print:hidden flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-[#161616]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#E50914]/15 border border-[#E50914]/30 flex items-center justify-center text-[#E50914]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                Relatório Gerencial de Vendas & Lotação
              </h2>
              <p className="text-[11px] text-neutral-400">
                Performance 360º · Fechamento de Caixa Oficial
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white rounded-xl text-xs font-semibold transition cursor-pointer"
              title="Imprimir ou Salvar em PDF"
            >
              <Printer className="w-3.5 h-3.5 text-neutral-300" />
              <span className="hidden sm:inline">Imprimir / PDF</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white rounded-xl text-xs font-semibold transition cursor-pointer"
              title="Baixar planilha CSV"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>

            <button
              type="button"
              onClick={handleCopyWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-emerald-700/20 cursor-pointer"
              title="Copiar resumo para WhatsApp"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'WhatsApp'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div id="printable-report" className="p-6 sm:p-10 space-y-8 max-h-[82vh] overflow-y-auto print:max-h-none print:p-0 print:bg-white print:text-black">
          {/* Header of Report */}
          <div className="border-b border-neutral-800 pb-6 print:border-neutral-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#E50914] print:text-red-600 block mb-1">
                  DEMONSTRATIVO FINANCEIRO E DE PÚBLICO
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-white print:text-black uppercase tracking-tight">
                  PERFORMANCE 360º
                </h1>
                <p className="text-xs sm:text-sm text-neutral-400 print:text-neutral-600 mt-1">
                  Congresso de Hipertrofia, Hormonal, Nutrição & Reabilitação
                </p>
              </div>

              <div className="text-left sm:text-right text-xs text-neutral-400 print:text-neutral-600 space-y-1">
                <div className="flex items-center sm:justify-end gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#E50914] print:text-red-600" />
                  <span>Academia Dragon Gym · São Paulo</span>
                </div>
                <div className="flex items-center sm:justify-end gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-neutral-400 print:text-neutral-600" />
                  <span>Data do Evento: 20 de Fevereiro · 15:00</span>
                </div>
                <div className="flex items-center sm:justify-end gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-neutral-400 print:text-neutral-600" />
                  <span>Emitido em: {emissionDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Executive KPI Cards */}
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 print:text-neutral-700 mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400 print:text-emerald-700" />
              <span>1. Resumo das Entradas Financeiras (Caixa Geral)</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 print:bg-neutral-100 print:border-neutral-300">
                <span className="text-[11px] font-semibold text-neutral-400 print:text-neutral-600 block">
                  Faturamento Confirmado
                </span>
                <span className="text-lg sm:text-2xl font-black text-emerald-400 print:text-emerald-700 block mt-1">
                  {formatCurrencyBRL(summary.totalConfirmedRevenue)}
                </span>
                <span className="text-[10px] text-neutral-500 print:text-neutral-600 mt-0.5 block">
                  {summary.confirmedTransactions} vendas pagas
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 print:bg-neutral-100 print:border-neutral-300">
                <span className="text-[11px] font-semibold text-neutral-400 print:text-neutral-600 block">
                  Valores Pendentes
                </span>
                <span className="text-lg sm:text-2xl font-black text-amber-400 print:text-amber-700 block mt-1">
                  {formatCurrencyBRL(summary.totalPendingRevenue)}
                </span>
                <span className="text-[10px] text-neutral-500 print:text-neutral-600 mt-0.5 block">
                  Aguardando liquidação
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 print:bg-neutral-100 print:border-neutral-300">
                <span className="text-[11px] font-semibold text-neutral-400 print:text-neutral-600 block">
                  Faturamento Projetado
                </span>
                <span className="text-lg sm:text-2xl font-black text-white print:text-black block mt-1">
                  {formatCurrencyBRL(summary.totalProjectedRevenue)}
                </span>
                <span className="text-[10px] text-neutral-500 print:text-neutral-600 mt-0.5 block">
                  Confirmado + Pendente
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 print:bg-neutral-100 print:border-neutral-300">
                <span className="text-[11px] font-semibold text-neutral-400 print:text-neutral-600 block">
                  Ticket Médio
                </span>
                <span className="text-lg sm:text-2xl font-black text-cyan-400 print:text-cyan-700 block mt-1">
                  {formatCurrencyBRL(summary.averageTicket)}
                </span>
                <span className="text-[10px] text-neutral-500 print:text-neutral-600 mt-0.5 block">
                  Por participante pago
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Headcount & Capacity */}
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 print:text-neutral-700 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#E50914] print:text-red-600" />
              <span>2. Controle de Participantes & Lotação da Academia Dragon</span>
            </h3>

            <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 print:bg-neutral-100 print:border-neutral-300 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div>
                  <span className="text-[11px] text-neutral-400 print:text-neutral-600 block">
                    Pessoas Confirmadas
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-white print:text-black">
                    {summary.confirmedAttendees}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-neutral-400 print:text-neutral-600 block">
                    Capacidade Total
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-neutral-300 print:text-neutral-800">
                    {summary.capacityTotal}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-neutral-400 print:text-neutral-600 block">
                    Taxa de Ocupação
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-[#E50914] print:text-red-600">
                    {summary.spotsOccupiedPercentage}%
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-neutral-400 print:text-neutral-600 block">
                    Vagas Disponíveis
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-emerald-400 print:text-emerald-700">
                    {summary.spotsRemaining}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="w-full bg-neutral-800 print:bg-neutral-300 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-[#E50914] print:bg-red-600 h-full transition-all duration-500 rounded-full"
                    style={{ width: `${Math.min(100, summary.spotsOccupiedPercentage)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-neutral-400 print:text-neutral-600 mt-1">
                  <span>0 inscritos</span>
                  <span>{summary.confirmedAttendees} de {summary.capacityTotal} vagas preenchidas</span>
                  <span>500 limite máximo</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Inflows by Payment Method */}
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 print:text-neutral-700 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400 print:text-cyan-700" />
              <span>3. Discriminação de Valores por Forma de Pagamento</span>
            </h3>

            <div className="rounded-2xl border border-neutral-800 overflow-hidden print:border-neutral-300">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-900/90 print:bg-neutral-200 text-neutral-400 print:text-neutral-800 uppercase font-mono font-semibold">
                  <tr>
                    <th className="py-3 px-4">Método de Pagamento</th>
                    <th className="py-3 px-4 text-center">Transações</th>
                    <th className="py-3 px-4 text-right">Valor Total (R$)</th>
                    <th className="py-3 px-4 text-right">% do Caixa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/80 print:divide-neutral-300">
                  {summary.paymentMethodBreakdown.map((pm) => (
                    <tr key={pm.method} className="hover:bg-neutral-900/40 print:hover:bg-transparent">
                      <td className="py-3 px-4 font-semibold text-white print:text-black">
                        {pm.label}
                      </td>
                      <td className="py-3 px-4 text-center text-neutral-300 print:text-neutral-700">
                        {pm.count}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400 print:text-emerald-700">
                        {formatCurrencyBRL(pm.amount)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-neutral-300 print:text-neutral-700">
                        {pm.percentage}%
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-neutral-900/70 print:bg-neutral-100 font-bold">
                    <td className="py-3 px-4 text-white print:text-black uppercase">
                      Total Consolidado
                    </td>
                    <td className="py-3 px-4 text-center text-white print:text-black">
                      {summary.confirmedTransactions}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-400 print:text-emerald-700 text-sm">
                      {formatCurrencyBRL(summary.totalConfirmedRevenue)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-white print:text-black">
                      100.0%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Breakdown by Ticket Category */}
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 print:text-neutral-700 mb-3 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-amber-400 print:text-amber-700" />
              <span>4. Detalhamento por Categoria de Ingresso / Lote</span>
            </h3>

            <div className="rounded-2xl border border-neutral-800 overflow-hidden print:border-neutral-300">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-900/90 print:bg-neutral-200 text-neutral-400 print:text-neutral-800 uppercase font-mono font-semibold">
                  <tr>
                    <th className="py-3 px-4">Lote / Tipo de Acesso</th>
                    <th className="py-3 px-4 text-center">Vendas</th>
                    <th className="py-3 px-4 text-center">Pessoas (Crachás)</th>
                    <th className="py-3 px-4 text-right">Valor Total</th>
                    <th className="py-3 px-4 text-right">Participação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/80 print:divide-neutral-300">
                  {summary.ticketTypeBreakdown.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-neutral-500">
                        Nenhum ingresso registrado ainda.
                      </td>
                    </tr>
                  ) : (
                    summary.ticketTypeBreakdown.map((item) => (
                      <tr key={item.ticketType} className="hover:bg-neutral-900/40 print:hover:bg-transparent">
                        <td className="py-3 px-4 font-semibold text-white print:text-black">
                          {item.ticketType}
                        </td>
                        <td className="py-3 px-4 text-center text-neutral-300 print:text-neutral-700">
                          {item.count}
                        </td>
                        <td className="py-3 px-4 text-center text-neutral-300 print:text-neutral-700 font-bold">
                          {item.attendees}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400 print:text-emerald-700">
                          {formatCurrencyBRL(item.amount)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-neutral-300 print:text-neutral-700">
                          {item.percentage}%
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 5: Signature & Validation */}
          <div className="pt-6 border-t border-neutral-800 print:border-neutral-300 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 text-xs text-neutral-500 print:text-neutral-600">
            <div>
              <p className="font-semibold text-neutral-400 print:text-neutral-700 mb-1">
                Comissão Organizadora · Performance 360º
              </p>
              <p>Relatório gerado automaticamente via sistema integrado Firestore.</p>
              <p className="text-[10px] text-neutral-600 print:text-neutral-500 mt-1">
                ID da Transação de Fechamento: {sales.length} registros computados
              </p>
            </div>

            <div className="w-56 text-center border-t border-neutral-700 print:border-neutral-400 pt-2">
              <span className="block text-[11px] font-semibold text-neutral-300 print:text-neutral-800">
                Responsável pelo Caixa
              </span>
              <span className="text-[10px] text-neutral-500">
                Academia Dragon Gym
              </span>
            </div>
          </div>
        </div>

        {/* Footer info (print:hidden) */}
        <div className="print:hidden px-6 py-3.5 border-t border-neutral-800 bg-[#161616] flex items-center justify-between text-xs text-neutral-400">
          <span>
            {sales.length} registros no total · {summary.confirmedAttendees} participantes confirmados
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            Fechar Relatório
          </button>
        </div>
      </div>
    </div>
  );
};
