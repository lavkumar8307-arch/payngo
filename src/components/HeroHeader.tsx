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
    <div className="relative overflow-hidden bg-slate-50 pt-8 pb-8 border-b border-slate-200/80">

      {/* Soft Light Ambient Mesh Gradient Glow Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-300/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-10 right-1/4 w-96 h-96 bg-indigo-300/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Title Tagline */}
        <div className="text-center max-w-4xl mx-auto mb-8">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs text-blue-800 font-semibold mb-4 shadow-sm">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>AI Travel Companion • India Smart Discovery</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight text-balance">
            Explore <span className="text-blue-600">{displayCity}</span> like a local.
          </h1>
          <p className="mt-2 text-lg sm:text-xl font-medium text-slate-700">
            Pay securely with PayPal.
          </p>

          <p className="mt-3 text-sm sm:text-base text-slate-600 font-normal max-w-2xl mx-auto text-balance">
            New in town? Discover trusted local spots, estimated fares from Rapido & Uber, and seamless agentic bookings with instant PayPal checkout.
          </p>

          {/* Quick Metrics Bar (Traveller Benefits) */}
          <div className="mt-6 flex flex-wrap justify-center items-center gap-3 text-xs font-semibold text-slate-700">
            <span className="flex items-center space-x-1.5 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Trusted Local Picks</span>
            </span>
            <span className="flex items-center space-x-1.5 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-sm">
              <Navigation className="w-4 h-4 text-blue-600" />
              <span>Compare Local Fares</span>
            </span>
            <span className="flex items-center space-x-1.5 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-sm">
              <CreditCard className="w-4 h-4 text-amber-600" />
              <span>Secure PayPal Checkout</span>
            </span>
          </div>
        </div>

        {/* Quick Search & AI Prompt Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative flex items-center bg-white border border-slate-300 rounded-2xl shadow-lg p-2 transition-all hover:border-blue-500">
            <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
            <input
              type="text"
              placeholder={`Ask AI: "Find authentic dinner under ₹400 in ${displayCity} and book"`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value) {
                  onSearchPrompt(e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
              className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-sm px-3 focus:outline-none font-medium"
            />
            <button
              onClick={() => onSearchPrompt(`Find top newcomer friendly places in ${displayCity}`)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shrink-0 flex items-center space-x-1.5 shadow-md"
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
                className="text-[11px] font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl px-3 py-1.5 transition-all shadow-sm"
              >
                ⚡ {p}
              </button>
            ))}
          </div>
        </div>

        {/* Category Selector Tabs */}
        <div className="flex overflow-x-auto whitespace-nowrap pb-2 scrollbar-none sm:justify-center items-center gap-2 border-t border-slate-200 pt-5">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex shrink-0 items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 border border-blue-500'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
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
