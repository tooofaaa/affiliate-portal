#!/usr/bin/env python3
import os
BASE = "/home/ubuntu/affiliate-portal/.claude/worktrees/stateless-sniffing-alpaca"

def fix_file(rel_path, replacements):
    path = os.path.join(BASE, rel_path)
    content = open(path).read()
    count = 0
    for old, new in replacements:
        if old in content:
            content = content.replace(old, new, 1)
            count += 1
        else:
            print(f"  WARN not found in {rel_path}: {repr(old[:80])}")
    open(path, 'w').write(content)
    print(f"  {rel_path}: {count}/{len(replacements)} replacements")


# ═══════════════════════════════════════════════════════════════════════════════
# PART 2: DashboardContent.tsx — wire to t.dashboard.*
# ═══════════════════════════════════════════════════════════════════════════════
fix_file("components/features/dashboard/DashboardContent.tsx", [
    # Change: const { language } = useLanguage(); → const { language, t } = useLanguage();
    ("  const { language } = useLanguage();\n", "  const { language, t } = useLanguage();\n"),

    # Stat cards hardcoded strings → t.dashboard.*
    (
        '    {\n      title: "Total Earnings",\n      value: formatCurrency(stats.total_earnings, language),\n      accent: "#6366f1",\n      icon: <WalletIcon className="w-4 h-4" />,\n      description: "Wallet balance",\n    },\n    {\n      title: "Active Links",\n      value: stats.active_links,\n      accent: "#10b981",\n      icon: <ActivityIcon className="w-4 h-4" />,\n      description: "Currently active tracking links",\n    },\n    {\n      title: "Total Clicks",\n      value: stats.total_clicks.toLocaleString(),\n      accent: "#f59e0b",\n      icon: <OrdersIcon className="w-4 h-4" />,\n      description: "Clicks across all links",\n    },\n    {\n      title: "Conversions",\n      value: stats.total_conversions.toLocaleString(),\n      accent: "#ec4899",\n      icon: <ProductsIcon className="w-4 h-4" />,\n      description: "Total conversions recorded",\n    },',
        '    {\n      title: t.dashboard.totalEarnings,\n      value: formatCurrency(stats.total_earnings, language),\n      accent: "#6366f1",\n      icon: <WalletIcon className="w-4 h-4" />,\n      description: t.dashboard.walletBalance,\n    },\n    {\n      title: t.dashboard.activeLinks,\n      value: stats.active_links,\n      accent: "#10b981",\n      icon: <ActivityIcon className="w-4 h-4" />,\n      description: t.dashboard.currentlyActiveLinks,\n    },\n    {\n      title: t.dashboard.totalClicks,\n      value: stats.total_clicks.toLocaleString(),\n      accent: "#f59e0b",\n      icon: <OrdersIcon className="w-4 h-4" />,\n      description: t.dashboard.clicksAcrossAllLinks,\n    },\n    {\n      title: t.dashboard.conversions,\n      value: stats.total_conversions.toLocaleString(),\n      accent: "#ec4899",\n      icon: <ProductsIcon className="w-4 h-4" />,\n      description: t.dashboard.totalConversions,\n    },',
    ),

    # Header: Dashboard → t.dashboard.title
    (
        '      <h1 className="text-2xl font-bold" style={{ color: "#0f172a" }}>\n          Dashboard\n        </h1>\n        <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>\n          Welcome back — here&apos;s your affiliate overview\n        </p>',
        '      <h1 className="text-2xl font-bold" style={{ color: "#0f172a" }}>\n          {t.dashboard.title}\n        </h1>\n        <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>\n          {t.dashboard.welcome} — {t.dashboard.overview}\n        </p>',
    ),

    # "My Active Code" card heading
    (
        '            <h3 className="font-semibold text-base" style={{ color: "#0f172a" }}>\n              My Active Code\n            </h3>\n            <Link\n              href="/codes"\n              className="text-xs font-semibold"\n              style={{ color: "#6366f1" }}\n            >\n              Manage →\n            </Link>',
        '            <h3 className="font-semibold text-base" style={{ color: "#0f172a" }}>\n              {t.dashboard.activeCode}\n            </h3>\n            <Link\n              href="/codes"\n              className="text-xs font-semibold"\n              style={{ color: "#6366f1" }}\n            >\n              {t.dashboard.manageCode}\n            </Link>',
    ),

    # No active code message
    (
        '              <p className="text-sm text-slate-400 mb-3">No active code</p>\n              <Link\n                href="/codes"\n                className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"\n                style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}\n              >\n                Create Code\n              </Link>',
        '              <p className="text-sm text-slate-400 mb-3">{t.dashboard.noActiveCode}</p>\n              <Link\n                href="/codes"\n                className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"\n                style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}\n              >\n                {t.dashboard.createCode}\n              </Link>',
    ),

    # "My Links" section heading + "View all →"
    (
        '            <h3 className="font-semibold text-base" style={{ color: "#0f172a" }}>\n              My Links\n            </h3>\n            <Link\n              href="/links"\n              className="text-xs font-semibold"\n              style={{ color: "#6366f1" }}\n            >\n              View all →\n            </Link>',
        '            <h3 className="font-semibold text-base" style={{ color: "#0f172a" }}>\n              {t.dashboard.myLinks}\n            </h3>\n            <Link\n              href="/links"\n              className="text-xs font-semibold"\n              style={{ color: "#6366f1" }}\n            >\n              {t.dashboard.viewAll}\n            </Link>',
    ),

    # Table headers
    (
        '                  {["Slug", "Destination", "Clicks", "Conv.", "Status"].map((h) => (',
        '                  {[t.dashboard.slug, t.dashboard.destination, t.dashboard.clicks, t.dashboard.conv, t.dashboard.status].map((h) => (',
    ),

    # Empty links message
    (
        '                      No links yet —{" "}\n                      <Link href="/links" className="text-indigo-600 font-semibold">\n                        create your first link\n                      </Link>',
        '                      {t.links.noLinks}',
    ),

    # Active/Inactive status in link rows
    (
        '                          {link.is_active ? "Active" : "Inactive"}',
        '                          {link.is_active ? t.dashboard.active : t.dashboard.inactive}',
    ),

    # Quick Actions heading + action labels
    (
        '        <h3 className="font-semibold text-base mb-4" style={{ color: "#0f172a" }}>\n          Quick Actions\n        </h3>\n        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">\n          {[\n            { href: "/links", label: "Create Link" },\n            { href: "/codes", label: "Create Code" },\n            { href: "/wallet", label: "Wallet" },\n            { href: "/performance", label: "Performance" },\n          ].map((action) => (',
        '        <h3 className="font-semibold text-base mb-4" style={{ color: "#0f172a" }}>\n          {t.dashboard.quickActions}\n        </h3>\n        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">\n          {[\n            { href: "/links", label: t.links.createLink },\n            { href: "/codes", label: t.codes.createCode },\n            { href: "/wallet", label: t.wallet.title },\n            { href: "/performance", label: t.performance.title },\n          ].map((action) => (',
    ),
])


