'use client';

import type { AnalyticsSnapshot } from '@/types';
import { Badge } from '@/components/ui/badge';

export function OverviewCard({ snapshot }: { snapshot: AnalyticsSnapshot }) {
  return (
    <div className="grid gap-4 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-panel md:grid-cols-4">
      <div className="space-y-2">
        <p className="text-sm text-slate-500">Total tickets</p>
        <p className="text-3xl font-semibold text-slate-950">{snapshot.totalTickets}</p>
      </div>
      <div className="space-y-2">
        <p className="text-sm text-slate-500">Open tickets</p>
        <p className="text-3xl font-semibold text-slate-950">{snapshot.openTickets}</p>
      </div>
      <div className="space-y-2">
        <p className="text-sm text-slate-500">High priority</p>
        <p className="text-3xl font-semibold text-slate-950">{snapshot.highPriority}</p>
      </div>
      <div className="space-y-2">
        <p className="text-sm text-slate-500">Avg resolution</p>
        <p className="text-3xl font-semibold text-slate-950">{snapshot.avgResolutionTime}</p>
      </div>
    </div>
  );
}
