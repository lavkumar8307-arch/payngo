'use client';

import React, { useState } from 'react';
import { LocationState, POPULAR_LOCATIONS } from '@/lib/mockData';
import { LocationAutocomplete } from '@/components/LocationAutocomplete';
import { LocationItem } from '@/types/location';
import { MapPin, Navigation, Search, X, Check, Compass, LocateFixed, Sparkles } from 'lucide-react';

interface LocationPickerModalProps {
  currentLocation: LocationState;
  onSelectLocation: (loc: LocationState) => void;
  onClose: () => void;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  currentLocation,
  onSelectLocation,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [locating, setLocating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Use browser Geolocation API
  const handleDetectGPS = () => {
    setLocating(true);
    setErrorMsg(null);

    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        let cityName = '';
        let stateName = '';

        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 3500);
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`,
            { signal: controller.signal, headers: { 'Accept-Language': 'en' } }
          );
          clearTimeout(timer);
          if (res.ok) {
            const data = await res.json();
            if (data?.address) {
              const rawCity =
                data.address.city ||
                data.address.town ||
                data.address.suburb ||
                data.address.neighbourhood ||
                data.address.village ||
                data.address.state_district;
              if (rawCity) {
                cityName = rawCity.replace(/\s+(mandal|district|taluk|tehsil)$/i, '').trim();
              }
              if (data.address.state) {
                stateName = data.address.state.trim();
              }
            }
          }
        } catch (e) {
          console.warn('Location reverse geocode error:', e);
        }

        // Fallback: match nearest city from POPULAR_LOCATIONS
        if (!cityName || !stateName) {
          let closest = POPULAR_LOCATIONS[0];
          let minDist = Infinity;
          for (const loc of POPULAR_LOCATIONS) {
            if (loc.isGPS) continue;
            const dist = Math.hypot(loc.lat - latitude, loc.lng - longitude);
            if (dist < minDist) {
              minDist = dist;
              closest = loc;
            }
          }
          if (!cityName) cityName = closest.name.split(',')[0].trim();
          if (!stateName) stateName = closest.name.split(',')[1]?.trim() || 'India';
        }

        const fullName = `${cityName}, ${stateName}`;

        const userLoc: LocationState = {
          id: 'live-gps',
          name: fullName,
          lat: latitude,
          lng: longitude,
          isGPS: true,
        };
        onSelectLocation(userLoc);
        setLocating(false);
        onClose();
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setErrorMsg('Unable to retrieve your location. Falling back to city search.');
        setLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Search filter
  const filteredLocations = POPULAR_LOCATIONS.filter((l) =>
    l.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Custom typed location handler
  const handleAddCustomLocation = () => {
    if (!searchQuery.trim()) return;
    const customLoc: LocationState = {
      id: `custom-${Date.now()}`,
      name: searchQuery.trim(),
      lat: 20.5937 + (Math.random() - 0.5) * 5, // Simulated Lat/Lng for custom typed Indian cities
      lng: 78.9629 + (Math.random() - 0.5) * 5,
    };
    onSelectLocation(customLoc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-50 via-slate-100 to-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-600">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Select Location / State</h3>
              <p className="text-xs text-slate-500">Works across all states, cities & live GPS</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          
          {/* Live GPS Button */}
          <button
            onClick={handleDetectGPS}
            disabled={locating}
            className="w-full bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm py-3 px-4 rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2 transform hover:-translate-y-0.5"
          >
            <LocateFixed className={`w-4 h-4 ${locating ? 'animate-spin' : 'animate-bounce'}`} />
            <span>{locating ? 'Detecting Your GPS Location...' : '📍 Use My Live GPS Location'}</span>
          </button>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Live Autocomplete Search for Any City, State or Location */}
          <div className="relative">
            <LocationAutocomplete
              value={searchQuery}
              onChange={(text) => setSearchQuery(text)}
              onSelectLocation={(loc: LocationItem) => {
                onSelectLocation({
                  id: loc.id,
                  name: loc.name,
                  lat: loc.latitude ?? 20.5937,
                  lng: loc.longitude ?? 78.9629,
                  isGPS: loc.type === 'gps',
                });
                onClose();
              }}
              placeholder="Search or type any state, city, or destination..."
              inputClassName="py-2.5 text-xs font-semibold bg-slate-50 border-slate-200 focus:border-sky-500 rounded-2xl"
              autoFocus
            />
          </div>

          {/* Locations Grid List */}
          <div className="space-y-2 pt-1">
            <p className="text-xs font-bold text-slate-500 px-1">Popular Cities & States:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredLocations.map((loc) => {
                if (loc.isGPS) return null;
                const isSelected = currentLocation.name === loc.name;

                return (
                  <button
                    key={loc.id}
                    onClick={() => {
                      onSelectLocation(loc);
                      onClose();
                    }}
                    className={`p-3 rounded-2xl border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-sky-50 border-sky-400 text-sky-950 shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="flex items-center space-x-2 truncate">
                      <MapPin className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-sky-600' : 'text-slate-400'}`} />
                      <span className="truncate">{loc.name}</span>
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-sky-600 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
