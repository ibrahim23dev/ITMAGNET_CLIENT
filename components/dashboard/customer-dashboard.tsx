'use client';

import { useTicketsQuery } from '@/hooks/useTickets';
import { TicketCard } from '@/components/tickets/ticket-card';
import { Search, Plus, Ticket, HelpCircle, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function CustomerDashboard() {
  const myTickets = useTicketsQuery({ limit: 6 });

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="bg-white border border-slate-200 rounded-3xl p-10 flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="space-y-5 max-w-lg">
          <h2 className="text-4xl font-bold text-slate-900">How can we help you today?</h2>
          <p className="text-slate-600">Create a new ticket or check your existing requests.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/tickets/new">
              <Button size="lg" className="h-14 px-8">
                <Plus className="mr-2" /> New Ticket
              </Button>
            </Link>
            <Link href="/search">
              <Button size="lg" variant="outline" className="h-14 px-8">
                <Search className="mr-2" /> Search Knowledge Base
              </Button>
            </Link>
          </div>
        </div>
        <div className="hidden lg:block">
          <HelpCircle className="h-40 w-40 text-indigo-100" />
        </div>
      </div>

      {/* My Tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold flex items-center gap-3">
              <Ticket className="text-indigo-600" /> My Recent Tickets
            </h3>
            <Link href="/tickets" className="text-indigo-600 font-medium">View All →</Link>
          </div>

          <div className="space-y-4">
            {myTickets.isLoading ? (
              <div className="space-y-4">
                {[1,2,3].map(i => <div key={i} className="h-28 bg-slate-100 animate-pulse rounded-2xl" />)}
              </div>
            ) : myTickets.data?.tickets?.length ? (
              myTickets.data.tickets.map((t: any) => <TicketCard key={t.id} ticket={t} />)
            ) : (
              <div className="text-center py-20 bg-slate-50 rounded-3xl">
                <p className="text-slate-500">You have no active tickets.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-8">
            <h3 className="uppercase tracking-widest text-xs font-bold text-slate-400 mb-6 flex items-center gap-2">
              <Activity className="text-emerald-500" /> SYSTEM STATUS
            </h3>
            {['Live Support', 'AI Assistant', 'Ticket Engine'].map((name, i) => (
              <div key={i} className="flex justify-between py-3 border-t first:border-t-0">
                <span>{name}</span>
                <span className="text-emerald-500 font-medium">Operational</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}