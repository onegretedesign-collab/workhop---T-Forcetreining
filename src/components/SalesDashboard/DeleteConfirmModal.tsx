import React from 'react';
import { SaleRecord } from '../../types/sale';
import { formatCurrencyBRL } from '../../utils/salesCalculations';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  sale: SaleRecord | null;
  isDeleting: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  sale,
  isDeleting,
}) => {
  if (!isOpen || !sale) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#141414] border border-neutral-800 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-800/80 flex items-center justify-center text-red-500 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-white mb-1">
              Excluir Venda do Registro?
            </h3>
            <p className="text-xs text-neutral-400 mb-3 leading-relaxed">
              Tem certeza que deseja remover permanentemente o registro de venda de{' '}
              <strong className="text-neutral-200">{sale.customerName}</strong> no valor de{' '}
              <strong className="text-emerald-400">{formatCurrencyBRL(sale.amount)}</strong>?
            </p>
            <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs space-y-1 mb-4 text-neutral-300">
              <div className="flex justify-between">
                <span className="text-neutral-500">Participante:</span>
                <span className="font-semibold text-white">{sale.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Ingresso:</span>
                <span>{sale.ticketType} ({sale.attendeesCount} pessoa{sale.attendeesCount > 1 ? 's' : ''})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Valor:</span>
                <span className="font-bold text-emerald-400">{formatCurrencyBRL(sale.amount)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 mt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-semibold text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-xl transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition shadow-lg shadow-red-600/30 cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? 'Excluindo...' : 'Sim, Excluir Registro'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
