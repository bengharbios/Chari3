import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole, Locale, Theme, PageType, Product, CartItem } from '@/types';
import { useOnboardingStore, getVerificationItemsForRole } from '@/lib/store/onboarding';

// ============================================
// REJECTION DETAILS: fetch admin notes and rejected items from DB
// ============================================

async function fetchRejectionDetails(userId: string) {
  try {
    const res = await fetch(`/api/onboarding/status?userId=${userId}`);
    if (!res.ok) return;
    const data = await res.json();
    if (!data.success) return;

    const store = useOnboardingStore.getState();

    // Sync verification items with rejection status from DB
    if (data.items && data.items.length > 0) {
      store.setVerificationItems(
        data.items.map((item: { key: string; labelAr: string; labelEn: string; status: string; rejectionReason?: string }) => ({
          id: item.key,
          labelAr: item.labelAr,
          labelEn: item.labelEn,
          status: item.status as 'verified' | 'pending' | 'rejected' | 'required',
          rejectionReason: item.rejectionReason,
        }))
      );
    }

    // Set rejection reason from adminNotes (the actual human-readable message)
    if (data.adminNotes) {
      store.setRejectionReason(data.adminNotes);
    }

    // Set rejected items list from item keys
    if (data.rejectionReasons && data.rejectionReasons.length > 0) {
      store.setRejectedItems(data.rejectionReasons);
    }
  } catch {
    // Silently fail — polling in page.tsx will retry
  }
}

// ============================================
// DRAFT RESTORE: fetch saved data from DB and populate store
// ============================================

async function fetchDraftAndRestore(userId: string) {
  try {
    const res = await fetch(`/api/onboarding/draft?userId=${userId}`);
    if (!res.ok) return;
    const data = await res.json();
    if (!data.success || !data.hasDraft) return;

    const store = useOnboardingStore.getState();
    const setField = store.setField;

    // Restore common fields
    if (data.commercialRegisterNumber) setField('commercialRegisterNumber', data.commercialRegisterNumber);
    if (data.commercialRegisterFile) setField('commercialRegisterFile', data.commercialRegisterFile);
    if (data.iban) setField('iban', data.iban);
    if (data.beneficiaryName) setField('beneficiaryName', data.beneficiaryName);
    if (data.bankLetterFile) setField('bankLetterFile', data.bankLetterFile);
    if (data.idFrontFile) setField('idFrontFile', data.idFrontFile);
    if (data.idBackFile) setField('idBackFile', data.idBackFile);

    // Freelancer / seller specific
    if (data.freelanceDocumentFile) setField('freelanceDocumentFile', data.freelanceDocumentFile);
    if (data.freelancerIdFrontFile) setField('freelancerIdFrontFile', data.freelancerIdFrontFile);
    if (data.freelancerIdBackFile) setField('freelancerIdBackFile', data.freelancerIdBackFile);
    if (data.freelancerIban) setField('freelancerIban', data.freelancerIban);
    // Always mark liveness as completed when restoring draft data
    // (liveness is optional, and if draft exists, user already went through this step)
    setField('livenessCompleted', true);

    // Supplier specific
    if (data.commercialLicenseFile) setField('commercialLicenseFile', data.commercialLicenseFile);
    if (data.importLicenseFile) setField('importLicenseFile', data.importLicenseFile);
    if (data.supplierIban) setField('supplierIban', data.supplierIban);

    // Logistics specific
    if (data.transportLicenseFile) setField('transportLicenseFile', data.transportLicenseFile);
    if (data.insuranceCertificateFile) setField('insuranceCertificateFile', data.insuranceCertificateFile);
    if (data.numberOfVehicles) setField('numberOfVehicles', data.numberOfVehicles);
    if (data.numberOfDrivers) setField('numberOfDrivers', data.numberOfDrivers);
    if (data.logisticsIban) setField('logisticsIban', data.logisticsIban);

    // Jump to the last step user was on
    if (typeof data.step === 'number' && data.step > 0) {
      setField('currentStep', data.step);
    }

  } catch {
    // Silently fail — user starts from scratch
  }
}

// ============================================
// APP STORE (Global state)
// ============================================

