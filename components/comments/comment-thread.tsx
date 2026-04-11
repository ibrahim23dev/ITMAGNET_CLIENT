'use client';

import { useState } from 'react';
import { Send, User as UserIcon, Loader2, MessageSquare, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCommentsQuery, useCreateComment } from '@/hooks/useComments';
import { cn } from '@/lib/utils';

interface CommentThreadProps {
  ticketId: string;
}

export function CommentThread({ ticketId }: CommentThreadProps) {
  const [draft, setDraft] = useState('');
  const commentsQuery = useCommentsQuery(ticketId);
  const addMutation = useCreateComment(ticketId);

  const handlePost = async () => {
    if (!draft.trim()) return;
    addMutation.mutate({ body: draft.trim() }, {
      onSuccess: () => {
        setDraft('');
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* List of comments */}
      <div className="space-y-6">
        {commentsQuery.isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
          </div>
        ) : commentsQuery.data?.length ? (
          commentsQuery.data.map((comment) => (
            <div 
              key={comment.id} 
              className={cn(
                "flex gap-4 animate-in",
                comment.authorRole === 'agent' ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                 <UserIcon className="h-5 w-5 text-slate-400" />
              </div>
              <div className={cn(
                "max-w-[80%] p-5 rounded-[2rem] shadow-sm border",
                comment.authorRole === 'agent' 
                  ? "bg-primary text-white border-primary/20 rounded-tr-none" 
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-tl-none"
              )}>
                <div className="flex items-center justify-between gap-4 mb-2">
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-wider",
                    comment.authorRole === 'agent' ? "text-primary-foreground/70" : "text-slate-400"
                  )}>
                    {comment.authorName} • {comment.authorRole}
                  </span>
                  <span className={cn(
                    "text-[10px]",
                    comment.authorRole === 'agent' ? "text-primary-foreground/50" : "text-slate-400"
                  )}>
                    {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {comment.body}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center opacity-30">
             <MessageSquare className="h-10 w-10 mb-2" />
             <p className="text-sm font-medium">No messages yet. Start the conversation!</p>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="relative pt-6 border-t border-slate-200 dark:border-slate-800">
        <div className="group relative rounded-[2.5rem] bg-white dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 focus-within:border-primary/30 transition-all p-4">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type your reply here..."
            className="w-full min-h-[120px] bg-transparent resize-none border-none outline-none text-base p-4"
          />
          <div className="flex justify-between items-center px-4 pb-2">
             <div className="flex gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Internal note disabled</span>
             </div>
             <Button 
                onClick={handlePost} 
                disabled={!draft.trim() || addMutation.isPending}
                className="rounded-2xl px-6 h-12 shadow-lg shadow-primary/20 font-bold"
             >
                {addMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                Send Reply
             </Button>
          </div>
        </div>
        
        {addMutation.isError && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
             <AlertCircle className="h-4 w-4" />
             Failed to post comment. Please try again.
          </div>
        )}
      </div>
    </div>
  );
}
