'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function HeroSliderSkeleton() {
  return (
    <div className="relative overflow-hidden w-full h-[300px] md:h-[400px] bg-slate-900 rounded-[28px] p-8 md:p-16 flex items-center shadow-lg">
      <div className="space-y-4 max-w-lg z-10 w-full animate-pulse">
        <Skeleton className="h-6 w-32 bg-white/10 rounded-full" />
        <Skeleton className="h-12 w-3/4 bg-white/10 rounded-xl" />
        <Skeleton className="h-8 w-1/2 bg-white/10 rounded-xl" />
        <div className="flex gap-4 pt-4">
          <Skeleton className="h-12 w-36 bg-white/20 rounded-xl" />
          <Skeleton className="h-12 w-36 bg-white/10 rounded-xl" />
        </div>
      </div>
      {/* Decorative reflection line in skeleton */}
      <div className="absolute top-0 -left-full w-1/2 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 animate-shimmer" />
    </div>
  );
}

export function CategoryCirclesSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto py-4 scrollbar-none">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-2 shrink-0 animate-pulse">
          <Skeleton className="w-16 h-16 rounded-full bg-muted/60" />
          <Skeleton className="h-3 w-12 bg-muted/40 rounded" />
        </div>
      ))}
    </div>
  );
}

export function BentoPromoGridSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full animate-pulse">
      {/* Left Promo Card */}
      <div className="lg:col-span-3 h-[420px] rounded-[24px] border border-border bg-card p-6 flex flex-col justify-between">
        <div className="space-y-3">
          <Skeleton className="h-5 w-24 bg-muted/60 rounded" />
          <Skeleton className="h-8 w-40 bg-muted/80 rounded" />
        </div>
        <Skeleton className="w-full aspect-[4/3] bg-muted/40 rounded-xl" />
      </div>

      {/* Center Mega Offers Slider */}
      <div className="lg:col-span-6 h-[420px] rounded-[24px] border border-border bg-card p-6 flex flex-col justify-between relative overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-6 w-32 bg-muted/80 rounded" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 bg-muted/60 rounded" />
            <Skeleton className="h-8 w-8 bg-muted/60 rounded" />
            <Skeleton className="h-8 w-8 bg-muted/60 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 grow">
          <div className="border border-border/50 rounded-xl p-3 flex flex-col gap-2">
            <Skeleton className="aspect-square bg-muted/40 rounded-lg w-full" />
            <Skeleton className="h-4 w-3/4 bg-muted/60 rounded" />
            <Skeleton className="h-4 w-1/4 bg-muted/80 rounded" />
          </div>
          <div className="border border-border/50 rounded-xl p-3 flex flex-col gap-2">
            <Skeleton className="aspect-square bg-muted/40 rounded-lg w-full" />
            <Skeleton className="h-4 w-3/4 bg-muted/60 rounded" />
            <Skeleton className="h-4 w-1/4 bg-muted/80 rounded" />
          </div>
        </div>
      </div>

      {/* Right Noon-it Grid */}
      <div className="lg:col-span-3 h-[420px] grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border border-border rounded-[20px] bg-card p-3 flex flex-col justify-between">
            <Skeleton className="h-3 w-14 bg-muted/40 rounded" />
            <Skeleton className="h-4 w-20 bg-muted/60 rounded" />
            <Skeleton className="w-full aspect-[3/2] bg-muted/30 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="border border-border rounded-[24px] p-3 flex flex-col space-y-3 bg-card animate-pulse shadow-md relative overflow-hidden h-[330px]">
      <div className="aspect-square bg-muted/50 rounded-2xl w-full" />
      <Skeleton className="h-3.5 w-16 bg-muted/40 rounded" />
      <Skeleton className="h-4 w-3/4 bg-muted/60 rounded" />
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-3 bg-muted/40 rounded-full" />
        ))}
      </div>
      <div className="mt-auto flex justify-between items-end">
        <div className="space-y-1 w-2/3">
          <Skeleton className="h-5 w-20 bg-muted/70 rounded" />
          <Skeleton className="h-3.5 w-14 bg-muted/40 rounded" />
        </div>
        <Skeleton className="h-8 w-8 bg-muted/60 rounded-full shrink-0" />
      </div>
    </div>
  );
}

export function ProductSliderSkeleton() {
  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48 bg-muted/80 rounded" />
          <Skeleton className="h-4.5 w-64 bg-muted/50 rounded" />
        </div>
        <Skeleton className="h-8 w-20 bg-muted/60 rounded" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
