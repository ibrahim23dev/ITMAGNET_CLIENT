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
        <div className="p-8 lg:p-12 rounded-[3rem] bg-slate-900 border border-white/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -mr-48 -mt-48 transition-transform group-hover:scale-110"></div>
          
          <div className="relative z-10 max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-widest">RAG-Powered Engine</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight">
              Find answers across <br/> your entire knowledge base
            </h2>
            <form onSubmit={handleSearch} className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-500 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ex: 'payment failed on checkout' or 'how to reset password'"
                className="w-full h-16 pl-14 pr-32 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary/50 transition-all text-lg"
              />
              <Button 
                type="submit" 
                disabled={searchMutation.isPending || !query.trim()}
                className="absolute right-2 top-2 bottom-2 rounded-xl px-6 font-bold shadow-lg shadow-primary/20"
              >
                {searchMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Search AI'}
              </Button>
            </form>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
           {searchMutation.isPending ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-4">
                 <div className="h-12 w-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
                 <p className="text-slate-500 font-bold animate-pulse">Scanning vector database...</p>
              </div>
           ) : searchMutation.data?.data?.length ? (
              <div className="grid gap-6">
                 <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 pl-4 flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Matched Tickets ({searchMutation.data.data.length})
                 </h3>
                 <div className="grid gap-4">
                   {searchMutation.data.data.map((result: any, i: number) => (
                      <div key={i} className="group p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary/40 hover:shadow-xl transition-all duration-300">
                         <div className="flex justify-between items-start gap-4 mb-4">
                            <div>
                               <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-widest mb-1">
                                  <Sparkles className="h-3 w-3" />
                                  {Math.round((result.score || 0.95) * 100)}% Match Relevance
                               </div>
                               <h4 className="text-xl font-bold dark:text-white group-hover:text-primary transition-colors">{result.title}</h4>
                            </div>
                            <Button variant="ghost" className="rounded-xl group-hover:bg-primary group-hover:text-white transition-all">
                               <ArrowRight className="h-5 w-5" />
                            </Button>
                         </div>
                         <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                            {result.snippet || result.description || 'No snippet available for this record.'}
                         </p>
                         <div className="flex gap-4">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-lg">
                               <MessageSquare className="h-3.5 w-3.5" />
                               12 Comments
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-lg">
                               <Database className="h-3.5 w-3.5" />
                               TK-{result.id.slice(-4).toUpperCase()}
                            </div>
                         </div>
                      </div>
                   ))}
                 </div>
              </div>
           ) : searchMutation.isSuccess ? (
              <div className="py-24 text-center rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                 <div className="h-16 w-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-slate-300" />
                 </div>
                 <h3 className="text-xl font-bold">No similar cases found</h3>
                 <p className="text-slate-500 mt-2">Try broadening your search terms or check for typos.</p>
              </div>
           ) : (
             <div className="py-24 text-center">
                <p className="text-slate-400 font-medium">Use semantic search to find how similar issues were resolved in the past.</p>
             </div>
           )}
        </div>
      </div>
    </DashboardShell>
  );
}
