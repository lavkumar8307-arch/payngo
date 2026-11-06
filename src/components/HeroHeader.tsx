'use client';

import React from 'react';
import { Search, Sparkles, Navigation, Award, Zap, ShieldCheck, CreditCard } from 'lucide-react';

interface HeroHeaderProps {
  cityName: string;
  onSearchPrompt: (prompt: string) => void;
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
}

export const HeroHeader: React.FC<HeroHeaderProps> = ({
  cityName,
  onSearchPrompt,
  activeCategory,
  onSelectCategory,
}) => {
  // Format city display name to be natural and elegant
  const formatCityHeadline = (rawName: string) => {
    if (!rawName) return 'India';
    const lower = rawName.toLowerCase();
    if (lower.includes('india')) {
      return 'India';
    }
    // Remove parenthesized notes like (Top Destinations), (Madikeri), etc.
    let clean = rawName.replace(/\s*\([^)]*\)/g, '');
    // Remove state name after comma
    if (clean.includes(',')) {
      clean = clean.split(',')[0].trim();
    }
    return clean || 'India';
  };

  const displayCity = formatCityHeadline(cityName);

  const quickPrompts = [
    `Best pure-veg breakfast under ₹300 in ${displayCity}`,
    `Cheapest ride from airport to city center`,
    `Iconic street food & pay with PayPal`,
    `Top newcomer-friendly heritage spots`
  ];

  const categories = [
    { id: 'all', label: 'All Experiences', icon: Sparkles },
    { id: 'food', label: 'Dining & Cafes', icon: Award },
    { id: 'hotel', label: 'Stays & Hotels', icon: Navigation },
    { id: 'activity', label: 'Attractions & Tours', icon: Zap },
  ];

  return (
    <div className="relative overflow-hidden pt-10 pb-12 border-b border-slate-200/80 min-h-[580px] flex flex-col justify-center">

      {/* 1. Cinematic Background Video (exact Mindtrip style uploaded by user) */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover pointer-events-none scale-105"
      >
        <source src="/videos/hero-background.mp4" type="video/mp4" />
      </video>

      {/* 2. Soft Ambient Contrast Overlay for Pristine Readability */}
      <div className="absolute inset-0 bg-white/45 backdrop-blur-[1.5px] pointer-events-none" />

      {/* 3. Bottom Faded Effect (dissolves cleanly into the white page below) */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-50 via-slate-50/85 to-transparent pointer-events-none z-[1]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Title Tagline */}
        <div className="text-center max-w-4xl mx-auto mb-8">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-blue-200/70 text-xs text-blue-900 font-bold mb-4 shadow-sm">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>AI Travel Companion • India Smart Discovery</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-tight text-balance drop-shadow-xs">
            Explore <span className="text-blue-600">{displayCity}</span> like a local.
          </h1>
          <p className="mt-2 text-lg sm:text-xl font-bold text-slate-800">
            Pay securely with PayPal.
          </p>

          <p className="mt-3 text-sm sm:text-base text-slate-700 font-medium max-w-2xl mx-auto text-balance">
            New in town? Discover trusted local spots, estimated fares from Rapido & Uber, and seamless agentic bookings with instant PayPal checkout.
          </p>

          {/* Quick Metrics Bar (Traveller Benefits) */}
          <div className="mt-6 flex flex-wrap justify-center items-center gap-3 text-xs font-semibold text-slate-800">
            <span className="flex items-center space-x-1.5 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/70 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Trusted Local Picks</span>
            </span>
            <span className="flex items-center space-x-1.5 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/70 shadow-sm">
              <Navigation className="w-4 h-4 text-blue-600" />
              <span>Compare Local Fares</span>
            </span>
            <span className="flex items-center space-x-1.5 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/70 shadow-sm">
              <CreditCard className="w-4 h-4 text-amber-600" />
              <span>Secure PayPal Checkout</span>
            </span>
          </div>
        </div>

        {/* Quick Search & AI Prompt Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative flex items-center bg-white/95 backdrop-blur-md border border-white/80 rounded-2xl shadow-xl p-2 transition-all hover:border-blue-400 hover:shadow-2xl">
            <Search className="w-5 h-5 text-slate-500 ml-3 shrink-0" />
            <input
              type="text"
              placeholder={`Ask AI: "Find authentic dinner under ₹400 in ${displayCity} and book"`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value) {
                  onSearchPrompt(e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
              className="w-full bg-transparent text-slate-900 placeholder-slate-500 text-sm px-3 focus:outline-none font-medium"
            />
            <button
              onClick={() => onSearchPrompt(`Find top newcomer friendly places in ${displayCity}`)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shrink-0 flex items-center space-x-1.5 shadow-md active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 fill-white" />
              <span>Ask AI</span>
            </button>
          </div>

          {/* Quick Prompt Pills */}
          <div className="mt-3.5 flex flex-wrap justify-center gap-2">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => onSearchPrompt(p)}
                className="text-[11px] font-medium bg-white/85 hover:bg-white text-slate-800 border border-white/60 backdrop-blur-md rounded-xl px-3 py-1.5 transition-all shadow-sm hover:shadow"
              >
                ⚡ {p}
              </button>
            ))}
          </div>
        </div>

        {/* Category Selector Tabs */}
        <div className="flex overflow-x-auto whitespace-nowrap pb-2 scrollbar-none sm:justify-center items-center gap-2 border-t border-slate-200/60 pt-5">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex shrink-0 items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 border border-blue-500'
                    : 'bg-white/85 hover:bg-white text-slate-700 backdrop-blur-md border border-white/60 shadow-sm'
                  }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-slate-500'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};
