'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface ActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Actions: React.FC<ActionsProps> = ({ className, children, ...props }) => {
  return (
    <div
      className={cn('flex items-center gap-1 text-slate-500', className)}
      {...props}
    >
      {children}
    </div>
  );
};

export interface ActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  children: React.ReactNode;
}

export const Action: React.FC<ActionProps> = ({ label, className, children, ...props }) => {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className={cn(
        'inline-flex items-center justify-center rounded-lg p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
