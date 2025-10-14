export interface TooltipContent {
  id: string;
  term: string;
  explanation: string;
  icon?: string;
  relatedLessonId?: string;
}

export interface LessonContent {
  id: string;
  title: string;
  category: string;
  content: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  icon?: string;
}

export const tooltips: TooltipContent[] = [
  {
    id: 'mtd',
    term: 'MTD Readiness',
    explanation: 'Making Tax Digital (MTD) is HMRC\'s requirement to keep digital tax records and submit VAT returns using compatible software. Your readiness score shows how well your records meet these requirements.',
    icon: '📊',
    relatedLessonId: 'mtd-basics',
  },
  {
    id: 'profit',
    term: 'Profit',
    explanation: 'Your profit is calculated as Income minus Expenses. This is the amount your business has earned after all costs. You\'ll pay Income Tax and National Insurance on this amount.',
    icon: '💰',
    relatedLessonId: 'understanding-profit',
  },
  {
    id: 'tax-savings',
    term: 'Tax Savings',
    explanation: 'Business expenses reduce your taxable profit. By claiming legitimate expenses, you pay less Income Tax and National Insurance. The savings shown are estimates based on typical sole trader tax rates.',
    icon: '💡',
    relatedLessonId: 'claiming-expenses',
  },
  {
    id: 'vat-rate',
    term: 'VAT Rate',
    explanation: 'VAT (Value Added Tax) comes in three rates: Standard (20% - most goods/services), Reduced (5% - energy saving, children\'s car seats), and Zero (0% - books, most food). Choose the rate that applies to your sale or purchase.',
    icon: '📋',
    relatedLessonId: 'vat-explained',
  },
  {
    id: 'transaction-rules',
    term: 'Transaction Rules',
    explanation: 'Rules automatically categorize future transactions from the same merchant. For example, create a rule for "AMAZON" as an expense, and all future Amazon purchases will be categorized automatically, saving you time.',
    icon: '⚡',
    relatedLessonId: 'using-rules',
  },
  {
    id: 'merchant-pattern',
    term: 'Merchant Pattern',
    explanation: 'A merchant pattern is text that appears in transaction descriptions. For example, "TESCO" will match "TESCO STORES 123" or "TESCO.COM". Use capital letters for best results.',
    icon: '🎯',
  },
  {
    id: 'tax-reserve',
    term: 'Tax Reserve',
    explanation: 'As a sole trader, tax isn\'t deducted automatically. You should set aside approximately 30% of your profit for Income Tax and National Insurance. This helps ensure you have funds ready when your tax bill is due.',
    icon: '🏦',
    relatedLessonId: 'tax-planning',
  },
  {
    id: 'income-trend',
    term: 'Income Trend',
    explanation: 'This shows how your current month\'s income compares to the average of previous months. An upward trend (↗) means you\'re earning more than usual, while a downward trend (↘) means less.',
    icon: '📈',
  },
];

