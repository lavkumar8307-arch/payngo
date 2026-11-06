'use client';

import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

interface ShowcaseTab {
  id: 'learns' | 'acts' | 'adapts';
  label: string;
  titleWhite: string;
  titleAccent: string;
  accentColor: string;
  description: string;
  chips: {
    text: string;
    positionClass: string;
  }[];
}

const TABS: ShowcaseTab[] = [
  {
    id: 'learns',
    label: 'Learns',
    titleWhite: 'Learns',
    titleAccent: 'your style.',
    accentColor: 'text-[#fbcfe8]', // Soft blush pink from Mindtrip reference
    description:
      'Share what matters to you. PayNGo remembers your travel budget, preferred transit modes, and dining tastes — from famous heritage street stalls to pure-veg thalis and scenic family-friendly spots.',
    chips: [
      {
        text: 'Foodie spots, but kid-friendly',
        positionClass: 'top-8 right-6 lg:top-10 lg:right-28',
      },
      {
        text: 'Street food over fine dining',
        positionClass: 'top-36 right-4 lg:top-40 lg:right-8',
      },
      {
        text: 'Local gems only',
        positionClass: 'bottom-8 right-8 lg:bottom-12 lg:right-36',
      },
    ],
  },
  {
    id: 'acts',
    label: 'Acts',
    titleWhite: 'Acts',
    titleAccent: 'in real-time.',
    accentColor: 'text-[#fed7aa]', // Warm peach accent
    description:
      'Compare live fares across flights, trains, and local cabs at the lowest prices. Instantly book tables at verified authentic restaurants and secure your route with zero wait time.',
    chips: [
      {
        text: 'Lowest fare: Flight vs Express Train',
        positionClass: 'top-8 right-6 lg:top-10 lg:right-28',
      },
      {
        text: 'Table reserved · Karim\'s Old Delhi · 8 PM',
        positionClass: 'top-36 right-4 lg:top-40 lg:right-8',
      },
      {
        text: 'Airport cab ready · ₹180 live fare',
        positionClass: 'bottom-8 right-8 lg:bottom-12 lg:right-36',
      },
    ],
  },
  {
    id: 'adapts',
    label: 'Adapts',
    titleWhite: 'Adapts',
    titleAccent: 'to every trip.',
    accentColor: 'text-[#bfdbfe]', // Soft sky accent
    description:
      'Pay seamlessly with PayPal across every ride, train ticket, and restaurant bill. Enjoy 100% buyer protection, automated INR/USD conversion, and unified digital receipts.',
    chips: [
      {
        text: '100% PayPal Buyer Protection',
        positionClass: 'top-8 right-6 lg:top-10 lg:right-28',
      },
      {
        text: 'Live currency auto-switch (INR ⇄ USD)',
        positionClass: 'top-36 right-4 lg:top-40 lg:right-8',
      },
      {
        text: 'Instant digital invoice & itinerary sync',
        positionClass: 'bottom-8 right-8 lg:bottom-12 lg:right-36',
      },
    ],
  },
];

export const MindtripShowcaseSection: React.FC = () => {
  const [activeTabId, setActiveTabId] = useState<'learns' | 'acts' | 'adapts'>('learns');

  const activeTab = TABS.find((t) => t.id === activeTabId) || TABS[0];
  const videoSrc = activeTabId === 'acts' ? '/videos/Acts.webm' : '/videos/Learn.webm';

  const handleTabClick = (tabId: 'learns' | 'acts' | 'adapts') => {
    setActiveTabId(tabId);
    if (tabId === 'acts') {
      const actsEl = document.getElementById('acts-showcase');
      if (actsEl) actsEl.scrollIntoView({ behavior: 'smooth' });
    } else if (tabId === 'adapts') {
      const adaptsEl = document.getElementById('adapts-showcase');
      if (adaptsEl) adaptsEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="learns-showcase" className="w-full py-8 sm:py-12 bg-white scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Blue Showcase Card */}
        <div className="relative w-full rounded-[2.5rem] bg-[#1a388b] overflow-hidden shadow-2xl min-h-[580px] lg:min-h-[640px] flex flex-col justify-between p-6 sm:p-12 lg:p-16 border border-blue-900/40">
          
          {/* Background Video (Right / Full Cover with Soft Left Blue Fade) */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <video
              key={videoSrc}
              autoPlay
              loop
              muted
              playsInline
              className="absolute right-0 top-0 w-full h-full object-cover object-right lg:object-center opacity-85 transition-opacity duration-700"
            >
              <source src={videoSrc} type="video/webm" />
            </video>

            {/* Gradient Overlays: Ensure crisp left contrast for typography & smooth transition */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#1a388b] via-[#1a388b]/90 to-transparent lg:w-3/5" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a388b]/80 via-transparent to-transparent" />
          </div>

          {/* Top Switcher Tabs: [Learns] [Acts] [Adapts] */}
          <div className="relative z-20 flex items-center space-x-2 sm:space-x-3">
            {TABS.map((tab) => {
              const isActive = tab.id === activeTabId;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`px-5 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-white/15 text-white border border-white/50 backdrop-blur-md shadow-inner'
                      : 'text-white/60 hover:text-white hover:bg-white/10 border border-transparent'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Left Hero Content Area */}
          <div className="relative z-20 max-w-xl py-8 sm:py-12 space-y-5">
            {/* Big Headline */}
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.02]">
              {activeTab.titleWhite}
              <br />
              <span className={activeTab.accentColor}>{activeTab.titleAccent}</span>
            </h2>

            {/* Subtitle / Description */}
            <p className="text-white/85 text-sm sm:text-base lg:text-lg leading-relaxed font-normal max-w-lg">
              {activeTab.description}
            </p>

            {/* Action pill / indicator */}
            <div className="pt-2">
              <a
                href="#planner"
                className="inline-flex items-center space-x-2.5 bg-white text-slate-950 hover:bg-white/90 font-bold text-xs sm:text-sm px-6 py-3 rounded-full shadow-lg transition-all active:scale-95 group"
              >
                <span>Try Affordable Multi-Modal Planner</span>
                <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

          {/* Floating Glassmorphism Cards Floating over the Scene (Styled exactly as requested) */}
          <div className="absolute inset-0 pointer-events-none z-20 hidden md:block">
            {activeTab.chips.map((chip, idx) => (
              <div
                key={`${activeTabId}-${idx}`}
                className={`absolute ${chip.positionClass} transition-all duration-500 ease-out`}
              >
                <div
                  style={{ animationDelay: `${idx * 0.8}s` }}
                  className="flex w-[20em] sm:w-[21em] max-w-[90vw] animate-float1 flex-col gap-2 rounded-3xl px-4 py-2.5 text-xs font-semibold backdrop-blur-xl bg-black/45 border border-white/20 text-white sm:px-5 sm:py-3 sm:text-sm shadow-2xl pointer-events-auto hover:bg-black/60 transition-all"
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
