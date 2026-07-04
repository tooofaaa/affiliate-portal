"use server";

import { createClientServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export async function loginCustomer(formData: FormData) {
  const supabase = await createClientServer();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/");
  return { success: true, message: "Logged in successfully" };
}

export async function signupCustomer(formData: FormData) {
  const supabase = await createClientServer();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https";
  const redirectTo = `${protocol}://${host}/auth/callback`;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectTo,
      data: {
        role: "customer",
        name,
      },
    },
  });

  if (error) {
    return { success: false, message: error.message };
  }

  // If Supabase auto-confirms (no email verification required), it returns a session
  if (data.session) {
    revalidatePath("/");
    return { success: true, message: "Signed up successfully. Redirecting to dashboard...", session: true };
  }

  return { success: true, message: "Signed up successfully. Please check your email to confirm.", session: false };
}

export async function logoutCustomer() {
  const supabase = await createClientServer();
  await supabase.auth.signOut();
  revalidatePath("/");
  return { success: true, message: "Logged out successfully" };
}
