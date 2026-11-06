'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { POPULAR_LOCATIONS, LocationState } from '@/lib/mockData';
import { downloadReceipt } from '@/lib/downloadReceipt';
import GlassFolder, { FolderFile } from '@/components/ui/glass-folder-cards';
import { CommunityTravelMoments } from '@/components/CommunityTravelMoments';
import { fetchBookings } from '@/lib/db';
import { useCurrentUser } from '@/lib/auth';
import {
  Sparkles,
  Luggage,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
  Download,
  Share2,
  QrCode,
  CreditCard,
  Plane,
  Train,
  Car,
  Compass,
  FileText,
  CalendarPlus,
  HelpCircle,
  XCircle,
  Eye,
} from 'lucide-react';

interface TripItem {
  id: string;
  orderId: string;
  title: string;
  routeCode?: string;
  flightOrTrainNo?: string;
  departureTime?: string;
  arrivalTime?: string;
  destination: string;
  travelerName: string;
  travelerEmail: string;
  amountINR: number;
  amountUSD: number;
  bookingDate: string;
  travelDate?: string;
  status: string;
  paymentMethod: string;
  qrCodeMock?: string;
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const newBookingId = searchParams.get('newBookingId');
  const { user } = useCurrentUser();

  const [currentLocation, setCurrentLocation] = useState<LocationState>(POPULAR_LOCATIONS[0]);
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [activeTab, setActiveTab] = useState<'upcoming' | 'receipts'>('upcoming');
  const [revealedPassId, setRevealedPassId] = useState<string | null>(null);

