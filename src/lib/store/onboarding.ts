import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserRole } from '@/types';

// ============================================
// ONBOARDING TYPES
// ============================================

export type AccountStatus = 'incomplete' | 'pending' | 'active' | 'rejected' | 'suspended';
export type VerificationStatus = 'verified' | 'pending' | 'rejected' | 'required';

export interface VerificationItem {
  id: string;
  labelAr: string;
  labelEn: string;
  status: VerificationStatus;
  rejectionReason?: string;
}

export type OtpLoginStep = 'phone' | 'otp' | 'role' | 'basic-info';
export type ContactMethod = 'phone' | 'email';

export interface OnboardingState {
  // Verification
  accountStatus: AccountStatus;
  verificationItems: VerificationItem[];
  rejectionReason: string | null;
  rejectedItems: string[];
  isBannerDismissed: boolean;
  submittedAt: string | null;

  // OTP Login
  otpStep: OtpLoginStep;
  contactMethod: ContactMethod;
  phone: string;
  email: string;
  otpCode: string;
  otpVerified: boolean;
  selectedRole: UserRole | null;
  fullName: string;
  storeName: string;

  // Wizard
  currentStep: number;
  isCompleted: boolean;
  isSubmitted: boolean;
  isDraftSaved: boolean;

  // Store Manager
  commercialRegisterNumber: string;
  commercialRegisterFile: string | null;
  iban: string;
  beneficiaryName: string;
  bankLetterFile: string | null;
  idFrontFile: string | null;
  idBackFile: string | null;

  // Freelancer
  freelanceDocumentFile: string | null;
  freelancerIdFrontFile: string | null;
  freelancerIdBackFile: string | null;
  livenessCompleted: boolean;
  livenessSelfie: string | null;
  freelancerIban: string;

  // Supplier
  commercialLicenseFile: string | null;
  importLicenseFile: string | null;
  supplierIban: string;

  // Logistics
  transportLicenseFile: string | null;
  insuranceCertificateFile: string | null;
  numberOfVehicles: string;
  numberOfDrivers: string;

  // Admin review data
  pendingMerchants: PendingMerchant[];

  // Actions
  setAccountStatus: (status: AccountStatus) => void;
  setVerificationItems: (items: VerificationItem[]) => void;
  updateVerificationItem: (id: string, status: VerificationStatus, rejectionReason?: string) => void;
  setRejectionReason: (reason: string | null) => void;
  setRejectedItems: (items: string[]) => void;
  dismissBanner: () => void;
  showBanner: () => void;
  resetOnboarding: () => void;
  clearDraftFlag: () => void;
  setIsSubmitted: (val: boolean) => void;
  setIsCompleted: (val: boolean) => void;

  setOtpStep: (step: OtpLoginStep) => void;
  setContactMethod: (method: ContactMethod) => void;
  setPhone: (phone: string) => void;
  setEmail: (email: string) => void;
  setOtpCode: (code: string) => void;
  setOtpVerified: (verified: boolean) => void;
  verifyOtp: (code: string) => boolean;
  setSelectedRole: (role: UserRole | null) => void;
  setFullName: (name: string) => void;
  setStoreName: (name: string) => void;
  otpNextStep: () => void;
  otpGoBack: () => void;
  resetOtpFlow: () => void;

  getVerificationProgress: () => number;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setField: (field: string, value: unknown) => void;
  saveDraft: () => void;
  submitForReview: () => void;

  // Admin actions
  adminApprove: (userId: string) => void;
  adminReject: (userId: string, reason: string) => void;
  adminRequestEdit: (userId: string, fields: string[], reason: string) => void;
  setPendingMerchants: (merchants: PendingMerchant[]) => void;
}

export interface PendingMerchant {
  id: string;
  userName: string;
  role: UserRole;
  submittedAt: string;
  phone: string;
  email: string;
  storeName: string;
  documents: { type: string; name: string; url: string }[];
  verificationStatus: 'pending' | 'approved' | 'rejected';
}

const OTP_STEP_ORDER: OtpLoginStep[] = ['phone', 'otp', 'role', 'basic-info'];

