'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/layouts/dashboard-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ticketApi, aiApi } from '@/lib/api';
import { Loader2, Sparkles, Send, AlertCircle, Brain, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AiClassification } from '@/types';

export default function NewTicketPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('bug');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiPreview, setAiPreview] = useState<AiClassification | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const router = useRouter();

  // Debounced AI classification
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (title.length > 5 && description.length > 20) {
        setIsAiLoading(true);
        try {
          const res = await aiApi.classify({ title, text: description });
          setAiPreview(res.classification ?? null);
        } catch (err) {
          console.error('AI preview failed');
        } finally {
          setIsAiLoading(false);
        }
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [title, description]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    const validationErrors: string[] = [];
    if (!title?.trim()) {
      validationErrors.push('Title is required');
    } else if (title.trim().length < 5) {
      validationErrors.push('Title must be at least 5 characters');
    }
    
    if (!description?.trim()) {
      validationErrors.push('Description is required');
    } else if (description.trim().length < 10) {
      validationErrors.push('Description must be at least 10 characters');
    }
    
    if (validationErrors.length > 0) {
      setError(validationErrors.join('. '));
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        priority: (priority as 'low' | 'medium' | 'high' | 'critical') || 'medium',
        category: category || 'bug'
      };
      
      await ticketApi.create(payload);
      router.push('/tickets');
      router.refresh();
    } catch (err: any) {
      // Parse backend validation errors
      let errorMsg = 'Failed to create ticket';
      
      // Check if response contains validation details
      if (err?.data?.details && Array.isArray(err.data.details)) {
        const details = err.data.details.map((d: any) => d.message).join('. ');
        errorMsg = details || err?.data?.message || errorMsg;
      } else if (err?.data?.message) {
        errorMsg = err.data.message;
      } else if (err?.message) {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
      console.error('Ticket creation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardShell activePath="/tickets" title="Create New Ticket">
      <div className="max-w-4xl">
        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 p-8 lg:p-12">
          <div className="flex items-center gap-4 mb-8 p-4 bg-primary/5 border border-primary/20">
            <div className="h-12 w-12 bg-primary/10 text-primary flex items-center justify-center">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">AI-Powered Ticket Creation</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">Your ticket will be automatically analyzed and classified.</p>
            </div>
          </div>

          <form onSubmit={handleCreate} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Priority</label>
                <select 
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full h-12 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 px-4 font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🔴 High</option>
                  <option value="critical">⚠️ Critical</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Category</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-12 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 px-4 font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  <option value="bug">🐛 Bug</option>
                  <option value="feature">✨ Feature Request</option>
                  <option value="documentation">📚 Documentation</option>
                  <option value="performance">⚡ Performance</option>
                  <option value="security">🔒 Security</option>
                  <option value="other">📋 Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Ticket Title</label>
                <span className={cn(
                  "text-xs font-semibold",
                  title.length < 5 && title.length > 0 ? "text-rose-600 dark:text-rose-400" : "text-green-600 dark:text-green-400"
                )}>
                  {title.length}/5 min
                </span>
              </div>
              <Input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief summary of the issue..."
                className={cn(
                  "h-14 bg-white dark:bg-slate-950 border px-6 text-lg focus:ring-2",
                  title.length < 5 && title.length > 0
                    ? "border-rose-300 dark:border-rose-700 focus:ring-rose-200"
                    : "border-slate-300 dark:border-slate-700 focus:ring-primary/20"
                )}
                required
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Detailed Description</label>
                <span className={cn(
                  "text-xs font-semibold",
                  description.length < 10 ? "text-rose-600 dark:text-rose-400" : "text-green-600 dark:text-green-400"
                )}>
                  {description.length}/10 min
                </span>
              </div>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the problem in detail so our AI and agents can help you better..."
                className={cn(
                  "w-full h-12 min-h-[200px] bg-white dark:bg-slate-950 border p-6 text-lg focus:outline-none focus:ring-2 transition-all",
                  description.length < 10 
                    ? "border-rose-300 dark:border-rose-700 focus:ring-rose-200" 
                    : "border-slate-300 dark:border-slate-700 focus:ring-primary/20"
                )}
                required
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {description.length < 10 
                  ? `Need ${10 - description.length} more characters` 
                  : 'Description looks good!'}
              </p>
            </div>

            {/* AI Preview Section */}
            {(isAiLoading || aiPreview) && (
              <div className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50/50 dark:from-indigo-900/20 dark:to-blue-900/10 border border-indigo-200 dark:border-indigo-700 rounded-xl shadow-md flex flex-col md:flex-row gap-8">
                 <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-widest">
                       <Brain className="h-4 w-4" />
                       AI Live Analysis
                    </div>
                    {isAiLoading ? (
                      <div className="flex items-center gap-2 text-sm text-slate-500 font-bold">
                         <Loader2 className="h-4 w-4 animate-spin" />
                         Analyzing ticket...
                      </div>
                    ) : (
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                         This appears to be a <span className="text-indigo-700 dark:text-indigo-300 font-bold">{aiPreview?.category}</span> issue.
                      </p>
                    )}
                 </div>

                 <div className="flex items-center gap-6">
                    <div className="text-center">
                       <div className="text-[10px] uppercase font-bold text-slate-500 mb-2">Priority</div>
                       <Badge className={cn(
                          "transition-all uppercase py-1.5 px-3 shadow-md",
                          aiPreview?.priority === 'high' ? "bg-rose-500" : aiPreview?.priority === 'critical' ? "bg-red-600" : "bg-indigo-500",
                          isAiLoading && "opacity-50"
                       )}>
                          {isAiLoading ? '...' : aiPreview?.priority || 'normal'}
                       </Badge>
                    </div>
                    <div className="text-center">
                       <div className="text-[10px] uppercase font-bold text-slate-500 mb-2">Confidence</div>
                       <div className="flex items-center gap-1 font-black text-indigo-700 dark:text-indigo-300">
                          <Target className="h-4 w-4" /> 
                          {isAiLoading ? '--' : '95%'}
                       </div>
                    </div>
                 </div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-xl shadow-md">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-rose-900 dark:text-rose-200 mb-2">Validation Error</p>
                    <ul className="space-y-1">
                      {error.split('. ').map((msg, idx) => (
                        msg.trim() && (
                          <li key={idx} className="text-sm text-rose-700 dark:text-rose-300 flex items-center gap-2">
                            <span className="h-1.5 w-1.5 bg-rose-500 rounded-full flex-shrink-0" />
                            {msg.trim()}
                          </li>
                        )
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-4 pt-4">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => router.back()}
                className="px-8 h-12 font-bold rounded-lg"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || !title?.trim() || !description?.trim()}
                className="px-10 h-14 text-lg font-bold flex items-center gap-2 rounded-lg shadow-lg hover:shadow-xl transition-all"
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
        
        <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl shadow-md">
           <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider">💡 Pro Tips</h4>
           <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2 list-disc pl-5">
             <li>Be specific about symptoms and when they started</li>
             <li>Include any error codes or messages you received</li>
             <li>AI analysis appears automatically - it helps us prioritize!</li>
           </ul>
        </div>
      </div>
    </DashboardShell>
  );
}
