import { useEffect } from 'react';

interface ThemeConfig {
  [key: string]: any;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  mutedColor: string;
  borderColor: string;
  fontFamily: string;
  headingFont: string;
  fontSize: any;
  containerWidth: string;
  borderRadius: string;
  spacing: any;
  header: any;
  hero: any;
  products: any;
  footer: any;
  customCSS: string;
}

interface CustomStoreRendererProps {
  theme: ThemeConfig;
  storeName: string;
  children: React.ReactNode;
}

const CustomStoreRenderer = ({ theme, storeName, children }: CustomStoreRendererProps) => {
  useEffect(() => {
    // Set page title
    document.title = storeName;
    
    // Load Google Fonts dynamically
    const loadGoogleFonts = () => {
      const fonts = [theme.fontFamily, theme.headingFont].filter(Boolean);
      const uniqueFonts = [...new Set(fonts)];
      
      uniqueFonts.forEach(font => {
        if (font && font !== 'inherit') {
          const fontUrl = `https://fonts.googleapis.com/css2?family=${font.replace(' ', '+')}:wght@300;400;500;600;700&display=swap`;
          
          // Check if font is already loaded
          const existingLink = document.querySelector(`link[href*="${font}"]`);
          if (!existingLink) {
            const link = document.createElement('link');
            link.href = fontUrl;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
          }
        }
      });
    };

    // Inject custom CSS
    const styleId = 'custom-store-styles';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }
    
    styleElement.textContent = generateCSSVariables();
    loadGoogleFonts();

    // Cleanup on unmount
    return () => {
      const element = document.getElementById(styleId);
      if (element) {
        element.remove();
      }
    };
  }, [theme, storeName]);

  // Generate CSS variables from theme
  const generateCSSVariables = () => {
    return `
      :root {
        --store-primary: ${theme.primaryColor};
        --store-secondary: ${theme.secondaryColor};
        --store-accent: ${theme.accentColor};
        --store-bg: ${theme.backgroundColor};
        --store-text: ${theme.textColor};
        --store-muted: ${theme.mutedColor};
        --store-border: ${theme.borderColor};
        --store-font-family: '${theme.fontFamily}', sans-serif;
        --store-heading-font: '${theme.headingFont}', sans-serif;
        --store-container-width: ${theme.containerWidth};
        --store-border-radius: ${theme.borderRadius};
        
        /* Spacing */
        --store-spacing-xs: ${theme.spacing?.xs || '0.5rem'};
        --store-spacing-sm: ${theme.spacing?.sm || '1rem'};
        --store-spacing-md: ${theme.spacing?.md || '1.5rem'};
        --store-spacing-lg: ${theme.spacing?.lg || '2rem'};
        --store-spacing-xl: ${theme.spacing?.xl || '3rem'};
        
        /* Typography */
        --store-text-xs: ${theme.fontSize?.xs || '0.75rem'};
        --store-text-sm: ${theme.fontSize?.sm || '0.875rem'};
        --store-text-base: ${theme.fontSize?.base || '1rem'};
        --store-text-lg: ${theme.fontSize?.lg || '1.125rem'};
        --store-text-xl: ${theme.fontSize?.xl || '1.25rem'};
        --store-text-2xl: ${theme.fontSize?.['2xl'] || '1.5rem'};
        --store-text-3xl: ${theme.fontSize?.['3xl'] || '1.875rem'};
        --store-text-4xl: ${theme.fontSize?.['4xl'] || '2.25rem'};
        
        /* Components */
        --store-header-height: ${theme.header?.height || '4rem'};
        --store-header-bg: ${theme.header?.background || 'transparent'};
        --store-logo-size: ${theme.header?.logoSize || '2.5rem'};
        
        --store-hero-height: ${theme.hero?.height || '500px'};
        --store-hero-text-align: ${theme.hero?.textAlign || 'center'};
        
        --store-footer-bg: ${theme.footer?.background || '#1f2937'};
        --store-footer-text: ${theme.footer?.textColor || '#ffffff'};
        
        /* Products */
        --store-grid-cols: ${theme.products?.gridCols || 4};
      }
      
      /* Custom store styles */
      .custom-store {
        font-family: var(--store-font-family);
        background-color: var(--store-bg);
        color: var(--store-text);
      }
      
      .custom-store h1, .custom-store h2, .custom-store h3, .custom-store h4, .custom-store h5, .custom-store h6 {
        font-family: var(--store-heading-font);
      }
      
      .custom-store .store-container {
        max-width: var(--store-container-width);
        margin: 0 auto;
        padding: 0 1rem;
      }
      
      .custom-store .store-header {
        height: var(--store-header-height);
        background: var(--store-header-bg);
      }
      
      .custom-store .store-logo {
        height: var(--store-logo-size);
        width: var(--store-logo-size);
      }
      
      .custom-store .store-hero {
        height: var(--store-hero-height);
        text-align: var(--store-hero-text-align);
        background: linear-gradient(135deg, var(--store-primary), var(--store-secondary));
      }
      
      .custom-store .store-products-grid {
        display: grid;
        grid-template-columns: repeat(var(--store-grid-cols), minmax(0, 1fr));
        gap: var(--store-spacing-lg);
      }
      
      @media (max-width: 1024px) {
        .custom-store .store-products-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
      }
      
      @media (max-width: 768px) {
        .custom-store .store-products-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      
      @media (max-width: 480px) {
        .custom-store .store-products-grid {
          grid-template-columns: 1fr;
        }
      }
      
      .custom-store .store-button-primary {
        background-color: var(--store-primary);
        border-color: var(--store-primary);
        color: white;
        border-radius: var(--store-border-radius);
        transition: all 0.2s ease;
      }
      
      .custom-store .store-button-primary:hover {
        background-color: color-mix(in srgb, var(--store-primary) 80%, black);
        border-color: color-mix(in srgb, var(--store-primary) 80%, black);
      }
      
      .custom-store .store-button-secondary {
        background-color: var(--store-secondary);
        border-color: var(--store-secondary);
        color: white;
        border-radius: var(--store-border-radius);
        transition: all 0.2s ease;
      }
      
      .custom-store .store-button-accent {
        background-color: var(--store-accent);
        border-color: var(--store-accent);
        color: white;
        border-radius: var(--store-border-radius);
        transition: all 0.2s ease;
      }
      
      .custom-store .store-card {
        border-radius: var(--store-border-radius);
        border: 1px solid var(--store-border);
        background: white;
        overflow: hidden;
        transition: all 0.2s ease;
      }
      
      .custom-store .store-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
      }
      
      /* Modern card style */
      .custom-store .store-card.modern {
        border-radius: calc(var(--store-border-radius) * 2);
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      }
      
      /* Classic card style */
      .custom-store .store-card.classic {
        border-radius: 0;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      
      /* Minimal card style */
      .custom-store .store-card.minimal {
        border: none;
        border-radius: var(--store-border-radius);
        box-shadow: none;
        background: transparent;
      }
      
      .custom-store .store-footer {
        background: var(--store-footer-bg);
        color: var(--store-footer-text);
      }
      
      /* Custom spacing utilities */
      .custom-store .store-spacing-xs { padding: var(--store-spacing-xs); }
      .custom-store .store-spacing-sm { padding: var(--store-spacing-sm); }
      .custom-store .store-spacing-md { padding: var(--store-spacing-md); }
      .custom-store .store-spacing-lg { padding: var(--store-spacing-lg); }
      .custom-store .store-spacing-xl { padding: var(--store-spacing-xl); }
      
      .custom-store .store-gap-xs { gap: var(--store-spacing-xs); }
      .custom-store .store-gap-sm { gap: var(--store-spacing-sm); }
      .custom-store .store-gap-md { gap: var(--store-spacing-md); }
      .custom-store .store-gap-lg { gap: var(--store-spacing-lg); }
      .custom-store .store-gap-xl { gap: var(--store-spacing-xl); }
      
      /* Typography utilities */
      .custom-store .store-text-xs { font-size: var(--store-text-xs); }
      .custom-store .store-text-sm { font-size: var(--store-text-sm); }
      .custom-store .store-text-base { font-size: var(--store-text-base); }
      .custom-store .store-text-lg { font-size: var(--store-text-lg); }
      .custom-store .store-text-xl { font-size: var(--store-text-xl); }
      .custom-store .store-text-2xl { font-size: var(--store-text-2xl); }
      .custom-store .store-text-3xl { font-size: var(--store-text-3xl); }
      .custom-store .store-text-4xl { font-size: var(--store-text-4xl); }
      
      ${theme.customCSS || ''}
    `;
  };

  return (
    <div className="custom-store min-h-screen">
      {children}
    </div>
  );
};

export default CustomStoreRenderer;