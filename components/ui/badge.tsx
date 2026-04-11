'use client';

import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

const variantClasses = {
  success: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50',
  warning: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50',
  danger: 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50',
  neutral: 'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800',
  primary: 'bg-primary/10 text-primary border-primary/20',
};

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof variantClasses;
}

export function Badge({ className, variant = 'neutral', ...props }: BadgeProps) {
  return (
    <div 
      className={cn(
        'inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-bold uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2', 
        variantClasses[variant], 
        className
      )} 
      {...props} 
    />
  );
}
