import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  DollarSign,
  Plus,
  Trash2,
  Edit,
  Building,
  Calendar,
} from 'lucide-react';
import { ComputedDebt, Payment } from '../types/finance';
import { formatCurrency, formatDate } from '../utils/formatters';

interface PaymentHistoryViewProps {
  payments: Payment[];
  debts: ComputedDebt[];
  onOpenPaymentModal: (debtId?: string) => void;
  onEditPayment: (payment: Payment) => void;
  onDeletePayment: (payment: Payment) => void;
  onSelectDebt: (debt: ComputedDebt) => void;
}

type DateRangeFilter = 'todos' | 'este_mes' | 'ultimos_30_dias' | 'ano_atual';

export const PaymentHistoryView: React.FC<PaymentHistoryViewProps> = ({
  payments,
  debts,
  onOpenPaymentModal,
  onEditPayment,
  onDeletePayment,
  onSelectDebt,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<DateRangeFilter>('todos');
  const [selectedDebtFilter, setSelectedDebtFilter] = useState<string>('todas');

  // Filtro de pagamentos
  const filteredPayments = useMemo(() => {
    const today = new Date();

    return payments
      .filter((p) => {
        const debt = debts.find((d) => d.id === p.debtId);
        const debtName = debt ? debt.name.toLowerCase() : '';
        const creditor = debt ? debt.creditor.toLowerCase() : '';
        const notes = (p.notes || '').toLowerCase();
        const method = (p.paymentMethod || '').toLowerCase();

        // Busca
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const match =
            debtName.includes(term) ||
            creditor.includes(term) ||
            notes.includes(term) ||
            method.includes(term);
          if (!match) return false;
        }

        // Filtro de Dívida
        if (selectedDebtFilter !== 'todas' && p.debtId !== selectedDebtFilter) {
          return false;
        }

        // Filtro de Data
        if (dateFilter === 'este_mes') {
          const [y, m] = p.paymentDate.split('-').map(Number);
          if (y !== today.getFullYear() || m !== today.getMonth() + 1) return false;
        } else if (dateFilter === 'ultimos_30_dias') {
          const pDate = new Date(p.paymentDate);
          const diffDays = (today.getTime() - pDate.getTime()) / (1000 * 3600 * 24);
          if (diffDays < 0 || diffDays > 30) return false;
        } else if (dateFilter === 'ano_atual') {
          const [y] = p.paymentDate.split('-').map(Number);
          if (y !== today.getFullYear()) return false;
        }

        return true;
      })
      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
  }, [payments, debts, searchTerm, dateFilter, selectedDebtFilter]);

  const totalFilteredAmount = useMemo(() => {
    return filteredPayments.reduce((acc, curr) => acc + curr.amount, 0);
  }, [filteredPayments]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Histórico de Pagamentos
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Registro de todas as amortizações realizadas e comprovantes anotados
          </p>
        </div>

        <button
          onClick={() => onOpenPaymentModal()}
          disabled={debts.length === 0}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Pagamento</span>
        </button>
      </div>

      {/* KPI Cards do Histórico */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0f1d32] border border-slate-800 rounded-xl p-5">
          <div className="text-xs text-slate-400 font-medium">Total Amortizado (Filtro Atual)</div>
          <div className="text-2xl font-bold text-emerald-400 tabular-nums mt-2">
            {formatCurrency(totalFilteredAmount)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Redução direta da dívida</div>
        </div>

        <div className="bg-[#0f1d32] border border-slate-800 rounded-xl p-5">
          <div className="text-xs text-slate-400 font-medium">Quantidade de Pagamentos</div>
          <div className="text-2xl font-bold text-white tabular-nums mt-2">
            {filteredPayments.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            de {payments.length} registro(s) no total
          </div>
        </div>

        <div className="bg-[#0f1d32] border border-slate-800 rounded-xl p-5">
          <div className="text-xs text-slate-400 font-medium">Média por Pagamento</div>
          <div className="text-2xl font-bold text-sky-400 tabular-nums mt-2">
            {filteredPayments.length > 0
              ? formatCurrency(totalFilteredAmount / filteredPayments.length)
              : 'R$ 0,00'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Cálculo matemático</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-[#0f1d32] border border-slate-800 rounded-xl p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por dívida, credor, método ou observação..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#0b132b] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={selectedDebtFilter}
              onChange={(e) => setSelectedDebtFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0b132b] border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="todas">Todas as dívidas</option>
              {debts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.creditor})
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as DateRangeFilter)}
              className="w-full px-3 py-2 rounded-lg bg-[#0b132b] border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="todos">Todo o período</option>
              <option value="este_mes">Este mês</option>
              <option value="ultimos_30_dias">Últimos 30 dias</option>
              <option value="ano_atual">Este ano</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista / Tabela de Pagamentos */}
      {payments.length === 0 ? (
        <div className="bg-[#0f1d32] border border-slate-800 rounded-xl p-12 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto mb-4">
            <DollarSign className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white">Nenhum pagamento registrado ainda</h2>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Ao amortizar ou quitar qualquer dívida, registre o pagamento aqui para deduzir o saldo restante automaticamente.
          </p>
          <button
            onClick={() => onOpenPaymentModal()}
            disabled={debts.length === 0}
            className="mt-6 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            Registrar Primeiro Pagamento
          </button>
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="bg-[#0f1d32] border border-slate-800 rounded-xl p-8 text-center">
          <p className="text-sm font-semibold text-white">Nenhum pagamento corresponde aos filtros</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setDateFilter('todos');
              setSelectedDebtFilter('todas');
            }}
            className="mt-3 px-3.5 py-1.5 bg-slate-800 text-xs text-slate-200 font-medium rounded-lg border border-slate-700"
          >
            Limpar filtros
          </button>
        </div>
      ) : (
        <div className="bg-[#0f1d32] border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-200">
              <thead className="bg-[#0b132b] text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Dívida / Credor</th>
                  <th className="px-4 py-3">Forma de Pagamento</th>
                  <th className="px-4 py-3">Parcela / Detalhes</th>
                  <th className="px-4 py-3 text-right">Valor Pago</th>
                  <th className="px-4 py-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredPayments.map((p) => {
                  const debt = debts.find((d) => d.id === p.debtId);
                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3.5 whitespace-nowrap font-medium text-slate-200 tabular-nums">
                        {formatDate(p.paymentDate)}
                      </td>

                      <td className="px-4 py-3.5">
                        {debt ? (
                          <button
                            onClick={() => onSelectDebt(debt)}
                            className="text-left font-bold text-white hover:text-emerald-400 transition-colors block"
                          >
                            {debt.name}
                            <span className="text-[11px] text-slate-400 font-normal block">
                              {debt.creditor}
                            </span>
                          </button>
                        ) : (
                          <span className="text-slate-400 italic">Dívida arquivada/excluída</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="bg-slate-800 px-2 py-0.5 rounded text-[11px] text-slate-300">
                          {p.paymentMethod || 'Não informado'}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="text-slate-300 block">
                          {p.installmentNumber ? `Parcela ${p.installmentNumber}` : 'Amortização livre'}
                        </span>
                        {p.notes && (
                          <span className="text-[11px] text-slate-400 block truncate max-w-xs">
                            {p.notes}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <span className="font-bold text-emerald-400 text-sm tabular-nums">
                          {formatCurrency(p.amount)}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onEditPayment(p)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                            title="Editar pagamento"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeletePayment(p)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded transition-colors"
                            title="Excluir / estornar pagamento"
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
        </div>
      )}
    </div>
  );
};
