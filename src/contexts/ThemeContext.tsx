import React, { createContext, useContext, useState, useEffect } from 'react';

export type ColorPalette = {
  id: string;
  name: string;
  description: string;
  colors: {
    // Backgrounds
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    popover: string;
    popoverForeground: string;
    
    // Primary colors
    primary: string;
    primaryForeground: string;
    
    // Secondary colors
    secondary: string;
    secondaryForeground: string;
    
    // Muted colors
    muted: string;
    mutedForeground: string;
    
    // Accent
    accent: string;
    accentForeground: string;
    
    // Borders and inputs
    border: string;
    input: string;
    ring: string;
    
    // Status colors (keep consistent across palettes)
    success: string;
    warning: string;
    destructive: string;
    info: string;
  };
};

export const colorPalettes: ColorPalette[] = [
  {
    id: 'sage-navy',
    name: 'Deep Navy & Sage Green',
    description: 'Calm, nature-inspired with green accents',
    colors: {
      background: '135 25% 92%', // #E8F3E8 - Light sage
      foreground: '215 45% 20%', // #1A365D - Deep navy
      card: '135 35% 88%', // #C8E6C9 - Sage green
      cardForeground: '215 45% 20%',
      popover: '135 35% 88%',
      popoverForeground: '215 45% 20%',
      
      primary: '215 45% 20%', // #1A365D - Deep navy
      primaryForeground: '0 0% 100%',
      
      secondary: '135 35% 45%', // Sage green
      secondaryForeground: '0 0% 100%',
      
      muted: '135 20% 85%',
      mutedForeground: '215 25% 35%',
      
      accent: '135 40% 55%',
      accentForeground: '0 0% 100%',
      
      border: '135 25% 75%',
      input: '135 25% 75%',
      ring: '215 45% 20%',
      
      success: '142 71% 45%',
      warning: '45 93% 47%',
      destructive: '0 84% 60%',
      info: '199 89% 48%',
    },
  },
  {
    id: 'slate-cream',
    name: 'Slate Blue & Warm Cream',
    description: 'Professional, warm, balanced',
    colors: {
      background: '35 30% 95%', // #F7F4ED - Warm cream
      foreground: '215 20% 35%', // #475569 - Slate blue
      card: '215 25% 92%', // #E2E8F0 - Light slate
      cardForeground: '215 20% 35%',
      popover: '215 25% 92%',
      popoverForeground: '215 20% 35%',
      
      primary: '215 20% 35%', // #475569 - Slate blue
      primaryForeground: '0 0% 100%',
      
      secondary: '35 45% 75%', // Warm beige
      secondaryForeground: '215 20% 35%',
      
      muted: '215 15% 88%',
      mutedForeground: '215 15% 45%',
      
      accent: '215 30% 55%',
      accentForeground: '0 0% 100%',
      
      border: '215 20% 80%',
      input: '215 20% 80%',
      ring: '215 20% 35%',
      
      success: '142 71% 45%',
      warning: '45 93% 47%',
      destructive: '0 84% 60%',
      info: '199 89% 48%',
    },
  },
  {
    id: 'forest-sand',
    name: 'Forest Green & Sand',
    description: 'Earthy, trustworthy, stable',
    colors: {
      background: '40 28% 93%', // #F5F1E8 - Sand
      foreground: '145 35% 20%', // #2F5233 - Forest green
      card: '80 25% 88%', // #DFE7D6 - Light green
      cardForeground: '145 35% 20%',
      popover: '80 25% 88%',
      popoverForeground: '145 35% 20%',
      
      primary: '145 35% 20%', // #2F5233 - Forest green
      primaryForeground: '0 0% 100%',
      
      secondary: '40 35% 70%', // Warm sand
      secondaryForeground: '145 35% 20%',
      
      muted: '80 20% 85%',
      mutedForeground: '145 25% 35%',
      
      accent: '145 45% 40%',
      accentForeground: '0 0% 100%',
      
      border: '80 20% 75%',
      input: '80 20% 75%',
      ring: '145 35% 20%',
      
      success: '142 71% 45%',
      warning: '45 93% 47%',
      destructive: '0 84% 60%',
      info: '199 89% 48%',
    },
  },
  {
    id: 'charcoal-seafoam',
    name: 'Charcoal & Seafoam',
    description: 'Modern, fresh, clean',
    colors: {
      background: '175 35% 92%', // #E0F2F1 - Seafoam
      foreground: '200 15% 25%', // #37474F - Charcoal
      card: '175 40% 85%', // #B2DFDB - Seafoam green
      cardForeground: '200 15% 25%',
      popover: '175 40% 85%',
      popoverForeground: '200 15% 25%',
      
      primary: '200 15% 25%', // #37474F - Charcoal
      primaryForeground: '0 0% 100%',
      
      secondary: '175 45% 65%', // Seafoam
      secondaryForeground: '200 15% 25%',
      
      muted: '175 25% 88%',
      mutedForeground: '200 15% 40%',
      
      accent: '175 50% 50%',
      accentForeground: '0 0% 100%',
      
      border: '175 30% 78%',
      input: '175 30% 78%',
      ring: '200 15% 25%',
      
      success: '142 71% 45%',
      warning: '45 93% 47%',
      destructive: '0 84% 60%',
      info: '199 89% 48%',
    },
  },
  {
    id: 'indigo-lavender',
    name: 'Indigo & Lavender Mist',
    description: 'Sophisticated, calm, approachable',
    colors: {
      background: '230 25% 96%', // #F3F4F9 - Lavender mist
      foreground: '231 48% 48%', // #3F51B5 - Indigo
      card: '235 30% 92%', // #E0E3F0 - Light lavender
      cardForeground: '231 48% 48%',
      popover: '235 30% 92%',
      popoverForeground: '231 48% 48%',
      
      primary: '231 48% 48%', // #3F51B5 - Indigo
      primaryForeground: '0 0% 100%',
      
      secondary: '235 35% 75%', // Lavender
      secondaryForeground: '231 48% 48%',
      
      muted: '235 25% 90%',
      mutedForeground: '231 30% 45%',
      
      accent: '231 55% 60%',
      accentForeground: '0 0% 100%',
      
      border: '235 25% 82%',
      input: '235 25% 82%',
      ring: '231 48% 48%',
      
      success: '142 71% 45%',
      warning: '45 93% 47%',
      destructive: '0 84% 60%',
      info: '199 89% 48%',
    },
  },
];

type ThemeContextType = {
  currentPalette: ColorPalette;
  setPalette: (paletteId: string) => void;
  palettes: ColorPalette[];
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPalette, setCurrentPalette] = useState<ColorPalette>(() => {
    const saved = localStorage.getItem('color-palette');
    return colorPalettes.find(p => p.id === saved) || colorPalettes[1]; // Default to Slate Blue
  });

  const setPalette = (paletteId: string) => {
    const palette = colorPalettes.find(p => p.id === paletteId);
    if (palette) {
      setCurrentPalette(palette);
      localStorage.setItem('color-palette', paletteId);
    }
  };

  useEffect(() => {
    // Apply CSS variables to the document root
    const root = document.documentElement;
    const colors = currentPalette.colors;
    
    Object.entries(colors).forEach(([key, value]) => {
      // Convert camelCase to kebab-case
      const cssVar = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      root.style.setProperty(`--${cssVar}`, value);
    });
  }, [currentPalette]);

  return (
    <ThemeContext.Provider value={{ currentPalette, setPalette, palettes: colorPalettes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
