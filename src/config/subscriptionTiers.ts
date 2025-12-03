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
    name: 'Starter',
    price: 4.99,
    priceId: 'price_1SaNSz5d5AuxGTtPWCiPwJi2',
    productId: 'prod_TXSNVi9bp0CRfO',
    description: 'Essential bookkeeping for new freelancers',
    features: [
      'Track income & expenses',
      'Basic VAT calculations',
      'Manual bank entry',
      'Learning hub access',
      'Email support'
    ]
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    price: 14.99,
    priceId: 'price_1SaNTC5d5AuxGTtPS0UHJGOp',
    productId: 'prod_TXSN1pvc5sExfi',
    description: 'Full-featured bookkeeping for established freelancers',
    features: [
      'Everything in Starter',
      'Bank sync via TrueLayer',
      'Receipt OCR scanning',
      'AI bookkeeping assistant',
      'Invoice tracking',
      'Payment reminders',
      'Priority email support'
    ],
    highlighted: true
  },
  business: {
    id: 'business',
    name: 'Business',
    price: 29.99,
    priceId: 'price_1SaNTN5d5AuxGTtPam4qZji0',
    productId: 'prod_TXSOKSPIkSXWJK',
    description: 'Complete tax automation for growing businesses',
    features: [
      'Everything in Professional',
      'HMRC MTD integration',
      'VAT auto-submission',
      'Cash flow forecasting',
      'Mileage tracking',
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
  mileageTracking: ['business']
};

export const hasFeatureAccess = (tier: SubscriptionTier, feature: string): boolean => {
  if (tier === 'free') return false;
  const allowedTiers = TIER_FEATURES[feature];
  if (!allowedTiers) return false;
  return allowedTiers.includes(tier);
};
