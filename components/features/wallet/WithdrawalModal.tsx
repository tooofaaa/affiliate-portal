"use client";
import React, { useState, useEffect } from "react";
import { requestWithdrawal } from "@/lib/actions/wallet";
import { formatCurrency } from "@/lib/utils/formatters";
import { BankAccount } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
  bankAccounts: BankAccount[];
  onSuccess: () => void;
}

export default function WithdrawalModal({ isOpen, onClose, availableBalance, bankAccounts, onSuccess }: WithdrawalModalProps) {
  const { t, language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState<string>('');
  const [bankAccountId, setBankAccountId] = useState<number | ''>(bankAccounts.find(a => a.is_primary)?.id || '');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Reset form state whenever the modal opens
  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setBankAccountId(bankAccounts.find(a => a.is_primary)?.id || '');
      setNotes('');
      setErrorMsg(null);
    }
  }, [isOpen, bankAccounts]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const numAmount = parseFloat(amount) || 0;
    
    if (numAmount <= 0) {
      setErrorMsg(t.wallet.validAmountError);
      return;
    }
    if (!bankAccountId) {
      setErrorMsg(t.wallet.selectBankError);
      return;
    }
    if (numAmount > availableBalance) {
      setErrorMsg(t.wallet.exceedBalanceError);
      return;
    }

    setIsLoading(true);
    const { error } = await requestWithdrawal({
      amount: numAmount,
      bank_account_id: bankAccountId as number,
      notes: notes.trim() || undefined
    });
    setIsLoading(false);

    if (error) {
      setErrorMsg(error);
    } else {
      onSuccess();
    }
  };

  const currencyCode = language === 'ar' ? 'ر.س' : 'SAR';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl flex flex-col">
        <h2 className="text-xl font-bold text-gray-900 mb-6">{t.wallet.requestWithdrawal}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {errorMsg}
            </div>
          )}

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex justify-between items-center">
            <span className="text-gray-600 text-sm">
              {language === 'ar' ? 'الرصيد القابل للسحب' : 'Withdrawable Balance'}
            </span>
            <span className="font-bold text-lg text-blue-700">
              {formatCurrency(availableBalance, language)}
            </span>
          </div>

          <div className="bg-amber-50 border border-amber-100 text-amber-700 p-3 rounded-xl text-[11px] leading-normal flex items-start gap-2">
            <span className="text-base mt-0.5">ℹ️</span>
            <span>
              {language === 'ar' 
                ? 'يمكن سحب الأموال التي أضافها المدير يدويًا فقط. رصيد الكاش‌باك غير قابل للسحب ويمكن استخدامه فقط لدفع رسوم المنصة.'
                : 'Only funds manually deposited by administrators can be withdrawn. Cashback credits are non-refundable and can only be used to pay for platform fees.'
              }
            </span>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 block">
              {t.wallet.withdrawAmountLabel.replace("{currency}", currencyCode)}
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 text-sm outline-none"
              placeholder="0.00"
              max={availableBalance}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 block">{t.wallet.destinationBank}</label>
            <select
              required
              value={bankAccountId}
              onChange={e => setBankAccountId(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 text-sm bg-white outline-none"
            >
              <option value="" disabled>{t.wallet.selectBankPlaceholder}</option>
              {bankAccounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.bank_name} - ****{account.account_number.slice(-4)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 block">{t.wallet.notesOptional}</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 text-sm outline-none"
              placeholder={t.wallet.notesPlaceholder}
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? t.wallet.processing : t.wallet.submitRequest}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
