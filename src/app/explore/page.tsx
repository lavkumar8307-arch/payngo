'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import IntroAnimation from '@/components/ui/scroll-morph-hero';
import { POPULAR_LOCATIONS, LocationState } from '@/lib/mockData';

export default function ExploreMorphHeroPage() {
  const [currentLocation, setCurrentLocation] = useState<LocationState>(POPULAR_LOCATIONS[0]);
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');

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
