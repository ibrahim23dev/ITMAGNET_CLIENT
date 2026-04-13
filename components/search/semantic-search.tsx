'use client';

import { useState } from 'react';
import { AlertTriangle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAiSearch } from '@/hooks/useAi';

interface SearchResult {
  id: string;
  title: string;
  description?: string;
  snippet?: string;
  score?: number;
}

export function SemanticSearch() {
  const [query, setQuery] = useState('');
  const searchMutation = useAiSearch();

  const handleSearch = () => {
    if (query.trim()) {
      searchMutation.mutate({ query });
    }
  };

  // Safely extract search results
  const results = searchMutation.data as SearchResult[] | undefined;
  const hasResults = Array.isArray(results) && results.length > 0;

  return (
    <Card className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-brand-600">Smart Search</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">Search past tickets with AI context</h2>
        </div>
        <div className="flex w-full max-w-xl gap-3 sm:w-auto">
          <input
            placeholder="Search by issue, customer, or outcome"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && handleSearch()}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
          <Button onClick={handleSearch} disabled={!query.trim() || searchMutation.isPending}>
            {searchMutation.isPending ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-white" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            <span className="ml-2 hidden sm:inline">Search</span>
          </Button>
        </div>
      </div>

      {/* Error State */}
      {searchMutation.isError && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-5">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div className="text-sm text-red-700">
              <p className="font-semibold">Search failed</p>
              <p className="mt-1">{searchMutation.error?.message || 'Unable to search tickets'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Search Results */}
      {searchMutation.data && hasResults ? (
        <div className="space-y-4">
          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-900">Results</p>
            <p className="mt-3 text-sm text-slate-600">AI identifies tickets with similar language, context, and outcomes.</p>
          </div>
          <div className="space-y-3">
            {results.map((hit: SearchResult, index: number) => (
              <div key={`${hit.id}-${index}`} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{hit.title}</p>
                    <p className="mt-2 text-sm text-slate-600 line-clamp-2">{hit.snippet || hit.description || 'No description'}</p>
                  </div>
                  {hit.score && (
                    <div className="flex-shrink-0 text-right">
                      <p className="text-xs text-slate-500">Match</p>
                      <p className="font-semibold text-brand-600">{Math.round(hit.score * 100)}%</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : searchMutation.data && !hasResults ? (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center">
          <p className="text-sm text-slate-600">No matching tickets found. Try a different search query.</p>
        </div>
      ) : null}
    </Card>
  );
}
