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
    description: 'Clean and modern',
    colors: {
      background: '0 0% 100%', // #ffffff
      foreground: '200 16% 38%', // #687b88
      card: '0 0% 98%',
      cardForeground: '200 16% 38%',
      popover: '0 0% 100%',
      popoverForeground: '200 16% 38%',
      
      primary: '178 100% 40%', // #00CFC8
      primaryForeground: '0 0% 100%',
      
      secondary: '179 100% 51%', // #03fff6
      secondaryForeground: '200 16% 24%', // #3c474e
      
      muted: '200 16% 95%',
      mutedForeground: '200 16% 38%', // #687b88
      
      accent: '179 100% 51%', // #03fff6
      accentForeground: '200 16% 24%',
      
      border: '200 16% 85%',
      input: '200 16% 85%',
      ring: '178 100% 40%',
      
      success: '142 71% 45%',
      warning: '38 92% 50%',
      destructive: '0 84% 60%',
      info: '178 100% 40%',
    },
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    description: 'Sleek and sophisticated',
    colors: {
      background: '200 16% 24%', // #3c474e
      foreground: '0 0% 100%', // #ffffff
      card: '200 16% 28%',
      cardForeground: '0 0% 100%',
      popover: '200 16% 28%',
      popoverForeground: '0 0% 100%',
      
      primary: '178 100% 40%', // #00CFC8
      primaryForeground: '0 0% 100%',
      
      secondary: '179 100% 51%', // #03fff6
      secondaryForeground: '200 16% 24%', // #3c474e
      
      muted: '200 16% 32%',
      mutedForeground: '200 16% 70%',
      
      accent: '179 100% 51%', // #03fff6
      accentForeground: '200 16% 24%',
      
      border: '200 16% 38%',
      input: '200 16% 32%',
      ring: '178 100% 40%',
      
      success: '142 71% 45%',
      warning: '38 92% 50%',
      destructive: '0 84% 60%',
      info: '178 100% 40%',
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
