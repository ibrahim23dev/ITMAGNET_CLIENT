'use client';

import { DashboardShell } from '@/components/layouts/dashboard-shell';
import { AssistantPanel } from '@/components/ai/assistant-panel';
import { Sparkles, Zap, Brain, MessageSquare, Shield, Activity } from 'lucide-react';

export default function AiPage() {
  return (
    <DashboardShell activePath="/ai" title="AI Copilot Lab">
      <section className="space-y-8 pb-20">
        {/* AI Hero Banner */}
        <div className="relative rounded-[3rem] bg-gradient-to-br from-primary to-purple-700 p-8 lg:p-16 text-white overflow-hidden">
           <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
           <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-center">
              <div className="space-y-6 flex-1">
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/20">
                   <Sparkles className="h-3.5 w-3.5" />
                   <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Experimental AI Lab</span>
                 </div>
                 <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                    Augment your human <br/> support with machine <br/> intelligence.
                 </h2>
                 <p className="text-primary-foreground/80 text-lg leading-relaxed max-w-xl">
                    Interact with our deep reasoning engine to automate the most tedious parts of support. 
                    From triage to resolution suggestions, AI has your back.
                 </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 flex-1 w-full max-w-md">
                 {[
                   { icon: <Brain className="h-5 w-5" />, label: "Contextual reasoning" },
                   { icon: <Zap className="h-5 w-5" />, label: "Instant triage" },
                   { icon: <Shield className="h-5 w-5" />, label: "Agent safety" },
                   { icon: <Activity className="h-5 w-5" />, label: "Real-time insights" },
                 ].map((item, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex flex-col gap-3">
                       <div className="text-primary-foreground">{item.icon}</div>
                       <span className="text-xs font-bold leading-tight uppercase tracking-tight">{item.label}</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_1.6fr]">
          {/* Information Side */}
          <div className="space-y-6">
             <div className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-xl font-bold mb-6">How it works</h3>
                <div className="space-y-8">
                   {[
                     { 
                       step: "01", 
                       title: "Semantic Analysis", 
                       desc: "The engine parses ticket intent and urgency using advanced NLP.",
                       icon: <Brain className="h-5 w-5" />
                     },
                     { 
                       step: "02", 
                       title: "Knowledge Retrieval", 
                       desc: "Queries your specific knowledge base for similar historical fixes.",
                       icon: <MessageSquare className="h-5 w-5" />
                     },
                     { 
                       step: "03", 
                       title: "Draft Synthesis", 
                       desc: "Synthesizes a response that sounds human but uses expert data.",
                       icon: <Zap className="h-5 w-5" />
                     }
                   ].map((step, i) => (
                      <div key={i} className="flex gap-4 group">
                         <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-xs font-bold text-primary transition-all group-hover:scale-110">
                            {step.step}
                         </div>
                         <div className="space-y-1">
                            <h4 className="font-bold text-slate-900 dark:text-white">{step.title}</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
                         </div>
                      </div>
                   ))}
                </div>
             </div>

             <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white">
                <h3 className="text-lg font-bold mb-2">Beta Feature</h3>
                <p className="text-sm text-slate-400 mb-6">The AI agent workflow is currently in beta. Your feedback helps improve accuracy.</p>
                <div className="text-sm font-semibold text-primary cursor-pointer border-b border-primary inline-block">Report AI inaccuracy</div>
             </div>
          </div>

          {/* Interactive Side */}
          <div className="space-y-6">
             <div className="flex items-center justify-between pl-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                   <Zap className="h-5 w-5 text-primary" />
                   Live Playground
                </h2>
                <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                   <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                   Engine Connected
                </div>
             </div>
             
             {/* Note: In a real app, this would select a ticket or take raw text input */}
             <div className="bg-slate-100 dark:bg-slate-900 rounded-[2rem] p-4 text-center border border-dashed border-slate-300 dark:border-slate-700 mb-4">
                <p className="text-xs text-slate-500">Pick a ticket from the dashboard to use the full power of Copilot.</p>
             </div>
             
             <AssistantPanel ticketId="demo-ticket-id" />
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}
