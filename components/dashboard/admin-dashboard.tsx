'use client';

import { useEffect, useState } from 'react';
import { useTicketsQuery } from '@/hooks/useTickets';
import { useAnalyticsQuery } from '@/hooks/useAnalytics';
import { TicketCard } from '@/components/tickets/ticket-card';
import { Card } from '@/components/ui/card';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  Ticket, CheckCircle2, Clock, AlertTriangle, RefreshCw
} from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

export function AdminDashboard() {
  const [error, setError] = useState<string | null>(null);
console.log("Mohammad Ibrahim Let's start")
  const analyticsQuery = useAnalyticsQuery();
  const ticketsQuery = useTicketsQuery({ limit: 10 });

  useEffect(() => {
    if (analyticsQuery.error) {
      setError("Failed to load analytics");
      console.error(analyticsQuery.error);
    }
  }, [analyticsQuery.error]);

  const isLoading = analyticsQuery.isLoading || ticketsQuery.isLoading;
  const stats = analyticsQuery.data;

  console.log("✅ FINAL STATS:", stats);

  const categoryData =
    stats?.topCategories?.map((c: any) => ({
      name: c.category,
      value: c.count,
    })) || [];

  if (isLoading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4">
        <RefreshCw className="h-10 w-10 animate-spin text-indigo-600" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4">

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>
      )}

      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-5">
          <p>Total Tickets</p>
          <h2 className="text-3xl font-bold">{stats?.totalTickets}</h2>
        </Card>

        <Card className="p-5">
          <p>Open Tickets</p>
          <h2 className="text-3xl font-bold">{stats?.openTickets}</h2>
        </Card>

        <Card className="p-5">
          <p>Avg Resolution</p>
          <h2 className="text-3xl font-bold">{stats?.avgResolutionTime}</h2>
        </Card>

        <Card className="p-5">
          <p>High Priority</p>
          <h2 className="text-3xl font-bold">{stats?.highPriority}</h2>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="mb-4 font-bold">Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={categoryData} dataKey="value">
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 font-bold">Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                { name: 'Total', value: stats?.totalTickets },
                { name: 'Open', value: stats?.openTickets },
                { name: 'High', value: stats?.highPriority },
              ]}
            >
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Tickets */}
      <Card className="p-6">
        <div className="flex justify-between mb-4">
          <h3 className="font-bold">Recent Tickets</h3>
          <button onClick={() => ticketsQuery.refetch()}>
            <RefreshCw />
          </button>
        </div>

        {ticketsQuery.data?.tickets?.length ? (
          ticketsQuery.data.tickets.map((t: any) => (
            <TicketCard key={t.id} ticket={t} />
          ))
        ) : (
          <p>No tickets</p>
        )}
      </Card>
    </div>
  );
}