'use client';

import { useAppStore } from '@/lib/store';
import { useAdminAuthStore } from '@/lib/store/admin-auth';
import { usePathname } from 'next/navigation';
import { Globe, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslationStore } from '@/lib/store/translation-store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { locale, setLocale } = useAppStore();
  const { adminLocale, setAdminLocale } = useAdminAuthStore();
  const pathname = usePathname();
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  const { languages, loadTranslations } = useTranslationStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAdmin = pathname.startsWith('/admin-secure-internal');
  const currentLocale = isAdmin ? adminLocale : locale;
  const currentLangMeta = languages.find(l => l.code === currentLocale);

  const handleSelect = (newLocale: string) => {
    // Load dictionary for the new locale
    loadTranslations(newLocale);
    
    if (isAdmin) {
      setAdminLocale(newLocale as any);
      setLocale(newLocale as any);
    } else {
      setLocale(newLocale as any);
    }
  };

  const isDark = mounted && (theme === 'dark' || (theme === 'system' && systemTheme === 'dark'));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'p-2 rounded-md transition-colors text-[13px] font-bold flex items-center gap-1.5 focus:outline-none',
            isDark
              ? 'hover:bg-white/10 text-[#8899aa] hover:text-white'
              : 'hover:bg-gray-100 text-[#666] hover:text-[#333]',
            className
          )}
          title="Change Language / تغيير اللغة / Changer la langue"
        >
          <Globe className="h-[17px] w-[17px]" />
          <span className="hidden sm:flex items-center gap-1 text-[12px] uppercase">
            {currentLangMeta?.flag || '🇩🇿'}
            <span className="hidden md:inline">{currentLangMeta?.name || 'العربية'}</span>
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={cn(
          'min-w-[160px] z-[200]',
          isDark ? 'bg-[#1e293b] text-white border-white/10' : 'bg-white'
        )}
      >
        <DropdownMenuLabel className={cn('text-[11px] font-normal opacity-60 pb-1', isDark ? 'text-white' : 'text-gray-500')}>
          Language / اللغة
        </DropdownMenuLabel>
        <DropdownMenuSeparator className={isDark ? 'bg-white/10' : ''} />
        {languages.map((lang) => {
          const dir = lang.direction;
          const isActive = currentLocale === lang.code;
          return (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className={cn(
                'cursor-pointer font-medium text-sm flex items-center justify-between gap-2 py-2.5',
                isActive
                  ? isDark
                    ? 'bg-white/10 text-white'
                    : 'bg-primary/10 text-primary'
                  : isDark
                  ? 'focus:bg-white/10 focus:text-white hover:bg-white/5'
                  : 'hover:bg-gray-50'
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{lang.flag}</span>
                <span>{lang.name}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {/* RTL/LTR badge */}
                <span
                  className={cn(
                    'text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wide',
                    dir === 'rtl'
                      ? isDark
                        ? 'border-amber-400/40 text-amber-400 bg-amber-400/10'
                        : 'border-amber-500/40 text-amber-600 bg-amber-50'
                      : isDark
                      ? 'border-blue-400/40 text-blue-400 bg-blue-400/10'
                      : 'border-blue-500/40 text-blue-600 bg-blue-50'
                  )}
                >
                  {dir.toUpperCase()}
                </span>
                {/* Active checkmark */}
                {isActive && (
                  <Check className={cn('h-3.5 w-3.5', isDark ? 'text-white' : 'text-primary')} />
                )}
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
