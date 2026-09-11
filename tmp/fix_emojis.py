#!/usr/bin/env python3
import os

BASE = "/home/ubuntu/affiliate-portal/.claude/worktrees/stateless-sniffing-alpaca"

def fix_file(rel_path, replacements):
    path = os.path.join(BASE, rel_path)
    content = open(path).read()
    count = 0
    for old, new in replacements:
        if old in content:
            content = content.replace(old, new)
            count += 1
        else:
            print(f"  WARN not found in {rel_path}: {repr(old[:60])}")
    open(path, 'w').write(content)
    print(f"  {rel_path}: {count}/{len(replacements)} replacements")


# ── reset-password/page.tsx: ✓/○ → SVG ──────────────────────────────────────
CHECK_SVG = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
CIRCLE_SVG = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="8"/></svg>'

rp_replacements = []
for var in ["hasMinLength", "hasUpper", "hasLower", "hasNumber", "hasSpecial"]:
    old = (
        f'                  <span className={{{var} ? "text-emerald-500" : "text-slate-350"}}>\n'
        f'                    {{{var} ? "✓" : "○"}}\n'
        f'                  </span>'
    )
    new = (
        f'                  <span className={{{var} ? "text-emerald-500" : "text-slate-300"}}>\n'
        f'                    {{{var} ? {CHECK_SVG} : {CIRCLE_SVG}}}\n'
        f'                  </span>'
    )
    rp_replacements.append((old, new))

fix_file("app/(auth)/reset-password/page.tsx", rp_replacements)


# ── onboarding/page.tsx ──────────────────────────────────────────────────────
onb_replacements = [
    # DOC_SLOTS icons
    ('    icon: "\U0001fa96",\n  },\n  {\n    type: "BankStatement"', '    icon: "id",\n  },\n  {\n    type: "BankStatement"'),
    ('    icon: "\U0001f3e6",\n  },\n  {\n    type: "SocialProof"', '    icon: "bank",\n  },\n  {\n    type: "SocialProof"'),
    ('    icon: "\U0001f4f1",\n  },\n]', '    icon: "social",\n  },\n]'),
    # The icon in the card header
    ('                  <span className="text-2xl">{slot.icon}</span>',
     '<span className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{background:"rgba(168,85,247,0.1)"}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></span>'),
    # Submitted state icon
    ('          className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"\n          style={{\n            background: "linear-gradient(135deg, #a855f7, #ec4899)",\n            boxShadow: "0 8px 30px rgba(168,85,247,0.4)",\n          }}\n        >\n          \U0001f4cb\n        </div>',
     '          className="w-20 h-20 rounded-full flex items-center justify-center"\n          style={{\n            background: "linear-gradient(135deg, #a855f7, #ec4899)",\n            boxShadow: "0 8px 30px rgba(168,85,247,0.4)",\n          }}\n        >\n          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>\n        </div>'),
    # Declined state warning icon
    ('            <span className="text-2xl">⚠️</span>', '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#991b1b" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'),
    # Progress indicator ✓ check
    ('{canSubmit() ? "✓" : "1"}', '{canSubmit() ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> : "1"}'),
    # Approved doc ✓
    ('                  <span>✓</span> Document approved', '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Document approved'),
    # Pending ⏳
    ('                  <span>⏳</span> Awaiting review', '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Awaiting review'),
    # Upload area icons
    ('                    <span className="text-2xl">{selectedFile ? "\U0001f4ce" : "⬆️"}</span>',
     '                    {selectedFile ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg> : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>}'),
    # Error prefix ⚠
    ('                      <span>⚠</span> {errMsg}', '{errMsg}'),
    # Success prefix ✓
    ('                      <span>✓</span> Uploaded successfully', 'Uploaded successfully'),
]

fix_file("app/(app)/onboarding/page.tsx", onb_replacements)


# ── profile/page.tsx: 📄 ────────────────────────────────────────────────────
fix_file("app/(app)/profile/page.tsx", [
    ('            <span className="text-3xl">\U0001f4c4</span>',
     '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>'),
])


# ── AppLayoutClient.tsx: ⏳ ⚠️ → SVG ────────────────────────────────────────
fix_file("app/(app)/AppLayoutClient.tsx", [
    ('              <span>⏳</span>\n              Your documents are under review. You&apos;ll be notified once approved.',
     '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>\n              Your documents are under review. You&apos;ll be notified once approved.'),
    ('                <span>⚠️</span>\n                Some documents were declined. Please review and resubmit.',
     '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>\n                Some documents were declined. Please review and resubmit.'),
])


# ── SupportContent.tsx: 🎫 ──────────────────────────────────────────────────
fix_file("components/features/support/SupportContent.tsx", [
    ('            <p className="text-4xl mb-3">\U0001f3ab</p>',
     '<div className="mb-3 flex justify-center"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M20 12v10H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg></div>'),
])


# ── DashboardContent.tsx: 🔗🎫💰📊 + wire translations ──────────────────────
fix_file("components/features/dashboard/DashboardContent.tsx", [
    # Remove emoji quick action icons
    ('            { href: "/links", label: "Create Link", icon: "\U0001f517" },\n            { href: "/codes", label: "Create Code", icon: "\U0001f3ab" },\n            { href: "/wallet", label: "Wallet", icon: "\U0001f4b0" },\n            { href: "/performance", label: "Performance", icon: "\U0001f4ca" },',
     '            { href: "/links", label: "Create Link" },\n            { href: "/codes", label: "Create Code" },\n            { href: "/wallet", label: "Wallet" },\n            { href: "/performance", label: "Performance" },'),
    ('            className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 hover:bg-slate-50 transition-colors"\n            >\n              <span className="text-xl">{action.icon}</span>\n              <span className="text-xs font-semibold mt-2 text-slate-700">{action.label}</span>',
     '            className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 hover:bg-slate-50 transition-colors"\n            >\n              <span className="text-xs font-semibold text-slate-700">{action.label}</span>'),
])


# ── CodesContent.tsx: 🎫 ───────────────────────────────────────────────────
fix_file("components/features/codes/CodesContent.tsx", [
    ('              <p className="text-4xl mb-3">\U0001f3ab</p>',
     '<div className="mb-3 flex justify-center"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M20 12v10H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg></div>'),
])


# ── DemoModeBanner.tsx: 🧪 ──────────────────────────────────────────────────
fix_file("components/ui/DemoModeBanner.tsx", [
    ('        <span>\U0001f9ea</span>',
     '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M9 3h6l2 7H7L9 3z"/><path d="M7 10l-2 11h14L17 10"/><line x1="9" y1="3" x2="9" y2="10"/><line x1="15" y1="3" x2="15" y2="10"/></svg>'),
])

print("All emoji replacements done!")
