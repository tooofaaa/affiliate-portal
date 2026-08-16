import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const portal = searchParams.get("portal") || "affiliate";

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from("terms_and_conditions")
    .select("content_html, content_text, version")
    .eq("portal_type", portal)
    .single();

  if (error || !data) {
    return NextResponse.json({ content_html: "<p>Terms and conditions not available.</p>", content_text: "" });
  }

  return NextResponse.json(data);
}
