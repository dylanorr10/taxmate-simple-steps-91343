

# Niche Reelin for Gig Delivery Drivers

Target: Self-employed delivery/courier drivers — Uber, Deliveroo, Amazon Flex, Parcelforce, Evri, DPD, Just Eat, Stuart.

## What Needs to Change

### 1. Landing Page — Rewrite for drivers
- Hero: "Built for Delivery Drivers. Track Miles. Claim Expenses. Stay HMRC-Ready."
- Replace generic "business owner" language with driver-specific copy
- Pain points section: mileage tracking headaches, missing fuel receipts, surprise tax bills, MTD confusion
- Personal story: reframe around drivers you know / the driver problem
- Curriculum section: show driver-relevant lessons only (mileage, fuel, vehicle costs, MTD)
- Add platform logos (Uber, Deliveroo, Amazon Flex, Evri, etc.) as social proof / recognition

### 2. Welcome Page — Remove generic profession picker
- Replace multi-profession grid with driver sub-type selection: "Which platforms do you deliver for?" (Uber Eats, Deliveroo, Amazon Flex, Evri/Parcelforce, DPD/Yodel, Other)
- This data feeds into personalised onboarding and examples

### 3. Onboarding Flow — Driver-specific questions
- Replace generic business types with driver-specific flow:
  - Screen 2: "Which platforms?" (multi-select: Uber, Deliveroo, Amazon Flex, Evri, etc.)
  - Screen 3: "Do you use your own vehicle?" + vehicle type (car, van, e-bike, motorbike)
  - Keep income range + record-keeping screens (already relevant)
- Auto-set `business_type = 'transport'` and `mileage` as priority nav item

### 4. Business Type Config — Add driver-specific examples
- Update `businessTypeConfig.ts` transport examples to be driver-specific:
  - Expenses: "Uber service fees", "Phone mount", "Insulated delivery bag", "Hi-vis vest", "Phone data plan"
  - Mileage: "Multi-drop route", "Return to depot", "Between-platform trips"
- Add new quick ref cards: "Platform Fee Deduction Guide", "Driver Expense Checklist"

### 5. Learning Content — Prioritise driver lessons
- Ensure mileage tracking, vehicle expenses, fuel VAT recovery, and MTD lessons exist and are prioritised
- Add driver-specific examples within existing lessons (e.g., "If you drove 120 miles today across 15 Deliveroo drops...")
- Consider a new lesson: "Tax Basics for Delivery Drivers" as the starter lesson

### 6. Navigation Defaults — Mileage front and centre
- Update `getDefaultNavItems` for transport type to put Mileage as the second tab (already close, just confirm)
- Dashboard should prominently show mileage stats and deduction progress

### 7. Dashboard — Driver-focused widgets
- Highlight: miles this week, deduction earned, miles until rate drops (45p → 25p)
- Show platform breakdown if we track which platform each trip was for
- Quick-add trip button prominent at top

### 8. Database — Add platform tracking
- Add `delivery_platform` column to profiles table (or a new `driver_platforms` junction table)
- Optionally add `platform` field to mileage_trips for per-platform tracking
- Add `vehicle_type` column to profiles

## Technical Changes Summary

| File/Area | Change |
|-----------|--------|
| `src/pages/Landing.tsx` | Full copy rewrite for drivers |
| `src/pages/Welcome.tsx` | Platform picker instead of profession picker |
| `src/pages/Onboarding.tsx` | Driver-specific screens (platforms, vehicle type) |
| `src/data/businessTypeConfig.ts` | Expand transport config with driver examples |
| `src/data/navigationConfig.ts` | Confirm transport defaults are optimal |
| `src/data/learningContent.ts` | Add/update driver-relevant lessons and examples |
| `src/pages/Dashboard.tsx` | Mileage-first layout for transport users |
| Database migration | Add `vehicle_type`, `delivery_platforms` columns to profiles |
| `mem://index.md` | Update core memory to reflect driver niche |

## Priority Order
1. Landing page rewrite (this is what potential users see first)
2. Welcome + Onboarding flow (first-run experience)
3. Business type config + learning content (personalisation)
4. Dashboard tweaks (daily usage)
5. Database schema updates (platform tracking)

