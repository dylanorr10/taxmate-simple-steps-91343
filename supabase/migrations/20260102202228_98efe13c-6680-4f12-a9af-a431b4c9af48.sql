-- Add seasonal columns to lessons table
ALTER TABLE public.lessons 
ADD COLUMN seasonal_month integer CHECK (seasonal_month >= 1 AND seasonal_month <= 12),
ADD COLUMN seasonal_year integer,
ADD COLUMN seasonal_priority boolean DEFAULT false;

-- Create index for efficient seasonal queries
CREATE INDEX idx_lessons_seasonal_month ON public.lessons(seasonal_month) WHERE seasonal_month IS NOT NULL;

-- Insert 12 seasonal refresher lessons
INSERT INTO public.lessons (title, emoji, category, difficulty, duration, order_index, lesson_type, quiz_required, seasonal_month, seasonal_priority, content) VALUES
-- January: Self Assessment Deadline
('Self Assessment Deadline Sprint', '🏃', 'Tax', 'Beginner', 8, 100, 'seasonal', true, 1, true, '{
  "sections": [
    {"type": "text", "content": "The 31st January deadline is here! This is your final checklist to submit your Self Assessment on time and avoid penalties."},
    {"type": "heading", "content": "Last-Minute Essentials"},
    {"type": "list", "items": ["Gather all income records (invoices, bank statements)", "Collect expense receipts and records", "Check your UTR number is correct", "Verify your Government Gateway login works"]},
    {"type": "heading", "content": "Common Mistakes to Avoid"},
    {"type": "list", "items": ["Forgetting to include all income sources", "Missing allowable expense deductions", "Entering gross instead of net figures", "Not keeping copies of submitted returns"]},
    {"type": "tip", "content": "Late filing = £100 instant penalty. Late payment = interest charges from day one. Submit NOW!"}
  ],
  "quiz": [
    {"question": "What is the penalty for filing Self Assessment late?", "options": ["£50", "£100", "£200", "No penalty"], "correctAnswer": 1, "explanation": "HMRC charges an automatic £100 penalty for late filing, even if you owe no tax."}
  ]
}'::jsonb),

-- February: Post-Deadline Reset
('Post-Deadline Financial Reset', '🔄', 'Planning', 'Beginner', 6, 101, 'seasonal', true, 2, false, '{
  "sections": [
    {"type": "text", "content": "Tax deadline done! Now is the perfect time to organize your records and set up systems for a smoother year ahead."},
    {"type": "heading", "content": "Review & Learn"},
    {"type": "list", "items": ["What expenses did you nearly forget?", "Which records were hardest to find?", "Did you claim all available allowances?"]},
    {"type": "heading", "content": "Set Up for Success"},
    {"type": "list", "items": ["Create monthly bookkeeping reminders", "Set up a receipt capture system", "Organize digital folders by category", "Schedule quarterly financial reviews"]},
    {"type": "tip", "content": "The best time to improve your systems is right after experiencing the pain of tax season!"}
  ],
  "quiz": [
    {"question": "How often should you ideally review your business finances?", "options": ["Once a year at tax time", "Monthly or quarterly", "Only when problems arise", "Never - accountants handle it"], "correctAnswer": 1, "explanation": "Regular monthly or quarterly reviews help catch issues early and make tax time much easier."}
  ]
}'::jsonb),

-- March: Tax Year-End Prep
('Tax Year-End Preparation', '📅', 'Tax', 'Intermediate', 10, 102, 'seasonal', true, 3, true, '{
  "sections": [
    {"type": "text", "content": "The tax year ends on 5th April. These final weeks are your last chance to maximize allowances and reduce your tax bill legally."},
    {"type": "heading", "content": "Last-Chance Actions"},
    {"type": "list", "items": ["Use remaining personal allowance (£12,570)", "Maximize pension contributions", "Consider capital purchases for equipment", "Review dividend vs salary split if applicable"]},
    {"type": "heading", "content": "Allowances That Reset"},
    {"type": "list", "items": ["Annual Investment Allowance for equipment", "Trading allowance (£1,000)", "Personal savings allowance", "ISA allowance (£20,000)"]},
    {"type": "tip", "content": "Unused allowances cannot be carried forward. Use them or lose them before 5th April!"}
  ],
  "quiz": [
    {"question": "When does the UK tax year end?", "options": ["31st March", "5th April", "31st December", "1st April"], "correctAnswer": 1, "explanation": "The UK tax year runs from 6th April to 5th April the following year."}
  ]
}'::jsonb),

