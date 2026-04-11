'use client';

import { cn } from '@/lib/utils';
import type { HTMLAttributes, ReactNode } from 'react';

interface TabItem {
  title: string;
  active?: boolean;
  onClick: () => void;
}

interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  items: TabItem[];
}

export function Tabs({ className, items }: TabsProps) {
  return (
    <div className={cn('flex items-center gap-2 overflow-x-auto', className)}>
      {items.map((item) => (
        <button
          key={item.title}
          type="button"
          onClick={item.onClick}
          className={cn(
            'rounded-full px-4 py-2 text-sm font-semibold transition',
            item.active ? 'bg-brand-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
          )}
        >
          {item.title}
        </button>
      ))}
    </div>
  );
}
