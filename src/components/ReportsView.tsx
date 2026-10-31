import React from 'react';
import {
  Download,
  PieChart,
  BarChart3,
  Calendar,
  Building,
  CheckCircle2,
  FileSpreadsheet,
  TrendingDown,
  Layers,
} from 'lucide-react';
import { ComputedDebt, DebtSummary, Payment } from '../types/finance';
import {
  formatCurrency,
  formatDate,
  getCategoryLabel,
  getStatusBadge,
} from '../utils/formatters';

interface ReportsViewProps {
  summary: DebtSummary;
  computedDebts: ComputedDebt[];
  payments: Payment[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  summary,
  computedDebts,
  payments,
}) => {
  // Análise por Credor
  const creditorMap = new Map<string, { total: number; remaining: number; count: number }>();
  computedDebts.forEach((debt) => {
    const current = creditorMap.get(debt.creditor) || { total: 0, remaining: 0, count: 0 };
    current.total += debt.currentValue;
    current.remaining += debt.remainingBalance;
    current.count += 1;
    creditorMap.set(debt.creditor, current);
  });

  const creditorsList = Array.from(creditorMap.entries())
    .map(([creditor, data]) => ({
      creditor,
      ...data,
      percentOfTotal: summary.totalCurrentValue > 0
        ? Math.round((data.total / summary.totalCurrentValue) * 100)
        : 0,
    }))
    .sort((a, b) => b.remaining - a.remaining);

  // Análise por Categoria
  const categoryMap = new Map<string, { total: number; paid: number; remaining: number; count: number }>();
  computedDebts.forEach((debt) => {
    const current = categoryMap.get(debt.category) || { total: 0, paid: 0, remaining: 0, count: 0 };
    current.total += debt.currentValue;
    current.paid += debt.totalPaid;
    current.remaining += debt.remainingBalance;
    current.count += 1;
    categoryMap.set(debt.category, current);
  });

  // Função para exportar CSV formatado
  const handleExportCSV = () => {
    const headers = [
      'Nome da Dívida',
      'Credor/Instituição',
      'Categoria',
      'Valor Original (R$)',
      'Valor Atualizado (R$)',
      'Total Pago (R$)',
      'Saldo Restante (R$)',
      'Taxa de Juros',
      'Data de Vencimento',
      'Parcelas',
      'Situação',
    ];

    const rows = computedDebts.map((d) => [
      `"${d.name.replace(/"/g, '""')}"`,
      `"${d.creditor.replace(/"/g, '""')}"`,
      `"${getCategoryLabel(d.category)}"`,
      d.originalValue.toFixed(2),
      d.currentValue.toFixed(2),
      d.totalPaid.toFixed(2),
      d.remainingBalance.toFixed(2),
      `"${d.interestRate || 'Não informado'}"`,
      d.dueDate,
      d.totalInstallments ? `${d.totalInstallments} parcelas` : 'Sem parcelas',
      d.calculatedStatus,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `meu_controle_relatorio_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Relatórios e Gráficos
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Visualização analítica da composição e quitação do seu passivo financeiro
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={computedDebts.length === 0}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2 cursor-pointer shrink-0"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Exportar Planilha (CSV)</span>
        </button>
      </div>

      {/* Visão de Quitação Geral */}
      <div className="bg-[#0f1d32] border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-emerald-400" />
              Taxa Global de Quitação
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Cálculo estrito: proporção dos valores amortizados em relação ao total cadastrado
            </p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-extrabold text-emerald-400 tabular-nums">
              {summary.overallProgressPercentage}%
            </span>
            <span className="text-xs text-slate-400 block">do montante total liquidado</span>
          </div>
        </div>

        <div className="mt-6">
          <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${summary.overallProgressPercentage}%` }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 text-xs">
            <div className="bg-[#0b132b] p-3.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block">Total Informado Inicial</span>
              <strong className="text-base font-bold text-white tabular-nums block mt-1">
                {formatCurrency(summary.totalCurrentValue)}
              </strong>
            </div>

            <div className="bg-[#0b132b] p-3.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block">Total Efetivamente Amortizado</span>
              <strong className="text-base font-bold text-emerald-400 tabular-nums block mt-1">
                {formatCurrency(summary.totalPaidAmount)}
              </strong>
            </div>

            <div className="bg-[#0b132b] p-3.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block">Saldo Restante para Zerar</span>
              <strong className="text-base font-bold text-sky-400 tabular-nums block mt-1">
                {formatCurrency(summary.totalRemainingBalance)}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Maiores Credores & Distribuição por Categoria */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Maiores Credores */}
        <div className="bg-[#0f1d32] border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-sky-400" />
                Concentração por Credor
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Instituições onde você possui saldo pendente</p>
            </div>
            <span className="text-xs text-slate-400">{creditorsList.length} credor(es)</span>
          </div>

          <div className="mt-5 space-y-4">
            {creditorsList.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                Nenhuma dívida cadastrada para exibição de credores.
              </div>
            ) : (
              creditorsList.map((c) => (
                <div key={c.creditor} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-white">
                      {c.creditor} ({c.count} dívida{c.count > 1 ? 's' : ''})
                    </span>
                    <span className="text-sky-400 font-bold tabular-nums">
                      {formatCurrency(c.remaining)} restante
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${summary.totalRemainingBalance > 0 ? (c.remaining / summary.totalRemainingBalance) * 100 : 0}%`,
                      }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Total informado: {formatCurrency(c.total)}</span>
                    <span>
                      {summary.totalRemainingBalance > 0
                        ? `${Math.round((c.remaining / summary.totalRemainingBalance) * 100)}% do saldo total`
                        : '0%'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Análise por Categoria */}
        <div className="bg-[#0f1d32] border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                Quitação por Categoria
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Percentual amortizado em cada tipo de despesa</p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {Array.from(categoryMap.entries()).length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                Cadastre dívidas para ver o relatório por categoria.
              </div>
            ) : (
              Array.from(categoryMap.entries()).map(([catKey, data]) => {
                const categoryProgress = data.total > 0
                  ? Math.min(100, Math.round((data.paid / data.total) * 100))
                  : 0;

                return (
                  <div key={catKey} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-white">
                        {getCategoryLabel(catKey as any)}
                      </span>
                      <span className="text-emerald-400 font-bold tabular-nums">
                        {categoryProgress}% pago
                      </span>
                    </div>

                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${categoryProgress}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Total pago: {formatCurrency(data.paid)}</span>
                      <span>Restante: {formatCurrency(data.remaining)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Resumo da Tabela Consolidada para Auditoria */}
      <div className="bg-[#0f1d32] border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white">Quadro Geral de Controle</h2>
            <p className="text-xs text-slate-400 mt-0.5">Visão consolidada de todas as pendências</p>
          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0b132b] text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-2.5">Dívida</th>
                <th className="px-4 py-2.5">Credor</th>
                <th className="px-4 py-2.5 text-right">Valor Atual</th>
                <th className="px-4 py-2.5 text-right">Amortizado</th>
                <th className="px-4 py-2.5 text-right">Saldo Devedor</th>
                <th className="px-4 py-2.5">Taxa de Juros</th>
                <th className="px-4 py-2.5">Vencimento</th>
                <th className="px-4 py-2.5">Situação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {computedDebts.map((d) => {
                const status = getStatusBadge(d.calculatedStatus, d.isOverdue);
                return (
                  <tr key={d.id} className="hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-semibold text-white">{d.name}</td>
                    <td className="px-4 py-3 text-slate-300">{d.creditor}</td>
                    <td className="px-4 py-3 text-right font-medium text-white tabular-nums">
                      {formatCurrency(d.currentValue)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-emerald-400 tabular-nums">
                      {formatCurrency(d.totalPaid)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-sky-400 tabular-nums">
                      {formatCurrency(d.remainingBalance)}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {d.interestRate || 'Não informado'}
                    </td>
                    <td className="px-4 py-3 tabular-nums">{formatDate(d.dueDate)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${status.bg} ${status.text}`}>
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
