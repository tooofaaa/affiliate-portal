"use client";

import { useEffect, useState } from "react";
import { getWarehouseStorage, requestWarehouseStorage } from "@/lib/actions/warehouse";
import { WarehouseStorage } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function WarehousePage() {
  const { t, language } = useLanguage();
  const [storage, setStorage] = useState<WarehouseStorage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [spaceRequest, setSpaceRequest] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadStorage() {
    setIsLoading(true);
    const res = await getWarehouseStorage();
    if (res.data) setStorage(res.data);
    setIsLoading(false);
  }

  useEffect(() => {
    loadStorage();
  }, []);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const space = parseFloat(spaceRequest);
    if (isNaN(space) || space <= 0) {
      alert(t.wallet.invalidAmount);
      return;
    }

    setIsSubmitting(true);
    const res = await requestWarehouseStorage(space, notes);
    if (res.success) {
      alert(t.common.success);
      setSpaceRequest("");
      setNotes("");
      await loadStorage();
    } else {
      alert(`${t.common.failed}: ${res.error}`);
    }
    setIsSubmitting(false);
  };

  if (isLoading) {
    return <p className="text-gray-500 py-12 text-center">{t.common.loading}</p>;
  }

  const activeReservations = storage.filter(s => s.status === "Approved");
  const totalAllocated = activeReservations.reduce((sum, s) => sum + Number(s.space_m3), 0);

  return (
    <div className="flex flex-col gap-8 font-poppins pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-850">{t.warehouse.title}</h1>
        <p className="text-sm text-slate-500 mt-1">{t.warehouse.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Capacity Visualizer & Storage Request Form */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          {/* Capacity Usage Card */}
          <div
            className="rounded-2xl p-6"
            style={{
              background: "rgba(255,255,255,0.95)",
              border: "1px solid rgba(99,102,241,0.1)",
              boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
            }}
          >
            <h3 className="font-semibold text-sm text-slate-800 mb-4">{t.warehouse.activeReservations}</h3>
            <div className="flex flex-col items-center justify-center py-4">
              <span className="text-4xl">📦</span>
              <h2 className="text-2xl font-bold text-slate-850 mt-3">{totalAllocated.toFixed(1)} m³</h2>
              <p className="text-xs text-slate-400 mt-1">{t.warehouse.space}</p>
            </div>
          </div>

          {/* Request Storage Form */}
          <div
            className="rounded-2xl p-6"
            style={{
              background: "rgba(255,255,255,0.95)",
              border: "1px solid rgba(99,102,241,0.1)",
              boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
            }}
          >
            <h3 className="font-semibold text-sm text-slate-800 mb-4">{t.warehouse.requestSpace}</h3>
            <form onSubmit={handleRequest} className="flex flex-col gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">{t.warehouse.requestedSpace}</label>
                <input
                  type="number"
                  placeholder="e.g. 5.5..."
                  value={spaceRequest}
                  onChange={(e) => setSpaceRequest(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">{t.profile.documents}</label>
                <textarea
                  placeholder={t.warehouse.notes}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500 h-20"
                />
              </div>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full justify-center cursor-pointer"
              >
                {isSubmitting ? t.common.saving : t.warehouse.submitRequest}
              </Button>
            </form>
          </div>
        </div>

        {/* Right: Storage Allocation Requests History */}
        <div
          className="lg:col-span-2 rounded-2xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.95)",
            border: "1px solid rgba(99,102,241,0.1)",
            boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
          }}
        >
          <div
            className="px-6 py-4"
            style={{ borderBottom: "1px solid rgba(99,102,241,0.08)" }}
          >
            <h3 className="font-semibold text-base text-slate-800">{t.warehouse.activeReservations}</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "rgba(248,249,252,0.8)" }}>
                  {[t.warehouse.startDate, t.warehouse.space, t.warehouse.cost, t.warehouse.status, t.warehouse.endDate].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-widest"
                      style={{ color: "#94a3b8" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {storage.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      {t.warehouse.noReservations}
                    </td>
                  </tr>
                ) : (
                  storage.map((s) => {
                    const isApproved = s.status === "Approved";
                    const statusKey = s.status ? s.status.toLowerCase() : "";
                    const localizedStatus = (t.warehouse as Record<string, string>)[statusKey] || s.status;
                    return (
                      <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-slate-600 text-xs">{formatDate(s.start_date, language)}</td>
                        <td className="px-6 py-4 font-mono font-semibold text-slate-800">{s.space_m3} m³</td>
                        <td className="px-6 py-4 font-semibold text-slate-800">{formatCurrency(Number(s.cost_per_period), language)}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isApproved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {localizedStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 text-xs">{s.period}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