export const lessons: LessonContent[] = [
  {
    id: 'mtd-basics',
    title: 'What is Making Tax Digital (MTD)?',
    category: 'Compliance',
    difficulty: 'beginner',
    duration: '3 min',
    icon: '📊',
    content: `Making Tax Digital (MTD) is HMRC's way of modernizing the UK tax system by requiring businesses to keep digital records and submit returns electronically.

**Who needs MTD?**
- All VAT-registered businesses (mandatory since April 2022)
- Sole traders with income over £50,000 (from April 2026)
- Eventually, all sole traders and landlords

**What you need:**
- Digital record-keeping software (like TaxMate!)
- Digital links between your records and HMRC
- Submit returns using compatible software

**Benefits:**
- Fewer errors in your tax returns
- Real-time view of your tax position
- Easier to stay compliant
- Less paperwork

**Your MTD Readiness Score** shows how well your records meet these requirements. Aim for 100% to ensure smooth submissions.`,
  },
  {
    id: 'understanding-profit',
    title: 'How Profit is Calculated',
    category: 'Tax',
    difficulty: 'beginner',
    duration: '2 min',
    icon: '💰',
    content: `Profit is the foundation of your tax calculation. Here's how it works:

**The Formula:**
Profit = Total Income - Total Expenses

**Example:**
{{CUSTOM_EXAMPLES}}

**Why it matters:**
You pay Income Tax and National Insurance on your profit, NOT on your total income. This is why claiming legitimate expenses is so important - they reduce your taxable profit.

**Common mistake:**
Don't confuse profit with cash in the bank. You might have £10,000 in your account, but if you have unpaid bills or have taken personal drawings, your actual profit could be different.

**Tax you'll pay:**
As a sole trader, you'll typically pay around 30% of your profit in Income Tax and National Insurance (rates vary based on your total income).`,
  },
  {
    id: 'claiming-expenses',
    title: 'What Expenses Can You Claim?',
    category: 'Expenses',
    difficulty: 'beginner',
    duration: '4 min',
    icon: '💡',
    content: `You can claim expenses that are "wholly and exclusively" for business use. Here's what that means:

**Allowable Expenses for Your Business:**
{{CUSTOM_EXAMPLES}}

**General Allowable Expenses:**
✅ Office supplies (stationery, postage)
✅ Professional fees (accountant, solicitor)
✅ Marketing (website, advertising, business cards)
✅ Professional subscriptions and insurance

**NOT Allowable:**
❌ Personal expenses
❌ Entertaining clients (meals, drinks)
❌ Fines or penalties
❌ Personal proportion of mixed-use items

**Mixed Use (e.g., home office):**
If you use something for both business and personal use, you can only claim the business proportion. For example, if your home office takes up 10% of your house, claim 10% of your rent/mortgage interest.

**Keep Records:**
Save ALL receipts for at least 6 years. HMRC can ask to see them during an investigation.

**The Tax Saving:**
For every £100 you claim in expenses, you save roughly £30 in tax (assuming typical sole trader rates).`,
  },
  {
    id: 'vat-explained',
    title: 'VAT Basics for Sole Traders',
    category: 'VAT',
    difficulty: 'intermediate',
    duration: '5 min',
    icon: '📋',
    content: `VAT (Value Added Tax) is a tax on sales of goods and services. Here's what you need to know:

**Do you need to register?**
- Mandatory if turnover exceeds £90,000 (threshold from April 2024)
- Optional if under the threshold (can be beneficial if your customers are VAT-registered)

**The Three VAT Rates:**
- **Standard (20%)** - Most goods and services
- **Reduced (5%)** - Energy-saving products, children's car seats
- **Zero (0%)** - Books, most food, children's clothes

**How VAT Works:**
1. Charge VAT on your sales (Output VAT)
2. Pay VAT on your purchases (Input VAT)
3. Submit to HMRC: Output VAT minus Input VAT

**Example for Your Business:**
{{CUSTOM_EXAMPLES}}

**VAT Returns:**
Submit quarterly returns showing:
- Total sales
- Total purchases
- VAT collected
- VAT paid
- Net amount owed/refundable

**Flat Rate Scheme:**
Simpler option for small businesses - charge normal VAT but pay HMRC a fixed percentage of your turnover.`,
  },
  {
    id: 'using-rules',
    title: 'Save Time with Transaction Rules',
    category: 'Automation',
    difficulty: 'beginner',
    duration: '3 min',
    icon: '⚡',
    content: `Transaction rules are your secret weapon for automating bookkeeping. Here's how to use them:

**What are rules?**
Rules automatically categorize transactions based on merchant name or description patterns. Set them once, save hours every month.

**When to create a rule:**
- Recurring subscriptions (software, hosting)
- Regular suppliers (same merchant each time)
- Personal expenses you want to ignore
- Regular income from specific clients

**How to create effective rules:**

1. **Use clear merchant patterns**
   - "AMAZON" matches all Amazon transactions
   - "TESCO" matches all Tesco purchases
   - Use capital letters for consistency

2. **Set the right action:**
   - Income: Money you've earned
   - Expense: Business costs
   - Ignore: Personal spending

3. **Choose correct VAT rate:**
   - Most things: 20%
   - Some services: 0%
   - Check if unsure

**Example rules:**

**Expense Rule:**
- Merchant: "ADOBE"
- Action: Expense
- VAT: 20%
- Result: All Adobe subscriptions automatically categorized

**Ignore Rule:**
- Merchant: "NETFLIX"
- Action: Ignore
- Result: Personal Netflix charges won't appear in business records

**Income Rule:**
- Merchant: "STRIPE"
- Action: Income
- VAT: 20%
- Result: All Stripe payments automatically logged as income

**Pro Tip:** Start with your most frequent transactions and work backwards. This gives you the biggest time-saving impact.`,
  },
  {
    id: 'tax-planning',
    title: 'Planning for Your Tax Bill',
    category: 'Tax',
    difficulty: 'intermediate',
    duration: '4 min',
    icon: '🏦',
    content: `As a sole trader, tax isn't deducted automatically. You need to plan ahead to avoid a nasty surprise. Here's how:

**How much to save:**
Set aside approximately 30% of your profit for:
- Income Tax
- Class 2 National Insurance (£3.45/week if profit over £12,570)
- Class 4 National Insurance (9% on profits £12,570-£50,270)

**Example:**
{{CUSTOM_EXAMPLES}}

**When you pay:**

**Self Assessment:**
- Tax return deadline: 31st January
- Payment on account: 31st January & 31st July
- Payments based on previous year's tax

**Important dates:**
- 5th April: End of tax year
- 31st October: Paper return deadline
- 31st January: Online return + payment deadline

**Payment on Account explained:**
If you owe over £1,000 tax, HMRC makes you pay in advance for next year:
- 31st Jan: Half of next year's estimated tax
- 31st July: Other half of next year's estimated tax
- 31st Jan (following year): Balance from actual figures

**First year example:**
Year 1 tax bill: £6,000
- Pay £6,000 on 31st Jan (Year 2)
- Pay £3,000 on 31st July (Year 2) - payment on account
- Pay £3,000 on 31st Jan (Year 3) - second payment on account

**Top Tips:**
1. Open a separate savings account for tax
2. Transfer 30% of profit immediately
3. Don't touch it until tax is due
4. Review quarterly - adjust savings if needed
5. If business is seasonal, save more in good months

**What if you can't pay?**
Contact HMRC ASAP to arrange a payment plan. They're more flexible if you reach out before the deadline rather than after.`,
  },
  {
    id: 'cis-basics',
    title: 'Construction Industry Scheme (CIS) Basics',
    category: 'Tax',
    difficulty: 'intermediate',
    duration: '4 min',
    icon: '🔨',
    content: `If you work in construction, understanding CIS is crucial. Here's everything you need to know:

**What is CIS?**
The Construction Industry Scheme requires contractors to deduct money from subcontractor payments and pass it to HMRC. This counts as advance payment of tax and National Insurance.

**Who needs to register?**
- Contractors who pay subcontractors
- Subcontractors working for contractors
- Trades including: builders, plumbers, electricians, decorators, scaffolders

**The 20% Deduction:**
If you're a registered subcontractor, contractors deduct 20% from your payments and send it to HMRC:
- Gross payment: £1,000
- CIS deduction (20%): £200
- Net payment to you: £800

**How to claim it back:**
The £200 deducted counts towards your tax bill. When you file your Self Assessment:
- If your tax bill is £150: HMRC refunds £50
- If your tax bill is £250: You pay £50 more
- Keep all CIS statements as proof

**Gross Payment Status:**
Once you prove a good compliance record, you can apply for gross payment status and receive full payment without deductions.

**Common examples:**
{{CUSTOM_EXAMPLES}}

**Important:**
Always verify your employment status - genuine self-employment means you're truly in business for yourself, not just a disguised employee.`,
  },
  {
    id: 'mileage-tracking',
    title: 'Mileage Tracking for Tax Relief',
    category: 'Expenses',
    difficulty: 'beginner',
    duration: '3 min',
    icon: '🚗',
    content: `Claim tax relief for business mileage using these two methods:

**Method 1: Simplified Mileage (45p/mile)**
- First 10,000 miles: 45p per mile
- Additional miles: 25p per mile
- No need to track fuel costs
- Easy to calculate

**What counts as business mileage:**
{{CUSTOM_EXAMPLES}}

**What DOESN'T count:**
❌ Home to regular workplace (commuting)
❌ Personal trips
❌ Detours for personal errands

**Method 2: Actual Costs**
Track all vehicle expenses:
- Fuel
- Insurance
- MOT & servicing
- Road tax
- Repairs
- Depreciation

Calculate business percentage of total miles and claim that proportion.

**Which method to choose?**
- High mileage + cheap car = Simplified mileage
- Low mileage + expensive car = Actual costs
- You can switch methods each tax year

**Record keeping:**
Keep a mileage log showing:
- Date
- Start/end location
- Purpose of trip
- Miles traveled
- Client/job reference

**Example:**
{{CUSTOM_EXAMPLES}}

**Pro tip:** Use a mileage tracking app to automatically log journeys.`,
  },
  {
    id: 'home-office',
    title: 'Home Office Expense Deductions',
    category: 'Expenses',
    difficulty: 'intermediate',
    duration: '4 min',
    icon: '🏠',
    content: `Working from home? You can claim these expenses:

**Method 1: Simplified Expenses (£6/month)**
- Flat rate: £6 per month
- No calculations needed
- No receipts required
- Annual claim: £72

**Method 2: Actual Costs (Proportion Method)**
Calculate business use percentage:
- Number of rooms used ÷ Total rooms
- Hours worked ÷ Total hours (if part-time)

**Claimable costs:**
{{CUSTOM_EXAMPLES}}

**Example calculation:**
Home office = 1 room out of 5 rooms = 20%
Work 40 hours/week out of 168 hours = 24%
Claim 20% × 24% = 4.8% of costs

Or simpler: Just use room percentage if you work regular hours.

**What you CAN'T claim:**
❌ Mortgage payments (only mortgage interest proportion)
❌ Council tax
❌ Insurance (unless specific business policy)

**Which method?**
- Small home office = £6/month
- Dedicated office space with high costs = Proportion method

**Important:**
Using proportion method might affect Capital Gains Tax if you sell your home. Seek professional advice if claiming significant amounts.

**Record keeping:**
- Keep utility bills
- Calculate percentage annually
- Document room usage
- Save for 6 years`,
  },
  {
    id: 'invoicing-clients',
    title: 'Professional Invoicing Best Practices',
    category: 'Admin',
    difficulty: 'beginner',
    duration: '3 min',
    icon: '📄',
    content: `Create professional invoices that get paid faster:

**Essential invoice elements:**
- Your business name & contact details
- Client name & address
- Unique invoice number
- Invoice date
- Payment due date
- Itemized services/products
- Amounts (net, VAT, total)
- Payment terms & methods
- Bank details for payment

**Payment terms examples:**
{{CUSTOM_EXAMPLES}}

**Invoice numbering:**
Use sequential numbers: INV-001, INV-002, etc.
Or date-based: 2024-001, 2024-002

**VAT considerations:**
If VAT registered, include:
- Your VAT number
- VAT rate for each item
- Total VAT amount
- Total including VAT

**Late payment rights:**
You can charge interest on late payments:
- 8% + Bank of England base rate
- Plus £40-£100 debt recovery fee
- State this clearly on invoices

**Getting paid faster:**
- Send immediately after work completed
- Make payment easy (multiple methods)
- Follow up politely after 7 days
- Offer small discount for early payment
- Consider deposits for large projects

**Common mistakes:**
❌ Missing invoice numbers
❌ Unclear payment terms
❌ No due date
❌ Incorrect VAT calculations
❌ Missing bank details

**Pro tip:** Use invoice templates or software to ensure consistency and professionalism.`,
  },
  {
    id: 'vehicle-expenses',
    title: 'Vehicle Expenses Explained',
    category: 'Expenses',
    difficulty: 'intermediate',
    duration: '4 min',
    icon: '🚙',
    content: `Maximize your vehicle expense claims:

**Simplified vs Actual Costs:**

**Simplified (Mileage Rate):**
- 45p first 10,000 miles
- 25p additional miles
- Covers ALL vehicle costs
- Can't claim anything else

**Actual Costs (Full tracking):**
{{CUSTOM_EXAMPLES}}

**Business use percentage:**
Calculate: Business miles ÷ Total miles

Example:
- Total miles: 15,000
- Business miles: 10,000
- Business use: 67%
- Claim 67% of all costs

**Capital allowances (depreciation):**
If you buy a vehicle, claim:
- Writing Down Allowance: 18% per year
- Or 100% First Year Allowance for electric vehicles

**Record keeping requirements:**
- Mileage log (start, end, purpose)
- All receipts for costs
- Insurance documents
- Service records
- Purchase invoice

**Which method to choose?**

Choose SIMPLIFIED if:
- High business mileage
- Cheap/old vehicle
- Don't want admin

Choose ACTUAL if:
- Expensive vehicle
- Low mileage
- High running costs
- Electric vehicle

**Pro tip:** Calculate both methods at year-end and choose the one giving highest claim.`,
  },
  {
    id: 'copyright-basics',
    title: 'Copyright & IP for Creatives',
    category: 'Legal',
    difficulty: 'intermediate',
    duration: '5 min',
    icon: '©️',
    content: `Protect your creative work and understand your rights:

**Copyright basics:**
- Automatic protection (no registration needed in UK)
- Protects: photos, designs, music, writing, software
- Lasts: 70 years after creator's death
- You own it unless you assign it

**Licensing vs Assignment:**

**License:**
- Client gets permission to use work
- You keep copyright
- Can specify: duration, territory, usage
- Can license to multiple clients

**Assignment:**
- Client owns copyright completely
- You lose all rights
- Should charge significantly more
- Get it in writing

**Common scenarios:**
{{CUSTOM_EXAMPLES}}

**Client contracts should specify:**
- Who owns copyright
- Usage rights granted
- Exclusivity period
- Attribution requirements
- Payment terms

**Protecting your work:**
- Watermark samples
- Use contracts for all jobs
- Register with copyright services
- Keep dated records of creation
- Document all client communications

**If someone infringes:**
1. Send cease & desist letter
2. Negotiate licensing fee
3. Legal action if necessary
4. Register with IPO for stronger case

**Fair use exceptions:**
Clients can't claim fair use just to avoid payment. Fair use is very limited in UK law.

**Pro tip:** Build standard license tiers (personal use, commercial, exclusive) with clear pricing for each.`,
  },
];
