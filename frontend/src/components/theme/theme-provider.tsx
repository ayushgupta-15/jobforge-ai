'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getStoredTheme(): Theme | null {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }

  return null;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const stored = getStoredTheme();
    if (stored) {
      setThemeState(stored);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const root = document.documentElement;

    const applyTheme = () => {
      const activeTheme = theme === 'system' ? (mediaQuery.matches ? 'dark' : 'light') : theme;

      setResolvedTheme(activeTheme);
      root.classList.toggle('dark', activeTheme === 'dark');
      root.dataset.theme = activeTheme;
      root.style.colorScheme = activeTheme;
      localStorage.setItem('theme', theme);
    };

    applyTheme();

    if (theme === 'system') {
      const handler = () => applyTheme();

      if (typeof mediaQuery.addEventListener === 'function') {
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
      }

      mediaQuery.addListener(handler);
      return () => mediaQuery.removeListener(handler);
    }
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme: (nextTheme: Theme) => setThemeState(nextTheme),
    }),
    [theme, resolvedTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }

  return context;
}

export type { Theme };
