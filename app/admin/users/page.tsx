'use client';

import { useUsersQuery, useToggleUserStatus } from '@/hooks/useUsers';
import type { User } from '@/types';
import { DashboardShell } from '@/components/layouts/dashboard-shell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { User as UserIcon, Shield, Trash2, Edit3, Loader2, MoreVertical, Search, Power } from 'lucide-react';
import { useState } from 'react';

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const users = useUsersQuery();
  const toggleStatus = useToggleUserStatus();

  const filteredUsers = users.data?.filter((u: User) => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardShell activePath="/admin/users" title="Infrastructure Governance: User Control">
      <div className="space-y-8">
        {/* Search & Actions */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
           <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                placeholder="Search by identity or clearance..."
              />
           </div>
           <Button className="h-12 px-8 font-bold">Register New Agent</Button>
        </div>

        {/* User Table */}
        <div className="bg-white border border-slate-200 overflow-hidden">
           <table className="w-full text-left">
              <thead>
                 <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Identity</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Role Clearance</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">System Status</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 text-right">Protocol</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {users.isLoading ? (
                    <tr>
                       <td colSpan={4} className="py-20 text-center">
                          <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mx-auto mb-4" />
                          <p className="text-sm font-bold text-slate-400">Decrypting user records...</p>
                       </td>
                    </tr>
                 ) : filteredUsers?.map((user: User) => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                       <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                             <div className="h-10 w-10 bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                                {user.name[0]}
                             </div>
                             <div>
                                <p className="text-sm font-bold text-slate-800">{user.name}</p>
                                <p className="text-xs text-slate-500">{user.email}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                             <Shield className={cn(
                                "h-4 w-4",
                                user.role === 'admin' ? "text-rose-500" : 
                                user.role === 'agent' ? "text-amber-500" : "text-blue-500"
                             )} />
                             <span className="text-xs font-bold uppercase tracking-tight">{user.role}</span>
                          </div>
                       </td>
                       <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                             <div className="h-1.5 w-1.5 bg-emerald-500"></div>
                             <span className="text-xs text-emerald-600 font-bold">ACTIVE</span>
                          </div>
                       </td>
                       <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                             <button className="p-2 hover:bg-slate-100 text-slate-400 hover:text-indigo-600">
                                <Edit3 className="h-4 w-4" />
                             </button>
                             <button 
                                onClick={() => toggleStatus.mutate(user.id)}
                                className={cn(
                                   "p-2 hover:bg-slate-100",
                                   toggleStatus.isPending && "animate-pulse"
                                )}
                                title="Toggle Protocol Status"
                             >
                                <Power className={cn("h-4 w-4", user.role === 'admin' ? "text-slate-300" : "text-emerald-500")} />
                             </button>
                             <button className="p-2 hover:bg-slate-100 text-slate-400">
                                <MoreVertical className="h-4 w-4" />
                             </button>
                          </div>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </div>
    </DashboardShell>
  );
}
