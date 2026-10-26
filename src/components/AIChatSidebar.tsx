'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Place, RideOption } from '@/types';
import { Sparkles, Send, X, Bot, CreditCard, Zap, RefreshCw } from 'lucide-react';
import { AiActions, MessageItem, MessageAction } from '@/components/ui/ai-actions';

interface AIChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCity: string;
  currency: 'INR' | 'USD';
  onOpenCheckout: (place: Place, ride?: RideOption) => void;
  initialPrompt?: string;
}

export const AIChatSidebar: React.FC<AIChatSidebarProps> = ({
  isOpen,
  onClose,
  selectedCity,
  currency,
  onOpenCheckout,
  initialPrompt,
}) => {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [toolResult, setToolResult] = useState<any>(null);
  const [isFocused, setIsFocused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hi! I am Travelo, your PayNGo AI travel companion. You are exploring ${selectedCity} - ask me anything about food, transit, heritage spots, or budget breakdowns!`,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'done',
      feedback: null,
    },
  ]);

  useEffect(() => {
    if (isOpen && initialPrompt && initialPrompt.trim()) {
      handleSendMessage(initialPrompt.trim());
    }
  }, [isOpen, initialPrompt]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsgId = Date.now().toString();
    const userMsg: MessageItem = {
      id: userMsgId,
      role: 'user',
      content: query,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'done',
    };

    const assistantMsgId = (Date.now() + 1).toString();
    const assistantPlaceholder: MessageItem = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'streaming',
      feedback: null,
    };

    setMessages((prev) => [...prev, userMsg, assistantPlaceholder]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          city: selectedCity,
          conversationHistory: messages.map((m) => ({ sender: m.role, text: m.content })),
        }),
      });

      if (!res.ok) throw new Error('Travelo API returned non-200');

      const data = await res.json();
      setToolResult(data.toolResult || null);

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? { ...m, content: data.reply || 'No response returned. Please retry.', status: 'done' }
            : m
        )
      );
    } catch (err) {
      console.error('Travelo AI error:', err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? { ...m, content: 'Sorry, I encountered an issue. Please click Retry below.', status: 'error' }
            : m
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (action: MessageAction, messageId: string) => {
    if (action === 'like') {
      setMessages((prev) =>
        prev.map((m) => m.id === messageId ? { ...m, feedback: m.feedback === 'like' ? null : 'like' } : m)
      );
    } else if (action === 'dislike') {
      setMessages((prev) =>
        prev.map((m) => m.id === messageId ? { ...m, feedback: m.feedback === 'dislike' ? null : 'dislike' } : m)
      );
    } else if (action === 'retry') {
      const targetIdx = messages.findIndex((m) => m.id === messageId);
      const prevUserMsg = [...messages.slice(0, targetIdx)].reverse().find((m) => m.role === 'user');
      if (prevUserMsg) {
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
        handleSendMessage(prevUserMsg.content);
      }
    }
  };

  const handleBookToolRecommendation = (res: any) => {
    if (res.type === 'payment_created') {
      const params = new URLSearchParams({
        title: res.data.placeName || 'Curated Experience',
        amount: (res.data.amountINR || 1200).toString(),
        type: 'experience',
        details: res.data.description || 'Curated by Travelo AI Assistant',
      });
      router.push(`/checkout?${params.toString()}`);
      onClose();
    }
  };

  const quickPrompts = [
    { emoji: 'coffee', label: 'Veg breakfast 300', query: `Best vegetarian breakfast under 300 rupees in ${selectedCity}` },
    { emoji: 'taxi', label: 'Compare rides', query: `Compare ride prices from airport to ${selectedCity}` },
    { emoji: 'temple', label: 'Heritage spots', query: `Top heritage spots to visit in ${selectedCity}` },
    { emoji: 'sunrise', label: 'Hidden gems', query: `Hidden gems and offbeat places in ${selectedCity}` },
    { emoji: 'bowl', label: 'Street food', query: `Must-try local street food in ${selectedCity}` },
  ];

  const quickPromptEmojis: Record<string, string> = {
    coffee: 'cup-of-coffee',
    taxi: 'taxi',
    temple: 'classical-building',
    sunrise: 'sunrise-over-mountains',
    bowl: 'bowl-with-spoon',
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Travelo AI Assistant Chat"
      className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] flex flex-col shadow-2xl animate-slide-left pb-[env(safe-area-inset-bottom)]"
      style={{ background: '#f8fafc' }}
    >
      {/* Header */}
      <div
        className="relative px-5 py-4 flex items-center justify-between overflow-hidden shrink-0"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #0c4a6e 55%, #1e3a5f 100%)' }}
      >
        <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #38bdf8, transparent)' }} />
        <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #818cf8, transparent)' }} />

        <div className="flex items-center gap-3 relative z-10">
          <div className="relative">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-white tracking-tight">Travelo AI</h3>
              <span
                className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                style={{ background: 'rgba(56,189,248,0.15)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.3)' }}
              >
                Gemini
              </span>
            </div>
            <p className="text-[10px] font-medium" style={{ color: '#94a3b8' }}>
              Exploring {selectedCity} &bull; Instant Booking
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          aria-label="Close Travelo AI Assistant"
          className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-white/20"
          style={{ background: 'rgba(255,255,255,0.1)', color: '#94a3b8' }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <AiActions messages={messages} onAction={handleAction} />

        {/* Typing indicator */}
        {loading && (
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
            >
              <Bot className="w-4 h-4" />
            </div>
            <div
              className="px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5"
              style={{ background: 'white', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
            >
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {/* Booking card */}
        {toolResult && toolResult.type === 'payment_created' && (
          <div
            className="rounded-2xl p-4 space-y-3 mt-2"
            style={{ background: 'linear-gradient(135deg, #fffbeb, #fef3c7)', border: '1px solid #fde68a', boxShadow: '0 2px 12px rgba(245,158,11,0.12)' }}
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <CreditCard className="w-4 h-4 text-amber-600" />
                Travelo Recommendation
              </span>
              <span className="text-xs font-black text-amber-800">
                ₹{toolResult.data.amountINR}
              </span>
            </div>
            <p className="text-xs text-amber-900 font-medium">{toolResult.data.description}</p>
            <p className="text-[10px] text-amber-700">
              Ref: <span className="font-mono">{toolResult.data.orderId}</span>
            </p>
            <button
              onClick={() => handleBookToolRecommendation(toolResult)}
              className="w-full text-white font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}
            >
              <Zap className="w-3.5 h-3.5" />
              Review and Book Now
            </button>
          </div>
        )}
      </div>

      {/* Quick Prompts */}
      <div
        className="px-4 py-2.5 flex gap-2 overflow-x-auto scrollbar-none shrink-0"
        style={{ borderTop: '1px solid #e2e8f0', background: 'white' }}
      >
        <button
          onClick={() => handleSendMessage(`Best vegetarian breakfast under 300 rupees in ${selectedCity}`)}
          disabled={loading}
          className="shrink-0 text-[11px] font-semibold px-3 py-1.5 rounded-xl transition-all hover:bg-slate-100 disabled:opacity-50 whitespace-nowrap"
          style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}
        >
          Veg breakfast
        </button>
        <button
          onClick={() => handleSendMessage(`Compare ride prices from airport to ${selectedCity}`)}
          disabled={loading}
          className="shrink-0 text-[11px] font-semibold px-3 py-1.5 rounded-xl transition-all hover:bg-slate-100 disabled:opacity-50 whitespace-nowrap"
          style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}
        >
          Compare rides
        </button>
        <button
          onClick={() => handleSendMessage(`Top heritage spots to visit in ${selectedCity}`)}
          disabled={loading}
          className="shrink-0 text-[11px] font-semibold px-3 py-1.5 rounded-xl transition-all hover:bg-slate-100 disabled:opacity-50 whitespace-nowrap"
          style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}
        >
          Heritage spots
        </button>
        <button
          onClick={() => handleSendMessage(`Hidden gems and offbeat places in ${selectedCity}`)}
          disabled={loading}
          className="shrink-0 text-[11px] font-semibold px-3 py-1.5 rounded-xl transition-all hover:bg-slate-100 disabled:opacity-50 whitespace-nowrap"
          style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}
        >
          Hidden gems
        </button>
        <button
          onClick={() => handleSendMessage(`Must-try local street food in ${selectedCity}`)}
          disabled={loading}
          className="shrink-0 text-[11px] font-semibold px-3 py-1.5 rounded-xl transition-all hover:bg-slate-100 disabled:opacity-50 whitespace-nowrap"
          style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}
        >
          Street food
        </button>
      </div>

      {/* Input */}
      <div className="px-4 py-3 shrink-0" style={{ background: 'white', borderTop: '1px solid #f1f5f9' }}>
        <div
          className="flex items-center gap-2 rounded-2xl px-4 py-2.5 transition-all"
          style={{
            background: '#f8fafc',
            border: isFocused ? '1.5px solid #3b82f6' : '1.5px solid #e2e8f0',
            boxShadow: isFocused ? '0 0 0 3px rgba(59,130,246,0.1)' : 'none',
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={`Ask about ${selectedCity}...`}
            className="flex-1 bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || loading}
            aria-label="Send message"
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
            style={{
              background: input.trim() && !loading ? 'linear-gradient(135deg, #3b82f6, #6366f1)' : '#e2e8f0',
              color: input.trim() && !loading ? 'white' : '#94a3b8',
            }}
          >
            {loading
              ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              : <Send className="w-3.5 h-3.5" />}
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-400 mt-2 select-none">
          Powered by Google Gemini &bull; PayNGo AI
        </p>
      </div>
    </div>
  );
};
