'use client';

import { useAppStore } from '@/lib/store';
import { useAdminAuthStore } from '@/lib/store/admin-auth';
import { usePathname } from 'next/navigation';
import { Check } from 'lucide-react';
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

// Convert regional indicator symbol emojis (e.g. 🇩🇿) to lowercase 2-letter country codes (e.g. dz)
function flagEmojiToCode(emoji: string): string {
  if (!emoji) return 'un';
  if (/^[a-zA-Z]{2}$/.test(emoji)) return emoji.toLowerCase();
  
  const codePoints = Array.from(emoji).map(c => c.codePointAt(0));
  const chars = codePoints
    .filter(cp => cp !== undefined && cp >= 127462 && cp <= 127487)
    .map(cp => String.fromCharCode(cp! - 127462 + 97));
  
  if (chars.length === 2) {
    return chars.join('');
  }
  
  const clean = emoji.trim().toLowerCase();
  if (clean === 'ar' || clean === 'العربية' || clean === 'dz') return 'dz';
  if (clean === 'en' || clean === 'english' || clean === 'gb') return 'gb';
  if (clean === 'fr' || clean === 'français' || clean === 'french') return 'fr';
  
  return 'un';
}

import { isAdminPath } from '@/lib/i18n/config';

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

  const isAdmin = isAdminPath(pathname);
  const currentLocale = isAdmin ? adminLocale : locale;
  const currentLangMeta = languages.find(l => l.code === currentLocale);

  const handleSelect = (newLocale: string) => {
    loadTranslations(newLocale);
    
    // Update cookies
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;

    if (isAdmin) {
      setAdminLocale(newLocale as any);
    } else {
      setLocale(newLocale as any);
    }
    
    // Force a hard reload so that server components (like Docs) get the new NEXT_LOCALE cookie
    // Refresh the login guard so DashboardLayout doesn't falsely log out the user due to cancelled useSession fetches during reload
    try { sessionStorage.setItem('just_logged_in', Date.now().toString()); } catch {}
    window.location.reload();
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
          {currentLangMeta && (
            <img
              src={`https://hatscripts.github.io/circle-flags/flags/${flagEmojiToCode(currentLangMeta.flag)}.svg`}
              className="w-5 h-5 rounded-full object-cover shrink-0"
              alt={currentLangMeta.name}
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          )}
          <span className="hidden md:inline text-[12px] uppercase">
            {currentLangMeta?.name || 'العربية'}
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
                <img
                  src={`https://hatscripts.github.io/circle-flags/flags/${flagEmojiToCode(lang.flag)}.svg`}
                  className="w-5 h-5 rounded-full object-cover shrink-0"
                  alt={lang.name}
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <span>{lang.name}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
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
