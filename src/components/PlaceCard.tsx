'use client';

import React from 'react';
import { Place } from '@/types';
import { BorderBeam } from './BorderBeam';
import { Star, MapPin, Navigation, Tag, Sparkles, CreditCard, ExternalLink } from 'lucide-react';

interface PlaceCardProps {
  place: Place;
  currency: 'INR' | 'USD';
  onOpenRideCalculator: (place: Place) => void;
  onOpenPayPalCheckout: (place: Place) => void;
  onSelectMap: (place: Place) => void;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({
  place,
  currency,
  onOpenRideCalculator,
  onOpenPayPalCheckout,
  onSelectMap,
}) => {
  const priceUnit = place.category === 'hotel' ? '/ night' : '/ person';
  const displayPrice =
    currency === 'USD'
      ? `$${(place.avgPrice / 83.2).toFixed(0)} ${priceUnit}`
      : `₹${place.avgPrice.toLocaleString('en-IN')} ${priceUnit}`;

  return (
    <BorderBeam size="md" colorVariant="colorful" strength={0.4} active={true}>
      <div className="group relative bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col h-full hover:-translate-y-1">

        {/* Thumbnail Image Container */}
        <div className="relative h-52 w-full overflow-hidden bg-slate-100">
          <img
            src={place.imageUrl}
            alt={place.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-80" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex items-center space-x-2">
            <span
              title="Verified authentic local choice curated for travelers and newcomers"
              className="bg-emerald-600/95 text-white font-bold text-[11px] px-3 py-1 rounded-xl backdrop-blur-md shadow-md flex items-center space-x-1 border border-emerald-400 cursor-help"
            >
              <Sparkles className="w-3.5 h-3.5 text-white fill-white" />
              <span>Our Pick • {place.newcomerScore}% Match</span>
            </span>
          </div>

          <div
            title="Sourced from Google Maps verified ratings"
            className="absolute top-3 right-3 bg-white/95 text-slate-900 text-xs font-black px-2.5 py-1.5 rounded-xl border border-slate-200 backdrop-blur-md flex items-center space-x-1 shadow-md"
          >
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            <span>{place.rating}</span>
            <span className="text-slate-500 font-medium text-[11px]">on Google ({place.reviewsCount})</span>
          </div>

          {/* Category Tag */}
          <div className="absolute bottom-3 left-3">
            <span className="uppercase text-[10px] tracking-wider font-extrabold px-2.5 py-1 rounded-lg bg-blue-600/95 text-white backdrop-blur-md border border-blue-400/40 shadow-md">
              {place.category}
            </span>
          </div>
        </div>

        {/* Card Content Body */}
        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">

          <div>
            <div className="flex items-start justify-between gap-2">
              <h3
                onClick={() => onSelectMap(place)}
                className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer flex items-center space-x-1.5"
              >
                <span>{place.name}</span>
                <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" />
              </h3>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200 shrink-0">
                {displayPrice}
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-1 flex items-center space-x-1 truncate font-medium">
              <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">{place.address}</span>
              <span className="text-slate-400 font-bold">• {place.distanceKm} km</span>
            </p>

            <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
              {place.description}
            </p>

            {/* Popular Signature Item Highlight */}
            {place.popularItem && (
              <div
                title={place.popularItem}
                className="mt-3.5 bg-amber-50/90 border border-amber-200/80 rounded-2xl p-2.5 flex items-center space-x-2.5 shadow-sm"
              >
                <Tag className="w-4 h-4 text-amber-600 shrink-0" />
                <p className="text-[11px] text-slate-800 font-medium line-clamp-2">
                  <span className="text-amber-800 font-bold">Must Try:</span> {place.popularItem}
                </p>
              </div>
            )}

            {/* Tags */}
            <div className="mt-3.5 flex flex-wrap gap-1.5">
              {place.tags.map((t, idx) => (
                <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-2.5 py-0.5 rounded-lg border border-slate-200">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2.5">

            {/* Compare Rides Button */}
            <button
              onClick={() => onOpenRideCalculator(place)}
              className="w-full bg-slate-100 hover:bg-slate-200/80 text-slate-800 border border-slate-200 font-semibold text-xs py-2.5 px-3 rounded-2xl transition-all flex items-center justify-center space-x-1.5 shadow-sm"
            >
              <Navigation className="w-3.5 h-3.5 text-blue-600" />
              <span>Compare Fares</span>
            </button>

            {/* Book / Reserve Button */}
            <button
              onClick={() => onOpenPayPalCheckout(place)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-3 rounded-2xl shadow-md transition-all flex items-center justify-center space-x-1.5 transform hover:-translate-y-0.5"
            >
              <CreditCard className="w-3.5 h-3.5 text-white" />
              <span>Book / Reserve</span>
            </button>

          </div>

        </div>

      </div>
    </BorderBeam>
  );
};
