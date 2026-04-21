

# Strip Down to Core: Founder Essentials Only

Hide non-core modules so the app focuses on what every founder actually needs day one: **track money in/out → know your tax → learn**. Everything else becomes opt-in.

## Core (Always Visible)
- **Dashboard** — simplified
- **Money** (Log) — income + expenses
- **Tax** — VAT threshold, tax to set aside, submissions
- **Learn** — Founder Finance 101
- **Settings**

## Hidden by Default (Opt-in via Settings → "Optional Modules")
- **Payroll** — already gated by `payroll_settings.enabled`. Just remove the auto-prompt and hide nav unless enabled.
- **Invoicing** — gated behind a new `profiles.invoicing_enabled` flag (default false). Hidden from Money page tabs and Dashboard until turned on.
- **Mileage** — gated behind `profiles.mileage_enabled` (default false). Removed from nav, dashboard widget, and onboarding entirely. Existing data preserved.

## Dashboard Simplification
Strip Dashboard to 4 widgets only:
1. **Profit this month** (hero)
2. **Tax to set aside**
3. **VAT threshold tracker** (only shown if turnover > £20k, otherwise hidden)
4. **Continue learning** (next lesson in path)

Move/hide from default Dashboard view:
- MileageStatsCard (hidden unless mileage enabled)
- InvoiceTracker / payment reminders (hidden unless invoicing enabled)
- CashFlowForecast (move to a "More insights" collapsible at bottom)
- MTDComplianceChecklist (move to Tax page)
- ExpenseAlert, DailyTipToast, StreakCounter (keep but compact)
- ShouldYouGoLtdPrompt (keep — core founder value)
- Payroll widget (already conditional on enabled)

## Navigation
- **Default nav (mobile bottom + desktop top):** `Dashboard / Money / Learn / Tax`
- Remove `mileage` from `getDefaultNavItems` for all business types (including transport — they can opt in)
- `NavigationCustomizer` still lets power users add Mileage/Invoicing/Payroll back

## Onboarding
- Remove vehicle/mileage screens from `Onboarding.tsx` entirely (or skip unconditionally)
- Remove "do you invoice clients?" branch if present
- Keep: business type, sole trader vs Ltd, revenue source

## Settings → New "Optional Modules" Section
Single card with three toggles:
- Payroll (existing `PayrollSettingsToggle`)
- Invoicing — new toggle, writes `profiles.invoicing_enabled`
- Mileage tracking — new toggle, writes `profiles.mileage_enabled`

Copy: *"Reelin's core is money in, money out, and tax. Turn these on when you need them."*

## Database
One migration: add two boolean columns to `profiles`:
- `invoicing_enabled boolean default false`
- `mileage_enabled boolean default false`

No data deleted — existing mileage trips and invoices stay in DB, just hidden until re-enabled.

## Files Touched

| File | Change |
|---|---|
| `supabase/migrations/...` | NEW — add 2 profile columns |
| `src/data/navigationConfig.ts` | Drop mileage from all defaults; nav still available via customizer |
| `src/pages/Dashboard.tsx` | Strip to 4 core widgets; gate mileage/invoice widgets on flags; collapse "More insights" |
| `src/pages/Log.tsx` | Hide invoice tab/section unless `invoicing_enabled` |
| `src/pages/Onboarding.tsx` | Remove vehicle + invoicing screens |
| `src/pages/SettingsPage.tsx` | New "Optional Modules" section with 3 toggles |
| `src/components/BottomNav.tsx` | Filter out mileage/invoicing/payroll if not enabled |
| `src/components/DesktopNav.tsx` | Same filter logic |
| `src/hooks/useProfile.ts` | Add update methods for new flags |
| `src/pages/Mileage.tsx` | Add "module disabled" guard like `Payroll.tsx` |
| `mem://index.md` | Update Core: "Stripped to essentials. Mileage/Invoicing/Payroll opt-in only." |

## What I Won't Do
- No deleting code or DB tables (everything stays, just hidden)
- No changing pricing tiers
- No touching Learn / Tax / Auth flows
- Existing users with mileage/invoice data: their data is preserved; we'll auto-set `mileage_enabled = true` for any profile that already has mileage trips so they don't lose access (same for invoicing_enabled if they have unpaid invoices)

## Priority Order
1. DB migration + auto-enable for existing users with data
2. Settings toggles + nav filtering (the core gating mechanism)
3. Dashboard simplification
4. Onboarding cleanup
5. Memory update

