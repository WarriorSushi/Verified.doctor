// Theme configuration for public profiles
// Layouts control structure, Themes control colors

export interface ThemeColors {
  // Background colors
  background: string;
  backgroundAlt: string;

  // Primary brand color (buttons, links, accents)
  primary: string;
  primaryHover: string;

  // Accent color (highlights, badges)
  accent: string;

  // Text colors
  text: string;
  textMuted: string;
  textOnPrimary: string;

  // Card/surface colors
  card: string;
  cardBorder: string;

  // Special effects
  gradientFrom?: string;
  gradientTo?: string;
  isDark?: boolean;
}

export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  colors: ThemeColors;
}

export interface LayoutConfig {
  id: string;
  name: string;
  description: string;
  preview: string; // Brief visual description
}

// Available layouts
export const LAYOUTS: LayoutConfig[] = [
  {
    id: "classic",
    name: "Classic",
    description: "Apple-style ultra-minimal single-column",
    preview: "Pure whitespace, clean horizontal sections",
  },
  {
    id: "hero",
    name: "Hero",
    description: "Bold dramatic full-bleed header",
    preview: "Large hero banner with floating cards",
  },
  {
    id: "timeline",
    name: "Timeline",
    description: "Editorial magazine with vertical timeline",
    preview: "Serif typography, warm ivory background",
  },
  {
    id: "magazine",
    name: "Magazine",
    description: "Asymmetric editorial portfolio style",
    preview: "Fashion magazine aesthetic with offset photo",
  },
  {
    id: "grid",
    name: "Grid",
    description: "Modern Bento/dashboard card grid",
    preview: "SaaS-style cards of varying sizes",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Swiss/Bauhaus ultra-minimal design",
    preview: "Maximum whitespace, typography-focused",
  },
];

// Available color themes
export const THEMES: ThemeConfig[] = [
  {
    id: "blue",
    name: "Blue",
    description: "Clean professional blue",
    colors: {
      background: "#FFFFFF",
      backgroundAlt: "#F8FAFC",
      primary: "#0099F7",
      primaryHover: "#0080CC",
      accent: "#A4FDFF",
      text: "#0F172A",
      textMuted: "#64748B",
      textOnPrimary: "#FFFFFF",
      card: "#FFFFFF",
      cardBorder: "#E2E8F0",
      gradientFrom: "#0099F7",
      gradientTo: "#0080CC",
    },
  },
  {
    id: "ocean",
    name: "Ocean",
    description: "Soft blue professional",
    colors: {
      background: "#F8FCFE",
      backgroundAlt: "#EFF8FF",
      primary: "#0077B6",
      primaryHover: "#005A8C",
      accent: "#90E0EF",
      text: "#0A3D62",
      textMuted: "#457B9D",
      textOnPrimary: "#FFFFFF",
      card: "#FFFFFF",
      cardBorder: "#CAE9F5",
      gradientFrom: "#0077B6",
      gradientTo: "#00B4D8",
    },
  },
  {
    id: "sage",
    name: "Sage",
    description: "Calming green medical",
    colors: {
      background: "#F9FBF9",
      backgroundAlt: "#F0F5F0",
      primary: "#4A7C59",
      primaryHover: "#3D6B4A",
      accent: "#A8D5BA",
      text: "#1E3A2C",
      textMuted: "#5A7D6A",
      textOnPrimary: "#FFFFFF",
      card: "#FFFFFF",
      cardBorder: "#D4E5D8",
      gradientFrom: "#4A7C59",
      gradientTo: "#6B9B7A",
    },
  },
  {
    id: "warm",
    name: "Warm",
    description: "Soft cream with terracotta",
    colors: {
      background: "#FFFBF7",
      backgroundAlt: "#FFF5EB",
      primary: "#C4784F",
      primaryHover: "#A65F3A",
      accent: "#E8D5C4",
      text: "#3D2516",
      textMuted: "#8B6F54",
      textOnPrimary: "#FFFFFF",
      card: "#FFFFFF",
      cardBorder: "#E8D5C4",
      gradientFrom: "#C4784F",
      gradientTo: "#D4956B",
    },
  },
  {
    id: "teal",
    name: "Teal",
    description: "Bold teal with cyan accents",
    colors: {
      background: "#F0FDFA",
      backgroundAlt: "#CCFBF1",
      primary: "#0D9488",
      primaryHover: "#0F766E",
      accent: "#5EEAD4",
      text: "#134E4A",
      textMuted: "#5EEAD4",
      textOnPrimary: "#FFFFFF",
      card: "#FFFFFF",
      cardBorder: "#99F6E4",
      gradientFrom: "#0D9488",
      gradientTo: "#14B8A6",
    },
  },
  {
    id: "executive",
    name: "Executive",
    description: "Luxury dark mode with gold",
    colors: {
      background: "#0D0D14",
      backgroundAlt: "#1A1A24",
      primary: "#D4AF37",
      primaryHover: "#B8962F",
      accent: "#F5E6C4",
      text: "#F5F5DC",
      textMuted: "#9CA3AF",
      textOnPrimary: "#0D0D14",
      card: "#1A1A24",
      cardBorder: "#2D2D3A",
      gradientFrom: "#D4AF37",
      gradientTo: "#F5E6C4",
      isDark: true,
    },
  },
];

// Helper to get theme by ID
export function getTheme(themeId: string): ThemeConfig {
  return THEMES.find((t) => t.id === themeId) || THEMES[0];
}

// Helper to get layout by ID
export function getLayout(layoutId: string): LayoutConfig {
  return LAYOUTS.find((l) => l.id === layoutId) || LAYOUTS[0];
}

// Generate CSS variables from theme
export function themeToCssVars(theme: ThemeColors): Record<string, string> {
  return {
    "--theme-background": theme.background,
    "--theme-background-alt": theme.backgroundAlt,
    "--theme-primary": theme.primary,
    "--theme-primary-hover": theme.primaryHover,
    "--theme-accent": theme.accent,
    "--theme-text": theme.text,
    "--theme-text-muted": theme.textMuted,
    "--theme-text-on-primary": theme.textOnPrimary,
    "--theme-card": theme.card,
    "--theme-card-border": theme.cardBorder,
    "--theme-gradient-from": theme.gradientFrom || theme.primary,
    "--theme-gradient-to": theme.gradientTo || theme.primaryHover,
  };
}