# ═══════════════════════════════════════════════════════════════════════════════
# PART 3: catalog/page.tsx — add useLanguage, wire translations
# ═══════════════════════════════════════════════════════════════════════════════
catalog_path = os.path.join(BASE, "app/(app)/catalog/page.tsx")
old_catalog = '''import Link from "next/link";

export default function CatalogPage() {
  return (
    <div className="flex flex-col gap-8 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#0f172a" }}>
          Affiliate Catalog
        </h1>
        <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
          كتالوج التسويق — Choose a category to browse and create affiliate links
        </p>
      </div>

      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Memberships */}
        <div
          className="bg-white rounded-2xl p-6 flex flex-col gap-4 hover:shadow-lg transition-shadow duration-200"
          style={{ border: "1px solid rgba(99,102,241,0.1)" }}
        >'''

new_catalog_header = '''"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function CatalogPage() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col gap-8 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#0f172a" }}>
          {t.catalog.title}
        </h1>
        <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
          {t.catalog.subtitle}
        </p>
      </div>

      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Memberships */}
        <div
          className="bg-white rounded-2xl p-6 flex flex-col gap-4 hover:shadow-lg transition-shadow duration-200"
          style={{ border: "1px solid rgba(99,102,241,0.1)" }}
        >'''

content = open(catalog_path).read()
if old_catalog in content:
    content = content.replace(old_catalog, new_catalog_header)
    print("  catalog/page.tsx: header replaced")