export const getVerificationItemsForRole = (role: UserRole): VerificationItem[] => {
  switch (role) {
    case 'store_manager':
      return [
        { id: 'phone', labelAr: 'رقم الهاتف', labelEn: 'Phone Number', status: 'verified' },
        { id: 'email', labelAr: 'البريد الإلكتروني', labelEn: 'Email Address', status: 'required' },
        { id: 'commercial_register', labelAr: 'السجل التجاري', labelEn: 'Commercial Register', status: 'pending' },
        { id: 'bank_account', labelAr: 'الحساب البنكي', labelEn: 'Bank Account', status: 'pending' },
        { id: 'manager_id', labelAr: 'هوية المدير', labelEn: 'Manager ID', status: 'pending' },
      ];
    case 'seller':
      return [
        { id: 'phone', labelAr: 'رقم الهاتف', labelEn: 'Phone Number', status: 'verified' },
        { id: 'email', labelAr: 'البريد الإلكتروني', labelEn: 'Email Address', status: 'required' },
        { id: 'national_id', labelAr: 'الهوية الوطنية', labelEn: 'National ID', status: 'pending' },
        { id: 'selfie', labelAr: 'السيلفي الحي', labelEn: 'Live Selfie', status: 'pending' },
        { id: 'bank_account', labelAr: 'الحساب البنكي', labelEn: 'Bank Account', status: 'pending' },
      ];
    case 'supplier':
      return [
        { id: 'phone', labelAr: 'رقم الهاتف', labelEn: 'Phone Number', status: 'verified' },
        { id: 'email', labelAr: 'البريد الإلكتروني', labelEn: 'Email Address', status: 'required' },
        { id: 'commercial_license', labelAr: 'رخصة تجارية', labelEn: 'Commercial License', status: 'pending' },
        { id: 'import_license', labelAr: 'رخصة الاستيراد', labelEn: 'Import License', status: 'pending' },
        { id: 'bank_account', labelAr: 'الحساب البنكي', labelEn: 'Bank Account', status: 'pending' },
      ];
    case 'buyer':
      return [
        { id: 'phone', labelAr: 'رقم الهاتف', labelEn: 'Phone Number', status: 'verified' },
      ];
    case 'logistics':
      return [
        { id: 'phone', labelAr: 'رقم الهاتف', labelEn: 'Phone Number', status: 'verified' },
        { id: 'email', labelAr: 'البريد الإلكتروني', labelEn: 'Email Address', status: 'verified' },
        { id: 'transport_license', labelAr: 'رخصة النقل', labelEn: 'Transport License', status: 'pending' },
        { id: 'insurance', labelAr: 'شهادة التأمين', labelEn: 'Insurance Certificate', status: 'pending' },
        { id: 'bank_account', labelAr: 'الحساب البنكي', labelEn: 'Bank Account', status: 'pending' },
      ];
    default:
      return [];
  }
};

