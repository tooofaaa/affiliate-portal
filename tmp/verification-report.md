# Affiliate Verification — End-to-End Investigation Report
**Date:** 2026-08-19  
**Status:** All fixes applied and committed

---

## The Problem
Uploaded affiliate documents never appeared in the super admin verification queue. Admins always saw zero pending items regardless of how many affiliates submitted documents.

---

## Verification Flow (as designed)

```
Affiliate Portal                          Admin Portal (inventory-management)
─────────────────                         ─────────────────────────────────────
1. Affiliate uploads file                 3. Admin opens /verifications
   lib/actions/onboarding.ts                 src/app/(app)/verifications/page.tsx
   → storage bucket: "documents"             calls getPendingVerifications()
   → path: affiliates/<id>/<ts>_<name>       + getAllVerifications()
   → INSERT into affiliate_documents         in src/lib/actions/verifications.ts

2. Affiliate submits                      4. Admin clicks "View"
   onboarding_status = "submitted"           calls getDocumentSignedUrl(filePath)
                                             opens signed URL in new tab

                                          5. Admin approves or declines
                                             approveDocument() / declineDocument()
                                             updates affiliate_documents.status
                                             updates affiliates.onboarding_status
```

---

## Break Points Found

### BP1 — BLOCKER: `public.run_query` function did not exist

| | |
|---|---|
| **File** | `src/lib/actions/verifications.ts` lines 22, 33, 44, 72, 89, 106 |
| **What broke** | Every admin query uses `supabase.rpc("run_query", { query_text, params_json })`. The PostgreSQL function `public.run_query` was never created in any migration. Every call silently returned `null`. The code pattern `if (data) allDocs.push(...)` swallowed the error — admin page always rendered an empty table. |
| **Fix** | `supabase/migrations/20260819000001_run_query_rpc.sql` — creates the function, restricted to `service_role` only |
| **Commit** | `inventory-management` → `c9a2b6d` |

### BP2 — DATA: Orphaned storage files (no DB rows)

| | |
|---|---|
| **Scope** | Affiliate IDs 12, 17, 18, 19, 22, 23 |
| **What broke** | The `affiliate_documents` table migration was deployed after real affiliates uploaded files. Storage uploads succeeded; the DB INSERTs failed with "relation does not exist". The files live at `documents/affiliates/<id>/` in storage but have zero corresponding rows in `affiliate_documents`. |
| **Fix** | No code fix possible — manual backfill or fresh signup required for affected accounts |

### BP3 — DATA: `public.affiliates` has 0 rows

| | |
|---|---|
| **What broke** | No active affiliates in the live DB. The admin queue would be empty even after BP1 is fixed, until new affiliates sign up. |
| **Fix** | No code fix — operational issue |

### BP4 — HIGH: Re-upload after decline was broken (3 sub-bugs)

| | |
|---|---|
| **File** | `lib/actions/onboarding.ts` |
| **Sub-bug A** | `uploadAffiliateDocument` used plain `INSERT`. Re-uploading after a decline created a second row. `ORDER BY created_at ASC` + `Array.find` returned the older declined row — UI kept showing "Declined" even after successful re-upload. |
| **Sub-bug B** | When an admin declines, `onboarding_status` is set to `"declined"`. Nothing reset it back to `"incomplete"` when the affiliate re-uploaded, so the submit button could not re-trigger. |
| **Sub-bug C** | `submitAffiliateOnboarding` only revalidated `/onboarding` — the amber "under review" banner in `AppLayoutClient.tsx` lived in the root layout and never updated after submission. |
| **Fix** | DELETE before INSERT; auto-reset `onboarding_status → "incomplete"` on re-upload; added `revalidatePath("/", "layout")` |
| **Commit** | `affiliate-portal` worktree → `dbc5e68` |

### BP5 — MEDIUM: Private bucket + `getPublicUrl()` = broken affiliate self-view

| | |
|---|---|
| **File** | `lib/actions/onboarding.ts` lines 99–101 |
| **What broke** | The `"documents"` bucket is `public: false`. `getPublicUrl()` generates `…/storage/v1/object/public/documents/…` which returns HTTP 400 on a private bucket. This non-functional URL was stored in `affiliate_documents.file_url` and shown to affiliates in `/profile`. |
| **Fix** | Replaced `getPublicUrl()` with `createSignedUrl(604800)` — 7-day signed URL via admin (service-role) client |
| **Commit** | `affiliate-portal` worktree → `dbc5e68` |

### BP6 — SECURITY: SQL injection in `getAllVerifications`

| | |
|---|---|
| **File** | `src/lib/actions/verifications.ts` lines 71, 88, 105 |
| **What broke** | The `status` query parameter was interpolated directly into raw SQL strings with no validation. |
| **Fix** | Added allowlist: `const validStatuses = ['pending','approved','declined','all']` before any SQL construction |
| **Commit** | `inventory-management` → `c9a2b6d` |

### BP7 — LOW: Stale `document_type` TypeScript union

| | |
|---|---|
| **File** | `lib/types.ts` line 89 |
| **What broke** | Type declared as `'CommercialRegistration' \| 'TaxCertificate' \| 'License' \| 'Other'`. Runtime values are `'GovernmentID' \| 'BankStatement' \| 'SocialProof'`. TypeScript was not catching invalid document_type values at compile time. |
| **Fix** | Updated union to match runtime |
| **Commit** | `affiliate-portal` worktree → `dbc5e68` |

---

## Commits

| Repo | Commit | Changes |
|---|---|---|
| `inventory-management` | `c9a2b6d` | `20260819000001_run_query_rpc.sql` (new), `verifications.ts` (status allowlist) |
| `affiliate-portal` worktree | `dbc5e68` | `onboarding.ts` (DELETE+INSERT, status reset, signed URL, revalidatePath), `lib/types.ts` (document_type) |

---

## Manual Steps Still Required

1. **Apply the migration to live Supabase:**  
   Run `supabase db push` or paste `20260819000001_run_query_rpc.sql` into the Supabase dashboard SQL editor.  
   Without this the admin page still shows zero documents in production.

2. **Decide on orphaned files (BP2):**  
   Files exist in `documents/affiliates/12/`, `/17/`, `/18/`, `/19/`, `/22/`, `/23/` with no DB rows.  
   Options: (a) manually backfill `affiliate_documents` rows using the storage file paths, or (b) ask those affiliates to re-upload.

3. **New affiliate signups:**  
   `public.affiliates` currently has 0 rows. Once the migration is applied and new affiliates sign up, the full flow will work end to end.
