'use client';

import { useTicketsQuery } from '@/hooks/useTickets';
import { TicketCard } from '@/components/tickets/ticket-card';
import { Zap, Clock, ListChecks, Sparkles } from 'lucide-react';

export function AgentDashboard() {
  const assignedTickets = useTicketsQuery({ limit: 8, status: 'open' });

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Assigned Tickets', value: assignedTickets.data?.meta?.total || 0, icon: <ListChecks />, color: 'bg-blue-50 text-blue-600' },
          { label: 'Avg Reply Time', value: '4m 32s', icon: <Clock />, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'AI Hours Saved', value: '18h', icon: <Zap />, color: 'bg-amber-50 text-amber-600' },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-slate-200 p-6 rounded-2xl">
            <div className={`inline-flex p-3 rounded-xl mb-4 ${s.color}`}>{s.icon}</div>
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Priority Queue */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 h-[620px] flex flex-col">
          <h3 className="text-xl font-bold mb-6">My Priority Queue</h3>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {assignedTickets.isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-xl" />)}
              </div>
            ) : (
              assignedTickets.data?.tickets?.map((t: any) => <TicketCard key={t.id} ticket={t} />)
            )}
          </div>
        </div>

        {/* AI Copilot Sidebar */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-2xl p-8 relative overflow-hidden">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-1 rounded-full text-xs font-bold mb-4">
                <Sparkles className="h-4 w-4" /> AI COPILOT
              </div>
              <h3 className="text-2xl font-bold mb-3">Suggested Response Ready</h3>
              <p className="text-white/80">AI has prepared a response for ticket #TK-842</p>
              <button className="mt-6 w-full bg-white text-indigo-700 py-3.5 rounded-xl font-semibold hover:bg-indigo-50">
                Review AI Suggestion
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}