'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Copy,
  Check,
  RefreshCcw,
  ThumbsDown,
  ThumbsUp,
  Share2,
  Bot,
  User as UserIcon,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Action, Actions } from '@/components/ui/actions';
import { Conversation, ConversationContent } from '@/components/ui/conversation';
import { Message, MessageContent } from '@/components/ui/message';

export type Role = 'user' | 'assistant';
export type Feedback = 'like' | 'dislike' | null;

export interface MessageItem {
  id: string;
  role: Role;
  content: string;
  createdAt: string;
  status?: 'streaming' | 'done' | 'error';
  feedback?: Feedback;
  avatar?: string;
  name?: string;
}

export type MessageAction = 'copy' | 'like' | 'dislike' | 'retry' | 'share';

export interface AiActionsProps {
  messages: MessageItem[];
  onAction?: (action: MessageAction, messageId: string) => void;
  className?: string;
}

export const AiActions: React.FC<AiActionsProps> = ({
  messages,
  onAction,
  className,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [avatarErrors, setAvatarErrors] = useState<Record<string, boolean>>({});

  const handleCopy = async (content: string, id: string) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(content);
      } else {
        // Fallback for non-HTTPS or legacy browsers
        const textArea = document.createElement('textarea');
        textArea.value = content;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      onAction?.('copy', id);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  const handleFeedback = (type: 'like' | 'dislike', msg: MessageItem) => {
    onAction?.(type, msg.id);
  };

  const handleShare = (content: string, id: string) => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: 'Travelo AI Recommendation',
        text: content,
      }).catch(() => {});
    } else {
      handleCopy(content, id);
    }
    onAction?.('share', id);
  };

  const lastAssistantIdx = messages.map(m => m.role).lastIndexOf('assistant');

  return (
    <div className={cn('w-full max-w-lg mx-auto', className)}>
      {/* Polite Live Region for Screen Readers */}
      <div aria-live="polite" className="sr-only">
        {copiedId ? 'Copied to clipboard' : ''}
      </div>

      <Conversation className="relative w-full">
        <ConversationContent
          role="log"
          aria-live="polite"
          aria-label="Travelo Conversation Stream"
          className="space-y-4"
        >
          {messages.map((message, index) => {
            const isAssistant = message.role === 'assistant';
            const isLastAssistant = index === lastAssistantIdx;
            const isStreaming = message.status === 'streaming';
            const isError = message.status === 'error';
            const isCopied = copiedId === message.id;

            return (
              <Message
                key={message.id}
                from={message.role}
                className={cn(
                  'flex flex-col gap-1.5 w-full',
                  isAssistant ? 'items-start' : 'items-end'
                )}
              >
                {/* Header with Avatar & Name */}
                <div
                  className={cn(
                    'flex items-center gap-2 mb-0.5',
                    isAssistant ? 'flex-row' : 'flex-row-reverse'
                  )}
                >
                  {/* Avatar with fallback */}
                  <div className="relative shrink-0">
                    {message.avatar && !avatarErrors[message.id] ? (
                      <img
                        src={message.avatar}
                        alt={message.name || (isAssistant ? 'Travelo' : 'You')}
                        onError={() => setAvatarErrors(prev => ({ ...prev, [message.id]: true }))}
                        className="h-8 w-8 rounded-full object-cover border border-slate-200 shadow-sm"
                      />
                    ) : isAssistant ? (
                      <div
                        title="Travelo AI Assistant"
                        className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-[11px] font-black shadow-sm ring-2 ring-white"
                      >
                        <Bot className="w-4 h-4" />
                      </div>
                    ) : (
                      <div
                        title="Traveler"
                        className="h-8 w-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold shadow-sm ring-2 ring-white"
                      >
                        <UserIcon className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  <span className="text-xs font-bold text-slate-700">
                    {message.name || (isAssistant ? 'Travelo' : 'You')}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {message.createdAt}
                  </span>
                </div>

                {/* Message Content Bubble */}
                <MessageContent
                  className={cn(
                    'max-w-[85%] break-words rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-sm overflow-x-auto',
                    isAssistant
                      ? 'bg-slate-100 text-slate-900 border border-slate-200/90 rounded-tl-sm'
                      : 'bg-blue-600 text-white rounded-tr-sm'
                  )}
                >
                  {isAssistant ? (
                    <div className="prose prose-xs max-w-none text-slate-800 break-words">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ children }) => <h1 className="text-base font-bold text-slate-900 mt-2 mb-1">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-sm font-bold text-slate-900 mt-2 mb-1">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-xs font-bold text-blue-800 mt-1.5 mb-1 uppercase tracking-wide">{children}</h3>,
                          p: ({ children }) => <p className="leading-relaxed mb-1.5 last:mb-0">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 my-1.5 marker:text-blue-600">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-4 space-y-1 my-1.5 marker:text-blue-600">{children}</ol>,
                          li: ({ children }) => <li className="leading-relaxed pl-0.5">{children}</li>,
                          strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
                          code: ({ children }) => <code className="bg-slate-200/80 text-blue-900 px-1 py-0.5 rounded text-[11px] font-mono">{children}</code>,
                          table: ({ children }) => <div className="overflow-x-auto my-2"><table className="min-w-full text-xs border border-slate-200">{children}</table></div>,
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}

                  {/* Streaming Indicator */}
                  {isStreaming && (
                    <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium mt-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Travelo is replying...</span>
                    </div>
                  )}

                  {/* Error Indicator */}
                  {isError && (
                    <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium mt-2 bg-rose-50 p-2 rounded-lg border border-rose-200">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Something went wrong generating this response.</span>
                    </div>
                  )}
                </MessageContent>

                {/* Actions Row (Hidden while streaming, shown for assistant messages) */}
                {isAssistant && !isStreaming && (
                  <Actions className="mt-1 flex items-center gap-1">
                    
                    {/* Copy Button */}
                    <Action
                      label={isCopied ? 'Copied' : 'Copy message'}
                      onClick={() => handleCopy(message.content, message.id)}
                      className={cn(
                        'min-w-[40px] min-h-[40px] p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500',
                        isCopied && 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                      )}
                    >
                      {isCopied ? (
                        <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                          <Check className="size-4" />
                          <span>Copied</span>
                        </div>
                      ) : (
                        <Copy className="size-4" />
                      )}
                    </Action>

                    {/* Like Button */}
                    <Action
                      label="Like response"
                      onClick={() => handleFeedback('like', message)}
                      className={cn(
                        'min-w-[40px] min-h-[40px] p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500',
                        message.feedback === 'like' && 'text-blue-600 bg-blue-100/80 font-bold'
                      )}
                    >
                      <ThumbsUp className={cn('size-4', message.feedback === 'like' && 'fill-current')} />
                    </Action>

                    {/* Dislike Button */}
                    <Action
                      label="Dislike response"
                      onClick={() => handleFeedback('dislike', message)}
                      className={cn(
                        'min-w-[40px] min-h-[40px] p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500',
                        message.feedback === 'dislike' && 'text-rose-600 bg-rose-100/80 font-bold'
                      )}
                    >
                      <ThumbsDown className={cn('size-4', message.feedback === 'dislike' && 'fill-current')} />
                    </Action>

                    {/* Retry Button (Only on last message or on error states) */}
                    {(isLastAssistant || isError) && (
                      <Action
                        label="Retry response"
                        disabled={isStreaming}
                        onClick={() => onAction?.('retry', message.id)}
                        className="min-w-[40px] min-h-[40px] p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-blue-500"
                      >
                        <RefreshCcw className="size-4" />
                      </Action>
                    )}

                    {/* Share Button */}
                    <Action
                      label="Share recommendation"
                      onClick={() => handleShare(message.content, message.id)}
                      className="min-w-[40px] min-h-[40px] p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      <Share2 className="size-4" />
                    </Action>

                  </Actions>
                )}
              </Message>
            );
          })}
        </ConversationContent>
      </Conversation>
    </div>
  );
};

