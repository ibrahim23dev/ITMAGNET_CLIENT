'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/hooks/useAuthStore';
import { DashboardShell } from '@/components/layouts/dashboard-shell';
import { OverviewCard } from '@/components/analytics/overview-card';
import { TicketCard } from '@/components/tickets/ticket-card';
import { useAnalyticsQuery } from '@/hooks/useAnalytics';
import { useTicketsQuery } from '@/hooks/useTickets';
import { AlertTriangle, Sparkles, TrendingUp, Users, Clock, CheckCircle2 } from 'lucide-react';

export default function DashboardPage() {
  const { accessToken } = useAuthStore();
  const router = useRouter();
  const analytics = useAnalyticsQuery();
  const tickets = useTicketsQuery({ limit: 5, status: 'open' });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!accessToken) {
      router.push('/auth/login');
    }
  }, [accessToken, router]);

  return (
    <DashboardShell activePath="/dashboard" title="Dashboard Overview">
      <section className="space-y-8">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Tickets', value: '1,284', icon: <TrendingUp className="h-5 w-5" />, color: 'bg-blue-500', trend: '+12%' },
            { label: 'Active Users', value: '452', icon: <Users className="h-5 w-5" />, color: 'bg-purple-500', trend: '+5%' },
            { label: 'Avg Solve Time', value: '1.4h', icon: <Clock className="h-5 w-5" />, color: 'bg-amber-500', trend: '-8%' },
            { label: 'Satisfaction', value: '98%', icon: <CheckCircle2 className="h-5 w-5" />, color: 'bg-emerald-500', trend: '+2%' },
          ].map((stat, i) => (
             <div key={i} className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
               <div className="flex items-center justify-between mb-4">
                 <div className={`p-3 rounded-2xl ${stat.color} text-white`}>
                   {stat.icon}
                 </div>
                 <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/30'}`}>
                   {stat.trend}
                 </span>
               </div>
               <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
               <h4 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</h4>
             </div>
          ))}
        </div>

        {/* Analytics Section */}
        <div className="space-y-4">
           <h3 className="text-lg font-bold flex items-center gap-2">
             <Sparkles className="h-5 w-5 text-primary" />
             AI Performance Analytics
           </h3>
          {analytics.isLoading ? (
            <div className="rounded-[2rem] bg-white dark:bg-slate-900 p-10 text-center text-slate-500 border border-slate-200 dark:border-slate-800">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary mb-4"></div>
              <p>Fetching real-time insights...</p>
            </div>
          ) : analytics.error ? (
            <div className="rounded-[2rem] border border-rose-200 bg-rose-50 dark:bg-rose-950/20 p-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-rose-600" />
                <div className="text-sm text-rose-700 dark:text-rose-400">
                  <p className="font-bold text-lg">Unable to connect to AI Hub</p>
                  <p className="mt-1">{analytics.error.message}</p>
                </div>
              </div>
            </div>
          ) : analytics.data ? (
            <OverviewCard snapshot={analytics.data} />
          ) : (
            <div className="rounded-[2rem] bg-white dark:bg-slate-900 p-10 text-center text-slate-500 border border-slate-200 dark:border-slate-800">
              No data available for this period.
            </div>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.8fr_1fr]">
          {/* Tickets Section */}
          <div className="space-y-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-8 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Active Ticket Queue</h2>
                <p className="text-sm text-slate-500 mt-1">Manage and resolve open customer issues.</p>
              </div>
              <button className="text-sm font-bold text-primary hover:underline">View all</button>
            </div>

            <div className="space-y-4">
              {tickets.isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse"></div>
                  ))}
                </div>
              ) : tickets.error ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
                  <p className="text-amber-800 text-sm font-medium">Failed to load live tickets</p>
                </div>
              ) : tickets.data?.tickets && tickets.data.tickets.length > 0 ? (
                tickets.data.tickets.map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                  <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-medium">Clear skies! No open tickets found.</p>
                </div>
              )}
            </div>
          </div>

          {/* AI Workflow Panel */}
          <div className="space-y-6">
             <div className="p-8 rounded-[2.5rem] bg-primary text-white shadow-xl shadow-primary/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-24 -mt-24 transition-transform group-hover:scale-125"></div>
                <div className="relative z-10 space-y-4">
                  <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold">Try Agent Workflow</h3>
                  <p className="text-primary-foreground/80 text-sm leading-relaxed">
                    Our killer feature: One-click ticket summarization, similar ticket search, and AI reply generation.
                  </p>
                  <Link href="/ai">
                    <button className="w-full py-3 mt-4 rounded-xl bg-white text-primary font-bold text-sm hover:bg-slate-50 transition-colors">
                      Access AI Tools
                    </button>
                  </Link>
                </div>
             </div>

             <div className="p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
                <h3 className="font-bold mb-6">Recent AI Actions</h3>
                <div className="space-y-6">
                  {[
                    "Categorized #TK-842 to 'Billing'",
                    "Suggested reply for #TK-791",
                    "Merged 2 similar tickets",
                    "Priority set to 'High' for #TK-902"
                  ].map((action, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="h-2 w-2 rounded-full bg-primary mt-2"></div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{action}</p>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}
