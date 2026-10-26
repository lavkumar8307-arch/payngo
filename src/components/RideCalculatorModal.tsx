'use client';

import React, { useState, useEffect } from 'react';
import { Place } from '@/types';
import { calculateFares, AppRideOption } from '@/lib/fareEngine';
import {
  X,
  Clock,
  ShieldCheck,
  Plane,
  Train,
  Car,
  Bus,
  Ship,
  Check,
  ArrowRight,
  Zap,
  Leaf,
  DollarSign,
  Navigation,
  Compass,
  CreditCard,
} from 'lucide-react';

interface RideCalculatorModalProps {
  place: Place | null;
  currency: 'INR' | 'USD';
  onClose: () => void;
  onBookRideWithPayPal: (ride: any, place: Place) => void;
}

export const RideCalculatorModal: React.FC<RideCalculatorModalProps> = ({
  place,
  currency,
  onClose,
  onBookRideWithPayPal,
}) => {
  const [rides, setRides] = useState<AppRideOption[]>([]);
  const [selectedRide, setSelectedRide] = useState<AppRideOption | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | 'fastest' | 'value' | 'cabs'>('all');

  useEffect(() => {
    if (!place) return;
    const computed = calculateFares(place.distanceKm, 1.15, place.name);
    setRides(computed);
    if (computed.length > 0) {
      setSelectedRide(computed[0]);
    }
  }, [place]);

  if (!place) return null;

  const lowestRide = rides[0];
  const maxRide = rides.find((r) => r.provider === 'Uber') || rides[rides.length - 1];
  const totalSavingsINR =
    maxRide && lowestRide ? Math.max(0, maxRide.estimatedPriceINR - lowestRide.estimatedPriceINR) : 0;
  const totalSavingsUSD = parseFloat((totalSavingsINR / 83.2).toFixed(2));

  // Helper to format minutes into "3h 15m" or "45m"
  const formatDuration = (minutes: number): string => {
    if (!minutes || minutes <= 0) return '45m';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  // Helper to clean provider name for presentation
  const cleanProviderName = (provider: string): string => {
    if (provider.includes('IndiGo / Air India')) return 'IndiGo / Air India';
    if (provider.includes('IRCTC')) return 'IRCTC Superfast Express';
    if (provider.includes('Outstation')) return 'Outstation Prime SUV';
    if (provider.includes('Zingbus') || provider.includes('AbhiBus')) return 'Zingbus Luxury Multi-Axle';
    if (provider.includes('Shipping Corp')) return 'SCI Express Passenger Ferry';
    return provider;
  };

  // Helper to clean subtitle description
  const cleanSubtitle = (ride: AppRideOption): string => {
    const p = ride.provider.toLowerCase();
    const v = ride.vehicleType.toLowerCase();
    if (p.includes('indigo') || p.includes('air india') || v.includes('flight')) {
      return 'Domestic Flight · Direct Runway';
    }
    if (p.includes('irctc') || v.includes('rail') || v.includes('vande bharat')) {
      return 'High-Speed Rail · AC Chair Car';
    }
    if (p.includes('outstation') || v.includes('chauffeur') || v.includes('suv')) {
      return 'Private Chauffeur · Air Conditioned';
    }
    if (p.includes('zingbus') || p.includes('abhibus') || v.includes('bus')) {
      return 'Volvo Sleeper · Wifi & Charging';
    }
    if (p.includes('shipping') || v.includes('ferry')) {
      return 'Passenger Vessel · Coastal Waterway';
    }
    return ride.vehicleType.split('(')[0].trim() || 'Express transit';
  };

  // Helper to render transportation icon
  const renderTransitIcon = (iconType: string, className: string = 'w-5 h-5') => {
    const lower = (iconType || '').toLowerCase();
    if (lower.includes('plane') || lower.includes('flight')) {
      return <Plane className={className} />;
    }
    if (lower.includes('train') || lower.includes('rail')) {
      return <Train className={className} />;
    }
    if (lower.includes('bus')) {
      return <Bus className={className} />;
    }
    if (lower.includes('ship') || lower.includes('boat')) {
      return <Ship className={className} />;
    }
    return <Car className={className} />;
  };

  const getDestinationName = (fullName: string): string => {
    return fullName.split(',')[0].trim();
  };

  // Filter rides based on active tab
  const filteredRides = rides.filter((r) => {
    if (activeCategory === 'fastest') {
      const minDuration = Math.min(...rides.map((item) => item.durationMinutes || 9999));
      return (r.durationMinutes || 0) <= minDuration * 1.3;
    }
    if (activeCategory === 'value') {
      return r.badge === 'LOWEST' || (r.percentCheaper && r.percentCheaper >= 40);
    }
    if (activeCategory === 'cabs') {
      return (
        r.provider.toLowerCase().includes('uber') ||
        r.provider.toLowerCase().includes('ola') ||
        r.provider.toLowerCase().includes('outstation')
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-t-[32px] sm:rounded-[32px] max-w-lg w-full overflow-hidden shadow-2xl relative flex flex-col max-h-[92vh] border border-slate-200">
        
        {/* Executive Midnight Navy Header */}
        <div className="bg-slate-900 p-6 pb-5 text-white relative border-b border-slate-800">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-xs font-semibold text-blue-400">
                <Compass className="w-3.5 h-3.5 text-blue-400" />
                <span>Multi-Modal Fare Comparison</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {place.distanceKm > 350
                  ? 'Inter-State Transit'
                  : place.distanceKm >= 60
                  ? 'Inter-City Highway'
                  : 'City Route Comparison'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Connected Timeline Journey Card */}
          <div className="mt-4 p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
            <div className="flex items-center justify-between relative">
              {/* Origin */}
              <div className="flex flex-col items-start z-10">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">DEPART</span>
                <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Your Location
                </span>
              </div>

              {/* Transit Center Badge */}
              <div className="flex-1 flex items-center justify-center relative mx-4">
                <div className="w-full border-t border-dashed border-slate-600 absolute" />
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center z-10 shadow-md">
                  {renderTransitIcon(selectedRide?.icon || 'Plane', 'w-4 h-4')}
                </div>
              </div>

              {/* Destination */}
              <div className="flex flex-col items-end z-10 max-w-[150px] text-right">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">ARRIVE</span>
                <span className="text-xs sm:text-sm font-bold text-slate-100 truncate w-full text-right mt-0.5" title={place.name}>
                  {getDestinationName(place.name)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2.5 border-t border-slate-700/60 font-medium">
              <span className="flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5 text-slate-400" />
                <span>{place.distanceKm.toLocaleString('en-IN')} km direct route</span>
              </span>
              <span className="text-blue-300 font-semibold">{rides.length} carriers available</span>
            </div>
          </div>
        </div>

        {/* Filter Tabs Bar */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center space-x-1.5">
            {[
              { id: 'all', label: 'All Options', icon: null },
              { id: 'fastest', label: 'Fastest', icon: Zap },
              { id: 'value', label: 'Best Value', icon: DollarSign },
              { id: 'cabs', label: 'Cabs & Rides', icon: Car },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center space-x-1 ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  {Icon && <Icon className="w-3 h-3 text-inherit" />}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="hidden sm:flex items-center text-[11px] text-slate-500 font-semibold">
            <span>Currency: <strong>{currency}</strong></span>
          </div>
        </div>

        {/* Transit Cards List */}
        <div className="p-4 sm:p-5 bg-slate-50/60 flex-1 overflow-y-auto space-y-2.5">
          {filteredRides.map((r, idx) => {
            const isSelected = selectedRide?.provider === r.provider;
            const isLowest = r.badge === 'LOWEST' || (r.percentCheaper && r.percentCheaper >= 70);
            const isFastest = r.badge === 'FASTEST' || (r.durationMinutes && r.durationMinutes <= 90);
            const price =
              currency === 'USD'
                ? `$${r.estimatedPriceUSD} USD`
                : `₹${r.estimatedPriceINR.toLocaleString('en-IN')} INR`;

            return (
              <div
                key={idx}
                onClick={() => setSelectedRide(r)}
                className={`group p-4 rounded-2xl transition-all cursor-pointer relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-white border-2 border-blue-600 shadow-md ring-1 ring-blue-600/20'
                    : 'bg-white border border-slate-200 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                {/* Radio & Vehicle Info */}
                <div className="flex items-start sm:items-center space-x-3.5 min-w-0">
                  {/* Select Indicator */}
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 sm:mt-0 transition-colors ${
                      isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>

                  {/* Mode Icon */}
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200/80'
                    }`}
                  >
                    {renderTransitIcon(r.icon, 'w-5 h-5')}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                        {cleanProviderName(r.provider)}
                      </span>

                      {isLowest && (
                        <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                          Lowest Fare
                        </span>
                      )}

                      {isFastest && !isLowest && (
                        <span className="bg-indigo-50 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-200">
                          Fastest Transit
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                      {cleanSubtitle(r)}
                    </p>

                    {/* Meta Specs (Duration, ETA, Eco/Seats) */}
                    <div className="flex items-center gap-2.5 text-xs text-slate-500 font-medium mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDuration(r.durationMinutes || 45)}</span>
                      </span>
                      <span className="text-slate-300">•</span>
                      <span>ETA ~{r.etaMinutes || 5}m</span>
                      {r.badge === 'ECO FRIENDLY' && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                            <Leaf className="w-3 h-3 text-emerald-600" />
                            <span>Eco Friendly</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pricing & Savings */}
                <div className="text-left sm:text-right shrink-0 pl-8 sm:pl-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 flex sm:flex-col items-center sm:items-end justify-between">
                  <div className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                    {price}
                  </div>
                  {r.percentCheaper ? (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Save {r.percentCheaper}%
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-slate-400">Standard Rate</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Checkout & Action Panel */}
        <div className="p-5 pt-3 pb-5 bg-white border-t border-slate-200 flex flex-col items-center space-y-3">
          {/* Total Savings Highlight Pill */}
          {totalSavingsINR > 0 && (
            <div className="w-full bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-xs text-emerald-900 font-medium flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                <span>
                  You save <strong>{currency === 'USD' ? `$${totalSavingsUSD} USD` : `₹${totalSavingsINR.toLocaleString('en-IN')}`}</strong> compared to premium options!
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                Best Rate
              </span>
            </div>
          )}

          {/* Main Book with PayPal CTA */}
          <button
            disabled={!selectedRide}
            onClick={() => selectedRide && onBookRideWithPayPal(selectedRide, place)}
            className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3.5 px-6 rounded-2xl text-sm flex items-center justify-between shadow-lg shadow-slate-900/10 transition-all hover:scale-[1.01] active:scale-[0.99] group disabled:opacity-50"
          >
            <div className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-amber-400" />
              <span>
                Book {cleanProviderName(selectedRide?.provider || '')} with PayPal
              </span>
            </div>

            <div className="flex items-center space-x-2 font-black">
              <span>
                {selectedRide
                  ? currency === 'USD'
                    ? `$${selectedRide.estimatedPriceUSD} USD`
                    : `₹${selectedRide.estimatedPriceINR.toLocaleString('en-IN')} INR`
                  : ''}
              </span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Trust Guarantees */}
          <div className="flex items-center justify-center space-x-4 text-[11px] text-slate-500 font-medium">
            <span className="flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>PayPal Buyer Protection</span>
            </span>
            <span>•</span>
            <span>Instant Digital Receipt</span>
          </div>
        </div>

      </div>
    </div>
  );
};