interface AppState {
  locale: Locale;
  theme: Theme;
  currentPage: PageType;
  isSidebarOpen: boolean;
  isMobileMenuOpen: boolean;
  searchQuery: string;
  notifications: number;

  setLocale: (locale: Locale) => void;
  setTheme: (theme: Theme) => void;
  setCurrentPage: (page: PageType) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  setNotifications: (count: number) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      locale: 'ar',
      theme: 'light',
      currentPage: 'login',
      isSidebarOpen: true,
      isMobileMenuOpen: false,
      searchQuery: '',
      notifications: 5,

      setLocale: (locale) => set({ locale }),
      setTheme: (theme) => set({ theme }),
      setCurrentPage: (currentPage) => set({ currentPage, isMobileMenuOpen: false }),
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
      toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
      setMobileMenuOpen: (isMobileMenuOpen) => set({ isMobileMenuOpen }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setNotifications: (notifications) => set({ notifications }),
    }),
    {
      name: 'platform-app-store',
      partialize: (state) => ({ locale: state.locale, theme: state.theme }),
    }
  )
);

// ============================================
// AUTH STORE
// ============================================

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  loginAsDemo: (role: UserRole) => void;
  loginWithUser: (user: User) => void;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  clearError: () => void;
}

const DEMO_USERS: Record<UserRole, User> = {
  admin: {
    id: 'admin-001',
    email: 'admin@charyday.com',
    name: 'أحمد المدير',
    nameEn: 'Ahmed Admin',
    avatar: undefined,
    role: 'admin',
    isActive: true,
    isVerified: true,
    locale: 'ar',
    createdAt: new Date().toISOString(),
  },
  store_manager: {
    id: 'store-001',
    email: 'store@charyday.com',
    name: 'محمد المتجر',
    nameEn: 'Mohammed Store',
    avatar: undefined,
    role: 'store_manager',
    isActive: true,
    isVerified: true,
    locale: 'ar',
    createdAt: new Date().toISOString(),
  },
  seller: {
    id: 'seller-001',
    email: 'seller@charyday.com',
    name: 'خالد التاجر',
    nameEn: 'Khaled Seller',
    avatar: undefined,
    role: 'seller',
    isActive: true,
    isVerified: false,
    locale: 'ar',
    createdAt: new Date().toISOString(),
  },
  supplier: {
    id: 'supplier-001',
    email: 'supplier@charyday.com',
    name: 'عمر المورد',
    nameEn: 'Omar Supplier',
    avatar: undefined,
    role: 'supplier',
    isActive: true,
    isVerified: false,
    locale: 'ar',
    createdAt: new Date().toISOString(),
  },
  logistics: {
    id: 'logistics-001',
    email: 'delivery@charyday.com',
    name: 'سعد المندوب',
    nameEn: 'Saad Courier',
    avatar: undefined,
    role: 'logistics',
    isActive: true,
    isVerified: true,
    locale: 'ar',
    createdAt: new Date().toISOString(),
  },
  buyer: {
    id: 'buyer-001',
    email: 'buyer@charyday.com',
    name: 'فاطمة المشترية',
    nameEn: 'Fatima Buyer',
    avatar: undefined,
    role: 'buyer',
    isActive: true,
    isVerified: true,
    locale: 'ar',
    createdAt: new Date().toISOString(),
  },
};

