'use client';

import React from 'react';
import { motion, Transition } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface GlowEffectProps {
  colors?: string[];
  mode?: 'colorShift' | 'breathe' | 'rotate' | 'flow' | 'static';
  blur?: 'soft' | 'medium' | 'strong' | number;
  duration?: number;
  scale?: number;
  className?: string;
}

export const GlowEffect: React.FC<GlowEffectProps> = ({
  colors = ['#FF5733', '#33FF57', '#3357FF', '#F1C40F'],
  mode = 'colorShift',
  blur = 'soft',
  duration = 3,
  scale = 0.9,
  className,
}) => {
  const getBlurClass = (b: 'soft' | 'medium' | 'strong' | number) => {
    if (typeof b === 'number') return `blur-[${b}px]`;
    switch (b) {
      case 'soft':
        return 'blur-md';
      case 'medium':
        return 'blur-xl';
      case 'strong':
        return 'blur-2xl';
      default:
        return 'blur-md';
    }
  };

  const blurClass = getBlurClass(blur);

  const gradientString = `linear-gradient(90deg, ${colors.join(', ')}, ${colors[0]})`;

  const transition: Transition = {
    duration,
    repeat: Infinity,
    repeatType: 'reverse',
    ease: 'easeInOut',
  };

  const getAnimation = () => {
    switch (mode) {
      case 'colorShift':
        return {
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          scale: [scale, scale * 1.05, scale],
        };
      case 'breathe':
        return {
          opacity: [0.4, 0.9, 0.4],
          scale: [scale * 0.95, scale * 1.05, scale * 0.95],
        };
      case 'rotate':
        return {
          rotate: [0, 360],
        };
      case 'flow':
        return {
          backgroundPosition: ['0% 0%', '200% 200%'],
        };
      default:
        return {};
    }
  };

  return (
    <motion.div
      className={cn(
        'absolute -inset-1.5 rounded-full pointer-events-none opacity-100 blur-lg',
        blurClass,
        className
      )}
      style={{
        backgroundImage: gradientString,
        backgroundSize: '300% 300%',
        transformOrigin: 'center center',
      }}
      animate={getAnimation()}
      transition={transition}
    />
  );
};
