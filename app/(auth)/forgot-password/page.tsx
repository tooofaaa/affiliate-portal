"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Button } from "@/components/ui/Button";
import { requestPasswordReset } from "@/lib/actions/auth";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const { t, isRTL } = useLanguage();
  const l = t.forgotPassword;
  
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldown > 0) return;

    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const res = await requestPasswordReset(email.trim());
    setIsLoading(false);

    if (res.success) {
      setSuccessMsg(res.message);
      setCooldown(60); // 60 seconds cooldown for resending
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-8 duration-700 font-poppins">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            {l.title}
          </h2>
          <p className="text-gray-500 mt-2 text-sm font-medium">
            {l.subtitle}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {successMsg && (
          <div className="bg-emerald-50 text-emerald-600 text-sm p-4 rounded-xl border border-emerald-100 font-medium">
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl border border-red-100 font-medium">
            {errorMsg}
          </div>
        )}

        {!successMsg && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700 ms-1">
              {l.email}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={l.emailPlaceholder}
              className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
            />
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          className="w-full py-3.5 mt-2 text-sm shadow-indigo-500/25"
          isLoading={isLoading}
          disabled={cooldown > 0 && !successMsg}
        >
          {cooldown > 0 
            ? `${l.resendEmail} (${cooldown}s)` 
            : l.sendLink
          }
        </Button>

        {successMsg && (
          <div className="flex flex-col gap-2 mt-2">
            <Button
              onClick={handleSubmit}
              variant="secondary"
              className="w-full py-3 text-sm"
              disabled={cooldown > 0 || isLoading}
            >
              {cooldown > 0 
                ? `${l.resendEmail} (${cooldown}s)` 
                : l.resendEmail
              }
            </Button>
          </div>
        )}

        <div className="text-center mt-4">
          <Link href="/login" className="text-sm text-indigo-600 font-semibold hover:underline">
            ← {l.backToLogin}
          </Link>
        </div>
      </form>
    </div>
  );
}
