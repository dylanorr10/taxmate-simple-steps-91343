export type SubscriptionTier = 'starter' | 'professional' | 'business' | 'free';

export interface TierConfig {
  id: SubscriptionTier;
  name: string;
  price: number;
  priceId: string;
  productId: string;
  description: string;
  features: string[];
  highlighted?: boolean;
}

export const SUBSCRIPTION_TIERS: Record<Exclude<SubscriptionTier, 'free'>, TierConfig> = {
  starter: {
    id: 'starter',
    name: 'Driver Essentials',
    price: 4.99,
    priceId: 'price_1SaNSz5d5AuxGTtPWCiPwJi2',
    productId: 'prod_TXSNVi9bp0CRfO',
    description: 'Track your miles, log platform earnings, know your tax bill',
    features: [
      'Mileage tracking with 45p/25p threshold',
      'Income & expense logging',
      'Platform fee tracking (Uber, Deliveroo, etc.)',
      'Tax estimate & set-aside calculator',
      'Learning hub with driver lessons',
      'Email support'
    ]
  },
  professional: {
    id: 'professional',
    name: 'Driver Pro',
    price: 14.99,
    priceId: 'price_1SaNTC5d5AuxGTtPS0UHJGOp',
    productId: 'prod_TXSN1pvc5sExfi',
    description: 'Auto-import bank transactions, snap receipts on the go',
    features: [
      'Everything in Driver Essentials',
      'Bank sync via TrueLayer',
      'Receipt photo scanning',
      'AI bookkeeping assistant',
      'Invoice tracking',
      'Payment reminders',
      'Priority email support'
    ],
    highlighted: true
  },
  business: {
    id: 'business',
    name: 'Fleet / Full Compliance',
    price: 29.99,
    priceId: 'price_1SaNTN5d5AuxGTtPam4qZji0',
    productId: 'prod_TXSOKSPIkSXWJK',
    description: 'Submit directly to HMRC, full MTD compliance',
    features: [
      'Everything in Driver Pro',
      'HMRC MTD auto-submission',
      'VAT auto-submission',
      'Cash flow forecasting',
      'Priority phone support'
    ]
  }
};

export const getTierByProductId = (productId: string | null): SubscriptionTier => {
  if (!productId) return 'free';
  
  for (const [tierId, config] of Object.entries(SUBSCRIPTION_TIERS)) {
    if (config.productId === productId) {
      return tierId as SubscriptionTier;
    }
  }
  return 'free';
};

export const TIER_FEATURES: Record<string, SubscriptionTier[]> = {
  bankSync: ['professional', 'business'],
  receiptOcr: ['professional', 'business'],
  aiAssistant: ['professional', 'business'],
  invoiceTracking: ['professional', 'business'],
  paymentReminders: ['professional', 'business'],
  hmrcIntegration: ['business'],
  vatAutoSubmission: ['business'],
  cashFlowForecast: ['business'],
  mileageTracking: ['starter', 'professional', 'business']
};

export const hasFeatureAccess = (tier: SubscriptionTier, feature: string): boolean => {
  if (tier === 'free') return false;
  const allowedTiers = TIER_FEATURES[feature];
  if (!allowedTiers) return false;
  return allowedTiers.includes(tier);
};
