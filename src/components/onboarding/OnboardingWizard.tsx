'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useOnboardingStore } from '@/lib/store/onboarding';
import { useAppStore } from '@/lib/store';
import { useAuthStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Upload,
  Camera,
  FileText,
  Shield,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Save,
  AlertCircle,
  Loader2,
  User,
  Store,
  Package,
  Truck,
  ShoppingCart,
  RefreshCw,
  Eye,
  ScanFace,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Locale, UserRole } from '@/types';
import LivenessDetection from '@/components/onboarding/LivenessDetection';

// ============================================
// COUNTRY-SPECIFIC FINANCIAL CONFIG
// ============================================

interface IbanConfig {
  prefix: string;
  length: number;
  placeholder: string;
  labelAr: string;
  labelEn: string;
}

interface FinancialDocConfig {
  id: string;
  labelAr: string;
  labelEn: string;
  optional: boolean;
}

interface CountryFinanceConfig {
  iban: IbanConfig;
  docs: FinancialDocConfig[];
  notes: { ar: string; en: string }[];
}

const IBAN_CONFIGS: Record<string, IbanConfig> = {
  DZ: { prefix: 'DZ', length: 24, placeholder: 'DZ0000000000000000000000', labelAr: 'رقم الحساب البنكي الدولي (IBAN جزائري)', labelEn: 'Algerian IBAN' },
  SA: { prefix: 'SA', length: 24, placeholder: 'SA0000000000000000000000', labelAr: 'رقم الحساب البنكي الدولي (IBAN سعودي)', labelEn: 'Saudi IBAN' },
  TN: { prefix: 'TN', length: 24, placeholder: 'TN0000000000000000000000', labelAr: 'رقم الحساب البنكي الدولي (IBAN تونسي)', labelEn: 'Tunisian IBAN' },
  MA: { prefix: 'MA', length: 28, placeholder: 'MA00000000000000000000000000', labelAr: 'رقم الحساب البنكي الدولي (RIB مغربي)', labelEn: 'Moroccan RIB' },
  AE: { prefix: 'AE', length: 23, placeholder: 'AE000000000000000000000', labelAr: 'رقم الحساب البنكي الدولي (IBAN إماراتي)', labelEn: 'UAE IBAN' },
  EG: { prefix: 'EG', length: 29, placeholder: 'EG00000000000000000000000000', labelAr: 'رقم الحساب البنكي الدولي (IBAN مصري)', labelEn: 'Egyptian IBAN' },
  default: { prefix: '', length: 34, placeholder: 'XX0000000000000000000', labelAr: 'رقم الحساب البنكي الدولي (IBAN)', labelEn: 'IBAN (15-34 chars)' },
};

const FINANCE_CONFIGS: Record<string, CountryFinanceConfig> = {
  DZ: {
    iban: IBAN_CONFIGS.DZ,
    docs: [
      { id: 'bank_account', labelAr: 'كشف حساب بنكي CCP أو بريدي', labelEn: 'CCP / Postal bank statement', optional: false },
      { id: 'baridimob', labelAr: 'إثبات حساب بريدي موب BaridiMob', labelEn: 'BaridiMob account proof', optional: true },
      { id: 'bank_cert', labelAr: 'شهادة بنكية (اختياري)', labelEn: 'Bank certificate (optional)', optional: true },
    ],
    notes: [
      { ar: 'يمكنك تقديم كشف حساب CCP أو حساب بنكي عادي', en: 'You can provide a CCP or regular bank statement' },
      { ar: 'حساب BaridiMob مقبول كوسيلة دفع بديلة', en: 'BaridiMob account is accepted as an alternative payment method' },
    ],
  },
  SA: {
    iban: IBAN_CONFIGS.SA,
    docs: [
      { id: 'bank_letter', labelAr: 'شهادة بنكية / خطاب بنكي', labelEn: 'Bank certificate / letter', optional: false },
      { id: 'bank_account', labelAr: 'كشف حساب بنكي', labelEn: 'Bank statement', optional: true },
    ],
    notes: [
      { ar: 'يجب أن يكون IBAN بصيغة سعودية (SA + 22 رقم)', en: 'IBAN must be in Saudi format (SA + 22 digits)' },
    ],
  },
  TN: {
    iban: IBAN_CONFIGS.TN,
    docs: [
      { id: 'bank_rib', labelAr: 'كشف RIB بنكي', labelEn: 'Bank RIB statement', optional: false },
      { id: 'bank_cert', labelAr: 'شهادة بنكية (اختياري)', labelEn: 'Bank certificate (optional)', optional: true },
    ],
    notes: [
      { ar: 'RIB بصيغة تونسية (TN + 22 رقم)', en: 'RIB in Tunisian format (TN + 22 digits)' },
    ],
  },
  MA: {
    iban: IBAN_CONFIGS.MA,
    docs: [
      { id: 'bank_rib', labelAr: 'كشف RIB بنكي مغربي', labelEn: 'Moroccan RIB statement', optional: false },
    ],
    notes: [
      { ar: 'RIB بصيغة مغربية (MA + 24 رقم)', en: 'RIB in Moroccan format (MA + 24 digits)' },
    ],
  },
  default: {
    iban: IBAN_CONFIGS.default,
    docs: [
      { id: 'bank_account', labelAr: 'كشف حساب بنكي', labelEn: 'Bank statement', optional: false },
    ],
    notes: [],
  },
};

const PHONE_TO_COUNTRY: Record<string, string> = {
  '+213': 'DZ', '+216': 'TN', '+212': 'MA', '+966': 'SA',
  '+971': 'AE', '+965': 'KW', '+974': 'QA', '+968': 'OM',
  '+973': 'BH', '+20': 'EG', '+962': 'JO', '+961': 'LB',
  '+964': 'IQ', '+90': 'TR', '+33': 'FR',
};

