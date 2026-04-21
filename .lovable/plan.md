

# Pivot Reelin to Founder-First (Step One)

Strip the driver framing. Reposition the entire app as **"The Finance Co-Pilot for First-Time Founders"** — covers sole trader → Ltd transition, Stripe revenue, SaaS expenses, VAT threshold, and hands off to a vetted accountant when they're ready.

## What Changes

### 1. Brand + Copy Layer
- **`src/pages/Landing.tsx`** — Rewrite hero, pain points, comparison, social proof for founders. Replace "delivery driver" hero/QuickBooks section with:
  - Hero: "Your first finance hire. For founders who'd rather build than bookkeep."
  - Pains: "Sole trader or Ltd?", "Can I claim my OpenAI bill?", "When do I register for VAT?", "What do I owe HMRC?"
  - Comparison: "Xero assumes you know accounting. You don't. That's the point."
- **`src/pages/Auth.tsx`, `src/pages/Pricing.tsx`** — Swap driver copy for founder copy.

### 2. Onboarding Flow
- **`src/pages/Welcome.tsx`** — Replace 7 delivery platforms with founder categories:
  - Building a SaaS / AI product
  - Agency / consultancy
  - Content / creator business
  - Ecommerce / DTC
  - Freelance services
  - Other digital business
- **`src/pages/Onboarding.tsx`** — Add founder branch:
  - "Sole trader or Ltd?" (with "not sure" → routes to lesson)
  - "Where does revenue come from?" (Stripe / Lemon Squeezy / Invoices / Pre-revenue)
  - "Monthly recurring costs?" (API credits, hosting, tools)

### 3. Business Type Config
- **`src/data/businessTypeConfig.ts`** — Add `digital_business` / `solo_founder` type with founder expense examples (OpenAI, Anthropic, Vercel, Supabase, Cursor, GitHub, Figma, domains, Stripe fees, contractor invoices, ads).
- Make `solo_founder` the default for new signups.

### 4. Learning Hub: Founder Finance 101
- **`src/data/learningContent.ts`** — Add 10-lesson founder path:
  1. Sole trader vs Ltd — when to switch (£30-50k profit rule)
  2. What digital founders can claim (SaaS, APIs, home office)
  3. The £90k VAT threshold — why it matters for AI startups
  4. Stripe, Lemon Squeezy & foreign income — how HMRC sees it
  5. Paying yourself: salary vs dividends vs drawings
  6. R&D tax credits for AI/software
  7. Companies House basics (confirmation statement, deadlines)
  8. When to hire an accountant + what to hand them
  9. Saving for tax with lumpy revenue
  10. MTD ITSA April 2026 for solo founders

### 5. Dashboard
- **`src/pages/Dashboard.tsx`** — Founder-tuned widgets:
  - "Profit this month" front and centre (replaces mileage hero)
  - "Tax to set aside" (already exists, surface higher)
  - **NEW** `src/components/VATThresholdCard.tsx` — rolling 12-month turnover vs £90k with progress bar
  - **NEW** "Should you go Ltd?" prompt component that appears when profit > £30k, links to lesson

### 6. Navigation Defaults
- **`src/data/navigationConfig.ts`** — Founder default: `dashboard / log / learn / tax` (drop mileage from default tabs).

### 7. Memory Update
- Update `mem://index.md` Core to reflect founder pivot (replace driver-niche line).
- New memory file: `mem://positioning/founder-pivot` documenting the new ICP and copy direction.

## What I Won't Touch (Yet)
- No DB schema changes (existing `business_type` field handles new type)
- No Stripe/pricing changes
- No accountant handoff flow yet (that's Step Two)
- Driver code stays in place but is deprioritised in copy/defaults — can be revived as a preset later if you sell to a driver-focused buyer

## Files Touched

| File | Change |
|---|---|
| `src/pages/Landing.tsx` | Founder hero, pains, comparison rewrite |
| `src/pages/Welcome.tsx` | Founder category picker |
| `src/pages/Onboarding.tsx` | Add Ltd/sole-trader + revenue source branch |
| `src/pages/Auth.tsx` | Founder copy |
| `src/pages/Pricing.tsx` | Founder copy on tiers |
| `src/pages/Dashboard.tsx` | Surface VAT threshold + Ltd prompt |
| `src/data/businessTypeConfig.ts` | Add `solo_founder` type |
| `src/data/learningContent.ts` | Add 10 founder lessons |
| `src/data/navigationConfig.ts` | Founder default nav |
| `src/components/VATThresholdCard.tsx` | NEW |
| `src/components/ShouldYouGoLtdPrompt.tsx` | NEW |
| `mem://index.md` + `mem://positioning/founder-pivot` | Memory update |

## Priority Order
1. Landing page + Welcome (what new visitors see)
2. Business type config + Onboarding branch
3. Founder learning path (the actual value)
4. Dashboard widgets (VAT threshold, Ltd prompt)
5. Memory update

