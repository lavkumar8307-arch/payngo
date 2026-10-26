'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface ConversationProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Conversation: React.FC<ConversationProps> = ({ className, children, ...props }) => {
  return (
    <div className={cn('w-full flex flex-col gap-4', className)} {...props}>
      {children}
    </div>
  );
};

export interface ConversationContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const ConversationContent: React.FC<ConversationContentProps> = ({ className, children, ...props }) => {
  return (
    <div className={cn('flex flex-col gap-4 w-full', className)} {...props}>
      {children}
    </div>
  );
};
