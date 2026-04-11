'use client';

import Link from 'next/link';
import { Home, Search, Settings, Sparkles, Ticket, LogOut, ChevronRight, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/hooks/useAuthStore';
import { useRouter } from 'next/navigation';
import { deleteCookie } from '@/lib/cookies';

const navItems = [
  { label: 'Overview', href: '/dashboard', icon: Home },
  { label: 'Tickets', href: '/tickets', icon: Ticket },
  { label: 'AI Search', href: '/search', icon: Search },
  { label: 'AI Copilot', href: '/ai', icon: Sparkles },
  { label: 'Profile', href: '/auth/me', icon: User },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar({ activePath }: { activePath: string }) {
  const { logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    deleteCookie('itmagnet_access_token');
    router.push('/auth/login');
  };

  return (
    <aside className="hidden lg:flex flex-col w-72 h-[calc(100vh-4rem)] sticky top-24 gap-8">
      {/* Platform Info */}
      <div className="p-6 rounded-[2rem] bg-slate-900 text-white relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20">
            <Sparkles className="h-3 w-3 text-primary-foreground" />
            <span className="text-[10px] font-bold uppercase tracking-wider">AI Powered</span>
          </div>
          <div>
            <h3 className="text-xl font-bold">ITMAGNET Pro</h3>
            <p className="text-sm text-slate-400 mt-1">Intelligent support cockpit</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePath === item.href || (item.href !== '/dashboard' && activePath.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center justify-between rounded-2xl px-5 py-4 text-sm font-semibold transition-all duration-200',
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/20 translate-x-1'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white',
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn("h-5 w-5", isActive ? "text-white" : "group-hover:text-primary")} />
                {item.label}
              </div>
              {isActive && <ChevronRight className="h-4 w-4" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 rounded-2xl px-5 py-4 text-sm font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all border border-transparent hover:border-rose-200 dark:hover:border-rose-900/50"
      >
        <LogOut className="h-5 w-5" />
        Sign Out
      </button>

      {/* System Status */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">AI Engine Online</span>
        </div>
        <p className="text-[10px] text-slate-500 uppercase tracking-tight">Version 2.4.0-release</p>
      </div>
    </aside>
  );
}
