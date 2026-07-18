/**
 * Semantic design tokens — what components actually consume.
 * Every color exists in a light and a dark variant; components read
 * them through `useTheme()` and never hard-code hex values.
 */

import { palette } from './palette';

export interface ColorTokens {
  bg: {
    /** App background */
    canvas: string;
    /** Cards, sheets */
    surface: string;
    /** Raised elements on a surface (chips, inputs) */
    elevated: string;
    /** Tinted accent wash (selected states, hero badges) */
    accentSoft: string;
    /** Gold wash for festive rows */
    goldSoft: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    /** Text on accent.solid */
    onAccent: string;
    accent: string;
    /** Lunar-calendar figures */
    lunar: string;
  };
  accent: {
    /** Filled buttons, active tab, today marker */
    solid: string;
    /** Pressed / emphasized fill */
    strong: string;
    /** Hero gradient endpoints */
    gradient: [string, string];
  };
  state: {
    /** Hoàng đạo — auspicious */
    good: string;
    goodSoft: string;
    /** Hắc đạo — inauspicious */
    bad: string;
    /** Errors, invalid input */
    danger: string;
  };
  weekend: {
    sunday: string;
    saturday: string;
  };
  border: {
    subtle: string;
    strong: string;
    /** Focus ring / today ring */
    ring: string;
  };
}

export interface Theme {
  scheme: 'light' | 'dark';
  color: ColorTokens;
  space: typeof space;
  radius: typeof radius;
  type: typeof type;
  shadow: {
    card: object;
    floating: object;
  };
}

/** 4pt spacing scale. */
export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  full: 999,
} as const;

/** Type scale (system font). */
export const type = {
  display: { fontSize: 44, fontWeight: '800', letterSpacing: -1.5 },
  titleXL: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  title: { fontSize: 20, fontWeight: '700', letterSpacing: -0.3 },
  headline: { fontSize: 16, fontWeight: '700' },
  body: { fontSize: 15, fontWeight: '400' },
  label: { fontSize: 13, fontWeight: '600' },
  caption: { fontSize: 12, fontWeight: '500' },
  micro: { fontSize: 11, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase' },
} as const;

export const lightTheme: Theme = {
  scheme: 'light',
  color: {
    bg: {
      canvas: palette.ink[50],
      surface: palette.ink[0],
      elevated: palette.ink[100],
      accentSoft: palette.son[50],
      goldSoft: palette.gold[100],
    },
    text: {
      primary: palette.ink[900],
      secondary: palette.ink[600],
      tertiary: palette.ink[400],
      onAccent: palette.ink[0],
      accent: palette.son[600],
      lunar: palette.gold[700],
    },
    accent: {
      solid: palette.son[600],
      strong: palette.son[700],
      gradient: [palette.son[500], palette.son[800]],
    },
    state: {
      good: palette.jade[600],
      goodSoft: palette.jade[100],
      bad: palette.ink[400],
      danger: palette.son[500],
    },
    weekend: {
      sunday: palette.son[600],
      saturday: palette.bien[600],
    },
    border: {
      subtle: palette.ink[100],
      strong: palette.ink[200],
      ring: palette.son[600],
    },
  },
  space,
  radius,
  type,
  shadow: {
    card: {
      shadowColor: palette.ink[900],
      shadowOpacity: 0.06,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
    floating: {
      shadowColor: palette.ink[900],
      shadowOpacity: 0.14,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 8 },
      elevation: 8,
    },
  },
};

export const darkTheme: Theme = {
  scheme: 'dark',
  color: {
    bg: {
      canvas: palette.ink[950],
      surface: palette.ink[900],
      elevated: palette.ink[850],
      accentSoft: '#3A211B',
      goldSoft: '#3A2E14',
    },
    text: {
      primary: palette.ink[100],
      secondary: palette.ink[400],
      tertiary: palette.ink[500],
      onAccent: palette.ink[0],
      accent: palette.son[300],
      lunar: palette.gold[300],
    },
    accent: {
      solid: palette.son[500],
      strong: palette.son[400],
      gradient: [palette.son[600], palette.son[900]],
    },
    state: {
      good: palette.jade[300],
      goodSoft: '#123526',
      bad: palette.ink[500],
      danger: palette.son[400],
    },
    weekend: {
      sunday: palette.son[300],
      saturday: palette.bien[300],
    },
    border: {
      subtle: palette.ink[850],
      strong: palette.ink[700],
      ring: palette.son[400],
    },
  },
  space,
  radius,
  type,
  shadow: {
    card: {
      shadowColor: '#000000',
      shadowOpacity: 0.4,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
    floating: {
      shadowColor: '#000000',
      shadowOpacity: 0.5,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 8 },
      elevation: 8,
    },
  },
};
