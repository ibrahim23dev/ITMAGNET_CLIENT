'use client';

import Link from 'next/link';
import type { Ticket } from '@/types';
import { CalendarDays, Tag, ChevronRight, Sparkles, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TicketCard({ ticket }: { ticket: Ticket }) {
  const isHighPriority = ticket.priority === 'high' || ticket.priority === 'critical';

  return (
    <Link 
      href={`/tickets/${ticket.id}`} 
      className="group relative block rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/40 overflow-hidden"
    >
      {/* High Priority Indicator */}
      {isHighPriority && (
         <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500"></div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
              {ticket.ticketNumber || `#${ticket.id.slice(-6).toUpperCase()}`}
            </span>
            <div className={cn(
              "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest",
              ticket.status === 'open' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30" : "bg-slate-100 text-slate-500 dark:bg-slate-800"
            )}>
              {ticket.status}
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
            {ticket.title}
          </h2>
          
          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 max-w-2xl">
            {ticket.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
               <CalendarDays className="h-3.5 w-3.5" />
               {new Date(ticket.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
               <Tag className="h-3.5 w-3.5" />
               {ticket.category || 'Uncategorized'}
            </div>
            {ticket.isAIProcessed && (
               <div className="flex items-center gap-1.5 text-xs font-bold text-primary px-2 py-1 rounded-lg bg-primary/5">
                  <Sparkles className="h-3 w-3" />
                  AI Triage
               </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex flex-col items-end gap-1">
             <div className="flex items-center gap-1.5">
                {isHighPriority && <AlertCircle className="h-3.5 w-3.5 text-rose-500" />}
                <span className={cn(
                  "text-xs font-bold uppercase tracking-widest",
                  isHighPriority ? "text-rose-500" : "text-slate-400"
                )}>
                  {ticket.priority} Priority
                </span>
             </div>
             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
               Req: {ticket.creator?.name || 'User'}
             </p>
          </div>
          
          <div className="h-10 w-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all transform group-hover:rotate-45">
            <ChevronRight className="h-5 w-5" />
          </div>
        </div>
      </div>
    </Link>
  );
}
