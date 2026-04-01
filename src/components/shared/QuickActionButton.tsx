'use client';

import { useAppStore } from '@/lib/store';
import { ArrowRight, ArrowLeft, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ============================================
// QUICK ACTION BUTTON — Unified design system component
// ============================================
// Used across: NotificationPanel, StickyStatusBanner, RejectedBanner, VerificationItemRow
// Ensures consistent look for all quick action CTAs
//
// ─────────────────────────────────────────────
// 📐 UNIFIED DESIGN PATTERNS
// ─────────────────────────────────────────────
//
// A. RTL PATTERN:
//    1. INLINE COMPONENTS (inside AppShell's dir context):
//       - Rely on parent dir="rtl"/"ltr" from AppShell
//       - Add text-start on text containers
//       - NO dir="auto" on flex containers (causes layout issues)
//       - Example: Sidebar nav items, Banner content, Dashboard cards
//
//    2. PORTAL / DROPDOWN COMPONENTS (rendered outside DOM tree):
//       - Radix DropdownMenu: pass dir={isRTL ? 'rtl' : 'ltr'} to <DropdownMenu> root
//       - AlertDialog: pass dir={dir} to <AlertDialogContent>
//       - Sheet: pass dir to <SheetContent> AND inner wrapper div
//       - Custom dropdowns: add dir explicitly on the panel wrapper div
//       - ScrollArea: pass dir to <ScrollArea> AND inner content div
//       - Example: NotificationPanel, User Menu in Header
//
//    3. ICON DIRECTION:
//       - Arrows/chevrons: flip based on locale (ArrowLeft for AR, ArrowRight for EN)
//       - Neutral icons (Bell, Settings, User): never flip
//
//    4. LOGICAL PROPERTIES:
//       - Use start/end instead of left/right in Tailwind classes
//       - Example: start-0, end-0, ps-4, pe-2, ms-2, me-2
//
// B. SKELETON / LOADING PATTERN:
//    - NEVER use bg-accent or bg-brand for loading states (accent = yellow!)
//    - Use <Skeleton> component (already has correct gray color)
//    - Default: .skeleton-pulse — subtle opacity animation
//    - Premium: add .skeleton-shimmer class — gradient sweep (Stripe/YouTube style)
//    - Example: <Skeleton className="h-4 w-48" />
//              <Skeleton className="h-10 w-full rounded-lg skeleton-shimmer" />
//    - For table rows: <TableSkeleton rows={5} /> (define locally per page)
//    - For cards: stack 2-3 Skeletons vertically with gap-2
//
// C. COLOR USAGE RULES:
//    - bg-primary / text-primary → Navy (brand primary), NOT for general backgrounds
//    - bg-accent / text-accent → Yellow (brand accent), for small accents ONLY
//    - bg-muted / text-muted → Gray tones, for disabled/inactive states
//    - bg-surface / bg-card → White/dark background for containers
//    - bg-destructive → Red, for errors/delete actions
//    - Status: bg-green-100 text-green-800 (success), bg-amber-100 (warning), bg-red-100 (error)
//
// D. LOADING STATES:
//    - Use Loader2 icon with "animate-spin" for button loading
//    - Use Skeleton component for content loading (tables, cards, forms)
//    - Never show empty white space — always show skeleton or spinner
//    - Use Skeleton with shimmer for premium feel (data-heavy pages)
//    - Use Skeleton with pulse for simple loading (dialogs, small sections)
//
// E. RESPONSIVE BREAKPOINTS:
//    - Mobile first: design for 320px, enhance up
//    - sm: 640px — Tablet portrait
//    - md: 768px — Tablet landscape
//    - lg: 1024px — Desktop
//    - xl: 1280px — Wide desktop
//    - 2xl: 1536px — Ultra-wide
//    - Use "hidden md:block" pattern for mobile/desktop switching
//
// F. SPACING CONSISTENCY:
//    - Cards: p-4 or p-6 padding, gap-4 or gap-6 between children
//    - Sections: space-y-6 between major sections
//    - Inline elements: gap-2 for buttons, gap-3 for icons+text
//    - Use consistent border-radius: rounded-md for cards, rounded-lg for larger containers
//
// G. TOAST / FEEDBACK:
//    - Use toast from 'sonner' for all user feedback
//    - Success: toast.success()
//    - Error: toast.error()
//    - Info: toast.info()
//    - Never use alert() or confirm() — use AlertDialog instead

export type QuickActionVariant = 'primary' | 'warning' | 'danger' | 'subtle';

interface QuickActionButtonProps {
  labelAr: string;
  labelEn: string;
  variant?: QuickActionVariant;
  onClick: () => void;
  icon?: LucideIcon;
  className?: string;
}

const variantStyles: Record<QuickActionVariant, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm',
  warning: 'bg-amber-600 text-white hover:bg-amber-700 shadow-sm',
  danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm',
  subtle: 'border border-primary/30 text-primary hover:bg-primary/10 bg-transparent',
};

export default function QuickActionButton({
  labelAr,
  labelEn,
  variant = 'subtle',
  onClick,
  className,
}: QuickActionButtonProps) {
  const isAr = useAppStore((s) => s.locale === 'ar');
  const ChevronIcon = isAr ? ArrowLeft : ArrowRight;

  return (
    <Button
      size="sm"
      variant={variant === 'danger' ? 'destructive' : 'outline'}
      className={cn(
        'h-8 text-xs gap-1.5 px-3 font-medium transition-all duration-200',
        'hover:shadow-md active:scale-[0.97]',
        variantStyles[variant],
        className
      )}
      onClick={onClick}
    >
      {isAr ? labelAr : labelEn}
      <ChevronIcon className="size-3.5" />
    </Button>
  );
}
