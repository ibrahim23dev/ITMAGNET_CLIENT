'use client';

import { DashboardShell } from '@/components/layouts/dashboard-shell';
import { useAuthStore } from '@/hooks/useAuthStore';
import { User, Mail, Shield, Calendar, Award, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  const { user } = useAuthStore();

  const stats = [
    { label: 'Tickets Resolved', value: '124', icon: <Award className="h-5 w-5 text-emerald-500" /> },
    { label: 'Avg. Response', value: '12m', icon: <Clock className="h-5 w-5 text-blue-500" /> },
    { label: 'AI Efficiency', value: '94%', icon: <Zap className="h-5 w-5 text-amber-500" /> },
  ];

  return (
    <DashboardShell activePath="/auth/me" title="My Professional Profile">
      <div className="space-y-8">
        {/* Header Profile Section */}
        <div className="bg-white dark:bg-slate-800 p-8 lg:p-12 border border-slate-200 dark:border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 -mr-32 -mt-32 transition-transform"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
            <div className="h-32 w-32 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center overflow-hidden">
               <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200" alt="Profile" className="w-full h-full object-cover" />
            </div>
            
            <div className="flex-1 text-center md:text-left space-y-4">
              <div className="space-y-1">
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">Support Lead</h2>
                <p className="text-slate-500 font-medium">Senior Agent • Tier 2 Support</p>
              </div>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm font-medium">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 border border-slate-200 dark:border-slate-800">
                  <Mail className="h-4 w-4" />
                  agent.lead@itmagnet.com
                </div>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 border border-slate-200 dark:border-slate-800">
                  <Shield className="h-4 w-4 text-primary" />
                  Lead Role
                </div>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 border border-slate-200 dark:border-slate-800">
                  <Calendar className="h-4 w-4" />
                  Joined April 2024
                </div>
              </div>

              <div className="pt-2">
                <Button variant="outline" className="font-bold border-slate-200 dark:border-slate-700 px-8 h-12">Edit Profile Details</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-slate-600">
                  {stat.icon}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Sections */}
        <div className="grid gap-8 lg:grid-cols-2">
           <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 p-8">
              <h3 className="text-lg font-bold mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">Professional Competencies</h3>
              <div className="space-y-6">
                 {[
                   { skill: "Crisis Management", level: 95 },
                   { skill: "AI Workflow Optimization", level: 88 },
                   { skill: "Technical Troubleshooting", level: 92 },
                   { skill: "Customer Relations", level: 98 }
                 ].map((skill, i) => (
                    <div key={i} className="space-y-2">
                       <div className="flex justify-between text-xs font-bold uppercase tracking-tight">
                          <span>{skill.skill}</span>
                          <span className="text-primary">{skill.level}%</span>
                       </div>
                       <div className="h-2 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${skill.level}%` }}></div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 p-8">
              <h3 className="text-lg font-bold mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">Recent System Activity</h3>
              <div className="space-y-6">
                 {[
                   "Resolved ticket #TK-8422 (Billing Error)",
                   "Updated AI Confidence threshold to 85%",
                   "Generated monthly performance report",
                   "Mentored Agent #492 on Tier 2 protocol"
                 ].map((activity, i) => (
                    <div key={i} className="flex gap-4 items-start">
                       <div className="h-2 w-2 bg-primary mt-2"></div>
                       <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{activity}</p>
                    </div>
                 ))}
              </div>
              <Button variant="ghost" className="w-full mt-8 border border-slate-100 dark:border-slate-800 text-xs font-bold uppercase tracking-widest">
                 View Full Activity Audit
              </Button>
           </div>
        </div>
      </div>
    </DashboardShell>
  );
}
