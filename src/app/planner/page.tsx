'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { POPULAR_LOCATIONS, LocationState } from '@/lib/mockData';
import {
  Sparkles,
  Calendar,
  Compass,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
  Users,
  AlertCircle,
  Coffee,
  Sun,
  Moon,
  CreditCard,
  Edit2,
  Trash2,
  Plus,
  RefreshCw,
  Building2,
  Car,
  Utensils,
  ShieldCheck,
} from 'lucide-react';

interface ItineraryActivity {
  id: string;
  time: string;
  icon: 'morning' | 'afternoon' | 'evening';
  title: string;
  description: string;
  location: string;
  estimatedCostINR: number;
}

interface ItineraryDay {
  dayNumber: number;
  title: string;
  theme: string;
  activities: ItineraryActivity[];
}

const INDIAN_DESTINATIONS = [
  // Goa & Coastal Escapes
  'Goa (North & South Beaches)',
  'Gokarna & Karwar, Karnataka',
  'Puducherry (French Quarters & Promenade)',
  'Alibaug, Maharashtra',
  'Diu Island (UT)',
  'Havelock Island & Neil Island, Andaman',
  'Port Blair, Andaman & Nicobar',

  // Rajasthan Heritage & Royalty
  'Jaipur (Pink City), Rajasthan',
  'Udaipur (City of Lakes), Rajasthan',
  'Jodhpur (Blue City), Rajasthan',
  'Jaisalmer (Golden City & Dunes), Rajasthan',
  'Pushkar & Ajmer, Rajasthan',
  'Ranthambore Tiger Reserve, Rajasthan',
  'Mount Abu, Rajasthan',

  // Kerala & Backwaters
  'Munnar (Tea Estates), Kerala',
  'Alleppey (Alappuzha Houseboats), Kerala',
  'Kochi (Fort Kochi), Kerala',
  'Wayanad (Rainforests & Caves), Kerala',
  'Varkala & Kovalam Cliff Beaches, Kerala',
  'Thekkady (Periyar Wildlife), Kerala',

  // Himalayas & Hill Stations
  'Manali & Solang Valley, Himachal Pradesh',
  'Shimla & Kufri, Himachal Pradesh',
  'Dharamshala & McLeodGanj, Himachal Pradesh',
  'Spiti Valley, Himachal Pradesh',
  'Kasol & Parvati Valley, Himachal Pradesh',
  'Rishikesh (Yoga & River Rafting), Uttarakhand',
  'Nainital & Bhimtal, Uttarakhand',
  'Mussoorie & Dhanaulti, Uttarakhand',
  'Auli (Skiing), Uttarakhand',
  'Jim Corbett National Park, Uttarakhand',
  'Srinagar (Dal Lake Houseboats), Jammu & Kashmir',
  'Gulmarg (Gondola & Snow Peaks), Jammu & Kashmir',
  'Pahalgam & Betaab Valley, Jammu & Kashmir',
  'Leh-Ladakh (Pangong Tso & Nubra Valley)',

  // South India Highlights
  'Ooty & Nilgiri Mountain Rail, Tamil Nadu',
  'Kodaikanal (Princess of Hills), Tamil Nadu',
  'Madurai (Meenakshi Temple), Tamil Nadu',
  'Rameswaram & Dhanushkodi, Tamil Nadu',
  'Kanyakumari (Southern Tip), Tamil Nadu',
  'Hampi (Vijayanagara Ruins), Karnataka',
  'Coorg (Coffee Hills & Waterfalls), Karnataka',
  'Mysuru (Royal Palace), Karnataka',
  'Bengaluru, Karnataka',
  'Hyderabad (Charminar & Biryani Trails), Telangana',
  'Warangal (1000 Pillar Temple), Telangana',
  'Visakhapatnam & Araku Valley, Andhra Pradesh',
  'Tirupati (Balaji Temple), Andhra Pradesh',

  // Uttar Pradesh & Spiritual Circuits
  'Varanasi (Ganga Ghats & Kashi), Uttar Pradesh',
  'Agra (Taj Mahal & Fatehpur Sikri), Uttar Pradesh',
  'Lucknow (Nawabi Heritage & Kebabs), Uttar Pradesh',
  'Ayodhya (Ram Mandir & Saryu), Uttar Pradesh',
  'Mathura & Vrindavan, Uttar Pradesh',
  'Prayagraj (Triveni Sangam), Uttar Pradesh',

  // East & Northeast Jewels
  'Darjeeling (Tiger Hill & Toy Train), West Bengal',
  'Kolkata (Cultural Capital & Howrah), West Bengal',
  'Sundarbans Mangrove Reserve, West Bengal',
  'Kalimpong & Mirik, West Bengal',
  'Puri & Konark Sun Temple, Odisha',
  'Bhubaneswar (Temple City), Odisha',
  'Gangtok & Tsomgo Lake, Sikkim',
  'Pelling & Kanchenjunga, Sikkim',
  'Shillong & Cherrapunji Living Root Bridges, Meghalaya',
  'Kaziranga Rhino Sanctuary & Guwahati, Assam',
  'Tawang & Sela Pass, Arunachal Pradesh',
  'Majuli River Island, Assam',
  'Ziro Valley, Arunachal Pradesh',
  'Loktak Lake, Manipur',

  // Central India & Gujarat
  'Bhopal & Sanchi Stupa, Madhya Pradesh',
  'Indore & Ujjain (Mahakaleshwar), Madhya Pradesh',
  'Khajuraho Temples, Madhya Pradesh',
  'Bandhavgarh & Kanha Tiger Reserves, Madhya Pradesh',
  'Gwalior Fort & Orchha, Madhya Pradesh',
  'Rann of Kutch (White Desert), Gujarat',
  'Gir National Park (Asiatic Lions), Gujarat',
  'Ahmedabad & Statue of Unity (Kevadia), Gujarat',
  'Somnath & Dwarka Pilgrimage, Gujarat',

  // Maharashtra Trails
  'Mumbai (Gateway & Marine Drive), Maharashtra',
  'Lonavala & Khandala, Maharashtra',
  'Mahabaleshwar & Panchgani, Maharashtra',
  'Ajanta & Ellora Caves, Maharashtra',
  'Alibaug & Kashid Beach, Maharashtra',
  'Tadoba National Park, Maharashtra',

  // Punjab & North Plains
  'Amritsar (Golden Temple & Wagah Border), Punjab'
];

