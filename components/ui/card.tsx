'use client';

import { cn } from '@/lib/utils';
import type { HTMLAttributes, PropsWithChildren } from 'react';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('border border-slate-200/80 bg-white p-6 shadow-panel', className)} {...props} />;
}