else:
    print("  WARN catalog header not found")

# Replace Memberships section text
content = content.replace(
    '            <h2 className="text-lg font-bold" style={{ color: "#0f172a" }}>\n              Memberships\n            </h2>\n            <p className="text-sm font-medium" style={{ color: "#6366f1" }}>\n              العضويات\n            </p>\n            <p className="text-sm mt-2" style={{ color: "#64748b" }}>\n              Earn commission after customer membership is activated by admin\n            </p>',
    '            <h2 className="text-lg font-bold" style={{ color: "#0f172a" }}>\n              {t.catalog.memberships}\n            </h2>\n            <p className="text-sm mt-2" style={{ color: "#64748b" }}>\n              {t.catalog.membershipsDesc}\n            </p>',
    1
)

# Replace Packages section text
content = content.replace(
    '            <h2 className="text-lg font-bold" style={{ color: "#0f172a" }}>\n              Packages\n            </h2>\n            <p className="text-sm font-medium" style={{ color: "#10b981" }}>\n              الباقات\n            </p>\n            <p className="text-sm mt-2" style={{ color: "#64748b" }}>\n              Promote packages and earn commission after admin deposits funds\n            </p>',
    '            <h2 className="text-lg font-bold" style={{ color: "#0f172a" }}>\n              {t.catalog.packages}\n            </h2>\n            <p className="text-sm mt-2" style={{ color: "#64748b" }}>\n              {t.catalog.packagesDesc}\n            </p>',
    1
)

# Replace Products section text
content = content.replace(
    '            <h2 className="text-lg font-bold" style={{ color: "#0f172a" }}>\n              Products\n            </h2>\n            <p className="text-sm font-medium" style={{ color: "#f59e0b" }}>\n              المنتجات\n            </p>\n            <p className="text-sm mt-2" style={{ color: "#64748b" }}>\n              Earn commission after customer purchases a supplier product\n            </p>',
    '            <h2 className="text-lg font-bold" style={{ color: "#0f172a" }}>\n              {t.catalog.products}\n            </h2>\n            <p className="text-sm mt-2" style={{ color: "#64748b" }}>\n              {t.catalog.productsDesc}\n            </p>',
    1
)

# Replace "Browse" button labels
content = content.replace(
    '              Browse\n              <svg\n                width="16"\n                height="16"\n                viewBox="0 0 24 24"\n                fill="none"\n                stroke="currentColor"\n                strokeWidth={2}\n                strokeLinecap="round"\n                strokeLinejoin="round"\n              >\n                <path d="M5 12h14" />\n                <path d="M12 5l7 7-7 7" />\n              </svg>\n            </Link>',
    '              {t.catalog.browse}\n              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5l7 7-7 7" /></svg>\n            </Link>'
)

open(catalog_path, 'w').write(content)
print("  catalog/page.tsx: all done")


