import { Debt, Payment } from '../types/finance';

const STORAGE_KEYS = {
  DEBTS: 'meu_controle_debts_v1',
  PAYMENTS: 'meu_controle_payments_v1',
  IS_DEMO: 'meu_controle_is_demo_v1',
};

// Dados de demonstração realistas, claramente identificados como dados de exemplo para aprendizado.
export const DEMO_DEBTS: Debt[] = [
  {
    id: 'demo-debt-1',
    name: 'Cartão de Crédito Nubank Roxinho',
    creditor: 'Nubank',
    category: 'cartao_credito',
    originalValue: 3200.0,
    currentValue: 3200.0,
    interestRate: '14,5% a.m. (rotativo informado na fatura)',
    dueDate: '2026-11-15',
    totalInstallments: null,
    remainingInstallments: null,
    notes: 'Fatura fechada de compras e parcelamentos acumulados. Meta prioritária de quitação.',
    createdAt: '2026-10-01T10:00:00.000Z',
    updatedAt: '2026-10-15T10:00:00.000Z',
  },
  {
    id: 'demo-debt-2',
    name: 'Financiamento Automotivo Prisma',
    creditor: 'Banco Santander',
    category: 'financiamento',
    originalValue: 18500.0,
    currentValue: 18500.0,
    interestRate: '1,89% a.m.',
    dueDate: '2026-11-20',
    totalInstallments: 36,
    remainingInstallments: 14,
    notes: 'Parcela mensal fixa de R$ 740,00. Contrato de financiamento do veículo.',
    createdAt: '2026-09-01T12:00:00.000Z',
    updatedAt: '2026-10-20T12:00:00.000Z',
  },
  {
    id: 'demo-debt-3',
    name: 'Empréstimo Pessoal Consignado',
    creditor: 'Banco do Brasil',
    category: 'emprestimo',
    originalValue: 5000.0,
    currentValue: 5000.0,
    interestRate: '2,3% a.m.',
    dueDate: '2026-11-05',
    totalInstallments: 12,
    remainingInstallments: 5,
    notes: 'Empréstimo realizado para reforma do apartamento.',
    createdAt: '2026-06-01T08:00:00.000Z',
    updatedAt: '2026-10-05T08:00:00.000Z',
  },
  {
    id: 'demo-debt-4',
    name: 'Conta de Energia Elétrica em Atraso',
    creditor: 'Enel Distribuição',
    category: 'conta',
    originalValue: 420.5,
    currentValue: 435.8,
    interestRate: 'Multa de 2% informada no boleto',
    dueDate: '2026-10-18', // Vencida propositalmente para demonstrar o alerta de atraso
    totalInstallments: 1,
    remainingInstallments: 1,
    notes: 'Segunda via emitida com acréscimo de encargos da distribuidora.',
    createdAt: '2026-10-10T09:00:00.000Z',
    updatedAt: '2026-10-25T09:00:00.000Z',
  },
  {
    id: 'demo-debt-5',
    name: 'Parcelamento Odontológico Implante',
    creditor: 'Clínica Sorriso & Arte',
    category: 'outros',
    originalValue: 2400.0,
    currentValue: 2400.0,
    interestRate: 'Não informado',
    dueDate: '2026-10-10',
    totalInstallments: 6,
    remainingInstallments: 0,
    notes: 'Tratamento odontológico concluído e 100% quitado com sucesso.',
    createdAt: '2026-05-10T14:00:00.000Z',
    updatedAt: '2026-10-10T14:00:00.000Z',
  },
];

