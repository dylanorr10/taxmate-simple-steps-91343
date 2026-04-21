

# Book Health Score — Your Killer Feature

A live, weighted "accountant readiness" score (0–100) that turns bookkeeping into a dopamine loop. Replaces the existing MTD Gauge as the dashboard hero. Every fix the founder makes bumps the score immediately.

## The Score Engine

Single hook `useBookHealthScore()` that returns:

```ts
{
  score: number;                  // 0–100 weighted total
  breakdown: CategoryScore[];     // 6 categories with subscores
  fixNow: ScoreIssue[];          // red — blocks accountant
  improve: ScoreIssue[];         // amber — recommended
  allGood: ScoreItem[];          // green — celebrate wins
}
```

### Six weighted categories

| Category | Weight | What it measures |
|---|---:|---|
| Transaction Coverage | 25% | % of income + expense rows with `hmrc_category_id` set; uncategorised items listed |
| Accuracy Confidence | 20% | User-confirmed (`transaction_mappings.user_confirmed`) vs auto-categorised; rows flagged uncertain |
| Compliance Signals | 20% | VAT threshold awareness (90% / 100% triggers), reasonable expense types, duplicate detection, sanity checks (e.g. expense > income red flag, missing business name/UTR) |
| Record Completeness | 15% | % of expenses with `receipt_url`; missing descriptions on >£100 items |
| Consistency | 10% | Same merchant/description mapped to same category across transactions |
| Tax Readiness | 10% | Tax estimate fresh (<30 days), no missing tax periods, all past quarters submitted |

Each category returns its own 0–100 subscore + the specific issues that pulled it down. Weighted sum = overall.

## Files

| File | Change |
|---|---|
| `src/lib/bookHealthScore.ts` | NEW — pure functions for each category, weighting, issue extraction. Fully unit-testable. |
| `src/hooks/useBookHealthScore.ts` | NEW — pulls income, expenses, profile, tax periods, mappings; returns score + issues. Memoised. |
| `src/components/BookHealthScoreCard.tsx` | NEW — hero card: big score, label ("78% accountant-ready"), trend vs last week, "View details" |
| `src/components/BookHealthDetail.tsx` | NEW — expandable/dialog: 6 category bars + 3 grouped action lists (🔴 Fix now / 🟡 Improve / 🟢 All good). Each issue is a clickable deep link |
| `src/pages/Dashboard.tsx` | Replace `MTDGauge` with `BookHealthScoreCard` as #2 widget (after Profit) |
| `src/pages/Tax.tsx` | Add full `BookHealthDetail` panel here too |
| `src/components/MTDGauge.tsx` | Keep file — repurposed inside detail view as the "Tax Readiness" sub-bar |

No DB changes. All signals derive from existing tables (`income_transactions`, `expense_transactions`, `transaction_mappings`, `tax_periods`, `profiles`, `vat_submissions`).

## Issue → Action Deep Links (the dopamine loop)

Every issue in the list is a tappable row that jumps directly to the fix:

| Issue | Link target |
|---|---|
| "6 uncategorised transactions" | `/log?filter=uncategorised` |
| "2 expenses missing receipts" | `/log?filter=no-receipt` |
| "Confirm Stripe fees mapping" | opens inline confirm dialog on `/log` |
| "VAT estimate stale" | `/tax` |
| "Add business name" | `/settings#business` |

Side-effect: add `?filter=` query param support to `Log.tsx` (small addition).

## UX Spec

**Card (dashboard):**
```
┌──────────────────────────────────────┐
│  📚 Book Health           ↗ +4 this │
│                              week    │
│        78                            │
│      ─────  Accountant-ready         │
│                                      │
│  🔴 3 fixes   🟡 2 improvements      │
│                                      │
│         [ View details → ]           │
└──────────────────────────────────────┘
```

Color of the number: 0–49 destructive, 50–79 warning, 80–100 success.

**Detail panel:**
- Stacked progress bars per category with weight label
- 3 collapsible sections (Fix now / Improve / All good) — Fix now expanded by default
- Each issue: icon + one-line description + chevron → deep link
- Empty "Fix now" section shows celebration: *"Your books are accountant-ready. Nice."*

## Contextual Learning Hook (the third bullet)

Don't ship a "Learn from here" button — instead, **inline learning prompts inside issues**. Each `ScoreIssue` can carry a `lessonId`. When present, the issue row shows a small "Why this matters" link that opens `<InlineLesson>` (already exists).

Example: "Confirm Stripe fees" issue links to lesson `understanding-merchant-fees`. Founder learns in context, not by browsing the hub.

## Out of Scope (Phase 2)

- Persisting score history (would need a new `book_health_snapshots` table for week-over-week trend — for v1 we compute "last week" from cached localStorage)
- AI-powered "likely misclassified" detection (heuristic only for v1: same merchant, different category)
- Sharing score with accountant (export PDF) — v2

## Priority

1. `bookHealthScore.ts` pure scoring logic (the math has to be right)
2. `useBookHealthScore` hook
3. `BookHealthScoreCard` on Dashboard, replacing MTDGauge slot
4. `BookHealthDetail` with deep-link issues
5. `?filter=` support on Log page
6. Inline lesson links on issues

