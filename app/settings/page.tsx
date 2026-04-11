'use client';

import { DashboardShell } from '@/components/layouts/dashboard-shell';
import { Button } from '@/components/ui/button';
import { Settings, Shield, User, Globe, Bell, Lock, Sparkles, ChevronRight } from 'lucide-react';

export default function SettingsPage() {
  return (
    <DashboardShell activePath="/settings" title="System Settings">
      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-8">
           {/* Setting Group: Account */}
           <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                 <User className="h-5 w-5 text-primary" />
                 Account Infrastructure
              </h3>
              <div className="space-y-4">
                 {[
                   { icon: <User className="h-4 w-4" />, title: "Personal Information", desc: "Update your name, email, and avatar." },
                   { icon: <Globe className="h-4 w-4" />, title: "Timezone & Locale", desc: "Manage how dates and times are displayed." },
                   { icon: <Bell className="h-4 w-4" />, title: "Notification Sync", desc: "Configure how you receive ticket alerts." },
                 ].map((item, i) => (
                    <div key={i} className="group flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                       <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors">
                             {item.icon}
                          </div>
                          <div>
                             <h4 className="text-sm font-bold">{item.title}</h4>
                             <p className="text-xs text-slate-500">{item.desc}</p>
                          </div>
                       </div>
                       <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary transition-all" />
                    </div>
                 ))}
              </div>
           </div>

           {/* Setting Group: AI Controls */}
           <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                 <Sparkles className="h-5 w-5 text-primary" />
                 AI Engine Configuration
              </h3>
              <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 mb-6">
                 <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-primary">RAG Auto-Indexing</span>
                    <div className="h-5 w-10 rounded-full bg-primary relative px-1 flex items-center">
                       <div className="h-3 w-3 bg-white rounded-full absolute right-1"></div>
                    </div>
                 </div>
                 <p className="text-sm text-slate-600 dark:text-slate-400">
                    When enabled, all resolved tickets are automatically vectorized and indexed for future semantic searches.
                 </p>
              </div>
              <div className="space-y-4">
                 {[
                   { title: "Model Preference", value: "GPT-4o (Default)" },
                   { title: "Reply Confidence Threshold", value: "85%" },
                   { title: "Summary Level", value: "Detailed" }
                 ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 last:border-0">
                       <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{item.title}</span>
                       <span className="text-sm font-bold text-primary">{item.value}</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="space-y-8">
           <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white shadow-xl shadow-slate-900/20">
              <Shield className="h-8 w-8 text-primary mb-6" />
              <h3 className="text-xl font-bold mb-2">Security & Audit</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                 Review all API access logs and manage role-based permissions for your entire support organization.
              </p>
              <Button className="w-full rounded-xl h-12 bg-white text-slate-950 font-bold hover:bg-slate-100">
                 Access Logs
              </Button>
           </div>

           <div className="p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Subscription</h4>
              <div className="space-y-4 text-sm">
                 <div className="flex justify-between">
                    <span className="text-slate-500">Current Plan</span>
                    <span className="font-bold text-primary">Enterprise AI</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="text-slate-500">Active Agents</span>
                    <span className="font-bold">12 / 50</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="text-slate-500">AI Tokens Used</span>
                    <span className="font-bold">2.4M / 10M</span>
                 </div>
              </div>
              <Button variant="outline" className="w-full mt-8 rounded-xl h-12 border-slate-200 dark:border-slate-800 font-bold">
                 Manage Plan
              </Button>
           </div>
        </div>
      </div>
    </DashboardShell>
  );
}
