import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Lock,
  ArrowRight,
  Sparkles,
  Layers,
  Database,
} from 'lucide-react';
import { ActiveTab, ComputedDebt, DebtSummary } from '../types/finance';
import { formatCurrency } from '../utils/formatters';

interface HomeIntroProps {
  onNavigate: (tab: ActiveTab) => void;
  onOpenNewDebtModal: () => void;
  onLoadDemoData: () => void;
  debtsCount: number;
  summary: DebtSummary;
  computedDebts: ComputedDebt[];
}

export const HomeIntro: React.FC<HomeIntroProps> = ({
  onNavigate,
  onOpenNewDebtModal,
  onLoadDemoData,
  debtsCount,
  summary,
}) => {
  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#112240] to-[#0d1b2a] border border-slate-800 p-8 sm:p-12">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 text-xs font-medium mb-6">
            <ShieldCheck className="w-4 h-4" />
            <span>Privacidade total &bull; Sem conexão bancária nem senhas</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Assuma o comando das suas dívidas com total clareza.
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            O <strong className="text-white font-semibold">Meu Controle</strong> foi feito para você organizar pendências, acompanhar vencimentos e registrar pagamentos de forma simples, visual e 100% baseada nos seus dados reais.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <button
              onClick={onOpenNewDebtModal}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold rounded-lg shadow-lg shadow-emerald-950/40 transition-all flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
            >
              <span>Cadastrar Dívida</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {debtsCount > 0 ? (
              <button
                onClick={() => onNavigate('dashboard')}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-100 font-semibold rounded-lg border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Ver Meu Dashboard</span>
              </button>
            ) : (
              <button
                onClick={onLoadDemoData}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 font-semibold rounded-lg border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Testar com Dados de Exemplo</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Snapshot se já houver dados cadastrados */}
      {debtsCount > 0 && (
        <section className="bg-[#0f1d32] border border-slate-800 rounded-xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <h2 className="text-xl font-bold text-white">Resumo Atual das Suas Finanças</h2>
              <p className="text-xs text-slate-400 mt-1">
                Informações consolidadas com base nas {debtsCount} dívida(s) cadastradas por você
              </p>
            </div>
            <button
              onClick={() => onNavigate('dashboard')}
              className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              <span>Acessar Painel Detalhado</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="bg-[#0b132b] p-4 rounded-lg border border-slate-800/80">
              <span className="text-xs text-slate-400 block">Total em Dívidas</span>
              <span className="text-xl font-bold text-white mt-1 block tabular-nums">
                {formatCurrency(summary.totalCurrentValue)}
              </span>
              <span className="text-xs text-slate-500 mt-1 block">Valor atualizado informado</span>
            </div>

            <div className="bg-[#0b132b] p-4 rounded-lg border border-slate-800/80">
              <span className="text-xs text-slate-400 block">Total já Pago</span>
              <span className="text-xl font-bold text-emerald-400 mt-1 block tabular-nums">
                {formatCurrency(summary.totalPaidAmount)}
              </span>
              <span className="text-xs text-emerald-500/80 mt-1 block">
                {summary.overallProgressPercentage}% do total liquidado
              </span>
            </div>

            <div className="bg-[#0b132b] p-4 rounded-lg border border-slate-800/80">
              <span className="text-xs text-slate-400 block">Saldo Restante</span>
              <span className="text-xl font-bold text-sky-400 mt-1 block tabular-nums">
                {formatCurrency(summary.totalRemainingBalance)}
              </span>
              <span className="text-xs text-slate-500 mt-1 block">Cálculo exato de amortização</span>
            </div>

            <div className="bg-[#0b132b] p-4 rounded-lg border border-slate-800/80">
              <span className="text-xs text-slate-400 block">Status das Dívidas</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xl font-bold text-white tabular-nums">
                  {summary.openDebtsCount + summary.partiallyPaidDebtsCount} ativas
                </span>
                {summary.overdueDebtsCount > 0 && (
                  <span className="text-xs font-semibold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/40">
                    {summary.overdueDebtsCount} vencida(s)
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-500 mt-1 block">
                {summary.paidDebtsCount} dívida(s) quitada(s)
              </span>
            </div>
          </div>
        </section>
      )}

      {/* 4 Pilares de Funcionamento & Regras Obrigatórias */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Como o Meu Controle funciona</h2>
          <p className="text-sm text-slate-400 mt-1">
            Transparência e fidelidade total: sem suposições arbitrárias, sem juros inventados.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#0d1b2a] border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">1. Cadastro Real</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Você cadastra suas dívidas com valores originais, credores, parcelas e vencimentos. Se não souber a taxa de juros, ela é rotulada como &ldquo;Não informado&rdquo;.
            </p>
          </div>

          <div className="bg-[#0d1b2a] border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-4">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">2. Alertas de Vencimento</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Visualize claramente quais contas vencem este mês e quais estão atrasadas, com contagem regressiva diária para você priorizar pagamentos.
            </p>
          </div>

          <div className="bg-[#0d1b2a] border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">3. Amortização Real</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Cada pagamento registrado abate diretamente o saldo restante. Todo cálculo é transparente e identificável como &ldquo;Cálculo do sistema&rdquo;.
            </p>
          </div>

          <div className="bg-[#0d1b2a] border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">4. Privacidade Absoluta</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Não pedimos senhas bancárias, não fazemos raspagem de conta e não vendemos dados. Tudo fica guardado no seu próprio navegador.
            </p>
          </div>
        </div>
      </section>

      {/* Compromisso de Segurança & Preparação Técnica */}
      <section className="bg-[#0a1424] border border-slate-800/80 rounded-xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
              <Database className="w-4 h-4" />
              <span>Arquitetura Pronta para Evolução</span>
            </div>
            <h3 className="text-lg font-bold text-white">
              Seus dados, seu controle: exporte ou restaure quando quiser
            </h3>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              O Meu Controle já inclui backup completo em arquivo JSON, exportação de relatórios para planilhas e estrutura modular em TypeScript preparada para conexão futura com bancos de dados relacionais e APIs de nuvem.
            </p>
          </div>

          <div className="flex gap-3 shrink-0">
            <button
              onClick={() => onNavigate('configuracoes')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors cursor-pointer"
            >
              Ver Configurações &amp; Backup
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