-- April: New Tax Year
('New Tax Year Kickoff', '🎉', 'Tax', 'Beginner', 8, 103, 'seasonal', true, 4, true, '{
  "sections": [
    {"type": "text", "content": "Happy New Tax Year! 6th April marks a fresh start. Here is what has changed and how to begin the year right."},
    {"type": "heading", "content": "Check Updated Rates"},
    {"type": "list", "items": ["Personal allowance threshold", "National Insurance rates and thresholds", "VAT registration threshold", "Corporation tax rates if applicable"]},
    {"type": "heading", "content": "Fresh Start Checklist"},
    {"type": "list", "items": ["Archive last year records securely", "Start new expense tracking for the year", "Review and update your business budget", "Set income targets for the new year"]},
    {"type": "tip", "content": "HMRC updates thresholds annually. What was true last year might not apply this year!"}
  ],
  "quiz": [
    {"question": "When does the new UK tax year begin?", "options": ["1st January", "1st April", "6th April", "31st March"], "correctAnswer": 2, "explanation": "The UK tax year begins on 6th April each year."}
  ]
}'::jsonb),

-- May: Q1 VAT Focus
('Q1 VAT Return Focus', '📊', 'VAT', 'Intermediate', 8, 104, 'seasonal', true, 5, false, '{
  "sections": [
    {"type": "text", "content": "If you are VAT registered on standard quarters, your first return of the tax year may be due soon. Let us make sure it is accurate."},
    {"type": "heading", "content": "VAT Return Checklist"},
    {"type": "list", "items": ["Reconcile all sales invoices", "Verify all purchase VAT is claimable", "Check for any reverse charge items", "Review fuel scale charges if applicable"]},
    {"type": "heading", "content": "Common VAT Mistakes"},
    {"type": "list", "items": ["Claiming VAT on non-business expenses", "Missing the 4-year rule for reclaims", "Incorrect treatment of exempt supplies", "Forgetting to adjust for bad debts"]},
    {"type": "tip", "content": "Keep VAT records for at least 6 years. HMRC can inspect at any time!"}
  ],
  "quiz": [
    {"question": "How long must you keep VAT records?", "options": ["2 years", "4 years", "6 years", "10 years"], "correctAnswer": 2, "explanation": "VAT records must be kept for at least 6 years, as HMRC can request inspection during this period."}
  ]
}'::jsonb),

-- June: Mid-Year Check-In
('Mid-Year Financial Check-In', '📈', 'Planning', 'Beginner', 7, 105, 'seasonal', true, 6, false, '{
  "sections": [
    {"type": "text", "content": "We are a quarter into the tax year. Time for a financial health check to ensure you are on track."},
    {"type": "heading", "content": "Income Review"},
    {"type": "list", "items": ["Compare income to same period last year", "Are you on track for annual targets?", "Any outstanding invoices to chase?", "New income streams to consider?"]},
    {"type": "heading", "content": "Expense Audit"},
    {"type": "list", "items": ["Review subscription costs - still needed?", "Check for unclaimed business expenses", "Verify mileage logs are up to date", "Look for cost-saving opportunities"]},
    {"type": "tip", "content": "A mid-year review prevents December panic. Small adjustments now have big impact later."}
  ],
  "quiz": [
    {"question": "Why is a mid-year financial review important?", "options": ["It is a legal requirement", "To make adjustments before year-end", "Only for large businesses", "To impress your accountant"], "correctAnswer": 1, "explanation": "Mid-year reviews let you spot issues and make adjustments while there is still time to act."}
  ]
}'::jsonb),

-- July: Payment on Account
('Payment on Account Prep', '💰', 'Tax', 'Intermediate', 9, 106, 'seasonal', true, 7, true, '{
  "sections": [
    {"type": "text", "content": "31st July is the deadline for your first Payment on Account. Understand what you owe and why."},
    {"type": "heading", "content": "What is Payment on Account?"},
    {"type": "text", "content": "HMRC collects tax in advance based on your previous year bill. You pay 50% by 31st July and 50% by 31st January."},
    {"type": "heading", "content": "Calculate Your Payment"},
    {"type": "list", "items": ["Check last year tax bill amount", "Divide by 2 for each payment", "Consider reducing if income dropped", "Budget for the January payment too"]},
    {"type": "tip", "content": "If your income has dropped significantly, you can apply to reduce your Payment on Account - but be careful, underestimating means interest charges!"}
  ],
  "quiz": [
    {"question": "When is the first Payment on Account due?", "options": ["31st January", "5th April", "31st July", "31st October"], "correctAnswer": 2, "explanation": "The first Payment on Account is due by 31st July each year."}
  ]
}'::jsonb),

-- August: Summer Admin
('Summer Admin Catch-Up', '☀️', 'Bookkeeping', 'Beginner', 6, 107, 'seasonal', true, 8, false, '{
  "sections": [
    {"type": "text", "content": "August is often quieter for many businesses. Perfect time to catch up on admin tasks you have been putting off."},
    {"type": "heading", "content": "Receipt Round-Up"},
    {"type": "list", "items": ["Photograph all paper receipts", "Organize digital receipts by category", "Match receipts to bank transactions", "File or shred processed paperwork"]},
    {"type": "heading", "content": "Reconciliation Tasks"},
    {"type": "list", "items": ["Bank account reconciliation", "Petty cash check", "Outstanding invoice review", "Supplier statement matching"]},
    {"type": "tip", "content": "Set a recurring monthly admin day. 2 hours monthly beats 2 days annually!"}
  ],
  "quiz": [
    {"question": "How long should you keep business receipts?", "options": ["1 year", "3 years", "5 years minimum", "Forever"], "correctAnswer": 2, "explanation": "Keep business records for at least 5 years after the 31 January submission deadline for the relevant tax year."}
  ]
}'::jsonb),

