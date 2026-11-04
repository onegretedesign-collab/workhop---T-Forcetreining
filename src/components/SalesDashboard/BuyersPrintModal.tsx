import React, { useState, useMemo } from 'react';
import { SaleRecord } from '../../types/sale';
import { formatCurrencyBRL, exportSalesToCSV } from '../../utils/salesCalculations';
import {
  X,
  Printer,
  Download,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  UserCheck,
  Building2,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface BuyersPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  sales: SaleRecord[];
}

export const BuyersPrintModal: React.FC<BuyersPrintModalProps> = ({
  isOpen,
  onClose,
  sales,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'confirmed' | 'pending'>('confirmed');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBuyers = useMemo(() => {
    return sales
      .filter((s) => {
        if (filterStatus === 'all') return true;
        return s.status === filterStatus;
      })
      .filter((s) => {
        if (!searchTerm.trim()) return true;
        const term = searchTerm.toLowerCase();
        return (
          s.customerName.toLowerCase().includes(term) ||
          (s.cpf && s.cpf.includes(term)) ||
          (s.email && s.email.toLowerCase().includes(term)) ||
          (s.phone && s.phone.includes(term))
        );
      })
      .sort((a, b) => a.customerName.localeCompare(b.customerName, 'pt-BR'));
  }, [sales, filterStatus, searchTerm]);

  if (!isOpen) return null;

  const totalAmount = filteredBuyers.reduce((sum, s) => sum + s.amount, 0);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    exportSalesToCSV(filteredBuyers, 'Lista_Participantes_Performance360');
  };

  const emissionDate = new Date().toLocaleString('pt-BR', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-5xl bg-[#111111] border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-6 text-neutral-100 print:bg-white print:text-black print:border-none print:shadow-none print:m-0 print:max-w-none"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Controls Bar (Hidden when printing) */}
        <div className="print:hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-4 border-b border-neutral-800 bg-[#161616]">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#E50914]/15 border border-[#E50914]/30 flex items-center justify-center text-[#E50914]">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Lista Oficial de Compradores & Credenciamento
              </h2>
              <p className="text-xs text-neutral-400">
                Lista de participantes para impressão e conferência na portaria
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#E50914] hover:bg-[#b80710] text-white rounded-xl text-xs font-bold transition shadow-lg shadow-[#E50914]/20 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Lista (A4)</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl text-xs font-semibold transition cursor-pointer"
              title="Exportar Planilha Excel/CSV"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">CSV</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition cursor-pointer"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter bar (Hidden when printing) */}
        <div className="print:hidden px-6 py-3 border-b border-neutral-800 bg-[#131313] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome ou CPF..."
              className="w-full pl-8 pr-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#E50914]"
            />
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-2.5" />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-neutral-400 text-xs">Exibir:</span>
            <div className="inline-flex rounded-lg border border-neutral-800 p-0.5 bg-neutral-900">
              <button
                type="button"
                onClick={() => setFilterStatus('confirmed')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                  filterStatus === 'confirmed'
                    ? 'bg-[#E50914] text-white font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Aprovados ({sales.filter((s) => s.status === 'confirmed').length})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('pending')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                  filterStatus === 'pending'
                    ? 'bg-[#E50914] text-white font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Pendentes ({sales.filter((s) => s.status === 'pending').length})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                  filterStatus === 'all'
                    ? 'bg-[#E50914] text-white font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Todos ({sales.length})
              </button>
            </div>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 sm:p-8 overflow-y-auto max-h-[calc(85vh-130px)] print:max-h-none print:p-0">
          {/* Header of Printable Sheet */}
          <div className="border-b-2 border-neutral-700 print:border-black pb-4 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#E50914] print:text-neutral-800 font-bold block">
                  WORKSHOP - T-FORCETREINING DRAGON GYM
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white print:text-black font-display tracking-tight">
                  LISTA OFICIAL DE COMPRADORES & CREDENCIAMENTO
                </h1>
                <p className="text-xs text-neutral-400 print:text-neutral-700 mt-1">
                  1º Congresso Performance 360º · Edição Oficial Presencial · 20 de Fevereiro de 2026
                </p>
              </div>

              <div className="text-right text-xs">
                <span className="block font-bold text-white print:text-black text-sm">
                  Total de Compradores: {filteredBuyers.length}
                </span>
                <span className="block font-mono text-emerald-400 print:text-neutral-900 font-bold">
                  Total: {formatCurrencyBRL(totalAmount)}
                </span>
                <span className="text-[10px] text-neutral-500 print:text-neutral-600">
                  Emitido em: {emissionDate}
                </span>
              </div>
            </div>
          </div>

          {/* Table of Buyers */}
          <div className="border border-neutral-800 print:border-neutral-400 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-neutral-900 print:bg-neutral-200 text-neutral-300 print:text-black uppercase font-mono font-semibold">
                <tr>
                  <th className="py-2.5 px-3 text-center w-12 border-b border-neutral-800 print:border-neutral-400">#</th>
                  <th className="py-2.5 px-3 border-b border-neutral-800 print:border-neutral-400">Nome do Participante (Crachá)</th>
                  <th className="py-2.5 px-3 border-b border-neutral-800 print:border-neutral-400">CPF</th>
                  <th className="py-2.5 px-3 border-b border-neutral-800 print:border-neutral-400">WhatsApp</th>
                  <th className="py-2.5 px-3 border-b border-neutral-800 print:border-neutral-400">E-mail</th>
                  <th className="py-2.5 px-3 text-center border-b border-neutral-800 print:border-neutral-400">Status</th>
                  <th className="py-2.5 px-3 text-center w-36 border-b border-neutral-800 print:border-neutral-400">Assinatura / Portaria</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 print:divide-neutral-300">
                {filteredBuyers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-neutral-500">
                      Nenhum comprador encontrado com os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredBuyers.map((sale, index) => (
                    <tr
                      key={sale.id}
                      className="hover:bg-neutral-900/40 print:hover:bg-transparent text-neutral-200 print:text-black"
                    >
                      <td className="py-2.5 px-3 text-center font-mono text-neutral-400 print:text-neutral-700">
                        {String(index + 1).padStart(2, '0')}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-white print:text-black">
                        {sale.customerName}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-neutral-300 print:text-neutral-800">
                        {sale.cpf || '—'}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-neutral-300 print:text-neutral-800">
                        {sale.phone || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-neutral-300 print:text-neutral-800 max-w-[150px] truncate">
                        {sale.email || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                            sale.status === 'confirmed'
                              ? 'bg-emerald-500/20 text-emerald-400 print:bg-transparent print:text-emerald-800'
                              : 'bg-amber-500/20 text-amber-400 print:bg-transparent print:text-amber-800'
                          }`}
                        >
                          {sale.status === 'confirmed' ? 'PAGO / OK' : 'PENDENTE'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 border-l border-neutral-800 print:border-neutral-300">
                        <div className="h-6 border-b border-dotted border-neutral-600 print:border-black flex items-end justify-center text-[9px] text-neutral-500 print:text-neutral-400">
                          {/* Signature line for event staff */}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Signature & Validation Footer for Staff */}
          <div className="mt-8 pt-4 border-t border-neutral-800 print:border-black flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 text-xs text-neutral-500 print:text-black">
            <div>
              <p className="font-bold text-neutral-300 print:text-black">
                Comissão de Credenciamento · Academia Dragon Gym
              </p>
              <p className="text-[11px] text-neutral-500 print:text-neutral-700">
                Lista gerada automaticamente pelo sistema integrado do evento.
              </p>
            </div>

            <div className="w-56 text-center border-t border-neutral-700 print:border-black pt-1">
              <span className="block text-[11px] font-bold text-neutral-400 print:text-black">
                Assinatura do Responsável
              </span>
              <span className="text-[10px] text-neutral-500">Portaria & Credenciamento</span>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="print:hidden px-6 py-3.5 border-t border-neutral-800 bg-[#161616] flex items-center justify-between text-xs text-neutral-400">
          <span>{filteredBuyers.length} compradores listados</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
