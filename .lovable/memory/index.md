# Project Memory

## Core
- Niched for UK gig delivery drivers (Uber, Deliveroo, Amazon Flex, Evri, DPD, Just Eat).
- Progressive Web App (PWA) optimized for mobile and desktop.
- Mileage tracking is primary feature; mileage tab is second in nav for transport users.
- Education-first: Learning Hub with driver-specific lessons.
- TrueLayer uses sandbox (`reelin-959c67`) for MVP.
- Landing page targets drivers specifically. Waitlist tracks `utm_source=linkedin`.
- LAUNCH_MODE is disabled (false) to allow external trials.
- Onboarding auto-sets business_type='transport', captures vehicle_type and delivery_platforms.

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
