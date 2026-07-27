"use server";

import { createClientServer } from "@/lib/supabase/server";
import { Notification } from "@/lib/types";

export async function getNotifications(): Promise<{ data: Notification[]; error: string | null }> {
  const supabase = await createClientServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { data: [], error: "Unauthorized" };

  // Filter to affiliate (non-admin) notifications owned by this user.
  // Use `or` to also match rows where is_admin is NULL (treat null as non-admin).
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .or("is_admin.eq.false,is_admin.is.null")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: (data as Notification[]) || [], error: null };
}

export async function markAsRead(id: number): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClientServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

export async function markAllAsRead(): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClientServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", user.id)
    .eq("read", false);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}
