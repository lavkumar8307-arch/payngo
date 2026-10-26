'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface MessageProps extends React.HTMLAttributes<HTMLDivElement> {
  from: 'user' | 'assistant';
  children: React.ReactNode;
}

export const Message: React.FC<MessageProps> = ({ from, className, children, ...props }) => {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 w-full',
        from === 'assistant' ? 'items-start' : 'items-end',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export interface MessageContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const MessageContent: React.FC<MessageContentProps> = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        'rounded-2xl px-4 py-2.5 text-sm font-medium leading-relaxed max-w-[85%] shadow-sm',
        'bg-slate-100 text-slate-900 border border-slate-200/80',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
