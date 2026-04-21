# Memory: index.md
Updated: just now

# Project Memory

## Core
- **Book Health Score is the killer feature (Apr 2026)**: Live 0–100 weighted "accountant readiness" score. 6 categories (coverage 25%, accuracy 20%, compliance 20%, records 15%, consistency 10%, tax 10%). Replaces MTD Gauge as Dashboard hero. Logic in `src/lib/bookHealthScore.ts`, hook `useBookHealthScore`, UI in `BookHealthScoreCard` + `BookHealthDetail`. Issues are deep-linkable (`/log?filter=uncategorised`, etc.) with optional `lessonId` for inline contextual learning.
- **Stripped to essentials (Apr 2026)**: Core nav = Dashboard / Money / Learn / Tax. Mileage, Invoicing, and Payroll are **opt-in** via Settings → Optional Modules. Flags: `profiles.mileage_enabled`, `profiles.invoicing_enabled`, `payroll_settings.enabled`. Existing users with data auto-enabled on migration.
- Niched for UK solo founders. Default `business_type` for new signups: `solo_founder`.
- Progressive Web App (PWA) optimized for mobile and desktop.
- Support both UK sole traders and limited companies.
- Education-first: Learning Hub is primary focus; financial features secondary.
- TrueLayer uses sandbox (`reelin-959c67`) for MVP.
- Landing page is primary entry point. Waitlist tracks `utm_source=linkedin`.
- LAUNCH_MODE is disabled (false) to allow external trials.

## Memories
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
