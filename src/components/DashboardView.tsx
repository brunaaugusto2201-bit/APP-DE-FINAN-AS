import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Plus,
  CreditCard,
  Building,
  TrendingDown,
  Info,
  CalendarClock,
} from 'lucide-react';
import { ComputedDebt, DebtSummary, Payment, ActiveTab } from '../types/finance';
import { formatCurrency, formatDate, getCategoryLabel, getStatusBadge } from '../utils/formatters';

interface DashboardViewProps {
  summary: DebtSummary;
  computedDebts: ComputedDebt[];
  payments: Payment[];
  onOpenNewDebtModal: () => void;
  onOpenPaymentModal: (debtId?: string) => void;
  onNavigate: (tab: ActiveTab) => void;
  onSelectDebt: (debt: ComputedDebt) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  summary,
  computedDebts,
  payments,
  onOpenNewDebtModal,
  onOpenPaymentModal,
  onNavigate,
  onSelectDebt,
}) => {
  // Próximos vencimentos: dívidas não quitadas, ordenadas por vencimento (mais antigas / mais próximas primeiro)
  const pendingDebts = computedDebts
    .filter((d) => d.calculatedStatus !== 'quitada')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const overdueDebts = pendingDebts.filter((d) => d.isOverdue);
  const upcomingDebts = pendingDebts.slice(0, 5);

  // Agrupamento por categoria para gráficos
  const categories: { key: string; label: string; count: number; totalValue: number; remaining: number }[] = [
    { key: 'cartao_credito', label: 'Cartão de crédito', count: 0, totalValue: 0, remaining: 0 },
    { key: 'emprestimo', label: 'Empréstimo', count: 0, totalValue: 0, remaining: 0 },
    { key: 'financiamento', label: 'Financiamento', count: 0, totalValue: 0, remaining: 0 },
    { key: 'conta', label: 'Conta', count: 0, totalValue: 0, remaining: 0 },
    { key: 'outros', label: 'Outros', count: 0, totalValue: 0, remaining: 0 },
  ];

  computedDebts.forEach((debt) => {
    const cat = categories.find((c) => c.key === debt.category);
    if (cat) {
      cat.count += 1;
      cat.totalValue += debt.currentValue;
      cat.remaining += debt.remainingBalance;
    }
  });

  const activeCategories = categories.filter((c) => c.count > 0);

  // Pagamentos recentes ordenados por data decrescente
  const recentPayments = [...payments]
    .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header do Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Painel Financeiro
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Valores calculados com base estrita nos dados e pagamentos informados por você</span>
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onOpenPaymentModal()}
            disabled={computedDebts.length === 0}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 text-sm font-semibold rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>Registrar Pagamento</span>
          </button>
          <button
            onClick={onOpenNewDebtModal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Dívida</span>
          </button>
        </div>
      </div>

      {/* Alerta de Dívidas Vencidas se houver */}
      {overdueDebts.length > 0 && (
        <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-900/50 flex items-center justify-center text-rose-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-rose-200">
                Atenção: {overdueDebts.length} dívida(s) com vencimento expirado
              </h2>
              <p className="text-xs text-rose-300/80 mt-0.5">
                Total pendente em atraso:{' '}
                <strong className="text-rose-100 tabular-nums">
                  {formatCurrency(overdueDebts.reduce((sum, d) => sum + d.remainingBalance, 0))}
                </strong>
                . Priorize a regularização para evitar encargos adicionais.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('dividas')}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg transition-colors shrink-0"
          >
            Ver Dívidas Vencidas
          </button>
        </div>
      )}

      {/* Cards de Métricas Principais (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total em Dívidas */}
        <div className="bg-[#0f1d32] border border-slate-800 rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Cadastrado</span>
            <Building className="w-4 h-4 text-slate-500" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white tabular-nums tracking-tight">
              {formatCurrency(summary.totalCurrentValue)}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            <span>{summary.totalDebtsCount} dívida(s) no total</span>
            <span className="text-[11px] text-slate-400">Informado</span>
          </div>
        </div>

        {/* Card 2: Total já Pago */}
        <div className="bg-[#0f1d32] border border-slate-800 rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-medium">
            <span>Total já Pago</span>
            <TrendingDown className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-emerald-400 tabular-nums tracking-tight">
              {formatCurrency(summary.totalPaidAmount)}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            <span className="text-emerald-400 font-medium">
              {summary.overallProgressPercentage}% amortizado
            </span>
            <span className="text-[11px] text-slate-400">Cálculo do sistema</span>
          </div>
        </div>

        {/* Card 3: Saldo Restante Consolidado */}
        <div className="bg-[#0f1d32] border border-slate-800 rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-sky-400 text-xs font-medium">
            <span>Saldo Restante</span>
            <CreditCard className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-sky-400 tabular-nums tracking-tight">
              {formatCurrency(summary.totalRemainingBalance)}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            <span>Pendente de pagamento</span>
            <span className="text-[11px] text-slate-400">Cálculo do sistema</span>
          </div>
        </div>

        {/* Card 4: Dívidas em Aberto & Vencidas */}
        <div className="bg-[#0f1d32] border border-slate-800 rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Situação de Pendências</span>
            <CalendarClock className="w-4 h-4 text-slate-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tabular-nums tracking-tight">
              {summary.openDebtsCount + summary.partiallyPaidDebtsCount}
            </span>
            <span className="text-xs text-slate-400">em aberto</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
            <span className="text-rose-400 font-medium tabular-nums">
              {summary.overdueDebtsCount} vencida(s)
            </span>
            <span className="text-emerald-400 font-medium tabular-nums">
              {summary.paidDebtsCount} quitada(s)
            </span>
          </div>
        </div>
      </div>

      {/* Barra de Progresso Global de Quitação */}
      <div className="bg-[#0f1d32] border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-base font-bold text-white">Progresso Geral de Quitação</h2>
            <p className="text-xs text-slate-400">
              Percentual liquidado em relação ao valor total de dívidas cadastradas
            </p>
          </div>
          <div className="text-right">
            <span className="text-xl font-bold text-emerald-400 tabular-nums">
              {summary.overallProgressPercentage}%
            </span>
            <span className="text-xs text-slate-400 block">liquidado</span>
          </div>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full h-3.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${summary.overallProgressPercentage}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800/80">
          <div>
            <span className="text-slate-500">Amortizado: </span>
            <strong className="text-emerald-400 tabular-nums">{formatCurrency(summary.totalPaidAmount)}</strong>
          </div>
          <div>
            <span className="text-slate-500">Restante para zerar: </span>
            <strong className="text-sky-400 tabular-nums">{formatCurrency(summary.totalRemainingBalance)}</strong>
          </div>
        </div>
      </div>

      {/* Seção Split: Próximos Vencimentos & Distribuição por Categoria */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Próximos Vencimentos */}
        <div className="bg-[#0f1d32] border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white">Próximos Vencimentos</h2>
                <p className="text-xs text-slate-400 mt-0.5">Dívidas não quitadas organizadas por data</p>
              </div>
              <button
                onClick={() => onNavigate('dividas')}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
              >
                <span>Ver todas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {upcomingDebts.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Nenhuma dívida pendente de pagamento no momento!
                </div>
              ) : (
                upcomingDebts.map((debt) => {
                  const status = getStatusBadge(debt.calculatedStatus, debt.isOverdue);
                  return (
                    <div
                      key={debt.id}
                      onClick={() => onSelectDebt(debt)}
                      className="group bg-[#0b132b] hover:bg-[#112240] border border-slate-800 hover:border-slate-700 rounded-lg p-3.5 flex items-center justify-between gap-3 cursor-pointer transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors truncate">
                            {debt.name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                          <span>{debt.creditor}</span>
                          <span>&bull;</span>
                          <span>Vencimento: {formatDate(debt.dueDate)}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-sm font-bold text-white block tabular-nums">
                          {formatCurrency(debt.remainingBalance)}
                        </span>
                        <span className={`text-[11px] font-medium ${status.text}`}>
                          {debt.isOverdue
                            ? `Vencida há ${Math.abs(debt.daysUntilDue)} d`
                            : debt.daysUntilDue === 0
                            ? 'Vence hoje!'
                            : `Em ${debt.daysUntilDue} dias`}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {upcomingDebts.length > 0 && (
            <div className="pt-4 mt-4 border-t border-slate-800 text-center">
              <button
                onClick={() => onOpenPaymentModal()}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
              >
                + Registrar pagamento para uma dessas contas
              </button>
            </div>
          )}
        </div>

        {/* Gráfico / Distribuição por Categoria */}
        <div className="bg-[#0f1d32] border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white">Dívidas por Categoria</h2>
                <p className="text-xs text-slate-400 mt-0.5">Distribuição do valor atualizado informado</p>
              </div>
              <span className="text-xs text-slate-400">
                {activeCategories.length} categorias ativas
              </span>
            </div>

            <div className="mt-5 space-y-4">
              {activeCategories.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Cadastre suas primeiras dívidas para visualizar a distribuição.
                </div>
              ) : (
                activeCategories.map((cat) => {
                  const percentage = summary.totalCurrentValue > 0
                    ? Math.round((cat.totalValue / summary.totalCurrentValue) * 100)
                    : 0;

                  return (
                    <div key={cat.key} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-200">
                          {cat.label} ({cat.count})
                        </span>
                        <div className="text-right">
                          <span className="text-white font-bold tabular-nums">
                            {formatCurrency(cat.totalValue)}
                          </span>
                          <span className="text-slate-400 text-[11px] ml-1.5">
                            ({percentage}%)
                          </span>
                        </div>
                      </div>

                      {/* Bar */}
                      <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>

                      <div className="flex justify-between text-[11px] text-slate-500">
                        <span>Saldo pendente nesta categoria:</span>
                        <span className="tabular-nums font-medium text-slate-400">
                          {formatCurrency(cat.remaining)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
            <span>Total consolidado:</span>
            <strong className="text-white tabular-nums">{formatCurrency(summary.totalCurrentValue)}</strong>
          </div>
        </div>
      </div>

      {/* Histórico Recente de Pagamentos */}
      <div className="bg-[#0f1d32] border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white">Últimos Pagamentos Registrados</h2>
            <p className="text-xs text-slate-400 mt-0.5">Histórico recente de amortizações confirmadas</p>
          </div>
          <button
            onClick={() => onNavigate('pagamentos')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
          >
            <span>Ver histórico completo ({payments.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentPayments.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            Nenhum pagamento registrado ainda. Quando você quitar ou amortizar parcelas, elas aparecerão aqui.
          </div>
        ) : (
          <div className="mt-4 divide-y divide-slate-800/80">
            {recentPayments.map((payment) => {
              const debt = computedDebts.find((d) => d.id === payment.debtId);
              return (
                <div
                  key={payment.id}
                  className="py-3 flex items-center justify-between gap-4 text-xs"
                >
                  <div className="min-w-0">
                    <span className="font-semibold text-white block truncate">
                      {debt ? debt.name : 'Dívida arquivada'}
                    </span>
                    <span className="text-slate-400 block mt-0.5">
                      Pago em {formatDate(payment.paymentDate)} &bull; {payment.paymentMethod || 'Não informado'}
                      {payment.installmentNumber ? ` (Parcela ${payment.installmentNumber})` : ''}
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold text-emerald-400 block tabular-nums">
                      + {formatCurrency(payment.amount)}
                    </span>
                    <span className="text-[11px] text-slate-500">Amortizado</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