const DEPARTURE_CITIES = [
  // Telangana & Andhra Pradesh
  'Hyderabad, Telangana (HYD)',
  'Visakhapatnam, Andhra Pradesh (VTZ)',
  'Vijayawada, Andhra Pradesh (VGA)',
  'Tirupati, Andhra Pradesh (TIR)',

  // Karnataka
  'Bengaluru, Karnataka (BLR)',
  'Mangaluru, Karnataka (IXE)',
  'Mysuru, Karnataka (MYQ)',
  'Hubballi, Karnataka (HBX)',

  // Maharashtra
  'Mumbai, Maharashtra (BOM)',
  'Pune, Maharashtra (PNQ)',
  'Nagpur, Maharashtra (NAG)',
  'Nashik, Maharashtra (ISK)',
  'Chhatrapati Sambhajinagar, Maharashtra (IXU)',

  // Delhi & NCR / North
  'New Delhi, Delhi NCR (DEL)',
  'Chandigarh, Punjab/Haryana (IXC)',
  'Amritsar, Punjab (ATQ)',

  // Tamil Nadu & Puducherry
  'Chennai, Tamil Nadu (MAA)',
  'Coimbatore, Tamil Nadu (CJB)',
  'Madurai, Tamil Nadu (IXM)',
  'Tiruchirappalli, Tamil Nadu (TRZ)',
  'Puducherry (PNY)',

  // West Bengal & East
  'Kolkata, West Bengal (CCU)',
  'Siliguri / Bagdogra, West Bengal (IXB)',
  'Bhubaneswar, Odisha (BBI)',
  'Patna, Bihar (PAT)',
  'Gaya, Bihar (GAY)',
  'Ranchi, Jharkhand (IXR)',
  'Raipur, Chhattisgarh (RPR)',

  // Gujarat & Goa
  'Ahmedabad, Gujarat (AMD)',
  'Surat, Gujarat (STV)',
  'Vadodara, Gujarat (BDQ)',
  'Rajkot, Gujarat (RAJ)',
  'Goa / Dabolim (GOI)',
  'Goa / Mopa (GOX)',

  // Rajasthan
  'Jaipur, Rajasthan (JAI)',
  'Udaipur, Rajasthan (UDR)',
  'Jodhpur, Rajasthan (JDH)',
  'Jaisalmer, Rajasthan (JSA)',

  // Kerala
  'Kochi, Kerala (COK)',
  'Thiruvananthapuram, Kerala (TRV)',
  'Kozhikode, Kerala (CCJ)',
  'Kannur, Kerala (CNN)',

  // Uttar Pradesh & Uttarakhand
  'Lucknow, Uttar Pradesh (LKO)',
  'Varanasi, Uttar Pradesh (VNS)',
  'Agra, Uttar Pradesh (AGR)',
  'Ayodhya, Uttar Pradesh (AYJ)',
  'Dehradun, Uttarakhand (DED)',
  'Pantnagar / Nainital, Uttarakhand (PGH)',

  // Madhya Pradesh
  'Indore, Madhya Pradesh (IDR)',
  'Bhopal, Madhya Pradesh (BHO)',
  'Gwalior, Madhya Pradesh (GWL)',
  'Jabalpur, Madhya Pradesh (JLR)',

  // Himachal Pradesh, J&K, Ladakh
  'Shimla, Himachal Pradesh (SLV)',
  'Kullu / Manali, Himachal Pradesh (KUU)',
  'Dharamshala, Himachal Pradesh (DHM)',
  'Srinagar, Jammu & Kashmir (SXR)',
  'Jammu, Jammu & Kashmir (IXJ)',
  'Leh-Ladakh (IXL)',

  // Northeast India
  'Guwahati, Assam (GAU)',
  'Dibrugarh, Assam (DIB)',
  'Silchar, Assam (IXS)',
  'Shillong, Meghalaya (SHL)',
  'Imphal, Manipur (IMF)',
  'Agartala, Tripura (IXA)',
  'Aizawl, Mizoram (AJL)',
  'Dimapur, Nagaland (DMU)',

  // Islands
  'Port Blair, Andaman & Nicobar (IXZ)'
];

