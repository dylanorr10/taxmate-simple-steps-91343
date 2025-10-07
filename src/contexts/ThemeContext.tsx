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
    id: 'modern-trust',
    name: 'Modern Trust',
    description: 'Calm fintech with a heart',
    colors: {
      background: '180 11% 97%',
      foreground: '186 12% 21%',
      card: '180 20% 100%',
      cardForeground: '186 12% 21%',
      popover: '180 11% 97%',
      popoverForeground: '186 12% 21%',
      
      primary: '187 47% 31%',
      primaryForeground: '0 0% 100%',
      
      secondary: '30 27% 87%',
      secondaryForeground: '186 12% 21%',
      
      muted: '180 11% 92%',
      mutedForeground: '186 12% 45%',
      
      accent: '177 47% 59%',
      accentForeground: '186 12% 21%',
      
      border: '180 11% 88%',
      input: '180 11% 88%',
      ring: '187 47% 31%',
      
      success: '142 71% 45%',
      warning: '38 92% 50%',
      destructive: '0 84% 60%',
      info: '187 47% 59%',
    },
  },
  {
    id: 'fresh-focus',
    name: 'Fresh Focus',
    description: 'A wellness app for your money',
    colors: {
      background: '60 20% 98%',
      foreground: '225 10% 19%',
      card: '60 30% 100%',
      cardForeground: '225 10% 19%',
      popover: '60 20% 98%',
      popoverForeground: '225 10% 19%',
      
      primary: '130 24% 57%',
      primaryForeground: '0 0% 100%',
      
      secondary: '28 43% 73%',
      secondaryForeground: '225 10% 19%',
      
      muted: '60 20% 93%',
      mutedForeground: '225 10% 45%',
      
      accent: '197 41% 66%',
      accentForeground: '225 10% 19%',
      
      border: '60 20% 89%',
      input: '60 20% 89%',
      ring: '130 24% 57%',
      
      success: '142 71% 45%',
      warning: '38 92% 50%',
      destructive: '0 84% 60%',
      info: '197 41% 66%',
    },
  },
  {
    id: 'calm-energy',
    name: 'Calm Energy',
    description: 'Serious about finance but easy to love',
    colors: {
      background: '210 20% 98%',
      foreground: '225 8% 22%',
      card: '210 30% 100%',
      cardForeground: '225 8% 22%',
      popover: '210 20% 98%',
      popoverForeground: '225 8% 22%',
      
      primary: '208 31% 28%',
      primaryForeground: '0 0% 100%',
      
      secondary: '125 11% 69%',
      secondaryForeground: '225 8% 22%',
      
      muted: '210 20% 93%',
      mutedForeground: '225 8% 45%',
      
      accent: '5 82% 73%',
      accentForeground: '225 8% 22%',
      
      border: '210 20% 89%',
      input: '210 20% 89%',
      ring: '208 31% 28%',
      
      success: '142 71% 45%',
      warning: '38 92% 50%',
      destructive: '0 84% 60%',
      info: '208 31% 60%',
    },
  },
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    description: 'Refreshing and trustworthy',
    colors: {
      background: '195 20% 95%',
      foreground: '190 20% 15%',
      card: '195 35% 100%',
      cardForeground: '190 20% 15%',
      popover: '195 20% 95%',
      popoverForeground: '190 20% 15%',
      
      primary: '190 58% 27%',
      primaryForeground: '0 0% 100%',
      
      secondary: '36 33% 76%',
      secondaryForeground: '190 20% 15%',
      
      muted: '195 20% 90%',
      mutedForeground: '190 20% 45%',
      
      accent: '165 57% 67%',
      accentForeground: '190 20% 15%',
      
      border: '195 20% 86%',
      input: '195 20% 86%',
      ring: '190 58% 27%',
      
      success: '142 71% 45%',
      warning: '38 92% 50%',
      destructive: '0 84% 60%',
      info: '190 58% 60%',
    },
  },
  {
    id: 'earth-sky',
    name: 'Earth & Sky',
    description: 'Grounded and harmonious',
    colors: {
      background: '40 29% 96%',
      foreground: '30 7% 16%',
      card: '40 40% 100%',
      cardForeground: '30 7% 16%',
      popover: '40 29% 96%',
      popoverForeground: '30 7% 16%',
      
      primary: '168 33% 26%',
      primaryForeground: '0 0% 100%',
      
      secondary: '145 28% 77%',
      secondaryForeground: '30 7% 16%',
      
      muted: '40 29% 91%',
      mutedForeground: '30 7% 45%',
      
      accent: '6 26% 70%',
      accentForeground: '30 7% 16%',
      
      border: '40 29% 87%',
      input: '40 29% 87%',
      ring: '168 33% 26%',
      
      success: '142 71% 45%',
      warning: '38 92% 50%',
      destructive: '0 84% 60%',
      info: '168 33% 60%',
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
