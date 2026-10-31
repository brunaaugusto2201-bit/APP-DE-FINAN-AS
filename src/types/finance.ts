export type DebtCategory = 'cartao_credito' | 'emprestimo' | 'financiamento' | 'conta' | 'outros';

export type DebtStatus = 'em_aberto' | 'parcialmente_paga' | 'quitada';

export interface Debt {
  id: string;
  name: string; // Nome da dívida
  creditor: string; // Instituição financeira ou credor
  category: DebtCategory; // Categoria
  originalValue: number; // Valor original informado pelo usuário
  currentValue: number; // Valor atualizado informado pelo usuário
  interestRate: string; // Taxa de juros (ex: "2,5% a.m.") ou "Não informado"
  dueDate: string; // Data de vencimento no formato YYYY-MM-DD
  totalInstallments: number | null; // Total de parcelas (ou null se não aplicável)
  remainingInstallments: number | null; // Parcelas restantes (ou null)
  notes: string; // Observações informadas pelo usuário
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface Payment {
  id: string;
  debtId: string; // ID da dívida vinculada
  amount: number; // Valor efetivamente pago
  paymentDate: string; // Data do pagamento no formato YYYY-MM-DD
  installmentNumber?: number | null; // Número da parcela paga (opcional)
  paymentMethod: string; // Forma de pagamento (ex: Pix, Boleto, Débito) ou "Não informado"
  notes?: string; // Observações do pagamento
  createdAt: string; // ISO string
}

export interface ComputedDebt extends Debt {
  totalPaid: number; // Cálculo do sistema: soma dos pagamentos registrados
  remainingBalance: number; // Cálculo do sistema: currentValue - totalPaid (mínimo 0)
  progressPercentage: number; // Cálculo do sistema: percentual pago (0 a 100%)
  calculatedStatus: DebtStatus; // Cálculo do sistema: quitada, parcialmente paga ou em aberto
  isOverdue: boolean; // Cálculo do sistema: vencimento anterior a hoje e saldo restante > 0
  daysUntilDue: number; // Cálculo do sistema: dias restantes para o vencimento (negativo se vencida)
}

export interface DebtSummary {
  totalDebtsCount: number;
  openDebtsCount: number;
  partiallyPaidDebtsCount: number;
  paidDebtsCount: number;
  overdueDebtsCount: number;
  totalOriginalValue: number;
  totalCurrentValue: number;
  totalPaidAmount: number;
  totalRemainingBalance: number;
  overallProgressPercentage: number;
}

export type ActiveTab = 'inicio' | 'dashboard' | 'dividas' | 'pagamentos' | 'relatorios' | 'configuracoes';
