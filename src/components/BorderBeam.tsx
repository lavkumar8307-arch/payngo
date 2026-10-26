'use client';

import React from 'react';

export interface BorderBeamProps {
  children?: React.ReactNode;
  size?: 'md' | 'sm' | 'line' | 'pulse-inner' | 'pulse-outside';
  colorVariant?: 'colorful' | 'mono' | 'ocean' | 'sunset';
  strength?: number; // 0 - 1
  active?: boolean;
  theme?: 'light' | 'dark';
  className?: string;
}

export const BorderBeam: React.FC<BorderBeamProps> = ({
  children,
  size = 'md',
  colorVariant = 'colorful',
  strength = 0.7,
  active = true,
  theme = 'dark',
  className = '',
}) => {
  if (!active) {
    return <div className={`relative ${className}`}>{children}</div>;
  }

  // Gradient definitions based on colorVariant
  const getGradient = () => {
    switch (colorVariant) {
      case 'ocean':
        return 'from-cyan-400 via-sky-500 to-blue-600';
      case 'sunset':
        return 'from-amber-400 via-rose-500 to-purple-600';
      case 'mono':
        return 'from-slate-100 via-slate-400 to-slate-200';
      case 'colorful':
      default:
        return 'from-sky-400 via-indigo-500 to-amber-400';
    }
  };

  const opacity = Math.min(Math.max(strength, 0), 1);

  return (
    <div className={`relative group overflow-hidden rounded-3xl ${className}`}>
      {/* Animated Beam Border Glow Element */}
      <span
        style={{ opacity }}
        className={`absolute inset-0 pointer-events-none rounded-3xl p-[1.5px] bg-gradient-to-r ${getGradient()} opacity-80 animate-border-beam transition-all`}
      />

      {/* Internal Content Container */}
      <div className="relative z-10 w-full h-full rounded-[calc(1.5rem-1px)]">
        {children}
      </div>
    </div>
  );
};
