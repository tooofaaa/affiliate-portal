"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Button } from "@/components/ui/Button";
import { getCustomerProfile, updateCustomerProfile, getCustomerBranches, addCustomerBranch, deleteCustomerBranch, getCustomerDocuments, addCustomerDocument } from "@/lib/actions/profile";
import { CustomerProfile, CustomerBranch, CustomerDocument } from "@/lib/types";
import { formatDate } from "@/lib/utils/formatters";

export default function ProfilePage() {
  const { t, language } = useLanguage();
  
  const [activeTab, setActiveTab] = useState<"personal" | "branches" | "documents">("personal");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Profile fields
  const [profile, setProfile] = useState<Partial<CustomerProfile>>({});
  const [companyName, setCompanyName] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [commercialRegister, setCommercialRegister] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [website, setWebsite] = useState("");

  // Branches
  const [branches, setBranches] = useState<CustomerBranch[]>([]);
  const [newBranchName, setNewBranchName] = useState("");
  const [newBranchAddress, setNewBranchAddress] = useState("");
  const [newBranchCity, setNewBranchCity] = useState("");
  const [newBranchPhone, setNewBranchPhone] = useState("");

  // Documents
  const [documents, setDocuments] = useState<CustomerDocument[]>([]);
  const [newDocType, setNewDocType] = useState<CustomerDocument["document_type"]>("CommercialRegistration");
  const [newDocName, setNewDocName] = useState("");
  const [newDocUrl, setNewDocUrl] = useState("");
  const [newDocExpiry, setNewDocExpiry] = useState("");

  async function loadData() {
    try {
      setIsLoading(true);
      const [profileRes, branchesRes, docsRes] = await Promise.all([
        getCustomerProfile(),
        getCustomerBranches(),
        getCustomerDocuments(),
      ]);

      if (profileRes.data) {
        setProfile(profileRes.data);
        setCompanyName(profileRes.data.company_name || "");
        setTaxNumber(profileRes.data.tax_number || "");
        setCommercialRegister(profileRes.data.commercial_register || "");
        setContactPhone(profileRes.data.contact_phone || "");
        setWebsite(profileRes.data.website || "");
      }
      if (branchesRes.data) setBranches(branchesRes.data);
      if (docsRes.data) setDocuments(docsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const res = await updateCustomerProfile({
      company_name: companyName,
      tax_number: taxNumber,
      commercial_register: commercialRegister,
      contact_phone: contactPhone,
      website: website,
    });

    if (res.success) {
      setMessage({ type: "success", text: t.common.success });
      await loadData();
    } else {
      setMessage({ type: "error", text: res.error || t.common.failed });
    }
    setIsSaving(false);
  };

  const handleAddBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName || !newBranchAddress || !newBranchCity) return;
    
    const res = await addCustomerBranch({
      branch_name: newBranchName,
      address: newBranchAddress,
      city: newBranchCity,
      country: "Saudi Arabia",
      is_primary: branches.length === 0,
      contact_phone: newBranchPhone,
    });

    if (res.success) {
      setNewBranchName("");
      setNewBranchAddress("");
      setNewBranchCity("");
      setNewBranchPhone("");
      await loadData();
    } else {
      alert(res.error);
    }
  };

  const handleDeleteBranch = async (id: number) => {
    if (!confirm(language === "en" ? "Are you sure?" : "هل أنت متأكد؟")) return;
    const res = await deleteCustomerBranch(id);
    if (res.success) {
      await loadData();
    } else {
      alert(res.error);
    }
  };

  const handleAddDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName || !newDocUrl) return;

    const res = await addCustomerDocument({
      document_type: newDocType,
      document_name: newDocName,
      file_url: newDocUrl,
      expiry_date: newDocExpiry || undefined,
    });

    if (res.success) {
      setNewDocName("");
      setNewDocUrl("");
      setNewDocExpiry("");
      await loadData();
    } else {
      alert(res.error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-gray-500">{t.common.loading}</p>
      </div>
    );
  }

  const tabLabels = {
    personal: t.profile.businessInfo,
    branches: t.profile.branches,
    documents: t.profile.documents
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl pb-10 font-poppins">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#0f172a" }}>
          {t.profile.title}
        </h1>
        <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
          {t.profile.subtitle}
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

      {/* Tabs */}
      <div className="flex border-b border-gray-100 gap-4 mb-4">
        {(["personal", "branches", "documents"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 px-4 text-sm font-semibold capitalize border-b-2 transition-all cursor-pointer ${
              activeTab === tab 
                ? "border-indigo-600 text-indigo-600" 
                : "border-transparent text-gray-500 hover:text-slate-700"
            }`}
          >
            {tabLabels[tab]}
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Left Card - Summary info */}
        <div className="w-full md:w-1/3 flex flex-col gap-6">
          <div
            className="rounded-2xl p-6 flex flex-col items-center text-center bg-white"
            style={{
              border: "1px solid rgba(99,102,241,0.1)",
              boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
            }}
          >
            <div
              className="w-20 h-20 rounded-2xl mb-4 flex items-center justify-center text-white text-2xl font-bold shadow-lg"
              style={{
                background: "linear-gradient(135deg, #6366f1, #818cf8)",
              }}
            >
              {(companyName || "C").charAt(0).toUpperCase()}
            </div>
            <h2 className="text-base font-bold text-gray-900">{companyName}</h2>
            <p className="text-xs text-indigo-500 font-medium">{t.profile.verified}</p>
            <p className="text-xs text-gray-400 mt-1">{t.profile.taxNumber}: {taxNumber || "-"}</p>
          </div>
        </div>

        {/* Right Tab Content */}
        <div className="w-full md:w-2/3">
          
          {/* Tab 1: Personal / Company info */}
          {activeTab === "personal" && (
            <div
              className="rounded-2xl p-6 bg-white flex flex-col gap-6"
              style={{
                border: "1px solid rgba(99,102,241,0.1)",
                boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
              }}
            >
              <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-3">{t.profile.businessInfo}</h3>
              <form onSubmit={handleSaveProfile} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500">{t.profile.companyName}</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500">{t.profile.taxNumber}</label>
                    <input
                      type="text"
                      value={taxNumber}
                      onChange={(e) => setTaxNumber(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500">{t.profile.crNumber}</label>
                    <input
                      type="text"
                      value={commercialRegister}
                      onChange={(e) => setCommercialRegister(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500">{t.profile.website}</label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500">{t.profile.phone}</label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="mt-4 flex justify-end">
                  <Button type="submit" variant="primary" isLoading={isSaving} className="cursor-pointer">
                    {t.common.save}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Tab 2: Branches list & Form */}
          {activeTab === "branches" && (
            <div className="flex flex-col gap-6">
              {/* Add branch */}
              <div
                className="rounded-2xl p-6 bg-white"
                style={{
                  border: "1px solid rgba(99,102,241,0.1)",
                  boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
                }}
              >
                <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">{t.profile.addBranch}</h3>
                <form onSubmit={handleAddBranch} className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5 col-span-2">
                    <label className="text-xs font-semibold text-gray-500">{t.profile.branchName}</label>
                    <input
                      type="text"
                      required
                      value={newBranchName}
                      onChange={(e) => setNewBranchName(e.target.value)}
                      placeholder="e.g. Riyadh Central Office..."
                      className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 col-span-2">
                    <label className="text-xs font-semibold text-gray-500">{t.profile.address}</label>
                    <input
                      type="text"
                      required
                      value={newBranchAddress}
                      onChange={(e) => setNewBranchAddress(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500">{t.profile.city}</label>
                    <input
                      type="text"
                      required
                      value={newBranchCity}
                      onChange={(e) => setNewBranchCity(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500">{t.profile.phone}</label>
                    <input
                      type="tel"
                      value={newBranchPhone}
                      onChange={(e) => setNewBranchPhone(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="col-span-2 mt-2 flex justify-end">
                    <Button type="submit" variant="primary" className="cursor-pointer">
                      {t.profile.addBranch}
                    </Button>
                  </div>
                </form>
              </div>

              {/* Branches list */}
              <div
                className="rounded-2xl p-6 bg-white"
                style={{
                  border: "1px solid rgba(99,102,241,0.1)",
                  boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
                }}
              >
                <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">{t.profile.branches}</h3>
                {branches.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">{t.profile.noBranches}</p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {branches.map((b) => (
                      <div key={b.id} className="flex justify-between items-start border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                        <div>
                          <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                            {b.branch_name}
                            {b.is_primary && (
                              <span className="text-[9px] bg-indigo-50 text-indigo-600 font-bold px-1.5 py-0.5 rounded">{t.profile.primary}</span>
                            )}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">{b.address}, {b.city}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{b.contact_phone || "-"}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          onClick={() => handleDeleteBranch(b.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 text-xs cursor-pointer"
                        >
                          {t.common.delete}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Documents Upload & Management */}
          {activeTab === "documents" && (
            <div className="flex flex-col gap-6">
              {/* Upload Document */}
              <div
                className="rounded-2xl p-6 bg-white"
                style={{
                  border: "1px solid rgba(99,102,241,0.1)",
                  boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
                }}
              >
                <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">{t.profile.uploadDoc}</h3>
                <form onSubmit={handleAddDoc} className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500">{t.profile.docType}</label>
                    <select
                      value={newDocType}
                      onChange={(e) => setNewDocType(e.target.value as any)}
                      className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none bg-white focus:border-indigo-500"
                    >
                      <option value="CommercialRegistration">Commercial Registration (CR)</option>
                      <option value="TaxCertificate">Tax/VAT Certificate</option>
                      <option value="License">Business License</option>
                      <option value="Other">Other Certificate</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500">{t.profile.docName}</label>
                    <input
                      type="text"
                      required
                      value={newDocName}
                      onChange={(e) => setNewDocName(e.target.value)}
                      placeholder="e.g. CR Certificate 2026..."
                      className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500">{t.profile.expiryDate}</label>
                    <input
                      type="date"
                      value={newDocExpiry}
                      onChange={(e) => setNewDocExpiry(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500">{t.profile.fileUrl}</label>
                    <input
                      type="url"
                      required
                      value={newDocUrl}
                      onChange={(e) => setNewDocUrl(e.target.value)}
                      placeholder="https://example.com/cr.pdf..."
                      className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="col-span-2 mt-2 flex justify-end">
                    <Button type="submit" variant="primary" className="cursor-pointer">
                      {t.profile.uploadDoc}
                    </Button>
                  </div>
                </form>
              </div>

              {/* Document List */}
              <div
                className="rounded-2xl p-6 bg-white"
                style={{
                  border: "1px solid rgba(99,102,241,0.1)",
                  boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
                }}
              >
                <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">{t.profile.documents}</h3>
                {documents.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">{t.profile.noDocuments}</p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {documents.map((d) => (
                      <div key={d.id} className="flex justify-between items-center border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{d.document_name}</p>
                          <p className="text-xs text-slate-500 font-medium">{d.document_type}</p>
                          {d.expiry_date && (
                            <p className="text-[10px] text-rose-500 mt-0.5">{t.profile.expiryDate}: {formatDate(d.expiry_date, language)}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                              d.is_verified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {d.is_verified ? t.profile.verified : t.profile.unverified}
                          </span>
                          <a
                            href={d.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-indigo-600 hover:underline"
                          >
                            View →
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
