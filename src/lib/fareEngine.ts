import { RideOption } from '../types';

export interface AppRideOption {
  provider: string;
  vehicleType: string;
  estimatedPriceINR: number;
  estimatedPriceUSD: number;
  durationMinutes: number;
  etaMinutes: number;
  badge?: 'LOWEST' | 'FASTEST' | 'BEST VALUE' | 'ECO FRIENDLY' | 'POPULAR';
  percentCheaper?: number;
  brandColor: string;
  bgColor: string;
  borderColor: string;
  logoSvg: string;
  icon: string;
  availabilityNote?: string;
}

export function calculateHaversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  if (!lat1 || !lng1 || !lat2 || !lng2) return 15;
  const R = 6371; // Earth radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.max(1, Math.round(distance * 10) / 10);
}

export function calculateFares(
  distanceKm: number,
  surgeMultiplier: number = 1.15,
  placeName: string = ''
): AppRideOption[] {
  const usdRate = 83.2;
  const lowerName = placeName.toLowerCase();

  // Check if target is an Island Union Territory (Andaman & Nicobar or Lakshadweep)
  const isIsland =
    lowerName.includes('andaman') ||
    lowerName.includes('nicobar') ||
    lowerName.includes('port blair') ||
    lowerName.includes('lakshadweep') ||
    lowerName.includes('kavaratti');

  // 1. Island Union Territory Access (Air & Sea Only)
  if (isIsland) {
    const flightPrice = 5400;
    const shipPrice = 1850;

    return [
      {
        provider: 'IndiGo / Air India Flight',
        vehicleType: 'Direct Flight to Port Blair (IXZ) / Agatti (AGX)',
        estimatedPriceINR: flightPrice,
        estimatedPriceUSD: parseFloat((flightPrice / usdRate).toFixed(2)),
        durationMinutes: 140, // 2h 20m
        etaMinutes: 60,
        badge: 'FASTEST',
        percentCheaper: 0,
        brandColor: '#0284C7',
        bgColor: 'bg-sky-500/10',
        borderColor: 'border-sky-400',
        logoSvg: '✈️',
        icon: 'Plane',
        availabilityNote: 'Island Territory: Accessible via Domestic Air Route',
      },
      {
        provider: 'Shipping Corp of India (SCI)',
        vehicleType: 'Passenger Ferry / Ocean Liner Ship',
        estimatedPriceINR: shipPrice,
        estimatedPriceUSD: parseFloat((shipPrice / usdRate).toFixed(2)),
        durationMinutes: 2880, // ~48h
        etaMinutes: 120,
        badge: 'LOWEST',
        percentCheaper: Math.round(((flightPrice - shipPrice) / flightPrice) * 100),
        brandColor: '#0D9488',
        bgColor: 'bg-teal-500/10',
        borderColor: 'border-teal-400',
        logoSvg: '🚢',
        icon: 'Ship',
        availabilityNote: 'Sea Passenger Vessel from Chennai / Vizag / Kolkata',
      },
    ];
  }

  // 2. Long Distance Inter-State Travel (> 350 km, e.g. Bihar to Hyderabad ~1,140km)
  if (distanceKm > 350) {
    const flightPrice = Math.round(3400 + distanceKm * 1.6);
    const trainPrice = Math.round(750 + distanceKm * 0.85);
    const cabPrice = Math.round(3500 + distanceKm * 12);

    const maxPrice = cabPrice;

    return [
      {
        provider: 'IndiGo / Air India Flight',
        vehicleType: 'Commercial Domestic Flight (Direct / 1-Stop)',
        estimatedPriceINR: flightPrice,
        estimatedPriceUSD: parseFloat((flightPrice / usdRate).toFixed(2)),
        durationMinutes: Math.round(120 + distanceKm * 0.042), // ~3h 15m for 1780km direct flight
        etaMinutes: 45,
        badge: 'FASTEST',
        percentCheaper: Math.round(((maxPrice - flightPrice) / maxPrice) * 100),
        brandColor: '#0284C7',
        bgColor: 'bg-sky-500/10',
        borderColor: 'border-sky-400',
        logoSvg: '✈️',
        icon: 'Plane',
        availabilityNote: 'Direct / Connecting flight route available across all major airports.',
      },
      {
        provider: 'IRCTC Indian Railways',
        vehicleType: 'Vande Bharat / Rajdhani / Superfast Express (2AC/3AC)',
        estimatedPriceINR: trainPrice,
        estimatedPriceUSD: parseFloat((trainPrice / usdRate).toFixed(2)),
        durationMinutes: Math.round(distanceKm * 1.15), // ~34h 10m for 1780km express train
        etaMinutes: 60,
        badge: 'POPULAR',
        percentCheaper: Math.round(((maxPrice - trainPrice) / maxPrice) * 100),
        brandColor: '#D97706',
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-400',
        logoSvg: '🚆',
        icon: 'Train',
        availabilityNote: 'Verified rail connectivity with reserved AC berths.',
      },
      {
        provider: 'Outstation Private SUV Rental',
        vehicleType: 'Chauffeur Driven SUV / Innova Crysta',
        estimatedPriceINR: cabPrice,
        estimatedPriceUSD: parseFloat((cabPrice / usdRate).toFixed(2)),
        durationMinutes: Math.round(distanceKm * 1.228), // ~36h 30m for 1780km highway driving
        etaMinutes: 30,
        brandColor: '#0F172A',
        bgColor: 'bg-slate-900',
        borderColor: 'border-slate-700',
        logoSvg: '🚖',
        icon: 'Car',
        availabilityNote: 'Private long-distance chauffeur rental for group/family travel.',
      },
    ];
  }

  // 3. Medium Distance Inter-City Travel (60 km - 350 km, e.g. Delhi to Agra, Mumbai to Pune)
  if (distanceKm >= 60) {
    const busPrice = Math.round(250 + distanceKm * 1.4);
    const trainPrice = Math.round(180 + distanceKm * 1.6);
    const cabPrice = Math.round(800 + distanceKm * 10.5 * surgeMultiplier);
    const uberIntercity = Math.round(950 + distanceKm * 12 * surgeMultiplier);

    const maxPrice = uberIntercity;

    return [
      {
        provider: 'Zingbus / AbhiBus Express',
        vehicleType: 'AC Volvo Multi-Axle Intercity Bus',
        estimatedPriceINR: busPrice,
        estimatedPriceUSD: parseFloat((busPrice / usdRate).toFixed(2)),
        durationMinutes: Math.round(distanceKm * 1.2 + 20),
        etaMinutes: 15,
        badge: 'LOWEST',
        percentCheaper: Math.round(((maxPrice - busPrice) / maxPrice) * 100),
        brandColor: '#10B981',
        bgColor: 'bg-emerald-500/10',
        borderColor: 'border-emerald-400',
        logoSvg: '🚌',
        icon: 'Bus',
      },
      {
        provider: 'IRCTC Intercity Rail',
        vehicleType: 'Shatabdi / Vande Bharat Express',
        estimatedPriceINR: trainPrice,
        estimatedPriceUSD: parseFloat((trainPrice / usdRate).toFixed(2)),
        durationMinutes: Math.round(distanceKm * 0.95 + 15),
        etaMinutes: 25,
        badge: 'FASTEST',
        percentCheaper: Math.round(((maxPrice - trainPrice) / maxPrice) * 100),
        brandColor: '#D97706',
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-400',
        logoSvg: '🚆',
        icon: 'Train',
      },
      {
        provider: 'Ola Outstation Cab',
        vehicleType: 'Intercity Sedan / SUV',
        estimatedPriceINR: cabPrice,
        estimatedPriceUSD: parseFloat((cabPrice / usdRate).toFixed(2)),
        durationMinutes: Math.round(distanceKm * 1.1),
        etaMinutes: 12,
        badge: 'BEST VALUE',
        percentCheaper: Math.round(((maxPrice - cabPrice) / maxPrice) * 100),
        brandColor: '#84CC16',
        bgColor: 'bg-lime-500/10',
        borderColor: 'border-lime-400',
        logoSvg: '🚖',
        icon: 'Car',
      },
      {
        provider: 'Uber Intercity',
        vehicleType: 'Uber Outstation Premier Cab',
        estimatedPriceINR: uberIntercity,
        estimatedPriceUSD: parseFloat((uberIntercity / usdRate).toFixed(2)),
        durationMinutes: Math.round(distanceKm * 1.05),
        etaMinutes: 10,
        brandColor: '#0F172A',
        bgColor: 'bg-slate-900',
        borderColor: 'border-slate-700',
        logoSvg: '🚗',
        icon: 'CarFront',
      },
    ];
  }

  // 4. Short Distance Local Intracity Commute (< 60 km)
  const rapidoPrice = Math.round((20 + distanceKm * 10) * surgeMultiplier);
  const olaAutoPrice = Math.round((30 + distanceKm * 14) * surgeMultiplier);
  const uberGoPrice = Math.round((50 + distanceKm * 22) * surgeMultiplier);
  const inDrivePrice = Math.round((45 + distanceKm * 18) * surgeMultiplier);
  const metroPrice = Math.round(15 + distanceKm * 4);

  const maxPrice = uberGoPrice;

  return [
    {
      provider: 'Rapido',
      vehicleType: 'Rapido Bike / Auto',
      estimatedPriceINR: rapidoPrice,
      estimatedPriceUSD: parseFloat((rapidoPrice / usdRate).toFixed(2)),
      durationMinutes: Math.round(distanceKm * 2.5 + 3),
      etaMinutes: 2,
      badge: 'LOWEST',
      percentCheaper: Math.round(((maxPrice - rapidoPrice) / maxPrice) * 100),
      brandColor: '#FACC15',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-400',
      logoSvg: '⚡',
      icon: 'Bike',
    },
    {
      provider: 'Ola',
      vehicleType: 'Ola Auto / Mini',
      estimatedPriceINR: olaAutoPrice,
      estimatedPriceUSD: parseFloat((olaAutoPrice / usdRate).toFixed(2)),
      durationMinutes: Math.round(distanceKm * 3.2 + 4),
      etaMinutes: 3,
      badge: 'BEST VALUE',
      percentCheaper: Math.round(((maxPrice - olaAutoPrice) / maxPrice) * 100),
      brandColor: '#84CC16',
      bgColor: 'bg-lime-500/10',
      borderColor: 'border-lime-400/60',
      logoSvg: '🚖',
      icon: 'Car',
    },
    {
      provider: 'InDrive',
      vehicleType: 'InDrive Cab & Auto',
      estimatedPriceINR: inDrivePrice,
      estimatedPriceUSD: parseFloat((inDrivePrice / usdRate).toFixed(2)),
      durationMinutes: Math.round(distanceKm * 3.3 + 4),
      etaMinutes: 4,
      percentCheaper: Math.round(((maxPrice - inDrivePrice) / maxPrice) * 100),
      brandColor: '#10B981',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/40',
      logoSvg: '🚕',
      icon: 'Car',
    },
    {
      provider: 'Uber',
      vehicleType: 'Uber Go / Premier Cab',
      estimatedPriceINR: uberGoPrice,
      estimatedPriceUSD: parseFloat((uberGoPrice / usdRate).toFixed(2)),
      durationMinutes: Math.round(distanceKm * 3.5 + 5),
      etaMinutes: 5,
      brandColor: '#38BDF8',
      bgColor: 'bg-slate-900',
      borderColor: 'border-slate-700',
      logoSvg: '🚗',
      icon: 'CarFront',
    },
    {
      provider: 'Metro',
      vehicleType: 'City Metro Express',
      estimatedPriceINR: metroPrice,
      estimatedPriceUSD: parseFloat((metroPrice / usdRate).toFixed(2)),
      durationMinutes: Math.round(distanceKm * 2.8 + 6),
      etaMinutes: 5,
      badge: 'ECO FRIENDLY',
      percentCheaper: Math.round(((maxPrice - metroPrice) / maxPrice) * 100),
      brandColor: '#A855F7',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/40',
      logoSvg: '🚇',
      icon: 'Train',
    },
  ];
}
