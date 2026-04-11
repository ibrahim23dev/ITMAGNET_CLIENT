'use client';

import { ReactNode } from 'react';
import { Sidebar } from '@/components/navigation/sidebar';
import { Bell, UserCircle2, Ticket, Search, Settings, Menu, X, Sparkles } from 'lucide-react';
import { Footer } from './footer';
import { useState } from 'react';
import Link from 'next/link';

export function DashboardShell({ activePath, children, title = "Dashboard" }: { activePath: string; children: ReactNode; title?: string }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 h-16 flex items-center">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-4">
             <Link href="/" className="flex items-center gap-2 group lg:hidden">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
                <Ticket className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold tracking-tight">ITMAGNET</span>
            </Link>
            <div className="hidden lg:flex items-center gap-2">
               <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Ticket className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold tracking-tight">ITMAGNET</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
               <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
               <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">System Normal</span>
            </div>
            
            <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors relative">
              <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500 border-2 border-white dark:border-slate-950"></span>
            </button>

            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2 hidden sm:block"></div>

            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold leading-none">Support Lead</p>
                <p className="text-xs text-slate-500 mt-1">Agent Tier 2</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden">
                <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100" alt="Avatar" />
              </div>
            </div>

            <button 
              className="lg:hidden p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      <div className="container flex-1 pt-8 pb-16">
        <div className="flex flex-col lg:flex-row gap-8">
          <Sidebar activePath={activePath} />
          
          <main className="flex-1 min-w-0 space-y-8 animate-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {title}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  Everything looks good today. You have 4 urgent tickets.
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-sm font-bold">AI Assistant Active</span>
                </div>
              </div>
            </div>

            <div className="content">
              {children}
            </div>
          </main>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
