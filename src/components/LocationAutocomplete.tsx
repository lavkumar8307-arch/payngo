'use client';

import React, { useState, useEffect, useRef } from 'react';
import { LocationItem } from '@/types/location';
import {
  Search,
  MapPin,
  Building2,
  Landmark,
  Plane,
  Train,
  LocateFixed,
  Map,
  X,
  Sparkles,
  Globe,
  Loader2,
} from 'lucide-react';

interface LocationAutocompleteProps {
  value: string;
  onChange: (text: string) => void;
  onSelectLocation: (location: LocationItem) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  autoFocus?: boolean;
}

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  value,
  onChange,
  onSelectLocation,
  placeholder = 'Type city, state, attraction, or station...',
  className = '',
  inputClassName = '',
  autoFocus = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions debounced as user types
  useEffect(() => {
    if (!isOpen) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setLoading(true);
    setError(null);

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/locations/search?q=${encodeURIComponent(value)}&limit=10`
        );
        const data = await res.json();
        if (data.success) {
          setResults(data.results || []);
          setHighlightIndex(0);
        } else {
          setError(data.error || 'Search failed');
        }
      } catch (err: any) {
        setError('Unable to fetch locations');
      } finally {
        setLoading(false);
      }
    }, 150);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [value, isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results.length > 0 && results[highlightIndex]) {
        handleSelect(results[highlightIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelect = (item: LocationItem) => {
    onChange(item.name);
    onSelectLocation(item);
    setIsOpen(false);
  };

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'state':
      case 'ut':
        return <Map className="w-4 h-4 text-indigo-600" />;
      case 'airport':
        return <Plane className="w-4 h-4 text-sky-600" />;
      case 'railway_station':
        return <Train className="w-4 h-4 text-amber-600" />;
      case 'attraction':
        return <Landmark className="w-4 h-4 text-purple-600" />;
      case 'gps':
        return <LocateFixed className="w-4 h-4 text-emerald-600" />;
      default:
        return <Building2 className="w-4 h-4 text-slate-500" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'state':
        return <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-bold">STATE</span>;
      case 'ut':
        return <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold">UNION TERRITORY</span>;
      case 'city':
        return <span className="bg-sky-50 text-sky-700 px-2 py-0.5 rounded text-[10px] font-bold">CITY</span>;
      case 'airport':
        return <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold">AIRPORT</span>;
      case 'railway_station':
        return <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold">STATION</span>;
      case 'attraction':
        return <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">ATTRACTION</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">LOCATION</span>;
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      
      {/* Input Field Container */}
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 shrink-0 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          autoFocus={autoFocus}
          onFocus={(e) => {
            setIsOpen(true);
            e.target.select();
          }}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full bg-white border border-slate-200 rounded-xl py-2 pl-9 pr-8 text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 shadow-sm transition-all ${inputClassName}`}
        />

        {loading ? (
          <Loader2 className="w-3.5 h-3.5 text-sky-600 animate-spin absolute right-2.5 shrink-0" />
        ) : value ? (
          <button
            type="button"
            onClick={() => {
              onChange('');
              setIsOpen(true);
              inputRef.current?.focus();
            }}
            className="absolute right-2.5 text-slate-400 hover:text-slate-700 p-0.5 rounded-full transition-colors"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : null}
      </div>

      {/* Autocomplete Suggestions Glassmorphism Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1.5 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl overflow-hidden shadow-2xl max-h-80 overflow-y-auto animate-fade-in divide-y divide-slate-100">
          
          <div className="px-3 py-2 bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-sky-600" />
              <span>Verified Indian Locations Autocomplete</span>
            </span>
            <span>{results.length} Matches</span>
          </div>

          {results.length === 0 && !loading && (
            <div className="p-4 text-center text-xs text-slate-500 font-medium">
              No matching Indian places or cities found. Try typing another city/state name.
            </div>
          )}

          {error && (
            <div className="p-3 text-center text-xs text-rose-600 font-medium bg-rose-50">
              ⚠️ {error}
            </div>
          )}

          {results.map((item, idx) => {
            const isHighlighted = idx === highlightIndex;
            return (
              <div
                key={item.id}
                onMouseEnter={() => setHighlightIndex(idx)}
                onClick={() => handleSelect(item)}
                className={`px-3.5 py-2.5 transition-all cursor-pointer flex items-center justify-between group ${
                  isHighlighted ? 'bg-sky-50/90 text-sky-950 font-bold border-l-4 border-sky-600' : 'hover:bg-slate-50 text-slate-900'
                }`}
              >
                <div className="flex items-center space-x-3 truncate">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    isHighlighted ? 'bg-white shadow-sm' : 'bg-slate-100'
                  }`}>
                    {getLocationIcon(item.type)}
                  </div>

                  <div className="truncate">
                    <div className="text-xs sm:text-sm font-bold flex items-center space-x-2 truncate">
                      <span className="truncate">{item.name}</span>
                      {item.isRemote && (
                        <span className="inline-flex items-center space-x-0.5 text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                          <Globe className="w-2.5 h-2.5" />
                          <span>OSM</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                      {item.state} • India
                    </p>
                  </div>
                </div>

                <div className="shrink-0 ml-2">
                  {getTypeBadge(item.type)}
                </div>
              </div>
            );
          })}

        </div>
      )}

    </div>
  );
};
