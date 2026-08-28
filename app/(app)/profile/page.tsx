"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAffiliateProfile, updateAffiliateProfile, AffiliateProfile } from "@/lib/actions/profile";
import { getAffiliateOnboardingData } from "@/lib/actions/onboarding";

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

const docStatusChip: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Pending", color: "#92400e", bg: "rgba(245,158,11,0.12)" },
  approved: { label: "Approved", color: "#065f46", bg: "rgba(16,185,129,0.12)" },
  declined: { label: "Declined", color: "#991b1b", bg: "rgba(239,68,68,0.12)" },
};

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [profile, setProfile] = useState<AffiliateProfile | null>(null);
  const [name, setName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [documents, setDocuments] = useState<UploadedDoc[]>([]);

  async function loadProfile() {
    try {
      setIsLoading(true);
      const [profileRes, onboardingRes] = await Promise.all([
        getAffiliateProfile(),
        getAffiliateOnboardingData(),
      ]);
      if (profileRes.data) {
        setProfile(profileRes.data);
        setName(profileRes.data.name || "");
        setContactNumber(profileRes.data.contact_number || "");
      } else if (profileRes.error) {
        setMessage({ type: "error", text: profileRes.error });
      }
      setDocuments(onboardingRes.documents || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const res = await updateAffiliateProfile({
      name,
      contact_number: contactNumber,
    });

    if (res.success) {
      setMessage({ type: "success", text: "Profile updated successfully." });
      await loadProfile();
    } else {
      setMessage({ type: "error", text: res.error || "Failed to update profile." });
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl pb-10 font-poppins">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#0f172a" }}>
          My Profile
        </h1>
        <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
          Manage your affiliate account information
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-sm border font-medium ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Card — Summary */}
        <div className="w-full md:w-1/3">
          <div
            className="rounded-2xl p-6 flex flex-col items-center text-center bg-white"
            style={{
              border: "1px solid rgba(99,102,241,0.1)",
              boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
            }}
          >
            <div
              className="w-20 h-20 rounded-2xl mb-4 flex items-center justify-center text-white text-2xl font-bold shadow-lg"
              style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}
            >
              {(name || "A").charAt(0).toUpperCase()}
            </div>
            <h2 className="text-base font-bold text-gray-900">{name || "—"}</h2>
            <p className="text-xs text-indigo-500 font-medium mt-1">Affiliate</p>
            {profile && (
              <>
                <span
                  className={`mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    profile.status === "active"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {profile.status}
                </span>
                <p className="text-xs text-gray-400 mt-2">
                  Commission: <span className="font-semibold text-gray-700">{profile.commission_pct}%</span>
                </p>
                {profile.enterprise_unique_id && (
                  <p className="text-xs text-gray-400 mt-1">
                    ID: <span className="font-semibold text-gray-700">{profile.enterprise_unique_id}</span>
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right — Edit Form */}
        <div className="w-full md:w-2/3">
          <div
            className="rounded-2xl p-6 bg-white flex flex-col gap-6"
            style={{
              border: "1px solid rgba(99,102,241,0.1)",
              boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
            }}
          >
            <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-3">Account Information</h3>

            <form onSubmit={handleSave} className="flex flex-col gap-5">
              {/* Editable fields */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500">Contact Number</label>
                <input
                  type="tel"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Read-only fields */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500">Email Address</label>
                <input
                  type="email"
                  value={profile?.email || ""}
                  disabled
                  className="px-3 py-2 rounded-xl border border-gray-100 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500">Commission Rate</label>
                  <input
                    type="text"
                    value={profile ? `${profile.commission_pct}%` : ""}
                    disabled
                    className="px-3 py-2 rounded-xl border border-gray-100 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500">Account Status</label>
                  <input
                    type="text"
                    value={profile?.status || ""}
                    disabled
                    className="px-3 py-2 rounded-xl border border-gray-100 text-sm bg-gray-50 text-gray-400 cursor-not-allowed capitalize"
                  />
                </div>
              </div>

              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 cursor-pointer transition-colors"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Documents Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold" style={{ color: "#0f172a" }}>
              Verification Documents
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
              Documents submitted for account verification
            </p>
          </div>
          <Link
            href="/onboarding"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)" }}
          >
            Upload More
          </Link>
        </div>

        {documents.length === 0 ? (
          <div
            className="rounded-2xl p-6 text-center bg-white flex flex-col items-center gap-3"
            style={{
              border: "1px solid rgba(168,85,247,0.12)",
              boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
            }}
          >
<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <p className="text-sm" style={{ color: "#6b7280" }}>
              No documents uploaded yet.
            </p>
            <Link
              href="/onboarding"
              className="text-xs font-semibold underline"
              style={{ color: "#a855f7" }}
            >
              Complete onboarding
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {documents.map((doc) => {
              const chip = docStatusChip[doc.status] ?? {
                label: doc.status,
                color: "#6b7280",
                bg: "rgba(107,114,128,0.1)",
              };
              return (
                <div
                  key={doc.id}
                  className="rounded-2xl p-4 bg-white flex items-start justify-between gap-4"
                  style={{
                    border: "1px solid rgba(99,102,241,0.1)",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                  }}
                >
                  <div className="flex flex-col gap-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{doc.document_name}</p>
                    <p className="text-xs" style={{ color: "#9ca3af" }}>
                      {new Date(doc.created_at).toLocaleDateString()}
                    </p>
                    {doc.admin_note && doc.status === "declined" && (
                      <p
                        className="text-xs mt-1 px-2 py-1 rounded-lg"
                        style={{ background: "rgba(239,68,68,0.07)", color: "#dc2626" }}
                      >
                        Note: {doc.admin_note}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ color: chip.color, background: chip.bg }}
                    >
                      {chip.label}
                    </span>
                    {doc.file_url && (
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs underline"
                        style={{ color: "#a855f7" }}
                      >
                        View
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
