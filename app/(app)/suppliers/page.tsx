"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { SearchIcon, FilterIcon, StoreIcon } from "@/lib/icons";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Supplier } from "@/lib/types";

interface DBSupplier {
  id: number;
  supplier_name: string;
  supplier_name_ar: string | null;
  description: string | null;
  description_ar: string | null;
  logo_url: string | null;
  categories: string[] | null;
  rating: number | null;
  delivery_time: string | null;
  address: string | null;
}

export default function SuppliersPage() {
  const { t, language } = useLanguage();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function loadSuppliers() {
      setIsLoading(true);
      console.log('Fetching suppliers from Supabase...');
      const { data, error } = await supabase.from('suppliers').select('id, enterprise_unique_id, supplier_name, logo_url, categories, status').eq('status', 'Approved');

      if (error) {
        console.error('Error fetching suppliers:', error);
      } else {
        console.log('Suppliers fetched successfully:', data);
        const mapped = (data as any[]).map((s) => ({
          id: s.id,
          name: s.enterprise_unique_id || `Provider #${s.id}`,
          description: t.supplierDetail.trustedSupplier,
          logoUrl: "",
          categories: s.categories || ["General"],
          rating: 5.0,
          deliveryTime: "",
          location: ""
        })) as Supplier[];
        setSuppliers(mapped);
      }
      setIsLoading(false);
    }
    
    loadSuppliers();

    const channel = supabase
      .channel("suppliers-portal-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "suppliers" },
        () => {
          loadSuppliers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [language, t]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#0f172a" }}>
            {t.nav.suppliers}
          </h1>
          <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
            {t.suppliersPage.subtitle}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t.suppliersPage.searchPlaceholder}
              className="pl-9 pr-4 py-2 rounded-xl text-sm w-full md:w-64 transition-all"
              style={{
                background: "rgba(255,255,255,0.8)",
                border: "1px solid rgba(99,102,241,0.2)",
                outline: "none",
              }}
              onFocus={(e) => {
                e.target.style.boxShadow = "0 0 0 2px rgba(99,102,241,0.2)";
                e.target.style.borderColor = "#6366f1";
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = "none";
                e.target.style.borderColor = "rgba(99,102,241,0.2)";
              }}
            />
          </div>
          <Button variant="secondary" className="px-3">
            <FilterIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <p className="text-gray-500">{t.suppliersPage.loading}</p>
        </div>
      ) : suppliers.length === 0 ? (
        <div className="flex justify-center py-12">
          <p className="text-gray-500">{t.suppliersPage.noSuppliers}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {suppliers.map((supplier) => (
            <Link
              href={`/suppliers/${supplier.id}`}
              key={supplier.id}
              className="flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 cursor-pointer group block"
              style={{
                background: "rgba(255,255,255,0.95)",
                border: "1px solid rgba(99,102,241,0.1)",
                boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                  "0 8px 30px rgba(99,102,241,0.15)";
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(99,102,241,0.3)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                  "0 2px 20px rgba(0,0,0,0.06)";
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(99,102,241,0.1)";
              }}
            >
              <div className="p-5 flex gap-4">
                <div
                  className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0"
                  style={{ border: "1px solid rgba(0,0,0,0.05)", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  {supplier.logoUrl ? (
                    <img src={supplier.logoUrl} alt={supplier.name} className="w-full h-full object-cover" />
                  ) : (
                    <StoreIcon className="w-8 h-8 text-indigo-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-base truncate pr-2" style={{ color: "#0f172a" }}>
                      {supplier.name}
                    </h3>
                    <div className="flex items-center gap-1 text-xs font-semibold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md">
                      Code: {supplier.name}
                    </div>
                  </div>
                  <p className="text-xs mt-2 flex items-center gap-1.5" style={{ color: "#64748b" }}>
                    <svg className="w-3.5 h-3.5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Verified Provider
                  </p>
                </div>
              </div>

              <div className="px-5 pb-4">
                <p className="text-sm line-clamp-2 leading-relaxed" style={{ color: "#475569" }}>
                  {supplier.description}
                </p>
              </div>

              <div
                className="mt-auto px-5 py-3 flex items-center gap-2 overflow-x-auto"
                style={{ background: "rgba(248,249,252,0.8)", borderTop: "1px solid rgba(99,102,241,0.05)" }}
              >
                {supplier.categories.map((cat) => (
                  <span
                    key={cat}
                    className="px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap"
                    style={{ background: "#ffffff", color: "#6366f1", border: "1px solid rgba(99,102,241,0.15)" }}
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