function detectCountryCode(phone?: string | null): string {
  if (!phone) return 'DZ'; // Default Algeria
  const clean = phone.replace(/\s/g, '');
  for (const [prefix, country] of Object.entries(PHONE_TO_COUNTRY)) {
    if (clean.startsWith(prefix)) return country;
  }
  return 'default';
}

function getFinanceConfig(phone?: string | null): CountryFinanceConfig {
  const country = detectCountryCode(phone);
  return FINANCE_CONFIGS[country] || FINANCE_CONFIGS.default;
}

function validateIban(iban: string, config: IbanConfig): boolean {
  if (!config.prefix) {
    // Generic: 2 letters + at least 2 digits, total 15-34 chars
    return /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban);
  }
  return iban.startsWith(config.prefix) && iban.length === config.length;
}

// ============================================
// HELPERS
// ============================================

function t(locale: Locale, ar: string, en: string) {
  return locale === 'ar' ? ar : en;
}

function maskIban(iban: string): string {
  if (!iban || iban.length < 8) return iban;
  return `${iban.slice(0, 2)}${'•'.repeat(iban.length - 6)}${iban.slice(-4)}`;
}

// Extract URL from stored format "/api/files/{hex}.jpg::{filename}"
function extractUrl(f: string | null): string | null {
  if (!f) return null;
  const parts = f.split('::');
  if (parts.length >= 2) return parts[0];
  return f;
}

// ============================================
// STEP DEFINITIONS PER ROLE
// ============================================

interface StepDef {
  titleAr: string;
  titleEn: string;
  icon: React.ReactNode;
}

function getSteps(role: UserRole): StepDef[] {
  switch (role) {
    case 'store_manager':
      return [
        { titleAr: 'التوثيق القانوني', titleEn: 'Legal Verification', icon: <FileText className="h-4 w-4" /> },
        { titleAr: 'التوثيق المالي', titleEn: 'Financial Verification', icon: <Shield className="h-4 w-4" /> },
        { titleAr: 'توثيق الهوية', titleEn: 'Identity Verification', icon: <User className="h-4 w-4" /> },
      ];
    case 'seller':
      return [
        { titleAr: 'إثبات الأهلية', titleEn: 'Eligibility Proof', icon: <FileText className="h-4 w-4" /> },
        { titleAr: 'التوثيق البيومتري', titleEn: 'Biometric Verification', icon: <ScanFace className="h-4 w-4" /> },
        { titleAr: 'التوثيق المالي', titleEn: 'Financial Verification', icon: <Shield className="h-4 w-4" /> },
      ];
    case 'supplier':
      return [
        { titleAr: 'التراخيص التجارية', titleEn: 'Commercial Licenses', icon: <FileText className="h-4 w-4" /> },
        { titleAr: 'التوثيق المالي', titleEn: 'Financial Verification', icon: <Shield className="h-4 w-4" /> },
      ];
    case 'logistics':
      return [
        { titleAr: 'التراخيص', titleEn: 'Licenses', icon: <FileText className="h-4 w-4" /> },
        { titleAr: 'معلومات الأسطول', titleEn: 'Fleet Information', icon: <Truck className="h-4 w-4" /> },
      ];
    case 'admin':
      return [];
    case 'buyer':
    default:
      return [];
  }
}

const ROLE_ICONS: Record<string, React.ReactNode> = {
  store_manager: <Store className="h-5 w-5" />,
  seller: <User className="h-5 w-5" />,
  logistics: <Truck className="h-5 w-5" />,
  buyer: <ShoppingCart className="h-5 w-5" />,
  supplier: <Package className="h-5 w-5" />,
};

// ============================================
// FILE UPLOAD SUB-COMPONENT
// ============================================

interface FileUploadProps {
  label: string;
  labelEn: string;
  accept?: string;
  maxSizeMB?: number;
  fileName: string | null;
  onFileSelect: (name: string) => void;
  onRemove: () => void;
  locale: Locale;
  showCamera?: boolean;
}

