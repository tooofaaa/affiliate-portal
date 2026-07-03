"use server";

import { createClientServer } from "@/lib/supabase/server";
import { CustomerProfile, CustomerBranch, CustomerDocument } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function getCustomerProfile(): Promise<{ data: CustomerProfile | null; error: string | null }> {
  const supabase = await createClientServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { data: null, error: "Unauthorized" };

  let { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("portal_user_id", user.id)
    .maybeSingle();

  if (error) {
    return { data: null, error: error.message };
  }

  // Auto-provision profile on first access
  if (!data) {
    const { data: newProfile, error: insertError } = await supabase
      .from("customers")
      .insert({
        portal_user_id: user.id,
        company_name: user.user_metadata?.company_name || user.email?.split("@")[0] || "New Company",
        contact_email: user.email,
        is_verified: false,
      })
      .select("*")
      .single();

    if (insertError) {
      return { data: null, error: insertError.message };
    }
    data = newProfile;
  }

  return { data: data as CustomerProfile, error: null };
}

export async function updateCustomerProfile(payload: Partial<CustomerProfile>): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClientServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  const { error } = await supabase
    .from("customers")
    .update({
      company_name: payload.company_name,
      tax_number: payload.tax_number,
      commercial_register: payload.commercial_register,
      contact_phone: payload.contact_phone,
      website: payload.website,
      updated_at: new Date().toISOString(),
    })
    .eq("portal_user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/profile");

  return { success: true, error: null };
}

export async function getCustomerBranches(): Promise<{ data: CustomerBranch[]; error: string | null }> {
  const supabase = await createClientServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { data: [], error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("customers")
    .select("id")
    .eq("portal_user_id", user.id)
    .maybeSingle();

  if (!profile) return { data: [], error: "Profile not found" };

  const { data, error } = await supabase
    .from("customer_branches")
    .select("*")
    .eq("customer_id", profile.id)
    .order("created_at", { ascending: true });

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: data || [], error: null };
}

export async function addCustomerBranch(branch: Omit<CustomerBranch, "id" | "customer_id">): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClientServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("customers")
    .select("id")
    .eq("portal_user_id", user.id)
    .maybeSingle();

  if (!profile) return { success: false, error: "Profile not found" };

  const { error } = await supabase.from("customer_branches").insert({
    customer_id: profile.id,
    branch_name: branch.branch_name,
    address: branch.address,
    city: branch.city,
    country: branch.country || "Saudi Arabia",
    is_primary: branch.is_primary || false,
    contact_phone: branch.contact_phone,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/profile");

  return { success: true, error: null };
}

export async function deleteCustomerBranch(branchId: number): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClientServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("customers")
    .select("id")
    .eq("portal_user_id", user.id)
    .maybeSingle();

  if (!profile) return { success: false, error: "Profile not found" };

  const { error } = await supabase
    .from("customer_branches")
    .delete()
    .eq("id", branchId)
    .eq("customer_id", profile.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/profile");

  return { success: true, error: null };
}

export async function getCustomerDocuments(): Promise<{ data: CustomerDocument[]; error: string | null }> {
  const supabase = await createClientServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { data: [], error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("customers")
    .select("id")
    .eq("portal_user_id", user.id)
    .maybeSingle();

  if (!profile) return { data: [], error: "Profile not found" };

  const { data, error } = await supabase
    .from("customer_documents")
    .select("*")
    .eq("customer_id", profile.id)
    .order("created_at", { ascending: false });

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: data || [], error: null };
}

export async function addCustomerDocument(doc: Omit<CustomerDocument, "id" | "customer_id" | "is_verified">): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClientServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("customers")
    .select("id")
    .eq("portal_user_id", user.id)
    .maybeSingle();

  if (!profile) return { success: false, error: "Profile not found" };

  const { error } = await supabase.from("customer_documents").insert({
    customer_id: profile.id,
    document_type: doc.document_type,
    document_name: doc.document_name,
    file_url: doc.file_url || "",
    expiry_date: doc.expiry_date,
    is_verified: false,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/profile");

  return { success: true, error: null };
}
