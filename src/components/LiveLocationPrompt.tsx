'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  LocateFixed,
  Navigation,
  Sparkles,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { LocationState } from '@/lib/mockData';
import {
  detectLiveLocation,
  getSavedLocation,
  isLocationPromptDismissed,
  dismissLocationPrompt,
  saveUserLocation
} from '@/lib/location';

interface LiveLocationPromptProps {
  currentLocation: LocationState;
  onLocationDetected: (location: LocationState) => void;
  onOpenManualPicker?: () => void;
}

export function LiveLocationPrompt({
  currentLocation,
  onLocationDetected,
  onOpenManualPicker,
}: LiveLocationPromptProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // 1. If we already have a saved location from previous session, restore it
    const saved = getSavedLocation();
    if (saved && !currentLocation.isGPS) {
      onLocationDetected(saved);
      return;
    }

    // 2. Check browser permission state if supported
    if (typeof window !== 'undefined' && 'permissions' in navigator) {
      navigator.permissions
        .query({ name: 'geolocation' as PermissionName })
        .then((permissionStatus) => {
          if (permissionStatus.state === 'granted') {
            // Permission already granted previously, auto-fetch silently
            detectLiveLocation()
              .then((loc) => {
                onLocationDetected(loc);
              })
              .catch(() => {});
          } else if (permissionStatus.state === 'prompt') {
            // Show prompt banner if user hasn't dismissed it
            if (!isLocationPromptDismissed() && !currentLocation.isGPS) {
              const timer = setTimeout(() => setIsVisible(true), 1200);
              return () => clearTimeout(timer);
            }
          }
        })
        .catch(() => {
          if (!isLocationPromptDismissed() && !currentLocation.isGPS) {
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
          }
        });
    } else {
      if (!isLocationPromptDismissed() && !currentLocation.isGPS) {
        const timer = setTimeout(() => setIsVisible(true), 1500);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleRequestLiveLocation = async () => {
    setIsLocating(true);
    setErrorMessage(null);

    try {
      const liveLoc = await detectLiveLocation();
      onLocationDetected(liveLoc);
      setIsLocating(false);
      setSuccessMessage(`Set to ${liveLoc.name}!`);
      setTimeout(() => {
        setIsVisible(false);
        setSuccessMessage(null);
      }, 2400);
    } catch (err: any) {
      setIsLocating(false);
      setErrorMessage(err.message || 'Could not access location.');
    }
  };

  const handleDismiss = () => {
    dismissLocationPrompt();
    setIsVisible(false);
  };

  if (!isVisible && !successMessage) return null;

  return (
    <div className="fixed bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 animate-fade-in pointer-events-auto">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-4 sm:p-5 text-white shadow-2xl shadow-slate-950/60 relative overflow-hidden">
        
        {/* Accent Top Gradient Line */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-sky-500 to-blue-500" />

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          title="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {successMessage ? (
          <div className="flex items-center space-x-3 py-1 animate-fade-in">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Live Location Active</p>
              <p className="text-xs text-emerald-400 mt-0.5">{successMessage}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            <div className="flex items-start space-x-3 pr-6">
              <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0 relative mt-0.5">
                <LocateFixed className="w-5 h-5 text-sky-400 animate-pulse" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-900 animate-ping" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                    Live GPS Location
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white mt-1">
                  Use Your Live Location?
                </h4>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  Allow device location for accurate real-time transit fares in INR, local cab pickup estimates, and places around your city.
                </p>
              </div>
            </div>

            {errorMessage && (
              <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs p-2.5 rounded-xl flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center space-x-2 pt-1">
              <button
                type="button"
                disabled={isLocating}
                onClick={handleRequestLiveLocation}
                className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center space-x-1.5 transform active:scale-95 disabled:opacity-60 cursor-pointer"
              >
                {isLocating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Detecting Location...</span>
                  </>
                ) : (
                  <>
                    <LocateFixed className="w-3.5 h-3.5" />
                    <span>Enable Live Location</span>
                  </>
                )}
              </button>

              {onOpenManualPicker && (
                <button
                  type="button"
                  onClick={() => {
                    handleDismiss();
                    onOpenManualPicker();
                  }}
                  className="px-3 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors whitespace-nowrap cursor-pointer"
                >
                  Choose City
                </button>
              )}
            </div>

            <p className="text-[10px] text-slate-500 text-center">
              Your location is stored locally and only used to display local routes &amp; fares.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default LiveLocationPrompt;

