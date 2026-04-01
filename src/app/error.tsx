'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { locale } = useAppStore();

  useEffect(() => {
    console.error('[ErrorBoundary]', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center space-y-6 max-w-md">
        {/* Brand icon */}
        <div className="mx-auto h-20 w-20 rounded-2xl gradient-navy flex items-center justify-center shadow-lg">
          <span className="text-3xl font-bold text-white">C</span>
        </div>

        {/* Error message */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            {locale === 'ar' ? 'عذراً، حدث خطأ' : 'Oops, something went wrong'}
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {locale === 'ar'
              ? 'لم يتم تحميل هذه الصفحة بشكل صحيح. قد يكون هذا بسبب بطء الاتصال بالإنترنت.'
              : 'This page couldn\'t load properly. This may be due to a slow internet connection.'}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            onClick={() => reset()}
            className="gradient-navy text-white gap-2 px-6 h-11"
          >
            <RefreshCw className="h-4 w-4" />
            {locale === 'ar' ? 'إعادة المحاولة' : 'Reload'}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              window.location.href = '/';
            }}
            className="gap-2 px-6 h-11"
          >
            {locale === 'ar' ? 'العودة للرئيسية' : 'Go Home'}
          </Button>
        </div>

        {/* Technical details (collapsed by default) */}
        {error.digest && (
          <p className="text-xs text-muted-foreground/50 font-mono">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
