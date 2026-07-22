"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Button } from "@/components/ui/Button";
import { updatePasswordAction } from "@/lib/actions/auth";

export default function ResetPasswordPage() {
  const { t, language } = useLanguage();
  const l = t.resetPassword;
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Complexity states
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

  // Calculate strength percentage
  const strengthScore = [hasMinLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
  
  const getStrengthLabel = () => {
    if (password.length === 0) return "";
    if (strengthScore <= 2) return language === "ar" ? "ضعيفة" : "Weak";
    if (strengthScore <= 4) return language === "ar" ? "متوسطة" : "Fair";
    return language === "ar" ? "قوية" : "Strong";
  };

  const getStrengthColor = () => {
    if (strengthScore <= 2) return "bg-red-500";
    if (strengthScore <= 4) return "bg-amber-500";
    return "bg-emerald-500";
  };

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
      setTimeout(() => {
        router.push("/login");
      }, 3000);
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

            {/* Strength meter bar */}
            {password.length > 0 && (
              <div className="flex flex-col gap-1 mt-1">
                <div className="flex justify-between items-center text-[10px] font-semibold text-slate-500">
                  <span>{l.passwordStrength}</span>
                  <span className="uppercase">{getStrengthLabel()}</span>
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

            {/* Password requirements checker */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col gap-2 text-xs">
              <h4 className="font-bold text-slate-700">{l.requirements}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-500 font-medium">
                <p className="flex items-center gap-2">
                  <span className={hasMinLength ? "text-emerald-500" : "text-slate-350"}>
                    {hasMinLength ? "✓" : "○"}
                  </span>
                  {l.reqMinLength}
                </p>
                <p className="flex items-center gap-2">
                  <span className={hasUpper ? "text-emerald-500" : "text-slate-350"}>
                    {hasUpper ? "✓" : "○"}
                  </span>
                  {l.reqUppercase}
                </p>
                <p className="flex items-center gap-2">
                  <span className={hasLower ? "text-emerald-500" : "text-slate-350"}>
                    {hasLower ? "✓" : "○"}
                  </span>
                  {l.reqLowercase}
                </p>
                <p className="flex items-center gap-2">
                  <span className={hasNumber ? "text-emerald-500" : "text-slate-350"}>
                    {hasNumber ? "✓" : "○"}
                  </span>
                  {l.reqNumber}
                </p>
                <p className="flex items-center gap-2">
                  <span className={hasSpecial ? "text-emerald-500" : "text-slate-350"}>
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
