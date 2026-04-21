

# Accountant Handoff Package — "Holy sh*t this is clean"

A one-click export bundle that turns 5–10 hours of accountant onboarding into 30–60 minutes. Generates a ZIP containing categorised transactions, a human-readable summary, a confidence report, and an auto-written founder profile.

## What gets generated (the bundle)

A single download: `reelin-handoff-{businessName}-{YYYY-MM-DD}.zip` containing:

```
reelin-handoff/
├── 1-START-HERE.pdf              ← Cover page + summary report
├── 2-transactions.csv            ← Xero/QuickBooks-compatible
├── 3-chart-of-accounts.csv       ← Standard UK CoA mapping
├── 4-confidence-report.pdf       ← Book Health Score + flagged items
├── 5-founder-profile.txt         ← Auto-generated business context
├── 6-source-documents/           ← Receipts (PDFs/images from Storage)
│   └── receipt-{date}-{desc}.{ext}
└── README.txt                    ← What's in this bundle, how to use it
```

## The four artefacts

### 1. Clean transaction export (`2-transactions.csv`)
Xero/QuickBooks-compatible columns:

```
Date, Description, Reference, Amount, Currency, Account Code, Account Name,
Tax Type, Tax Amount, Tracking Category, Contact, Notes, Receipt Link
```

- All income + expense rows merged, sorted by date
- `Account Code` mapped from `hmrc_categories.code` → standard UK CoA codes (200=Sales, 310=Cost of Sales, 408=General Expenses, etc.)
- `Tax Type` = "20% (VAT on Income)" / "20% (VAT on Expenses)" / "No VAT"
- `Receipt Link` = relative path inside the ZIP for offline access
- Uncategorised rows go to `Account Code: 999 - REVIEW NEEDED` so they're impossible to miss

### 2. Standard chart of accounts (`3-chart-of-accounts.csv`)
Static UK CoA file (Sales / Cost of Sales / Operating Expenses / Assets / Liabilities) with the Reelin → CoA code mapping included so the accountant can import it once into Xero/QB.

### 3. Summary report (`1-START-HERE.pdf`)
The accountant's first 5 minutes. Single 2–3 page PDF:

- **Cover**: Business name, period covered, prepared on, total transactions, Book Health Score
- **Revenue summary**: total in/out, by category, by month, top 5 clients
- **Expense breakdown**: by HMRC category with totals + %
- **Tax estimate history**: each tax period (status, income, expenses, estimated tax)
- **VAT status**: registered? threshold position (£X of £90k), submission history
- **Edge cases & notes**: auto-detected items needing accountant attention (e.g. "3 expenses >£500 with no receipt", "Stripe fees mapped to Bank Charges — please verify", "1 quarter unsubmitted")

### 4. Confidence report (`4-confidence-report.pdf`)
Reuses the existing `BookHealthScore` engine:
- Overall score with the same 6-category breakdown shown in-app
- % of transactions user-confirmed vs auto-categorised
- Full list of 🔴 Fix-now and 🟡 Improve issues (so the accountant knows exactly what to double-check)
- "All good" wins (so they trust the rest)

### 5. Founder profile (`5-founder-profile.txt`)
Auto-generated 1-paragraph summary using the existing Lovable AI Gateway (`google/gemini-2.5-flash`):

> *"Sarah runs a SaaS business (solo founder, Ltd company). Primary revenue: Stripe subscriptions (~£4.2k/mo). Expense profile is software-heavy: OpenAI, AWS, Notion, Figma. No payroll. Home office claimed via simplified method (£312/yr). VAT-registered as of Aug 2025, currently 23% under threshold. Cash basis, calendar quarters."*

Generated server-side from: profile + business_type + top expense categories + payroll status + VAT status + accounting basis. No PII beyond what the user's already entered.

## How the user triggers it

**Settings → Data Export & Retention** card already exists. Replace the two existing buttons (CSV / PDF) with three:

1. **Quick CSV** (existing — kept for power users)
2. **Summary PDF** (existing — kept)
3. **🆕 Accountant Handoff Pack** — primary CTA, larger, with sparkle icon

