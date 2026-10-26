'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { POPULAR_LOCATIONS, LocationState, getPlacesForLocation } from '@/lib/mockData';
import { Place, RideOption } from '@/types';
import { Navbar } from '@/components/Navbar';
import dynamic from 'next/dynamic';
import { HeroHeader } from '@/components/HeroHeader';
import { TripPlannerWidget } from '@/components/TripPlannerWidget';
import { PlaceCard } from '@/components/PlaceCard';

const SmartMap = dynamic(() => import('@/components/SmartMap').then((m) => m.SmartMap), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[520px] rounded-3xl bg-slate-100 border border-slate-200 animate-pulse flex items-center justify-center text-slate-400 font-bold text-sm">
      Loading Interactive Discovery Radar...
    </div>
  ),
});
import { LocationPickerModal } from '@/components/LocationPickerModal';
import { RideCalculatorModal } from '@/components/RideCalculatorModal';
import { PayPalCheckoutDrawer } from '@/components/PayPalCheckoutDrawer';
import { BookingSuccessModal } from '@/components/BookingSuccessModal';
import { AIChatSidebar } from '@/components/AIChatSidebar';
import { InterCityPlanner } from '@/components/InterCityPlanner';
import { CommunityTravelMoments } from '@/components/CommunityTravelMoments';
import { TechStackFooter } from '@/components/TechStackFooter';
import { AuthModal } from '@/components/AuthModal';
import { Sparkles, MapPin, LocateFixed } from 'lucide-react';

export default function Home() {
  const [currentLocation, setCurrentLocation] = useState<LocationState>(POPULAR_LOCATIONS[0]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');

  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedMapPlace, setSelectedMapPlace] = useState<Place | null>(null);

  // Modals & Drawers state
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [rideCalcPlace, setRideCalcPlace] = useState<Place | null>(null);
  const [checkoutPlace, setCheckoutPlace] = useState<Place | null>(null);
  const [checkoutRide, setCheckoutRide] = useState<RideOption | null>(null);
  const [successData, setSuccessData] = useState<{ orderId: string; amountUSD: number; placeName: string } | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const list = getPlacesForLocation(currentLocation.name, currentLocation.lat, currentLocation.lng, activeCategory);
    setPlaces(list);
    if (list.length > 0) {
      setSelectedMapPlace(list[0]);
    }
  }, [currentLocation, activeCategory]);

  const handleOpenRideCalc = (place: Place) => {
    setRideCalcPlace(place);
  };

  const handleOpenCheckout = (place: Place, ride?: RideOption) => {
    setCheckoutPlace(place);
    setCheckoutRide(ride || null);
  };

  const handleBookRideWithPayPal = (ride: RideOption, place: Place) => {
    setRideCalcPlace(null);
    handleOpenCheckout(place, ride);
  };

  const [chatInitialPrompt, setChatInitialPrompt] = useState<string | undefined>(undefined);

  const handleSearchPrompt = (prompt: string) => {
    setChatInitialPrompt(prompt);
    setIsChatOpen(true);
  };

  return (
    <main className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">

      {/* Top Navbar */}
      <Navbar
        currentLocation={currentLocation}
        onOpenLocationPicker={() => setIsLocationPickerOpen(true)}
        currency={currency}
        onCurrencyToggle={() => setCurrency((prev) => (prev === 'INR' ? 'USD' : 'INR'))}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenCompare={() => handleOpenRideCalc(selectedMapPlace || places[0])}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Hero Header & Search Bar */}
      <HeroHeader
        cityName={currentLocation.name}
        onSearchPrompt={handleSearchPrompt}
        activeCategory={activeCategory}
        onSelectCategory={(cat) => setActiveCategory(cat)}
      />

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 w-full flex-1 space-y-10">

        {/* Uber/Ola Style Connected Trip Planner Widget (Start -> Destination) */}
        <TripPlannerWidget
          currentLocation={currentLocation}
          onSelectStartLocation={(loc) => setCurrentLocation(loc)}
          onSelectDestination={(place) => {
            setSelectedMapPlace(place);
            handleOpenRideCalc(place);
          }}
          onOpenRideCalculator={handleOpenRideCalc}
        />

        {/* Radar Map & Discovery Grid */}
        <section id="explore" className="space-y-6 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center space-x-2 tracking-tight">
                {currentLocation.isGPS ? (
                  <LocateFixed className="w-5 h-5 text-emerald-600 animate-pulse" />
                ) : (
                  <MapPin className="w-5 h-5 text-sky-600" />
                )}
                <span>Top places nearby ({currentLocation.name})</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Showing top verified places ranked by newcomer friendliness, safety scores, and live transit fares.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Link
                href="/explore"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Rotate 3D View</span>
              </Link>
              <button
                onClick={() => setIsLocationPickerOpen(true)}
                className="bg-white hover:bg-slate-100 border border-slate-200 text-sky-700 font-bold text-xs px-3.5 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 shadow-sm"
              >
                <LocateFixed className="w-3.5 h-3.5 text-sky-600" />
                <span>Change / Live Location</span>
              </button>
            </div>
          </div>

          {/* Interactive Map */}
          <SmartMap
            currentLocation={currentLocation}
            places={places}
            selectedPlace={selectedMapPlace}
            onSelectPlace={(p) => {
              setSelectedMapPlace(p);
              handleOpenRideCalc(p);
            }}
            onOpenLocationPicker={() => setIsLocationPickerOpen(true)}
          />

          {/* Places Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {places.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                currency={currency}
                onOpenRideCalculator={handleOpenRideCalc}
                onOpenPayPalCheckout={handleOpenCheckout}
                onSelectMap={(p) => setSelectedMapPlace(p)}
              />
            ))}
          </div>
        </section>

        {/* Inter-City Travel Planner Section */}
        <section id="planner" className="pt-6 scroll-mt-24">
          <InterCityPlanner
            currency={currency}
            onBookPlanWithPayPal={(p) => handleOpenCheckout(p)}
          />
        </section>

        {/* Live Community Traveler Photos & Polaroid Line Carousel */}
        <section id="community" className="pt-6 scroll-mt-24">
          <CommunityTravelMoments />
        </section>

      </div>

      {/* Hackathon Submission Footer */}
      <TechStackFooter />

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

      {/* AI Agent Chat Sidebar */}
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

      {/* Auth Sliding Login & Register Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccessLogin={(email) => {
          setIsAuthOpen(false);
        }}
      />

    </main>
  );
}
