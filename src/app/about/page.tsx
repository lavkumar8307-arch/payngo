'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { POPULAR_LOCATIONS, LocationState } from '@/lib/mockData';
import {
  ShieldCheck,
  Sparkles,
  Code2,
  Cpu,
  Globe,
  CreditCard,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export default function AboutPage() {
  const [currentLocation, setCurrentLocation] = useState<LocationState>(POPULAR_LOCATIONS[0]);
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar
        currentLocation={currentLocation}
        onOpenLocationPicker={() => { }}
        currency={currency}
        onCurrencyToggle={() => setCurrency(currency === 'INR' ? 'USD' : 'INR')}
        onOpenChat={() => { }}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-10 space-y-10">

        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        {/* Hero */}
        <div className="space-y-3">
          <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 border border-blue-200 px-3.5 py-1 rounded-full text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Architecture & Technology Stack</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight text-balance">
            About PayNGo
          </h1>
          <p className="text-slate-600 max-w-2xl text-base text-balance font-normal">
            An intelligent AI-first travel companion built for the PayPal AI Hackathon 2026. PayNGo bridges local Indian transport discovery, real-time fare estimation, and agentic booking workflows with guaranteed PayPal checkout.
          </p>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-black text-slate-900">PayPal Orders API v2</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Full server-side order creation and client capture flow using PayPal&apos;s sandbox environment. Supports USD conversion rates with dynamic line-item breakdowns, tax computations, and instant automated receipts.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-black text-slate-900">AI Trip Planner & Natural Language Search</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Powered by Google Gemini 2.5 Flash with fallback conversational routing. Generates realistic day-by-day itineraries with estimated budgets, customizable parameters, and direct checkout capability.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Esri HD Maps & Geolocation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Interactive high-definition Leaflet maps powered by ArcGIS Esri World Street and Satellite layers. Seamless location switching across India from Ghatkesar to Goa, Delhi, Mumbai, and Jaipur.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-700">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Modern Next.js 14 Stack</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Built with Next.js 14 App Router, TypeScript, Tailwind CSS, and Framer Motion. Zero watermarked tiles, clean typography with balanced headings, and accessible responsive layouts.
            </p>
          </div>

        </div>

      </main>
    </div>
  );
}
