'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole } from '@/types';

interface AdminAuthState {
  adminUser: User | null;
  isAdminAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  adminStep: 'login' | 'otp' | 'success';
  adminLocale: 'ar' | 'en';

  login: (email: string, pass: string) => Promise<boolean>;
  verifyOtp: (code: string) => Promise<boolean>;
  logout: () => void;
  setError: (error: string | null) => void;
  setStep: (step: 'login' | 'otp' | 'success') => void;
  setAdminLocale: (locale: 'ar' | 'en') => void;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set, get) => ({
      adminUser: null,
      isAdminAuthenticated: false,
      isLoading: false,
      error: null,
      adminStep: 'login',
      adminLocale: 'ar',

      login: async (email: string, pass: string) => {
        set({ isLoading: true, error: null });
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Demo admin credentials
        if (email === 'admin@charyday.com' && pass === 'admin123') {
          set({ adminStep: 'otp', isLoading: false });
          return true;
        } else {
          set({ isLoading: false, error: 'بيانات الدخول غير صحيحة' });
          return false;
        }
      },

      verifyOtp: async (code: string) => {
        set({ isLoading: true, error: null });
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (code === '123456') {
          const mockAdmin: User = {
            id: 'admin-001',
            email: 'admin@charyday.com',
            name: 'مدير النظام',
            nameEn: 'Super Admin',
            role: 'admin',
            isActive: true,
            isVerified: true,
            locale: 'ar',
            createdAt: new Date().toISOString(),
          };

          set({
            adminUser: mockAdmin,
            isAdminAuthenticated: true,
            isLoading: false,
            adminStep: 'success',
          });
          return true;
        } else {
          set({ isLoading: false, error: 'رمز التحقق غير صحيح' });
          return false;
        }
      },

      logout: () => {
        set({
          adminUser: null,
          isAdminAuthenticated: false,
          adminStep: 'login',
          error: null,
        });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('platform-admin-auth-store');
        }
      },

      setError: (error) => set({ error }),
      setStep: (adminStep) => set({ adminStep }),
      setAdminLocale: (adminLocale) => set({ adminLocale }),
    }),
    {
      name: 'platform-admin-auth-store',
      partialize: (state) => ({
        adminUser: state.adminUser,
        isAdminAuthenticated: state.isAdminAuthenticated,
        adminLocale: state.adminLocale,
      }),
    }
  )
);
