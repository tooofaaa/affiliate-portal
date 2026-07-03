"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { getCustomerMembership, getMembershipLevels, recalculateMembershipTier } from "@/lib/actions/membership";
import { CustomerMembership, MembershipLevel } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { Button } from "@/components/ui/Button";

export default function MembershipPage() {
  const { t, language } = useLanguage();
  const [membership, setMembership] = useState<CustomerMembership | null>(null);
  const [levels, setLevels] = useState<MembershipLevel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  async function loadData() {
    setIsLoading(true);
    const [memRes, levelsRes] = await Promise.all([
      getCustomerMembership(),
      getMembershipLevels(),
    ]);

    if (memRes.data) setMembership(memRes.data);
    if (levelsRes.data) setLevels(levelsRes.data);
    setIsLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleSyncTier = async () => {
    setIsUpdating(true);
    const res = await recalculateMembershipTier();
    if (res.success) {
      alert(`${t.common.success}! New Tier: ${res.newTier}`);
      await loadData();
    } else {
      alert(`${t.common.failed}: ${res.error}`);
    }
    setIsUpdating(false);
  };

  if (isLoading) {
    return <p className="text-gray-500 py-12 text-center">{t.common.loading}</p>;
  }

  const currentLevel = membership?.level;
  const spent = Number(membership?.total_spent_sar || 0);

  // Find next tier progress
  const nextLevel = levels.find(l => Number(l.min_spent_sar) > spent);
  const percent = nextLevel 
    ? Math.min((spent / Number(nextLevel.min_spent_sar)) * 100, 100) 
    : 100;

  return (
    <div className="flex flex-col gap-8 font-poppins pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-850">{t.membership.title}</h1>
          <p className="text-sm text-slate-500 mt-1">{t.membership.subtitle}</p>
        </div>
        <Button 
          variant="secondary"
          onClick={handleSyncTier} 
          disabled={isUpdating}
          className="cursor-pointer"
        >
          {isUpdating ? t.common.saving : `🔄 ${t.nav.membership}`}
        </Button>
      </div>

      {/* Overview Card */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: "rgba(255,255,255,0.95)",
          border: "1px solid rgba(99,102,241,0.1)",
          boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
        }}
      >
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🏆</span>
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  {currentLevel?.level_name} {t.nav.membership}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {t.profile.verified}: {formatDate(membership?.joined_at || "", language)}
                </p>
              </div>
            </div>
            
            {nextLevel ? (
              <div className="mt-6">
                <div className="flex justify-between text-xs font-semibold text-slate-600 mb-2">
                  <span>{t.membership.tierProgress} ({nextLevel.level_name})</span>
                  <span>{formatCurrency(spent, language)} / {formatCurrency(nextLevel.min_spent_sar, language)}</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  {t.membership.minSpent.replace("{amount}", formatCurrency(Number(nextLevel.min_spent_sar) - spent, language))} -{">"} {nextLevel.level_name}
                </p>
              </div>
            ) : (
              <p className="text-sm font-semibold text-emerald-600 mt-6">✓ {t.common.success}! Platinum Tier</p>
            )}
          </div>

          {/* Active Benefits */}
          <div className="w-full md:w-80 bg-indigo-50/50 rounded-xl p-5 border border-indigo-100/40">
            <h4 className="text-xs font-bold uppercase text-indigo-600 tracking-wider mb-3">{t.membership.tierBenefits}</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              {currentLevel?.benefits.map((b, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-emerald-500">✔</span> {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Levels Grid */}
      <div>
        <h3 className="font-semibold text-base text-slate-800 mb-4">{t.membership.availableTiers}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {levels.map((lvl) => {
            const isActive = lvl.level_name === currentLevel?.level_name;
            return (
              <div
                key={lvl.id}
                className={`rounded-2xl p-5 border flex flex-col justify-between transition-all duration-300 ${
                  isActive ? "ring-2 ring-indigo-500" : ""
                }`}
                style={{
                  background: "rgba(255,255,255,0.95)",
                  borderColor: isActive ? "#6366f1" : "rgba(99,102,241,0.1)",
                  boxShadow: isActive ? "0 8px 30px rgba(99,102,241,0.12)" : "0 2px 20px rgba(0,0,0,0.06)",
                }}
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-bold text-sm text-slate-800">{lvl.level_name}</span>
                    {isActive && (
                      <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full">
                        {t.profile.verified}
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-indigo-600">
                    {t.membership.discountText.replace("{percent}", String(lvl.discount_percentage))}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {t.membership.minSpent.replace("{amount}", formatCurrency(lvl.min_spent_sar, language))}
                  </p>
                  
                  <div className="h-px bg-slate-100 my-4" />
                  
                  <ul className="space-y-2 text-xs text-slate-500">
                    {lvl.benefits.map((b, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-indigo-400 font-semibold">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
