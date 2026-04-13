'use client';

import { useState } from 'react';
import { Sparkles, Send, X, MessageSquare, Brain, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function DashboardAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: "Hello! I'm your ITMAGNET AI copilot. How can I help you manage your support tickets today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsTyping(true);

    // Mock AI Response
    setTimeout(() => {
      let response = "I've analyzed that request. Based on current system analytics, you have 4 high-priority tickets that need immediate attention.";
      if (userMessage.toLowerCase().includes('summarize')) {
        response = "To summarize ticket #TK-842: The customer is experiencing a 403 error on the checkout page. Recommended action: Verify their subscription status in the admin panel.";
      } else if (userMessage.toLowerCase().includes('common')) {
        response = "The most common issues this week are: 1. Login Authentication (32%), 2. Payment Gateway Timeout (24%), and 3. Dashboard UI glitches (15%).";
      }
      
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-8 right-8 h-16 w-16 bg-indigo-600 text-white shadow-2xl flex items-center justify-center transition-all duration-300 z-50",
          isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"
        )}
      >
        <Sparkles className="h-8 w-8" />
      </button>

      {/* Assistant Window */}
      <div className={cn(
        "fixed bottom-8 right-8 w-[400px] h-[600px] bg-white border border-slate-200 shadow-2xl flex flex-col transition-all duration-300 z-50",
        isOpen ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0 pointer-events-none"
      )}>
        {/* Header */}
        <div className="p-4 bg-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-white/20 flex items-center justify-center">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-widest leading-none">AI Copilot</p>
              <p className="text-[10px] text-indigo-200 uppercase font-bold mt-1">Ready to assist</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((m, i) => (
            <div key={i} className={cn(
              "flex gap-3",
              m.role === 'user' ? "flex-row-reverse" : ""
            )}>
              <div className={cn(
                "h-8 w-8 flex-shrink-0 flex items-center justify-center",
                m.role === 'user' ? "bg-slate-100 text-slate-500" : "bg-indigo-50 text-indigo-600"
              )}>
                {m.role === 'user' ? <MessageSquare className="h-4 w-4" /> : <Brain className="h-4 w-4" />}
              </div>
              <div className={cn(
                "p-4 text-sm leading-relaxed",
                m.role === 'user' ? "bg-slate-100 text-slate-800" : "bg-indigo-50/50 text-slate-800"
              )}>
                {m.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-3">
              <div className="h-8 w-8 bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
              <div className="p-4 bg-indigo-50/50 text-slate-400 text-sm">
                Thinking...
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-100">
          <form onSubmit={handleSend} className="relative">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="w-full bg-slate-50 border border-slate-200 h-12 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <button type="submit" className="absolute right-2 top-2 p-2 text-indigo-600 hover:bg-indigo-50">
              <Send className="h-4 w-4" />
            </button>
          </form>
          <p className="text-[10px] text-slate-400 mt-3 text-center uppercase font-bold tracking-tight">Enterprise grade AI protection enabled</p>
        </div>
      </div>
    </>
  );
}
