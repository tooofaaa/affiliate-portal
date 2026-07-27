"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Button } from "@/components/ui/Button";

export default function SettingsPage() {
  const { t } = useLanguage();
  const router = useRouter();

  return (
    <div className="flex flex-col gap-6 max-w-4xl pb-10">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#0f172a" }}>
          {t.nav.settings}
        </h1>
        <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
          {t.settingsPage.subtitle}
        </p>
      </div>

      <div
        className="rounded-2xl p-6 bg-white"
        style={{
          border: "1px solid rgba(99,102,241,0.1)",
          boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
        }}
      >
        <h3 className="font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">{t.settingsPage.notifications}</h3>
        
        <div className="flex flex-col gap-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="mt-1 accent-indigo-500 w-4 h-4 rounded" />
            <div>
              <p className="text-sm font-semibold text-gray-900">{t.settingsPage.orderUpdates}</p>
              <p className="text-xs text-gray-500">{t.settingsPage.orderUpdatesDesc}</p>
            </div>
          </label>
          
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="mt-1 accent-indigo-500 w-4 h-4 rounded" />
            <div>
              <p className="text-sm font-semibold text-gray-900">{t.settingsPage.promotions}</p>
              <p className="text-xs text-gray-500">{t.settingsPage.promotionsDesc}</p>
            </div>
          </label>
          
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" className="mt-1 accent-indigo-500 w-4 h-4 rounded" />
            <div>
              <p className="text-sm font-semibold text-gray-900">{t.settingsPage.weeklySummary}</p>
              <p className="text-xs text-gray-500">{t.settingsPage.weeklySummaryDesc}</p>
            </div>
          </label>
        </div>

        <h3 className="font-bold text-gray-900 mt-8 mb-6 border-b border-gray-100 pb-4">{t.settingsPage.security}</h3>
        
        <div className="flex items-center justify-between py-2 border-b border-gray-50">
          <div>
            <p className="text-sm font-semibold text-gray-900">{t.settingsPage.password}</p>
            <p className="text-xs text-gray-500">{t.settingsPage.passwordLastChanged}</p>
          </div>
          <Button
            variant="secondary"
            className="text-xs px-3 py-1.5 cursor-pointer"
            onClick={() => router.push("/forgot-password")}
          >
            {t.settingsPage.changePassword}
          </Button>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-gray-50 mt-2">
          <div>
            <p className="text-sm font-semibold text-gray-900">{t.settingsPage.tfa}</p>
            <p className="text-xs text-gray-500">{t.settingsPage.tfaDesc}</p>
          </div>
          <Button variant="secondary" className="text-xs px-3 py-1.5 cursor-pointer">{t.settingsPage.enableTfa}</Button>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <Button variant="ghost" className="cursor-pointer">{t.settingsPage.resetDefaults}</Button>
          <Button variant="primary" className="cursor-pointer">{t.settingsPage.savePreferences}</Button>
        </div>
      </div>
    </div>
  );
}
