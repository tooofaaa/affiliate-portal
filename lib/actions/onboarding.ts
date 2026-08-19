"use server";

import { createClientServer, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getAffiliateOnboardingData(): Promise<{
  onboarding_status: string;
  documents: Array<{
    id: string;
    document_type: string;
    document_name: string;
    file_url: string;
    file_path: string;
    status: string;
    admin_note: string | null;
    created_at: string;
  }>;
  error?: string;
}> {
  const supabase = await createClientServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { onboarding_status: "incomplete", documents: [], error: "Not authenticated" };
  }

  const { data: affiliate, error: affiliateError } = await supabase
    .from("affiliates")
    .select("id, onboarding_status")
    .eq("portal_user_id", user.id)
    .maybeSingle();

  if (affiliateError || !affiliate) {
    return { onboarding_status: "incomplete", documents: [], error: "Affiliate not found" };
  }

  const { data: documents, error: docsError } = await supabase
    .from("affiliate_documents")
    .select("id, document_type, document_name, file_url, file_path, status, admin_note, created_at")
    .eq("affiliate_id", affiliate.id)
    .order("created_at", { ascending: true });

  if (docsError) {
    return { onboarding_status: affiliate.onboarding_status || "incomplete", documents: [] };
  }

  return {
    onboarding_status: affiliate.onboarding_status || "incomplete",
    documents: documents || [],
  };
}

export async function uploadAffiliateDocument(
  formData: FormData
): Promise<{ error: string | null }> {
  const file = formData.get("file") as File;
  const document_type = formData.get("document_type") as string;
  const document_name = formData.get("document_name") as string;

  if (!file || !document_type || !document_name) {
    return { error: "Missing required fields" };
  }

  const supabase = await createClientServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: affiliate } = await supabase
    .from("affiliates")
    .select("id")
    .eq("portal_user_id", user.id)
    .maybeSingle();

  if (!affiliate) {
    return { error: "Not authenticated" };
  }

  const affiliateId = affiliate.id;
  const filePath = `affiliates/${affiliateId}/${Date.now()}_${file.name}`;

  const adminClient = createAdminClient();
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await adminClient.storage
    .from("documents")
    .upload(filePath, buffer, { contentType: file.type, upsert: true });

  if (uploadError) {
    return { error: `Upload failed: ${uploadError.message}` };
  }

  // Bucket is private — use a signed URL valid for 7 days for affiliate self-view
  const { data: signedData, error: signedError } = await adminClient.storage
    .from("documents")
    .createSignedUrl(filePath, 7 * 24 * 3600)
  const fileUrl = signedData?.signedUrl ?? filePath

  if (signedError) {
    console.error("Failed to create signed URL:", signedError.message)
  }

  await adminClient
    .from("affiliate_documents")
    .delete()
    .eq("affiliate_id", affiliateId)
    .eq("document_type", document_type);

  const { error: insertError } = await adminClient.from("affiliate_documents").insert({
    affiliate_id: affiliateId,
    document_type,
    document_name,
    file_url: fileUrl,
    file_path: filePath,
    status: "pending",
  });

  if (insertError) {
    return { error: `Database error: ${insertError.message}` };
  }

  const { data: aff } = await supabase
    .from("affiliates")
    .select("onboarding_status")
    .eq("id", affiliateId)
    .single();
  if (aff?.onboarding_status === "declined") {
    await supabase
      .from("affiliates")
      .update({ onboarding_status: "incomplete" })
      .eq("id", affiliateId);
  }

  revalidatePath("/onboarding");
  return { error: null };
}

export async function submitAffiliateOnboarding(): Promise<{ error: string | null }> {
  const supabase = await createClientServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: affiliate } = await supabase
    .from("affiliates")
    .select("id")
    .eq("portal_user_id", user.id)
    .maybeSingle();

  if (!affiliate) {
    return { error: "Not authenticated" };
  }

  const affiliateId = affiliate.id;

  const { data: documents } = await supabase
    .from("affiliate_documents")
    .select("document_type, status")
    .eq("affiliate_id", affiliateId);

  const docTypes = (documents || []).map((d) => d.document_type);
  if (!docTypes.includes("GovernmentID")) {
    return { error: "Please upload a Government ID document before submitting." };
  }
  if (!docTypes.includes("BankStatement")) {
    return { error: "Please upload a Bank Statement / IBAN Letter before submitting." };
  }

  // Validate that required documents have not been declined
  const requiredDocs = (documents || []).filter(
    (d) => d.document_type === "GovernmentID" || d.document_type === "BankStatement"
  );
  const declinedDoc = requiredDocs.find((d) => d.status === "declined");
  if (declinedDoc) {
    const docLabel = declinedDoc.document_type === "GovernmentID" ? "Government ID" : "Bank Statement";
    return { error: `Your ${docLabel} has been declined. Please re-upload the document before submitting.` };
  }

  const { error: updateError } = await supabase
    .from("affiliates")
    .update({ onboarding_status: "submitted" })
    .eq("id", affiliateId);

  if (updateError) {
    return { error: `Failed to submit: ${updateError.message}` };
  }

  revalidatePath("/onboarding");
  revalidatePath("/", "layout");
  return { error: null };
}
