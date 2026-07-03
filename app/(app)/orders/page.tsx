"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { SearchIcon, FilterIcon } from "@/lib/icons";
import { Button } from "@/components/ui/Button";
import { getMyOrders, getOrderTimeline, requestReturn } from "@/lib/actions/orders";
import { Order } from "@/lib/types";

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  Pending: { bg: "rgba(245,158,11,0.1)", color: "#d97706" },
  Processing: { bg: "rgba(59,130,246,0.1)", color: "#2563eb" },
  Allocated: { bg: "rgba(16,185,129,0.1)", color: "#059669" },
  Picking: { bg: "rgba(139,92,246,0.1)", color: "#8b5cf6" },
  Packing: { bg: "rgba(236,72,153,0.1)", color: "#db2777" },
  Shipped: { bg: "rgba(99,102,241,0.1)", color: "#6366f1" },
  Delivered: { bg: "rgba(16,185,129,0.15)", color: "#059669" },
  ReturnRequest: { bg: "rgba(239,68,68,0.1)", color: "#dc2626" },
  Returned: { bg: "rgba(100,116,139,0.1)", color: "#475569" },
};

const FILTERS = ["All", "Pending", "Processing", "Shipped", "Delivered"];

const TIMELINE_STEPS = ["Pending", "Processing", "Allocated", "Picking", "Packing", "Shipped", "Delivered"];

