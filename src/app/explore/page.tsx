'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import IntroAnimation from '@/components/ui/scroll-morph-hero';
import { POPULAR_LOCATIONS, LocationState } from '@/lib/mockData';
import { getSavedLocation } from '@/lib/location';

export default function ExploreMorphHeroPage() {
  const [currentLocation, setCurrentLocation] = useState<LocationState>(POPULAR_LOCATIONS[0]);
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');

  useEffect(() => {
    const saved = getSavedLocation();
    if (saved) setCurrentLocation(saved);
  }, []);

  return (
    <div className="w-full h-screen bg-white flex flex-col overflow-hidden font-sans">
      <Navbar
        currentLocation={currentLocation}
        onOpenLocationPicker={() => {}}
        currency={currency}
        onCurrencyToggle={() => setCurrency(currency === 'INR' ? 'USD' : 'INR')}
        onOpenChat={() => {}}
      />

      {/* Scroll Morph Hero Component */}
      <main className="flex-1 w-full h-full relative overflow-hidden">
        <IntroAnimation />
      </main>
    </div>
  );
}
