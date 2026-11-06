'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { POPULAR_LOCATIONS, LocationState, getPlacesForLocation } from '@/lib/mockData';
import { Place, RideOption } from '@/types';
import {
  Sparkles,
  MapPin,
  LocateFixed,
  Eye,
  Briefcase,
  Star,
  Compass,
  ArrowRight,
  CheckCircle2,
  Calendar,
  CreditCard,
  Plane,
  Train,
  Car,
  Volume2,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { AuthModal } from '@/components/AuthModal';
import { LocationPickerModal } from '@/components/LocationPickerModal';
import { RideCalculatorModal } from '@/components/RideCalculatorModal';
import { PayPalCheckoutDrawer } from '@/components/PayPalCheckoutDrawer';
import { BookingSuccessModal } from '@/components/BookingSuccessModal';
import { AIChatSidebar } from '@/components/AIChatSidebar';

// Dynamically import SmartMap for the interactive radar preview
const SmartMap = dynamic(() => import('@/components/SmartMap').then((m) => m.SmartMap), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[520px] rounded-3xl bg-slate-900 border border-slate-800 animate-pulse flex items-center justify-center text-slate-400 font-bold text-sm">
      Loading PayNGo Radar Map...
    </div>
  ),
});

export default function WelcomeMindtripPage() {
  const [currentLocation, setCurrentLocation] = useState<LocationState>(POPULAR_LOCATIONS[0]);
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [activeStoryTab, setActiveStoryTab] = useState<'learns' | 'acts' | 'adapts'>('learns');

  // Modals & Drawers
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string | undefined>(undefined);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);

  // Checkout and rides
  const [selectedMapPlace, setSelectedMapPlace] = useState<Place | null>(null);
  const [rideCalcPlace, setRideCalcPlace] = useState<Place | null>(null);
  const [checkoutPlace, setCheckoutPlace] = useState<Place | null>(null);
  const [checkoutRide, setCheckoutRide] = useState<RideOption | null>(null);
  const [successData, setSuccessData] = useState<{
    orderId: string;
    amountUSD: number;
    placeName: string;
  } | null>(null);

  const places = getPlacesForLocation(currentLocation.name, currentLocation.lat, currentLocation.lng, 'all');

  const handleOpenChatWithPrompt = (prompt: string) => {
    setChatInitialPrompt(prompt);
    setIsChatOpen(true);
  };

  const handleOpenCheckout = (place: Place, ride?: RideOption) => {
    setCheckoutPlace(place);
    setCheckoutRide(ride || null);
  };

  const handleBookRideWithPayPal = (ride: RideOption, place: Place) => {
    setCheckoutRide(ride);
    setCheckoutPlace(place);
    setRideCalcPlace(null);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFB] text-slate-900 font-sans selection:bg-black selection:text-white">
      {/* =========================================================================
          1. MINDTRIP-STYLE HEADER
          ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Left Brand */}
          <div className="flex items-center space-x-8">
            <Link href="/welcome" className="flex items-center space-x-2 group">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 flex items-center">
                <span className="text-sky-500 mr-1 text-2xl group-hover:rotate-12 transition-transform">✦</span>
                payngo<span className="text-slate-400">.</span>
              </span>
            </Link>

            {/* Mindtrip Navigation Category Links */}
            <nav className="hidden lg:flex items-center space-x-7 text-xs font-semibold text-slate-600">
              <button
                onClick={() => handleOpenChatWithPrompt('Find top-rated stays near Charminar')}
                className="hover:text-slate-950 transition-colors"
              >
                Stays
              </button>
              <button
                onClick={() => handleOpenChatWithPrompt('Show best morning flights from Hyderabad to Guwahati')}
                className="hover:text-slate-950 transition-colors"
              >
                Flights
              </button>
              <button
                onClick={() => handleOpenChatWithPrompt('Compare Vande Bharat train vs flight fares')}
                className="hover:text-slate-950 transition-colors"
              >
                Trains
              </button>
              <button
                onClick={() => handleOpenChatWithPrompt('Book authentic Old City food walk and Royal Nizam dinner')}
                className="hover:text-slate-950 transition-colors"
              >
                Eats
              </button>
              <button
                onClick={() => handleOpenChatWithPrompt('Top historical experiences in Hyderabad')}
                className="hover:text-slate-950 transition-colors"
              >
                Experiences
              </button>
              <Link href="/dashboard" className="hover:text-slate-950 transition-colors">
                Trips & Passes
              </Link>
            </nav>
          </div>

          {/* Right Action Utilities */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Currency Pill */}
            <button
              onClick={() => setCurrency(currency === 'INR' ? 'USD' : 'INR')}
              className="text-xs font-bold px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-all shadow-sm"
              title="Toggle Currency"
            >
              {currency === 'INR' ? '₹ INR' : '$ USD'}
            </button>

            {/* Live GPS / City Indicator */}
            <button
              onClick={() => setIsLocationPickerOpen(true)}
              className="hidden sm:flex items-center space-x-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100/80 hover:bg-slate-200/80 px-3 py-1.5 rounded-full transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="truncate max-w-[120px]">{currentLocation.name.split(',')[0]}</span>
            </button>

            {/* Login Link */}
            <button
              onClick={() => setIsAuthOpen(true)}
              className="text-xs font-bold text-slate-700 hover:text-slate-950 px-2 transition-colors"
            >
              Log in
            </button>

            {/* Black Rounded CTA Pill (Mindtrip "Set up assistant") */}
            <button
              onClick={() => setIsChatOpen(true)}
              className="bg-black hover:bg-neutral-800 text-white text-xs font-bold px-4 sm:px-5 py-2.5 rounded-full transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Set up assistant</span>
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. EDITORIAL HERO: "Travel that gets you. Booked in one click."
          ========================================================================= */}
      <section className="relative w-full min-h-[640px] lg:min-h-[720px] flex items-center justify-center overflow-hidden bg-slate-950">
        {/* Full-bleed serene aerial turquoise ocean photography */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-85 scale-105 transition-transform duration-1000"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2200&q=85')`,
          }}
        />
        {/* Soft gradient wash for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center text-white space-y-6 pt-12">
          <div className="inline-flex items-center space-x-2 bg-white/15 backdrop-blur-md border border-white/20 text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-xl">
            <span className="text-sky-300">✦</span>
            <span>Personal AI Travel Companion · PayPal Orders API v2</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08]">
            Travel that gets you.
            <br />
            <span className="text-sky-300">Booked in one click.</span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-200 max-w-2xl mx-auto font-normal leading-relaxed">
            Meet PayNGo — the multimodal travel assistant that learns what matters to you, weighs transit tradeoffs in real time, and secures flights, trains, and passes through instant PayPal capture.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => handleOpenChatWithPrompt('Plan a 3-day multimodal trip starting from my live location')}
              className="bg-white hover:bg-slate-100 text-slate-950 font-black text-sm px-8 py-4 rounded-full transition-all shadow-2xl active:scale-95 flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-sky-600" />
              <span>Ask AI to Plan a Trip</span>
            </button>
            <a
              href="#radar-map"
              className="bg-black/60 hover:bg-black/80 text-white font-bold text-sm px-7 py-4 rounded-full backdrop-blur-xl border border-white/20 transition-all shadow-xl flex items-center space-x-2"
            >
              <MapPin className="w-4 h-4 text-sky-400" />
              <span>Explore Live Radar Map</span>
            </a>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. MINDTRIP 4-PILLAR ELEVATED CARDS: "Do more with your travel assistant."
          ========================================================================= */}
      <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
            Do more with your travel assistant.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            Stay ahead, plan, book and explore with help from an assistant that gets how you travel.
          </p>
        </div>

        {/* 4 Clean Elevated Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Sense (Watch) */}
          <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-950">Watch</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Stay ahead with automatic live GPS alerts and nearest transit hub monitoring tailored to your location.
              </p>
            </div>

            {/* Floating Context Pills */}
            <div className="space-y-2.5 pt-8">
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex items-center justify-between shadow-xs">
                <div className="flex items-center space-x-2 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-black">
                    GPS
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">HYD Rajiv Gandhi Intl</p>
                    <p className="text-[10px] text-slate-500">18km away · Terminal 1</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Live
                </span>
              </div>

              <div className="bg-slate-900 text-white rounded-2xl p-3 flex items-center justify-between shadow-md">
                <div className="flex items-center space-x-2">
                  <Car className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-bold">Cab to Airport</span>
                </div>
                <span className="text-xs font-mono font-bold text-sky-300">₹420 est.</span>
              </div>
            </div>
          </div>

          {/* Card 2: Build */}
          <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-950">Build</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Create a trip around how you travel and keep your multimodal itinerary, ideas and bookings all in one place.
              </p>
            </div>

            {/* Floating Itinerary Capsule */}
            <div className="space-y-2.5 pt-8">
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 space-y-1.5 shadow-xs">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span>Guwahati Itinerary</span>
                  <span className="text-sky-600">Day 1</span>
                </div>
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
                  <Plane className="w-3.5 h-3.5 text-sky-600" />
                  <span className="truncate">IndiGo 6E-482 (06:15 AM)</span>
                </div>
                <p className="text-[10px] text-slate-500">Brahmaputra Sunset Cruise @ 5 PM</p>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-900 rounded-2xl p-2.5 text-center text-xs font-bold">
                ✦ 3-Day Plan Synthesized
              </div>
            </div>
          </div>

          {/* Card 3: Book (PayPal v2) */}
          <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Star className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-950">Book</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Find and book flights, stays, and transit with instant checkout via official PayPal Orders API v2.
              </p>
            </div>

            {/* Floating PayPal Capture Capsule */}
            <div className="space-y-2.5 pt-8">
              <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-3 flex items-center justify-between shadow-xs">
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">PayPal Orders v2</span>
                  <p className="text-xs font-black text-slate-900 mt-0.5">₹6,564 / $78.89</p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              </div>

              <button
                onClick={() => handleOpenCheckout(places[0])}
                className="w-full bg-black hover:bg-neutral-800 text-white text-xs font-bold py-2.5 rounded-full transition-all shadow-md flex items-center justify-center space-x-1.5"
              >
                <span>Instant Book</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 4: Explore & Vault */}
          <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-950">Explore</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Discover places, digital boarding passes in your 3D glass wallet, and verified memory photos on the clothesline.
              </p>
            </div>

            {/* Digital Pass Preview */}
            <div className="space-y-2.5 pt-8">
              <div className="bg-slate-900 text-white rounded-2xl p-3 space-y-1 shadow-md">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>PASS: 6E-482</span>
                  <span className="text-emerald-400 font-bold">GATE READY</span>
                </div>
                <p className="text-xs font-bold text-white">IndiGo Flight Pass</p>
                <p className="text-[10px] text-slate-400">Seat 12F · Window · Boarding 05:40 AM</p>
              </div>

              <Link
                href="/dashboard"
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold py-2.5 rounded-full transition-all text-center block"
              >
                Open 3D Vault
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. MINDTRIP TABBED COLOR SHOWCASE: "Learns", "Acts", "Adapts"
          ========================================================================= */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* TAB 1: COBALT BLUE - Learns your style */}
        {activeStoryTab === 'learns' && (
          <div className="rounded-[2.5rem] bg-[#1E3A8A] text-white p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl transition-all duration-500">
            {/* Top Pill Tabs */}
            <div className="flex items-center space-x-2 mb-10">
              <button
                onClick={() => setActiveStoryTab('learns')}
                className="bg-white/20 text-white border border-white/40 text-xs font-bold px-4 py-1.5 rounded-full backdrop-blur-md"
              >
                Learns
              </button>
              <button
                onClick={() => setActiveStoryTab('acts')}
                className="text-white/60 hover:text-white text-xs font-bold px-4 py-1.5 rounded-full transition-colors"
              >
                Acts
              </button>
              <button
                onClick={() => setActiveStoryTab('adapts')}
                className="text-white/60 hover:text-white text-xs font-bold px-4 py-1.5 rounded-full transition-colors"
              >
                Adapts
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Copy */}
              <div className="space-y-6 max-w-lg">
                <h2 className="text-4xl sm:text-6xl font-black tracking-tight leading-none text-white">
                  Learns
                  <br />
                  your style.
                </h2>
                <p className="text-sm sm:text-base text-blue-100 leading-relaxed font-normal">
                  Share what matters to you. Your personal travel assistant remembers whether you prefer non-stop morning flights, AC chair car on Vande Bharat, or hidden culinary gems across Old Hyderabad. And the more you use it, the better it gets.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => handleOpenChatWithPrompt('Remember that I prefer non-stop morning flights with window seats')}
                    className="bg-white hover:bg-blue-50 text-blue-950 font-bold text-xs px-6 py-3 rounded-full transition-all shadow-lg active:scale-95"
                  >
                    Teach Assistant My Style
                  </button>
                </div>
              </div>

              {/* Right Visual Scene with Floating Glass Capsules */}
              <div className="relative min-h-[360px] flex flex-col justify-center space-y-4">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 max-w-xs shadow-xl animate-float">
                  <span className="text-sky-300 mr-2">✦</span>
                  <span className="text-xs font-bold text-white">Non-stop flights under ₹7,000</span>
                </div>

                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 max-w-xs ml-auto shadow-xl">
                  <span className="text-sky-300 mr-2">✦</span>
                  <span className="text-xs font-bold text-white">Window seat with hand luggage</span>
                </div>

                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 max-w-sm shadow-xl">
                  <span className="text-sky-300 mr-2">✦</span>
                  <span className="text-xs font-bold text-white">Authentic Hyderabadi Biryani over fine dining</span>
                </div>

                {/* Voice waveform pill */}
                <div className="absolute -bottom-4 right-4 bg-white/20 backdrop-blur-md rounded-full px-4 py-2 border border-white/30 flex items-center space-x-2">
                  <Volume2 className="w-4 h-4 text-sky-300 animate-pulse" />
                  <span className="text-[10px] font-mono tracking-widest uppercase">VOICE READY</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TERRACOTTA - Works for you */}
        {activeStoryTab === 'acts' && (
          <div className="rounded-[2.5rem] bg-[#9A3412] text-white p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl transition-all duration-500">
            {/* Top Pill Tabs */}
            <div className="flex items-center space-x-2 mb-10">
              <button
                onClick={() => setActiveStoryTab('learns')}
                className="text-white/60 hover:text-white text-xs font-bold px-4 py-1.5 rounded-full transition-colors"
              >
                Learns
              </button>
              <button
                onClick={() => setActiveStoryTab('acts')}
                className="bg-white/20 text-white border border-white/40 text-xs font-bold px-4 py-1.5 rounded-full backdrop-blur-md"
              >
                Acts
              </button>
              <button
                onClick={() => setActiveStoryTab('adapts')}
                className="text-white/60 hover:text-white text-xs font-bold px-4 py-1.5 rounded-full transition-colors"
              >
                Adapts
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Copy */}
              <div className="space-y-6 max-w-lg">
                <h2 className="text-4xl sm:text-6xl font-black tracking-tight leading-none text-white">
                  Works
                  <br />
                  for you.
                </h2>
                <p className="text-sm sm:text-base text-amber-100 leading-relaxed font-normal">
                  PayNGo weighs the tradeoffs between flights, high-speed rail, and cabs — showing only options that fit your schedule and budget. When you're ready, book directly via PayPal Orders v2 or let the AI studio finalize your passes.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => handleOpenChatWithPrompt('Compare flight vs train tradeoffs for Hyderabad to Bangalore')}
                    className="bg-white hover:bg-amber-50 text-amber-950 font-bold text-xs px-6 py-3 rounded-full transition-all shadow-lg active:scale-95"
                  >
                    Compare Live Route Fares
                  </button>
                </div>
              </div>

              {/* Right Visual Tradeoff Comparison */}
              <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Plane className="w-4 h-4 text-sky-300" />
                      <span className="text-xs font-bold">IndiGo Flight (2h 50m)</span>
                    </div>
                    <span className="text-sm font-mono font-bold text-sky-200">₹6,564</span>
                  </div>

                  <div className="py-2 border-y border-white/10 flex items-center justify-center">
                    <span className="bg-white/20 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                      VS
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Train className="w-4 h-4 text-amber-300" />
                      <span className="text-xs font-bold">Vande Bharat Express (8h 15m)</span>
                    </div>
                    <span className="text-sm font-mono font-bold text-amber-200">₹2,100</span>
                  </div>
                </div>

                <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 text-center text-xs font-bold text-white border border-white/10">
                  💳 Verified PayPal Orders API v2 Checkout
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FOREST OLIVE - Keeps you one step ahead */}
        {activeStoryTab === 'adapts' && (
          <div className="rounded-[2.5rem] bg-[#364326] text-white p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl transition-all duration-500">
            {/* Top Pill Tabs */}
            <div className="flex items-center space-x-2 mb-10">
              <button
                onClick={() => setActiveStoryTab('learns')}
                className="text-white/60 hover:text-white text-xs font-bold px-4 py-1.5 rounded-full transition-colors"
              >
                Learns
              </button>
              <button
                onClick={() => setActiveStoryTab('acts')}
                className="text-white/60 hover:text-white text-xs font-bold px-4 py-1.5 rounded-full transition-colors"
              >
                Acts
              </button>
              <button
                onClick={() => setActiveStoryTab('adapts')}
                className="bg-white/20 text-white border border-white/40 text-xs font-bold px-4 py-1.5 rounded-full backdrop-blur-md"
              >
                Adapts
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Copy */}
              <div className="space-y-6 max-w-lg">
                <h2 className="text-4xl sm:text-6xl font-black tracking-tight leading-none text-white">
                  Keeps you
                  <br />
                  one step ahead.
                </h2>
                <p className="text-sm sm:text-base text-emerald-100 leading-relaxed font-normal">
                  Your assistant keeps an eye on the details so you don't have to. From price drops and gate updates to localized rain forecasts and on-trip advice, PayNGo spots opportunities and acts at the right time.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => handleOpenChatWithPrompt('Check my flights for price drops and gate updates')}
                    className="bg-white hover:bg-emerald-50 text-emerald-950 font-bold text-xs px-6 py-3 rounded-full transition-all shadow-lg active:scale-95"
                  >
                    View Active Alerts
                  </button>
                </div>
              </div>

              {/* Right Alert Cards */}
              <div className="space-y-3.5">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-white">IndiGo 6E-482 Price Drop</p>
                    <p className="text-[10px] text-emerald-200">Fare reduced: ₹7,200 ➔ ₹6,564</p>
                  </div>
                  <span className="bg-emerald-400 text-emerald-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                    SAVED 10%
                  </span>
                </div>

                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-xl space-y-1">
                  <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                    ✦ Weather Recommendation
                  </span>
                  <p className="text-xs font-medium text-slate-100">
                    Light rain forecast tomorrow in Guwahati. Replaced outdoor safari with Kamakhya temple museum hall.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* =========================================================================
          5. EMBEDDED RADAR MAP & PLACES GRID (With Grey/Black Glassmorphism Button)
          ========================================================================= */}
      <section id="radar-map" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-sky-600 mb-1">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
              <span>Real-Time Geospatial Radar</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Explore around {currentLocation.name.split(',')[0]}
            </h2>
          </div>

          <button
            onClick={() => setIsChatOpen(true)}
            className="self-start sm:self-auto bg-black hover:bg-neutral-800 text-white text-xs font-bold px-5 py-2.5 rounded-full transition-all shadow-sm flex items-center space-x-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Open Mindtrip AI Studio</span>
          </button>
        </div>

        {/* Smart Map with the Grey and Black Glassmorphic Live Location Button */}
        <SmartMap
          currentLocation={currentLocation}
          places={places}
          selectedPlace={selectedMapPlace}
          onSelectPlace={(p) => {
            setSelectedMapPlace(p);
            setRideCalcPlace(p);
          }}
          onOpenLocationPicker={() => setIsLocationPickerOpen(true)}
          onLocationDetected={(loc) => setCurrentLocation(loc)}
        />
      </section>

      {/* =========================================================================
          6. FOOTER
          ========================================================================= */}
      <footer className="border-t border-slate-200 bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500 font-medium">
          <div className="flex items-center space-x-2">
            <span className="text-sky-600 font-black text-base">✦</span>
            <span className="font-bold text-slate-900">PayNGo Travel</span>
            <span>· Powered by Mindtrip Architecture & PayPal v2</span>
          </div>

          <div className="flex items-center space-x-6">
            <Link href="/" className="hover:text-slate-900 transition-colors">
              Original Home
            </Link>
            <Link href="/dashboard" className="hover:text-slate-900 transition-colors">
              Traveler Dashboard
            </Link>
            <Link href="/explore" className="hover:text-slate-900 transition-colors">
              Explore All Cities
            </Link>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          7. MODALS & SLIDING DRAWERS
          ========================================================================= */}
      {/* AI Agent Chat Sidebar (Mindtrip Studio Mode) */}
      <AIChatSidebar
        isOpen={isChatOpen}
        onClose={() => {
          setIsChatOpen(false);
          setChatInitialPrompt(undefined);
        }}
        selectedCity={currentLocation.name}
        currency={currency}
        onOpenCheckout={handleOpenCheckout}
        initialPrompt={chatInitialPrompt}
      />

      {/* Auth Sliding Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccessLogin={() => setIsAuthOpen(false)}
      />

      {/* Location Picker Modal */}
      {isLocationPickerOpen && (
        <LocationPickerModal
          currentLocation={currentLocation}
          onSelectLocation={(loc) => setCurrentLocation(loc)}
          onClose={() => setIsLocationPickerOpen(false)}
        />
      )}

      {/* Ride Calculator Modal */}
      {rideCalcPlace && (
        <RideCalculatorModal
          place={rideCalcPlace}
          currency={currency}
          onClose={() => setRideCalcPlace(null)}
          onBookRideWithPayPal={handleBookRideWithPayPal}
        />
      )}

      {/* PayPal Checkout Drawer */}
      {checkoutPlace && (
        <PayPalCheckoutDrawer
          place={checkoutPlace}
          rideOption={checkoutRide}
          currency={currency}
          onClose={() => {
            setCheckoutPlace(null);
            setCheckoutRide(null);
          }}
          onSuccess={(orderId, amountUSD, placeName) => {
            setCheckoutPlace(null);
            setCheckoutRide(null);
            setSuccessData({ orderId, amountUSD, placeName });
          }}
        />
      )}

      {/* Booking Success Receipt Modal */}
      {successData && (
        <BookingSuccessModal
          orderId={successData.orderId}
          amountUSD={successData.amountUSD}
          placeName={successData.placeName}
          onClose={() => setSuccessData(null)}
        />
      )}
    </div>
  );
}
