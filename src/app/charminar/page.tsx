'use client';

import React from 'react';
import Link from 'next/link';
import ScrollExpandMedia from '@/components/ui/scroll-expansion-hero';
import { ArrowLeft, Compass, MapPin, Sparkles, Star, ShieldCheck, CreditCard, Landmark } from 'lucide-react';

export default function CharminarHeroPage() {
  // Background Image: Archway framing view with street perspective
  const bgArchwayImage = "https://images.unsplash.com/photo-1572445271230-a78b5944a659?w=1600&auto=format&fit=crop";

  // Expanding Image: Grand full front elevation view of Charminar
  const frontCharminarImage = "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=1600&auto=format&fit=crop";

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans">

      {/* Top Floating Navigation Back Link */}
      <div className="fixed top-4 left-4 z-50 flex items-center space-x-2 glass-panel px-4 py-2 rounded-2xl border border-slate-700/80 shadow-2xl">
        <Link href="/" className="flex items-center space-x-2 text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to PayNGo Discovery</span>
        </Link>
      </div>

      <ScrollExpandMedia
        mediaType="image"
        mediaSrc={frontCharminarImage}
        bgImageSrc={bgArchwayImage}
        title="Charminar Hyderabad"
        date="1591 CE Monument"
        scrollToExpand="Scroll down to expand Charminar"
        textBlend
      >
        <div className="max-w-4xl mx-auto space-y-6 text-slate-200">

          <div className="flex items-center space-x-3">
            <span className="px-3.5 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5">
              <Landmark className="w-3.5 h-3.5 text-amber-400" />
              <span>Iconic Monument • Hyderabad, Telangana</span>
            </span>
            <span className="flex items-center space-x-1 text-xs text-amber-300 font-bold bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>4.9 / 5.0 Rating</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
            The Crown Jewel of <span className="gradient-text-gold">Hyderabad</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Constructed in 1591 CE by Sultan Muhammad Quli Qutb Shah, **Charminar** stands as a magnificent masterpiece of Indo-Islamic architecture. Located on the east bank of the Musi River, it is surrounded by the colorful **Laad Bazaar**, famous for authentic pearl jewelry, attar perfumes, and world-renowned Hyderabadi Dum Biryani.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400 font-semibold">Newcomer Safety Index</div>
              <div className="text-xl font-black text-emerald-400">98% Newcomer Friendly</div>
            </div>
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400 font-semibold">Live Transit Fare</div>
              <div className="text-xl font-black text-sky-400">₹80 (Metro / Rapido)</div>
            </div>
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400 font-semibold">PayPal Acceptance</div>
              <div className="text-xl font-black text-amber-400">Instant Checkout</div>
            </div>
          </div>

          <div className="pt-6 flex flex-wrap gap-4">
            <Link
              href="/route"
              className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm px-7 py-3.5 rounded-2xl shadow-xl shadow-amber-400/20 transition-all flex items-center space-x-2"
            >
              <CreditCard className="w-4 h-4 text-slate-950" />
              <span>Book Trip to Charminar & Pay with PayPal</span>
            </Link>
          </div>

        </div>
      </ScrollExpandMedia>

    </main>
  );
}
