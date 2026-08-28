"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signupAffiliate } from "@/lib/actions/auth";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const inputStyle = {
  background: "white",
  border: "1.5px solid #e5e7eb",
  color: "#111827",
};

export default function SignupPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [termsContent, setTermsContent] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const pwStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };
  const strength = pwStrength(password);
  const strengthLabel = ["", t.signup.weak, t.signup.fair, t.signup.good, t.signup.strong][strength];
  const strengthColor = ["", "#ef4444", "#f59e0b", "#3b82f6", "#22c55e"][strength];

  const loadTerms = async () => {
    try {
      const res = await fetch("/api/terms?portal=affiliate");
      if (res.ok) {
        const data = await res.json();
        setTermsContent(data.content_html || data.content_text || "");
      }
    } catch {}
    setShowTerms(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return setErrorMsg(t.resetPassword.errorMismatch);
    if (!agreed) return setErrorMsg(t.signup.agreeToTerms);
    setIsLoading(true);
    setErrorMsg("");
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("accept_terms", "true");
    const res = await signupAffiliate(formData);
    setIsLoading(false);
    if (res.success) {
      setSuccess(true);
    } else {
      setErrorMsg(res.message ?? "An error occurred. Please try again.");
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center gap-6 text-center animate-in fade-in duration-500">
        <div className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)", boxShadow: "0 8px 30px rgba(168,85,247,0.4)" }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold" style={{ color: "#1e1b4b" }}>{t.signup.successTitle}</h2>
          <p className="text-sm mt-2" style={{ color: "#6b7280" }}>
            {t.signup.pendingMessage}
          </p>
        </div>
        <div className="w-full rounded-xl p-4 text-sm text-left flex flex-col gap-2"
          style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.2)" }}>
          <p className="font-semibold" style={{ color: "#7c3aed" }}>{t.signup.whatsNextTitle}</p>
          <p style={{ color: "#6b7280" }}>{t.signup.whatsNext1}</p>
          <p style={{ color: "#6b7280" }}>{t.signup.whatsNext2}</p>
          <p style={{ color: "#6b7280" }}>{t.signup.whatsNext3}</p>
        </div>
        <Link href="/login"
          className="w-full py-3 rounded-xl text-sm font-semibold text-center text-white"
          style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)" }}>
          {t.login.signIn}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-6 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight" style={{ color: "#1e1b4b" }}>
          {t.signup.title}
        </h2>
        <p className="text-sm mt-1.5" style={{ color: "#6b7280" }}>
          {t.signup.subtitle}
        </p>
      </div>

      {errorMsg && (
        <div className="flex items-start gap-3 bg-red-50 text-red-700 text-sm p-3.5 rounded-xl border border-red-100">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
          </svg>
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold" style={{ color: "#374151" }}>{t.signup.name} *</label>
          <input type="text" required value={name} onChange={e => setName(e.target.value)}
            placeholder={t.signup.namePlaceholder} className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
            style={inputStyle}
            onFocus={e => (e.currentTarget.style.borderColor = "#a855f7")}
            onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")} />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold" style={{ color: "#374151" }}>{t.signup.email} *</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
            placeholder={t.signup.emailPlaceholder} className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
            style={inputStyle}
            onFocus={e => (e.currentTarget.style.borderColor = "#a855f7")}
            onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")} />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold" style={{ color: "#374151" }}>{t.signup.password} *</label>
          <div className="relative">
            <input type={showPw ? "text" : "password"} required value={password}
              onChange={e => setPassword(e.target.value)} placeholder={t.signup.passwordPlaceholder}
              className="w-full px-4 py-3 pe-12 rounded-xl text-sm outline-none transition-all"
              style={inputStyle}
              onFocus={e => (e.currentTarget.style.borderColor = "#a855f7")}
              onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")} />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                {showPw
                  ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
                  : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                }
              </svg>
            </button>
          </div>
          {password.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex gap-1 flex-1">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-1 flex-1 rounded-full transition-all"
                    style={{ background: i <= strength ? strengthColor : "#e5e7eb" }} />
                ))}
              </div>
              <span className="text-xs font-medium" style={{ color: strengthColor }}>{strengthLabel}</span>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold" style={{ color: "#374151" }}>{t.signup.confirmPassword} *</label>
          <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)}
            placeholder={t.signup.confirmPasswordPlaceholder}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
            style={{ ...inputStyle, borderColor: confirm && confirm !== password ? "#ef4444" : "#e5e7eb" }}
            onFocus={e => (e.currentTarget.style.borderColor = "#a855f7")}
            onBlur={e => (e.currentTarget.style.borderColor = confirm && confirm !== password ? "#ef4444" : "#e5e7eb")} />
          {confirm && confirm !== password && (
            <p className="text-xs text-red-500 mt-0.5">{t.resetPassword.errorMismatch}</p>
          )}
        </div>

        {/* Terms */}
        <label className="flex items-start gap-3 cursor-pointer mt-1">
          <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
            className="mt-0.5 cursor-pointer accent-purple-600" />
          <span className="text-xs leading-relaxed" style={{ color: "#6b7280" }}>
            {t.signup.agreePrefix}{" "}
            <button type="button" onClick={loadTerms}
              className="font-semibold hover:underline cursor-pointer" style={{ color: "#a855f7" }}>
              {t.signup.termsLink}
            </button>
            {" "}{t.signup.agreeSuffix}
          </span>
        </label>

        {/* Submit */}
        <button type="submit" disabled={isLoading || !agreed}
          className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all mt-1 cursor-pointer disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)", boxShadow: "0 4px 15px rgba(168,85,247,0.35)" }}>
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              {t.signup.signingUp}
            </span>
          ) : t.signup.signUp}
        </button>
      </form>

      <p className="text-center text-sm" style={{ color: "#6b7280" }}>
        {t.signup.alreadyHaveAccount}{" "}
        <Link href="/login" className="font-semibold hover:underline" style={{ color: "#a855f7" }}>
          {t.login.signIn}
        </Link>
      </p>

      {/* Terms Modal */}
      {showTerms && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="font-bold text-lg" style={{ color: "#1e1b4b" }}>{t.signup.termsLink}</h3>
              <button onClick={() => setShowTerms(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <div className="overflow-y-auto px-6 py-4 text-sm text-gray-700 leading-relaxed flex-1"
              dangerouslySetInnerHTML={{ __html: termsContent || "<p>Loading terms...</p>" }} />
            <div className="px-6 py-4 border-t flex gap-3">
              <button onClick={() => { setAgreed(true); setShowTerms(false); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)" }}>
                I Accept
              </button>
              <button onClick={() => setShowTerms(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
