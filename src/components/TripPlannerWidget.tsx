'use client';

import React, { useState, useEffect } from 'react';
import { LocationState, ALL_INDIAN_CITIES } from '@/lib/mockData';
import { Place } from '@/types';
import { LocationAutocomplete } from '@/components/LocationAutocomplete';
import { LocationItem } from '@/types/location';
import { calculateHaversineDistance } from '@/lib/fareEngine';
import {
  MapPin,
  Clock,
  User,
  Plus,
  Home as HomeIcon,
  Briefcase,
  Star,
  LocateFixed,
  Train,
  Car,
  ChevronDown,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Compass,
  Building,
  Plane,
  X,
  CreditCard,
} from 'lucide-react';

export interface TripLocationOption {
  id: string;
  name: string;
  address: string;
  distance: string;
  category: 'station' | 'metro' | 'city' | 'landmark' | 'gps' | 'airport';
  lat: number;
  lng: number;
}

const POPULAR_DESTINATIONS: TripLocationOption[] = [
  {
    id: 'bengaluru-sbc',
    name: 'Bengaluru City Railway Station (SBC)',
    address: 'Kempegowda, Sevashrama, Bengaluru, Karnataka',
    distance: '3.2 km',
    category: 'station',
    lat: 12.9784,
    lng: 77.5694,
  },
  {
    id: 'charlapalli-pk',
    name: 'Charlapalli Terminal Parking',
    address: 'FJ45+RGC, Mahalaxmi Nagar, Cherlapalli, Telangana',
    distance: '7.8 km',
    category: 'station',
    lat: 17.4721,
    lng: 78.6012,
  },
  {
    id: 'cherlapally-stn',
    name: 'Cherlapally Railway Station',
    address: 'Plot no 15, Phase-IV, Railway Colony, Cherlapalli',
    distance: '8.5 km',
    category: 'station',
    lat: 17.4765,
    lng: 78.6089,
  },
  {
    id: 'dmart-kush',
    name: 'DMart Commercial Center',
    address: 'JANAPRIYA ARCADIA, Venkusa Estates, Bharat Nagar, Hyderabad',
    distance: '13.2 km',
    category: 'landmark',
    lat: 17.4791,
    lng: 78.5714,
  },
  {
    id: 'rgia-hyd',
    name: 'Rajiv Gandhi Int. Airport (RGIA)',
    address: 'Shamshabad, Hyderabad, Telangana 500409',
    distance: '24 km',
    category: 'airport',
    lat: 17.2403,
    lng: 78.4294,
  },
  {
    id: 'charminar-hyd',
    name: 'Charminar & Historic Bazaar',
    address: 'Char Kaman, Ghansi Bazaar, Hyderabad, Telangana',
    distance: '19.3 km',
    category: 'landmark',
    lat: 17.3616,
    lng: 78.4747,
  },
  {
    id: 'taj-mahal-agr',
    name: 'Taj Mahal Monument',
    address: 'Dharmapuri, Forest Colony, Agra, Uttar Pradesh',
    distance: '195 km',
    category: 'landmark',
    lat: 27.1751,
    lng: 78.0421,
  },
  {
    id: 'hawa-mahal-jai',
    name: 'Hawa Mahal & Amber Palace',
    address: 'Pink City, Jaipur, Rajasthan',
    distance: '290 km',
    category: 'landmark',
    lat: 26.9239,
    lng: 75.8267,
  },
  {
    id: 'gateway-mumbai',
    name: 'Gateway of India & Marine Drive',
    address: 'Apollo Bunder, Colaba, Mumbai, Maharashtra',
    distance: '540 km',
    category: 'landmark',
    lat: 18.9220,
    lng: 72.8347,
  },
  ...ALL_INDIAN_CITIES.map((c) => ({
    id: c.id,
    name: c.name,
    address: `Tourist & Business Hub in ${c.name}`,
    distance: `${Math.floor(25 + Math.random() * 320)} km`,
    category: 'city' as const,
    lat: c.lat,
    lng: c.lng,
  })),
];

interface TripPlannerWidgetProps {
  currentLocation: LocationState;
  onSelectStartLocation: (loc: LocationState) => void;
  onSelectDestination: (place: Place) => void;
  onOpenRideCalculator: (place: Place) => void;
}

