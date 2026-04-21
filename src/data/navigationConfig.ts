export interface NavItem {
  id: string;
  path: string;
  label: string;
  icon: string; // lucide-react icon name
  description: string;
  recommendedFor: string[]; // business types
}

export const availableNavItems: NavItem[] = [
  { 
    id: 'dashboard', 
    path: '/dashboard', 
    label: 'Home', 
    icon: 'Home', 
    description: 'Your financial overview', 
    recommendedFor: ['all'] 
  },
  { 
    id: 'log', 
    path: '/log', 
    label: 'Money', 
    icon: 'FileText', 
    description: 'Income & expenses', 
    recommendedFor: ['all'] 
  },
  { 
    id: 'mileage', 
    path: '/mileage', 
    label: 'Mileage', 
    icon: 'Car', 
    description: 'Track business miles', 
    recommendedFor: ['delivery_driver', 'tradesperson', 'consultant'] 
  },
  { 
    id: 'learn', 
    path: '/learn', 
    label: 'Learning', 
    icon: 'BookOpen', 
    description: 'Tax education hub', 
    recommendedFor: ['all'] 
  },
  { 
    id: 'tax', 
    path: '/tax', 
    label: 'Tax', 
    icon: 'Receipt', 
    description: 'VAT returns & submissions', 
    recommendedFor: ['all'] 
  },
  { 
    id: 'settings', 
    path: '/settings', 
    label: 'Settings', 
    icon: 'Settings', 
    description: 'Account & preferences', 
    recommendedFor: ['all'] 
  },
  { 
    id: 'glossary', 
    path: '/glossary', 
    label: 'Glossary', 
    icon: 'BookText', 
    description: 'Tax dictionary', 
    recommendedFor: ['beginner'] 
  },
  {
    id: 'payroll',
    path: '/payroll',
    label: 'Payroll',
    icon: 'Banknote',
    description: 'Director salary, contractors, employees',
    recommendedFor: ['solo_founder']
  }
];

// Optional modules — only shown in nav when user explicitly enables them
export const OPTIONAL_NAV_IDS = ['mileage', 'payroll'] as const;
// Note: invoicing isn't a separate nav item (it's a tab inside Money/Log),
// but the same opt-in flag (`profiles.invoicing_enabled`) controls it.

export const getDefaultNavItems = (_businessType?: string, experienceLevel?: string): string[] => {
  // Stripped to essentials: Dashboard / Money / Learn / Tax for everyone.
  // Mileage / Payroll / Invoicing are opt-in via Settings → Optional Modules.
  if (experienceLevel === 'beginner') {
    return ['dashboard', 'log', 'learn', 'glossary'];
  }
  return ['dashboard', 'log', 'learn', 'tax'];
};
