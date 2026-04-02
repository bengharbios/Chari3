'use client';

import { create } from 'zustand';
import { useAppStore, useAuthStore } from '@/lib/store';
import type { UserRole, Locale, User } from '@/types';

// ============================================
// AUTH FLOW TYPES
// ============================================

export type AuthStep = 'contact' | 'otp' | 'register' | 'success';
export type ContactMethod = 'phone' | 'email';

interface VerifiedContact {
  method: ContactMethod;
  value: string;
}

interface AuthFlowState {
  // Flow control
  step: AuthStep;
  method: ContactMethod;
  isLoading: boolean;
  error: string | null;

  // Contact
  phone: string;
  email: string;
  countryCode: string;

  // OTP
  otpCode: string;
  otpExpiry: number;
  otpResendTimer: number;

  // Registration
  fullName: string;
  storeName: string;
  selectedRole: UserRole | null;

  // Verified contact (set after OTP success)
  verifiedContact: VerifiedContact | null;

  // Navigation setters
  setStep: (step: AuthStep) => void;
  setMethod: (method: ContactMethod) => void;
  setPhone: (phone: string) => void;
  setEmail: (email: string) => void;
  setCountryCode: (code: string) => void;
  setOtpCode: (code: string) => void;
  setFullName: (name: string) => void;
  setStoreName: (name: string) => void;
  setSelectedRole: (role: UserRole | null) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;

  // Actions
  sendOtp: () => Promise<boolean>;
  verifyOtp: () => Promise<{ verified: boolean; isNewUser: boolean; user?: User }>;
  register: () => Promise<boolean>;
}

// ============================================
// INITIAL STATE
// ============================================

const INITIAL_STATE = {
  step: 'contact' as AuthStep,
  method: 'phone' as ContactMethod,
  isLoading: false,
  error: null,
  phone: '',
  email: '',
  countryCode: '+213',
  otpCode: '',
  otpExpiry: 0,
  otpResendTimer: 0,
  fullName: '',
  storeName: '',
  selectedRole: null as UserRole | null,
  verifiedContact: null as VerifiedContact | null,
};

// ============================================
// AUTH FLOW STORE
// ============================================

