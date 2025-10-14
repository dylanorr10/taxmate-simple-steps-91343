export type BusinessType = 'trades' | 'creative' | 'professional' | 'health' | 'transport' | 'other';

export interface BusinessTypeConfig {
  priorityLessons: string[];
  hiddenLessons: string[];
  customExamples: Record<string, string[]>;
  quickRefCards: string[];
}

export const businessTypeConfig: Record<BusinessType, BusinessTypeConfig> = {
  trades: {
    priorityLessons: ['claiming-expenses', 'vat-explained', 'cis-basics', 'mileage-tracking'],
    hiddenLessons: ['digital-services-tax', 'copyright-basics'],
    customExamples: {
      'claiming-expenses': ['Van insurance', 'Power tools', 'Safety gear', 'Trade materials', 'Protective clothing'],
      'mileage-tracking': ['Job site visits', 'Client quotes', 'Supplier pickups', 'Site inspections'],
      'vat-explained': ['Materials purchases', 'Tool rentals', 'Subcontractor invoices'],
      'understanding-profit': ['Material costs', 'Labor costs', 'Equipment depreciation']
    },
    quickRefCards: ['CIS Deduction Calculator', 'Tool & Equipment Depreciation', 'Mileage Log Template']
  },
  creative: {
    priorityLessons: ['claiming-expenses', 'home-office', 'copyright-basics', 'invoicing-clients'],
    hiddenLessons: ['cis-basics', 'stock-management'],
    customExamples: {
      'claiming-expenses': ['Adobe subscriptions', 'Camera equipment', 'Stock photos', 'Website hosting', 'Portfolio printing'],
      'home-office': ['Studio space deduction', 'Lighting equipment', 'Computer upgrades', 'Internet costs'],
      'invoicing-clients': ['Project deposits', 'Milestone payments', 'Usage rights fees'],
      'understanding-profit': ['Equipment costs', 'Software subscriptions', 'Marketing expenses']
    },
    quickRefCards: ['Freelance Invoice Template', 'Copyright & IP Guide', 'Home Studio Expense Calculator']
  },
  professional: {
    priorityLessons: ['tax-planning', 'invoicing-clients', 'home-office', 'claiming-expenses'],
    hiddenLessons: ['stock-management', 'cis-basics', 'vehicle-expenses'],
    customExamples: {
      'claiming-expenses': ['Professional indemnity insurance', 'Office rent', 'CPD courses', 'Software licenses', 'Professional memberships'],
      'invoicing-clients': ['Retainer agreements', 'Late payment terms', 'Professional fees', 'Consultancy rates'],
      'home-office': ['Home office deduction', 'Dedicated workspace', 'Utilities proportion'],
      'tax-planning': ['Pension contributions', 'Dividend strategies', 'Tax-efficient timing']
    },
    quickRefCards: ['Consulting Rate Calculator', 'Retainer Agreement Template', 'Professional Expense Guide']
  },
  health: {
    priorityLessons: ['claiming-expenses', 'home-office', 'invoicing-clients', 'vat-explained'],
    hiddenLessons: ['cis-basics', 'stock-management', 'vehicle-expenses'],
    customExamples: {
      'claiming-expenses': ['Product supplies', 'Treatment bed', 'Professional insurance', 'Room rent', 'Consumables'],
      'home-office': ['Treatment room deduction', 'Equipment depreciation', 'Cleaning costs'],
      'invoicing-clients': ['Appointment booking fees', 'Treatment packages', 'Cancellation policies'],
      'vat-explained': ['VAT exemptions for health services', 'Mixed supplies']
    },
    quickRefCards: ['Treatment Pricing Guide', 'Appointment Income Tracker', 'Health & Beauty Expenses']
  },
  transport: {
    priorityLessons: ['mileage-tracking', 'vehicle-expenses', 'vat-explained', 'claiming-expenses'],
    hiddenLessons: ['home-office', 'copyright-basics'],
    customExamples: {
      'claiming-expenses': ['Fuel', 'Vehicle insurance', 'MOT & servicing', 'Parking fees', 'Tolls'],
      'mileage-tracking': ['Client pickups', 'Package deliveries', 'Return journeys', 'Multi-drop routes'],
      'vehicle-expenses': ['Fuel costs', 'Repairs', 'Road tax', 'Breakdown cover'],
      'vat-explained': ['Fuel VAT recovery', 'Vehicle purchase VAT']
    },
    quickRefCards: ['Mileage vs Actual Costs Calculator', 'Fuel Receipt Log', 'Vehicle Expense Tracker']
  },
  other: {
    priorityLessons: ['mtd-basics', 'claiming-expenses', 'tax-planning', 'understanding-profit'],
    hiddenLessons: [],
    customExamples: {
      'claiming-expenses': ['Office supplies', 'Software subscriptions', 'Marketing costs', 'Website hosting'],
      'understanding-profit': ['Revenue tracking', 'Expense categorization', 'Profit margins'],
      'tax-planning': ['Tax deadlines', 'Allowances', 'Record keeping'],
      'mtd-basics': ['Digital record keeping', 'HMRC compatibility', 'Submission process']
    },
    quickRefCards: ['Expense Allowances Cheatsheet', 'Tax Deadlines Calendar', 'Profit Calculator']
  }
};

export const getExamples = (lessonId: string, businessType: BusinessType): string[] => {
  const config = businessTypeConfig[businessType];
  return config?.customExamples?.[lessonId] || businessTypeConfig.other.customExamples[lessonId] || [];
};

export const getBusinessTypeLabel = (businessType: BusinessType): string => {
  const labels: Record<BusinessType, string> = {
    trades: 'Trades & Manual Work',
    creative: 'Creative & Tech',
    professional: 'Professional Services',
    health: 'Health & Beauty',
    transport: 'Transport & Delivery',
    other: 'Other'
  };
  return labels[businessType];
};
