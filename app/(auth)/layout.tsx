"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { t, isRTL } = useLanguage();

  return (
    <div className="flex min-h-screen bg-white" dir={isRTL ? "rtl" : "ltr"}>

      {/* Left Panel — Affiliate branding */}
      <div
        className="hidden lg:flex w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0f1117 0%, #1a0a2e 50%, #0f1117 100%)" }}
      >
        {/* Grid bg */}
        <div className="absolute inset-0 z-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(168,85,247,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(168,85,247,0.3) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }} />
        {/* Purple glow */}
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-purple-600/25 rounded-full blur-[120px] z-0 pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-pink-600/20 rounded-full blur-[100px] z-0 pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="p-3 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)", boxShadow: "0 4px 20px rgba(168,85,247,0.5)" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
          </div>
          <div>
            <h1 className="text-white text-xl font-bold tracking-wide">SP Affiliate</h1>
            <p className="text-sm font-medium" style={{ color: "#c084fc" }}>Earn with every referral</p>
          </div>
        </div>

        {/* Hero */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
            style={{ background: "rgba(168,85,247,0.15)", color: "#c084fc", border: "1px solid rgba(168,85,247,0.3)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            Commission Program
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Turn your audience<br />
            <span className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(90deg, #c084fc, #f472b6)" }}>
              into income
            </span>
          </h2>
          <p className="text-gray-400 text-base mb-10 leading-relaxed">
            Share products, earn commissions, and track everything in real time.
          </p>

          {/* Feature list */}
          <div className="flex flex-col gap-5">
            {[
              { icon: "🔗", title: "Trackable Links", desc: "Create unique links — every click and conversion tracked live." },
              { icon: "🏷️", title: "Discount Codes", desc: "Give your audience exclusive discounts, you earn the margin." },
              { icon: "💸", title: "Instant Earnings", desc: "Commissions credited automatically on every confirmed delivery." },
              { icon: "📊", title: "Performance Dashboard", desc: "See exactly what's working with real-time analytics." },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.2)" }}>
                  {f.icon}
                </div>
                <div>
                  <h3 className="text-white font-semibold">{f.title}</h3>
                  <p className="text-gray-400 text-sm mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { value: "5–25%", label: "Commission Rate" },
            { value: "15d", label: "Withdrawal SLA" },
            { value: "24/7", label: "Live Tracking" },
          ].map((s, i) => (
            <div key={i} className="rounded-xl p-3 text-center"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(168,85,247,0.15)" }}>
              <p className="text-white font-bold text-lg">{s.value}</p>
              <p className="text-gray-500 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16"
        style={{ background: "#f5f3ff" }}>
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center gap-3 mb-10 text-center">
            <div className="p-3.5 rounded-2xl"
              style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)", boxShadow: "0 4px 20px rgba(168,85,247,0.4)" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">SP Affiliate</h1>
              <p className="text-purple-600 text-sm font-medium">Earn with every referral</p>
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
