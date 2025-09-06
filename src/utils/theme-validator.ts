export interface ThemeColors {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
}

export const validateHexColor = (color: string): boolean => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};

export const validateTheme = (theme: Partial<ThemeColors>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (theme.primaryColor && !validateHexColor(theme.primaryColor)) {
    errors.push('Cor primária deve ser um código hexadecimal válido');
  }
  
  if (theme.secondaryColor && !validateHexColor(theme.secondaryColor)) {
    errors.push('Cor secundária deve ser um código hexadecimal válido');
  }
  
  if (theme.accentColor && !validateHexColor(theme.accentColor)) {
    errors.push('Cor de destaque deve ser um código hexadecimal válido');
  }
  
  if (theme.backgroundColor && !validateHexColor(theme.backgroundColor)) {
    errors.push('Cor de fundo deve ser um código hexadecimal válido');
  }
  
  if (theme.textColor && !validateHexColor(theme.textColor)) {
    errors.push('Cor do texto deve ser um código hexadecimal válido');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const getContrastRatio = (color1: string, color2: string): number => {
  // Simple contrast ratio calculation
  const getLuminance = (hex: string): number => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };
  
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};

export const isAccessible = (backgroundColor: string, textColor: string): boolean => {
  const contrast = getContrastRatio(backgroundColor, textColor);
  return contrast >= 4.5; // WCAG AA standard
};

export const getDefaultTheme = (): ThemeColors => ({
  primaryColor: "#3b82f6",
  secondaryColor: "#6366f1", 
  accentColor: "#f59e0b",
  backgroundColor: "#ffffff",
  textColor: "#1f2937",
});

export const applyThemeToDocument = (theme: Partial<ThemeColors>) => {
  const root = document.documentElement;
  
  if (theme.primaryColor) {
    root.style.setProperty('--theme-primary', theme.primaryColor);
  }
  
  if (theme.secondaryColor) {
    root.style.setProperty('--theme-secondary', theme.secondaryColor);
  }
  
  if (theme.accentColor) {
    root.style.setProperty('--theme-accent', theme.accentColor);
  }
  
  if (theme.backgroundColor) {
    root.style.setProperty('--theme-background', theme.backgroundColor);
  }
  
  if (theme.textColor) {
    root.style.setProperty('--theme-text', theme.textColor);
  }
};