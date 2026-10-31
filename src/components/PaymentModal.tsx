import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, CreditCard, FileText } from 'lucide-react';
import { ComputedDebt, Payment } from '../types/finance';
import { formatCurrency } from '../utils/formatters';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePayment: (
    paymentData: Omit<Payment, 'id' | 'createdAt'>,
    editingPaymentId?: string
  ) => void;
  debts: ComputedDebt[];
  preselectedDebtId?: string | null;
  paymentToEdit?: Payment | null;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSavePayment,
  debts,
  preselectedDebtId,
  paymentToEdit,
}) => {
  const [debtId, setDebtId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>('');
  const [installmentNumber, setInstallmentNumber] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('Pix');
  const [customMethod, setCustomMethod] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;

    if (paymentToEdit) {
      setDebtId(paymentToEdit.debtId);
      setAmount(paymentToEdit.amount.toString());
      setPaymentDate(paymentToEdit.paymentDate);
      setInstallmentNumber(paymentToEdit.installmentNumber?.toString() || '');
      const standardMethods = ['Pix', 'Boleto bancário', 'Débito automático', 'Transferência (TED/DOC)', 'Dinheiro em espécie', 'Não informado'];
      if (standardMethods.includes(paymentToEdit.paymentMethod)) {
        setPaymentMethod(paymentToEdit.paymentMethod);
        setCustomMethod('');
      } else {
        setPaymentMethod('Outro');
        setCustomMethod(paymentToEdit.paymentMethod);
      }
      setNotes(paymentToEdit.notes || '');
    } else {
      // New payment
      setDebtId(preselectedDebtId || (debts.length > 0 ? debts[0].id : ''));
      setAmount('');
      const today = new Date().toISOString().split('T')[0];
      setPaymentDate(today);
      setInstallmentNumber('');
      setPaymentMethod('Pix');
      setCustomMethod('');
      setNotes('');
    }
    setErrors({});
  }, [isOpen, paymentToEdit, preselectedDebtId, debts]);

  if (!isOpen) return null;

  const selectedDebt = debts.find((d) => d.id === debtId);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!debtId) {
      newErrors.debtId = 'Selecione a dívida correspondente.';
    }

    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      newErrors.amount = 'Informe um valor de pagamento válido maior que zero.';
    }

    if (!paymentDate) {
      newErrors.paymentDate = 'Informe a data do pagamento.';
    }

    if (installmentNumber.trim()) {
      const inst = parseInt(installmentNumber, 10);
      if (isNaN(inst) || inst < 1) {
        newErrors.installmentNumber = 'A parcela deve ser um número inteiro positivo.';
      }
    }

    if (paymentMethod === 'Outro' && !customMethod.trim()) {
      newErrors.customMethod = 'Especifique a forma de pagamento.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFillFullBalance = () => {
    if (selectedDebt && selectedDebt.remainingBalance > 0) {
      setAmount(selectedDebt.remainingBalance.toFixed(2));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const finalMethod = paymentMethod === 'Outro' ? customMethod.trim() : paymentMethod;
    const inst = installmentNumber.trim() ? parseInt(installmentNumber, 10) : null;

    onSavePayment(
      {
        debtId,
        amount: parseFloat(amount),
        paymentDate,
        installmentNumber: inst,
        paymentMethod: finalMethod,
        notes: notes.trim(),
      },
      paymentToEdit?.id
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0d1b2a] border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-8 my-8 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white">
              {paymentToEdit ? 'Editar Pagamento' : 'Registrar Pagamento'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              O valor pago será abatido diretamente do saldo restante da dívida
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Seleção da Dívida */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Dívida a amortizar <span className="text-emerald-400">*</span>
            </label>
            <select
              value={debtId}
              onChange={(e) => setDebtId(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-lg bg-[#0b132b] border text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                errors.debtId ? 'border-rose-500' : 'border-slate-700'
              }`}
            >
              <option value="" disabled>
                Selecione uma dívida...
              </option>
              {debts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.creditor}) — Saldo: {formatCurrency(d.remainingBalance)}
                </option>
              ))}
            </select>
            {errors.debtId && <p className="text-[11px] text-rose-400 mt-1">{errors.debtId}</p>}
          </div>

          {/* Destaque do Saldo Atual da Dívida */}
          {selectedDebt && (
            <div className="bg-[#0b132b] border border-slate-800 rounded-lg p-3 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block">Saldo pendente atual:</span>
                <strong className="text-sky-400 text-sm tabular-nums">
                  {formatCurrency(selectedDebt.remainingBalance)}
                </strong>
              </div>
              {selectedDebt.remainingBalance > 0 && (
                <button
                  type="button"
                  onClick={handleFillFullBalance}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded text-xs font-semibold transition-colors"
                >
                  Quitar saldo total
                </button>
              )}
            </div>
          )}

          {/* Valor Pago e Data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Valor pago (R$) <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">R$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-[#0b132b] border text-sm text-white tabular-nums placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                    errors.amount ? 'border-rose-500' : 'border-slate-700'
                  }`}
                />
              </div>
              {errors.amount && <p className="text-[11px] text-rose-400 mt-1">{errors.amount}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Data do pagamento <span className="text-emerald-400">*</span>
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-lg bg-[#0b132b] border text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                  errors.paymentDate ? 'border-rose-500' : 'border-slate-700'
                }`}
              />
              {errors.paymentDate && <p className="text-[11px] text-rose-400 mt-1">{errors.paymentDate}</p>}
            </div>
          </div>

          {/* Parcela e Forma de Pagamento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Número da parcela (opcional)
              </label>
              <input
                type="number"
                min="1"
                placeholder="Ex: 3"
                value={installmentNumber}
                onChange={(e) => setInstallmentNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0b132b] border border-slate-700 text-sm text-white tabular-nums placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              {errors.installmentNumber && (
                <p className="text-[11px] text-rose-400 mt-1">{errors.installmentNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Forma de pagamento
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0b132b] border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="Pix">Pix</option>
                <option value="Boleto bancário">Boleto bancário</option>
                <option value="Débito automático">Débito automático</option>
                <option value="Cartão de débito">Cartão de débito</option>
                <option value="Transferência (TED/DOC)">Transferência (TED/DOC)</option>
                <option value="Dinheiro em espécie">Dinheiro em espécie</option>
                <option value="Não informado">Não informado</option>
                <option value="Outro">Outro...</option>
              </select>
            </div>
          </div>

          {paymentMethod === 'Outro' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Especifique a forma de pagamento <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                placeholder="Ex: Consignação em folha, Depósito na lotérica"
                value={customMethod}
                onChange={(e) => setCustomMethod(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-lg bg-[#0b132b] border text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                  errors.customMethod ? 'border-rose-500' : 'border-slate-700'
                }`}
              />
              {errors.customMethod && <p className="text-[11px] text-rose-400 mt-1">{errors.customMethod}</p>}
            </div>
          )}

          {/* Observações */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Observações do pagamento (opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Comprovante arquivado no app do banco, desconto de pontualidade"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0b132b] border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          {/* Rodapé com botões */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
            >
              {paymentToEdit ? 'Atualizar Pagamento' : 'Confirmar Pagamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