function FileUploadZone({
  label,
  labelEn,
  accept = '.pdf,.jpg,.jpeg,.png',
  maxSizeMB = 5,
  fileName,
  onFileSelect,
  onRemove,
  locale,
  showCamera = false,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(t(locale, `حجم الملف كبير جداً. الحد الأقصى ${maxSizeMB}MB`, `File too large. Max ${maxSizeMB}MB`));
        return;
      }

      setIsUploading(true);
      try {
        // Upload file to server — saved to persistent external directory
        const formData = new FormData();
        formData.append('file', file);

        // Timeout: abort if upload takes more than 20 seconds
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 20000);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          console.error('[FileUpload] Upload failed:', res.status, errData);
          toast.error(
            (errData as { error?: string }).error || t(locale, 'فشل رفع الملف', 'Upload failed')
          );
          return;
        }

        const data = await res.json();
        console.log('[FileUpload] Upload response:', data.success, data.url);

        if (data.success && data.url) {
          // Store URL — lightweight string, fits in any DB column
          // Format: "/api/files/{hex}.jpg::{original_filename}"
          onFileSelect(`${data.url}::${file.name}`);
        } else {
          console.error('[FileUpload] No URL in response:', data);
          toast.error(
            data.error || t(locale, 'فشل رفع الملف', 'Upload failed')
          );
        }
      } catch (err) {
        console.error('[FileUpload] Error:', err);
        if (err instanceof DOMException && err.name === 'AbortError') {
          toast.error(t(locale, 'انتهت مهلة الرفع. حاول مرة أخرى.', 'Upload timed out. Try again.'));
        } else {
          toast.error(
            t(locale, 'خطأ في الاتصال. تحقق من الإنترنت وحاول مرة أخرى.', 'Connection error. Check your internet and try again.')
          );
        }
      } finally {
        setIsUploading(false);
      }
    },
    [maxSizeMB, onFileSelect, locale]
  );

  // Extract clean display name from stored URL
  const getDisplayName = (f: string | null): string => {
    if (!f) return '';
    // Format: "/api/files/{hex}.jpg::{original_filename}"
    const parts = f.split('::');
    if (parts.length >= 2) return parts[parts.length - 1];
    // Legacy: plain URL — extract filename
    if (f.startsWith('/')) return f.split('/').pop() || f;
    return f;
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  if (fileName) {
    return (
      <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 animate-fade-in">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900/40 flex items-center justify-center shrink-0">
            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
          <span className="text-sm font-medium truncate">{getDisplayName(fileName)}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
          onClick={onRemove}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {t(locale, label, labelEn)}
      </Label>
      <div
        className={`relative flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed transition-all ${
          isUploading
            ? 'border-primary/50 bg-primary/5 pointer-events-none'
            : dragOver
              ? 'border-primary bg-primary/5 scale-[1.01] cursor-pointer'
              : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30 cursor-pointer'
        }`}
        onClick={() => !isUploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { if (!isUploading) handleDrop(e); }}
      >
        {isUploading ? (
          <>
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">
              {t(locale, 'جاري رفع الملف...', 'Uploading...')}
            </p>
          </>
        ) : (
          <>
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <Upload className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              {t(locale, 'اسحب الملف هنا أو انقر للرفع', 'Drag file or click to upload')}
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                PDF, JPG, PNG
              </Badge>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                {maxSizeMB}MB
              </Badge>
            </div>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = '';
          }}
        />
      </div>
      {showCamera && (
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-1"
          onClick={(e) => {
            e.stopPropagation();
            cameraRef.current?.click();
          }}
        >
          <Camera className="h-4 w-4 me-2" />
          {t(locale, 'التقط صورة', 'Take Photo')}
        </Button>
      )}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}

// ============================================
// STEP INDICATOR SUB-COMPONENT
// ============================================

interface StepIndicatorProps {
  steps: StepDef[];
  currentStep: number;
  locale: Locale;
}

function StepIndicator({ steps, currentStep, locale }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-0 py-2">
      {steps.map((step, idx) => {
        const isCompleted = idx < currentStep;
        const isActive = idx === currentStep;
        return (
          <div key={idx} className="flex items-center">
            {/* Step circle */}
            <div className="flex flex-col items-center gap-1">
              <div
                className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  isCompleted
                    ? 'gradient-brand text-navy shadow-brand'
                    : isActive
                      ? 'gradient-navy text-white shadow-md'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  idx + 1
                )}
              </div>
              <span
                className={`text-[10px] max-w-[70px] text-center truncate hidden sm:block ${
                  isActive ? 'font-semibold text-foreground' : 'text-muted-foreground'
                }`}
              >
                {t(locale, step.titleAr, step.titleEn)}
              </span>
            </div>
            {/* Connector line */}
            {idx < steps.length - 1 && (
              <div
                className={`h-0.5 w-8 sm:w-12 mx-1 rounded-full transition-all duration-300 ${
                  idx < currentStep ? 'bg-green-400' : 'bg-muted-foreground/20'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============================================
// MAIN ONBOARDING WIZARD
// ============================================

export default function OnboardingWizard() {
  const { locale } = useAppStore();
  const { user } = useAuthStore();
  const {
    currentStep,
    accountStatus,
    isSubmitted,
    getVerificationProgress,
    setStep,
    nextStep,
    prevStep,
    setField,
    saveDraft,
    submitForReview,
    // Store Manager
    commercialRegisterNumber,
    commercialRegisterFile,
    iban,
    beneficiaryName,
    bankLetterFile,
    idFrontFile,
    idBackFile,
    // Freelancer
    freelanceDocumentFile,
    freelancerIdFrontFile,
    freelancerIdBackFile,
    livenessCompleted,
    livenessSelfie,
    freelancerIban,
    // Supplier
    commercialLicenseFile,
    importLicenseFile,
    supplierIban,
    // Logistics
    transportLicenseFile,
    insuranceCertificateFile,
    numberOfVehicles,
    numberOfDrivers,
  } = useOnboardingStore();

  const [showReview, setShowReview] = useState(false);
  const [ibanBlurred, setIbanBlurred] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const role = user?.role || 'buyer';
  const steps = getSteps(role);
  const totalSteps = steps.length;
  const isReviewStep = showReview;
  const progress = getVerificationProgress(role);
  const financeConfig = getFinanceConfig(user?.phone);
  const ibanConfig = financeConfig.iban;

  // Detect if data was restored from a draft (any field pre-filled while store says incomplete)
  const isDraftRestored = accountStatus === 'incomplete' && (
    !!(commercialRegisterNumber || commercialRegisterFile || iban ||
    beneficiaryName || bankLetterFile || idFrontFile || idBackFile ||
    freelanceDocumentFile || freelancerIdFrontFile || freelancerIdBackFile ||
    freelancerIban || commercialLicenseFile || importLicenseFile ||
    supplierIban || transportLicenseFile || insuranceCertificateFile ||
    numberOfVehicles || numberOfDrivers || livenessCompleted)
  );

  // Buyer: no wizard needed
  if (role === 'buyer' || role === 'admin' || isSubmitted) {
    return null;
  }

  const canProceed = (): boolean => {
    switch (role) {
      case 'store_manager':
        switch (currentStep) {
          case 0: return commercialRegisterNumber.length === 10 && !!commercialRegisterFile;
          case 1: return validateIban(iban, ibanConfig) && beneficiaryName.length > 0 && !!bankLetterFile;
          case 2: return !!idFrontFile && !!idBackFile;
          default: return true;
        }
      case 'seller':
        switch (currentStep) {
          case 0: return true; // Optional step
          case 1: return !!freelancerIdFrontFile && !!freelancerIdBackFile; // Liveness can be skipped
          case 2: return validateIban(freelancerIban, ibanConfig);
          default: return true;
        }
      case 'supplier':
        switch (currentStep) {
          case 0: return !!commercialLicenseFile && !!importLicenseFile;
          case 1: return validateIban(supplierIban, ibanConfig);
          default: return true;
        }
      case 'logistics':
        switch (currentStep) {
          case 0: return !!transportLicenseFile && !!insuranceCertificateFile;
          case 1: return Number(numberOfVehicles) > 0 && Number(numberOfDrivers) > 0;
          default: return true;
        }
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      nextStep();
    } else {
      setShowReview(true);
    }
  };

  const handleSubmit = async () => {
    console.log('[OnboardingWizard] handleSubmit called, role:', role, 'isSubmitting:', true);
    setIsSubmitting(true);
    try {
      const { user: authUser } = useAuthStore.getState();
      if (!authUser) {
        setIsSubmitting(false);
        toast.error(t(locale, 'خطأ: لم يتم العثور على بيانات المستخدم. يرجى إعادة تسجيل الدخول.', 'Error: User data not found. Please log in again.'));
        return;
      }

      // Pre-validate required fields before API call
      let missingMsg = '';
      if (role === 'seller' && !freelancerIban) {
        missingMsg = t(locale, 'يرجى إدخال رقم IBAN الحساب البنكي في الخطوة المالية', 'Please enter your bank IBAN in the financial step');
      } else if (role === 'store_manager' && (!commercialRegisterNumber || !commercialRegisterFile)) {
        missingMsg = t(locale, 'يرجى إكمال بيانات السجل التجاري', 'Please complete the commercial register information');
      } else if (role === 'store_manager' && (!iban || !beneficiaryName)) {
        missingMsg = t(locale, 'يرجى إدخال بيانات الحساب البنكي', 'Please enter bank account details');
      } else if (role === 'store_manager' && (!idFrontFile || !idBackFile)) {
        missingMsg = t(locale, 'يرجى رفع صور الهوية', 'Please upload ID photos');
      } else if (role === 'supplier' && (!commercialLicenseFile || !importLicenseFile)) {
        missingMsg = t(locale, 'يرجى رفع التراخيص التجارية', 'Please upload commercial licenses');
      } else if (role === 'supplier' && !supplierIban) {
        missingMsg = t(locale, 'يرجى إدخال رقم IBAN', 'Please enter bank IBAN');
      } else if (role === 'logistics' && (!transportLicenseFile || !insuranceCertificateFile)) {
        missingMsg = t(locale, 'يرجى رفع رخصة النقل وشهادة التأمين', 'Please upload transport license and insurance');
      } else if (role === 'logistics' && (!numberOfVehicles || !numberOfDrivers)) {
        missingMsg = t(locale, 'يرجى إدخال عدد المركبات والسائقين', 'Please enter number of vehicles and drivers');
      }

      if (missingMsg) {
        setIsSubmitting(false);
        toast.error(missingMsg);
        return;
      }

      // Use AbortController with 15s timeout to prevent infinite hang
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      try {
        const res = await fetch('/api/onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            userId: authUser.id,
            role,
            commercialRegisterNumber,
            commercialRegisterFile: extractUrl(commercialRegisterFile),
            iban,
            beneficiaryName,
            bankLetterFile: extractUrl(bankLetterFile),
            idFrontFile: extractUrl(idFrontFile),
            idBackFile: extractUrl(idBackFile),
            freelanceDocumentFile: extractUrl(freelanceDocumentFile),
            freelancerIdFrontFile: extractUrl(freelancerIdFrontFile),
            freelancerIdBackFile: extractUrl(freelancerIdBackFile),
            livenessCompleted,
            livenessSelfie: null,
            freelancerIban,
            transportLicenseFile: extractUrl(transportLicenseFile),
            insuranceCertificateFile: extractUrl(insuranceCertificateFile),
            numberOfVehicles,
            numberOfDrivers,
            commercialLicenseFile: extractUrl(commercialLicenseFile),
            importLicenseFile: extractUrl(importLicenseFile),
            supplierIban,
          }),
        });

        const data = await res.json();

        if (data.success) {
          console.log('[OnboardingWizard] Submit successful, verificationId:', data.verificationId);
          submitForReview();
          toast.success(t(locale, 'تم إرسال طلبك للمراجعة', 'Application submitted for review'));
        } else {
          const errorMsg = data.error
            || (data.missingFields
              ? t(locale, `حقول مفقودة: ${data.missingFields.join('، ')}`, `Missing fields: ${data.missingFields.join(', ')}`)
              : t(locale, 'فشل إرسال الطلب', 'Failed to submit application'));
          toast.error(errorMsg);
        }
      } catch (fetchErr: unknown) {
        if (fetchErr instanceof DOMException && fetchErr.name === 'AbortError') {
          toast.error(t(locale, 'انتهت مهلة الإرسال. تحقق من اتصالك وحاول مرة أخرى.', 'Request timed out. Check your connection and try again.'));
        } else {
          console.error('[handleSubmit] Fetch error:', fetchErr);
          toast.error(t(locale, 'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.', 'An error occurred while submitting. Please try again.'));
        }
      } finally {
        clearTimeout(timeout);
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('[handleSubmit] Unexpected error:', err);
      setIsSubmitting(false);
      toast.error(t(locale, 'حدث خطأ غير متوقع', 'An unexpected error occurred'));
    }
  };

  // Save draft and go back to dashboard
  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    const { user: authUser } = useAuthStore.getState();

    // ALWAYS save locally first (Zustand persist)
    saveDraft();

    if (!authUser) {
      setIsSavingDraft(false);
      toast.success(
        locale === 'ar' ? 'تم حفظ المسودة محلياً' : 'Draft saved locally'
      );
      return;
    }

    // Save all data to DB — files stored as URLs only (lightweight payload)
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const res = await fetch('/api/onboarding/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          userId: authUser.id,
          role,
          step: currentStep,
          commercialRegisterNumber,
          commercialRegisterFile: extractUrl(commercialRegisterFile),
          iban,
          beneficiaryName,
          bankLetterFile: extractUrl(bankLetterFile),
          idFrontFile: extractUrl(idFrontFile),
          idBackFile: extractUrl(idBackFile),
          freelanceDocumentFile: extractUrl(freelanceDocumentFile),
          freelancerIdFrontFile: extractUrl(freelancerIdFrontFile),
          freelancerIdBackFile: extractUrl(freelancerIdBackFile),
          livenessCompleted,
          livenessSelfie: null,
          freelancerIban,
          transportLicenseFile: extractUrl(transportLicenseFile),
          insuranceCertificateFile: extractUrl(insuranceCertificateFile),
          numberOfVehicles,
          numberOfDrivers,
          commercialLicenseFile: extractUrl(commercialLicenseFile),
          importLicenseFile: extractUrl(importLicenseFile),
          supplierIban,
        }),
      });
      clearTimeout(timeout);

      const data = await res.json();
      if (data.success) {
        toast.success(
          locale === 'ar' ? 'تم حفظ المسودة بنجاح' : 'Draft saved successfully'
        );
      } else {
        toast.success(
          locale === 'ar' ? 'تم حفظ المسودة محلياً' : 'Draft saved locally'
        );
      }
    } catch {
      toast.success(
        locale === 'ar' ? 'تم حفظ المسودة محلياً' : 'Draft saved locally'
      );
    }

    setIsSavingDraft(false);

    // Navigate back to dashboard
    useAppStore.getState().setCurrentPage(
      role === 'store_manager' ? 'store' :
      role === 'seller' ? 'seller' :
      role === 'supplier' ? 'supplier' :
      role === 'logistics' ? 'logistics' : 'login'
    );
  };

  const currentStepData = steps[currentStep];

  // ============================================
  // SHARED IBAN FIELD (country-aware)
  // ============================================

  const renderIbanField = (
    value: string,
    onChange: (val: string) => void,
    onBlur?: () => void,
    showBlurValidation?: boolean,
  ) => {
    const isValid = validateIban(value, ibanConfig);
    const hasError = value.length > 0 && !isValid;
    const showSuccess = showBlurValidation && value.length > 0 && isValid;

    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          {t(locale, ibanConfig.labelAr, ibanConfig.labelEn)}
        </Label>
        <Input
          dir="ltr"
          placeholder={ibanConfig.placeholder}
          maxLength={ibanConfig.prefix ? ibanConfig.length : 34}
          value={value}
          onChange={(e) => {
            const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, ibanConfig.prefix ? ibanConfig.length : 34);
            onChange(val);
            if (onBlur) onBlur();
          }}
          onBlur={onBlur}
          className={cn('text-left font-mono', hasError && 'border-destructive')}
        />
        {hasError && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {ibanConfig.prefix
              ? t(locale, `يجب أن يبدأ بـ ${ibanConfig.prefix} ويكون ${ibanConfig.length} حرف`, `Must start with ${ibanConfig.prefix} and be ${ibanConfig.length} characters`)
              : t(locale, 'IBAN غير صالح (15-34 حرف: حرفان + أرقام)', 'Invalid IBAN (15-34 chars: 2 letters + digits)')
            }
          </p>
        )}
        {showSuccess && (
          <p className="text-xs text-green-600 dark:text-green-400 font-mono text-left" dir="ltr">
            {maskIban(value)}
          </p>
        )}
      </div>
    );
  };

  // Shared country-specific financial notes
  const renderFinancialNotes = () => {
    if (financeConfig.notes.length === 0) return null;
    return (
      <div className="space-y-2">
        {financeConfig.notes.map((note, idx) => (
          <div key={idx} className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <AlertCircle className="h-4 w-4 text-blue-500 shrink-0" />
            <p className="text-xs text-blue-700 dark:text-blue-300">
              {t(locale, note.ar, note.en)}
            </p>
          </div>
        ))}
      </div>
    );
  };

  // ============================================
  // RENDER ROLE-SPECIFIC STEPS
  // ============================================

  const renderStepContent = () => {
    if (isReviewStep) {
      return renderReviewStep();
    }

    switch (role) {
      case 'store_manager':
        return renderStoreManagerStep();
      case 'seller':
        return renderFreelancerStep();
      case 'supplier':
        return renderSupplierStep();
      case 'logistics':
        return renderLogisticsStep();
      default:
        return null;
    }
  };

  // -- STORE MANAGER STEPS --
  const renderStoreManagerStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-5 animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-base">
                  {t(locale, 'التوثيق القانوني', 'Legal Verification')}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {t(locale, 'السجل التجاري ووثائق التأسيس', 'Commercial register & incorporation docs')}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                {t(locale, 'رقم السجل التجاري', 'Commercial Register Number')}
              </Label>
              <Input
                placeholder={t(locale, 'أدخل رقم السجل التجاري (10 أرقام)', 'Enter CR number (10 digits)')}
                maxLength={10}
                value={commercialRegisterNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setField('commercialRegisterNumber', val);
                }}
                className={commercialRegisterNumber.length > 0 && commercialRegisterNumber.length !== 10 ? 'border-destructive' : ''}
              />
              {commercialRegisterNumber.length > 0 && commercialRegisterNumber.length !== 10 && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {t(locale, 'يجب أن يكون الرقم مكون من 10 أرقام', 'Must be exactly 10 digits')}
                </p>
              )}
            </div>
            <FileUploadZone
              label="وثيقة السجل التجاري"
              labelEn="Commercial Register Document"
              fileName={commercialRegisterFile}
              onFileSelect={(name) => setField('commercialRegisterFile', name)}
              onRemove={() => setField('commercialRegisterFile', null)}
              locale={locale}
            />
          </div>
        );

      case 1:
        return (
          <div className="space-y-5 animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-base">
                  {t(locale, 'التوثيق المالي', 'Financial Verification')}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {t(locale, 'الحساب البنكي والوثائق المالية', 'Bank account & financial documents')}
                </p>
              </div>
            </div>
            {renderIbanField(iban, (val) => { setField('iban', val); setIbanBlurred(false); }, () => setIbanBlurred(true), ibanBlurred)}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                {t(locale, 'اسم المستفيد', 'Beneficiary Name')}
              </Label>
              <Input
                placeholder={t(locale, 'الاسم كما في الحساب البنكي', 'Name as on bank account')}
                value={beneficiaryName}
                onChange={(e) => setField('beneficiaryName', e.target.value)}
              />
            </div>
            <FileUploadZone
              label={financeConfig.docs[0]?.labelAr || t(locale, 'كشف حساب بنكي', 'Bank Statement')}
              labelEn={financeConfig.docs[0]?.labelEn || 'Bank Statement'}
              fileName={bankLetterFile}
              onFileSelect={(name) => setField('bankLetterFile', name)}
              onRemove={() => setField('bankLetterFile', null)}
              locale={locale}
            />
            {renderFinancialNotes()}
          </div>
        );

      case 2:
        return (
          <div className="space-y-5 animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-base">
                  {t(locale, 'توثيق الهوية', 'Identity Verification')}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {t(locale, 'صورة الهوية الوطنية (أمام وخلف)', 'National ID (front & back)')}
                </p>
              </div>
            </div>
            <FileUploadZone
              label="صورة الهوية (الأمام)"
              labelEn="ID Front"
              fileName={idFrontFile}
              onFileSelect={(name) => setField('idFrontFile', name)}
              onRemove={() => setField('idFrontFile', null)}
              locale={locale}
              showCamera
            />
            <FileUploadZone
              label="صورة الهوية (الخلف)"
              labelEn="ID Back"
              fileName={idBackFile}
              onFileSelect={(name) => setField('idBackFile', name)}
              onRemove={() => setField('idBackFile', null)}
              locale={locale}
              showCamera
            />
          </div>
        );

      default:
        return null;
    }
  };

  // -- FREELANCER / SELLER STEPS --
  const renderFreelancerStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-5 animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-base">
                  {t(locale, 'إثبات الأهلية', 'Eligibility Proof')}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {t(locale, 'وثيقة العمل الحر (اختياري)', 'Freelance document (optional)')}
                </p>
              </div>
            </div>
            <FileUploadZone
              label="وثيقة العمل الحر"
              labelEn="Freelance Document"
              fileName={freelanceDocumentFile}
              onFileSelect={(name) => setField('freelanceDocumentFile', name)}
              onRemove={() => setField('freelanceDocumentFile', null)}
              locale={locale}
            />
            <div className="flex flex-col items-center gap-2 pt-2">
              <p className="text-xs text-muted-foreground">
                {t(locale, 'هذه الخطوة اختيارية', 'This step is optional')}
              </p>
              <Button variant="outline" size="lg" className="text-base px-8" onClick={nextStep}>
                {t(locale, 'تخطي', 'Skip')}
                <ChevronLeft className={`h-4 w-4 ${locale === 'ar' ? 'me-1 ms-0' : 'ms-1 me-0 rotate-180'}`} />
              </Button>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-5 animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <ScanFace className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="font-semibold text-base">
                  {t(locale, 'التوثيق البيومتري', 'Biometric Verification')}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {t(locale, 'الهوية + التحقق الحي', 'Identity + Liveness Detection')}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FileUploadZone
                label="صورة الهوية (الأمام)"
                labelEn="National ID Front"
                fileName={freelancerIdFrontFile}
                onFileSelect={(name) => setField('freelancerIdFrontFile', name)}
                onRemove={() => setField('freelancerIdFrontFile', null)}
                locale={locale}
                showCamera
              />
              <FileUploadZone
                label="صورة الهوية (الخلف)"
                labelEn="National ID Back"
                fileName={freelancerIdBackFile}
                onFileSelect={(name) => setField('freelancerIdBackFile', name)}
                onRemove={() => setField('freelancerIdBackFile', null)}
                locale={locale}
                showCamera
              />
            </div>
            <Separator />
            <LivenessDetection
              locale={locale}
              isCompleted={livenessCompleted}
              onComplete={(selfieDataUrl) => {
                setField('livenessSelfie', selfieDataUrl);
                setField('livenessCompleted', true);
              }}
              onSkip={() => {
                // Mark as skipped so user can continue
                setField('livenessCompleted', true);
              }}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-5 animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-base">
                  {t(locale, 'التوثيق المالي', 'Financial Verification')}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {t(locale, 'الحساب البنكي الشخصي', 'Personal bank account')}
                </p>
              </div>
            </div>
            {renderIbanField(freelancerIban, (val) => setField('freelancerIban', val))}
            {renderFinancialNotes()}
          </div>
        );

      default:
        return null;
    }
  };

  // -- SUPPLIER STEPS --
  const renderSupplierStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-5 animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-base">
                  {t(locale, 'التراخيص التجارية', 'Commercial Licenses')}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {t(locale, 'رخصة تجارية + رخصة استيراد', 'Commercial license + Import license')}
                </p>
              </div>
            </div>
            <FileUploadZone
              label="رخصة تجارية"
              labelEn="Commercial License"
              fileName={commercialLicenseFile}
              onFileSelect={(name) => setField('commercialLicenseFile', name)}
              onRemove={() => setField('commercialLicenseFile', null)}
              locale={locale}
            />
            <FileUploadZone
              label="رخصة استيراد"
              labelEn="Import License"
              fileName={importLicenseFile}
              onFileSelect={(name) => setField('importLicenseFile', name)}
              onRemove={() => setField('importLicenseFile', null)}
              locale={locale}
            />
          </div>
        );

      case 1:
        return (
          <div className="space-y-5 animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-base">
                  {t(locale, 'التوثيق المالي', 'Financial Verification')}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {t(locale, 'الحساب البنكي للمورد', 'Supplier bank account')}
                </p>
              </div>
            </div>
            {renderIbanField(supplierIban, (val) => setField('supplierIban', val))}
            {renderFinancialNotes()}
          </div>
        );

      default:
        return null;
    }
  };

  // -- LOGISTICS STEPS --
  const renderLogisticsStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-5 animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="font-semibold text-base">
                  {t(locale, 'التراخيص', 'Licenses')}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {t(locale, 'رخصة النقل وشهادة التأمين', 'Transport license & insurance')}
                </p>
              </div>
            </div>
            <FileUploadZone
              label="رخصة النقل"
              labelEn="Transport License"
              fileName={transportLicenseFile}
              onFileSelect={(name) => setField('transportLicenseFile', name)}
              onRemove={() => setField('transportLicenseFile', null)}
              locale={locale}
            />
            <FileUploadZone
              label="شهادة التأمين"
              labelEn="Insurance Certificate"
              fileName={insuranceCertificateFile}
              onFileSelect={(name) => setField('insuranceCertificateFile', name)}
              onRemove={() => setField('insuranceCertificateFile', null)}
              locale={locale}
            />
          </div>
        );

      case 1:
        return (
          <div className="space-y-5 animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                <Truck className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <h3 className="font-semibold text-base">
                  {t(locale, 'معلومات الأسطول', 'Fleet Information')}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {t(locale, 'بيانات المركبات والسائقين', 'Vehicles & drivers data')}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t(locale, 'عدد المركبات', 'Number of Vehicles')}
                </Label>
                <Input
                  type="number"
                  min="1"
                  placeholder={t(locale, 'مثال: 5', 'e.g. 5')}
                  value={numberOfVehicles}
                  onChange={(e) => setField('numberOfVehicles', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t(locale, 'عدد السائقين', 'Number of Drivers')}
                </Label>
                <Input
                  type="number"
                  min="1"
                  placeholder={t(locale, 'مثال: 8', 'e.g. 8')}
                  value={numberOfDrivers}
                  onChange={(e) => setField('numberOfDrivers', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // -- REVIEW & SUBMIT STEP --
  const renderReviewStep = () => {
    const getReviewItems = (): { label: string; labelEn: string; done: boolean }[] => {
      switch (role) {
        case 'store_manager':
          return [
            { label: 'رقم السجل التجاري', labelEn: 'Commercial Register Number', done: commercialRegisterNumber.length === 10 },
            { label: 'وثيقة السجل التجاري', labelEn: 'Commercial Register Document', done: !!commercialRegisterFile },
            { label: 'IBAN', labelEn: 'IBAN', done: validateIban(iban, ibanConfig) },
            { label: 'اسم المستفيد', labelEn: 'Beneficiary Name', done: beneficiaryName.length > 0 },
            { label: financeConfig.docs[0]?.labelAr || 'الشهادة المصرفية', labelEn: financeConfig.docs[0]?.labelEn || 'Bank Certificate', done: !!bankLetterFile },
            { label: 'الهوية (أمام)', labelEn: 'ID Front', done: !!idFrontFile },
            { label: 'الهوية (خلف)', labelEn: 'ID Back', done: !!idBackFile },
          ];
        case 'seller':
          return [
            { label: 'وثيقة العمل الحر (اختياري)', labelEn: 'Freelance Document (optional)', done: true },
            { label: 'الهوية (أمام)', labelEn: 'National ID Front', done: !!freelancerIdFrontFile },
            { label: 'الهوية (خلف)', labelEn: 'National ID Back', done: !!freelancerIdBackFile },
            { label: 'التحقق الحي', labelEn: 'Liveness Detection', done: livenessCompleted },
            { label: 'IBAN', labelEn: 'IBAN', done: validateIban(freelancerIban, ibanConfig) },
          ];
        case 'supplier':
          return [
            { label: 'رخصة تجارية', labelEn: 'Commercial License', done: !!commercialLicenseFile },
            { label: 'رخصة الاستيراد', labelEn: 'Import License', done: !!importLicenseFile },
            { label: 'IBAN', labelEn: 'IBAN', done: validateIban(supplierIban, ibanConfig) },
          ];
        case 'logistics':
          return [
            { label: 'رخصة النقل', labelEn: 'Transport License', done: !!transportLicenseFile },
            { label: 'شهادة التأمين', labelEn: 'Insurance Certificate', done: !!insuranceCertificateFile },
            { label: 'عدد المركبات', labelEn: 'Number of Vehicles', done: Number(numberOfVehicles) > 0 },
            { label: 'عدد السائقين', labelEn: 'Number of Drivers', done: Number(numberOfDrivers) > 0 },
          ];
        default:
          return [];
      }
    };

    const items = getReviewItems();
    const allDone = items.every((i) => i.done);

    return (
      <div className="space-y-5 animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Eye className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-base">
              {t(locale, 'مراجعة وإرسال', 'Review & Submit')}
            </h3>
            <p className="text-xs text-muted-foreground">
              {t(locale, 'تأكد من اكتمال جميع البيانات', 'Ensure all information is complete')}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 rounded-lg border border-border"
            >
              <div
                className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${
                  item.done
                    ? 'bg-green-100 dark:bg-green-900/30'
                    : 'bg-red-100 dark:bg-red-900/30'
                }`}
              >
                {item.done ? (
                  <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                ) : (
                  <X className="h-3.5 w-3.5 text-red-500 dark:text-red-400" />
                )}
              </div>
              <span className={`text-sm ${item.done ? 'text-foreground' : 'text-destructive'}`}>
                {t(locale, item.label, item.labelEn)}
              </span>
              {item.done && (
                <Badge variant="secondary" className="ms-auto text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                  {t(locale, 'مكتمل', 'Done')}
                </Badge>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-300">
            {t(
              locale,
              'بعد الإرسال، سيتم مراجعة بياناتك خلال 2-24 ساعة عمل',
              'After submission, your data will be reviewed within 2-24 business hours'
            )}
          </p>
        </div>

        <Button
          className="w-full h-12 text-base gradient-navy text-white font-semibold"
          disabled={!allDone || isSubmitting}
          onClick={() => {
            console.log('[OnboardingWizard] Submit button clicked, allDone:', allDone, 'isSubmitting:', isSubmitting, 'items:', items.map(i => `${i.label}=${i.done}`));
            handleSubmit();
          }}
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="h-4 w-4 me-2 animate-spin" />
              {t(locale, 'جاري الإرسال...', 'Submitting...')}
            </>
          ) : (
            <>
              <Shield className="h-4 w-4 me-2" />
              {t(locale, 'إرسال للمراجعة', 'Submit for Review')}
            </>
          )}
        </Button>
      </div>
    );
  };

  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="card-surface max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Draft restored notification */}
        {isDraftRestored && (
          <div className="mx-6 mt-5 flex items-center gap-2.5 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 animate-fade-in">
            <Save className="h-4 w-4 text-blue-600 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                {t(locale, 'تم استعادة بياناتك المحفوظة', 'Your saved data has been restored')}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                {t(locale, 'يمكنك استكمال البقية من حيث توقفت', 'Continue from where you left off')}
              </p>
            </div>
          </div>
        )}
        {/* Top bar: Progress + Draft button */}
        <div className="px-6 pt-5 pb-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg gradient-navy flex items-center justify-center text-white">
                {ROLE_ICONS[role] || <Shield className="h-4 w-4" />}
              </div>
              <h2 className="font-bold text-lg">
                {t(locale, 'اكتمال الحساب', 'Complete Your Account')}
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={handleSaveDraft}
              disabled={isSavingDraft}
            >
              {isSavingDraft ? (
                <Loader2 className="h-3.5 w-3.5 me-1.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5 me-1.5" />
              )}
              {t(locale, 'حفظ المسودة والخروج', 'Save Draft & Exit')}
            </Button>
          </div>
          {/* Progress bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {isReviewStep
                  ? t(locale, 'المراجعة النهائية', 'Final Review')
                  : currentStepData
                    ? t(locale, currentStepData.titleAr, currentStepData.titleEn)
                    : ''}
              </span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        </div>

        <Separator />

        {/* Step indicator */}
        {!isReviewStep && totalSteps > 0 && (
          <div className="px-6 py-3">
            <StepIndicator steps={steps} currentStep={currentStep} locale={locale} />
          </div>
        )}

        <Separator />

        {/* Step content */}
        <div className="px-6 py-6 min-h-[300px]">
          {renderStepContent()}
        </div>

        {/* Navigation footer */}
        {!isReviewStep && (
          <>
            <Separator />
            <div className="px-6 py-4 flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="text-sm"
              >
                {locale === 'ar' ? (
                  <>
                    <ChevronRight className="h-4 w-4 me-1" />
                    {t(locale, 'السابق', 'Previous')}
                  </>
                ) : (
                  <>
                    {t(locale, 'السابق', 'Previous')}
                    <ChevronLeft className="h-4 w-4 ms-1" />
                  </>
                )}
              </Button>
              <Button
                size="sm"
                onClick={handleNext}
                disabled={!canProceed()}
                className={cn(
                  'text-sm font-medium',
                  canProceed()
                    ? 'gradient-navy text-white hover:opacity-90'
                    : 'bg-muted text-muted-foreground',
                )}
              >
                {currentStep === totalSteps - 1
                  ? t(locale, 'مراجعة', 'Review')
                  : t(locale, 'التالي', 'Next')}
                {locale === 'ar' ? (
                  <ChevronLeft className="h-4 w-4 ms-1" />
                ) : (
                  <ChevronRight className="h-4 w-4 ms-1" />
                )}
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
