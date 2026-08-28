'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type ColorBrand = 'sky' | 'google' | 'whatsapp' | 'meta' | 'midnight';
export type Mode = 'light' | 'dark';

interface ThemeContextType {
  mode: Mode;
  brand: ColorBrand;
  setMode: (mode: Mode) => void;
  setBrand: (brand: ColorBrand) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<Mode>('light');
  const [brand, setBrandState] = useState<ColorBrand>('sky');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const savedMode = (localStorage.getItem('dockerplay_theme_mode') as Mode) || 'light';
      const savedBrand = (localStorage.getItem('dockerplay_theme_brand') as ColorBrand) || 'sky';
      setModeState(savedMode);
      setBrandState(savedBrand);
      applyTheme(savedMode, savedBrand);
    } catch {
      applyTheme('light', 'sky');
    }
    setMounted(true);
  }, []);

  const applyTheme = (newMode: Mode, newBrand: ColorBrand) => {
    if (typeof document === 'undefined') return;
    const html = document.documentElement;

    html.classList.remove('light', 'dark');
    html.classList.add(newMode);

    html.setAttribute('data-brand', newBrand);
    html.setAttribute('data-mode', newMode);
  };

  const setMode = (newMode: Mode) => {
    setModeState(newMode);
    try {
      localStorage.setItem('dockerplay_theme_mode', newMode);
    } catch {}
    applyTheme(newMode, brand);
  };

  const setBrand = (newBrand: ColorBrand) => {
    setBrandState(newBrand);
    try {
      localStorage.setItem('dockerplay_theme_brand', newBrand);
    } catch {}
    applyTheme(mode, newBrand);
  };

  const toggleMode = () => {
    const next = mode === 'light' ? 'dark' : 'light';
    setMode(next);
  };

  return (
    <ThemeContext.Provider value={{ mode, brand, setMode, setBrand, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
