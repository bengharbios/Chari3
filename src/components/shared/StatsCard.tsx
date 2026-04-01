'use client';

import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: ReactNode;
  iconBg?: string;
  className?: string;
  subtitle?: string;
}

export function StatsCard({ title, value, change, icon, iconBg, className, subtitle }: StatsCardProps) {
  const isPositive = change && change >= 0;

  return (
    <Card className={cn('card-surface overflow-hidden', className)}>
      <CardContent className="p-4 md:p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
            <p className="text-2xl md:text-3xl font-bold tracking-tight">{value}</p>
            <div className="flex items-center gap-2">
              {change !== undefined && (
                <span
                  className={cn(
                    'inline-flex items-center gap-0.5 text-xs font-semibold rounded-full px-2 py-0.5',
                    isPositive
                      ? 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30'
                      : 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
                  )}
                >
                  {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {Math.abs(change)}%
                </span>
              )}
              {subtitle && (
                <span className="text-xs text-muted-foreground">{subtitle}</span>
              )}
            </div>
          </div>
          <div className={cn('h-10 w-10 md:h-12 md:w-12 rounded-xl flex items-center justify-center shrink-0', iconBg)}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface StatusBadgeProps {
  status: string;
  colorClass?: string;
  className?: string;
}

export function StatusBadge({ status, colorClass, className }: StatusBadgeProps) {
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-medium rounded-full px-2.5 py-1', colorClass, className)}>
      {status}
    </span>
  );
}

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="h-16 w-16 rounded-2xl bg-surface flex items-center justify-center mb-4 text-muted-foreground">
        {icon}
      </div>
      <h3 className="font-semibold text-lg mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-4">{description}</p>
      {action}
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
