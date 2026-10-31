import { Debt, Payment, ComputedDebt, DebtCategory, DebtStatus, DebtSummary } from '../types/finance';

/**
 * Formata um valor numérico para a moeda brasileira (R$ 0,00).
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return 'R$ 0,00';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Formata uma data no formato ISO ou YYYY-MM-DD para DD/MM/AAAA.
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'Não informado';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
  }
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'Não informado';
    return d.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  } catch {
    return dateString;
  }
}

/**
 * Retorna o rótulo amigável em português para uma categoria de dívida.
 */
export function getCategoryLabel(category: DebtCategory): string {
  switch (category) {
    case 'cartao_credito':
      return 'Cartão de crédito';
    case 'emprestimo':
      return 'Empréstimo';
    case 'financiamento':
      return 'Financiamento';
    case 'conta':
      return 'Conta';
    case 'outros':
    default:
      return 'Outros';
  }
}

/**
 * Retorna cores suaves para cada categoria.
 */
export function getCategoryColor(category: DebtCategory): { bg: string; text: string; border: string } {
  switch (category) {
    case 'cartao_credito':
      return { bg: 'bg-purple-950/40', text: 'text-purple-300', border: 'border-purple-800/40' };
    case 'emprestimo':
      return { bg: 'bg-blue-950/40', text: 'text-blue-300', border: 'border-blue-800/40' };
    case 'financiamento':
      return { bg: 'bg-cyan-950/40', text: 'text-cyan-300', border: 'border-cyan-800/40' };
    case 'conta':
      return { bg: 'bg-amber-950/40', text: 'text-amber-300', border: 'border-amber-800/40' };
    case 'outros':
    default:
      return { bg: 'bg-slate-800/60', text: 'text-slate-300', border: 'border-slate-700/50' };
  }
}

/**
 * Retorna o rótulo e as cores da situação da dívida.
 */
export function getStatusBadge(status: DebtStatus, isOverdue: boolean): { label: string; bg: string; text: string } {
  if (status === 'quitada') {
    return {
      label: 'Quitada',
      bg: 'bg-emerald-950/50',
      text: 'text-emerald-400',
    };
  }

  if (isOverdue) {
    return {
      label: 'Vencida',
      bg: 'bg-rose-950/50',
      text: 'text-rose-400',
    };
  }

  if (status === 'parcialmente_paga') {
    return {
      label: 'Parcialmente paga',
      bg: 'bg-amber-950/50',
      text: 'text-amber-400',
    };
  }

  return {
    label: 'Em aberto',
    bg: 'bg-sky-950/50',
    text: 'text-sky-400',
  };
}

/**
 * Converte data YYYY-MM-DD em objeto Date no início do dia local para comparação estrita.
 */
export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Calcula campos derivados estritos para cada dívida com base nos pagamentos registrados.
 * Não inventa nem estima juros ou parcelas: todo saldo é calculado exclusivamente subtraindo pagamentos reais.
 */
export function computeDebt(debt: Debt, payments: Payment[]): ComputedDebt {
  const debtPayments = payments.filter((p) => p.debtId === debt.id);
  const totalPaid = debtPayments.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  // O saldo restante baseia-se no valor atualizado informado pelo usuário menos o total já pago
  const remainingBalance = Math.max(0, debt.currentValue - totalPaid);

  const progressPercentage = debt.currentValue > 0
    ? Math.min(100, Math.round((totalPaid / debt.currentValue) * 100))
    : (totalPaid > 0 ? 100 : 0);

  let calculatedStatus: DebtStatus = 'em_aberto';
  if (remainingBalance === 0 && (totalPaid > 0 || debt.currentValue === 0)) {
    calculatedStatus = 'quitada';
  } else if (totalPaid > 0) {
    calculatedStatus = 'parcialmente_paga';
  }

  // Verificação de vencimento
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDateObj = parseLocalDate(debt.dueDate);
  dueDateObj.setHours(0, 0, 0, 0);

  const diffTime = dueDateObj.getTime() - today.getTime();
  const daysUntilDue = Math.round(diffTime / (1000 * 60 * 60 * 24));
  const isOverdue = daysUntilDue < 0 && calculatedStatus !== 'quitada' && remainingBalance > 0;

  return {
    ...debt,
    totalPaid,
    remainingBalance,
    progressPercentage,
    calculatedStatus,
    isOverdue,
    daysUntilDue,
  };
}

/**
 * Calcula o consolidado financeiro do dashboard.
 */
export function calculateSummary(computedDebts: ComputedDebt[]): DebtSummary {
  const totalDebtsCount = computedDebts.length;
  const openDebtsCount = computedDebts.filter((d) => d.calculatedStatus === 'em_aberto').length;
  const partiallyPaidDebtsCount = computedDebts.filter((d) => d.calculatedStatus === 'parcialmente_paga').length;
  const paidDebtsCount = computedDebts.filter((d) => d.calculatedStatus === 'quitada').length;
  const overdueDebtsCount = computedDebts.filter((d) => d.isOverdue).length;

  const totalOriginalValue = computedDebts.reduce((sum, d) => sum + (d.originalValue || 0), 0);
  const totalCurrentValue = computedDebts.reduce((sum, d) => sum + (d.currentValue || 0), 0);
  const totalPaidAmount = computedDebts.reduce((sum, d) => sum + (d.totalPaid || 0), 0);
  const totalRemainingBalance = computedDebts.reduce((sum, d) => sum + (d.remainingBalance || 0), 0);

  const overallProgressPercentage = totalCurrentValue > 0
    ? Math.min(100, Math.round((totalPaidAmount / totalCurrentValue) * 100))
    : 0;

  return {
    totalDebtsCount,
    openDebtsCount,
    partiallyPaidDebtsCount,
    paidDebtsCount,
    overdueDebtsCount,
    totalOriginalValue,
    totalCurrentValue,
    totalPaidAmount,
    totalRemainingBalance,
    overallProgressPercentage,
  };
}
