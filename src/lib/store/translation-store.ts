import { create } from 'zustand';

export interface Language {
  code: string;
  name: string;
  nameEn: string;
  flag: string;
  direction: 'rtl' | 'ltr';
  isBuiltin?: boolean;
}

interface TranslationState {
  languages: Language[];
  dictionaries: Record<string, any>;
  isLoading: boolean;
  setLanguages: (languages: Language[]) => void;
  setDictionary: (locale: string, dict: any) => void;
  loadTranslations: (locale: string) => Promise<void>;
}

export const useTranslationStore = create<TranslationState>((set, get) => ({
  languages: [
    { code: 'ar', name: 'العربية',  nameEn: 'Arabic',   flag: '🇩🇿', direction: 'rtl', isBuiltin: true },
    { code: 'en', name: 'English',  nameEn: 'English',  flag: '🇬🇧', direction: 'ltr', isBuiltin: true },
    { code: 'fr', name: 'Français', nameEn: 'French',   flag: '🇫🇷', direction: 'ltr', isBuiltin: true },
  ],
  dictionaries: {},
  isLoading: false,
  setLanguages: (languages) => set({ languages }),
  setDictionary: (locale, dict) => set((state) => ({
    dictionaries: { ...state.dictionaries, [locale]: dict }
  })),
  loadTranslations: async (locale) => {
    // If dictionary for this locale is already loaded, we still fetch to check if the language list
    // is up to date, but we can do it conditionally or fetch once.
    // Let's fetch every time locale changes, so we always have latest changes.
    set({ isLoading: true });
    try {
      const res = await fetch(`/api/translations?locale=${locale}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          if (data.languages) {
            set({ languages: data.languages });
          }
          if (data.dict) {
            set((state) => ({
              dictionaries: { ...state.dictionaries, [locale]: data.dict }
            }));
          }
        }
      }
    } catch (error) {
      console.error('[loadTranslations error]', error);
    } finally {
      set({ isLoading: false });
    }
  }
}));