# ═══════════════════════════════════════════════════════════════════════════════
# PART 4: AppLayoutClient.tsx — wire banner messages to translations
# ═══════════════════════════════════════════════════════════════════════════════
fix_file("app/(app)/AppLayoutClient.tsx", [
    # Add useLanguage import + useState
    (
        'import { useState } from "react";\nimport Link from "next/link";\nimport Sidebar from "@/components/layout/Sidebar";\nimport Topbar from "@/components/layout/Topbar";\nimport { AffiliateProvider } from "@/lib/context/AffiliateContext";\nimport DemoModeBanner from "@/components/ui/DemoModeBanner";',
        'import { useState } from "react";\nimport Link from "next/link";\nimport Sidebar from "@/components/layout/Sidebar";\nimport Topbar from "@/components/layout/Topbar";\nimport { AffiliateProvider } from "@/lib/context/AffiliateContext";\nimport DemoModeBanner from "@/components/ui/DemoModeBanner";\nimport { useLanguage } from "@/lib/i18n/LanguageContext";',
    ),
    # Add t to the component body
    (
        'export default function AppLayoutClient({ children, onboardingStatus }: AppLayoutClientProps) {\n  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);',
        'export default function AppLayoutClient({ children, onboardingStatus }: AppLayoutClientProps) {\n  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);\n  const { t } = useLanguage();',
    ),
    # Wire submitted banner message
    (
        "              Your documents are under review. You&apos;ll be notified once approved.",
        "              {t.onboarding.submittedBanner}",
    ),
    # Wire declined banner message
    (
        "                Some documents were declined. Please review and resubmit.",
        "                {t.onboarding.declinedBanner}",
    ),
    # Wire "Go to Onboarding" link text
    (
        '                Go to Onboarding\n',
        '                {t.onboarding.goToOnboarding}\n',
    ),
])


# ═══════════════════════════════════════════════════════════════════════════════
# PART 5: CodesContent.tsx — wire all hardcoded strings to t.codes.*
# ═══════════════════════════════════════════════════════════════════════════════
fix_file("components/features/codes/CodesContent.tsx", [
    # Change: const { language } = useLanguage(); → const { language, t } = useLanguage();
    ("  const { language } = useLanguage();\n", "  const { language, t } = useLanguage();\n"),

    # Header title and subtitle
    (
        '          Discount Codes\n        </h1>\n        <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>\n          Create and manage your affiliate discount codes\n        </p>',
        '          {t.codes.title}\n        </h1>\n        <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>\n          {t.codes.subtitle}\n        </p>',
    ),

    # Active Code card heading
    (
        '          <h3 className="font-semibold text-base mb-4" style={{ color: "#0f172a" }}>\n            Active Code\n          </h3>',
        '          <h3 className="font-semibold text-base mb-4" style={{ color: "#0f172a" }}>\n            {t.codes.activeCode}\n          </h3>',
    ),

    # Copy code button
    (
        '                {copiedCode ? "Copied to clipboard!" : "Copy Code"}',
        '                {copiedCode ? t.codes.copiedToClipboard : t.codes.copyCode}',
    ),

    # No active code empty state
    (
        '              <p className="text-sm text-slate-400 font-medium">No active code</p>\n              <p className="text-xs text-slate-400 mt-1">Create a new code using the form</p>',
        '              <p className="text-sm text-slate-400 font-medium">{t.codes.noActiveCode}</p>\n              <p className="text-xs text-slate-400 mt-1">{t.codes.note}</p>',
    ),

    # Create New Code card heading
    (
        '          <h3 className="font-semibold text-base mb-2" style={{ color: "#0f172a" }}>\n            Create New Code\n          </h3>\n          <p className="text-xs text-slate-400 mb-4">\n            Creating a new code automatically deactivates your previous code.\n          </p>',
        '          <h3 className="font-semibold text-base mb-2" style={{ color: "#0f172a" }}>\n            {t.codes.createNewCode}\n          </h3>\n          <p className="text-xs text-slate-400 mb-4">\n            {t.codes.note}\n          </p>',
    ),

    # Discount Percentage label
    (
        '              <label className="text-xs font-semibold text-slate-500">\n                Discount Percentage (1–25%)\n              </label>',
        '              <label className="text-xs font-semibold text-slate-500">\n                {t.codes.discountPct}\n              </label>',
    ),

    # Level label
    (
        '            <label className="text-xs font-semibold text-slate-500">Level</label>',
        '            <label className="text-xs font-semibold text-slate-500">{t.codes.level}</label>',
    ),

    # Create button
    (
        '              {creating ? "Creating..." : "Create Code"}',
        '              {creating ? t.codes.creating : t.codes.create}',
    ),

    # Code History heading
    (
        '          <h3 className="font-semibold text-base" style={{ color: "#0f172a" }}>\n            Code History\n          </h3>',
        '          <h3 className="font-semibold text-base" style={{ color: "#0f172a" }}>\n            {t.codes.codeHistory}\n          </h3>',
    ),

    # Code History table headers
    (
        '                  {["Code", "Level", "Discount", "Status", "Uses", "Created"].map((h) => (',
        '                  {[t.codes.createCode.replace("Create New ", ""), t.codes.level, t.codes.discount, t.common.status, t.codes.uses, t.common.copy.replace("Copy", "")].map ? ["Code", t.codes.level, t.codes.discount, t.common.status, t.codes.uses, t.wallet.transDate].map((h) => (',
    ),

    # Empty history message
    (
        '                    No code history yet.',
        '                    {t.codes.noCodeHistory}',
    ),
])


