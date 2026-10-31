import React, { useRef, useState } from 'react';
import {
  ShieldCheck,
  Download,
  Upload,
  Trash2,
  Sparkles,
  Lock,
  Database,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { storageService } from '../services/storage';

interface SettingsViewProps {
  isDemoActive: boolean;
  onLoadDemo: () => void;
  onClearAll: () => void;
  onImportSuccess: (count: number) => void;
  debtsCount: number;
  paymentsCount: number;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  isDemoActive,
  onLoadDemo,
  onClearAll,
  onImportSuccess,
  debtsCount,
  paymentsCount,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleExport = () => {
    const jsonStr = storageService.exportBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `meu_controle_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = storageService.importBackupJson(content);
        if (result.success) {
          setImportStatus(`Sucesso! ${result.count ?? 0} dívida(s) importada(s).`);
          onImportSuccess(result.count || 0);
        } else {
          setImportStatus(result.message);
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Configurações e Privacidade
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Gerenciamento do armazenamento local, backups de segurança e dados de exemplo
        </p>
      </div>

      {/* Compromisso de Segurança e Privacidade */}
      <div className="bg-[#0f1d32] border border-slate-800 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Privacidade e Soberania dos Seus Dados</h2>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              O compromisso do <strong className="text-white">Meu Controle</strong> é proteger sua privacidade de ponta a ponta:
            </p>
            <ul className="mt-3 space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>Não solicitamos senhas bancárias</strong> nem tokens de acesso.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>Não acessamos contas nem extratos bancários</strong> de forma invasiva.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>Não compartilhamos seus dados financeiros</strong> com nenhuma instituição ou terceiros.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Todos os dados são <strong>armazenados localmente</strong> no armazenamento do seu próprio navegador.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Gerenciamento de Dados de Demonstração */}
      <div className="bg-[#0f1d32] border border-slate-800 rounded-xl p-6">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          Modo de Demonstração (Dados de Exemplo)
        </h2>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          Permite explorar todas as telas do aplicativo com exemplos realistas de dívidas (Nubank, Financiamento de Carro, Empréstimo, Contas em atraso) e histórico de pagamentos.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={onLoadDemo}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Carregar Dados de Demonstração</span>
          </button>

          {isDemoActive && (
            <span className="text-xs font-semibold text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded border border-amber-800/40">
              Modo de exemplo ativo atualmente
            </span>
          )}
        </div>
      </div>

      {/* Backup e Restauração de Dados */}
      <div className="bg-[#0f1d32] border border-slate-800 rounded-xl p-6">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-sky-400" />
          Backup e Restauração
        </h2>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          Guarde uma cópia de segurança de todos os seus registros em seu computador ou transfira seus dados para outro dispositivo.
        </p>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#0b132b] border border-slate-800 rounded-lg p-4 flex flex-col justify-between space-y-3">
            <div>
              <span className="text-xs font-bold text-white block">Exportar Backup Completo</span>
              <span className="text-[11px] text-slate-400 block mt-1">
                Gera um arquivo JSON contendo suas {debtsCount} dívida(s) e {paymentsCount} pagamento(s).
              </span>
            </div>
            <button
              onClick={handleExport}
              disabled={debtsCount === 0}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg border border-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Baixar Arquivo JSON</span>
            </button>
          </div>

          <div className="bg-[#0b132b] border border-slate-800 rounded-lg p-4 flex flex-col justify-between space-y-3">
            <div>
              <span className="text-xs font-bold text-white block">Restaurar de um Backup</span>
              <span className="text-[11px] text-slate-400 block mt-1">
                Substitui os dados atuais pelos registros contidos no arquivo JSON importado.
              </span>
            </div>
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg border border-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Selecionar Arquivo JSON</span>
              </button>
            </div>
          </div>
        </div>

        {importStatus && (
          <div className="mt-4 p-3 rounded-lg bg-[#0b132b] border border-slate-700 text-xs text-slate-200">
            {importStatus}
          </div>
        )}
      </div>

      {/* Zona de Perigo: Limpar Todos os Dados */}
      <div className="bg-rose-950/20 border border-rose-900/40 rounded-xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Limpar Todos os Registros
            </h2>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Exclui permanentemente todas as dívidas e pagamentos gravados no seu navegador. Esta ação não pode ser desfeita, a menos que você tenha um arquivo de backup salvo.
            </p>
          </div>

          <button
            onClick={onClearAll}
            className="px-4 py-2 bg-rose-700 hover:bg-rose-600 active:bg-rose-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Trash2 className="w-4 h-4" />
            <span>Limpar Tudo</span>
          </button>
        </div>
      </div>

      {/* Preparação Técnica para Futura Integração Backend */}
      <div className="bg-[#0b132b] border border-slate-800/80 rounded-xl p-6">
        <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Info className="w-4 h-4 text-emerald-400" />
          Nota de Arquitetura e Engenharia de Software
        </h2>
        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
          Esta aplicação foi construída com rigorosa separação em camadas (<code className="text-slate-300">src/types</code>, <code className="text-slate-300">src/services</code>, <code className="text-slate-300">src/utils</code> e componentes reutilizáveis). O serviço de armazenamento local (<code className="text-slate-300">storageService</code>) possui uma interface compatível com padrões de Repositório, permitindo plugar uma API REST com Node.js/Express, autenticação de usuários e persistência em banco relacional (PostgreSQL via Cloud SQL) ou Firestore sem quebrar a lógica de negócio do Front-end.
        </p>
      </div>
    </div>
  );
};
