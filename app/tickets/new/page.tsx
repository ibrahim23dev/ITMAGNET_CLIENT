'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/layouts/dashboard-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ticketApi } from '@/lib/api';
import { Loader2, Sparkles, Send, AlertCircle } from 'lucide-react';

export default function NewTicketPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    setIsLoading(true);
    setError('');

    try {
      await ticketApi.create({ title, description });
      router.push('/tickets');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to create ticket. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardShell activePath="/tickets" title="Create New Ticket">
      <div className="max-w-3xl">
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 lg:p-12 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">AI assistance is enabled</h2>
              <p className="text-sm text-slate-500">Your ticket will be automatically categorized and prioritized.</p>
            </div>
          </div>

          <form onSubmit={handleCreate} className="space-y-8">
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Ticket Title</label>
              <Input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief summary of the issue..."
                className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 px-6 text-lg focus:ring-primary/20"
                required
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Detailed Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the problem in detail so our AI and agents can help you better..."
                className="w-full min-h-[200px] rounded-[2rem] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6 text-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                required
              />
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center gap-3">
                <AlertCircle className="h-5 w-5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-end gap-4">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => router.back()}
                className="rounded-xl px-8 h-12 font-bold"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || !title || !description}
                className="rounded-xl px-10 h-14 text-lg font-bold shadow-xl shadow-primary/20 flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create Ticket
                    <Send className="h-5 w-5 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
        
        <div className="mt-8 p-6 rounded-2xl bg-slate-100 dark:bg-slate-900/50 border border-dashed border-slate-300 dark:border-slate-700">
           <h4 className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wider">Quick Tips</h4>
           <ul className="text-sm text-slate-500 space-y-2 list-disc pl-5">
             <li>Be specific about the symptoms and when they started.</li>
             <li>Include any error codes or messages you received.</li>
             <li>AI classification usually takes 2-5 seconds after submission.</li>
           </ul>
        </div>
      </div>
    </DashboardShell>
  );
}