Plus a second entry point: **new "Hand off to accountant" button on the Tax page** so it surfaces where founders actually think about it.

A modal before generation lets the user pick:
- Period: This tax year / Last tax year / All time / Custom range
- Optional: accountant's email to send a download link to (uses existing Resend integration via a new edge function)

## Technical approach

| File | Change |
|---|---|
| `supabase/functions/generate-handoff-pack/index.ts` | NEW edge function — fetches all user data server-side, calls Lovable AI for founder profile, builds CSVs + PDFs + ZIP, uploads to a new private storage bucket, returns signed URL (24hr expiry) |
| `supabase/functions/send-handoff-to-accountant/index.ts` | NEW — emails signed download link via Resend |
| `supabase/migrations/...` | NEW — create private `handoff-packs` storage bucket with RLS (user can only read their own), add `handoff_exports` audit table (id, user_id, period, file_path, expires_at, sent_to_email, created_at) |
| `src/components/AccountantHandoffCard.tsx` | NEW — replaces/augments DataExportCard's CTA, shows bundle preview, period selector, optional email field, generate button |
| `src/components/AccountantHandoffPreview.tsx` | NEW — small modal showing "Bundle will include: 247 transactions, 18 receipts, score 87/100…" before the user clicks generate |
| `src/hooks/useHandoffPack.ts` | NEW — invokes edge function, polls for completion, surfaces signed URL + toast |
| `src/lib/chartOfAccounts.ts` | NEW — static UK CoA + mapping from `hmrc_categories.code` to CoA codes |
| `src/pages/SettingsPage.tsx` | Mount new card above existing DataExportCard |
| `src/pages/Tax.tsx` | Add "Hand off to accountant" button next to existing actions |
| `src/integrations/supabase/types.ts` | Auto-regenerated for new table/bucket |

### Why server-side?
- Receipt files live in private Storage — fetching + zipping them in the browser is slow and leaks signed URLs
- PDF generation (jsPDF works in Deno) is heavy
- Lovable AI call for the founder profile must stay off the client
- Lets us audit every export in `handoff_exports` (who exported what, when, where it was sent)

### Libraries used in the edge function
- `jsPDF` (Deno-compatible) for the two PDFs
- `JSZip` for the bundle
- Native `csv` string building (no dependency)
- `@supabase/supabase-js` admin client for service-role data access + Storage upload
- Lovable AI (`LOVABLE_API_KEY`) for the founder profile — model `google/gemini-2.5-flash`

## Privacy & security
- Bundle written to a **private** Storage bucket; URL is **signed and expires in 24 hours**
- Email-to-accountant flow only sends the signed link, never raw data
- `handoff_exports` table has RLS (user_id = auth.uid())
- Rate limit: 5 generations per user per day (enforced in edge function)
- Founder profile shown to the user for review **before** any send-to-accountant action

## Other notes worth adding (your "maybe more notes")

A few high-leverage extras I'd bake in now since they're cheap once the pipeline exists:

- **"Period close" lock** — when a handoff is generated for a tax period, mark it as `handoff_sent` so any later edits to those transactions trigger a warning ("You've already shared this period with your accountant — generate an amendment instead?"). Hooks into the existing amendments table.
- **Accountant-facing landing page** — the signed URL opens a tiny page (`/accountant/{token}`) that shows the founder's name, the bundle contents, and a download button. Looks like a real handoff, not a raw S3 link.
- **"What changed since last handoff"** — second handoff for the same period auto-generates a diff CSV (added/edited/deleted rows with timestamps). This is the killer reorder feature.
- **Xero/QB direct push** — left for v2; signposted in the README ("Coming soon: one-click import to Xero")

Out of scope for v1: direct Xero/QB API integration, accountant collaboration accounts, e-signature on the bundle.

## Priority order
1. DB migration + storage bucket + `chartOfAccounts.ts` mapping
2. Edge function: CSV + chart of accounts + ZIP (no PDFs yet) → end-to-end working download
3. Add the two PDFs (summary + confidence report)
4. Founder profile via Lovable AI
5. UI card + Tax page button + period selector
6. Email-to-accountant flow
7. Period close lock + accountant landing page

