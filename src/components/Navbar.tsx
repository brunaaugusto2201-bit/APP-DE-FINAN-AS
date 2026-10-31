import React, { useState } from 'react';
import { Plus, Menu, X, ShieldCheck } from 'lucide-react';
import { ActiveTab } from '../types/finance';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenNewDebtModal: () => void;
  isDemoActive: boolean;
  onClearDemo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenNewDebtModal,
  isDemoActive,
  onClearDemo,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks: { id: ActiveTab; label: string }[] = [
    { id: 'inicio', label: 'Início' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'dividas', label: 'Dívidas' },
    { id: 'pagamentos', label: 'Pagamentos' },
    { id: 'relatorios', label: 'Relatórios' },
    { id: 'configuracoes', label: 'Configurações' },
  ];

  const handleTabClick = (tab: ActiveTab) => {
    onTabChange(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0d1b2a]/95 backdrop-blur-md border-b border-slate-800">
      {/* Aviso de Dados de Demonstração quando ativo */}
      {isDemoActive && (
        <div className="bg-amber-950/70 border-b border-amber-800/40 px-4 py-1.5 text-xs text-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-amber-400">Modo de Exemplo:</span>
            <span>Exibindo dados ilustrativos para demonstração das funcionalidades.</span>
          </div>
          <button
            onClick={onClearDemo}
            className="text-xs text-amber-300 hover:text-white underline font-medium ml-4 shrink-0 transition-colors"
          >
            Limpar e começar do zero
          </button>
        </div>
      )}

      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand title, one line */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => handleTabClick('inicio')}
            className="text-left group flex items-center gap-2 focus:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg">
              MC
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors whitespace-nowrap">
                Meu Controle
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: 4–6 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navLinks.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleTabClick(link.id)}
                className={`py-1 text-sm font-medium transition-colors whitespace-nowrap shrink-0 relative ${
                  isActive
                    ? 'text-emerald-400 font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-[-18px] left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action in vibrant green */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenNewDebtModal}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-lg shadow-sm hover:shadow-emerald-900/30 transition-all whitespace-nowrap shrink-0 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Dívida</span>
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-300 hover:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-700"
            aria-label="Abrir menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#0d1b2a] px-4 pt-3 pb-5 space-y-1">
          {navLinks.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleTabClick(link.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-950/60 text-emerald-400 font-semibold border border-emerald-800/40'
                    : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                {link.label}
              </button>
            );
          })}
          <div className="pt-3 border-t border-slate-800/70 flex items-center justify-between text-xs text-slate-400 px-3">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Dados 100% no seu navegador
            </span>
          </div>
        </div>
      )}
    </header>
  );
};