// Default Example export maintaining compatibility with demo.tsx
export const Example = () => {
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: '1',
      role: 'user',
      content: 'Hello Travelo! What are the best breakfast spots in Ghatkesar under ₹200?',
      createdAt: '10:15 AM',
      name: 'Ali Imam',
    },
    {
      id: '2',
      role: 'assistant',
      content: 'Hello Ali! For under **₹200** in Ghatkesar, I recommend:\n\n* **Sri Lakshmi Tiffins (Station Road):** Ghee Karam Dosa & Idli platter (~₹60–₹90)\n* **Red Bucket Biryani Point:** Mini breakfast rice combos (~₹120–₹160)\n\nBoth are verified authentic with high newcomer safety ratings!',
      createdAt: '10:15 AM',
      name: 'Travelo',
      status: 'done',
      feedback: null,
    },
  ]);

  const handleAction = (action: MessageAction, id: string) => {
    if (action === 'like') {
      setMessages(prev => prev.map(m => m.id === id ? { ...m, feedback: m.feedback === 'like' ? null : 'like' } : m));
    } else if (action === 'dislike') {
      setMessages(prev => prev.map(m => m.id === id ? { ...m, feedback: m.feedback === 'dislike' ? null : 'dislike' } : m));
    } else if (action === 'retry') {
      alert(`Retrying generation for message ${id}`);
    }
  };

  return <AiActions messages={messages} onAction={handleAction} />;
};
