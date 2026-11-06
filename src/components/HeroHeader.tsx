'use client';

import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Navigation, Award, Zap, ShieldCheck, CreditCard, ArrowRight, Utensils } from 'lucide-react';

interface HeroHeaderProps {
  cityName: string;
  onSearchPrompt: (prompt: string) => void;
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
  onOpenChat?: () => void;
}

const BG_VIDEOS = [
  {
    id: 'van',
    src: '/videos/van-portrait.webm',
    title: 'Coastal Van Roadtrip',
  },
  {
    id: 'camels',
    src: '/videos/camels-portrait.webm',
    title: 'Desert Dunes & Camels',
  },
  {
    id: 'float',
    src: '/videos/float-portrait.webm',
    title: 'Turquoise Waters & Coral',
  },
];

export const HeroHeader: React.FC<HeroHeaderProps> = ({
  cityName,
  onSearchPrompt,
  activeCategory,
  onSelectCategory,
  onOpenChat,
}) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  // Auto-cycle through the 3 background videos every 7 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentVideoIndex((prev) => (prev + 1) % BG_VIDEOS.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  // Format city display name
  const formatCityHeadline = (rawName: string) => {
    if (!rawName) return 'India';
    const lower = rawName.toLowerCase();
    if (lower.includes('india')) return 'India';
    let clean = rawName.replace(/\s*\([^)]*\)/g, '');
    if (clean.includes(',')) clean = clean.split(',')[0].trim();
    return clean || 'India';
  };

  const displayCity = formatCityHeadline(cityName);

  const quickPrompts = [
    `Best pure-veg breakfast under ₹300 in ${displayCity}`,
    `Cheapest ride from airport to city center`,
    `Iconic street food & pay with PayPal`,
    `Top newcomer-friendly heritage spots`,
  ];

  const categories = [
    { id: 'all', label: 'All Experiences', icon: Sparkles },
    { id: 'food', label: 'Dining & Cafes', icon: Award },
    { id: 'hotel', label: 'Stays & Hotels', icon: Navigation },
    { id: 'activity', label: 'Attractions & Tours', icon: Zap },
  ];

  return (
    <div className="relative w-full">
      {/* =========================================================================
          1. MINDTRIP PAGE 1 FULL-VIEWPORT HERO (with 3 cycling background videos)
          ========================================================================= */}
      <section className="relative w-full min-h-[85vh] sm:min-h-[90vh] flex flex-col items-center justify-center overflow-hidden bg-white">
        
        {/* 3 Background Videos with Smooth Crossfade */}
        {BG_VIDEOS.map((video, idx) => (
          <div
            key={video.id}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out pointer-events-none ${
              currentVideoIndex === idx ? 'opacity-100 z-0' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover object-center"
            >
              <source src={video.src} type="video/webm" />
            </video>
          </div>
        ))}

        {/* Ambient Top & Bottom Gradients for Mindtrip Typography Contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-white/95 pointer-events-none z-[1]" />

        {/* Main Center Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center pt-8 pb-16 space-y-4">
          
          {/* Main Mindtrip Bold Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-950 tracking-tight leading-[1.08] text-balance">
            Explore India like a local.
          </h1>

          {/* Subheading */}
          <p className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            Pay securely with PayPal.
          </p>

          {/* Subtitle - focused on affordable multi-city travel & easy restaurant booking */}
          <p className="text-sm sm:text-base text-slate-700 font-medium max-w-2xl mx-auto leading-relaxed text-balance pt-1">
            Travel from any place to another at the most affordable prices. Compare live fares across flights, trains, and local cabs, discover top-rated authentic restaurants, and book with ease.
          </p>

          {/* Center Action Buttons */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                const plannerEl = document.getElementById('planner');
                if (plannerEl) {
                  plannerEl.scrollIntoView({ behavior: 'smooth' });
                } else if (onOpenChat) {
                  onOpenChat();
                }
              }}
              className="bg-black hover:bg-neutral-800 text-white text-sm sm:text-base font-bold px-8 sm:px-10 py-4 rounded-full transition-all shadow-xl hover:shadow-2xl active:scale-95 inline-flex items-center space-x-2 cursor-pointer group"
            >
              <span>Plan Affordable Route & Book</span>
              <ArrowRight className="w-4 h-4 text-sky-400 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => onSelectCategory('food')}
              className="bg-white/90 hover:bg-white text-slate-900 border border-slate-300 text-sm sm:text-base font-bold px-7 py-4 rounded-full transition-all shadow-md hover:shadow-lg active:scale-95 inline-flex items-center space-x-2 cursor-pointer backdrop-blur-md"
            >
              <Utensils className="w-4 h-4 text-amber-600" />
              <span>Explore Restaurants</span>
            </button>
          </div>
        </div>

        {/* Bottom Carousel Dot Indicators (Exact Mindtrip . . . dots) */}
        <div className="absolute bottom-6 inset-x-0 flex items-center justify-center space-x-2 z-20">
          {BG_VIDEOS.map((video, idx) => (
            <button
              key={video.id}
              onClick={() => setCurrentVideoIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                currentVideoIndex === idx
                  ? 'w-7 bg-black'
                  : 'w-2 bg-black/35 hover:bg-black/60'
              }`}
              title={video.title}
              aria-label={`Switch to video slide ${idx + 1}: ${video.title}`}
            />
          ))}
        </div>
      </section>

      {/* =========================================================================
          2. INTEGRATED SEARCH BAR, PROMPTS & CATEGORIES SECTION (Smooth Transition)
          ========================================================================= */}
      <section className="relative z-20 bg-white border-b border-slate-200/80 pt-6 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Quick Metrics Bar - Focused on Affordable Travel & Dining */}
          <div className="mb-6 flex flex-wrap justify-center items-center gap-3 text-xs font-semibold text-slate-700">
            <span className="flex items-center space-x-1.5 bg-slate-50 px-3.5 py-1.5 rounded-full border border-slate-200/80 shadow-xs">
              <Navigation className="w-4 h-4 text-blue-600" />
              <span>Affordable Multi-Modal Travel (Flight · Train · Cab)</span>
            </span>
            <span className="flex items-center space-x-1.5 bg-slate-50 px-3.5 py-1.5 rounded-full border border-slate-200/80 shadow-xs">
              <Utensils className="w-4 h-4 text-amber-600" />
              <span>Authentic Restaurants & Easy Booking</span>
            </span>
            <span className="flex items-center space-x-1.5 bg-slate-50 px-3.5 py-1.5 rounded-full border border-slate-200/80 shadow-xs">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>Instant PayPal Checkout</span>
            </span>
          </div>

          {/* Search Input Bar */}
          <div className="max-w-2xl mx-auto mb-6">
            <div className="relative flex items-center bg-white border border-slate-300 rounded-full shadow-lg p-2 transition-all hover:border-slate-500 hover:shadow-xl">
              <Search className="w-5 h-5 text-slate-400 ml-4 shrink-0" />
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
                className="bg-black hover:bg-neutral-800 text-white font-bold text-xs px-5 py-2.5 rounded-full transition-all shrink-0 flex items-center space-x-1.5 shadow-sm active:scale-95"
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
                  className="text-[11px] font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-full px-3.5 py-1.5 transition-all shadow-xs"
                >
                  ⚡ {p}
                </button>
              ))}
            </div>
          </div>

          {/* Category Selector Tabs */}
          <div className="flex overflow-x-auto whitespace-nowrap pb-2 scrollbar-none sm:justify-center items-center gap-2 pt-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`flex shrink-0 items-center space-x-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-black text-white shadow-md border border-black'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-slate-500'}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

        </div>
      </section>
    </div>
  );
};
