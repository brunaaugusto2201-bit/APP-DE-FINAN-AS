import React, { useState, useEffect } from 'react';
import { X, HelpCircle } from 'lucide-react';
import { Debt, DebtCategory } from '../types/finance';

interface DebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (debtData: Omit<Debt, 'id' | 'createdAt' | 'updatedAt'>, editingId?: string) => void;
  debtToEdit?: Debt | null;
}

export const DebtModal: React.FC<DebtModalProps> = ({
  isOpen,
  onClose,
  onSave,
  debtToEdit,
}) => {
  const [name, setName] = useState('');
  const [creditor, setCreditor] = useState('');
  const [category, setCategory] = useState<DebtCategory>('cartao_credito');
  const [originalValue, setOriginalValue] = useState<string>('');
  const [currentValue, setCurrentValue] = useState<string>('');
  const [interestRate, setInterestRate] = useState('');
  const [hasInterestRate, setHasInterestRate] = useState<boolean>(false);
  const [dueDate, setDueDate] = useState('');
  const [isInstallment, setIsInstallment] = useState(false);
  const [totalInstallments, setTotalInstallments] = useState<string>('');
  const [remainingInstallments, setRemainingInstallments] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset or fill form on open/edit
  useEffect(() => {
    if (debtToEdit) {
      setName(debtToEdit.name);
      setCreditor(debtToEdit.creditor);
      setCategory(debtToEdit.category);
      setOriginalValue(debtToEdit.originalValue.toString());
      setCurrentValue(debtToEdit.currentValue.toString());
      if (debtToEdit.interestRate && debtToEdit.interestRate !== 'Não informado') {
        setInterestRate(debtToEdit.interestRate);
        setHasInterestRate(true);
      } else {
        setInterestRate('');
        setHasInterestRate(false);
      }
      setDueDate(debtToEdit.dueDate);
      if (debtToEdit.totalInstallments && debtToEdit.totalInstallments > 1) {
        setIsInstallment(true);
        setTotalInstallments(debtToEdit.totalInstallments.toString());
        setRemainingInstallments(debtToEdit.remainingInstallments?.toString() || '');
      } else {
        setIsInstallment(false);
        setTotalInstallments('');
        setRemainingInstallments('');
      }
      setNotes(debtToEdit.notes || '');
    } else {
      // Default new form
      setName('');
      setCreditor('');
      setCategory('cartao_credito');
      setOriginalValue('');
      setCurrentValue('');
      setInterestRate('');
      setHasInterestRate(false);
      // Default date to end of current month
      const today = new Date();
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 10);
      setDueDate(nextMonth.toISOString().split('T')[0]);
      setIsInstallment(false);
      setTotalInstallments('');
      setRemainingInstallments('');
      setNotes('');
    }
    setErrors({});
  }, [debtToEdit, isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Informe o nome ou descrição da dívida.';
    }

    if (!creditor.trim()) {
      newErrors.creditor = 'Informe o credor ou instituição financeira.';
    }

    const orig = parseFloat(originalValue);
    if (isNaN(orig) || orig < 0) {
      newErrors.originalValue = 'Informe um valor original numérico válido (ex: 1500.00).';
    }

    const curr = parseFloat(currentValue);
    if (isNaN(curr) || curr < 0) {
      newErrors.currentValue = 'Informe o valor atualizado (ex: 1500.00).';
    }

    if (!dueDate) {
      newErrors.dueDate = 'Informe a data de vencimento.';
    }

    if (isInstallment) {
      const tot = parseInt(totalInstallments, 10);
      if (isNaN(tot) || tot <= 1) {
        newErrors.totalInstallments = 'Informe a quantidade total de parcelas (mínimo 2).';
      }
      const rem = parseInt(remainingInstallments, 10);
      if (isNaN(rem) || rem < 0 || rem > tot) {
        newErrors.remainingInstallments = 'Parcelas restantes devem ser entre 0 e o total.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCopyOriginalToCurrent = () => {
    if (originalValue) {
      setCurrentValue(originalValue);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const orig = parseFloat(originalValue);
    const curr = parseFloat(currentValue);

    const formattedInterest = hasInterestRate && interestRate.trim()
      ? interestRate.trim()
      : 'Não informado';

    onSave(
      {
        name: name.trim(),
        creditor: creditor.trim(),
        category,
        originalValue: orig,
        currentValue: curr,
        interestRate: formattedInterest,
        dueDate,
        totalInstallments: isInstallment ? parseInt(totalInstallments, 10) : null,
        remainingInstallments: isInstallment ? parseInt(remainingInstallments, 10) : null,
        notes: notes.trim(),
      },
      debtToEdit?.id
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0d1b2a] border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-8 my-8 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white">
              {debtToEdit ? 'Editar Dívida' : 'Cadastrar Nova Dívida'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Insira as informações reais fornecidas pelo credor ou contrato
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
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Nome e Credor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nome da dívida <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                placeholder="Ex: Cartão Nubank, Financiamento Carro"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-lg bg-[#0b132b] border text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                  errors.name ? 'border-rose-500' : 'border-slate-700'
                }`}
              />
              {errors.name && <p className="text-[11px] text-rose-400 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Instituição financeira / Credor <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                placeholder="Ex: Nubank, Itaú, Santander, Caixa, Enel"
                value={creditor}
                onChange={(e) => setCreditor(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-lg bg-[#0b132b] border text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                  errors.creditor ? 'border-rose-500' : 'border-slate-700'
                }`}
              />
              {errors.creditor && <p className="text-[11px] text-rose-400 mt-1">{errors.creditor}</p>}
            </div>
          </div>

          {/* Categoria e Vencimento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DebtCategory)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0b132b] border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="cartao_credito">Cartão de crédito</option>
                <option value="emprestimo">Empréstimo</option>
                <option value="financiamento">Financiamento</option>
                <option value="conta">Conta (Água, Luz, etc.)</option>
                <option value="outros">Outros</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Data de vencimento <span className="text-emerald-400">*</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-lg bg-[#0b132b] border text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                  errors.dueDate ? 'border-rose-500' : 'border-slate-700'
                }`}
              />
              {errors.dueDate && <p className="text-[11px] text-rose-400 mt-1">{errors.dueDate}</p>}
            </div>
          </div>

          {/* Valores: Original e Atualizado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Valor original (R$) <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">R$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={originalValue}
                  onChange={(e) => setOriginalValue(e.target.value)}
                  className={`w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-[#0b132b] border text-sm text-white tabular-nums placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                    errors.originalValue ? 'border-rose-500' : 'border-slate-700'
                  }`}
                />
              </div>
              {errors.originalValue && <p className="text-[11px] text-rose-400 mt-1">{errors.originalValue}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Valor atualizado informado (R$) <span className="text-emerald-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleCopyOriginalToCurrent}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 underline"
                >
                  Igual ao original
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">R$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={currentValue}
                  onChange={(e) => setCurrentValue(e.target.value)}
                  className={`w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-[#0b132b] border text-sm text-white tabular-nums placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                    errors.currentValue ? 'border-rose-500' : 'border-slate-700'
                  }`}
                />
              </div>
              {errors.currentValue && <p className="text-[11px] text-rose-400 mt-1">{errors.currentValue}</p>}
            </div>
          </div>

          {/* Taxa de Juros (opcional com selo "Não informado" se não conhecida) */}
          <div className="bg-[#0b132b] border border-slate-800 rounded-lg p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <span>Taxa de juros informada pelo credor</span>
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasInterestRate}
                  onChange={(e) => setHasInterestRate(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 h-4 w-4 bg-slate-900"
                />
                <span>Conheço a taxa</span>
              </label>
            </div>

            {hasInterestRate ? (
              <input
                type="text"
                placeholder="Ex: 2,5% a.m., 14,9% a.a., Multa de 2%"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0d1b2a] border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            ) : (
              <p className="text-[11px] text-slate-400 italic">
                Não informada. O aplicativo não inventa taxas de juros e registrará formalmente como &ldquo;Não informado&rdquo;.
              </p>
            )}
          </div>

          {/* Parcelamento */}
          <div className="bg-[#0b132b] border border-slate-800 rounded-lg p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">
                Esta dívida é parcelada?
              </span>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isInstallment}
                  onChange={(e) => setIsInstallment(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 h-4 w-4 bg-slate-900"
                />
                <span>Sim, possui parcelas fixas</span>
              </label>
            </div>

            {isInstallment && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Total de parcelas
                  </label>
                  <input
                    type="number"
                    min="2"
                    placeholder="Ex: 12"
                    value={totalInstallments}
                    onChange={(e) => setTotalInstallments(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg bg-[#0d1b2a] border text-xs text-white tabular-nums ${
                      errors.totalInstallments ? 'border-rose-500' : 'border-slate-700'
                    }`}
                  />
                  {errors.totalInstallments && (
                    <p className="text-[10px] text-rose-400 mt-0.5">{errors.totalInstallments}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Parcelas restantes
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Ex: 5"
                    value={remainingInstallments}
                    onChange={(e) => setRemainingInstallments(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg bg-[#0d1b2a] border text-xs text-white tabular-nums ${
                      errors.remainingInstallments ? 'border-rose-500' : 'border-slate-700'
                    }`}
                  />
                  {errors.remainingInstallments && (
                    <p className="text-[10px] text-rose-400 mt-0.5">{errors.remainingInstallments}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Observações ou anotações (opcional)
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Negociação realizada pelo canal oficial, desconto para quitação à vista, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0b132b] border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          {/* Rodapé com botões de ação */}
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
              {debtToEdit ? 'Salvar Alterações' : 'Cadastrar Dívida'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
