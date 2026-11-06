'use client';

import React from 'react';
import { ArrowRight, Navigation, Utensils } from 'lucide-react';

export const MindtripActsSection: React.FC = () => {
  const scrollToLearns = () => {
    const el = document.getElementById('learns-showcase');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToAdapts = () => {
    const el = document.getElementById('adapts-showcase');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToPlanner = () => {
    const el = document.getElementById('planner');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToExplore = () => {
    const el = document.getElementById('explore');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const actsChips = [
    {
      text: 'Lowest fare: Flight vs Express Train compared',
      positionClass: 'top-8 right-6 lg:top-10 lg:right-28',
    },
    {
      text: "Table reserved · Karim's Old Delhi · 8:00 PM",
      positionClass: 'top-36 right-4 lg:top-40 lg:right-8',
    },
    {
      text: 'Airport cab dispatched · ₹180 live fare',
      positionClass: 'bottom-8 right-8 lg:bottom-12 lg:right-36',
    },
  ];

  return (
    <section id="acts-showcase" className="w-full py-6 sm:py-10 bg-white scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Terracotta Rust Feature Card for Acts (Matches Mindtrip Acts styling) */}
        <div className="relative w-full rounded-[2.5rem] bg-[#8a2c14] overflow-hidden shadow-2xl min-h-[580px] lg:min-h-[640px] flex flex-col justify-between p-6 sm:p-12 lg:p-16 border border-amber-950/40">
          
          {/* Background Video (Acts.webm) */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <video
              key="acts-video"
              autoPlay
              loop
              muted
              playsInline
              className="absolute right-0 top-0 w-full h-full object-cover object-right lg:object-center opacity-85"
            >
              <source src="/videos/Acts.webm" type="video/webm" />
            </video>

            {/* Gradient Overlays for Contrast & Legibility */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#8a2c14] via-[#8a2c14]/90 to-transparent lg:w-3/5" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#8a2c14]/80 via-transparent to-transparent" />
          </div>

          {/* Top Switcher Tabs: [Learns] [Acts (Active)] [Adapts] */}
          <div className="relative z-20 flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={scrollToLearns}
              className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold text-white/60 hover:text-white hover:bg-white/10 border border-transparent transition-all cursor-pointer"
            >
              Learns
            </button>
            <button
              className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold bg-white/15 text-white border border-white/50 backdrop-blur-md shadow-inner cursor-pointer"
            >
              Acts
            </button>
            <button
              onClick={scrollToAdapts}
              className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold text-white/60 hover:text-white hover:bg-white/10 border border-transparent transition-all cursor-pointer"
            >
              Adapts
            </button>
          </div>

          {/* Left Content Area */}
          <div className="relative z-20 max-w-xl py-8 sm:py-12 space-y-5">
            {/* Big Headline */}
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.02]">
              Works
              <br />
              <span className="text-[#fed7aa]">for you.</span>
            </h2>

            {/* Subtitle / Description */}
            <p className="text-white/85 text-sm sm:text-base lg:text-lg leading-relaxed font-normal max-w-lg">
              Compare live fares across flights, express trains, and local cabs at the lowest prices. Reserve tables at verified authentic restaurants with zero wait time, and complete every booking seamlessly with PayPal.
            </p>

            {/* Action Buttons */}
            <div className="pt-3 flex flex-wrap items-center gap-3">
              <button
                onClick={scrollToPlanner}
                className="inline-flex items-center space-x-2.5 bg-white text-slate-950 hover:bg-white/90 font-bold text-xs sm:text-sm px-6 py-3.5 rounded-full shadow-lg transition-all active:scale-95 group cursor-pointer"
              >
                <Navigation className="w-4 h-4 text-orange-600" />
                <span>Compare Lowest Fares (Flight · Train · Cab)</span>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={scrollToExplore}
                className="inline-flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md font-bold text-xs sm:text-sm px-5 py-3.5 rounded-full transition-all active:scale-95 cursor-pointer"
              >
                <Utensils className="w-4 h-4 text-amber-300" />
                <span>Reserve Dining</span>
              </button>
            </div>
          </div>

          {/* Floating Glassmorphism Cards Floating over the Scene */}
          <div className="absolute inset-0 pointer-events-none z-20 hidden md:block">
            {actsChips.map((chip, idx) => (
              <div
                key={idx}
                className={`absolute ${chip.positionClass} transition-all duration-500 ease-out`}
              >
                <div
                  style={{ animationDelay: `${idx * 0.9}s` }}
                  className="flex w-[20em] sm:w-[22em] max-w-[90vw] animate-float1 flex-col gap-2 rounded-3xl px-4 py-2.5 text-xs font-semibold backdrop-blur-xl bg-black/45 border border-white/20 text-white sm:px-5 sm:py-3 sm:text-sm shadow-2xl pointer-events-auto hover:bg-black/60 transition-all"
                >
                  {/* Top row: Avatar with Sparkle Star & Placeholder line */}
                  <div className="flex items-center gap-2">
                    <span data-slot="avatar" className="relative flex shrink-0 rounded-full font-medium w-5 h-5">
                      <span className="flex size-full items-center justify-center rounded-full uppercase select-none bg-white/20 text-white">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-amber-300" aria-hidden="true">
                          <path fill="currentColor" d="M17.991 5.27c1.466-.272 2.314-1.13 2.555-2.575.152 1.392 1.214 2.397 2.533 2.565-1.45.267-2.303 1.12-2.544 2.58a2.862 2.862 0 0 0-.806-1.732 2.887 2.887 0 0 0-1.738-.838ZM1.318 12.877C7.662 11.699 11.332 7.983 12.374 1.73c.657 6.026 5.256 10.375 10.964 11.1C17.063 13.987 13.37 17.68 12.328 24c-.317-2.877-1.45-5.414-3.488-7.499-2.085-2.084-4.6-3.262-7.522-3.624ZM.66 3.434C2.614 3.07 3.745 1.926 4.066 0c.202 1.857 1.62 3.197 3.378 3.42-1.933.356-3.07 1.494-3.392 3.44-.098-.886-.447-1.667-1.075-2.31C2.335 3.909 1.56 3.547.66 3.435Z" />
                        </svg>
                      </span>
                    </span>
                    <div className="h-2 w-12 rounded-full bg-white/20" />
                  </div>

                  {/* Bottom row: Checkmark Icon & Text */}
                  <div className="ml-0.5 flex items-start gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" data-slot="icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="shrink-0 transform-cpu mt-0.5 w-3.5 h-3.5 text-white">
                      <path d="m3.643 13.993 3.51 4.513a1.285 1.285 0 0 0 2.006.038L20.357 4.993" />
                    </svg>
                    <span>{chip.text}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};