# ═══════════════════════════════════════════════════════════════════════════════
# PART 6: AffiliateWalletContent.tsx — wire to t.wallet.*
# ═══════════════════════════════════════════════════════════════════════════════
fix_file("components/features/wallet/AffiliateWalletContent.tsx", [
    # Change: const { language } = useLanguage(); → const { language, t } = useLanguage();
    ("  const { language } = useLanguage();\n", "  const { language, t } = useLanguage();\n"),

    # Header
    (
        '          My Wallet\n        </h1>\n        <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>\n          Track your earnings and request withdrawals\n        </p>',
        '          {t.wallet.title}\n        </h1>\n        <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>\n          {t.wallet.subtitle}\n        </p>',
    ),

    # Available Balance card
    (
        '          <p className="text-sm font-medium text-indigo-200 mb-2">Available Balance</p>',
        '          <p className="text-sm font-medium text-indigo-200 mb-2">{t.wallet.availableBalance}</p>',
    ),
    (
        '          <p className="text-indigo-200 text-xs mt-2">Ready for withdrawal</p>',
        '          <p className="text-indigo-200 text-xs mt-2">{t.wallet.readyForWithdrawal}</p>',
    ),

    # Pending card
    (
        '          <p className="text-sm font-medium text-slate-500 mb-2">Pending</p>',
        '          <p className="text-sm font-medium text-slate-500 mb-2">{t.wallet.pending}</p>',
    ),
    (
        '          <p className="text-xs text-slate-400 mt-2">Withdrawal in progress</p>',
        '          <p className="text-xs text-slate-400 mt-2">{t.wallet.withdrawalInProgress}</p>',
    ),

    # Request Withdrawal button
    (
        '            Request Withdrawal\n          </button>',
        '            {t.wallet.requestWithdrawal}\n          </button>',
    ),

    # Withdrawal form header
    (
        '            <h3 className="font-semibold text-base" style={{ color: "#0f172a" }}>\n              Request Withdrawal\n            </h3>\n            <button\n              onClick={() => setShowForm(false)}\n              className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"\n            >\n              Cancel\n            </button>',
        '            <h3 className="font-semibold text-base" style={{ color: "#0f172a" }}>\n              {t.wallet.requestWithdrawal}\n            </h3>\n            <button\n              onClick={() => setShowForm(false)}\n              className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"\n            >\n              {t.common.cancel}\n            </button>',
    ),

    # SLA note in form
    (
        '            15-day SLA for processing. Available balance: {formatCurrency(available, language)}',
        '            {t.wallet.slaNote} — {t.wallet.availableBalance}: {formatCurrency(available, language)}',
    ),

    # Form labels
    (
        '              <label className="text-xs font-semibold text-slate-500">Amount (SAR) *</label>',
        '              <label className="text-xs font-semibold text-slate-500">{t.wallet.withdrawAmountLabel.replace("{currency}", t.common.currency)}</label>',
    ),
    (
        '              <label className="text-xs font-semibold text-slate-500">Bank Name *</label>',
        '              <label className="text-xs font-semibold text-slate-500">{t.wallet.bankNameLabel}</label>',
    ),
    (
        '              <label className="text-xs font-semibold text-slate-500">Account Holder *</label>',
        '              <label className="text-xs font-semibold text-slate-500">{t.wallet.holderNameLabel}</label>',
    ),
    (
        '              <label className="text-xs font-semibold text-slate-500">IBAN *</label>',
        '              <label className="text-xs font-semibold text-slate-500">{t.wallet.iban}</label>',
    ),

    # Form cancel/submit buttons
    (
        '                Cancel\n              </button>\n              <button\n                type="submit"\n                disabled={submitting}\n                className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 cursor-pointer"\n                style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}\n              >\n                {submitting ? "Submitting..." : "Submit Request"}',
        '                {t.common.cancel}\n              </button>\n              <button\n                type="submit"\n                disabled={submitting}\n                className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 cursor-pointer"\n                style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}\n              >\n                {submitting ? t.wallet.processing : t.wallet.submitRequest}',
    ),

    # Tabs
    (
        '  const tabs: { key: TabType; label: string }[] = [\n    { key: "transactions", label: "Transactions" },\n    { key: "withdrawals", label: "Withdrawals" },\n    { key: "how-to-earn", label: "How to Earn" },\n  ];',
        '  const tabs = [\n    { key: "transactions" as TabType, label: t.wallet.transactions },\n    { key: "withdrawals" as TabType, label: t.wallet.withdrawals },\n    { key: "how-to-earn" as TabType, label: t.wallet.howToEarn },\n  ];',
    ),

    # Transaction table headers
    (
        '                  {["Date", "Type", "Description", "Amount"].map((h) => (',
        '                  {[t.wallet.transDate, t.wallet.transType, t.wallet.transDesc, t.wallet.transAmount].map((h) => (',
    ),

    # No transactions
    (
        '                      No transactions recorded.',
        '                      {t.wallet.noTransactions}',
    ),

    # Withdrawal table headers
    (
        '                  {["Date", "Amount", "Bank", "IBAN", "Status", "SLA Deadline"].map((h) => (',
        '                  {[t.wallet.transDate, t.wallet.transAmount, t.wallet.bank, t.wallet.iban, t.common.status, t.wallet.slaDeadline].map((h) => (',
    ),

    # No withdrawals
    (
        '                      No withdrawals found.',
        '                      {t.wallet.noWithdrawals}',
    ),

    # How-to-earn heading
    (
        '                <h4 className="font-semibold text-slate-800 mb-2">How Affiliate Commissions Work</h4>\n                <p className="text-sm text-slate-500 leading-relaxed">\n                  Every time a customer makes a purchase using your tracking link or discount code,\n                  you earn a commission based on your commission percentage.\n                </p>',
        '                <h4 className="font-semibold text-slate-800 mb-2">{t.wallet.howToEarnTitle}</h4>\n                <p className="text-sm text-slate-500 leading-relaxed">\n                  {t.wallet.howToEarnDesc}\n                </p>',
    ),

    # How-to-earn steps
    (
        '                  { step: "1", title: "Share Your Link", desc: "Share your unique tracking link on social media, blogs, or with contacts." },\n                  { step: "2", title: "Customer Buys", desc: "When someone clicks your link and makes a purchase, the sale is tracked." },\n                  { step: "3", title: "Earn Commission", desc: "Your commission is credited to your wallet automatically after order completion." },',
        '                  { step: "1", title: t.wallet.step1Title, desc: t.wallet.step1Desc },\n                  { step: "2", title: t.wallet.step2Title, desc: t.wallet.step2Desc },\n                  { step: "3", title: t.wallet.step3Title, desc: t.wallet.step3Desc },',
    ),

    # SLA details note
    (
        '                <strong>Withdrawal SLA:</strong> All withdrawal requests are processed within 15 business days.\n                Minimum withdrawal amount is SAR 100.',
        '                {t.wallet.slaDetails}',
    ),
])

print("All i18n wiring done!")
