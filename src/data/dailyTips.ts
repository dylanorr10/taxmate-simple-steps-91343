export interface DailyTip {
  id: string;
  content: string;
  emoji: string;
  relatedLessonId?: string;
  trigger?: {
    type: 'expense_count' | 'profit_threshold' | 'no_rules' | 'random';
    condition?: number;
  };
}

export const dailyTips: DailyTip[] = [
  {
    id: 'receipt-retention',
    content: 'Keep all business receipts for at least 6 years - HMRC can request them during an investigation.',
    emoji: '🧾',
    trigger: { type: 'expense_count', condition: 5 },
  },
  {
    id: 'tax-reserve',
    content: 'Set aside 30% of your profit for tax. Transfer it to a separate account to avoid spending it!',
    emoji: '💰',
    trigger: { type: 'profit_threshold', condition: 1000 },
    relatedLessonId: 'tax-planning',
  },
  {
    id: 'transaction-rules',
    content: 'Save hours with transaction rules! Set up automatic categorization for your regular expenses.',
    emoji: '⚡',
    trigger: { type: 'no_rules' },
    relatedLessonId: 'using-rules',
  },
  {
    id: 'self-assessment-deadline',
    content: 'Self-assessment deadline is 31st January. File online and pay on time to avoid penalties.',
    emoji: '📅',
    trigger: { type: 'random' },
  },
  {
    id: 'mileage-rate',
    content: 'You can claim 45p per mile for the first 10,000 business miles, then 25p per mile after that.',
    emoji: '🚗',
    trigger: { type: 'random' },
  },
  {
    id: 'home-office',
    content: 'Working from home? You can claim a portion of your rent, utilities, and council tax as business expenses.',
    emoji: '🏠',
    trigger: { type: 'random' },
  },
  {
    id: 'tax-free-allowance',
    content: 'The first £1,000 of self-employed income is tax-free under the Trading Allowance. Perfect for side hustles!',
    emoji: '🎉',
    trigger: { type: 'random' },
  },
  {
    id: 'vat-threshold',
    content: 'Register for VAT when your turnover exceeds £90,000 in a 12-month period.',
    emoji: '📊',
    trigger: { type: 'random' },
    relatedLessonId: 'vat-explained',
  },
  {
    id: 'ni-contributions',
    content: 'Class 2 NI is £3.45/week. You\'ll pay it automatically through Self Assessment if your profit exceeds £12,570.',
    emoji: '💳',
    trigger: { type: 'random' },
  },
  {
    id: 'expense-categories',
    content: 'Group expenses into categories: office costs, travel, marketing, equipment. Makes tax returns much easier!',
    emoji: '📋',
    trigger: { type: 'random' },
  },
  {
    id: 'client-entertainment',
    content: 'Client entertaining expenses (meals, drinks) are NOT tax-deductible - even if they\'re business-related.',
    emoji: '🍽️',
    trigger: { type: 'random' },
  },
  {
    id: 'digital-records',
    content: 'MTD requires digital record-keeping. Good news - you\'re already doing it with TaxMate!',
    emoji: '💻',
    trigger: { type: 'random' },
    relatedLessonId: 'mtd-basics',
  },
];