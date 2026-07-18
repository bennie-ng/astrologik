import React, { createContext, useContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { darkTheme, lightTheme, type Theme } from './tokens';

interface ThemeContextValue {
  theme: Theme;
  /** null = follow system */
  override: 'light' | 'dark' | null;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: lightTheme,
  override: null,
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [override, setOverride] = useState<'light' | 'dark' | null>(null);
  const scheme = override ?? system ?? 'light';
  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: scheme === 'dark' ? darkTheme : lightTheme,
      override,
      toggle: () => setOverride(scheme === 'dark' ? 'light' : 'dark'),
    }),
    [scheme, override],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
