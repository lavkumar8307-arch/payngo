'use client';

import React from 'react';
import { ArrowRight, Plane, Building2, Sparkles, Navigation, TrendingDown } from 'lucide-react';

export const MindtripAdaptsSection: React.FC = () => {
  const scrollToLearns = () => {
    const el = document.getElementById('learns-showcase');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToActs = () => {
    const el = document.getElementById('acts-showcase');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToPlanner = () => {
    const el = document.getElementById('planner');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="adapts-showcase" className="w-full py-6 sm:py-10 bg-white scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Olive / Forest Green Feature Card for Adapts */}
        <div className="relative w-full rounded-[2.5rem] bg-[#344119] overflow-hidden shadow-2xl min-h-[580px] lg:min-h-[640px] flex flex-col justify-between p-6 sm:p-12 lg:p-16 border border-lime-950/40">
          
          {/* Background Video (Adapts.webm - Woman on lawn with palm shadows) */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <video
              key="adapts-video"
              autoPlay
              loop
              muted
              playsInline
              className="absolute right-0 top-0 w-full h-full object-cover object-right lg:object-center opacity-85"
            >
              <source src="/videos/Adapts.webm" type="video/webm" />
            </video>

            {/* Gradient Overlays: Left solid moss fade for high contrast typography */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#344119] via-[#344119]/90 to-transparent lg:w-3/5" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#344119]/80 via-transparent to-transparent" />
          </div>

          {/* Top Switcher Tabs: [Learns] [Acts] [Adapts (Active)] */}
          <div className="relative z-20 flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={scrollToLearns}
              className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold text-white/60 hover:text-white hover:bg-white/10 border border-transparent transition-all cursor-pointer"
            >
              Learns
            </button>
            <button
              onClick={scrollToActs}
              className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold text-white/60 hover:text-white hover:bg-white/10 border border-transparent transition-all cursor-pointer"
            >
              Acts
            </button>
            <button
              className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold bg-white/15 text-white border border-white/50 backdrop-blur-md shadow-inner cursor-pointer"
            >
              Adapts
            </button>
          </div>

          {/* Left Content Area */}
          <div className="relative z-20 max-w-xl py-8 sm:py-12 space-y-5">
            {/* Big Headline in Pale Creamy Sage */}
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black text-[#e4f49c] tracking-tight leading-[1.02]">
              Keeps you
              <br />
              one step
              <br />
              ahead.
            </h2>

            {/* Subtitle / Description */}
            <p className="text-white/85 text-sm sm:text-base lg:text-lg leading-relaxed font-normal max-w-lg">
              Keeps an eye on the details so you don&apos;t have to. From live transit fare drops across flights and trains to restaurant table openings and on-trip advice, PayNGo helps you travel affordably and book with ease using PayPal.
            </p>

            {/* Action Buttons */}
            <div className="pt-3 flex flex-wrap items-center gap-3">
              <button
                onClick={scrollToPlanner}
                className="inline-flex items-center space-x-2.5 bg-[#e4f49c] text-slate-950 hover:bg-[#d8ea8b] font-bold text-xs sm:text-sm px-7 py-3.5 rounded-full shadow-lg transition-all active:scale-95 group cursor-pointer"
              >
                <TrendingDown className="w-4 h-4 text-emerald-800" />
                <span>Track Live Route Price Drops</span>
                <ArrowRight className="w-4 h-4 text-slate-700 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Floating UI Cards Floating over the Scene (Exact Mindtrip Layout) */}
          <div className="absolute inset-0 pointer-events-none z-20 hidden md:block">
            
            {/* Card 1: Flight Price Drop Card (Top Left of video area) */}
            <div className="absolute top-8 right-56 lg:top-10 lg:right-[26rem] transition-all duration-500">
              <div
                style={{ animationDelay: '0.2s' }}
                className="w-48 sm:w-56 animate-float1 flex flex-col gap-2 rounded-2xl p-3.5 text-xs font-semibold backdrop-blur-xl bg-black/50 border border-white/20 text-white shadow-2xl pointer-events-auto hover:bg-black/65 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-blue-600/80 border border-white/20 flex items-center justify-center shrink-0">
                    <Plane className="w-4 h-4 text-white" />
                  </div>
                  <div className="h-1.5 w-10 rounded-full bg-white/20" />
                </div>
                <div className="mt-1 space-y-0.5">
                  <div className="text-xs font-bold text-white flex items-center space-x-1">
                    <span>SFO-LAX</span>
                  </div>
                  <div className="text-[11px] text-white/70">22 - 24 Sept · Roundtrip</div>
                  <div className="text-xs pt-1 flex items-center space-x-1.5">
                    <span className="line-through text-white/45">$598</span>
                    <span className="text-emerald-400 font-bold">$389</span>
                    <span className="text-[10px] text-emerald-400 font-medium">· Price drop</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Hotel Price Drop Card (Top Right of video area) */}
            <div className="absolute top-16 right-6 lg:top-20 lg:right-16 transition-all duration-500">
              <div
                style={{ animationDelay: '1.2s' }}
                className="w-48 sm:w-56 animate-float1 flex flex-col gap-2 rounded-2xl p-3.5 text-xs font-semibold backdrop-blur-xl bg-black/50 border border-white/20 text-white shadow-2xl pointer-events-auto hover:bg-black/65 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-amber-600/80 border border-white/20 flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4 text-white" />
                  </div>
                  <div className="h-1.5 w-10 rounded-full bg-white/20" />
                </div>
                <div className="mt-1 space-y-0.5">
                  <div className="text-xs font-bold text-white flex items-center space-x-1">
                    <span>Hotel Stay</span>
                  </div>
                  <div className="text-[11px] text-white/70">17 - 21 Sept · 4 nights</div>
                  <div className="text-xs pt-1 flex items-center space-x-1.5">
                    <span className="line-through text-white/45">$398</span>
                    <span className="text-emerald-400 font-bold">$289</span>
                    <span className="text-[10px] text-emerald-400 font-medium">· Price drop</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Contextual Weather & Local Advice Card (Mid-Bottom Right) */}
            <div className="absolute bottom-20 right-14 lg:bottom-24 lg:right-28 transition-all duration-500">
              <div
                style={{ animationDelay: '2s' }}
                className="w-64 sm:w-72 animate-float1 flex flex-col gap-2 rounded-2xl p-4 text-xs font-medium backdrop-blur-xl bg-black/55 border border-white/20 text-white shadow-2xl pointer-events-auto hover:bg-black/70 transition-all"
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                  </div>
                  <span className="text-xs font-bold text-white">Smart Travel Radar</span>
                </div>
                <p className="text-xs text-white/90 leading-snug">
                  Hey Elsa, looks like rain tomorrow. Here are top-rated covered street food markets &amp; museum stops nearby.
                </p>
                <div className="space-y-1.5 pt-1">
                  <div className="h-1.5 w-full rounded-full bg-white/15" />
                  <div className="h-1.5 w-3/4 rounded-full bg-white/10" />
                </div>
              </div>
            </div>

            {/* Voice Waveform Floating Button (Bottom Right) */}
            <div className="absolute bottom-6 right-8 lg:bottom-10 lg:right-12">
              <div className="w-14 h-14 rounded-full bg-white/25 backdrop-blur-2xl border border-white/40 shadow-2xl flex items-center justify-center space-x-1 hover:scale-105 active:scale-95 transition-transform cursor-pointer pointer-events-auto">
                <span className="w-1 h-3.5 bg-white rounded-full animate-pulse" />
                <span className="w-1 h-6 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.15s' }} />
                <span className="w-1 h-4 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
                <span className="w-1 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.45s' }} />
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

