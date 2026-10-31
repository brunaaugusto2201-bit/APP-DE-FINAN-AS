import React from 'react';
import {
  X,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Building,
  CreditCard,
  FileText,
  DollarSign,
  AlertCircle,
  Clock,
  Layers,
} from 'lucide-react';
import { ComputedDebt, Payment } from '../types/finance';
import {
  formatCurrency,
  formatDate,
  getCategoryLabel,
  getStatusBadge,
} from '../utils/formatters';

interface DebtDetailModalProps {
  debt: ComputedDebt | null;
  payments: Payment[];
  isOpen: boolean;
  onClose: () => void;
  onOpenPaymentModal: (debtId: string) => void;
  onEditDebt: (debt: ComputedDebt) => void;
  onDeleteDebt: (debt: ComputedDebt) => void;
  onDeletePayment: (payment: Payment) => void;
}

export const DebtDetailModal: React.FC<DebtDetailModalProps> = ({
  debt,
  payments,
  isOpen,
  onClose,
  onOpenPaymentModal,
  onEditDebt,
  onDeleteDebt,
  onDeletePayment,
}) => {
  if (!isOpen || !debt) return null;

  const status = getStatusBadge(debt.calculatedStatus, debt.isOverdue);
  const debtPayments = payments
    .filter((p) => p.debtId === debt.id)
    .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#0d1b2a] border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-8 my-8 text-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-xs text-slate-400 font-medium">
                {getCategoryLabel(debt.category)}
              </span>
              <span className="text-slate-600">&bull;</span>
              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${status.bg} ${status.text}`}>
                {status.label}
              </span>
              {debt.isOverdue && (
                <span className="text-xs text-rose-400 font-bold bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/40">
                  {Math.abs(debt.daysUntilDue)} dias de atraso
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-white truncate">
              {debt.name}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span>Credor: <strong className="text-slate-200">{debt.creditor}</strong></span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shrink-0"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto pr-1 mt-6 space-y-6 flex-1">
          {/* Alerta de transparência */}
          <div className="bg-[#0b132b] border border-slate-800 rounded-lg p-3 text-xs text-slate-400 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Diferenciação obrigatória entre informações do usuário e cálculos do sistema.</span>
            </div>
          </div>

          {/* Comparativo: Informado pelo Usuário vs Calculado pelo Sistema */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bloco 1: Informado pelo Usuário */}
            <div className="bg-[#0f1d32] border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-500" />
                  Informado pelo Usuário
                </span>
                <span className="text-[11px] text-slate-400">Dados do contrato</span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Valor original:</span>
                  <strong className="text-white tabular-nums">{formatCurrency(debt.originalValue)}</strong>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Valor atualizado:</span>
                  <strong className="text-white tabular-nums">{formatCurrency(debt.currentValue)}</strong>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Taxa de juros:</span>
                  <span className="text-slate-200 font-medium">{debt.interestRate || 'Não informado'}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Data de vencimento:</span>
                  <span className="text-slate-200 font-semibold tabular-nums">{formatDate(debt.dueDate)}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Parcelamento:</span>
                  <span className="text-slate-200">
                    {debt.totalInstallments
                      ? `${debt.totalInstallments} parcelas (${debt.remainingInstallments ?? '?'} restantes)`
                      : 'Pagamento único / Sem parcelas'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bloco 2: Calculado pelo Sistema */}
            <div className="bg-[#0f1d32] border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Cálculo do Sistema
                </span>
                <span className="text-[11px] text-slate-400">Baseado nos pagamentos</span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Total já amortizado:</span>
                  <strong className="text-emerald-400 tabular-nums">{formatCurrency(debt.totalPaid)}</strong>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Saldo restante:</span>
                  <strong className="text-sky-400 text-sm tabular-nums">{formatCurrency(debt.remainingBalance)}</strong>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Progresso de quitação:</span>
                  <span className="text-emerald-400 font-bold tabular-nums">{debt.progressPercentage}%</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Situação de vencimento:</span>
                  <span className={`font-semibold ${debt.isOverdue ? 'text-rose-400' : 'text-slate-200'}`}>
                    {debt.isOverdue
                      ? `Vencida há ${Math.abs(debt.daysUntilDue)} dias`
                      : debt.daysUntilDue === 0
                      ? 'Vence hoje'
                      : `Vence em ${debt.daysUntilDue} dias`}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Pagamentos computados:</span>
                  <span className="text-slate-200">{debtPayments.length} registro(s)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Barra de Progresso visual */}
          <div className="bg-[#0b132b] border border-slate-800 rounded-xl p-4">
            <div className="flex justify-between text-xs mb-2">
              <span className="font-semibold text-slate-300">Quitação desta dívida</span>
              <span className="font-bold text-emerald-400 tabular-nums">{debt.progressPercentage}%</span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${debt.progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Observações do Usuário */}
          {debt.notes && (
            <div className="bg-[#0f1d32] border border-slate-800 rounded-xl p-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                Observações Informadas
              </h3>
              <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                {debt.notes}
              </p>
            </div>
          )}

          {/* Histórico de Pagamentos desta dívida */}
          <div className="bg-[#0f1d32] border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  Pagamentos Registrados ({debtPayments.length})
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Amortizações que reduzem o saldo restante desta dívida
                </p>
              </div>

              <button
                onClick={() => onOpenPaymentModal(debt.id)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Pagamento</span>
              </button>
            </div>

            {debtPayments.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                Nenhum pagamento registrado para esta dívida ainda. Clique no botão acima para registrar uma parcela ou amortização.
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {debtPayments.map((p) => (
                  <div
                    key={p.id}
                    className="py-3 flex items-center justify-between gap-4 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-400 tabular-nums">
                          {formatCurrency(p.amount)}
                        </span>
                        {p.installmentNumber && (
                          <span className="text-[11px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                            Parcela {p.installmentNumber}
                          </span>
                        )}
                        <span className="text-slate-400">
                          {p.paymentMethod || 'Forma não informada'}
                        </span>
                      </div>
                      <div className="text-slate-500 text-[11px] mt-0.5 flex items-center gap-2">
                        <span>Data do pagamento: {formatDate(p.paymentDate)}</span>
                        {p.notes && <span>&bull; {p.notes}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onDeletePayment(p)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded transition-colors"
                        title="Excluir / estornar pagamento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Rodapé do Modal */}
        <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEditDebt(debt)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Editar Dívida</span>
            </button>
            <button
              onClick={() => onDeleteDebt(debt)}
              className="px-3.5 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-semibold rounded-lg border border-rose-800/50 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Excluir</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenPaymentModal(debt.id)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Registrar Pagamento</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
