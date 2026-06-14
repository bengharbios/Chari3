import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LocationState {
  country: string;
  city: string;
  lat: number | null;
  lng: number | null;
  setLocation: (location: Partial<LocationState>) => void;
  resetLocation: () => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      country: 'SA', // Default to Saudi Arabia for example
      city: 'الرياض',
      lat: null,
      lng: null,
      setLocation: (location) => set((state) => ({ ...state, ...location })),
      resetLocation: () => set({ country: 'SA', city: 'الرياض', lat: null, lng: null })
    }),
    {
      name: 'user-delivery-location',
    }
  )
);
