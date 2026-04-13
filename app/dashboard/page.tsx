'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Role } from '@/types';
import { useAuthStore } from '@/hooks/useAuthStore';
import { useCurrentUser, useAutoRefreshToken } from '@/hooks/useAuthApi';
import { DashboardShell } from '@/components/layouts/dashboard-shell';
import { AdminDashboard } from '@/components/dashboard/admin-dashboard';
import { AgentDashboard } from '@/components/dashboard/agent-dashboard';
import { CustomerDashboard } from '@/components/dashboard/customer-dashboard';
import { Loader2, AlertTriangle } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const authStore = useAuthStore();
  const { data: currentUser, isLoading: isLoadingUser, error: userError } = useCurrentUser();
  const { user } = useAuthStore();
  useAutoRefreshToken();

  useEffect(() => {
    if (!authStore.accessToken && !isLoadingUser) {
      router.push('/auth/login');
    }
  }, [authStore.accessToken, isLoadingUser, router]);

  useEffect(() => {
    if (currentUser) {
      const existingRole = authStore.user?.role;
      const newRole = (currentUser.role as Role) || existingRole;
      authStore.setUser({
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        role: newRole,
      });
    }
  }, [currentUser, authStore]);

  if (userError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <h1 className="text-xl font-bold text-slate-900">Session Error</h1>
          </div>
          <p className="text-slate-600 mb-6">Failed to load your session. Please log in again.</p>
          <button
            onClick={() => {
              authStore.logout();
              router.push('/auth/login');
            }}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!authStore.accessToken || isLoadingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
          <p className="text-slate-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

 
  const role = user?.role// For testing purposes, you can hardcode a role here

  console.log('User data:', { currentUser, authStoreUser: authStore.user, role: role });

  const renderDashboard = () => {
    if (role === 'admin') return <AdminDashboard />;
    if (role === 'agent') return <AgentDashboard />;
    if (role === 'customer') return <CustomerDashboard />;

    return <div className="p-8 text-red-500">Unknown role: {role}</div>;
  };

  const dashboardTitle = `${(role || 'USER').toUpperCase()} COMMAND CENTER`;

  return (
    <DashboardShell activePath="/dashboard" title={dashboardTitle}>
      <section className="space-y-8 p-6">

        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-8 text-white">
          <p className="text-sm opacity-90">Welcome back,</p>
          <h1 className="text-4xl font-bold mt-1">
            {user?.name || 'Valued User'}
          </h1>
          <p className="text-sm opacity-75 mt-2">
            {user?.email}
          </p>
        </div>

        {renderDashboard()}
      </section>
    </DashboardShell>
  );
}


// import React from 'react'
// import { AdminDashboard } from '@/components/dashboard/admin-dashboard'
// function page() {
//   return (
//     <div>
//       <AdminDashboard />
//     </div>
//   )
// }

// export default page