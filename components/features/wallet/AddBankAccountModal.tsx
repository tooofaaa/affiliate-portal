"use client";
import React, { useState, useEffect } from "react";
import { addBankAccount } from "@/lib/actions/wallet";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface AddBankAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddBankAccountModal({ isOpen, onClose, onSuccess }: AddBankAccountModalProps) {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    bank_name: '',
    account_holder: '',
    account_number: '',
    iban: '',
    is_primary: true
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({ bank_name: '', account_holder: '', account_number: '', iban: '', is_primary: true });
      setErrorMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    setIsLoading(true);
    const { error } = await addBankAccount(formData);
    setIsLoading(false);
    if (error) {
      setErrorMsg(error);
    } else {
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl flex flex-col">
        <h2 className="text-xl font-bold text-gray-900 mb-6">{t.wallet.addBankAccount}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 block">{t.wallet.bankNameLabel}</label>
            <input
              type="text"
              required
              name="bank_name"
              value={formData.bank_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 text-sm outline-none"
              placeholder={t.wallet.bankNamePlaceholder}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 block">{t.wallet.holderNameLabel}</label>
            <input
              type="text"
              required
              name="account_holder"
              value={formData.account_holder}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 text-sm outline-none"
              placeholder={t.wallet.holderNamePlaceholder}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 block">{t.wallet.accNumLabel}</label>
            <input
              type="text"
              required
              name="account_number"
              value={formData.account_number}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 text-sm font-mono outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 block">{t.wallet.iban}</label>
            <input
              type="text"
              name="iban"
              value={formData.iban}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 text-sm font-mono outline-none"
              placeholder="SA00..."
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_primary"
              name="is_primary"
              checked={formData.is_primary}
              onChange={handleChange}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <label htmlFor="is_primary" className="text-sm text-gray-700 cursor-pointer select-none">
              {t.wallet.setPrimary}
            </label>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
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
              {isLoading ? t.wallet.adding : t.wallet.addAccountBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
