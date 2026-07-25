"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signupAffiliate } from "@/lib/actions/auth";
import Link from "next/link";

const inputStyle = {
  background: "white",
  border: "1.5px solid #e5e7eb",
  color: "#111827",
};

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [channel, setChannel] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [agreed, setAgreed] = useState(false);
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
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "#ef4444", "#f59e0b", "#3b82f6", "#22c55e"][strength];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return setErrorMsg("Passwords do not match.");
    if (!agreed) return setErrorMsg("Please accept the terms to continue.");
    setIsLoading(true);
    setErrorMsg("");
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("password", password);
    formData.append("channel", channel);
    const res = await signupAffiliate(formData);
    setIsLoading(false);
    if (res.success) {
      if ((res as { session?: boolean }).session) {
        router.push("/dashboard");
      } else {
        setSuccess(true);
      }
    } else {
      setErrorMsg(res.message);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center gap-6 text-center animate-in fade-in duration-500">
        <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
          style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)", boxShadow: "0 8px 30px rgba(168,85,247,0.4)" }}>
          ✓
        </div>
        <div>
          <h2 className="text-2xl font-bold" style={{ color: "#1e1b4b" }}>Application Submitted!</h2>
          <p className="text-sm mt-2" style={{ color: "#6b7280" }}>
            Your affiliate account application has been received. We review applications within 24–48 hours.
            You&apos;ll receive an email once your account is approved.
          </p>
        </div>
        <div className="w-full rounded-xl p-4 text-sm text-left flex flex-col gap-2"
          style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.2)" }}>
          <p className="font-semibold" style={{ color: "#7c3aed" }}>What happens next?</p>
          <p style={{ color: "#6b7280" }}>1. Our team reviews your application</p>
          <p style={{ color: "#6b7280" }}>2. You receive an approval email</p>
          <p style={{ color: "#6b7280" }}>3. Log in and start creating links</p>
        </div>
        <Link href="/login"
          className="w-full py-3 rounded-xl text-sm font-semibold text-center text-white"
          style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)" }}>
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-6 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight" style={{ color: "#1e1b4b" }}>
          Join the program
        </h2>
        <p className="text-sm mt-1.5" style={{ color: "#6b7280" }}>
          Apply for an affiliate account and start earning commissions
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

        {/* Name + Phone */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold" style={{ color: "#374151" }}>Full Name *</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)}
              placeholder="Ahmed Ali" className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
              style={inputStyle}
              onFocus={e => (e.currentTarget.style.borderColor = "#a855f7")}
              onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold" style={{ color: "#374151" }}>Phone</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="+966 5x xxx xxxx" className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
              style={inputStyle}
              onFocus={e => (e.currentTarget.style.borderColor = "#a855f7")}
              onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")} />
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold" style={{ color: "#374151" }}>Email address *</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com" className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
            style={inputStyle}
            onFocus={e => (e.currentTarget.style.borderColor = "#a855f7")}
            onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")} />
        </div>

        {/* Channel */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold" style={{ color: "#374151" }}>
            Your Channel / Platform
            <span className="text-xs font-normal ms-1" style={{ color: "#9ca3af" }}>(optional)</span>
          </label>
          <input type="text" value={channel} onChange={e => setChannel(e.target.value)}
            placeholder="e.g. Instagram @handle, YouTube channel, website URL..."
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
            style={inputStyle}
            onFocus={e => (e.currentTarget.style.borderColor = "#a855f7")}
            onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")} />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold" style={{ color: "#374151" }}>Password *</label>
          <div className="relative">
            <input type={showPw ? "text" : "password"} required value={password}
              onChange={e => setPassword(e.target.value)} placeholder="Min 8 characters"
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
          <label className="text-sm font-semibold" style={{ color: "#374151" }}>Confirm Password *</label>
          <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)}
            placeholder="Re-enter password"
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
            style={{ ...inputStyle, borderColor: confirm && confirm !== password ? "#ef4444" : "#e5e7eb" }}
            onFocus={e => (e.currentTarget.style.borderColor = "#a855f7")}
            onBlur={e => (e.currentTarget.style.borderColor = confirm && confirm !== password ? "#ef4444" : "#e5e7eb")} />
          {confirm && confirm !== password && (
            <p className="text-xs text-red-500 mt-0.5">Passwords do not match</p>
          )}
        </div>

        {/* Terms */}
        <label className="flex items-start gap-3 cursor-pointer mt-1">
          <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
            className="mt-0.5 cursor-pointer accent-purple-600" />
          <span className="text-xs leading-relaxed" style={{ color: "#6b7280" }}>
            I agree to the{" "}
            <span className="font-semibold cursor-pointer hover:underline" style={{ color: "#a855f7" }}>Affiliate Terms & Conditions</span>
            {" "}and understand that my account requires admin approval before I can log in.
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
              Submitting application...
            </span>
          ) : "Submit Application"}
        </button>
      </form>

      <p className="text-center text-sm" style={{ color: "#6b7280" }}>
        Already have an account?{" "}
        <Link href="/login" className="font-semibold hover:underline" style={{ color: "#a855f7" }}>
          Sign In
        </Link>
      </p>
    </div>
  );
}
