"use server";

import { createClientServer } from "@/lib/supabase/server";
import { Notification } from "@/lib/types";

export async function getNotifications(): Promise<{ data: Notification[]; error: string | null }> {
  const supabase = await createClientServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { data: [], error: "Unauthorized" };

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("is_admin", false)
    .eq("user_id", user.id)
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
