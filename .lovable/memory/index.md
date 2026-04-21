# Memory: index.md
Updated: today

# Project Memory

## Core
- Niched for UK solo founders (SaaS/AI/indie/agency/creator/ecommerce). Pivoted from delivery drivers Apr 2026.
- Value prop: "Your first finance hire. For founders who'd rather build than bookkeep."
- Three pillars: know what to claim, know what you owe, hand off to vetted accountant when ready.
- Default business_type for new signups: `solo_founder`. Default nav: dashboard/log/learn/tax (no mileage).
- Education-first: 10-lesson "Founder Finance 101" is the core hook (sole trader vs Ltd, VAT threshold, R&D credits, etc.)
- Progressive Web App (PWA) optimized for mobile and desktop.
- TrueLayer uses sandbox (`reelin-959c67`) for MVP.
- LAUNCH_MODE is disabled (false) to allow external trials.
- Driver code preserved as a preset (transport business_type) but deprioritised in defaults/copy.
- Long-term: sell as one-time fee bundle to founders + accountant referral fees (not yet built).

## Memories
- [Founder Pivot](mem://positioning/founder-pivot) — Full Apr 2026 repositioning notes, files changed, what's still TODO
- [Stripe Subscriptions](mem://monetization/stripe-subscription-tiers-implemented) — Tier pricing (Starter/Pro/Business) and edge function logic
- [Lifecycle Tiers](mem://monetization/lifecycle-based-subscription-tiers) — Feature access based on VAT status and business maturity
- [Global Architecture](mem://technical/global-expansion-architecture) — Modular country-specific tax structure (e.g., src/modules/uk/)
- [Demo Account](mem://go-to-market/demo-account-strategy) — Auto-seeding account (kal@reelin.uk) with mock transaction data
- [Interactive Learning](mem://features/interactive-learning) — Inline quizzes, completion metrics, and gamification foundation
- [Curriculum Architecture](mem://features/curriculum-scalable-architecture) — DB schema for JSON lesson content, spaced repetition, and tracking
- [Learning Paths](mem://features/learning-paths-and-seasonal-content) — Visual branching journey and seasonal UK tax refreshers
- [Smart Invoice Tracker](mem://features/invoice-tracker-advanced) — Resend payment chasers, overdue filters, and visual indicators
- [MTD Compliance Engine](mem://features/mtd-compliance-engine) — HMRC SA103F category mapping, expenses, and EOPS wizards
- [MTD Data Retention](mem://technical/mtd-data-retention-and-amendments) — Error correction flow and 5-year CSV/PDF record-keeping
- [MTD Compliance Checklist](mem://features/mtd-compliance-checklist) — Dashboard audit tool with 10 factors for tax readiness
