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
- You earned £5,000 this month
- You spent £2,000 on business expenses
- Your profit = £3,000

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

**Allowable Expenses:**
✅ Office supplies (stationery, postage)
✅ Travel costs (fuel, train tickets for business trips)
✅ Equipment (computers, tools, machinery)
✅ Professional fees (accountant, solicitor)
✅ Marketing (website, advertising, business cards)
✅ Premises costs (rent if you have a shop/office)
✅ Utilities (if working from home - claim a proportion)
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

**Example:**
- You sell services for £1,000 + £200 VAT = £1,200 total
- You buy supplies for £500 + £100 VAT = £600 total
- You owe HMRC: £200 - £100 = £100

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
Monthly profit: £3,000
Tax to set aside: £900 (30%)
Keep in separate savings account!

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
];
