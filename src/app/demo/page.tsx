'use client';

import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import DemoOne from '@/components/ui/demo';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function DemoPage() {
  const isDemoEnabled = process.env.NEXT_PUBLIC_DEMO !== 'false';
  if (!isDemoEnabled) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg mb-4 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
        <div className="inline-flex items-center space-x-1 text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Actions Component Demo</span>
        </div>
      </div>

      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden p-6">
        <h2 className="text-lg font-black text-slate-900 mb-1">Travelo AI Conversation</h2>
        <p className="text-xs text-slate-500 mb-6">Interactive AI message stream with action items (Retry, Like, Dislike, Copy, Share).</p>
        <DemoOne />
      </div>
    </div>
  );
}
