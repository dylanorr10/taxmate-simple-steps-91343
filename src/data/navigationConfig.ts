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
  }
];

export const getDefaultNavItems = (businessType?: string, experienceLevel?: string): string[] => {
  // Smart defaults based on business type and experience
  if (businessType === 'delivery_driver') {
    return ['dashboard', 'log', 'mileage', 'learn'];
  }
  if (businessType === 'creative' || businessType === 'content_creator') {
    return ['dashboard', 'log', 'tax', 'learn'];
  }
  if (experienceLevel === 'beginner') {
    return ['dashboard', 'log', 'learn', 'glossary'];
  }
  // Default for everyone else
  return ['dashboard', 'log', 'mileage', 'learn'];
};
