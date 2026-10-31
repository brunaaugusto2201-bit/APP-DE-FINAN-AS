import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  LayoutGrid,
  Table as TableIcon,
  Trash2,
  Edit,
  DollarSign,
  ChevronRight,
  Info,
} from 'lucide-react';
import { ComputedDebt, DebtCategory, DebtStatus } from '../types/finance';
import {
  formatCurrency,
  formatDate,
  getCategoryLabel,
  getCategoryColor,
  getStatusBadge,
} from '../utils/formatters';

interface DebtListViewProps {
  debts: ComputedDebt[];
  onOpenNewDebtModal: () => void;
  onEditDebt: (debt: ComputedDebt) => void;
  onDeleteDebt: (debt: ComputedDebt) => void;
  onOpenPaymentModal: (debtId: string) => void;
  onSelectDebt: (debt: ComputedDebt) => void;
}

type DateFilterOption = 'todas' | 'vencidas' | 'este_mes' | 'proximos_30_dias';
type SortOption = 'dueDate_asc' | 'dueDate_desc' | 'balance_desc' | 'balance_asc' | 'name_asc';

export const DebtListView: React.FC<DebtListViewProps> = ({
  debts,
  onOpenNewDebtModal,
  onEditDebt,
  onDeleteDebt,
  onOpenPaymentModal,
  onSelectDebt,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCreditor, setSelectedCreditor] = useState<string>('todos');
  const [selectedCategory, setSelectedCategory] = useState<DebtCategory | 'todas'>('todas');
  const [selectedStatus, setSelectedStatus] = useState<DebtStatus | 'todas' | 'vencidas'>('todas');
  const [selectedDateFilter, setSelectedDateFilter] = useState<DateFilterOption>('todas');
  const [sortBy, setSortBy] = useState<SortOption>('dueDate_asc');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Obter lista única de credores cadastrados
  const creditors = useMemo(() => {
    const set = new Set<string>();
    debts.forEach((d) => {
      if (d.creditor) set.add(d.creditor);
    });
    return Array.from(set).sort();
  }, [debts]);

  // Filtragem e ordenação
  const filteredDebts = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return debts
      .filter((debt) => {
        // Busca textual
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchName = debt.name.toLowerCase().includes(term);
          const matchCreditor = debt.creditor.toLowerCase().includes(term);
          if (!matchName && !matchCreditor) return false;
        }

        // Filtro por credor
        if (selectedCreditor !== 'todos' && debt.creditor !== selectedCreditor) {
          return false;
        }

        // Filtro por categoria
        if (selectedCategory !== 'todas' && debt.category !== selectedCategory) {
          return false;
        }

        // Filtro por situação
        if (selectedStatus === 'vencidas') {
          if (!debt.isOverdue) return false;
        } else if (selectedStatus !== 'todas') {
          if (debt.calculatedStatus !== selectedStatus) return false;
        }

        // Filtro por data
        if (selectedDateFilter === 'vencidas') {
          if (!debt.isOverdue) return false;
        } else if (selectedDateFilter === 'este_mes') {
          const [y, m] = debt.dueDate.split('-').map(Number);
          if (y !== today.getFullYear() || m !== today.getMonth() + 1) return false;
        } else if (selectedDateFilter === 'proximos_30_dias') {
          if (debt.daysUntilDue < 0 || debt.daysUntilDue > 30) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'dueDate_asc') {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        if (sortBy === 'dueDate_desc') {
          return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
        }
        if (sortBy === 'balance_desc') {
          return b.remainingBalance - a.remainingBalance;
        }
        if (sortBy === 'balance_asc') {
          return a.remainingBalance - b.remainingBalance;
        }
        if (sortBy === 'name_asc') {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
  }, [debts, searchTerm, selectedCreditor, selectedCategory, selectedStatus, selectedDateFilter, sortBy]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCreditor('todos');
    setSelectedCategory('todas');
    setSelectedStatus('todas');
    setSelectedDateFilter('todas');
    setSortBy('dueDate_asc');
  };

  const hasActiveFilters =
    searchTerm !== '' ||
    selectedCreditor !== 'todos' ||
    selectedCategory !== 'todas' ||
    selectedStatus !== 'todas' ||
    selectedDateFilter !== 'todas';

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Minhas Dívidas
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Gerencie, filtre e acompanhe o progresso de quitação de cada pendência
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Alternador de visualização */}
          <div className="flex items-center bg-[#0b132b] p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'cards'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Visualização em Cartões"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Visualização em Tabela"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onOpenNewDebtModal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Dívida</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-[#0f1d32] border border-slate-800 rounded-xl p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Busca por texto */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome da dívida ou credor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#0b132b] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          {/* Filtro de Credor */}
          <div className="md:col-span-3">
            <select
              value={selectedCreditor}
              onChange={(e) => setSelectedCreditor(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0b132b] border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="todos">Todos os credores</option>
              {creditors.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de Categoria */}
          <div className="md:col-span-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as DebtCategory | 'todas')}
              className="w-full px-3 py-2 rounded-lg bg-[#0b132b] border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="todas">Todas as categorias</option>
              <option value="cartao_credito">Cartão de crédito</option>
              <option value="emprestimo">Empréstimo</option>
              <option value="financiamento">Financiamento</option>
              <option value="conta">Conta</option>
              <option value="outros">Outros</option>
            </select>
          </div>

          {/* Filtro de Situação */}
          <div className="md:col-span-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as DebtStatus | 'todas' | 'vencidas')}
              className="w-full px-3 py-2 rounded-lg bg-[#0b132b] border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="todas">Todas as situações</option>
              <option value="em_aberto">Em aberto</option>
              <option value="parcialmente_paga">Parcialmente paga</option>
              <option value="quitada">Quitada</option>
              <option value="vencidas">Vencidas</option>
            </select>
          </div>
        </div>

        {/* Linha secundária de filtros: Vencimento & Ordenação */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Prazo:</span>
            </span>

            <div className="flex items-center gap-1 bg-[#0b132b] p-1 rounded-md border border-slate-800">
              <button
                onClick={() => setSelectedDateFilter('todas')}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  selectedDateFilter === 'todas'
                    ? 'bg-slate-700 text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Todas as datas
              </button>
              <button
                onClick={() => setSelectedDateFilter('este_mes')}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  selectedDateFilter === 'este_mes'
                    ? 'bg-slate-700 text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Vence este mês
              </button>
              <button
                onClick={() => setSelectedDateFilter('proximos_30_dias')}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  selectedDateFilter === 'proximos_30_dias'
                    ? 'bg-slate-700 text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Próximos 30 dias
              </button>
              <button
                onClick={() => setSelectedDateFilter('vencidas')}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  selectedDateFilter === 'vencidas'
                    ? 'bg-rose-900/60 text-rose-300 font-semibold'
                    : 'text-slate-400 hover:text-rose-400'
                }`}
              >
                Vencidas
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-2.5 py-1 rounded bg-[#0b132b] border border-slate-700 text-xs text-white focus:outline-none"
              >
                <option value="dueDate_asc">Vencimento mais próximo</option>
                <option value="dueDate_desc">Vencimento mais distante</option>
                <option value="balance_desc">Maior saldo restante</option>
                <option value="balance_asc">Menor saldo restante</option>
                <option value="name_asc">Nome (A-Z)</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs text-emerald-400 hover:text-emerald-300 underline font-medium"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Contador de resultados */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>
          Exibindo <strong className="text-white">{filteredDebts.length}</strong> de{' '}
          <strong className="text-white">{debts.length}</strong> dívida(s)
        </span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            <span className="text-[11px]">Informado pelo usuário</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-[11px]">Cálculo do sistema</span>
          </span>
        </div>
      </div>

      {/* Estado Vazio: nenhuma dívida */}
      {debts.length === 0 ? (
        <div className="bg-[#0f1d32] border border-slate-800 rounded-xl p-12 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto mb-4">
            <Plus className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white">Nenhuma dívida cadastrada</h2>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Cadastre sua primeira dívida para começar a acompanhar vencimentos, amortizações e o saldo consolidado.
          </p>
          <button
            onClick={onOpenNewDebtModal}
            className="mt-6 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            Cadastrar Primeira Dívida
          </button>
        </div>
      ) : filteredDebts.length === 0 ? (
        /* Estado Vazio: filtro sem resultados */
        <div className="bg-[#0f1d32] border border-slate-800 rounded-xl p-8 text-center">
          <p className="text-sm font-semibold text-white">Nenhuma dívida encontrada com esses filtros</p>
          <p className="text-xs text-slate-400 mt-1">
            Tente remover a busca por texto ou redefinir os seletores de categoria e vencimento.
          </p>
          <button
            onClick={resetFilters}
            className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold rounded-lg border border-slate-700 transition-colors"
          >
            Limpar todos os filtros
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        /* Visualização em Cartões */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDebts.map((debt) => {
            const status = getStatusBadge(debt.calculatedStatus, debt.isOverdue);
            const categoryStyle = getCategoryColor(debt.category);

            return (
              <div
                key={debt.id}
                className="bg-[#0f1d32] border border-slate-800 hover:border-slate-700 rounded-xl p-5 flex flex-col justify-between transition-all group"
              >
                <div>
                  {/* Cabeçalho do Card */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium border ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border} mb-1.5`}
                      >
                        {getCategoryLabel(debt.category)}
                      </span>
                      <h2
                        onClick={() => onSelectDebt(debt)}
                        className="text-base font-bold text-white hover:text-emerald-400 transition-colors truncate cursor-pointer"
                      >
                        {debt.name}
                      </h2>
                      <span className="text-xs text-slate-400 block mt-0.5">
                        {debt.creditor}
                      </span>
                    </div>

                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${status.bg} ${status.text} shrink-0`}
                    >
                      {status.label}
                    </span>
                  </div>

                  {/* Informações Financeiras */}
                  <div className="mt-5 grid grid-cols-2 gap-3 pt-3 border-t border-slate-800/80">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Valor Informado</span>
                      <span className="text-sm font-bold text-white tabular-nums block mt-0.5">
                        {formatCurrency(debt.currentValue)}
                      </span>
                      <span className="text-[10px] text-slate-400 block">Usuário</span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block">Saldo Restante</span>
                      <span className="text-sm font-bold text-sky-400 tabular-nums block mt-0.5">
                        {formatCurrency(debt.remainingBalance)}
                      </span>
                      <span className="text-[10px] text-slate-400 block">Cálculo</span>
                    </div>
                  </div>

                  {/* Barra de Progresso */}
                  <div className="mt-4 space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Progresso ({debt.progressPercentage}%)</span>
                      <span className="text-emerald-400 font-medium tabular-nums">
                        Pago: {formatCurrency(debt.totalPaid)}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${debt.progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Vencimento e Parcelas */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Vencimento:</span>
                      <span
                        className={`font-semibold tabular-nums ${
                          debt.isOverdue ? 'text-rose-400 font-bold' : 'text-slate-200'
                        }`}
                      >
                        {formatDate(debt.dueDate)}
                        {debt.isOverdue && ' (Atrasada)'}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-slate-400 block text-[11px]">Parcelas:</span>
                      <span className="text-slate-300 font-medium">
                        {debt.totalInstallments
                          ? `${debt.remainingInstallments ?? '?'} de ${debt.totalInstallments} rest.`
                          : 'Sem parcelas fixas'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ações no Rodapé do Card */}
                <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditDebt(debt)}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                      title="Editar dados da dívida"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteDebt(debt)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded transition-colors"
                      title="Excluir dívida"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onSelectDebt(debt)}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors text-xs font-medium flex items-center gap-0.5"
                      title="Ver detalhes completos"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => onOpenPaymentModal(debt.id)}
                    className="px-3 py-1.5 bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Pagar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Visualização em Tabela */
        <div className="bg-[#0f1d32] border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-200">
              <thead className="bg-[#0b132b] text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Dívida / Credor</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3 text-right">Valor Atualizado</th>
                  <th className="px-4 py-3 text-right">Total Pago</th>
                  <th className="px-4 py-3 text-right">Saldo Restante</th>
                  <th className="px-4 py-3">Vencimento</th>
                  <th className="px-4 py-3">Situação</th>
                  <th className="px-4 py-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredDebts.map((debt) => {
                  const status = getStatusBadge(debt.calculatedStatus, debt.isOverdue);
                  return (
                    <tr
                      key={debt.id}
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => onSelectDebt(debt)}
                    >
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-white block group-hover:text-emerald-400 transition-colors">
                          {debt.name}
                        </span>
                        <span className="text-[11px] text-slate-400 block">{debt.creditor}</span>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="text-slate-300">{getCategoryLabel(debt.category)}</span>
                      </td>

                      <td className="px-4 py-3.5 text-right font-medium text-white tabular-nums whitespace-nowrap">
                        {formatCurrency(debt.currentValue)}
                      </td>

                      <td className="px-4 py-3.5 text-right font-medium text-emerald-400 tabular-nums whitespace-nowrap">
                        {formatCurrency(debt.totalPaid)}
                      </td>

                      <td className="px-4 py-3.5 text-right font-bold text-sky-400 tabular-nums whitespace-nowrap">
                        {formatCurrency(debt.remainingBalance)}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`font-medium tabular-nums ${
                            debt.isOverdue ? 'text-rose-400 font-bold' : 'text-slate-300'
                          }`}
                        >
                          {formatDate(debt.dueDate)}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${status.bg} ${status.text}`}>
                          {status.label}
                        </span>
                      </td>

                      <td
                        className="px-4 py-3.5 text-center whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onOpenPaymentModal(debt.id)}
                            className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors"
                            title="Registrar pagamento"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onEditDebt(debt)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteDebt(debt)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onSelectDebt(debt)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                            title="Ver detalhes"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
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
