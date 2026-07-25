"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface Affiliate {
  id: number;
  name: string;
  email: string;
  status: string;
  commission_pct: number;
}

interface AffiliateContextType {
  affiliateId: number | null;
  affiliate: Affiliate | null;
  loading: boolean;
  refresh: () => void;
}

const AffiliateContext = createContext<AffiliateContextType | undefined>(undefined);

export function AffiliateProvider({ children }: { children: React.ReactNode }) {
  const [affiliateId, setAffiliateId] = useState<number | null>(null);
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const refresh = () => setTick((v) => v + 1);

  useEffect(() => {
    let active = true;

    async function fetchAffiliate() {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !active) {
          setLoading(false);
          return;
        }

        const { data } = await supabase
          .from("affiliates")
          .select("id, name, email, status, commission_pct")
          .eq("portal_user_id", user.id)
          .maybeSingle();

        if (active && data) {
          setAffiliate(data as Affiliate);
          setAffiliateId(data.id);
        }
      } catch {
        // silently fail
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchAffiliate();

    return () => {
      active = false;
    };
  }, [tick]);

  return (
    <AffiliateContext.Provider value={{ affiliateId, affiliate, loading, refresh }}>
      {children}
    </AffiliateContext.Provider>
  );
}

export function useAffiliate() {
  const context = useContext(AffiliateContext);
  if (!context) throw new Error("useAffiliate must be used within AffiliateProvider");
  return context;
}
