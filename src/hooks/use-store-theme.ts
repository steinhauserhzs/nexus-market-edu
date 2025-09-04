import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ThemeConfig {
  [key: string]: any;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  headingFont: string;
  containerWidth: string;
  borderRadius: string;
  customCSS: string;
}

const defaultTheme: ThemeConfig = {
  primaryColor: "#3b82f6",
  secondaryColor: "#6366f1", 
  accentColor: "#f59e0b",
  backgroundColor: "#ffffff",
  textColor: "#1f2937",
  mutedColor: "#6b7280",
  borderColor: "#e5e7eb",
  fontFamily: "Inter",
  headingFont: "Inter",
  containerWidth: "1200px",
  borderRadius: "0.5rem",
  customCSS: "",
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem", 
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem"
  },
  spacing: {
    xs: "0.5rem",
    sm: "1rem",
    md: "1.5rem", 
    lg: "2rem",
    xl: "3rem"
  },
  header: {
    height: "4rem",
    background: "transparent",
    logoSize: "2.5rem",
    menuStyle: "horizontal"
  },
  hero: {
    height: "500px",
    background: "gradient",
    overlay: "0.2",
    textAlign: "center"
  },
  products: {
    gridCols: 4,
    cardStyle: "modern",
    imageAspect: "square"
  },
  footer: {
    background: "#1f2937",
    textColor: "#ffffff"
  }
};

export const useStoreTheme = (storeSlug?: string) => {
  const [theme, setTheme] = useState<ThemeConfig>(defaultTheme);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTheme = async (slug: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: store, error: storeError } = await supabase
        .from('stores')
        .select('theme')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (storeError) {
        throw storeError;
      }

      const storeTheme = store?.theme || {};
      const mergedTheme = { ...defaultTheme, ...(storeTheme as Partial<ThemeConfig>) };
      
      setTheme(mergedTheme);
      
    } catch (err: any) {
      console.error('Error fetching theme:', err);
      setError(err.message);
      setTheme(defaultTheme);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (storeSlug) {
      fetchTheme(storeSlug);
    }
  }, [storeSlug]);

  const updateTheme = (newTheme: Partial<ThemeConfig>) => {
    setTheme(prev => ({ ...prev, ...newTheme }));
  };

  const resetTheme = () => {
    setTheme(defaultTheme);
  };

  return {
    theme,
    loading,
    error,
    updateTheme,
    resetTheme,
    fetchTheme
  };
};

export const applyThemeToDocument = (theme: ThemeConfig) => {
  const root = document.documentElement;
  
  // Apply CSS variables
  Object.entries({
    '--store-primary': theme.primaryColor,
    '--store-secondary': theme.secondaryColor,
    '--store-accent': theme.accentColor,
    '--store-bg': theme.backgroundColor,
    '--store-text': theme.textColor,
    '--store-font-family': `'${theme.fontFamily}', sans-serif`,
    '--store-heading-font': `'${theme.headingFont}', sans-serif`,
    '--store-container-width': theme.containerWidth,
    '--store-border-radius': theme.borderRadius,
  }).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });

  // Apply Google Fonts
  const fonts = [theme.fontFamily, theme.headingFont].filter(Boolean);
  const uniqueFonts = [...new Set(fonts)];
  
  uniqueFonts.forEach(font => {
    if (font && font !== 'inherit') {
      const fontUrl = `https://fonts.googleapis.com/css2?family=${font.replace(' ', '+')}:wght@300;400;500;600;700&display=swap`;
      
      const existingLink = document.querySelector(`link[href*="${font}"]`);
      if (!existingLink) {
        const link = document.createElement('link');
        link.href = fontUrl;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
    }
  });

  // Apply custom CSS
  let styleElement = document.getElementById('custom-store-css') as HTMLStyleElement;
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = 'custom-store-css';
    document.head.appendChild(styleElement);
  }
  
  styleElement.textContent = theme.customCSS || '';
};