const ROLE_TO_PAGE: Record<UserRole, PageType> = {
  admin: 'admin',
  store_manager: 'store',
  seller: 'seller',
  supplier: 'supplier',
  logistics: 'logistics',
  buyer: 'buyer',
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, _password: string) => {
        set({ isLoading: true, error: null });
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const role = Object.entries(DEMO_USERS).find(
          ([, u]) => u.email === email
        )?.[0] as UserRole | undefined;

        if (role) {
          const user = DEMO_USERS[role];
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          const { setCurrentPage } = useAppStore.getState();
          setCurrentPage(ROLE_TO_PAGE[role]);
        } else {
          set({
            isLoading: false,
            error: 'بيانات الدخول غير صحيحة',
          });
        }
      },

      loginAsDemo: (role: UserRole) => {
        const user = DEMO_USERS[role];
        // Write new user to localStorage IMMEDIATELY to prevent stale rehydration
        // from overwriting us (removeItem doesn't cancel in-flight rehydration)
        const state = { user, isAuthenticated: true };
        if (typeof window !== 'undefined') {
          try { localStorage.setItem('platform-auth-store', JSON.stringify({ state, version: 0 })); } catch {}
        }
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        const { setCurrentPage, setLocale } = useAppStore.getState();
        setLocale(role === 'admin' && user.locale ? user.locale : 'ar');
        setCurrentPage(ROLE_TO_PAGE[role]);
      },

      loginWithUser: (user: User) => {
        // CRITICAL: Write new user to localStorage BEFORE set() to prevent
        // Zustand persist rehydration from overwriting us with stale data.
        // localStorage.removeItem alone is NOT enough because rehydration
        // has already started reading and will apply the old value.
        const state = { user, isAuthenticated: true };
        if (typeof window !== 'undefined') {
          try { localStorage.setItem('platform-auth-store', JSON.stringify({ state, version: 0 })); } catch {}
        }

        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        const { setCurrentPage, setLocale } = useAppStore.getState();
        setLocale(user.locale || 'ar');
        setCurrentPage(ROLE_TO_PAGE[user.role]);

        // Sync onboarding store with user's account status from DB
        const onboardingState = useOnboardingStore.getState();
        const dbStatus = user.accountStatus;

        // Always reset first to clear stale localStorage data
        onboardingState.resetOnboarding();

        if (dbStatus === 'active' || user.role === 'admin' || user.role === 'buyer') {
          // Fully verified — onboarding complete
          onboardingState.setAccountStatus('active');
          onboardingState.submitForReview();
          onboardingState.setVerificationItems(
            getVerificationItemsForRole(user.role).map((i) => ({
              ...i,
              status: 'verified' as const,
            }))
          );
        } else if (dbStatus === 'pending') {
          onboardingState.setAccountStatus('pending');
          onboardingState.submitForReview();
        } else if (dbStatus === 'rejected') {
          onboardingState.setAccountStatus('rejected');
          // Immediately fetch rejection details from DB so user sees admin notes
          fetchRejectionDetails(user.id);
          // Also restore verification data so user can edit and resubmit without starting from scratch
          fetchDraftAndRestore(user.id);
        } else if (dbStatus === 'incomplete' || !dbStatus) {
          onboardingState.setAccountStatus('incomplete');
          // Async: fetch saved draft and restore fields
          fetchDraftAndRestore(user.id);
        } else if (dbStatus === 'suspended') {
          onboardingState.setAccountStatus('suspended');
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
        const { setCurrentPage } = useAppStore.getState();
        setCurrentPage('login');
        // Reset OTP flow and onboarding state on logout
        const onboardingState = useOnboardingStore.getState();
        onboardingState.resetOtpFlow();
      },

      updateProfile: (data) => {
        const current = get().user;
        if (current) {
          set({ user: { ...current, ...data } });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'platform-auth-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      // Prevent rehydration from overwriting a freshly logged-in user
      onRehydrateStorage: () => (state) => {
        // Called after rehydration completes. If state is null, do nothing.
        if (!state) return;
      },
    }
  )
);

// ============================================
// CART STORE
// ============================================

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  itemCount: number;

  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>()((set, get) => ({
  items: [],
  itemCount: 0,

  addItem: (product, quantity = 1) => {
    const items = [...get().items];
    const existing = items.find((item) => item.product.id === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      items.push({ product, quantity });
    }
    set({ items, itemCount: items.reduce((sum, i) => sum + i.quantity, 0) });
  },

  removeItem: (productId) => {
    const items = get().items.filter((item) => item.product.id !== productId);
    set({ items, itemCount: items.reduce((sum, i) => sum + i.quantity, 0) });
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    const items = get().items.map((item) =>
      item.product.id === productId ? { ...item, quantity } : item
    );
    set({ items, itemCount: items.reduce((sum, i) => sum + i.quantity, 0) });
  },

  clearCart: () => set({ items: [], itemCount: 0 }),

  getSubtotal: () =>
    get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),

  getTotal: () => {
    const subtotal = get().getSubtotal();
    const shipping = subtotal > 200 ? 0 : 25;
    return subtotal + shipping;
  },
}));
