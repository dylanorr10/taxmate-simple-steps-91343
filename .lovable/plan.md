

# Payroll Module (Optional, Founder-Focused)

Add payroll as an **optional module** founders can enable when they hire their first person (themselves on PAYE, a contractor, or first employee). Off by default — surfaces when relevant, never clutters the app for pre-revenue solo founders.

## The Founder Reality

Three payroll moments hit founders in order:
1. **Going Ltd & paying themselves** — director's salary at the £12,570 threshold + dividends (most common first need)
2. **Paying a contractor** — IR35 check, invoice tracking, no PAYE needed
3. **First employee** — full PAYE, NI, pension auto-enrolment, RTI to HMRC

We cover #1 and #2 properly. For #3 we **track and educate**, then hand off to a real payroll provider (Gusto-style integration or accountant) — building full HMRC RTI submission is a 6-month project on its own.

## What Gets Built

### 1. New "Payroll" section (opt-in)
- Hidden by default. Surfaces via:
  - Settings → "Enable Payroll module"
  - Auto-prompt on Dashboard when user marks themselves as Ltd in onboarding
  - CTA inside the "Paying yourself: salary vs dividends" lesson

### 2. Three payroll types

**a) Director's salary (you, paying yourself)**
- Set monthly salary (default £1,047.50/mo = £12,570/yr tax-free threshold)
- Auto-creates monthly expense entries tagged "Director's salary"
- Shows tax/NI implications inline ("At this level: £0 income tax, £0 employee NI, £0 employer NI")
- Companion dividend tracker (record dividend payments separately, shows tax band warnings)

**b) Contractor payments**
- Add contractor (name, email, UTR optional, IR35 status flag)
- Log payments → auto-creates expense entry tagged to that contractor
- Year-end summary per contractor (CSV export for accountant)
- IR35 helper: 5-question checker linking to lesson

**c) Employees (lightweight tracker + handoff)**
- Add employee with salary, start date, NI category
- Monthly run: shows gross / estimated PAYE / employee NI / employer NI / pension (using HMRC 2025-26 rates)
- **Does NOT submit RTI to HMRC.** Big banner: "For real PAYE submission, connect a payroll provider or your accountant"
- Export monthly run as PDF/CSV for whoever processes it

### 3. Dashboard integration
- New widget (only when payroll enabled): "Payroll this month — £X gross across N people"
- Employer NI added to "Tax to set aside" calculation
- Director salary auto-flows into existing expense totals

### 4. Two new founder lessons
Append to `learningContent.ts`:
- `founder-paying-yourself-ltd` — director salary vs dividends, optimal split for 2025-26
- `founder-first-hire` — contractor vs employee, IR35, what payroll really costs

### 5. Honest scoping
- **No HMRC PAYE RTI submission** — explicitly out of scope, signposted to FreeAgent/Xero Payroll/accountant
- **No pension auto-enrolment provider integration** — we calculate the contribution, user processes via NEST/Smart Pension separately
- **No P60/P45 generation** — listed as "v2"

## Database Changes

Three new tables:

| Table | Purpose |
|---|---|
| `payroll_settings` | per-user: enabled flag, employer reference, PAYE scheme ref (optional) |
| `payroll_people` | directors / contractors / employees — type, name, salary, NI category, IR35 status |
| `payroll_runs` | monthly run per person: gross, tax, NI, pension, net, status |

All with standard RLS (auth.uid() = user_id). `payroll_runs` auto-syncs into `expense_transactions` so existing P&L, tax estimates, and exports just work.

## Files Touched

| File | Change |
|---|---|
| `supabase/migrations/...` | NEW — 3 tables + RLS |
| `src/pages/Payroll.tsx` | NEW — main page with 3 tabs (You / Contractors / Employees) |
| `src/components/payroll/DirectorSalaryCard.tsx` | NEW |
| `src/components/payroll/ContractorList.tsx` | NEW |
| `src/components/payroll/EmployeePayrollRun.tsx` | NEW |
| `src/components/payroll/IR35Checker.tsx` | NEW |
| `src/hooks/usePayroll.ts` | NEW — CRUD + monthly calculations |
| `src/lib/payrollCalculations.ts` | NEW — UK 2025-26 PAYE/NI/pension math |
| `src/data/navigationConfig.ts` | Add `payroll` nav item (recommendedFor: solo_founder, only shown when enabled) |
| `src/pages/SettingsPage.tsx` | Add "Enable Payroll" toggle |
| `src/pages/Dashboard.tsx` | Conditional payroll widget + auto-prompt for Ltd users |
| `src/data/learningContent.ts` | 2 new lessons |
| `src/App.tsx` | Add `/payroll` route |

## Priority Order
1. DB migration + `payrollCalculations.ts` (the math has to be right)
2. Director salary flow (covers 80% of founder need)
3. Contractor tracker + IR35 checker
4. Employee run calculator + handoff banner
5. Dashboard widget + settings toggle
6. Two lessons

## Out of Scope (Documented as "v2")
- HMRC RTI submission
- P60/P45 generation
- Pension provider API integration
- Multi-currency payroll
- Historic payroll backfill

