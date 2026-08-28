"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  uploadAffiliateDocument,
  submitAffiliateOnboarding,
  getAffiliateOnboardingData,
} from "@/lib/actions/onboarding";

type DocumentStatus = "not_uploaded" | "pending" | "approved" | "declined";

interface DocSlot {
  type: string;
  title: string;
  description: string;
  required: boolean;
  icon: string;
}

interface UploadedDoc {
  id: string;
  document_type: string;
  document_name: string;
  file_url: string;
  file_path: string;
  status: string;
  admin_note: string | null;
  created_at: string;
}

function getDocStatus(slot: DocSlot, documents: UploadedDoc[]): DocumentStatus {
  const doc = documents.find((d) => d.document_type === slot.type);
  if (!doc) return "not_uploaded";
  return doc.status as DocumentStatus;
}

function getDocRecord(slot: DocSlot, documents: UploadedDoc[]): UploadedDoc | undefined {
  return documents.find((d) => d.document_type === slot.type);
}

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

export default function OnboardingPage() {
  const { t } = useLanguage();
  const router = useRouter();

  const DOC_SLOTS: DocSlot[] = [
    {
      type: "GovernmentID",
      title: t.onboarding.govId,
      description: t.onboarding.govIdDesc,
      required: true,
      icon: "id",
    },
    {
      type: "BankStatement",
      title: t.onboarding.bankStatement,
      description: t.onboarding.bankStatementDesc,
      required: true,
      icon: "bank",
    },
    {
      type: "SocialProof",
      title: t.onboarding.socialProof,
      description: t.onboarding.socialProofDesc,
      required: false,
      icon: "social",
    },
  ];

  const statusBadge: Record<DocumentStatus, { label: string; color: string; bg: string }> = {
    not_uploaded: { label: t.onboarding.notUploaded, color: "#6b7280", bg: "rgba(107,114,128,0.1)" },
    pending: { label: t.onboarding.pendingReview, color: "#d97706", bg: "rgba(245,158,11,0.1)" },
    approved: { label: t.onboarding.approved, color: "#059669", bg: "rgba(16,185,129,0.1)" },
    declined: { label: t.onboarding.declined, color: "#dc2626", bg: "rgba(239,68,68,0.1)" },
  };
  const [onboardingStatus, setOnboardingStatus] = useState<string>("incomplete");
  const [documents, setDocuments] = useState<UploadedDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [uploadError, setUploadError] = useState<Record<string, string>>({});
  const [uploadSuccess, setUploadSuccess] = useState<Record<string, boolean>>({});
  const [fileSelections, setFileSelections] = useState<Record<string, File | null>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function loadData() {
    setIsLoading(true);
    const data = await getAffiliateOnboardingData();
    setOnboardingStatus(data.onboarding_status);
    setDocuments(data.documents);
    setIsLoading(false);

    if (data.onboarding_status === "approved") {
      router.push("/dashboard");
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = (docType: string, file: File | null) => {
    setFileSelections((prev) => ({ ...prev, [docType]: file }));
    setUploadError((prev) => ({ ...prev, [docType]: "" }));
    setUploadSuccess((prev) => ({ ...prev, [docType]: false }));
  };

  const handleUpload = async (slot: DocSlot) => {
    const file = fileSelections[slot.type];
    if (!file) return;
    setUploading((prev) => ({ ...prev, [slot.type]: true }));
    setUploadError((prev) => ({ ...prev, [slot.type]: "" }));
    setUploadSuccess((prev) => ({ ...prev, [slot.type]: false }));

    const fd = new FormData();
    fd.append("file", file);
    fd.append("document_type", slot.type);
    fd.append("document_name", slot.title);

    const result = await uploadAffiliateDocument(fd);
    setUploading((prev) => ({ ...prev, [slot.type]: false }));

    if (result.error) {
      setUploadError((prev) => ({ ...prev, [slot.type]: result.error! }));
    } else {
      setUploadSuccess((prev) => ({ ...prev, [slot.type]: true }));
      setFileSelections((prev) => ({ ...prev, [slot.type]: null }));
      await loadData();
    }
  };

  const canSubmit = () => {
    const govDoc = documents.find((d) => d.document_type === "GovernmentID");
    const bankDoc = documents.find((d) => d.document_type === "BankStatement");
    return (
      govDoc &&
      (govDoc.status === "pending" || govDoc.status === "approved") &&
      bankDoc &&
      (bankDoc.status === "pending" || bankDoc.status === "approved")
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    const result = await submitAffiliateOnboarding();
    setIsSubmitting(false);
    if (result.error) {
      setSubmitError(result.error);
    } else {
      setSubmitted(true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)" }}
        >
          <Spinner />
        </div>
        <p className="text-sm" style={{ color: "#9ca3af" }}>
          {t.onboarding.loadingOnboarding}
        </p>
      </div>
    );
  }

  // Already submitted state
  if (onboardingStatus === "submitted" || submitted) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center gap-8 pt-8 pb-16">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
          style={{
            background: "linear-gradient(135deg, #a855f7, #ec4899)",
            boxShadow: "0 8px 30px rgba(168,85,247,0.4)",
          }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold" style={{ color: "#1e1b4b" }}>
            {t.onboarding.docsUnderReview}
          </h1>
          <p className="text-sm mt-3 leading-relaxed" style={{ color: "#6b7280" }}>
            {t.onboarding.docsUnderReviewDesc}
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          className="px-8 py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)" }}
        >
          {t.onboarding.goToDashboard}
        </button>
      </div>
    );
  }

  // Declined state
  if (onboardingStatus === "declined") {
    const declinedDocs = documents.filter((d) => d.status === "declined");
    return (
      <div className="max-w-2xl mx-auto flex flex-col gap-6 pt-4 pb-16">
        <div
          className="rounded-2xl p-6 border"
          style={{
            background: "rgba(239,68,68,0.04)",
            borderColor: "rgba(239,68,68,0.2)",
          }}
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h2 className="font-bold text-base" style={{ color: "#991b1b" }}>
                {t.onboarding.someDeclined}
              </h2>
              <p className="text-sm mt-1" style={{ color: "#dc2626" }}>
                {t.onboarding.reUploadDeclined}
              </p>
            </div>
          </div>
        </div>
        {declinedDocs.map((doc) => (
          <div
            key={doc.id}
            className="rounded-2xl p-5 border bg-white"
            style={{
              border: "1px solid rgba(239,68,68,0.3)",
              boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
            }}
          >
            <p className="font-semibold text-sm" style={{ color: "#111827" }}>
              {doc.document_name}
            </p>
            {doc.admin_note && (
              <p className="text-xs mt-1 px-3 py-2 rounded-lg" style={{ background: "rgba(239,68,68,0.06)", color: "#dc2626" }}>
                {t.onboarding.adminNote} {doc.admin_note}
              </p>
            )}
          </div>
        ))}
        <p className="text-sm text-center" style={{ color: "#6b7280" }}>
          {t.onboarding.reUploadForm}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mx-auto px-8 py-3 rounded-xl text-sm font-semibold text-white"
          style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)" }}
        >
          {t.onboarding.reUploadBtn}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-8 pt-4 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#1e1b4b" }}>
          {t.onboarding.title}
        </h1>
        <p className="text-sm mt-1.5" style={{ color: "#6b7280" }}>
          {t.onboarding.subtitle}
        </p>
      </div>

      {/* Progress indicator */}
      <div
        className="rounded-2xl p-5 flex items-center gap-4"
        style={{
          background: "rgba(168,85,247,0.05)",
          border: "1px solid rgba(168,85,247,0.15)",
        }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)" }}
        >
          {canSubmit() ? "✓" : "1"}
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: "#1e1b4b" }}>
            {canSubmit() ? t.onboarding.readyToSubmit : t.onboarding.uploadRequired}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>
            {documents.filter((d) => DOC_SLOTS.find((s) => s.type === d.document_type && s.required) && d.status !== "declined").length} of {DOC_SLOTS.filter((s) => s.required).length} required documents uploaded
          </p>
        </div>
      </div>

      {/* Document slots */}
      <div className="flex flex-col gap-5">
        {DOC_SLOTS.map((slot) => {
          const docStatus = getDocStatus(slot, documents);
          const docRecord = getDocRecord(slot, documents);
          const badge = statusBadge[docStatus];
          const isUploading = uploading[slot.type];
          const errMsg = uploadError[slot.type];
          const wasJustUploaded = uploadSuccess[slot.type];
          const selectedFile = fileSelections[slot.type];

          return (
            <div
              key={slot.type}
              className="rounded-2xl p-6 bg-white flex flex-col gap-4"
              style={{
                border:
                  docStatus === "declined"
                    ? "1px solid rgba(239,68,68,0.4)"
                    : docStatus === "approved"
                    ? "1px solid rgba(16,185,129,0.3)"
                    : "1px solid rgba(168,85,247,0.12)",
                boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
              }}
            >
              {/* Card header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
<span className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{background:"rgba(168,85,247,0.1)"}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm" style={{ color: "#111827" }}>
                        {slot.title}
                      </h3>
                      {slot.required && (
                        <span className="text-xs font-medium px-1.5 py-0.5 rounded-full" style={{ background: "rgba(168,85,247,0.1)", color: "#a855f7" }}>
                          {t.onboarding.required}
                        </span>
                      )}
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: "#6b7280" }}>
                      {slot.description}
                    </p>
                  </div>
                </div>
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                  style={{ color: badge.color, background: badge.bg }}
                >
                  {badge.label}
                </span>
              </div>

              {/* Declined admin note */}
              {docStatus === "declined" && docRecord?.admin_note && (
                <div
                  className="text-xs px-3 py-2 rounded-xl"
                  style={{ background: "rgba(239,68,68,0.06)", color: "#dc2626" }}
                >
                  {t.onboarding.adminNote} {docRecord.admin_note}
                </div>
              )}

              {/* Approved — show link */}
              {docStatus === "approved" && (
                <div
                  className="text-xs px-3 py-2 rounded-xl flex items-center gap-2"
                  style={{ background: "rgba(16,185,129,0.06)", color: "#059669" }}
                >
                  <span>✓</span> {t.onboarding.docApproved}
                  {docRecord?.file_url && (
                    <a href={docRecord.file_url} target="_blank" rel="noopener noreferrer" className="underline ms-auto">
                      {t.onboarding.viewFile}
                    </a>
                  )}
                </div>
              )}

              {/* Pending — show confirmation */}
              {docStatus === "pending" && (
                <div
                  className="text-xs px-3 py-2 rounded-xl flex items-center gap-2"
                  style={{ background: "rgba(245,158,11,0.06)", color: "#d97706" }}
                >
                  <span>⏳</span> {t.onboarding.awaitingReview}
                  {docRecord?.file_url && (
                    <a href={docRecord.file_url} target="_blank" rel="noopener noreferrer" className="underline ms-auto">
                      {t.onboarding.viewUploadedFile}
                    </a>
                  )}
                </div>
              )}

              {/* Upload area — show when not uploaded or declined */}
              {(docStatus === "not_uploaded" || docStatus === "declined") && (
                <div className="flex flex-col gap-3">
                  <label
                    className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-6 cursor-pointer transition-colors"
                    style={{
                      borderColor: selectedFile ? "#a855f7" : "rgba(168,85,247,0.25)",
                      background: selectedFile ? "rgba(168,85,247,0.04)" : "transparent",
                    }}
                  >
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      className="sr-only"
                      onChange={(e) => handleFileChange(slot.type, e.target.files?.[0] ?? null)}
                    />
                    {selectedFile ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg> : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>}
                    <span className="text-xs font-medium" style={{ color: "#6b7280" }}>
                      {selectedFile ? selectedFile.name : t.onboarding.clickToSelect}
                    </span>
                    <span className="text-xs" style={{ color: "#9ca3af" }}>
                      {t.onboarding.fileAccepted}
                    </span>
                  </label>

                  {errMsg && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <span>⚠</span> {errMsg}
                    </p>
                  )}

                  {wasJustUploaded && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <span>✓</span> {t.onboarding.uploadedSuccess}
                    </p>
                  )}

                  <button
                    type="button"
                    disabled={!selectedFile || isUploading}
                    onClick={() => handleUpload(slot)}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)" }}
                  >
                    {isUploading ? (
                      <>
                        <Spinner /> {t.onboarding.uploading}
                      </>
                    ) : (
                      t.onboarding.upload
                    )}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit section */}
      <div
        className="rounded-2xl p-6 flex flex-col gap-4"
        style={{
          background: canSubmit() ? "rgba(168,85,247,0.05)" : "rgba(107,114,128,0.04)",
          border: canSubmit()
            ? "1px solid rgba(168,85,247,0.2)"
            : "1px solid rgba(107,114,128,0.15)",
        }}
      >
        <div>
          <h3 className="font-semibold text-sm" style={{ color: "#111827" }}>
            {t.onboarding.submitForReview}
          </h3>
          <p className="text-xs mt-1" style={{ color: "#6b7280" }}>
            {canSubmit()
              ? t.onboarding.uploadsComplete
              : t.onboarding.uploadsIncomplete}
          </p>
        </div>

        {submitError && (
          <div className="text-xs text-red-500 bg-red-50 border border-red-100 px-3 py-2 rounded-xl">
            {submitError}
          </div>
        )}

        <button
          type="button"
          disabled={!canSubmit() || isSubmitting}
          onClick={handleSubmit}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          style={canSubmit() ? { background: "linear-gradient(135deg, #a855f7, #ec4899)" } : { background: "#d1d5db" }}
        >
          {isSubmitting ? (
            <>
              <Spinner /> {t.onboarding.submitting}
            </>
          ) : (
            t.onboarding.submitDocs
          )}
        </button>
      </div>
    </div>
  );
}
