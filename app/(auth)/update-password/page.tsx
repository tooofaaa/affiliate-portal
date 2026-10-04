"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { updatePasswordAction } from "@/lib/actions/auth";
import Link from "next/link";

export default function UpdatePasswordPage() {
  const { t } = useLanguage();
  const l = t.resetPassword;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [hasMinLength, setHasMinLength] = useState(false);
  const [hasUpper, setHasUpper] = useState(false);
  const [hasLower, setHasLower] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [hasSpecial, setHasSpecial] = useState(false);

  useEffect(() => {
    setHasMinLength(password.length >= 8);
    setHasUpper(/[A-Z]/.test(password));
    setHasLower(/[a-z]/.test(password));
    setHasNumber(/\d/.test(password));
    setHasSpecial(/[@$!%*?&]/.test(password));
  }, [password]);

  const strengthScore = [
    hasMinLength,
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial,
  ].filter(Boolean).length;

  const getStrengthColor = () => {
    if (strengthScore <= 2) return "bg-red-500";
    if (strengthScore <= 4) return "bg-amber-500";
    return "bg-emerald-500";
  };

  // The recovery email link carries its one-time token in the URL hash
  // (#access_token=...&type=recovery). The browser client hydrates it from the
  // hash into a cookie session that server actions can see; without a session
  // the link is expired/spent and the user needs a new one.
  const [sessionState, setSessionState] = useState<"checking" | "valid" | "invalid">("checking");
  const supabase = useMemo(() => createClient(), []);
  useEffect(() => {
    // Two ways a valid session reaches this page:
    //  1. URL hash (#access_token=...) from a recovery email link — must be
    //     hydrated via setSession (PKCE clients do not parse fragments).
    //  2. Cookies exchanged by /auth/callback (PKCE code flow).
    // Cookie sessions are the happy path; hash tokens cover direct deep links.
    const resolve = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session) { window.history.replaceState({}, document.title, window.location.pathname); setSessionState("valid"); return; }

        const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const accessToken = hash.get("access_token");
        const refreshToken = hash.get("refresh_token") || "";
        if (!accessToken) { setSessionState("invalid"); return; }

        const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        window.history.replaceState({}, document.title, window.location.pathname);
        setSessionState(error ? "invalid" : "valid");
      } catch {
        setSessionState("invalid");
      }
    };
    resolve();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (password !== confirmPassword) {
      return setErrorMsg(l.errorMismatch);
    }
    if (strengthScore < 5) {
      return setErrorMsg(l.errorWeak);
    }

    setIsLoading(true);
    const res = await updatePasswordAction(password);
    setIsLoading(false);

    if (res.success) {
      setSuccessMsg(l.successMsg);
      setTimeout(() => { window.location.href = "/dashboard"; }, 3000);
    } else {
      setErrorMsg(res.message);
    }
  };

  const router = useRouter();

  if (sessionState === "checking") {
    return <div className="h-10" />;
  }

  if (sessionState === "invalid") {
    return (
      <div className="flex flex-col items-center gap-5 py-6 text-center animate-in fade-in duration-500">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900">{t.authErrors.linkInvalid}</h3>
        <Link href="/forgot-password">
          <Button variant="primary" className="px-6 py-2.5 text-sm">{t.forgotPassword.title}</Button>
        </Link>
      </div>
    );
  }

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
          <>
            <div className="flex flex-col gap-1.5 relative">
              <label className="text-sm font-semibold text-gray-700 ms-1">
                {l.newPassword}
              </label>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-10 text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {password.length > 0 && (
              <div className="flex flex-col gap-1 mt-1">
                <div className="flex justify-between items-center text-[10px] font-semibold text-slate-500">
                  <span>{l.passwordStrength}</span>
                  <span className="uppercase">
                    {strengthScore <= 2 ? "Weak" : strengthScore <= 4 ? "Fair" : "Strong"}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                    style={{ width: `${(strengthScore / 5) * 100}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700 ms-1">
                {l.confirmPassword}
              </label>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
              />
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col gap-2 text-xs">
              <h4 className="font-bold text-slate-700">{l.requirements}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-500 font-medium">
                <p className="flex items-center gap-2">
                  <span className={hasMinLength ? "text-emerald-500" : "text-slate-300"}>
                    {hasMinLength ? "✓" : "○"}
                  </span>
                  {l.reqMinLength}
                </p>
                <p className="flex items-center gap-2">
                  <span className={hasUpper ? "text-emerald-500" : "text-slate-300"}>
                    {hasUpper ? "✓" : "○"}
                  </span>
                  {l.reqUppercase}
                </p>
                <p className="flex items-center gap-2">
                  <span className={hasLower ? "text-emerald-500" : "text-slate-300"}>
                    {hasLower ? "✓" : "○"}
                  </span>
                  {l.reqLowercase}
                </p>
                <p className="flex items-center gap-2">
                  <span className={hasNumber ? "text-emerald-500" : "text-slate-300"}>
                    {hasNumber ? "✓" : "○"}
                  </span>
                  {l.reqNumber}
                </p>
                <p className="flex items-center gap-2">
                  <span className={hasSpecial ? "text-emerald-500" : "text-slate-300"}>
                    {hasSpecial ? "✓" : "○"}
                  </span>
                  {l.reqSpecial}
                </p>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-3.5 mt-2 text-sm shadow-indigo-500/25"
              isLoading={isLoading}
              disabled={strengthScore < 5}
            >
              {l.updatePassword}
            </Button>
          </>
        )}

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-sm text-indigo-600 font-semibold hover:underline cursor-pointer"
          >
            {l.cancel}
          </button>
        </div>
      </form>
    </div>
  );
}