'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/layouts/dashboard-shell';
import { useTicketQuery, useUpdateTicket } from '@/hooks/useTickets';
import { AssistantPanel } from '@/components/ai/assistant-panel';
import { Button } from '@/components/ui/button';
import { CommentThread } from '@/components/comments/comment-thread';
import { 
  BadgeCheck, 
  Clock, 
  User as UserIcon, 
  Tag, 
  ArrowLeft, 
  MoreHorizontal, 
  CheckCircle2, 
  AlertCircle,
  MessageCircle,
  History
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = (Array.isArray(params?.id) ? params.id[0] : params?.id) ?? '';
  const ticketQuery = useTicketQuery(ticketId);
  const updateMutation = useUpdateTicket();

  const ticket = ticketQuery.data;

  const handleStatusUpdate = (status: string) => {
    updateMutation.mutate({ id: ticketId, payload: { status } });
  };

  if (ticketQuery.isLoading) {
    return (
      <DashboardShell activePath="/tickets" title="Loading Ticket...">
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-primary"></div>
          <p className="text-slate-500 font-medium">Fetching ticket intelligence...</p>
        </div>
      </DashboardShell>
    );
  }

  if (!ticket) {
    return (
      <DashboardShell activePath="/tickets" title="Ticket Not Found">
        <div className="p-12 text-center rounded-[3rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
           <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
           <h2 className="text-2xl font-bold">Ticket search returned no results</h2>
           <p className="text-slate-500 mt-2">The ticket you are looking for might have been deleted or moved.</p>
           <Button onClick={() => router.push('/tickets')} className="mt-8 rounded-xl">Back to Ticket Hub</Button>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell activePath="/tickets" title={ticket.ticketNumber || `Ticket #${ticketId.slice(-6).toUpperCase()}`}>
      <div className="space-y-8 pb-20">
        {/* Header Section */}
        <div className="group relative rounded-[2.5rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 lg:p-10 shadow-sm overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
           
           <div className="relative z-10 flex flex-col lg:flex-row gap-8 justify-between">
              <div className="space-y-4 flex-1">
                <button 
                  onClick={() => router.push('/tickets')} 
                  className="flex items-center text-xs font-bold text-slate-400 hover:text-primary transition-colors uppercase tracking-wider mb-2"
                >
                  <ArrowLeft className="mr-2 h-3.5 w-3.5" />
                  Back to Hub
                </button>
                <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                  {ticket.title}
                </h1>
                 <div className="flex flex-wrap gap-4 items-center text-sm font-medium">
                   <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                     <Clock className="h-4 w-4" />
                     Created {new Date(ticket.createdAt).toLocaleDateString()}
                   </div>
                   <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                     <UserIcon className="h-4 w-4" />
                     {ticket.creator?.name || 'Customer'}
                   </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 min-w-[200px]">
                 <div className="flex gap-2 justify-end">
                    <Badge variant={ticket.status === 'open' ? 'success' : 'neutral'} className="rounded-lg h-8 px-3 uppercase text-[10px] tracking-widest font-bold">
                       {ticket.status}
                    </Badge>
                    <Badge variant={ticket.priority === 'high' || ticket.priority === 'critical' ? 'danger' : 'warning'} className="rounded-lg h-8 px-3 uppercase text-[10px] tracking-widest font-bold">
                       {ticket.priority}
                    </Badge>
                 </div>
                 <div className="flex flex-wrap gap-2 justify-end">
                    <Button variant="outline" size="sm" className="rounded-xl h-10 border-slate-200 dark:border-slate-800">
                       <MoreHorizontal className="h-4 w-4" />
                    </Button>
                    <Button 
                      onClick={() => handleStatusUpdate(ticket.status === 'resolved' ? 'open' : 'resolved')}
                      className={cn(
                        "rounded-xl h-10 px-6 font-bold text-sm transition-all",
                        ticket.status === 'resolved' ? "bg-slate-100 text-slate-900 hover:bg-slate-200" : "bg-emerald-600 hover:bg-emerald-700 text-white"
                      )}
                    >
                      {ticket.status === 'resolved' ? 'Reopen Ticket' : 'Mark as Resolved'}
                    </Button>
                 </div>
              </div>
           </div>

           <div className="mt-10 p-6 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Tag className="h-3 w-3" />
                Original Issue Report
              </h3>
              <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                {ticket.description}
              </p>
           </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.4fr_0.6fr]">
          <div className="space-y-8">
            {/* Communication Thread */}
            <div className="space-y-6">
               <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    Conversation
                  </h2>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-full">
                     <History className="h-3.5 w-3.5" />
                     Live Refresh Active
                  </div>
               </div>
               
               <CommentThread ticketId={ticketId} />
            </div>
          </div>

          <div className="space-y-8">
            {/* AI Assistant Side Panel */}
            <AssistantPanel ticketId={ticketId} />
            
            {/* Ticket Insights Card */}
            <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white border border-white/5 shadow-2xl relative overflow-hidden group">
               <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -ml-16 -mb-16"></div>
               <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-2">
                     <BadgeCheck className="h-5 w-5 text-primary" />
                     <h3 className="text-lg font-bold">Ticket Attributes</h3>
                  </div>
                  
                  <div className="space-y-4">
                     <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">AI Category</p>
                        <p className="text-sm font-semibold">{ticket.category || 'Triage in progress...'}</p>
                     </div>
                     <div className="h-[1px] bg-white/10 w-full"></div>
                     <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Assigned Agent</p>
                        <p className="text-sm font-semibold">{ticket.assignedToName || 'Unassigned (Auto-pilot)'}</p>
                     </div>
                     <div className="h-[1px] bg-white/10 w-full"></div>
                     <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Customer Sentiment</p>
                        <div className="flex items-center gap-2 mt-2">
                           <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                              <div className="h-full bg-emerald-500 w-[75%]"></div>
                           </div>
                           <span className="text-xs font-bold text-emerald-400">Positive</span>
                        </div>
                     </div>
                  </div>

                  <Button className="w-full h-12 rounded-xl bg-white text-slate-950 font-bold hover:bg-slate-100 shadow-md">
                    Assign to Me
                  </Button>
               </div>
            </div>

            {/* SLA Timer */}
            <div className="p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
               <div className="flex flex-col items-center text-center space-y-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">SLA Resolution Goal</p>
                  <h4 className="text-3xl font-extrabold tracking-tight">04h 12m</h4>
                  <div className="w-full h-1 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden mt-2">
                     <div className="h-full bg-primary w-[40%]"></div>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2">Targeted resolution by 11:45 PM tonight</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

function Badge({ children, variant = "outline", className = "" }: { children: React.ReactNode, variant?: string, className?: string }) {
  const styles: Record<string, string> = {
    outline: "border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400",
    success: "bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50",
    warning: "bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50",
    destructive: "bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50",
  };
  
  return (
    <div className={cn("inline-flex items-center justify-center rounded-md text-xs font-semibold ring-offset-background transition-colors", styles[variant], className)}>
      {children}
    </div>
  );
}