const DEFAULT_PENDING_MERCHANTS: PendingMerchant[] = [
  {
    id: 'pm-1', userName: 'متجر الأناقة الرقمية', role: 'store_manager',
    submittedAt: '2024-03-15T10:00:00Z', phone: '+966501234567',
    email: 'digital@elegance.com', storeName: 'متجر الأناقة الرقمية',
    documents: [
      { type: 'commercial_register', name: 'سجل_تجاري.pdf', url: '#' },
      { type: 'bank_letter', name: 'شهادة_بنكية.pdf', url: '#' },
      { type: 'manager_id', name: 'هوية_المدير.jpg', url: '#' },
    ],
    verificationStatus: 'pending',
  },
  {
    id: 'pm-2', userName: 'خالد التاجر المستقل', role: 'seller',
    submittedAt: '2024-03-16T14:00:00Z', phone: '+966509876543',
    email: 'khaled@freelancer.com', storeName: 'بضاعة خالد',
    documents: [
      { type: 'national_id', name: 'بطاقة_الهوية.jpg', url: '#' },
      { type: 'selfie', name: 'سيلفي_حي.jpg', url: '#' },
    ],
    verificationStatus: 'pending',
  },
  {
    id: 'pm-3', userName: 'شركة النقل السريع', role: 'logistics',
    submittedAt: '2024-03-14T09:00:00Z', phone: '+966505551234',
    email: 'info@express.com', storeName: 'شركة النقل السريع',
    documents: [
      { type: 'transport_license', name: 'رخصة_النقل.pdf', url: '#' },
      { type: 'insurance', name: 'شهادة_التأمين.pdf', url: '#' },
    ],
    verificationStatus: 'pending',
  },
];

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      accountStatus: 'incomplete' as AccountStatus,
      verificationItems: [],
      rejectionReason: null,
      rejectedItems: [],
      isBannerDismissed: false,
      submittedAt: null,

      otpStep: 'phone' as OtpLoginStep,
      contactMethod: 'phone' as ContactMethod,
      phone: '',
      email: '',
      otpCode: '',
      otpVerified: false,
      selectedRole: null,
      fullName: '',
      storeName: '',

      currentStep: 0,
      isCompleted: false,
      isSubmitted: false,
      isDraftSaved: false,

      commercialRegisterNumber: '',
      commercialRegisterFile: null,
      iban: '',
      beneficiaryName: '',
      bankLetterFile: null,
      idFrontFile: null,
      idBackFile: null,

      freelanceDocumentFile: null,
      freelancerIdFrontFile: null,
      freelancerIdBackFile: null,
      livenessCompleted: false,
      livenessSelfie: null,
      freelancerIban: '',

      commercialLicenseFile: null,
      importLicenseFile: null,
      supplierIban: '',

      transportLicenseFile: null,
      insuranceCertificateFile: null,
      numberOfVehicles: '',
      numberOfDrivers: '',

      pendingMerchants: DEFAULT_PENDING_MERCHANTS,

      // ── Actions ──
      setAccountStatus: (s) => set({ accountStatus: s }),

      setVerificationItems: (items) => set({ verificationItems: items }),

      updateVerificationItem: (id, status, rejectionReason) =>
        set((s) => ({
          verificationItems: s.verificationItems.map((item) =>
            item.id === id ? { ...item, status, rejectionReason } : item
          ),
        })),

      setRejectionReason: (r) => set({ rejectionReason: r }),
      setRejectedItems: (items) => set({ rejectedItems: items }),
      dismissBanner: () => set({ isBannerDismissed: true }),
      showBanner: () => set({ isBannerDismissed: false }),
      clearDraftFlag: () => set({ isDraftSaved: false, isSubmitted: false, isCompleted: false }),
      setIsSubmitted: (val: boolean) => set({ isSubmitted: val }),
      setIsCompleted: (val: boolean) => set({ isCompleted: val }),

      resetOnboarding: () => set({
        accountStatus: 'incomplete',
        verificationItems: [],
        rejectionReason: null,
        rejectedItems: [],
        isBannerDismissed: false,
        submittedAt: null,
        currentStep: 0,
        isCompleted: false,
        isSubmitted: false,
        isDraftSaved: false,
        commercialRegisterNumber: '',
        commercialRegisterFile: null,
        iban: '',
        beneficiaryName: '',
        bankLetterFile: null,
        idFrontFile: null,
        idBackFile: null,
        freelanceDocumentFile: null,
        freelancerIdFrontFile: null,
        freelancerIdBackFile: null,
        livenessCompleted: false,
        livenessSelfie: null,
        commercialLicenseFile: null,
        importLicenseFile: null,
        supplierIban: '',
        transportLicenseFile: null,
        insuranceCertificateFile: null,
        numberOfVehicles: '',
        numberOfDrivers: '',
      }),

      // ── OTP ──
      setOtpStep: (step) => set({ otpStep: step }),
      setContactMethod: (m) => set({ contactMethod: m, phone: '', email: '' }),
      setPhone: (p) => set({ phone: p }),
      setEmail: (e) => set({ email: e }),
      setOtpCode: (c) => set({ otpCode: c }),
      setOtpVerified: (v) => set({ otpVerified: v }),

      verifyOtp: (code) => {
        if (code === '123456') {
          set({ otpVerified: true, otpCode: '' });
          return true;
        }
        return false;
      },

      setSelectedRole: (r) => set({ selectedRole: r }),
      setFullName: (n) => set({ fullName: n }),
      setStoreName: (n) => set({ storeName: n }),

      otpNextStep: () => {
        const { otpStep } = get();
        const idx = OTP_STEP_ORDER.indexOf(otpStep);
        if (idx >= 0 && idx < OTP_STEP_ORDER.length - 1) {
          set({ otpStep: OTP_STEP_ORDER[idx + 1] });
        }
      },

      otpGoBack: () => {
        const { otpStep } = get();
        const idx = OTP_STEP_ORDER.indexOf(otpStep);
        if (idx > 0) set({ otpStep: OTP_STEP_ORDER[idx - 1] });
      },

      resetOtpFlow: () => set({
        otpStep: 'phone', contactMethod: 'phone',
        phone: '', email: '', otpCode: '', otpVerified: false,
        selectedRole: null, fullName: '', storeName: '',
      }),

      // ── Wizard ──
      getVerificationProgress: () => {
        const s = get();
        const fields = [
          s.commercialRegisterNumber, s.iban, s.beneficiaryName,
          s.fullName, s.phone || s.email,
          s.commercialRegisterFile, s.bankLetterFile, s.idFrontFile,
          s.freelanceDocumentFile, s.freelancerIdFrontFile, s.freelancerIdBackFile,
          s.livenessCompleted ? 'yes' : '', s.livenessSelfie || '', s.freelancerIban,
          s.commercialLicenseFile, s.importLicenseFile, s.supplierIban,
          s.transportLicenseFile, s.insuranceCertificateFile,
          s.numberOfVehicles, s.numberOfDrivers,
        ];
        return Math.round((fields.filter(Boolean).length / fields.length) * 100);
      },

      setStep: (step) => set({ currentStep: step }),
      nextStep: () => set((s) => ({ currentStep: s.currentStep + 1 })),
      prevStep: () => set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) })),
      setField: (field, value) => set({ [field]: value } as Partial<OnboardingState>),
      saveDraft: () => set({ isDraftSaved: true }),

      submitForReview: () => set({
        isCompleted: true,
        isSubmitted: true,
        isDraftSaved: false,
        accountStatus: 'pending',
        submittedAt: new Date().toISOString(),
      }),

      // ── Admin Actions ──
      adminApprove: (userId) => {
        set((s) => ({
          pendingMerchants: s.pendingMerchants.map((m) =>
            m.id === userId ? { ...m, verificationStatus: 'approved' as const } : m
          ),
        }));
      },

      adminReject: (userId, reason) => {
        set((s) => ({
          pendingMerchants: s.pendingMerchants.map((m) =>
            m.id === userId ? { ...m, verificationStatus: 'rejected' as const } : m
          ),
        }));
        // If the rejected merchant is the current user, update their state too
        const currentMerchant = get().pendingMerchants.find(m => m.id === userId);
        if (currentMerchant) {
          set({
            accountStatus: 'rejected',
            rejectionReason: reason,
            rejectedItems: ['all'],
            isSubmitted: false,
            isCompleted: false,
          });
        }
      },

      adminRequestEdit: (userId, fields, reason) => {
        set((s) => ({
          pendingMerchants: s.pendingMerchants.map((m) =>
            m.id === userId ? { ...m, verificationStatus: 'pending' as const } : m
          ),
        }));
        const currentMerchant = get().pendingMerchants.find(m => m.id === userId);
        if (currentMerchant) {
          set({
            accountStatus: 'rejected',
            rejectionReason: reason,
            rejectedItems: fields,
            isSubmitted: false,
            isCompleted: false,
          });
        }
      },

      setPendingMerchants: (merchants) => set({ pendingMerchants: merchants }),
    }),
    {
      name: 'platform-onboarding-store',
      partialize: (state) => ({
        accountStatus: state.accountStatus,
        verificationItems: state.verificationItems,
        rejectionReason: state.rejectionReason,
        rejectedItems: state.rejectedItems,
        isBannerDismissed: state.isBannerDismissed,
        submittedAt: state.submittedAt,
        otpStep: state.otpStep,
        contactMethod: state.contactMethod,
        phone: state.phone,
        email: state.email,
        otpVerified: state.otpVerified,
        selectedRole: state.selectedRole,
        fullName: state.fullName,
        storeName: state.storeName,
        currentStep: state.currentStep,
        isCompleted: state.isCompleted,
        isSubmitted: state.isSubmitted,
        isDraftSaved: state.isDraftSaved,
        commercialRegisterNumber: state.commercialRegisterNumber,
        commercialRegisterFile: state.commercialRegisterFile,
        iban: state.iban,
        beneficiaryName: state.beneficiaryName,
        bankLetterFile: state.bankLetterFile,
        idFrontFile: state.idFrontFile,
        idBackFile: state.idBackFile,
        freelanceDocumentFile: state.freelanceDocumentFile,
        freelancerIdFrontFile: state.freelancerIdFrontFile,
        freelancerIdBackFile: state.freelancerIdBackFile,
        livenessCompleted: state.livenessCompleted,
        livenessSelfie: state.livenessSelfie,
        freelancerIban: state.freelancerIban,
        commercialLicenseFile: state.commercialLicenseFile,
        importLicenseFile: state.importLicenseFile,
        supplierIban: state.supplierIban,
        transportLicenseFile: state.transportLicenseFile,
        insuranceCertificateFile: state.insuranceCertificateFile,
        numberOfVehicles: state.numberOfVehicles,
        numberOfDrivers: state.numberOfDrivers,
      }),
    }
  )
);

