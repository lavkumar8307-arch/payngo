'use client';

import React from 'react';
import { GlowEffect } from '@/components/core/glow-effect';
import { ArrowRight } from 'lucide-react';

export function GlowEffectButton() {
  return (
    <div className="relative inline-block">
      <GlowEffect
        colors={['#FF5733', '#33FF57', '#3357FF', '#F1C40F']}
        mode="colorShift"
        blur="soft"
        duration={3}
        scale={0.9}
      />
      <button className="relative inline-flex items-center gap-1.5 rounded-md bg-zinc-950 px-3 py-1.5 text-sm font-semibold text-zinc-50 outline outline-1 outline-[#fff2f21f] shadow-lg hover:scale-105 transition-transform">
        Explore <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
