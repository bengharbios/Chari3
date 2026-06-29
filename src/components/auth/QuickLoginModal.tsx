'use client';

import React, { useState } from 'react';
import { useAppStore, useAuthStore } from '@/lib/store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Mail, Lock, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Turnstile from 'react-turnstile';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface QuickLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function QuickLoginModal({ isOpen, onClose, onSuccess }: QuickLoginModalProps) {
  const { locale } = useAppStore();
  const { login } = useAuthStore();
  const router = useRouter();
  const isRTL = locale === 'ar';
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [captchaConfig, setCaptchaConfig] = useState({ enabled: false, siteKey: '' });
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [configLoaded, setConfigLoaded] = useState(false);

  const { t } = useTranslation();

  React.useEffect(() => {
    fetch('/api/auth/config')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCaptchaConfig({
            enabled: data.config.captchaEnabled,
            siteKey: data.config.captchaSiteKey,
          });
        }
        setConfigLoaded(true);
      })
      .catch(() => setConfigLoaded(true));
  }, []);

  const canSend = captchaConfig.enabled && captchaConfig.siteKey ? !!captchaToken : true;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) return;
    
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, captchaToken }),
      });
      
      const data = await res.json();
      if (data.success) {
        login(data.user, data.token);
        toast.success(t('checkout.logged_in', 'تم تسجيل الدخول بنجاح!'));
        onClose();
        if (onSuccess) onSuccess();
      } else {
        toast.error(data.error || t('checkout.invalid_credentials', 'بيانات الدخول غير صحيحة'));
      }
    } catch (error) {
      toast.error(t('checkout.server_error', 'حدث خطأ أثناء الاتصال بالخادم'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to actual next-auth google flow or show toast
    toast.success(t('checkout.google_redirect', 'سيتم توجيهك إلى Google...'));
    // Example: window.location.href = '/api/auth/signin/google'
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-0 rounded-3xl" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="relative">
          {/* Header Banner */}
          <div className="bg-brand/10 p-6 pb-8 text-center relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1.5 gradient-brand"></div>
            <DialogTitle className="text-xl font-black font-cairo text-foreground">
              {t('checkout.all_data_secured', 'جميع البيانات مؤمنة')}
            </DialogTitle>
            <p className="text-sm font-semibold text-primary mt-2 flex items-center justify-center gap-1.5">
              <Lock className="size-4" />
              {t('checkout.free_shipping_offer', 'شحن مجاني عرض خاص لك')}
            </p>
            <div className="flex items-center justify-center gap-4 mt-4 text-xs font-bold text-muted-foreground">
              <span className="flex items-center gap-1">
                <ChevronRight className="size-3 text-green-500" />
                {t('checkout.free_return', 'إرجاع مجاني')}
              </span>
              <span className="flex items-center gap-1">
                <ChevronRight className="size-3 text-green-500" />
                {t('checkout.up_to_90_days', 'لمدة تصل إلى ٩٠ يومًا')}
              </span>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 bg-surface -mt-4 rounded-t-3xl relative z-10 space-y-6">
            <div className="text-center space-y-2">
              <p className="text-sm font-bold text-foreground">
                {t('checkout.sign_in_to_save', 'سجِّل الدخول لحفظ عربة تسوقك في حسابك.')}
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">
                  {t('checkout.email_or_phone', 'البريد الإلكتروني أو رقم الهاتف')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-muted-foreground">
                    <Mail className="size-4" />
                  </div>
                  <Input 
                    required 
                    placeholder="user@example.com / 05xxxxxx" 
                    className="h-12 rounded-xl bg-muted/20 border-border/80 ps-10"
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">
                  {t('checkout.password', 'كلمة المرور')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-muted-foreground">
                    <Lock className="size-4" />
                  </div>
                  <Input 
                    required 
                    type="password" 
                    placeholder="••••••••" 
                    className="h-12 rounded-xl bg-muted/20 border-border/80 ps-10"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {configLoaded && captchaConfig.enabled && captchaConfig.siteKey && (
                <div className="flex justify-center my-4 animate-fade-in">
                  <Turnstile
                    sitekey={captchaConfig.siteKey}
                    onVerify={(token) => setCaptchaToken(token)}
                    theme="auto"
                  />
                </div>
              )}

              <Button 
                type="submit" 
                disabled={isLoading || !canSend}
                className="w-full h-12 rounded-xl font-bold gradient-brand text-navy text-base shadow-lg shadow-brand/20 hover:scale-[1.02] transition-all"
              >
                {isLoading ? <Loader2 className="size-5 animate-spin" /> : t('checkout.continue', 'المتابعة')}
              </Button>
            </form>

            <div className="relative flex items-center justify-center text-xs">
              <div className="absolute inset-x-0 h-px bg-border/60"></div>
              <span className="relative bg-surface px-4 text-muted-foreground font-semibold">
                {t('checkout.or_continue_with', 'أو المتابعة بطرق أخرى')}
              </span>
            </div>

            <Button 
              type="button" 
              variant="outline" 
              className="w-full h-12 rounded-xl font-bold border-border/80 hover:bg-muted/30 flex items-center justify-center gap-2"
              onClick={handleGoogleLogin}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </Button>

            <div className="flex flex-col gap-2 pt-2">
              <Button 
                type="button" 
                variant="ghost" 
                className="w-full text-xs font-bold text-[var(--navy)] hover:bg-[var(--navy)]/5"
                onClick={() => {
                  onClose();
                  import('@/lib/store/auth-flow').then(m => m.useAuthFlowStore.getState().setIntent('checkout'));
                  if (window.location.pathname !== '/') {
                    router.push('/?view=login');
                  } else {
                    useAppStore.getState().setCurrentPage('login');
                  }
                }}
              >
                {t('checkout.login_securely_with_otp', 'تسجيل الدخول باستخدام رمز OTP الآمن')}
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                className="w-full text-xs font-bold text-brand hover:bg-brand/10"
                onClick={() => {
                  onClose();
                  import('@/lib/store/auth-flow').then(m => m.useAuthFlowStore.getState().setIntent('checkout'));
                  if (window.location.pathname !== '/') {
                    router.push('/?view=login');
                  } else {
                    useAppStore.getState().setCurrentPage('login');
                  }
                }}
              >
                {t('checkout.register_now', 'ليس لديك حساب؟ أنشئ حسابك الآن')}
              </Button>
            </div>

            <p className="text-[10px] text-center text-muted-foreground px-4 leading-relaxed">
              {t('checkout.terms_agreement', 'بالمتابعة، فإنك توافق على شروط الاستخدام وسياسة الخصوصية الخاصة بـ ChariDay.')}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
