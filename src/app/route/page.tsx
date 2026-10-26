'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { calculateFares } from '@/lib/fareEngine';
import { Place, RideOption } from '@/types';
import { CityLocation } from '@/components/RouteMap';
import { PayPalCheckoutDrawer } from '@/components/PayPalCheckoutDrawer';
import { BookingSuccessModal } from '@/components/BookingSuccessModal';
import { TechStackFooter } from '@/components/TechStackFooter';
import { ALL_INDIAN_CITIES } from '@/lib/mockData';
import {
  MapPin,
  LocateFixed,
  ArrowRight,
  Clock,
  Bike,
  Car,
  Train,
  Footprints,
  CreditCard,
  Compass,
  ArrowLeft,
  Building2,
  Leaf,
  ShieldCheck,
  Navigation,
  Sparkles,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';

// Dynamic import for Leaflet map component (ensures zero SSR issues)
const RouteMap = dynamic(() => import('@/components/RouteMap'), {
  ssr: false,
  loading: () => (
    <div
      id="map"
      style={{ width: '100%', height: '450px', borderRadius: '12px' }}
      className="w-full h-[450px] bg-slate-100 rounded-xl border border-slate-200 flex flex-col items-center justify-center space-y-2 text-slate-400"
    >
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xs font-semibold">Loading Free Leaflet & OpenStreetMap...</p>
    </div>
  ),
});

export default function RoutePlannerPage() {
  // Locations dataset (from cities.json)
  const [locations, setLocations] = useState<CityLocation[]>([]);

  // Selected Pickup & Destination locations with coordinates
  const [selectedPickup, setSelectedPickup] = useState<CityLocation | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<CityLocation | null>(null);

  // Search input strings
  const [pickupInput, setPickupInput] = useState<string>('Hyderabad, Telangana, India');
  const [destInput, setDestInput] = useState<string>('Panaji, Goa, India');

  // Autocomplete suggestions
  const [pickupSuggestions, setPickupSuggestions] = useState<CityLocation[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<CityLocation[]>([]);
  const [showPickupDropdown, setShowPickupDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);

  // Routing and Map State
  const [routeGeoJSON, setRouteGeoJSON] = useState<any | null>(null);
  const [isRouting, setIsRouting] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [drivingDurationMins, setDrivingDurationMins] = useState<number | null>(null);

  // Transit and Fares State
  const [distanceKm, setDistanceKm] = useState<number>(680);
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [rides, setRides] = useState<RideOption[]>([]);
  const [selectedRide, setSelectedRide] = useState<RideOption | null>(null);
  const [isDetectingGPS, setIsDetectingGPS] = useState(false);

  // Checkout modal states
  const [checkoutPlace, setCheckoutPlace] = useState<Place | null>(null);
  const [checkoutRide, setCheckoutRide] = useState<RideOption | null>(null);
  const [successData, setSuccessData] = useState<{
    orderId: string;
    amountUSD: number;
    placeName: string;
  } | null>(null);

  // Step 3: Load cities.json dataset
  useEffect(() => {
    fetch('/cities.json')
      .then((res) => {
        if (!res.ok) throw new Error('Could not load cities.json');
        return res.json();
      })
      .then((data: CityLocation[]) => {
        setLocations(data);

        // Pre-populate default Hyderabad -> Panaji
        const hyd = data.find((c) => c.city.toLowerCase() === 'hyderabad');
        const pan = data.find((c) => c.city.toLowerCase() === 'panaji');
        if (hyd) setSelectedPickup(hyd);
        if (pan) setSelectedDestination(pan);
      })
      .catch((err) => {
        console.warn('Error loading cities.json, using fallback:', err);
        // Fallback to ALL_INDIAN_CITIES
        const fallback: CityLocation[] = ALL_INDIAN_CITIES.map((c) => ({
          city: c.name.split(',')[0].trim(),
          state: c.name.split(',')[1]?.trim() || 'India',
          country: 'India',
          latitude: c.lat,
          longitude: c.lng,
        }));
        setLocations(fallback);
      });
  }, []);

  // Update Fares whenever distance changes
  useEffect(() => {
    const validDist = distanceKm > 0 ? distanceKm : 15;
    const fareList = calculateFares(validDist);
    setRides(fareList);
    setSelectedRide(fareList[0]);
  }, [distanceKm]);

  // Handle Pickup input changes with Step 4 filter
  const handlePickupChange = (value: string) => {
    setPickupInput(value);
    const query = value.trim().toLowerCase();
    if (query.length < 2) {
      setPickupSuggestions([]);
      setShowPickupDropdown(false);
      return;
    }
    const matches = locations
      .filter((l) => `${l.city}, ${l.state}, India`.toLowerCase().includes(query))
      .slice(0, 8);
    setPickupSuggestions(matches);
    setShowPickupDropdown(matches.length > 0);
  };

  // Handle Destination input changes with Step 4 filter
  const handleDestChange = (value: string) => {
    setDestInput(value);
    const query = value.trim().toLowerCase();
    if (query.length < 2) {
      setDestSuggestions([]);
      setShowDestDropdown(false);
      return;
    }
    const matches = locations
      .filter((l) => `${l.city}, ${l.state}, India`.toLowerCase().includes(query))
      .slice(0, 8);
    setDestSuggestions(matches);
    setShowDestDropdown(matches.length > 0);
  };

  // Select Pickup option
  const selectPickup = (loc: CityLocation) => {
    setSelectedPickup(loc);
    setPickupInput(`${loc.city}, ${loc.state}, India`);
    setShowPickupDropdown(false);
  };

  // Select Destination option
  const selectDestination = (loc: CityLocation) => {
    setSelectedDestination(loc);
    setDestInput(`${loc.city}, ${loc.state}, India`);
    setShowDestDropdown(false);
  };

  // Step 6: Draw Driving Route via OSRM
  const calculateRoute = async (pickup: CityLocation, destination: CityLocation) => {
    setIsRouting(true);
    setRouteError(null);

    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${pickup.longitude},${pickup.latitude};` +
      `${destination.longitude},${destination.latitude}` +
      `?overview=full&geometries=geojson`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('OSRM routing service unavailable');
      }
      const data = await response.json();
      if (data.code !== 'Ok' || !data.routes?.length) {
        throw new Error('No driving route found between coordinates.');
      }

      const route = data.routes[0];
      const dist = parseFloat((route.distance / 1000).toFixed(1));
      const durationMins = Math.round(route.duration / 60);

      setRouteGeoJSON(route.geometry);
      setDistanceKm(dist);
      setDrivingDurationMins(durationMins);
    } catch (err: any) {
      console.warn('OSRM routing error:', err);
      // Fallback straight-line haversine distance
      const R = 6371;
      const dLat = ((destination.latitude - pickup.latitude) * Math.PI) / 180;
      const dLon = ((destination.longitude - pickup.longitude) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((pickup.latitude * Math.PI) / 180) *
          Math.cos((destination.latitude * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const approxDist = parseFloat((R * c * 1.25).toFixed(1));

      // Create fallback GeoJSON line
      const fallbackGeoJSON = {
        type: 'LineString',
        coordinates: [
          [pickup.longitude, pickup.latitude],
          [destination.longitude, destination.latitude],
        ],
      };

      setRouteGeoJSON(fallbackGeoJSON);
      setDistanceKm(approxDist);
      setDrivingDurationMins(Math.round((approxDist / 60) * 60));
      setRouteError('Direct route displayed (OSRM public server rate-limited or calculating)');
    } finally {
      setIsRouting(false);
    }
  };

  // Step 5: Show on Map click handler
  const handleShowRoute = () => {
    if (!selectedPickup || !selectedDestination) {
      alert('Please select both pickup and destination locations.');
      return;
    }
    calculateRoute(selectedPickup, selectedDestination);
  };

  // Resolve Real City and State name from coordinates (Never shows raw lat/long)
  const resolveCityAndState = async (lat: number, lng: number): Promise<{ city: string; state: string }> => {
    let resolvedCity = '';
    let resolvedState = '';

    // 1. Try BigDataCloud free client reverse geocoding
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data?.city || data?.locality) {
          resolvedCity = (data.city || data.locality || '').trim();
        }
        if (data?.principalSubdivision) {
          resolvedState = data.principalSubdivision.trim();
        }
      }
    } catch (e) {
      console.warn('BigDataCloud reverse geocode error:', e);
    }

    // 2. Fallback to OpenStreetMap Nominatim with proper User-Agent
    if (!resolvedCity || !resolvedState) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`,
          {
            signal: controller.signal,
            headers: { 'Accept-Language': 'en', 'User-Agent': 'PayNGoTripPlanner/1.0' },
          }
        );
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (data?.address) {
            const addr = data.address;
            const rawCity =
              addr.city ||
              addr.town ||
              addr.suburb ||
              addr.neighbourhood ||
              addr.village ||
              addr.municipality ||
              addr.state_district;

            if (rawCity && !resolvedCity) {
              resolvedCity = rawCity.replace(/\s+(mandal|district|taluk|tehsil)$/i, '').trim();
            }
            if (addr.state && !resolvedState) {
              resolvedState = addr.state.trim();
            }
          }
        }
      } catch (e) {
        console.warn('Nominatim reverse geocode error:', e);
      }
    }

    // Fallback: match nearest city from our comprehensive dataset
    if (!resolvedCity || !resolvedState) {
      if (locations.length > 0) {
        let nearest = locations[0];
        let minDist = Infinity;
        for (const loc of locations) {
          const d = Math.hypot(loc.latitude - lat, loc.longitude - lng);
          if (d < minDist) {
            minDist = d;
            nearest = loc;
          }
        }
        if (!resolvedCity) resolvedCity = nearest.city;
        if (!resolvedState) resolvedState = nearest.state;
      } else {
        resolvedCity = 'Hyderabad';
        resolvedState = 'Telangana';
      }
    }

    return { city: resolvedCity, state: resolvedState };
  };

  // GPS Detection Handler - Automatically resolves City and State name
  const handleDetectLiveGPS = () => {
    setIsDetectingGPS(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          const { city, state } = await resolveCityAndState(latitude, longitude);

          const userGpsLoc: CityLocation = {
            city,
            state,
            country: 'India',
            latitude,
            longitude,
          };

          setSelectedPickup(userGpsLoc);
          setPickupInput(`${city}, ${state}, India`);
          setIsDetectingGPS(false);
        },
        () => {
          setIsDetectingGPS(false);
          alert('GPS location permission denied or unavailable.');
        },
        { timeout: 8000 }
      );
    } else {
      setIsDetectingGPS(false);
      alert('Geolocation is not supported by your browser.');
    }
  };

  const getVehicleIcon = (iconName: string) => {
    switch (iconName) {
      case 'Bike':
        return <Bike className="w-5 h-5 text-amber-600" />;
      case 'Train':
        return <Train className="w-5 h-5 text-indigo-600" />;
      case 'Footprints':
        return <Footprints className="w-5 h-5 text-emerald-600" />;
      default:
        return <Car className="w-5 h-5 text-blue-600" />;
    }
  };

  const handleBookSelectedRoute = () => {
    if (!selectedRide) return;

    // Direct IRCTC Railway option directly to official Indian Railways portal
    const isIRCTC = selectedRide.provider.toLowerCase().includes('irctc') || selectedRide.icon === 'Train';
    if (isIRCTC) {
      window.open('https://www.irctc.co.in/nget/train-search', '_blank', 'noopener,noreferrer');
      return;
    }

    const startName = selectedPickup ? selectedPickup.city : 'Pickup';
    const endName = selectedDestination ? selectedDestination.city : 'Destination';

    const routePlace: Place = {
      id: `route-${Date.now()}`,
      name: `${startName} ➔ ${endName}`,
      category: 'transit',
      rating: 4.9,
      reviewsCount: 1240,
      priceLevel: '₹₹',
      avgPrice: selectedRide.estimatedPriceINR,
      distanceKm: distanceKm,
      newcomerScore: 99,
      address: `Route: ${startName} to ${endName}`,
      lat: selectedDestination ? selectedDestination.latitude : 19.076,
      lng: selectedDestination ? selectedDestination.longitude : 72.8777,
      imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop',
      tags: [selectedRide.provider, selectedRide.vehicleType, 'Instant Lock'],
      description: `Guaranteed multi-modal transit fare from ${startName} to ${endName}`,
    };

    setCheckoutPlace(routePlace);
    setCheckoutRide(selectedRide);
  };

  return (
    <main className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Discovery Radar</span>
          </Link>

          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-slate-900">Trip & Route Planner</span>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/trip-planner/index.html"
              target="_blank"
              className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center space-x-1"
            >
              <span>Pure HTML Version</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <button
              onClick={() => setCurrency((prev) => (prev === 'INR' ? 'USD' : 'INR'))}
              className="text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3 py-1.5 rounded-full transition-all"
            >
              {currency} ({currency === 'INR' ? '₹' : '$'})
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full flex-1 space-y-8">
        {/* Page Title & Context */}
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs text-blue-700 font-semibold shadow-xs">
            <Compass className="w-3.5 h-3.5" />
            <span>Leaflet + OpenStreetMap + OSRM Routing</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            India Trip Planner & Route Map
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            Free map powered by OpenStreetMap with complete India city autocomplete, road driving polyline, and real-time ride pricing across Rapido, Ola, Uber, and Metro.
          </p>
        </div>

        {/* STEP 4: Search Form with IDs #pickup, #destination, #show-route */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
          <div className="trip-search grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pickup Location with ID #pickup */}
            <div className="relative space-y-2">
              <label htmlFor="pickup" className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center space-x-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>Pickup Location</span>
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold">City Autocomplete</span>
              </label>

              <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-2xl p-2.5 focus-within:border-blue-500 focus-within:bg-white transition-all">
                <input
                  id="pickup"
                  type="text"
                  placeholder="Enter pickup city (e.g. Hyd)..."
                  autoComplete="off"
                  value={pickupInput}
                  onChange={(e) => handlePickupChange(e.target.value)}
                  onFocus={() => {
                    if (pickupSuggestions.length > 0) setShowPickupDropdown(true);
                  }}
                  className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 font-semibold focus:outline-none px-1"
                />
                <button
                  type="button"
                  onClick={handleDetectLiveGPS}
                  disabled={isDetectingGPS}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl shrink-0 transition-all flex items-center space-x-1 shadow-xs ml-2"
                >
                  <LocateFixed className={`w-3.5 h-3.5 ${isDetectingGPS ? 'animate-spin' : ''}`} />
                  <span>{isDetectingGPS ? 'Detecting...' : 'GPS'}</span>
                </button>
              </div>

              {/* Suggestions Container with ID #pickup-results */}
              {showPickupDropdown && pickupSuggestions.length > 0 && (
                <div
                  id="pickup-results"
                  className="suggestions absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-56 overflow-y-auto"
                >
                  {pickupSuggestions.map((loc, idx) => (
                    <div
                      key={idx}
                      onClick={() => selectPickup(loc)}
                      className="p-3 text-xs text-slate-800 hover:bg-blue-50 hover:text-blue-700 cursor-pointer border-b border-slate-100 last:border-b-0 font-medium transition-colors flex items-center justify-between"
                    >
                      <span>
                        {loc.city}, {loc.state}, India
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {loc.state}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Destination Location with ID #destination */}
            <div className="relative space-y-2">
              <label htmlFor="destination" className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center space-x-1.5">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>Destination</span>
                </span>
                <span className="text-[11px] text-slate-400 font-medium">{locations.length || '150+'} Indian Cities</span>
              </label>

              <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-2xl p-2.5 focus-within:border-blue-500 focus-within:bg-white transition-all">
                <input
                  id="destination"
                  type="text"
                  placeholder="Enter destination (e.g. Pan)..."
                  autoComplete="off"
                  value={destInput}
                  onChange={(e) => handleDestChange(e.target.value)}
                  onFocus={() => {
                    if (destSuggestions.length > 0) setShowDestDropdown(true);
                  }}
                  className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 font-semibold focus:outline-none px-1"
                />
              </div>

              {/* Suggestions Container with ID #destination-results */}
              {showDestDropdown && destSuggestions.length > 0 && (
                <div
                  id="destination-results"
                  className="suggestions absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-56 overflow-y-auto"
                >
                  {destSuggestions.map((loc, idx) => (
                    <div
                      key={idx}
                      onClick={() => selectDestination(loc)}
                      className="p-3 text-xs text-slate-800 hover:bg-blue-50 hover:text-blue-700 cursor-pointer border-b border-slate-100 last:border-b-0 font-medium transition-colors flex items-center justify-between"
                    >
                      <span>
                        {loc.city}, {loc.state}, India
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {loc.state}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Popular Indian Trips */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              Sample Trips:
            </span>
            {[
              { from: 'Hyderabad', to: 'Panaji' },
              { from: 'Mumbai', to: 'Jaipur' },
              { from: 'Bengaluru', to: 'Kochi' },
              { from: 'New Delhi', to: 'Agra' },
              { from: 'Kolkata', to: 'Varanasi' },
            ].map((trip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  const p = locations.find((l) => l.city.toLowerCase() === trip.from.toLowerCase());
                  const d = locations.find((l) => l.city.toLowerCase() === trip.to.toLowerCase());
                  if (p) selectPickup(p);
                  if (d) selectDestination(d);
                }}
                className="text-xs font-semibold bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 transition-all flex items-center space-x-1"
              >
                <span>{trip.from}</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
                <span>{trip.to}</span>
              </button>
            ))}
          </div>

          {/* Step 4: Show on Map Action Button with ID #show-route */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              id="show-route"
              type="button"
              onClick={handleShowRoute}
              disabled={isRouting}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-8 py-3.5 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Navigation className={`w-4 h-4 ${isRouting ? 'animate-spin' : ''}`} />
              <span>{isRouting ? 'Calculating Road Route...' : 'Show on Map'}</span>
            </button>

            {/* Live Route Distance and Duration Metrics */}
            <div className="flex items-center space-x-4 text-xs">
              <div className="bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200 flex items-center space-x-2">
                <span className="text-slate-500 font-medium">Distance:</span>
                <span className="font-black text-slate-900">{distanceKm} km</span>
              </div>
              {drivingDurationMins && (
                <div className="bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200 flex items-center space-x-2">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-medium">Drive Time:</span>
                  <span className="font-black text-emerald-800">
                    {drivingDurationMins} mins (~{(drivingDurationMins / 60).toFixed(1)} hrs)
                  </span>
                </div>
              )}
            </div>
          </div>

          {routeError && (
            <p className="text-xs text-amber-600 font-medium bg-amber-50 p-2.5 rounded-xl border border-amber-200">
              {routeError}
            </p>
          )}
        </div>

        {/* STEP 2: Leaflet Free Map with id="map" */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 flex items-center space-x-2">
              <Compass className="w-5 h-5 text-blue-600" />
              <span>Interactive Leaflet Map (OpenStreetMap Tiles)</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">Free OSM & OSRM Engine</span>
          </div>

          {/* RouteMap Component rendering div with id="map" */}
          <RouteMap
            pickup={selectedPickup}
            destination={selectedDestination}
            routeGeoJSON={routeGeoJSON}
          />
        </div>

        {/* Transit Fares List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 flex items-center space-x-2">
              <Car className="w-5 h-5 text-blue-600" />
              <span>Multi-Modal Fare Comparison</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">Calculated for {distanceKm} km route</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rides.map((r, idx) => {
              const isSelected = selectedRide?.provider === r.provider;
              const price =
                currency === 'USD' ? `$${r.estimatedPriceUSD} USD` : `₹${r.estimatedPriceINR} INR`;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedRide(r)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-50/60 border-blue-600 shadow-md ring-1 ring-blue-600'
                      : 'bg-white hover:bg-slate-50/80 border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                      {getVehicleIcon(r.icon || 'Car')}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-black text-slate-900">{r.provider}</span>
                        <span className="text-xs text-slate-500 font-medium">({r.vehicleType})</span>
                        {r.badge && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              r.badge === 'Fastest'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : r.badge === 'Cheapest'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            }`}
                          >
                            {r.badge}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{r.durationMinutes} mins</span>
                        </span>
                        {r.co2SavingsKg && (
                          <span className="text-emerald-700 text-[11px] font-semibold flex items-center space-x-1">
                            <Leaf className="w-3 h-3 text-emerald-600" />
                            <span>{r.co2SavingsKg}kg CO₂ saved</span>
                          </span>
                        )}
                      </div>

                      {/* Direct IRCTC Official Link if rail option */}
                      {(r.provider.toLowerCase().includes('irctc') || r.icon === 'Train') && (
                        <div className="pt-2">
                          <a
                            href="https://www.irctc.co.in/nget/train-search"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center space-x-1 text-[11px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-lg transition-colors shadow-xs"
                          >
                            <span>Official IRCTC Booking (irctc.co.in)</span>
                            <ExternalLink className="w-3 h-3 text-amber-700" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-base font-black text-slate-900">{price}</div>
                    <div className="text-[11px] text-slate-400 font-medium">ETA ~{r.etaMinutes}m</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Book Button CTA */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs text-slate-500 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {selectedRide?.provider.toLowerCase().includes('irctc') || selectedRide?.icon === 'Train'
                  ? 'Official Indian Railways ticket reservation on IRCTC portal'
                  : 'Instant fare lock with PayPal Buyer Protection'}
              </span>
            </div>

            {selectedRide?.provider.toLowerCase().includes('irctc') || selectedRide?.icon === 'Train' ? (
              <button
                type="button"
                onClick={handleBookSelectedRoute}
                className="w-full sm:w-auto bg-[#d97706] hover:bg-[#b45309] text-white font-extrabold text-xs sm:text-sm px-7 py-3 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-98"
              >
                <Train className="w-4 h-4 text-white" />
                <span>
                  Book on Official IRCTC Portal (irctc.co.in) • ₹{selectedRide?.estimatedPriceINR} INR ↗
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleBookSelectedRoute}
                disabled={!selectedRide}
                className="w-full sm:w-auto bg-slate-900 hover:bg-black text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <CreditCard className="w-4 h-4 text-amber-400" />
                <span>
                  Book with PayPal ({selectedRide?.provider} •{' '}
                  {currency === 'USD'
                    ? `$${selectedRide?.estimatedPriceUSD} USD`
                    : `₹${selectedRide?.estimatedPriceINR} INR`}
                  )
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tech Stack Footer */}
      <TechStackFooter />

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
    </main>
  );
}
