import { useState, useMemo, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomeIntro } from './components/HomeIntro';
import { DashboardView } from './components/DashboardView';
import { DebtListView } from './components/DebtListView';
import { DebtModal } from './components/DebtModal';
import { DebtDetailModal } from './components/DebtDetailModal';
import { PaymentModal } from './components/PaymentModal';
import { PaymentHistoryView } from './components/PaymentHistoryView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { ConfirmModal } from './components/ConfirmModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { storageService, DEMO_DEBTS, DEMO_PAYMENTS } from './services/storage';
import { computeDebt, calculateSummary } from './utils/formatters';
import { Debt, Payment, ComputedDebt, ActiveTab } from './types/finance';
import { ShieldCheck, Lock } from 'lucide-react';

export default function App() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isDemoActive, setIsDemoActive] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Modals state
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [debtToEdit, setDebtToEdit] = useState<Debt | null>(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [preselectedDebtId, setPreselectedDebtId] = useState<string | null>(null);
  const [paymentToEdit, setPaymentToEdit] = useState<Payment | null>(null);

  const [selectedDebtForDetail, setSelectedDebtForDetail] = useState<ComputedDebt | null>(null);

  // Confirm Modal state
  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Toasts state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    const newToast: ToastMessage = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      text,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Carregar dados na montagem
  useEffect(() => {
    const savedDebts = storageService.getDebts();
    const savedPayments = storageService.getPayments();
    const demoFlag = storageService.isDemoLoaded();

    if (savedDebts.length > 0) {
      setDebts(savedDebts);
      setPayments(savedPayments);
      setIsDemoActive(demoFlag);
    } else {
      // Primeira inicialização: carregar dados de demonstração identificados para experiência imediata
      const { debts: initialDebts, payments: initialPayments } = storageService.loadDemoData();
      setDebts(initialDebts);
      setPayments(initialPayments);
      setIsDemoActive(true);
    }
  }, []);

  // Recalcular dívidas derivadas e consolidado
  const computedDebts: ComputedDebt[] = useMemo(() => {
    return debts.map((d) => computeDebt(d, payments));
  }, [debts, payments]);

  const summary = useMemo(() => {
    return calculateSummary(computedDebts);
  }, [computedDebts]);

  // Manter selectedDebtForDetail sincronizado caso os dados da dívida mudem
  useEffect(() => {
    if (selectedDebtForDetail) {
      const updated = computedDebts.find((d) => d.id === selectedDebtForDetail.id);
      if (updated) {
        setSelectedDebtForDetail(updated);
      } else {
        setSelectedDebtForDetail(null);
      }
    }
  }, [computedDebts, selectedDebtForDetail]);

  // Salvar Dívida (Criar ou Editar)
  const handleSaveDebt = (
    debtData: Omit<Debt, 'id' | 'createdAt' | 'updatedAt'>,
    editingId?: string
  ) => {
    const now = new Date().toISOString();
    let updatedDebts: Debt[];

    if (editingId) {
      updatedDebts = debts.map((d) =>
        d.id === editingId
          ? {
              ...d,
              ...debtData,
              updatedAt: now,
            }
          : d
      );
      addToast('success', 'Dívida atualizada com sucesso!');
    } else {
      const newDebt: Debt = {
        id: 'debt-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
        ...debtData,
        createdAt: now,
        updatedAt: now,
      };
      updatedDebts = [newDebt, ...debts];
      addToast('success', 'Dívida cadastrada com sucesso!');
    }

    setDebts(updatedDebts);
    storageService.saveDebts(updatedDebts);
    setIsDebtModalOpen(false);
    setDebtToEdit(null);
  };

  // Solicitar exclusão de Dívida
  const handleRequestDeleteDebt = (debt: ComputedDebt) => {
    setConfirmModalState({
      isOpen: true,
      title: 'Excluir Dívida',
      message: `Tem certeza que deseja excluir "${debt.name}"? Todos os pagamentos vinculados a esta dívida também serão removidos. Esta ação não poderá ser desfeita.`,
      confirmText: 'Excluir Dívida',
      cancelText: 'Cancelar',
      isDestructive: true,
      onConfirm: () => {
        const updatedDebts = debts.filter((d) => d.id !== debt.id);
        const updatedPayments = payments.filter((p) => p.debtId !== debt.id);
        setDebts(updatedDebts);
        setPayments(updatedPayments);
        storageService.saveDebts(updatedDebts);
        storageService.savePayments(updatedPayments);
        if (selectedDebtForDetail?.id === debt.id) {
          setSelectedDebtForDetail(null);
        }
        setConfirmModalState((prev) => ({ ...prev, isOpen: false }));
        addToast('info', `Dívida "${debt.name}" excluída.`);
      },
    });
  };

  // Salvar Pagamento (Criar ou Editar)
  const handleSavePayment = (
    paymentData: Omit<Payment, 'id' | 'createdAt'>,
    editingPaymentId?: string
  ) => {
    const now = new Date().toISOString();
    let updatedPayments: Payment[];

    if (editingPaymentId) {
      updatedPayments = payments.map((p) =>
        p.id === editingPaymentId
          ? {
              ...p,
              ...paymentData,
            }
          : p
      );
      addToast('success', 'Pagamento atualizado com sucesso!');
    } else {
      const newPayment: Payment = {
        id: 'pay-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
        ...paymentData,
        createdAt: now,
      };
      updatedPayments = [newPayment, ...payments];
      addToast('success', 'Pagamento registrado! Saldo restante recalculado.');
    }

    setPayments(updatedPayments);
    storageService.savePayments(updatedPayments);
    setIsPaymentModalOpen(false);
    setPaymentToEdit(null);
  };

  // Solicitar exclusão/estorno de Pagamento
  const handleRequestDeletePayment = (payment: Payment) => {
    const debt = debts.find((d) => d.id === payment.debtId);
    setConfirmModalState({
      isOpen: true,
      title: 'Estornar / Excluir Pagamento',
      message: `Tem certeza que deseja remover o pagamento de R$ ${payment.amount.toFixed(
        2
      )} realizado em ${payment.paymentDate}? O saldo restante da dívida ${
        debt ? `"${debt.name}"` : ''
      } será restaurado proporcionalmente.`,
      confirmText: 'Excluir Pagamento',
      cancelText: 'Cancelar',
      isDestructive: true,
      onConfirm: () => {
        const updatedPayments = payments.filter((p) => p.id !== payment.id);
        setPayments(updatedPayments);
        storageService.savePayments(updatedPayments);
        setConfirmModalState((prev) => ({ ...prev, isOpen: false }));
        addToast('info', 'Pagamento removido. Saldo da dívida restaurado.');
      },
    });
  };

  // Carregar dados de demonstração
  const handleLoadDemo = () => {
    const { debts: demoDebts, payments: demoPayments } = storageService.loadDemoData();
    setDebts(demoDebts);
    setPayments(demoPayments);
    setIsDemoActive(true);
    addToast('info', 'Dados de demonstração carregados com sucesso!');
  };

  // Limpar todos os dados
  const handleClearAll = () => {
    setConfirmModalState({
      isOpen: true,
      title: 'Limpar Todos os Registros',
      message:
        'Atenção: todos os dados de dívidas e pagamentos serão apagados do seu navegador. Se quiser mantê-los, faça um backup antes.',
      confirmText: 'Limpar Tudo',
      cancelText: 'Voltar',
      isDestructive: true,
      onConfirm: () => {
        storageService.clearAllData();
        setDebts([]);
        setPayments([]);
        setIsDemoActive(false);
        setSelectedDebtForDetail(null);
        setConfirmModalState((prev) => ({ ...prev, isOpen: false }));
        addToast('info', 'Todos os registros foram apagados. Pronto para novos dados.');
      },
    });
  };

  // Restauração de Backup bem-sucedida
  const handleImportSuccess = (count: number) => {
    setDebts(storageService.getDebts());
    setPayments(storageService.getPayments());
    setIsDemoActive(false);
    addToast('success', `${count} dívida(s) importada(s) do backup.`);
  };

  return (
    <div className="min-h-screen bg-[#0b132b] text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onOpenNewDebtModal={() => {
          setDebtToEdit(null);
          setIsDebtModalOpen(true);
        }}
        isDemoActive={isDemoActive}
        onClearDemo={handleClearAll}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'inicio' && (
          <HomeIntro
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenNewDebtModal={() => {
              setDebtToEdit(null);
              setIsDebtModalOpen(true);
            }}
            onLoadDemoData={handleLoadDemo}
            debtsCount={debts.length}
            summary={summary}
            computedDebts={computedDebts}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardView
            summary={summary}
            computedDebts={computedDebts}
            payments={payments}
            onOpenNewDebtModal={() => {
              setDebtToEdit(null);
              setIsDebtModalOpen(true);
            }}
            onOpenPaymentModal={(debtId) => {
              setPaymentToEdit(null);
              setPreselectedDebtId(debtId || null);
              setIsPaymentModalOpen(true);
            }}
            onNavigate={(tab) => setActiveTab(tab)}
            onSelectDebt={(debt) => setSelectedDebtForDetail(debt)}
          />
        )}

        {activeTab === 'dividas' && (
          <DebtListView
            debts={computedDebts}
            onOpenNewDebtModal={() => {
              setDebtToEdit(null);
              setIsDebtModalOpen(true);
            }}
            onEditDebt={(debt) => {
              setDebtToEdit(debt);
              setIsDebtModalOpen(true);
            }}
            onDeleteDebt={handleRequestDeleteDebt}
            onOpenPaymentModal={(debtId) => {
              setPaymentToEdit(null);
              setPreselectedDebtId(debtId);
              setIsPaymentModalOpen(true);
            }}
            onSelectDebt={(debt) => setSelectedDebtForDetail(debt)}
          />
        )}

        {activeTab === 'pagamentos' && (
          <PaymentHistoryView
            payments={payments}
            debts={computedDebts}
            onOpenPaymentModal={(debtId) => {
              setPaymentToEdit(null);
              setPreselectedDebtId(debtId || null);
              setIsPaymentModalOpen(true);
            }}
            onEditPayment={(payment) => {
              setPaymentToEdit(payment);
              setIsPaymentModalOpen(true);
            }}
            onDeletePayment={handleRequestDeletePayment}
            onSelectDebt={(debt) => setSelectedDebtForDetail(debt)}
          />
        )}

        {activeTab === 'relatorios' && (
          <ReportsView
            summary={summary}
            computedDebts={computedDebts}
            payments={payments}
          />
        )}

        {activeTab === 'configuracoes' && (
          <SettingsView
            isDemoActive={isDemoActive}
            onLoadDemo={handleLoadDemo}
            onClearAll={handleClearAll}
            onImportSuccess={handleImportSuccess}
            debtsCount={debts.length}
            paymentsCount={payments.length}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0d1b2a] py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">Meu Controle</span>
            <span>&bull;</span>
            <span>Gerenciador de Dívidas Pessoais</span>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Dados 100% seguros no seu navegador &bull; Sem acesso bancário</span>
          </div>
        </div>
      </footer>

      {/* Modais da Aplicação */}
      <DebtModal
        isOpen={isDebtModalOpen}
        onClose={() => {
          setIsDebtModalOpen(false);
          setDebtToEdit(null);
        }}
        onSave={handleSaveDebt}
        debtToEdit={debtToEdit}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setPaymentToEdit(null);
          setPreselectedDebtId(null);
        }}
        onSavePayment={handleSavePayment}
        debts={computedDebts}
        preselectedDebtId={preselectedDebtId}
        paymentToEdit={paymentToEdit}
      />

      <DebtDetailModal
        isOpen={!!selectedDebtForDetail}
        debt={selectedDebtForDetail}
        payments={payments}
        onClose={() => setSelectedDebtForDetail(null)}
        onOpenPaymentModal={(debtId) => {
          setPaymentToEdit(null);
          setPreselectedDebtId(debtId);
          setIsPaymentModalOpen(true);
        }}
        onEditDebt={(debt) => {
          setSelectedDebtForDetail(null);
          setDebtToEdit(debt);
          setIsDebtModalOpen(true);
        }}
        onDeleteDebt={(debt) => {
          handleRequestDeleteDebt(debt);
        }}
        onDeletePayment={(payment) => {
          handleRequestDeletePayment(payment);
        }}
      />

      <ConfirmModal
        isOpen={confirmModalState.isOpen}
        title={confirmModalState.title}
        message={confirmModalState.message}
        confirmText={confirmModalState.confirmText}
        cancelText={confirmModalState.cancelText}
        isDestructive={confirmModalState.isDestructive}
        onConfirm={confirmModalState.onConfirm}
        onCancel={() => setConfirmModalState((prev) => ({ ...prev, isOpen: false }))}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