export const TripPlannerWidget: React.FC<TripPlannerWidgetProps> = ({
  currentLocation,
  onSelectStartLocation,
  onSelectDestination,
  onOpenRideCalculator,
}) => {
  const [startInput, setStartInput] = useState(currentLocation.isGPS ? currentLocation.name : '');
  const [destInput, setDestInput] = useState('');
  const [activeInput, setActiveInput] = useState<'start' | 'dest' | null>(null);
  const [pickupTime, setPickupTime] = useState<'now' | 'schedule'>('now');
  const [riderCount, setRiderCount] = useState<1 | 2 | 4>(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedDestOption, setSelectedDestOption] = useState<TripLocationOption | null>(null);
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'transit' | 'landmarks' | 'cities'>('all');

  // Sync startInput only when an explicit city or GPS location is chosen
  useEffect(() => {
    if (currentLocation.isGPS) {
      setStartInput(currentLocation.name);
    }
  }, [currentLocation]);

  const handleSelectStartItem = (loc: LocationItem) => {
    setStartInput(loc.name);
    onSelectStartLocation({
      id: loc.id,
      name: loc.name,
      lat: loc.latitude ?? 20.5937,
      lng: loc.longitude ?? 78.9629,
      isGPS: loc.type === 'gps',
    });
  };

  const handleSelectDestItem = (loc: LocationItem) => {
    setDestInput(loc.name);
    const startLat = currentLocation.lat || 20.5937;
    const startLng = currentLocation.lng || 78.9629;
    const destLat = loc.latitude ?? 20.5937;
    const destLng = loc.longitude ?? 78.9629;

    const realDistance = calculateHaversineDistance(startLat, startLng, destLat, destLng);

    const targetPlace: Place = {
      id: loc.id,
      name: loc.name,
      category: loc.type === 'attraction' ? 'activity' : 'food',
      rating: 4.9,
      reviewsCount: 1420,
      priceLevel: '₹₹',
      avgPrice: 480,
      distanceKm: realDistance,
      newcomerScore: 98,
      address: loc.state ? `${loc.name}, ${loc.state}, India` : `${loc.name}, India`,
      lat: destLat,
      lng: destLng,
      imageUrl: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=600&auto=format&fit=crop',
      tags: ['Verified Destination', loc.type.toUpperCase(), loc.state || 'India'],
      description: loc.description || `Trip route from ${currentLocation.name} to ${loc.name} (${realDistance} km)`,
    };
    onSelectDestination(targetPlace);
  };

  const handleSelectOption = (opt: TripLocationOption) => {
    if (activeInput === 'start') {
      setStartInput(opt.name);
      onSelectStartLocation({
        id: opt.id,
        name: opt.name,
        lat: opt.lat,
        lng: opt.lng,
        isGPS: opt.category === 'gps',
      });
    } else {
      setDestInput(opt.name);
      setSelectedDestOption(opt);
      const targetPlace: Place = {
        id: opt.id,
        name: opt.name,
        category: opt.category === 'landmark' ? 'activity' : 'food',
        rating: 4.9,
        reviewsCount: 1420,
        priceLevel: '₹₹',
        avgPrice: 480,
        distanceKm: parseFloat(opt.distance.replace(/[^0-9.]/g, '')) || 8.4,
        newcomerScore: 99,
        address: opt.address,
        lat: opt.lat,
        lng: opt.lng,
        imageUrl: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=600&auto=format&fit=crop',
        tags: ['Verified Route', opt.category.toUpperCase()],
        description: `Direct route from ${startInput} to ${opt.name}`,
      };
      onSelectDestination(targetPlace);
    }
    setIsDropdownOpen(false);
  };

  const getFilteredOptions = () => {
    const rawQ = (activeInput === 'start' ? startInput : destInput).trim().toLowerCase();
    let list = POPULAR_DESTINATIONS;

    if (activeTabFilter === 'transit') {
      list = list.filter((o) => o.category === 'station' || o.category === 'metro' || o.category === 'airport');
    } else if (activeTabFilter === 'landmarks') {
      list = list.filter((o) => o.category === 'landmark');
    } else if (activeTabFilter === 'cities') {
      list = list.filter((o) => o.category === 'city');
    }

    if (!rawQ || rawQ.includes('india') || rawQ === 'all') {
      return list;
    }

    const matches = list.filter(
      (o) => o.name.toLowerCase().includes(rawQ) || o.address.toLowerCase().includes(rawQ)
    );
    if (matches.length > 0) return matches;

    return [
      {
        id: `custom-${Date.now()}`,
        name: activeInput === 'start' ? startInput : destInput,
        address: 'Custom Specified Coordinates',
        distance: 'Direct Route',
        category: 'city' as const,
        lat: 20.5937,
        lng: 78.9629,
      },
      ...list,
    ];
  };

  const filteredOptions = getFilteredOptions();

  const handleLaunchCalculator = () => {
    const startLat = currentLocation.lat || 20.5937;
    const startLng = currentLocation.lng || 78.9629;
    const destLat = selectedDestOption?.lat || 17.3616;
    const destLng = selectedDestOption?.lng || 78.4747;
    const distance = selectedDestOption
      ? parseFloat(selectedDestOption.distance.replace(/[^0-9.]/g, '')) || 12
      : calculateHaversineDistance(startLat, startLng, destLat, destLng);

    const placeObj: Place = {
      id: selectedDestOption?.id || 'dest-transit',
      name: destInput || 'Selected Destination',
      category: 'activity',
      rating: 4.9,
      reviewsCount: 1540,
      priceLevel: '₹₹',
      avgPrice: 480,
      distanceKm: distance,
      newcomerScore: 98,
      address: selectedDestOption?.address || `${destInput}, India`,
      lat: destLat,
      lng: destLng,
      imageUrl: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=600&auto=format&fit=crop',
      tags: ['Fast Transit', 'PayPal Verified'],
      description: `Ride transit connection from ${startInput} to ${destInput || 'destination'}`,
    };

    onOpenRideCalculator(placeObj);
  };

  return (
    <div className="relative w-full rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/90 shadow-2xl shadow-sky-950/5 p-5 sm:p-6 space-y-4 my-6 transition-all">
      {/* Top Header & Trip Configuration */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100/90 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-500/25">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Transit & Route Planner</h3>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                Multi-Modal
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Real-time fare discovery across Rapido, Ola, Uber & Metro</p>
          </div>
        </div>

        {/* Departure & Rider Controls */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          {/* Pickup Timing Toggle */}
          <button
            onClick={() => setPickupTime(pickupTime === 'now' ? 'schedule' : 'now')}
            className="group px-3 py-1.5 rounded-xl bg-slate-100/80 hover:bg-slate-200/70 border border-slate-200/70 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm"
          >
            <Clock className="w-3.5 h-3.5 text-sky-600 group-hover:scale-110 transition-transform" />
            <span>{pickupTime === 'now' ? 'Depart now' : 'Schedule for later'}</span>
          </button>

          {/* Passenger Selector */}
          <button
            onClick={() => setRiderCount(riderCount === 1 ? 2 : riderCount === 2 ? 4 : 1)}
            className="group px-3 py-1.5 rounded-xl bg-slate-100/80 hover:bg-slate-200/70 border border-slate-200/70 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm"
          >
            <User className="w-3.5 h-3.5 text-indigo-600 group-hover:scale-110 transition-transform" />
            <span>{riderCount === 1 ? 'Solo (1)' : riderCount === 2 ? 'Couple (2)' : 'Group (4)'}</span>
          </button>
        </div>
      </div>

      {/* Connected Pathway Inputs */}
      <div className="relative rounded-2xl bg-gradient-to-b from-slate-50/90 to-slate-100/50 border border-slate-200/90 p-4 shadow-inner">
        <div className="flex items-stretch gap-3">
          {/* Left Vertical Route Connector */}
          <div className="flex flex-col items-center justify-between py-2 shrink-0 select-none">
            {/* Origin Node */}
            <div className="w-4 h-4 rounded-full border-2 border-sky-600 bg-white flex items-center justify-center shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-sky-600 animate-ping" />
            </div>

            {/* Glowing Gradient Line */}
            <div className="w-0.5 flex-1 my-1.5 bg-gradient-to-b from-sky-500 via-indigo-500 to-amber-500 rounded-full" />

            {/* Destination Node */}
            <div className="w-4 h-4 rounded-full border-2 border-amber-500 bg-amber-500 flex items-center justify-center shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
          </div>

          {/* Input Fields Stack */}
          <div className="flex-1 space-y-2.5">
            {/* Start Location Input */}
            <div className="relative">
              <LocationAutocomplete
                value={startInput}
                onChange={(val) => setStartInput(val)}
                onSelectLocation={handleSelectStartItem}
                placeholder="Pickup address, station, airport, or hotel..."
                inputClassName="py-2.5 pl-3.5 text-xs sm:text-sm font-semibold bg-white border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 rounded-xl shadow-sm text-slate-900 placeholder:text-slate-400"
              />
            </div>

            {/* Destination Location Input */}
            <div className="relative">
              <LocationAutocomplete
                value={destInput}
                onChange={(val) => setDestInput(val)}
                onSelectLocation={handleSelectDestItem}
                placeholder="Where to? (e.g. Taj Mahal, Charminar, Goa, Delhi)..."
                inputClassName="py-2.5 pl-3.5 text-xs sm:text-sm font-semibold bg-white border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl shadow-sm text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Quick Browse Button */}
          <button
            onClick={() => {
              setActiveInput('dest');
              setIsDropdownOpen((prev) => !prev);
            }}
            className="w-11 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 hover:text-sky-600 flex flex-col items-center justify-center shrink-0 shadow-sm transition-all hover:scale-[1.02] active:scale-95 group"
            title="Browse Popular Spots & Transit Hubs"
          >
            <Sparkles className="w-4 h-4 text-amber-500 group-hover:rotate-12 transition-transform" />
            <span className="text-[9px] font-black uppercase text-slate-400 group-hover:text-sky-600 mt-1">HUB</span>
          </button>
        </div>
      </div>

      {/* Quick Location Shortcuts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">Quick:</span>
        <button
          onClick={() => {
            setDestInput('Airport Transit Terminal');
            handleSelectOption(POPULAR_DESTINATIONS[4]);
          }}
          className="bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 hover:text-sky-600 font-semibold px-3 py-1.5 rounded-xl flex items-center space-x-1.5 shrink-0 transition-all shadow-sm hover:shadow"
        >
          <Plane className="w-3.5 h-3.5 text-sky-500" />
          <span>Airport</span>
        </button>
        <button
          onClick={() => {
            setDestInput('Central Railway Junction');
            handleSelectOption(POPULAR_DESTINATIONS[1]);
          }}
          className="bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 hover:text-amber-600 font-semibold px-3 py-1.5 rounded-xl flex items-center space-x-1.5 shrink-0 transition-all shadow-sm hover:shadow"
        >
          <Train className="w-3.5 h-3.5 text-amber-500" />
          <span>Rail Terminal</span>
        </button>
        <button
          onClick={() => {
            setDestInput('Tech City Business Park');
            handleSelectOption(POPULAR_DESTINATIONS[3]);
          }}
          className="bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 hover:text-indigo-600 font-semibold px-3 py-1.5 rounded-xl flex items-center space-x-1.5 shrink-0 transition-all shadow-sm hover:shadow"
        >
          <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
          <span>Work Park</span>
        </button>
        <button
          onClick={() => {
            setActiveInput('dest');
            setIsDropdownOpen(true);
          }}
          className="bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 hover:text-emerald-600 font-semibold px-3 py-1.5 rounded-xl flex items-center space-x-1.5 shrink-0 transition-all shadow-sm hover:shadow"
        >
          <Star className="w-3.5 h-3.5 text-amber-400" />
          <span>Top Tourist Spots</span>
        </button>
      </div>

      {/* Location Dropdown Modal/Card */}
      {isDropdownOpen && (
        <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xl space-y-1 max-h-80 overflow-y-auto animate-fade-in divide-y divide-slate-100">
          {/* Filter Pills Header */}
          <div className="p-3 bg-slate-50 flex items-center justify-between gap-2 border-b border-slate-200/60 sticky top-0 z-10 backdrop-blur-md">
            <div className="flex items-center space-x-1 overflow-x-auto text-xs">
              {(['all', 'transit', 'landmarks', 'cities'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTabFilter(tab)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                    activeTabFilter === tab
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-200/60'
                  }`}
                >
                  {tab === 'all' ? 'All' : tab === 'transit' ? 'Transit' : tab === 'landmarks' ? 'Landmarks' : 'Cities'}
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsDropdownOpen(false)}
              className="text-xs font-bold text-slate-500 hover:text-slate-900 p-1 rounded-lg hover:bg-slate-200/50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Options */}
          {filteredOptions.map((opt) => (
            <div
              key={opt.id}
              onClick={() => handleSelectOption(opt)}
              className="p-3.5 hover:bg-sky-50/60 transition-colors cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center space-x-3 truncate">
                <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-sky-100 group-hover:text-sky-600 flex items-center justify-center shrink-0 transition-colors">
                  {opt.category === 'gps' ? (
                    <LocateFixed className="w-4 h-4 text-emerald-600" />
                  ) : opt.category === 'airport' ? (
                    <Plane className="w-4 h-4 text-sky-600" />
                  ) : opt.category === 'station' ? (
                    <Train className="w-4 h-4 text-amber-600" />
                  ) : opt.category === 'landmark' ? (
                    <Building className="w-4 h-4 text-purple-600" />
                  ) : (
                    <MapPin className="w-4 h-4 text-slate-500 group-hover:text-sky-600" />
                  )}
                </div>
                <div className="truncate">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors truncate">
                    {opt.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium truncate">
                    {opt.address}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0 ml-3">
                <span className="text-[11px] font-extrabold text-slate-500 group-hover:text-sky-700 bg-slate-100 group-hover:bg-sky-100/70 px-2 py-0.5 rounded-full">
                  {opt.distance}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Compare Rides & Pay with PayPal CTA Banner */}
      {destInput && (
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center space-x-2 text-xs text-slate-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="truncate">
              Selected Route: <strong className="text-slate-900 font-bold">{startInput}</strong> ➔ <strong className="text-sky-600 font-bold">{destInput}</strong>
            </span>
          </div>

          <button
            onClick={handleLaunchCalculator}
            className="bg-slate-900 hover:bg-black text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 shrink-0 group"
          >
            <CreditCard className="w-4 h-4 text-amber-400" />
            <span>Compare Fares & Book with PayPal</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
};