export default function OrdersPage() {
  const { t, language } = useLanguage();
  const [filter, setFilter] = useState("All");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [isLoadingTimeline, setIsLoadingTimeline] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

  async function loadOrders() {
    setIsLoading(true);
    const res = await getMyOrders();
    if (res.data) {
      setOrders(res.data);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    loadOrders();
  }, []);

  const handleOrderClick = async (order: Order) => {
    if (selectedOrder?.id === order.id) {
      setSelectedOrder(null);
      setTimeline([]);
      return;
    }
    setSelectedOrder(order);
    setIsLoadingTimeline(true);
    const res = await getOrderTimeline(order.id);
    if (res.data) {
      setTimeline(res.data);
    }
    setIsLoadingTimeline(false);
  };

  const handleReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !returnReason.trim()) return;

    setIsSubmittingReturn(true);
    const res = await requestReturn(selectedOrder.id, returnReason);
    if (res.success) {
      alert(language === "ar" ? "تم إرسال طلب الإرجاع بنجاح!" : "Return request submitted successfully!");
      setReturnReason("");
      setSelectedOrder(null);
      await loadOrders();
    } else {
      alert((language === "ar" ? "فشل الإرجاع: " : "Return failed: ") + res.error);
    }
    setIsSubmittingReturn(false);
  };

  const filteredOrders = filter === "All"
    ? orders
    : orders.filter(o => o.status === filter);

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#0f172a" }}>
            {t.nav.orders}
          </h1>
          <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
            {t.orders.subtitle}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t.orders.searchPlaceholder}
              className="pl-9 pr-4 py-2 rounded-xl text-sm w-full md:w-64 transition-all"
              style={{
                background: "rgba(255,255,255,0.8)",
                border: "1px solid rgba(99,102,241,0.2)",
                outline: "none",
              }}
            />
          </div>
          <Button variant="secondary" className="px-3">
            <FilterIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {FILTERS.map((f) => {
          const isActive = filter === f;
          const label = f === "All" ? t.orders.filterAll : (t.orders.statusMap[f as keyof typeof t.orders.statusMap] || f);
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap cursor-pointer"
              style={
                isActive
                  ? {
                      background: "linear-gradient(135deg, #6366f1, #818cf8)",
                      color: "white",
                      boxShadow: "0 4px 15px rgba(99,102,241,0.35)",
                    }
                  : {
                      background: "rgba(255,255,255,0.8)",
                      color: "#64748b",
                      border: "1px solid rgba(99,102,241,0.15)",
                    }
              }
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders Table */}
        <div
          className="lg:col-span-2 rounded-2xl overflow-hidden self-start bg-white"
          style={{
            border: "1px solid rgba(99,102,241,0.1)",
            boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "rgba(248,249,252,0.8)" }}>
                  {[t.orders.poCode, t.orders.supplier, t.orders.itemsHeader, t.orders.status, t.orders.totalCost].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-4 text-start text-xs font-semibold uppercase tracking-widest whitespace-nowrap"
                      style={{ color: "#94a3b8" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                      {t.orders.loading}
                    </td>
                  </tr>
                ) : filteredOrders.length > 0 ? (
                  filteredOrders.map((order, i) => {
                    const style = STATUS_STYLES[order.status] ?? { bg: "#f1f5f9", color: "#64748b" };
                    const itemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
                    const isSelected = selectedOrder?.id === order.id;
                    const statusLabel = t.orders.statusMap[order.status as keyof typeof t.orders.statusMap] || order.status;
                    
                    return (
                      <tr
                        key={order.id}
                        onClick={() => handleOrderClick(order)}
                        className={`group transition-colors hover:bg-indigo-50/30 cursor-pointer ${
                          isSelected ? "bg-indigo-50/50" : ""
                        }`}
                        style={{
                          borderTop: i > 0 ? "1px solid rgba(99,102,241,0.06)" : undefined,
                        }}
                      >
                        <td className="px-6 py-4">
                          <div className="font-mono font-semibold text-xs text-indigo-600">
                            {order.poCode}
                          </div>
                          <div className="text-[10px] text-gray-400 mt-1">
                            {formatDate(order.createdAt, false, language)}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-800">
                          {order.supplierName}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs text-slate-600 font-medium">
                            {t.orders.units.replace('{count}', String(itemsCount))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className="px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
                            style={{ background: style.bg, color: style.color }}
                          >
                            {statusLabel}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-850">
                          {formatCurrency(order.totalCost, language)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                      {t.orders.noOrdersFound}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Order Detailed Timeline and Return */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {selectedOrder ? (
            <>
              {/* Order Detail & Timeline */}
              <div
                className="rounded-2xl p-6 bg-white"
                style={{
                  border: "1px solid rgba(99,102,241,0.1)",
                  boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
                }}
              >
                <h3 className="font-bold text-sm text-slate-800 mb-4 border-b border-gray-100 pb-3 flex justify-between items-center">
                  <span>{t.orders.orderTitle.replace('{code}', selectedOrder.poCode)}</span>
                  <button onClick={() => setSelectedOrder(null)} className="text-xs text-indigo-500 font-medium hover:underline cursor-pointer">{t.orders.close}</button>
                </h3>

                <p className="text-xs text-slate-500 mb-6">{t.orders.supplierLabel} <span className="font-semibold text-slate-700">{selectedOrder.supplierName}</span></p>

                {/* State Machine Steps Visualizer */}
                <h4 className="text-xs font-bold uppercase text-indigo-600 tracking-wider mb-4">{t.orders.trackProgress}</h4>
                <div className="relative pl-6 border-l border-gray-100 flex flex-col gap-5">
                  {TIMELINE_STEPS.map((step) => {
                    const currentIndex = TIMELINE_STEPS.indexOf(selectedOrder.status);
                    const stepIndex = TIMELINE_STEPS.indexOf(step);
                    const isCompleted = stepIndex <= currentIndex;
                    const isActive = step === selectedOrder.status;
                    const stepLabel = t.orders.statusMap[step as keyof typeof t.orders.statusMap] || step;

                    return (
                      <div key={step} className="relative flex items-center gap-3">
                        {/* Dot indicator */}
                        <div 
                          className={`absolute -left-[30px] w-3 h-3 rounded-full border-2 ${
                            isActive ? "bg-indigo-600 border-indigo-600 scale-125 shadow shadow-indigo-300" :
                            isCompleted ? "bg-emerald-500 border-emerald-500" : "bg-white border-gray-200"
                          }`}
                        />
                        <span className={`text-xs font-semibold ${
                          isActive ? "text-indigo-600" :
                          isCompleted ? "text-slate-800" : "text-slate-400"
                        }`}>
                          {stepLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Return Request Flow */}
              {selectedOrder.status === "Delivered" && (
                <div
                  className="rounded-2xl p-6 bg-white"
                  style={{
                    border: "1px solid rgba(239,68,68,0.15)",
                    boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
                  }}
                >
                  <h3 className="font-bold text-sm text-rose-600 mb-4">{t.orders.returnItems}</h3>
                  <form onSubmit={handleReturn} className="flex flex-col gap-3">
                    <textarea
                      placeholder={t.orders.returnReasonPlaceholder}
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-indigo-500 h-20"
                      required
                    />
                    <Button 
                      type="submit" 
                      variant="primary" 
                      disabled={isSubmittingReturn}
                      className="bg-rose-600 hover:bg-rose-700 w-full justify-center cursor-pointer"
                    >
                      {isSubmittingReturn ? t.orders.submitting : t.orders.submitReturn}
                    </Button>
                  </form>
                </div>
              )}
            </>
          ) : (
            <div className="p-8 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-2xl bg-slate-50/50">
              {t.orders.selectOrderPlaceholder}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