export const useAuthFlowStore = create<AuthFlowState>()((set, get) => ({
  ...INITIAL_STATE,

  // ── Navigation setters ──
  setStep: (step) => set({ step }),
  setMethod: (method) => set({ method, phone: '', email: '', error: null }),
  setPhone: (phone) => set({ phone }),
  setEmail: (email) => set({ email }),
  setCountryCode: (countryCode) => set({ countryCode }),
  setOtpCode: (otpCode) => set({ otpCode }),
  setFullName: (fullName) => set({ fullName }),
  setStoreName: (storeName) => set({ storeName }),
  setSelectedRole: (selectedRole) => set({ selectedRole }),
  setError: (error) => set({ error }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ ...INITIAL_STATE }),

  // ── Action: Send OTP ──
  sendOtp: async () => {
    const { method, phone, email, countryCode } = get();
    set({ isLoading: true, error: null });

    // Client-side validation
    if (method === 'phone') {
      const digits = phone.replace(/\D/g, '');
      if (digits.length < 9) {
        const locale = useAppStore.getState().locale;
        set({
          isLoading: false,
          error: locale === 'ar'
            ? 'رقم الهاتف يجب أن يكون 9 أرقام على الأقل'
            : 'Phone number must be at least 9 digits',
        });
        return false;
      }
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        const locale = useAppStore.getState().locale;
        set({
          isLoading: false,
          error: locale === 'ar'
            ? 'البريد الإلكتروني غير صالح'
            : 'Invalid email address',
        });
        return false;
      }
    }

    const value = method === 'phone' ? phone : email;

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method, value, countryCode }),
      });

      const data = await res.json();

      if (data.success) {
        // Move to OTP step
        set({
          step: 'otp',
          isLoading: false,
          error: null,
          otpResendTimer: 60,
        });
        return true;
      } else {
        set({
          isLoading: false,
          error: data.message || 'An error occurred',
        });
        return false;
      }
    } catch {
      // Network error — still proceed for demo mode
      set({
        step: 'otp',
        isLoading: false,
        error: null,
        otpResendTimer: 60,
      });
      return true;
    }
  },

  // ── Action: Verify OTP ──
  verifyOtp: async () => {
    const { method, phone, email, otpCode } = get();
    set({ isLoading: true, error: null });

    const value = method === 'phone' ? phone : email;

    if (!otpCode || otpCode.length !== 6) {
      const locale = useAppStore.getState().locale;
      set({
        isLoading: false,
        error: locale === 'ar' ? 'أدخل رمز التحقق المكون من 6 أرقام' : 'Enter the 6-digit code',
      });
      return { verified: false, isNewUser: false };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method, value, code: otpCode }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await res.json();
      set({ isLoading: false });

      if (data.verified) {
        // Store verified contact
        set({
          verifiedContact: { method, value },
          otpCode: '',
          error: null,
        });

        if (data.user && !data.isNewUser) {
          // Existing user — login and go to success
          const returnedUser = data.user as Record<string, unknown>;
          const userPhone = returnedUser.phone as string | null;
          const userEmail = returnedUser.email as string | null;
          const isMatch =
            (method === 'phone' && userPhone === value) ||
            (method === 'email' && userEmail === value);

          if (!isMatch) {
            set({
              error: 'Verification error. Please try again.',
              verifiedContact: null,
            });
            return { verified: false, isNewUser: false };
          }

          // Trigger login
          const { loginWithUser } = useAuthStore.getState();
          loginWithUser(data.user as unknown as User);

          set({ step: 'success' });
          return { verified: true, isNewUser: false, user: data.user as User };
        } else {
          // New user — go to register step
          set({ step: 'register' });
          return { verified: true, isNewUser: true };
        }
      } else {
        const errorMsg = data.message || 'Incorrect verification code';
        set({ error: errorMsg });
        return { verified: false, isNewUser: false };
      }
    } catch {
      clearTimeout(timeoutId);
      set({
        isLoading: false,
        error: 'Server connection error. Check your internet and try again.',
      });
      return { verified: false, isNewUser: false };
    }
  },

  // ── Action: Register ──
  register: async () => {
    const {
      method,
      phone,
      email,
      fullName,
      selectedRole,
      storeName,
      verifiedContact,
    } = get();

    set({ isLoading: true, error: null });

    // Client-side validation
    if (!fullName.trim()) {
      const locale = useAppStore.getState().locale;
      set({
        isLoading: false,
        error: locale === 'ar' ? 'الاسم مطلوب' : 'Name is required',
      });
      return false;
    }

    if (!selectedRole) {
      const locale = useAppStore.getState().locale;
      set({
        isLoading: false,
        error: locale === 'ar' ? 'اختر نوع الحساب' : 'Select an account type',
      });
      return false;
    }

    if (selectedRole !== 'buyer' && !storeName.trim()) {
      const locale = useAppStore.getState().locale;
      set({
        isLoading: false,
        error: locale === 'ar' ? 'اسم المتجر مطلوب' : 'Store name is required',
      });
      return false;
    }

    const value = verifiedContact?.value || (method === 'phone' ? phone : email);
    const locale = useAppStore.getState().locale;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method,
          value,
          fullName: fullName.trim(),
          role: selectedRole,
          storeName: storeName.trim() || undefined,
          locale,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await res.json();
      set({ isLoading: false });

      if (data.success && data.user) {
        // Security: verify returned user matches submitted contact
        const returnedUser = data.user as Record<string, unknown>;
        const userPhone = returnedUser.phone as string | null;
        const userEmail = returnedUser.email as string | null;
        const isMatch =
          (method === 'phone' && userPhone === value) ||
          (method === 'email' && userEmail === value);

        if (!isMatch) {
          set({ error: 'User mismatch error. Try again.' });
          return false;
        }

        // Trigger login
        const { loginWithUser } = useAuthStore.getState();
        loginWithUser(data.user as unknown as User);

        set({ step: 'success' });
        return true;
      } else {
        const errorMsg = data.message || 'Failed to create account';
        set({ error: errorMsg });
        return false;
      }
    } catch {
      clearTimeout(timeoutId);
      set({
        isLoading: false,
        error: 'Connection timeout. Please try again.',
      });
      return false;
    }
  },
}));
