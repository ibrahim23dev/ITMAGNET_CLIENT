'use client';

import { useState, useEffect } from 'react';
import { DashboardShell } from '@/components/layouts/dashboard-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ticketApi, aiApi } from '@/lib/api';
import { Sparkles, Zap, Brain, MessageSquare, Shield, Activity, Loader2, AlertCircle, CheckCircle, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Ticket } from '@/types';

type TabType = 'classify' | 'summarize' | 'reply';

export default function AiPage() {
  const [activeTab, setActiveTab] = useState<TabType>('classify');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<string>('');

  // Classify Tab States
  const [classifyText, setClassifyText] = useState('');
  const [classifyTitle, setClassifyTitle] = useState('');
  const [classifyLoading, setClassifyLoading] = useState(false);
  const [classifyResult, setClassifyResult] = useState<any>(null);
  const [classifyError, setClassifyError] = useState('');

  // Summarize Tab States
  const [summarizeText, setSummarizeText] = useState('');
  const [summarizeLoading, setSummarizeLoading] = useState(false);
  const [summarizeResult, setSummarizeResult] = useState<any>(null);
  const [summarizeError, setSummarizeError] = useState('');

  // Reply Tab States
  const [replyTone, setReplyTone] = useState('professional');
  const [replyIncludeRag, setReplyIncludeRag] = useState(true);
  const [replyLoading, setReplyLoading] = useState(false);
  const [replyResult, setReplyResult] = useState<any>(null);
  const [replyError, setReplyError] = useState('');
  const [copied, setCopied] = useState(false);

  // Load tickets on mount
  useEffect(() => {
    const loadTickets = async () => {
      try {
        const response = await ticketApi.list();
        const ticketsArray = Array.isArray(response) ? response : response?.tickets || [];
        setTickets(ticketsArray);
        if (ticketsArray.length > 0) {
          setSelectedTicket(ticketsArray[0].id);
        }
      } catch (err) {
        console.error('Failed to load tickets:', err);
      }
    };
    loadTickets();
  }, []);

  // Handle Classify
  const handleClassify = async () => {
    if (!classifyText.trim()) {
      setClassifyError('Please enter text to classify');
      return;
    }

    setClassifyLoading(true);
    setClassifyError('');
    setClassifyResult(null);

    try {
      const result = await aiApi.classify({
        text: classifyText.trim(),
        title: classifyTitle.trim() || null
      });
      setClassifyResult(result);
    } catch (err: any) {
      setClassifyError(err?.message || 'Failed to classify text');
    } finally {
      setClassifyLoading(false);
    }
  };

  // Handle Summarize
  const handleSummarize = async () => {
    if (!selectedTicket) {
      setSummarizeError('Please select a ticket');
      return;
    }
    if (!summarizeText.trim()) {
      setSummarizeError('Please enter text to summarize');
      return;
    }

    setSummarizeLoading(true);
    setSummarizeError('');
    setSummarizeResult(null);

    try {
      const result = await aiApi.summarize({
        ticketId: selectedTicket,
        text: summarizeText.trim()
      });
      setSummarizeResult(result);
    } catch (err: any) {
      setSummarizeError(err?.message || 'Failed to summarize');
    } finally {
      setSummarizeLoading(false);
    }
  };

  // Handle Suggest Reply
  const handleSuggestReply = async () => {
    if (!selectedTicket) {
      setReplyError('Please select a ticket');
      return;
    }

    setReplyLoading(true);
    setReplyError('');
    setReplyResult(null);

    try {
      const result = await aiApi.suggestReply({
        ticketId: selectedTicket,
        tone: replyTone,
        includeRag: replyIncludeRag
      });
      setReplyResult(result);
    } catch (err: any) {
      setReplyError(err?.message || 'Failed to suggest reply');
    } finally {
      setReplyLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardShell activePath="/ai" title="AI Copilot Lab">
      <section className="space-y-8 pb-20">
        {/* Hero Banner */}
        <div className="relative bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 p-8 lg:p-12 overflow-hidden">
          <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
            <div className="space-y-4 flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-primary">AI Copilot Lab</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold">Intelligent Support Assistant</h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl">
                Leverage AI to classify tickets, summarize conversations, and generate smart reply suggestions instantly.
              </p>
            </div>
            <div className="h-32 w-32 rounded-2xl bg-gradient-to-br from-primary to-blue-600 shadow-lg hidden lg:block" />
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
          {[
            { id: 'classify' as TabType, label: 'Classify', icon: Brain },
            { id: 'summarize' as TabType, label: 'Summarize', icon: MessageSquare },
            { id: 'reply' as TabType, label: 'Suggest Reply', icon: Zap }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-6 py-4 font-semibold border-b-2 transition-all',
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                )}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <div className="space-y-6">
            {activeTab === 'classify' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 p-8 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                    Message Title (Optional)
                  </label>
                  <Input
                    value={classifyTitle}
                    onChange={(e) => setClassifyTitle(e.target.value)}
                    placeholder="Brief title for the ticket..."
                    className="h-12"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                    Message Text
                  </label>
                  <textarea
                    value={classifyText}
                    onChange={(e) => setClassifyText(e.target.value)}
                    placeholder="Paste the customer message here..."
                    className="w-full min-h-[200px] p-4 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </div>

                {classifyError && (
                  <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-300 dark:border-rose-800 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-rose-700 dark:text-rose-300">{classifyError}</p>
                  </div>
                )}

                <Button
                  onClick={handleClassify}
                  disabled={classifyLoading || !classifyText.trim()}
                  className="w-full h-12 font-bold"
                >
                  {classifyLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Classifying...
                    </>
                  ) : (
                    <>
                      <Brain className="h-5 w-5 mr-2" />
                      Classify Message
                    </>
                  )}
                </Button>
              </div>
            )}

            {activeTab === 'summarize' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 p-8 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                    Select Ticket
                  </label>
                  <select
                    value={selectedTicket}
                    onChange={(e) => setSelectedTicket(e.target.value)}
                    className="w-full h-12 px-4 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-medium focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Choose a ticket...</option>
                    {tickets.map(ticket => (
                      <option key={ticket.id} value={ticket.id}>
                        [{ticket.id.slice(0, 8)}...] {ticket.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                    Conversation Text
                  </label>
                  <textarea
                    value={summarizeText}
                    onChange={(e) => setSummarizeText(e.target.value)}
                    placeholder="Paste the ticket conversation here..."
                    className="w-full min-h-[200px] p-4 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </div>

                {summarizeError && (
                  <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-300 dark:border-rose-800 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-rose-700 dark:text-rose-300">{summarizeError}</p>
                  </div>
                )}

                <Button
                  onClick={handleSummarize}
                  disabled={summarizeLoading || !summarizeText.trim() || !selectedTicket}
                  className="w-full h-12 font-bold"
                >
                  {summarizeLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Summarizing...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-5 w-5 mr-2" />
                      Summarize
                    </>
                  )}
                </Button>
              </div>
            )}

            {activeTab === 'reply' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 p-8 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                    Select Ticket
                  </label>
                  <select
                    value={selectedTicket}
                    onChange={(e) => setSelectedTicket(e.target.value)}
                    className="w-full h-12 px-4 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-medium focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Choose a ticket...</option>
                    {tickets.map(ticket => (
                      <option key={ticket.id} value={ticket.id}>
                        [{ticket.id.slice(0, 8)}...] {ticket.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                      Response Tone
                    </label>
                    <select
                      value={replyTone}
                      onChange={(e) => setReplyTone(e.target.value)}
                      className="w-full h-12 px-4 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-medium focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="professional">Professional</option>
                      <option value="friendly">Friendly</option>
                      <option value="technical">Technical</option>
                      <option value="empathetic">Empathetic</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <label className="flex items-center gap-3 p-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={replyIncludeRag}
                        onChange={(e) => setReplyIncludeRag(e.target.checked)}
                        className="w-5 h-5 accent-primary"
                      />
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Use Knowledge Base
                      </span>
                    </label>
                  </div>
                </div>

                {replyError && (
                  <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-300 dark:border-rose-800 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-rose-700 dark:text-rose-300">{replyError}</p>
                  </div>
                )}

                <Button
                  onClick={handleSuggestReply}
                  disabled={replyLoading || !selectedTicket}
                  className="w-full h-12 font-bold"
                >
                  {replyLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5 mr-2" />
                      Generate Reply
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Results Panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 p-8 space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Results
            </h3>

            {activeTab === 'classify' && classifyResult && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-800">
                  <p className="text-xs font-bold uppercase text-blue-600 dark:text-blue-400 mb-2">Classification</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">Category:</span>
                      <Badge className="bg-blue-600">{classifyResult.classification?.category}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">Priority:</span>
                      <Badge className={cn(
                        classifyResult.classification?.priority === 'critical' ? 'bg-red-600' :
                        classifyResult.classification?.priority === 'high' ? 'bg-orange-600' :
                        classifyResult.classification?.priority === 'medium' ? 'bg-yellow-600' :
                        'bg-green-600'
                      )}>
                        {classifyResult.classification?.priority}
                      </Badge>
                    </div>
                  </div>
                </div>

                {classifyResult.classification?.suggestedTags?.length > 0 && (
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {classifyResult.classification.suggestedTags.map((tag: string, i: number) => (
                        <Badge key={i}>{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-xs text-slate-500">
                  {classifyResult.timestamp && new Date(classifyResult.timestamp).toLocaleString()}
                </div>
              </div>
            )}

            {activeTab === 'summarize' && summarizeResult && (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-800">
                  <p className="text-xs font-bold uppercase text-green-600 dark:text-green-400 mb-3">Summary</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {summarizeResult.summary}
                  </p>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {summarizeResult.commentCount || 0} comments
                  </span>
                </div>
              </div>
            )}

            {activeTab === 'reply' && replyResult && (
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-300 dark:border-purple-800">
                  <p className="text-xs font-bold uppercase text-purple-600 dark:text-purple-400 mb-3">Suggested Reply</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {replyResult.suggestedReply}
                  </p>
                </div>

                <button
                  onClick={() => copyToClipboard(replyResult.suggestedReply)}
                  className={cn(
                    'w-full h-12 font-bold flex items-center justify-center gap-2 transition-all border',
                    copied
                      ? 'bg-green-600 hover:bg-green-700 text-white border-green-600'
                      : 'bg-slate-600 hover:bg-slate-700 text-white border-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600 dark:border-slate-700'
                  )}
                >
                  {copied ? (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-5 w-5" />
                      Copy Reply
                    </>
                  )}
                </button>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <p className="font-semibold text-slate-600 dark:text-slate-400">Tone</p>
                    <p className="text-slate-900 dark:text-white capitalize">{replyResult.tone}</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <p className="font-semibold text-slate-600 dark:text-slate-400">Similar Tickets</p>
                    <p className="text-slate-900 dark:text-white">{replyResult.similarTicketsFound}</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 col-span-2">
                    <p className="font-semibold text-slate-600 dark:text-slate-400">Knowledge Base Used</p>
                    <p className="text-slate-900 dark:text-white">{replyResult.ragContextUsed ? '✓ Yes' : '✗ No'}</p>
                  </div>
                </div>
              </div>
            )}

            {!classifyResult && !summarizeResult && !replyResult && (
              <div className="h-96 flex flex-col items-center justify-center text-center">
                <Brain className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
                <p className="text-slate-500 dark:text-slate-400 font-semibold">
                  {activeTab === 'classify' && 'Enter text and click "Classify Message" to see results'}
                  {activeTab === 'summarize' && 'Select a ticket and enter conversation to summarize'}
                  {activeTab === 'reply' && 'Select a ticket and click "Generate Reply" to get suggestions'}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}