-- September: Back to Business
('Back-to-Business Planning', '📚', 'Planning', 'Beginner', 7, 108, 'seasonal', true, 9, false, '{
  "sections": [
    {"type": "text", "content": "Summer is over, and it is time to focus on a strong finish to the tax year. Let us review Q3 and optimize for Q4."},
    {"type": "heading", "content": "Q3 Review Questions"},
    {"type": "list", "items": ["How does your income compare to plan?", "Any unexpected expenses to address?", "Are payment terms working for cash flow?", "What marketing efforts paid off?"]},
    {"type": "heading", "content": "Q4 Optimization"},
    {"type": "list", "items": ["Plan major purchases before year-end", "Review pricing for new year", "Consider early invoicing for December", "Prepare for seasonal fluctuations"]},
    {"type": "tip", "content": "Q4 planning now means Q1 next year starts smoothly. Think ahead!"}
  ],
  "quiz": [
    {"question": "Why might you invoice early in December?", "options": ["Legal requirement", "Looks more professional", "Improves cash flow before year-end", "Reduces paperwork"], "correctAnswer": 2, "explanation": "Early December invoicing improves cash flow and ensures payment before the holiday slowdown."}
  ]
}'::jsonb),

-- October: Early Self Assessment
('Early Self Assessment Benefits', '🎯', 'Tax', 'Beginner', 7, 109, 'seasonal', true, 10, false, '{
  "sections": [
    {"type": "text", "content": "Self Assessment opens in April, but October is the sweet spot for filing. Discover why early birds win."},
    {"type": "heading", "content": "Benefits of Filing Early"},
    {"type": "list", "items": ["Know your tax bill months in advance", "Time to save if you owe money", "Avoid January deadline stress", "Get refunds processed faster"]},
    {"type": "heading", "content": "October Filing Checklist"},
    {"type": "list", "items": ["Gather all income records to date", "Estimate any remaining income", "Collect expense documentation", "Check Government Gateway access"]},
    {"type": "tip", "content": "File early, pay later! Submitting in October does not mean paying until 31st January."}
  ],
  "quiz": [
    {"question": "If you file Self Assessment in October, when is payment due?", "options": ["Immediately", "31st October", "31st December", "31st January"], "correctAnswer": 3, "explanation": "Regardless of when you file, payment is due by 31st January (unless using a payment plan)."}
  ]
}'::jsonb),

-- November: Tax Efficiency
('Year-End Tax Efficiency Check', '🔍', 'Tax', 'Intermediate', 9, 110, 'seasonal', true, 11, false, '{
  "sections": [
    {"type": "text", "content": "With the tax year-end approaching, November is your last practical month to make tax-efficient decisions."},
    {"type": "heading", "content": "Last-Chance Strategies"},
    {"type": "list", "items": ["Pension contributions before 5th April", "Capital equipment purchases", "Charitable donations for gift aid", "Spouse salary if applicable"]},
    {"type": "heading", "content": "Review Your Position"},
    {"type": "list", "items": ["Estimate total taxable income", "Check which tax band you are in", "Calculate potential savings from actions", "Consider professional advice for complex situations"]},
    {"type": "tip", "content": "A £100 pension contribution could save you £40+ in tax. Small actions, big impact!"}
  ],
  "quiz": [
    {"question": "Why is November important for tax planning?", "options": ["Tax year ends in November", "Last practical month to take action", "HMRC deadline", "Interest rates change"], "correctAnswer": 1, "explanation": "November is the last practical month to implement strategies before the December/January rush."}
  ]
}'::jsonb),

-- December: Year-End Housekeeping
('Year-End Housekeeping', '🧹', 'Bookkeeping', 'Beginner', 8, 111, 'seasonal', true, 12, false, '{
  "sections": [
    {"type": "text", "content": "December is for closing out the calendar year cleanly. Get your records in order before the holiday break."},
    {"type": "heading", "content": "Invoice Chasing"},
    {"type": "list", "items": ["List all outstanding invoices", "Send polite reminders for overdue payments", "Consider early payment discounts", "Update your bad debt provisions"]},
    {"type": "heading", "content": "Record Cleanup"},
    {"type": "list", "items": ["Reconcile all accounts to date", "File any loose paperwork", "Back up all digital records", "Review and cancel unused subscriptions"]},
    {"type": "tip", "content": "Start January with a clean slate. Unfinished December tasks become January nightmares!"}
  ],
  "quiz": [
    {"question": "What should you do with potentially uncollectable invoices?", "options": ["Ignore them", "Keep chasing forever", "Create a bad debt provision", "Write them off immediately"], "correctAnswer": 2, "explanation": "Creating a bad debt provision allows you to account for potentially uncollectable debts while still pursuing payment."}
  ]
}'::jsonb);