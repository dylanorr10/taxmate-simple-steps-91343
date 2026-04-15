

# Competitive Repositioning: Beat QuickBooks for Drivers

## The Insight
The Reddit user reveals exactly what drivers want: simple, focused on income/expenses/tax estimate, not overwhelmed by features. QuickBooks is "too much." Your advantage is being purpose-built for drivers.

## Changes Needed

### 1. Restructure Subscription Tiers for Drivers
**File:** `src/config/subscriptionTiers.ts`

Current problem: Mileage tracking is locked to Business tier (£29.99). For drivers, mileage is the core feature — it must be in the cheapest tier.

- **Starter (£4.99/mo)** — "Driver Essentials": Income & expense tracking, **mileage tracking**, tax estimate, learning hub, platform fee tracking
- **Professional (£14.99/mo)** — "Driver Pro": Everything in Starter + bank sync, receipt scanning, AI assistant, invoice tracking
- **Business (£29.99/mo)** — "Fleet / Full Compliance": Everything in Pro + HMRC MTD auto-submission, VAT submission, cash flow forecasting

Move `mileageTracking` from Business-only to all tiers in `TIER_FEATURES`.

### 2. Update Pricing Page Copy for Drivers
**File:** `src/pages/Pricing.tsx`

- Rewrite tier descriptions with driver language:
  - Starter: "Track your miles, log platform earnings, know your tax bill"
  - Professional: "Auto-import bank transactions, snap receipts on the go"
  - Business: "Submit directly to HMRC, full MTD compliance"
- Add a comparison callout: "QuickBooks charges £12/mo and gives you features you'll never use. Reelin gives you exactly what drivers need, starting at £4.99."

### 3. Add Competitor Comparison Section to Landing Page
**File:** `src/pages/Landing.tsx`

Add a "Why not QuickBooks?" section:
- "Built for accountants, not drivers"
- "No mileage threshold tracking (45p → 25p)"
- "Doesn't know Uber from Deliveroo"  
- "You'll pay for 50 features. You need 5."

### 4. Update Feature Gating
**File:** `src/config/subscriptionTiers.ts`

```
mileageTracking: ['starter', 'professional', 'business']  // was: ['business']
```

This is critical — if a driver signs up and can't track miles on Starter, they'll leave immediately.

## Priority
1. Move mileage to Starter tier (feature gating fix)
2. Rewrite tier descriptions for drivers
3. Add competitor comparison to landing page

## Technical Scope
- 3 files modified: `subscriptionTiers.ts`, `Pricing.tsx`, `Landing.tsx`
- No database changes
- No new components needed

