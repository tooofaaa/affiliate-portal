"use server";

import { createClientServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface AffiliateProfile {
  id: number;
  portal_user_id: string;
  name: string;
  email: string;
  contact_number: string | null;
  status: string;
  commission_pct: number;
  enterprise_unique_id: string | null;
  created_at: string;
}

export async function getAffiliateProfile(): Promise<{ data: AffiliateProfile | null; error: string | null }> {
  const supabase = await createClientServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { data: null, error: "Unauthorized" };

  const { data, error } = await supabase
    .from("affiliates")
    .select("id, portal_user_id, name, email, contact_number, status, commission_pct, enterprise_unique_id, created_at")
    .eq("portal_user_id", user.id)
    .maybeSingle();

  if (error) {
    return { data: null, error: error.message };
  }

  if (!data) {
    return { data: null, error: "Affiliate profile not found." };
  }

  return { data: data as AffiliateProfile, error: null };
}

export async function updateAffiliateProfile(payload: {
  name?: string;
  contact_number?: string;
}): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClientServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  const updates: Record<string, string> = {};
  if (payload.name !== undefined) updates.name = payload.name;
  if (payload.contact_number !== undefined) updates.contact_number = payload.contact_number;

  const { error } = await supabase
    .from("affiliates")
    .update(updates)
    .eq("portal_user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/profile");
  return { success: true, error: null };
}
