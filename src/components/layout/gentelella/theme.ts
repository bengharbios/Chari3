'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GentelellaThemeState {
  isDark: boolean;
  toggleDark: () => void;
  setDark: (isDark: boolean) => void;
}

export const useGentelellaTheme = create<GentelellaThemeState>()(
  persist(
    (set) => ({
      isDark: false, // Default to light mode for the new v4 look, or we can default to dark. Let's default to false.
      toggleDark: () => {
        set((state) => {
          const next = !state.isDark;
          document.documentElement.setAttribute('data-g-theme', next ? 'dark' : 'light');
          return { isDark: next };
        });
      },
      setDark: (isDark) => {
        set({ isDark });
        document.documentElement.setAttribute('data-g-theme', isDark ? 'dark' : 'light');
      }
    }),
    {
      name: 'gentelella-theme-storage',
    }
  )
);
