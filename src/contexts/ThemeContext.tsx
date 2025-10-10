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
    id: 'light',
    name: 'Light Mode',
    description: 'Fresh and bright',
    colors: {
      background: '188 100% 93%', // #d9faff
      foreground: '210 100% 5%', // #000a17
      card: '0 0% 100%', // #ffffff
      cardForeground: '210 100% 5%',
      popover: '0 0% 100%',
      popoverForeground: '210 100% 5%',
      
      primary: '213 100% 25%', // #00367d
      primaryForeground: '0 0% 100%',
      
      secondary: '188 100% 82%', // #a6f3ff
      secondaryForeground: '210 100% 5%',
      
      muted: '188 80% 85%',
      mutedForeground: '210 100% 15%',
      
      accent: '188 100% 82%', // #a6f3ff
      accentForeground: '210 100% 5%',
      
      border: '188 50% 80%',
      input: '188 50% 80%',
      ring: '213 100% 25%',
      
      success: '142 71% 45%',
      warning: '38 92% 50%',
      destructive: '0 84% 60%',
      info: '213 100% 25%',
    },
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    description: 'Deep and focused',
    colors: {
      background: '210 100% 5%', // #000a17
      foreground: '0 0% 100%', // #ffffff
      card: '210 100% 15%', // #00204a
      cardForeground: '0 0% 100%',
      popover: '210 100% 15%',
      popoverForeground: '0 0% 100%',
      
      primary: '213 100% 25%', // #00367d
      primaryForeground: '0 0% 100%',
      
      secondary: '188 100% 82%', // #a6f3ff
      secondaryForeground: '210 100% 5%',
      
      muted: '210 100% 20%',
      mutedForeground: '188 100% 82%',
      
      accent: '188 100% 82%', // #a6f3ff
      accentForeground: '210 100% 5%',
      
      border: '210 100% 25%',
      input: '210 100% 25%',
      ring: '213 100% 25%',
      
      success: '142 71% 45%',
      warning: '38 92% 50%',
      destructive: '0 84% 60%',
      info: '213 100% 25%',
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
    return colorPalettes.find(p => p.id === saved) || colorPalettes[0]; // Default to light mode
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