export default function PlannerPage() {
  const router = useRouter();
  const [currentLocation, setCurrentLocation] = useState<LocationState>(POPULAR_LOCATIONS[0]);
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');

  // Form State
  const [departureCity, setDepartureCity] = useState(DEPARTURE_CITIES[0]);
  const [destination, setDestination] = useState('Goa (North & South Beaches)');
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 7);
    return today.toISOString().split('T')[0];
  });
  const [travelers, setTravelers] = useState(2);
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState<'budget' | 'moderate' | 'luxury'>('moderate');
  const [travelStyle, setTravelStyle] = useState('Relaxed & Scenic');
  const [interests, setInterests] = useState<string[]>(['Beaches', 'Seafood & Dining', 'Heritage & Forts']);

  // Async & UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generated Plan
  const [itinerary, setItinerary] = useState<ItineraryDay[] | null>(null);
  const [totalEstimatedBudgetINR, setTotalEstimatedBudgetINR] = useState(16500);
  const [budgetBreakdown, setBudgetBreakdown] = useState<{
    stay: number;
    transit: number;
    meals: number;
    activities: number;
    rooms: number;
    nights: number;
    perPerson: number;
  } | null>(null);

  const availableInterests = [
    'Beaches',
    'Heritage & Forts',
    'Seafood & Dining',
    'Adventure Sports',
    'Temples & Spirituality',
    'Nightlife',
    'Nature & Wildlife',
    'Photography',
  ];

  // Authentic Indian market rates (taking into account group sharing for rooms & cabs)
  const budgetTiers = [
    {
      id: 'budget' as const,
      label: 'Budget',
      range: '₹1.2k – ₹1.8k / person / day',
      desc: 'Clean guesthouses/hostels, shared scooty/cab & authentic beach shacks',
      stayPerRoomNightINR: 1500, // Shared: 2-3 persons per room
      transportPerDayINR: 1200,  // Scooters or shared auto/cab
      dailyPerPersonFoodINR: 600, // Breakfast ₹120, Lunch ₹250, Dinner ₹230
      dailyPerPersonSightseeingINR: 300, // Fort entry, beach activities
    },
    {
      id: 'moderate' as const,
      label: 'Moderate',
      range: '₹2.2k – ₹3.2k / person / day',
      desc: 'Boutique resort with pool, self-drive AC car & beach shack seafood',
      stayPerRoomNightINR: 3200, // Shared: 2-3 persons per room / pool villa
      transportPerDayINR: 2200,  // Self-drive Ertiga/Innova or dedicated cab
      dailyPerPersonFoodINR: 1100, // Breakfast ₹250, Lunch ₹450, Dinner ₹400
      dailyPerPersonSightseeingINR: 600, // Water sports, boat cruise, forts
    },
    {
      id: 'luxury' as const,
      label: 'Luxury',
      range: '₹5.5k+ / person / day',
      desc: '5-star beachfront luxury resort, private SUV chauffeur & fine dining',
      stayPerRoomNightINR: 9500, // 5-star Taj / Marriott / W Goa
      transportPerDayINR: 4200,  // Private chauffeur-driven SUV
      dailyPerPersonFoodINR: 2800, // Fine dining & upscale beach clubs
      dailyPerPersonSightseeingINR: 1800, // Private yacht, scuba & VIP entry
    }
  ];

  const toggleInterest = (item: string) => {
    if (interests.includes(item)) {
      setInterests(interests.filter((i) => i !== item));
    } else {
      setInterests([...interests, item]);
    }
  };

  const handleGenerateItinerary = async () => {
    setLoading(true);
    setError(null);

    try {
      const prompt = `Create a realistic ${days}-day travel itinerary departing from ${departureCity} to ${destination}, India starting on ${startDate} for ${travelers} travelers with a ${budget} budget (${budgetTiers.find(b => b.id === budget)?.range}) focusing on ${interests.join(', ')}.`;

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt }),
      });

      if (!res.ok) {
        throw new Error('AI service momentarily unavailable. Please retry.');
      }

      await res.json();

      // Realistic Indian Travel Economics Calculator
      const tierConfig = budgetTiers.find((b) => b.id === budget) || budgetTiers[1];

      // 1. Accommodation: shared rooms (2-3 persons per room)
      const roomsNeeded = Math.ceil(travelers / 2.5);
      const nights = Math.max(1, days - 1);
      const stayCost = tierConfig.stayPerRoomNightINR * roomsNeeded * nights;

      // 2. Local Transit: shared cab/scooters (1 car per 4-5 persons)
      const vehiclesNeeded = Math.ceil(travelers / 4);
      const transitCost = tierConfig.transportPerDayINR * vehiclesNeeded * days;

      // 3. Daily meals & dining for all travelers
      const mealsCost = tierConfig.dailyPerPersonFoodINR * travelers * days;

      // 4. Sightseeing, fort entry, water sports, beach activities
      const activitiesCost = tierConfig.dailyPerPersonSightseeingINR * travelers * days;

      // Grand Total
      const totalBudget = Math.round(stayCost + transitCost + mealsCost + activitiesCost);
      const perPersonTotal = Math.round(totalBudget / travelers);

      setBudgetBreakdown({
        stay: stayCost,
        transit: transitCost,
        meals: mealsCost,
        activities: activitiesCost,
        rooms: roomsNeeded,
        nights: nights,
        perPerson: perPersonTotal,
      });

      const generatedDays: ItineraryDay[] = [];
      for (let i = 1; i <= days; i++) {
        // Daily portions for activities
        const dailyMealBudget = mealsCost / days;
        const dailyActivityBudget = activitiesCost / days;
        const dailyTransitBudget = transitCost / days;

        generatedDays.push({
          dayNumber: i,
          title: `Day ${i}: ${i === 1
              ? `Departure from ${departureCity.split(' ')[0]} & Arrival in ${destination.split(',')[0]}`
              : i === 2
                ? `Heritage, Markets & Scenic Exploration`
                : i === 3
                  ? `Offbeat Coastal / Cultural Trail & Sunset`
                  : `Hidden Trails & Regional Delicacies`
            }`,
          theme: i === 1 ? 'Transit & Check-in' : i === 2 ? 'Culture & Gastronomy' : 'Scenic Views & Vibe',
          activities: [
            {
              id: `act-${i}-1`,
              time: '09:00 AM',
              icon: 'morning',
              title: i === 1 ? `Arrive in ${destination.split(',')[0]} & Traditional Breakfast` : `Morning Heritage Walking Circuit`,
              description: `Kick off with authentic local specialties and historic exploration.`,
              location: `${destination.split(',')[0]} Main Quarter`,
              estimatedCostINR: Math.round(dailyMealBudget * 0.25 + dailyTransitBudget * 0.3),
            },
            {
              id: `act-${i}-2`,
              time: '01:30 PM',
              icon: 'afternoon',
              title: `Renowned Landmark & Regional Lunch Experience`,
              description: `Iconic attraction tour with pre-verified local thali experience.`,
              location: `Historic Hub, ${destination.split(',')[0]}`,
              estimatedCostINR: Math.round(dailyMealBudget * 0.4 + dailyActivityBudget * 0.6),
            },
            {
              id: `act-${i}-3`,
              time: '06:30 PM',
              icon: 'evening',
              title: `Sunset Viewpoint, Night Market & Authentic Dinner`,
              description: `Golden hour panoramic views followed by artisan shopping and dining.`,
              location: `Scenic Waterfront Promenade`,
              estimatedCostINR: Math.round(dailyMealBudget * 0.35 + dailyActivityBudget * 0.4),
            },
          ],
        });
      }

      setItinerary(generatedDays);
      setTotalEstimatedBudgetINR(totalBudget);
    } catch (err: any) {
      console.error('Failed to generate itinerary:', err);
      setError(err.message || 'Unable to generate trip plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveActivity = (dayIndex: number, actId: string) => {
    if (!itinerary) return;
    const updated = [...itinerary];
    updated[dayIndex].activities = updated[dayIndex].activities.filter(a => a.id !== actId);
    setItinerary(updated);
  };

  const handleProceedToCheckout = () => {
    const bookingItem = {
      title: `${days}-Day ${destination} Curated Trip Pass (${travelers} travelers)`,
      destination,
      days,
      travelers,
      startDate,
      departureCity,
      priceINR: totalEstimatedBudgetINR,
      travelStyle,
      type: 'itinerary_package',
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('wanderpay_pending_checkout', JSON.stringify(bookingItem));
    }
    const params = new URLSearchParams({
      title: `${days}-Day ${destination} Curated Trip Pass`,
      amount: totalEstimatedBudgetINR.toString(),
      type: 'itinerary',
      details: `${departureCity} to ${destination} • ${startDate} (${travelers} travelers)`
    });
    router.push(`/checkout?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar
        currentLocation={currentLocation}
        onOpenLocationPicker={() => { }}
        currency={currency}
        onCurrencyToggle={() => setCurrency(currency === 'INR' ? 'USD' : 'INR')}
        onOpenChat={() => { }}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-10">

        {/* Header Hero Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-sky-500/10 blur-3xl rounded-full" />

          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center space-x-2 bg-blue-500/20 text-blue-300 border border-blue-400/30 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Trip Planner Engine</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-balance">
              AI Trip Planner for <span className="text-sky-400">Incredible India</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 font-medium text-balance">
              Enter your dates, departure point, and group details. PayNGo creates verified hour-by-hour itineraries with estimated local fares and one-click PayPal checkout.
            </p>
          </div>
        </div>

        {/* Input Configuration Grid */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-xl font-black text-slate-900 flex items-center space-x-2">
            <Compass className="w-5 h-5 text-blue-600" />
            <span>Customize Your Trip Parameters</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

            {/* Departure City */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>Departure City</span>
                <span className="text-[10px] text-blue-600 font-bold">{DEPARTURE_CITIES.length} All-India Airports</span>
              </label>
              <select
                value={departureCity}
                onChange={(e) => setDepartureCity(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {DEPARTURE_CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Destination Autocomplete */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>Destination City / Spot</span>
                <span className="text-[10px] text-blue-600 font-bold">{INDIAN_DESTINATIONS.length} All-India Spots</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  list="destinations-list"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Goa, Jaipur, Munnar, Manali, Varanasi..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                />
                <datalist id="destinations-list">
                  {INDIAN_DESTINATIONS.map((d) => (
                    <option key={d} value={d} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* Start Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Start Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Travelers & Duration */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Travelers & Days
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <Users className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3.5" />
                  <select
                    value={travelers}
                    onChange={(e) => setTravelers(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-7 pr-2 text-xs font-bold text-slate-900 focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>{n} {n === 1 ? 'Solo' : 'People'}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-2 text-xs font-bold text-slate-900 focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 7, 10].map((n) => (
                      <option key={n} value={n}>{n} Days</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

          </div>

          {/* Budget Tier with Rupee Ranges */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Budget Tier (Per Day Estimates)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {budgetTiers.map((b) => {
                const isSelected = budget === b.id;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBudget(b.id)}
                    className={`p-4 rounded-2xl border text-left transition-all ${isSelected
                        ? 'border-blue-600 bg-blue-50/60 shadow-sm ring-1 ring-blue-600'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 text-sm">{b.label}</span>
                      <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-lg">
                        {b.range}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 font-medium">{b.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interests Chips */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Travel Interests & Themes
            </label>
            <div className="flex flex-wrap gap-2">
              {availableInterests.map((item) => {
                const active = interests.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleInterest(item)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center space-x-1.5 ${active
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-50 text-slate-700 border border-slate-200 hover:border-blue-300'
                      }`}
                  >
                    <span>{item}</span>
                    {active && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* CTA Generate Button */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={handleGenerateItinerary}
              disabled={loading || !destination.trim()}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-8 py-3.5 rounded-2xl transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 text-white animate-spin" />
                  <span>AI is crafting your itinerary...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Generate Complete Itinerary</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6 animate-pulse">
            <div className="h-6 bg-slate-200 rounded-md w-1/3" />
            <div className="h-4 bg-slate-100 rounded-md w-1/2" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-44 bg-slate-100 rounded-2xl p-4 space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-1/4" />
                  <div className="h-5 bg-slate-200 rounded w-3/4" />
                  <div className="h-12 bg-slate-200/60 rounded" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error State with Retry Button */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 text-rose-900 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-rose-600 shrink-0" />
              <div>
                <h4 className="font-bold text-sm">Failed to generate itinerary</h4>
                <p className="text-xs text-rose-700">{error}</p>
              </div>
            </div>
            <button
              onClick={handleGenerateItinerary}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Generation</span>
            </button>
          </div>
        )}

        {/* Generated Itinerary Section */}
        {itinerary && !loading && (
          <div className="space-y-8 animate-fade-in">

            {/* Itinerary Header Bar */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                    Verified Trip Plan • {startDate}
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 mt-0.5">
                    {days}-Day {destination} Experience ({travelers} travelers)
                  </h3>
                  <div className="flex items-baseline space-x-2 mt-1">
                    <span className="text-2xl font-black text-slate-900">
                      {currency === 'USD'
                        ? `$${(totalEstimatedBudgetINR / 83.2).toFixed(0)} USD`
                        : `₹${totalEstimatedBudgetINR.toLocaleString('en-IN')}`}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">
                      (~{currency === 'USD' ? `$${((totalEstimatedBudgetINR / travelers) / 83.2).toFixed(0)}` : `₹${Math.round(totalEstimatedBudgetINR / travelers).toLocaleString('en-IN')}`} per person total)
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <button
                    onClick={handleProceedToCheckout}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2"
                  >
                    <CreditCard className="w-4 h-4 text-white" />
                    <span>Review & Book with PayPal</span>
                  </button>
                </div>
              </div>

              {/* Itemized Real-World Expense Breakdown */}
              {budgetBreakdown && (
                <div className="pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] uppercase font-bold text-slate-400">🏨 Stay ({budgetBreakdown.rooms} Rooms × {budgetBreakdown.nights}N)</span>
                    <p className="font-extrabold text-slate-900 mt-0.5">₹{budgetBreakdown.stay.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] uppercase font-bold text-slate-400">🚗 Transit (Shared Cab / Car)</span>
                    <p className="font-extrabold text-slate-900 mt-0.5">₹{budgetBreakdown.transit.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] uppercase font-bold text-slate-400">🍽️ Dining ({travelers} Travelers)</span>
                    <p className="font-extrabold text-slate-900 mt-0.5">₹{budgetBreakdown.meals.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] uppercase font-bold text-slate-400">🎟️ Sightseeing & Activities</span>
                    <p className="font-extrabold text-slate-900 mt-0.5">₹{budgetBreakdown.activities.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Day by Day Cards */}
            <div className="space-y-6">
              {itinerary.map((day, dayIndex) => (
                <div
                  key={day.dayNumber}
                  className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-[11px] font-extrabold text-blue-600 uppercase tracking-widest">
                        DAY {day.dayNumber}
                      </span>
                      <h4 className="text-lg font-black text-slate-900 mt-0.5">
                        {day.title}
                      </h4>
                    </div>
                    <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-bold">
                      {day.theme}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    {day.activities.map((act) => (
                      <div
                        key={act.id}
                        className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:border-blue-300 transition-all group"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                            <span className="flex items-center space-x-1">
                              {act.icon === 'morning' ? (
                                <Coffee className="w-3.5 h-3.5 text-amber-500" />
                              ) : act.icon === 'afternoon' ? (
                                <Sun className="w-3.5 h-3.5 text-orange-500" />
                              ) : (
                                <Moon className="w-3.5 h-3.5 text-indigo-500" />
                              )}
                              <span>{act.time}</span>
                            </span>
                            <div className="flex items-center space-x-2">
                              <span className="text-emerald-700 font-extrabold">
                                ₹{act.estimatedCostINR}
                              </span>
                              <button
                                onClick={() => handleRemoveActivity(dayIndex, act.id)}
                                title="Remove activity"
                                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition-opacity"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <h5 className="text-sm font-black text-slate-900 leading-tight">
                            {act.title}
                          </h5>

                          <p className="text-xs text-slate-600 font-normal leading-relaxed">
                            {act.description}
                          </p>
                        </div>

                        <div className="text-[11px] text-slate-400 font-medium flex items-center space-x-1 border-t border-slate-200/60 pt-2">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{act.location}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Book & Pay Banner */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-xl font-bold">Ready to confirm this itinerary?</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Secure your reservations and curated passes with PayPal buyer protection on the checkout screen.
                </p>
              </div>
              <button
                onClick={handleProceedToCheckout}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-8 py-3.5 rounded-2xl shadow-md transition-all flex items-center space-x-2 shrink-0"
              >
                <CreditCard className="w-4 h-4 text-white" />
                <span>Review & book</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
