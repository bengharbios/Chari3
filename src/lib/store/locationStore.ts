import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LocationState {
  country: string;
  city: string;
  lat: number | null;
  lng: number | null;
  isAutoDetected: boolean;
  setLocation: (location: Partial<LocationState>) => void;
  resetLocation: () => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      country: '',
      city: '',
      lat: null,
      lng: null,
      isAutoDetected: false,
      setLocation: (location) => set((state) => ({ ...state, ...location })),
      resetLocation: () => set({ country: '', city: '', lat: null, lng: null, isAutoDetected: false })
    }),
    {
      name: 'user-delivery-location',
    }
  )
);
