'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/layouts/dashboard-shell';
import { useAiSearch } from '@/hooks/useAi';
import { Button } from '@/components/ui/button';
import { Search, Sparkles, Loader2, ArrowRight, Database, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const searchMutation = useAiSearch();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    searchMutation.mutate({ query: query.trim() });
  };

  return (
    <DashboardShell activePath="/search" title="Semantic Knowledge Search">
      <div className="space-y-8">
        {/* Search Header */}
        <div className="p-8 lg:p-12 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 relative overflow-hidden group rounded-2xl shadow-lg">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 -mr-48 -mt-48 transition-transform group-hover:scale-110 rounded-full"></div>
          
          <div className="relative z-10 max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/15 border border-primary/30 rounded-lg text-primary font-bold text-[11px] uppercase tracking-widest">
              <Sparkles className="h-4 w-4" />
              <span>RAG-Powered Engine</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-800 dark:text-white leading-tight">
              Find answers across <br/> your entire knowledge base
            </h2>
            <form onSubmit={handleSearch} className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ex: 'payment failed on checkout' or 'how to reset password'"
                className="w-full h-16 pl-14 pr-32 bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all text-lg rounded-xl shadow-md"
              />
              <button 
                type="submit" 
                disabled={searchMutation.isPending || !query.trim()}
                className="absolute right-2 top-2 bottom-2 px-6 font-bold bg-primary hover:bg-primary/90 text-white rounded-lg disabled:opacity-50 transition-all shadow-lg hover:shadow-xl"
              >
                {searchMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Search'}
              </button>
            </form>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
           {searchMutation.isPending ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-4">
                 <div className="h-12 w-12 border-4 border-slate-200 dark:border-slate-700 border-t-primary animate-spin rounded-full"></div>
                 <p className="text-slate-500 font-bold animate-pulse">Scanning vector database...</p>
              </div>
           ) : searchMutation.data?.length ? (
              <div className="grid gap-6">
                 <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-400 pl-4 flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Matched Results ({searchMutation.data?.length || 0})
                 </h3>
                 <div className="grid gap-4">
                   {searchMutation.data?.map((result: any, i: number) => (
                      <div key={i} className="group p-6 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-primary/60 transition-all duration-300 rounded-xl shadow-md hover:shadow-xl hover:scale-102">
                         <div className="flex justify-between items-start gap-4 mb-4">
                            <div className="flex-1">
                               <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-widest mb-2 bg-primary/10 w-fit px-2 py-1 rounded">
                                  <Sparkles className="h-3 w-3" />
                                  {Math.round((result.score || 0.95) * 100)}% Relevant
                               </div>
                               <h4 className="text-lg font-bold dark:text-white group-hover:text-primary transition-colors">{result.title || 'Untitled'}</h4>
                            </div>
                            <button className="p-2 hover:bg-primary hover:text-white rounded-lg transition-all shadow-md">
                               <ArrowRight className="h-5 w-5" />
                            </button>
                         </div>
                         <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                            {result.snippet || result.description || 'No additional details available.'}
                         </p>
                         <div className="flex gap-3 flex-wrap">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-3 py-2 rounded-lg">
                               <MessageSquare className="h-3.5 w-3.5" />
                               {result.commentsCount || 12} Comments
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-3 py-2 rounded-lg">
                               <Database className="h-3.5 w-3.5" />
                               #{(result.id || 'unknown').slice(-4).toUpperCase()}
                            </div>
                         </div>
                      </div>
                   ))}
                 </div>
              </div>
           ) : searchMutation.isSuccess ? (
              <div className="py-24 text-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
                 <div className="h-16 w-16 bg-slate-100 dark:bg-slate-900 flex items-center justify-center mx-auto mb-4 rounded-full">
                    <Search className="h-8 w-8 text-slate-400" />
                 </div>
                 <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">No matching cases found</h3>
                 <p className="text-slate-500 dark:text-slate-400 mt-2">Try different keywords or broaden your search terms.</p>
              </div>
           ) : (
             <div className="py-24 text-center">
                <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">🔍 Semantic search helps you find solutions based on your questions!</p>
             </div>
           )}
        </div>
      </div>
    </DashboardShell>
  );
}
