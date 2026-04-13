'use client';

import { DashboardShell } from '@/components/layouts/dashboard-shell';
import { TicketCard } from '@/components/tickets/ticket-card';
import { useTicketsQuery } from '@/hooks/useTickets';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, Filter, Search, Loader2, Inbox } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function TicketsPage() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to first page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const tickets = useTicketsQuery({ 
    page, 
    limit: 12, 
    search: debouncedSearch || undefined 
  });

  return (
    <DashboardShell activePath="/tickets" title="Ticket Hub">
      <section className="space-y-8">
        {/* Controls Panel */}
        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            <div className="flex flex-1 items-center gap-4 w-full">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search tickets by title, ID or user..." 
                  className="w-full h-12 pl-12 pr-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                />
              </div>
              <Button variant="outline" className="h-12 px-4 border-slate-200 dark:border-slate-800">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
            
            <Link href="/tickets/new">
              <Button className="h-14 px-8 text-lg font-bold flex items-center gap-2 transition-transform hover:scale-[1.02]">
                <Plus className="h-6 w-6" />
                New Ticket
              </Button>
            </Link>
          </div>
        </div>

        {/* Ticket List */}
        <div className="min-h-[400px]">
          {tickets.isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-slate-500 font-medium">Synchronizing ticket queue...</p>
            </div>
          ) : tickets.data?.tickets.length ? (
            <div className="grid gap-4">
              {tickets.data.tickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
              
              {/* Pagination */}
              <div className="flex items-center justify-center gap-4 py-8">
                <Button 
                   variant="outline" 
                   disabled={page === 1}
                   onClick={() => setPage(page - 1)}
                   className=""
                >
                  Previous
                </Button>
                <div className="flex items-center gap-2">
                   <span className="text-sm font-bold bg-primary text-white h-8 w-8 flex items-center justify-center">
                     {page}
                   </span>
                   {tickets.data?.meta.totalPages && tickets.data.meta.totalPages > page && (
                      <>
                        <span className="text-slate-400">/</span>
                        <span className="text-sm text-slate-500">{tickets.data.meta.totalPages}</span>
                      </>
                   )}
                </div>
                <Button 
                   variant="outline" 
                   disabled={!tickets.data?.meta.hasNext}
                   onClick={() => setPage(page + 1)}
                   className=""
                >
                  Next
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
              <div className="h-20 w-20 bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-6">
                <Inbox className="h-10 w-10 text-slate-300" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Your queue is empty</h3>
              <p className="text-slate-500 mt-2 max-w-sm mx-auto">
                No tickets found for the selected criteria. Try adjusting your filters or create a new ticket.
              </p>
              <Link href="/tickets/new" className="mt-8">
                <Button variant="outline" className="px-8 h-12">
                  Create First Ticket
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </DashboardShell>
  );
}