export { getVerificationItemsForRole, DEFAULT_PENDING_MERCHANTS };

// ============================================
// DRAFT RESTORE UTILITIES
// ============================================

/**
 * Restore verification data from DB into the Zustand store.
 * Maps DB field names to store field names per role.
 */
export function restoreDraftFields(role: string, data: Record<string, unknown>) {
  const store = useOnboardingStore.getState();

  switch (role) {
    case 'store_manager':
      if (data.commercialRegisterNumber) store.setField('commercialRegisterNumber', data.commercialRegisterNumber);
      if (data.commercialRegisterFile) store.setField('commercialRegisterFile', data.commercialRegisterFile);
      if (data.iban) store.setField('iban', data.iban);
      if (data.beneficiaryName) store.setField('beneficiaryName', data.beneficiaryName);
      if (data.bankLetterFile) store.setField('bankLetterFile', data.bankLetterFile);
      if (data.managerIdFront) store.setField('idFrontFile', data.managerIdFront);
      if (data.managerIdBack) store.setField('idBackFile', data.managerIdBack);
      break;
    case 'seller':
      if (data.freelanceDocFile) store.setField('freelanceDocumentFile', data.freelanceDocFile);
      if (data.nationalIdFront) store.setField('freelancerIdFrontFile', data.nationalIdFront);
      if (data.nationalIdBack) store.setField('freelancerIdBackFile', data.nationalIdBack);
      if (data.iban) store.setField('freelancerIban', data.iban);
      // Always mark liveness as completed when restoring data —
      // the user already went through this step before,
      // and liveness is optional (skip button exists, API doesn't require it)
      store.setField('livenessCompleted', true);
      // Try to restore selfie URL
      if (data.selfieUrls) {
        try {
          const urls = JSON.parse(data.selfieUrls as string);
          if (Array.isArray(urls) && urls.length > 0) {
            store.setField('livenessSelfie', urls[0]);
          }
        } catch { /* ignore */ }
      }
      break;
    case 'supplier':
      if (data.commercialLicense) store.setField('commercialLicenseFile', data.commercialLicense);
      if (data.importLicense) store.setField('importLicenseFile', data.importLicense);
      if (data.iban) store.setField('supplierIban', data.iban);
      break;
    case 'logistics':
      if (data.transportLicenseFile) store.setField('transportLicenseFile', data.transportLicenseFile);
      if (data.insuranceCertificateFile) store.setField('insuranceCertificateFile', data.insuranceCertificateFile);
      if (data.numberOfVehicles) store.setField('numberOfVehicles', String(data.numberOfVehicles));
      if (data.numberOfDrivers) store.setField('numberOfDrivers', String(data.numberOfDrivers));
      if (data.iban) store.setField('logisticsIban', data.iban);
      break;
  }
}

/**
 * Calculate which step the wizard should resume at based on filled fields.
 */
export function calcResumeStep(role: string, data: Record<string, unknown>): number {
  switch (role) {
    case 'store_manager': {
      if (!data.commercialRegisterNumber && !data.commercialRegisterFile) return 0;
      if (!data.iban || !data.beneficiaryName || !data.bankLetterFile) return 1;
      if (!data.managerIdFront || !data.managerIdBack) return 2;
      return 2;
    }
    case 'seller': {
      if (!data.nationalIdFront || !data.nationalIdBack) return 1;
      if (!(data.livenessScore && data.livenessScore > 0)) return 1;
      if (!data.iban) return 2;
      return 2;
    }
    case 'supplier': {
      if (!data.commercialLicense || !data.importLicense) return 0;
      if (!data.iban) return 1;
      return 1;
    }
    case 'logistics': {
      if (!data.transportLicenseFile || !data.insuranceCertificateFile) return 0;
      if (!data.numberOfVehicles || !data.numberOfDrivers) return 0;
      if (!data.iban) return 1;
      return 1;
    }
    default:
      return 0;
  }
}
