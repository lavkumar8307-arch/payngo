'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { LocationState } from '@/lib/mockData';
import {
  Sparkles,
  MapPin,
  DollarSign,
  LocateFixed,
  Compass,
  Navigation,
  Bot,
  Home as HomeIcon,
  Search,
  Luggage,
  User as UserIcon,
  LogOut,
  ChevronDown,
  CheckCircle2,
  Ticket,
} from 'lucide-react';
import { useCurrentUser } from '@/lib/auth';

interface NavbarProps {
  currentLocation: LocationState;
  onOpenLocationPicker: () => void;
  currency: 'INR' | 'USD';
  onCurrencyToggle: () => void;
  onOpenChat: () => void;
  onOpenCompare?: () => void;
  onOpenAuth?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLocation,
  onOpenLocationPicker,
  currency,
  onCurrencyToggle,
  onOpenChat,
  onOpenCompare,
  onOpenAuth,
}) => {
  const { user, logout } = useCurrentUser();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-4 z-50 w-full flex justify-center px-4 pointer-events-none mb-3">
      <nav className="pointer-events-auto bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-xl shadow-slate-200/50 rounded-full px-3 sm:px-5 py-2 flex items-center justify-between gap-2 sm:gap-4 max-w-6xl w-full transition-all">
        
        {/* Left Brand Circle Icon & Title */}
        <Link href="/" className="flex items-center space-x-2 shrink-0 group">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-900 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 text-emerald-400 fill-emerald-400 animate-pulse" />
          </div>
          <span className="hidden sm:inline-block font-black text-slate-900 text-sm sm:text-base tracking-tight">
            PayN<span className="text-sky-600">Go</span>
          </span>
        </Link>

        {/* Navigation Buttons: HOME, EXPLORE, PLANNER, MY TRIPS, COMPARE */}
        <div className="flex items-center space-x-1 sm:space-x-2.5 text-xs sm:text-sm font-bold text-slate-700">
          
          {/* HOME */}
          <Link
            href="/"
            className="px-2.5 py-1.5 rounded-full hover:bg-slate-100 text-slate-900 transition-colors flex items-center space-x-1"
          >
            <HomeIcon className="w-3.5 h-3.5 text-slate-600" />
            <span>Home</span>
          </Link>

          {/* EXPLORE */}
          <Link
            href="/explore"
            className="px-2.5 py-1.5 rounded-full hover:bg-slate-100 text-slate-700 hover:text-slate-950 transition-colors flex items-center space-x-1"
          >
            <Search className="w-3.5 h-3.5 text-sky-600" />
            <span>Explore</span>
          </Link>

          {/* PLANNER */}
          <Link
            href="/planner"
            className="px-2.5 py-1.5 rounded-full hover:bg-slate-100 text-slate-700 hover:text-slate-950 transition-colors flex items-center space-x-1"
          >
            <Compass className="w-3.5 h-3.5 text-indigo-600" />
            <span>Planner</span>
          </Link>

          {/* MY TRIPS / DASHBOARD */}
          <Link
            href="/dashboard"
            className="px-2.5 py-1.5 rounded-full hover:bg-slate-100 text-slate-700 hover:text-slate-950 transition-colors flex items-center space-x-1"
          >
            <Luggage className="w-3.5 h-3.5 text-amber-600" />
            <span>My Trips</span>
          </Link>

          {/* COMPARE */}
          {onOpenCompare && (
            <button
              onClick={onOpenCompare}
              className="px-2.5 py-1.5 rounded-full hover:bg-slate-100 text-slate-700 hover:text-slate-950 transition-colors flex items-center space-x-1 hidden md:flex"
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-600" />
              <span>Compare</span>
            </button>
          )}

          {/* Location Trigger Pill */}
          <button
            onClick={onOpenLocationPicker}
            className="hidden lg:flex items-center space-x-1 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1 rounded-full text-slate-700 transition-colors text-[11px]"
          >
            {currentLocation.isGPS ? (
              <LocateFixed className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <MapPin className="w-3.5 h-3.5 text-sky-600" />
            )}
            <span className="max-w-[100px] truncate font-medium">{currentLocation.name.split(',')[0]}</span>
          </button>
        </div>

        {/* Right Section: USER PROFILE / LOGIN, AI ASSISTANT */}
        <div className="flex items-center space-x-2 shrink-0">
          
          {/* User Profile or Login Trigger */}
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200/90 text-slate-800 rounded-full px-2.5 py-1 text-xs font-bold border border-slate-200 transition-all shadow-sm active:scale-95"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center text-[10px] font-black uppercase shadow-xs">
                  {user.name ? user.name.slice(0, 2).toUpperCase() : user.email.slice(0, 2).toUpperCase()}
                </div>
                <span className="max-w-[90px] sm:max-w-[120px] truncate">{user.name}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Active Traveler" />
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* Profile Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-fade-in text-left">
                  <div className="px-3.5 py-2.5 border-b border-slate-100">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center font-black text-xs uppercase shadow-sm">
                        {user.name ? user.name.slice(0, 2).toUpperCase() : user.email.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-black text-slate-900 truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="mt-2 inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Verified PayNGo Traveler</span>
                    </div>
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center space-x-2 px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Luggage className="w-4 h-4 text-amber-600" />
                    <span>My Trips &amp; Boarding Passes</span>
                  </Link>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center space-x-2 px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors border-t border-slate-100 mt-1"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            onOpenAuth && (
              <button
                onClick={onOpenAuth}
                className="text-xs font-bold text-slate-700 hover:text-slate-950 px-2.5 py-1.5 rounded-full hover:bg-slate-100 transition-colors hidden sm:block"
              >
                Login
              </button>
            )
          )}

          {/* AI ASSISTANT Button */}
          <button
            onClick={onOpenChat}
            className="bg-slate-900 hover:bg-slate-800 text-white font-black text-xs sm:text-sm px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all shadow-md flex items-center space-x-1.5 shrink-0 transform hover:scale-[1.02]"
          >
            <Bot className="w-3.5 h-3.5 text-sky-400" />
            <span>AI Assistant</span>
          </button>

        </div>

      </nav>
    </header>
  );
};
