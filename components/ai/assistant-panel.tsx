'use client';

import { useState } from 'react';
import { AlertTriangle, ArrowRight, MessageSquare, Sparkles, Loader2, Wand2, ShieldCheck, Search, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAiReply, useAiSummary, useAiAgentWorkflow } from '@/hooks/useAi';
import { cn } from '@/lib/utils';

interface AiPanelProps {
  ticketId: string;
}

export function AssistantPanel({ ticketId }: AiPanelProps) {
  const [tone, setTone] = useState('professional');
  const [includeRag, setIncludeRag] = useState(true);
  
  const summaryQuery = useAiSummary(ticketId);
  const replyMutation = useAiReply();
  const workflowMutation = useAiAgentWorkflow();

  const handleReply = () => {
    replyMutation.mutate({ ticketId, tone, includeRag });
  };

  const handleWorkflow = () => {
    workflowMutation.mutate({ ticketId });
  };

  const replyData = replyMutation.data?.data;
  const workflowData = workflowMutation.data?.data;

  return (
    <div className="space-y-6">
      <div className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
          <Sparkles className="h-12 w-12 text-primary" />
        </div>
        
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <BotIcon />
            </div>
            <div>
              <h3 className="text-xl font-bold">AI Agent Copilot</h3>
              <p className="text-sm text-slate-500">Intelligent response & workflow automation</p>
            </div>
          </div>

          <div className="grid gap-6">
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={handleWorkflow} 
                disabled={workflowMutation.isPending}
                className="rounded-xl h-12 px-6 bg-primary shadow-lg shadow-primary/20 flex items-center gap-2"
              >
                {workflowMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />}
                Run Full Workflow
              </Button>
              <Button 
                variant="outline" 
                onClick={() => summaryQuery.refetch()}
                disabled={summaryQuery.isFetching}
                className="rounded-xl h-12 border-slate-200 dark:border-slate-800"
              >
                {summaryQuery.isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4 mr-2" />}
                Quick Summary
              </Button>
            </div>

            {/* Response Section */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold uppercase tracking-wider text-slate-400">Response Tuning</span>
                <div className="flex gap-2">
                  {['Professional', 'Friendly', 'Concise'].map(t => (
                    <button 
                      key={t}
                      onClick={() => setTone(t.toLowerCase())}
                      className={cn(
                        "text-[10px] font-bold px-2 py-1 rounded-md border transition-all",
                        tone === t.toLowerCase() 
                          ? "bg-primary text-white border-primary" 
                          : "bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              
              <Button 
                onClick={handleReply} 
                className="w-full h-12 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 shadow-md"
                disabled={replyMutation.isPending}
              >
                {replyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4 mr-2" />}
                Generate Reply Suggestion
              </Button>
            </div>

            {/* Results Display */}
            {(replyMutation.data || workflowMutation.data) && (
              <div className="animate-in space-y-4">
                {replyMutation.data && (
                  <div className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                        <CheckCircleIcon />
                        <span className="text-sm font-bold">Suggested Response</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-400">
                        {Math.round((replyData?.confidence ?? 0.9)*100)}% Confidence
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
                      "{replyData?.reply || 'Drafting a response based on context...'}"
                    </p>
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" className="rounded-lg h-9 bg-emerald-600 hover:bg-emerald-700">Copy to Editor</Button>
                      <Button size="sm" variant="ghost" className="rounded-lg h-9">Edit & Refine</Button>
                    </div>
                  </div>
                )}

                {workflowMutation.data && (
                   <div className="p-6 rounded-3xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 space-y-4">
                      <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                        <Activity className="h-4 w-4" />
                        <span className="text-sm font-bold">Full Workflow Insights</span>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="p-3 rounded-xl bg-white/50 dark:bg-slate-900/50 border border-blue-100 dark:border-blue-900">
                          <p className="text-[10px] font-bold text-blue-500 uppercase mb-1">AI Summary</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            {workflowData?.summary || 'Scanning ticket context and history...'}
                          </p>
                        </div>
                        
                        <div className="p-3 rounded-xl bg-white/50 dark:bg-slate-900/50 border border-blue-100 dark:border-blue-900">
                          <p className="text-[10px] font-bold text-blue-500 uppercase mb-1">Related Tickets Found</p>
                          <div className="space-y-2 mt-2">
                            {workflowData?.similarTickets?.length ? (
                              workflowData.similarTickets.map((st: any, i: number) => (
                                <div key={i} className="flex items-center gap-2 text-xs text-slate-500">
                                  <div className="h-1 w-1 rounded-full bg-blue-400"></div>
                                  <span className="underline cursor-pointer hover:text-primary">#{st.id} - {st.title}</span>
                                </div>
                              ))
                            ) : (
                              <p className="text-[10px] text-slate-400">No highly similar tickets found.</p>
                            )}
                          </div>
                        </div>
                      </div>
                   </div>
                )}
              </div>
            )}

            {/* Default Status/Loading */}
            {!replyMutation.data && !workflowMutation.data && !summaryQuery.data && (
              <div className="py-12 flex flex-col items-center justify-center text-center opacity-50">
                <Search className="h-8 w-8 text-slate-300 mb-4" />
                <p className="text-xs font-medium text-slate-400">Select an action above to activate <br/> AI reasoning capabilities.</p>
              </div>
            )}
            
            {summaryQuery.data && (
               <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-2 text-slate-500">
                    <Activity className="h-3 w-3" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Condensed Context</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic">
                    {summaryQuery.data.summary}
                  </p>
               </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 rounded-[2rem] border border-dashed border-slate-300 dark:border-slate-700 text-center">
         <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-white mb-3">
           <ShieldCheck className="h-5 w-5" />
         </div>
         <h4 className="text-sm font-bold mb-1">Quality Assurance</h4>
         <p className="text-xs text-slate-500">Always review AI suggestions before communicating with customers.</p>
      </div>
    </div>
  );
}

function BotIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
  );
}