export const DEMO_PAYMENTS: Payment[] = [
  // Pagamentos para o Financiamento Santander (total acumulado: R$ 8.140,00)
  {
    id: 'demo-pay-1',
    debtId: 'demo-debt-2',
    amount: 740.0,
    paymentDate: '2026-08-20',
    installmentNumber: 20,
    paymentMethod: 'Débito automático',
    notes: 'Pagamento de parcela mensal',
    createdAt: '2026-08-20T10:00:00.000Z',
  },
  {
    id: 'demo-pay-2',
    debtId: 'demo-debt-2',
    amount: 740.0,
    paymentDate: '2026-09-20',
    installmentNumber: 21,
    paymentMethod: 'Débito automático',
    notes: 'Pagamento de parcela mensal',
    createdAt: '2026-09-20T10:00:00.000Z',
  },
  {
    id: 'demo-pay-3',
    debtId: 'demo-debt-2',
    amount: 740.0,
    paymentDate: '2026-10-20',
    installmentNumber: 22,
    paymentMethod: 'Débito automático',
    notes: 'Pagamento de parcela mensal',
    createdAt: '2026-10-20T10:00:00.000Z',
  },
  // Pagamentos para o Empréstimo Banco do Brasil
  {
    id: 'demo-pay-4',
    debtId: 'demo-debt-3',
    amount: 450.0,
    paymentDate: '2026-09-05',
    installmentNumber: 6,
    paymentMethod: 'Pix',
    notes: 'Parcela paga via Pix',
    createdAt: '2026-09-05T11:00:00.000Z',
  },
  {
    id: 'demo-pay-5',
    debtId: 'demo-debt-3',
    amount: 450.0,
    paymentDate: '2026-10-05',
    installmentNumber: 7,
    paymentMethod: 'Pix',
    notes: 'Parcela paga via Pix',
    createdAt: '2026-10-05T11:00:00.000Z',
  },
  // Pagamento para o Cartão Nubank
  {
    id: 'demo-pay-6',
    debtId: 'demo-debt-1',
    amount: 800.0,
    paymentDate: '2026-10-15',
    installmentNumber: null,
    paymentMethod: 'Boleto',
    notes: 'Amortização parcial da fatura',
    createdAt: '2026-10-15T14:30:00.000Z',
  },
  // Pagamento integral da dívida 5 (quitada)
  {
    id: 'demo-pay-7',
    debtId: 'demo-debt-5',
    amount: 2400.0,
    paymentDate: '2026-10-10',
    installmentNumber: 6,
    paymentMethod: 'Cartão de débito',
    notes: 'Quitação antecipada negociada no balcão',
    createdAt: '2026-10-10T16:00:00.000Z',
  },
];

export const storageService = {
  getDebts(): Debt[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DEBTS);
      if (!data) return [];
      return JSON.parse(data);
    } catch (e) {
      console.error('Erro ao ler dívidas do localStorage:', e);
      return [];
    }
  },

  saveDebts(debts: Debt[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(debts));
    } catch (e) {
      console.error('Erro ao salvar dívidas no localStorage:', e);
    }
  },

  getPayments(): Payment[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
      if (!data) return [];
      return JSON.parse(data);
    } catch (e) {
      console.error('Erro ao ler pagamentos do localStorage:', e);
      return [];
    }
  },

  savePayments(payments: Payment[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
    } catch (e) {
      console.error('Erro ao salvar pagamentos no localStorage:', e);
    }
  },

  isDemoLoaded(): boolean {
    return localStorage.getItem(STORAGE_KEYS.IS_DEMO) === 'true';
  },

  setDemoLoaded(isDemo: boolean): void {
    localStorage.setItem(STORAGE_KEYS.IS_DEMO, isDemo ? 'true' : 'false');
  },

  loadDemoData(): { debts: Debt[]; payments: Payment[] } {
    this.saveDebts(DEMO_DEBTS);
    this.savePayments(DEMO_PAYMENTS);
    this.setDemoLoaded(true);
    return { debts: DEMO_DEBTS, payments: DEMO_PAYMENTS };
  },

  clearAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.DEBTS);
    localStorage.removeItem(STORAGE_KEYS.PAYMENTS);
    localStorage.removeItem(STORAGE_KEYS.IS_DEMO);
  },

  exportBackupJson(): string {
    const backup = {
      app: 'Meu Controle',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      debts: this.getDebts(),
      payments: this.getPayments(),
    };
    return JSON.stringify(backup, null, 2);
  },

  importBackupJson(jsonString: string): { success: boolean; message: string; count?: number } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || !Array.isArray(parsed.debts)) {
        return { success: false, message: 'Arquivo JSON inválido. O formato de backup não corresponde ao esperado.' };
      }
      this.saveDebts(parsed.debts);
      this.savePayments(Array.isArray(parsed.payments) ? parsed.payments : []);
      this.setDemoLoaded(false);
      return {
        success: true,
        message: `Backup restaurado com sucesso! ${parsed.debts.length} dívida(s) importada(s).`,
        count: parsed.debts.length,
      };
    } catch {
      return { success: false, message: 'Erro ao interpretar o arquivo. Certifique-se de que é um JSON válido.' };
    }
  },
};
