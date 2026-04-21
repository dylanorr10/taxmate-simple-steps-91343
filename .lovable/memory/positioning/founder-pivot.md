---
name: founder-pivot
description: Reelin pivoted from delivery-driver niche to UK solo founders (SaaS/AI/indie). New ICP, copy, lessons, and onboarding all founder-first.
type: feature
---
**Pivot date:** 2026-04-21

**New ICP:** UK solo founders building SaaS / AI products / agencies / creator businesses. Pre-revenue to ~£200k turnover. Often first-time founders who've never done accounting.

**Core value prop:** "Your first finance hire. For founders who'd rather build than bookkeep."

**Three pillars (used everywhere in copy):**
1. Know what to claim (OpenAI bills, hosting, contractors, ads)
2. Know what you owe (tax to set aside, VAT threshold, sole trader vs Ltd)
3. Hand off to a vetted accountant when ready (Step Two — not yet built)

**What changed:**
- `src/pages/Welcome.tsx` — 6 founder categories (SaaS/AI, agency, creator, ecommerce, freelance, other) replace 7 delivery platforms
- `src/pages/Onboarding.tsx` — `FounderStructureScreen` replaces `VehicleTypeScreen`. Captures sole_trader/ltd/not_sure + revenue source (stripe/lemon_squeezy/invoices/pre_revenue). business_type is set to `solo_founder` and these are stored in existing `delivery_platforms` column to avoid schema change
- `src/data/businessTypeConfig.ts` — `solo_founder` type added with founder expense examples and 10 founder lessons in priorityLessons
- `src/data/navigationConfig.ts` — `solo_founder` defaults to dashboard/log/learn/tax (no mileage). Default for unknown types also flipped to founder-style nav
- `src/data/learningContent.ts` — 10 "Founder Finance 101" lessons appended (founder-sole-trader-vs-ltd, founder-what-you-can-claim, founder-vat-threshold, founder-stripe-foreign-income, founder-paying-yourself, founder-rd-tax-credits, founder-companies-house, founder-when-to-hire-accountant, founder-saving-for-tax, founder-mtd-itsa-2026)
- `src/pages/Landing.tsx` — hero, pains, story, features, curriculum, comparison, CTA all rewritten for founders
- `src/pages/Pricing.tsx` — copy swapped to founders + Xero comparison
- `src/components/VATThresholdCard.tsx` — NEW. Rolling 12-month turnover vs £90k progress bar
- `src/components/ShouldYouGoLtdPrompt.tsx` — NEW. Shows when annual profit > £30k

**What was preserved (driver code lives on):**
- All driver lessons remain in learningContent.ts
- transport business_type config preserved — could be re-enabled as a niche preset
- Mileage tracking infra untouched

**Not done yet (Step Two):**
- Accountant handoff flow (one-click data export to a vetted partner)
- One-time fee pricing model (£49/£149/£349 tiers)
- VATThresholdCard + ShouldYouGoLtd not yet wired into Dashboard.tsx (created but not mounted)
- Auth.tsx copy still references "reeling in your finances" — generic enough to keep
