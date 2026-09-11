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
# CodesContent.tsx (origin/main version)
# ═══════════════════════════════════════════════════════════════════════════════
fix_file("components/features/codes/CodesContent.tsx", [
    # Change language only → language + t
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
        '              <p className="text-sm text-slate-400 font-medium">No active code</p>',
        '              <p className="text-sm text-slate-400 font-medium">{t.codes.noActiveCode}</p>',
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
        '{["Code", "Level", "Discount", "Status", "Uses", "Created"].map((h) => (',
        '{[t.codes.code, t.codes.level, t.codes.discount, t.common.status, t.codes.uses, t.wallet.transDate].map((h) => (',
    ),

    # Empty history message
    (
        '                    No code history yet.',
        '                    {t.codes.noCodeHistory}',
    ),
])


# ═══════════════════════════════════════════════════════════════════════════════
# AffiliateWalletContent.tsx (origin/main version)
# ═══════════════════════════════════════════════════════════════════════════════
fix_file("components/features/wallet/AffiliateWalletContent.tsx", [
    # Change language only → language + t
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

print("All i18n wiring (round 2) done!")
