"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAffiliate } from "@/lib/actions/auth";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    const res = await loginAffiliate(formData);
    setIsLoading(false);
    if (res.success) {
      router.push("/dashboard");
    } else {
      setErrorMsg(res.message ?? "An error occurred. Please try again.");
    }
  };

  return (
    <div className="flex flex-col gap-7 w-full animate-in fade-in slide-in-from-bottom-6 duration-500">

      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight" style={{ color: "#1e1b4b" }}>
          {t.login.title}
        </h2>
        <p className="text-sm mt-1.5" style={{ color: "#6b7280" }}>
          {t.login.subtitle}
        </p>
      </div>

      {/* Error */}
      {errorMsg && (
        <div className="flex items-start gap-3 bg-red-50 text-red-700 text-sm p-3.5 rounded-xl border border-red-100">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
          </svg>
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold" style={{ color: "#374151" }}>
            {t.login.email}
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.login.emailPlaceholder}
            className="w-full px-4 py-3 rounded-xl text-sm transition-all outline-none"
            style={{ background: "white", border: "1.5px solid #e5e7eb", color: "#111827" }}
            onFocus={e => (e.currentTarget.style.borderColor = "#a855f7")}
            onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")}
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold" style={{ color: "#374151" }}>{t.login.password}</label>
            <Link href="/forgot-password" className="text-xs font-semibold hover:underline" style={{ color: "#a855f7" }}>
              {t.login.forgotPassword}
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.login.passwordPlaceholder}
              className="w-full px-4 py-3 pe-12 rounded-xl text-sm transition-all outline-none"
              style={{ background: "white", border: "1.5px solid #e5e7eb", color: "#111827" }}
              onFocus={e => (e.currentTarget.style.borderColor = "#a855f7")}
              onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")}
            />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
              {showPw ? (
                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all mt-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          style={{ background: isLoading ? "#9ca3af" : "linear-gradient(135deg, #a855f7, #ec4899)", boxShadow: isLoading ? "none" : "0 4px 15px rgba(168,85,247,0.4)" }}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              {t.login.signingIn}
            </span>
          ) : t.login.signIn}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 font-medium">{t.login.newToProgram}</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Sign up link */}
      <Link href="/signup"
        className="w-full py-3 rounded-xl text-sm font-semibold text-center transition-all cursor-pointer"
        style={{ border: "1.5px solid #a855f7", color: "#a855f7", background: "rgba(168,85,247,0.04)" }}
        onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(168,85,247,0.1)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(168,85,247,0.04)"; }}
      >
        {t.login.createAccount}
      </Link>
    </div>
  );
}