  const [trips, setTrips] = useState<TripItem[]>([]);
  const [isLoadingTrips, setIsLoadingTrips] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoadingTrips(true);
    fetchBookings(user?.email).then((fetched) => {
      if (isMounted) {
        setTrips(fetched || []);
        setIsLoadingTrips(false);
      }
    }).catch((err) => {
      console.warn('Error fetching bookings:', err);
      if (isMounted) {
        setTrips([]);
        setIsLoadingTrips(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [user?.email]);

  const totalSpentINR = trips.reduce((acc, t) => acc + t.amountINR, 0);
  const totalSpentUSD = Number((totalSpentINR / 83.2).toFixed(2));
  const totalSavingsINR = Math.round(totalSpentINR * 0.28);

  const bookingFiles: FolderFile[] = trips.length > 0
    ? trips.map((trip) => ({
        name: trip.title,
        meta: `${trip.routeCode || trip.destination} · Confirmed`,
        image: trip.title.toLowerCase().includes('flight') || trip.title.toLowerCase().includes('indigo')
          ? 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&q=80'
          : 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=600&q=80',
      }))
    : [
        {
          name: 'Ready for Your Next Trip',
          meta: 'Browse Flights & Passes',
          art: 'aurora',
        },
        {
          name: 'PayPal Official Receipts',
          meta: 'v2 Orders API · Encrypted',
          art: 'ember',
        },
        {
          name: 'PayNGo 24/7 Concierge',
          meta: 'Support · Ready',
        },
      ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar
        currentLocation={currentLocation}
        onOpenLocationPicker={() => { }}
        currency={currency}
        onCurrencyToggle={() => setCurrency(currency === 'INR' ? 'USD' : 'INR')}
        onOpenChat={() => { }}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-8">

        {/* Success Alert if coming from checkout */}
        {newBookingId && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-3xl p-5 shadow-sm flex items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                ✓
              </div>
              <div>
                <h4 className="text-sm font-bold">Booking Confirmed!</h4>
                <p className="text-xs text-emerald-700">
                  Your reference ID is <strong>{newBookingId}</strong>. Payment received via PayPal.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
              Payment Received
            </span>
          </div>
        )}

        {/* Dashboard Welcome Header */}
        <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 z-10">
            <span className="text-[10px] font-extrabold text-blue-400 uppercase tracking-widest">
              TRAVELER DASHBOARD {user?.email && `• ${user.email}`}
            </span>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-balance">
              Welcome back, {user?.name || 'Explorer'}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 text-balance">
              Manage your confirmed trips, access digital boarding passes, and download receipts.
            </p>
          </div>

          <div className="flex items-center space-x-3 z-10">
            <Link
              href="/planner"
              className="bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs px-5 py-3 rounded-2xl transition-all shadow-md flex items-center space-x-1.5"
            >
              <Compass className="w-4 h-4 text-blue-600" />
              <span>Plan New Trip</span>
            </Link>
          </div>
        </div>

        {/* Analytics Statistics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Confirmed Trips</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{trips.length}</div>
            <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Payment received</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Total Spent</span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              ₹{totalSpentINR.toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">
              Across all confirmed travel
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Surge Savings</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              ₹{totalSavingsINR.toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">
              vs. avg fare on this route (last 7 days)
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Active Passes</span>
            <div className="text-2xl font-black text-blue-600 mt-1">{trips.length} Ready</div>
            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Digital Check-in</p>
          </div>
        </div>

        {/* Tab Headers */}
        <div className="flex space-x-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'upcoming'
                ? 'bg-neutral-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
          >
            Confirmed Trips & Passes ({trips.length})
          </button>
          <button
            onClick={() => setActiveTab('receipts')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'receipts'
                ? 'bg-neutral-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
          >
            Payments & receipts
          </button>
        </div>

        {/* Trips List / Digital Boarding Passes */}
        {activeTab === 'upcoming' && (
          <div className="space-y-6">
            {/* Interactive Single Glass Folder Vault */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-700/60 flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden">
              <div className="space-y-4 max-w-md z-10">
                <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-400/30 text-blue-400 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>3D Booking Passes Vault</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Interactive Travel Wallet
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Hover to lean the frosted-glass pocket, or click to fan out your verified boarding passes, city passes, and PayPal capture receipts.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400 font-medium">
                  <span className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{trips.length} Active Bookings</span>
                  </span>
                  <span className="flex items-center space-x-1.5">
                    <CreditCard className="w-4 h-4 text-blue-400" />
                    <span>PayPal Orders API v2</span>
                  </span>
                </div>
              </div>

              {/* 1 Glass Folder Card Instance */}
              <div className="z-10 flex justify-center items-center py-2">
                <GlassFolder
                  label="Travel Passes"
                  meta={`${trips.length} Tickets · PayPal Verified`}
                  tone="dark"
                  art="aurora"
                  seed={7}
                  files={bookingFiles}
                  action="more"
                  menu={[
                    { label: "Download All Passes" },
                    { label: "Share Itinerary" }
                  ]}
                  labelPlacement="bottom-left"
                  width={310}
                />
              </div>

              {/* Background Ambient Glow */}
              <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
            </div>

            {isLoadingTrips ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 font-medium">
                <div className="inline-block animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mb-3" />
                <p>Loading your trips and passes...</p>
              </div>
            ) : trips.length === 0 ? (
              <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-10 sm:p-14 text-center space-y-4">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                  <Plane className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">No Trips or Passes Yet</h3>
                  <p className="text-sm text-slate-500 max-w-md mx-auto">
                    Your confirmed bookings, boarding passes, and tickets will automatically appear here once you book your next destination.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <Link
                    href="/explore"
                    className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center space-x-2"
                  >
                    <Compass className="w-4 h-4" />
                    <span>Explore Destinations</span>
                  </Link>
                  <Link
                    href="/planner"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center space-x-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Plan Trip with AI</span>
                  </Link>
                </div>
              </div>
            ) : (
              trips.map((trip) => {
              const isPassRevealed = revealedPassId === trip.id;

              return (
                <div
                  key={trip.id}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row"
                >
                  {/* Left Ticket Header / Details */}
                  <div className="p-6 sm:p-8 flex-1 space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold text-slate-400">
                          REF: {trip.id}
                        </span>
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          {trip.status}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 font-medium">
                        Travel Date: {trip.travelDate || trip.bookingDate}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-xs font-bold text-blue-600">
                        <Plane className="w-4 h-4" />
                        <span>{trip.routeCode || trip.destination}</span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                        {trip.title}
                      </h3>
                      {trip.departureTime && trip.arrivalTime && (
                        <p className="text-xs text-slate-600 mt-1 font-medium">
                          Dep: <span className="font-bold text-slate-800">{trip.departureTime}</span> • Arr: <span className="font-bold text-slate-800">{trip.arrivalTime}</span>
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Traveler</span>
                        <p className="font-bold text-slate-800">{trip.travelerName}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Payment Status</span>
                        <p className="font-bold text-emerald-700">{trip.paymentMethod}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Order Ref</span>
                        <p className="font-mono text-[11px] text-slate-600 truncate">{trip.orderId}</p>
                      </div>
                    </div>

                    {/* Action Buttons Toolbar */}
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2 text-xs font-bold">
                      <button
                        onClick={() => downloadReceipt({
                          orderId: trip.orderId,
                          tripId: trip.id,
                          placeName: trip.title,
                          travelerName: trip.travelerName,
                          travelerEmail: trip.travelerEmail,
                          amountINR: trip.amountINR,
                          amountUSD: trip.amountUSD,
                          bookingDate: trip.bookingDate,
                          travelDate: trip.travelDate,
                          departureTime: trip.departureTime,
                          arrivalTime: trip.arrivalTime,
                          routeCode: trip.routeCode,
                          flightOrTrainNo: trip.flightOrTrainNo,
                          paymentMethod: trip.paymentMethod,
                          status: trip.status,
                        })}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Receipt</span>
                      </button>

                      <button
                        onClick={() => alert(`Adding ${trip.title} to your calendar.`)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5"
                      >
                        <CalendarPlus className="w-3.5 h-3.5" />
                        <span>Add to Calendar</span>
                      </button>

                      <button
                        onClick={() => alert(`Support agent connected for booking ${trip.id}.`)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Contact Support</span>
                      </button>

                      <button
                        onClick={() => alert(`Cancellation policy: Free cancellation up to 24h prior. Request logged for ${trip.id}.`)}
                        className="bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Change or Cancel</span>
                      </button>
                    </div>
                  </div>

                  {/* Right QR Code Stub / Reveal Button */}
                  <div className="bg-slate-50 border-t md:border-t-0 md:border-l border-slate-200 p-6 sm:p-8 flex flex-col items-center justify-center space-y-3 shrink-0 md:w-64">
                    {isPassRevealed ? (
                      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm animate-fade-in flex flex-col items-center space-y-2">
                        {trip.qrCodeMock ? (
                          <img
                            src={trip.qrCodeMock}
                            alt="QR Code Ticket"
                            className="w-28 h-28 object-contain"
                          />
                        ) : (
                          <QrCode className="w-28 h-28 text-slate-700" />
                        )}
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
                          Gate Ready
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => setRevealedPassId(trip.id)}
                        className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-900 font-bold text-xs px-4 py-3 rounded-2xl shadow-sm flex items-center space-x-2 transition-all"
                      >
                        <Eye className="w-4 h-4 text-blue-600" />
                        <span>Show Boarding Pass</span>
                      </button>
                    )}

                    <div className="text-center pt-2">
                      <span className="text-base font-black text-slate-900">
                        ₹{trip.amountINR.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                </div>
              );
            }))}
          </div>
        )}

        {/* Payments & Receipts Tab */}
        {activeTab === 'receipts' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Payments & receipts</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Booking Ref</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">PayPal Order ID</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {trips.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                        No PayPal payment receipts found. Your transactions will appear here after booking.
                      </td>
                    </tr>
                  ) : (
                    trips.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-700">{t.id}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">{t.title}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-500">{t.orderId}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          ₹{t.amountINR.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-[10px] font-extrabold">
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Community Traveler Photos & Polaroid Clothesline Carousel */}
        <div className="pt-4">
          <CommunityTravelMoments />
        </div>

      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-500">
          Loading Traveler Dashboard...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
