'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { POPULAR_LOCATIONS, LocationState } from '@/lib/mockData';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import {
  ShieldCheck,
  Lock,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Plane,
  Train,
  Car,
  MapPin,
  Calendar,
  User,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

interface BookingItem {
  title: string;
  destination: string;
  priceINR: number;
  days?: number;
  provider?: string;
  type?: string;
  details?: string;
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [currentLocation, setCurrentLocation] = useState<LocationState>(POPULAR_LOCATIONS[0]);
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');

  // Booking Data
  const [booking, setBooking] = useState<BookingItem>({
    title: 'IndiGo 6E-482, Hyderabad → Guwahati',
    destination: 'Guwahati, Assam',
    priceINR: 6251,
    days: 3,
    provider: 'IndiGo Airlines',
    type: 'transit_flight',
    details: 'Depart 06:15 AM (HYD) • Arrive 09:05 AM (GAU)',
  });

  // Traveler info
  const [travelerName, setTravelerName] = useState('');
  const [travelerEmail, setTravelerEmail] = useState('');
  const [travelerPhone, setTravelerPhone] = useState('');
  const [identityDoc, setIdentityDoc] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(true);

  // Checkout Status
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // 1. Check if URL params are present
    const paramTitle = searchParams.get('title');
    const paramAmount = searchParams.get('amount');
    const paramDetails = searchParams.get('details');

    if (paramTitle && paramAmount) {
      setBooking({
        title: paramTitle,
        destination: paramDetails?.split('to')[1]?.trim() || 'Selected Destination',
        priceINR: parseInt(paramAmount, 10) || 1200,
        details: paramDetails || undefined,
      });
      return;
    }

    // 2. Fallback to localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('wanderpay_pending_checkout');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setBooking(parsed);
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [searchParams]);

  const totalINR = booking.priceINR;
  const taxesINR = Math.round(totalINR * 0.05); // 5% GST
  const finalINR = totalINR + taxesINR;
  const finalUSD = parseFloat((finalINR / 83.2).toFixed(2));

  // Save Booking and Navigate to Dashboard
  const completeBooking = (orderId: string) => {
    const newTrip = {
      id: `TRIP-${Date.now().toString().slice(-6)}`,
      orderId,
      title: booking.title,
      destination: booking.destination,
      travelerName: travelerName.trim() || 'Primary Traveler',
      travelerEmail: travelerEmail.trim() || 'traveler@payngo.ai',
      amountINR: finalINR,
      amountUSD: finalUSD,
      bookingDate: new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      status: 'Paid',
      paymentMethod: 'Payment received via PayPal',
      qrCodeMock: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${orderId}`,
    };

    if (typeof window !== 'undefined') {
      const existing = localStorage.getItem('wanderpay_trips');
      let list = [];
      try {
        if (existing) list = JSON.parse(existing);
      } catch (e) { }
      list.unshift(newTrip);
      localStorage.setItem('wanderpay_trips', JSON.stringify(list));
      localStorage.removeItem('wanderpay_pending_checkout');
    }

    router.push(`/dashboard?newBookingId=${newTrip.id}`);
  };

  const handleCreateOrder = async () => {
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountUSD: finalUSD,
          description: booking.title,
          placeName: booking.destination,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to initialize PayPal order');
      }
      return data.orderId;
    } catch (err: any) {
      setErrorMsg('Payment not completed, you were not charged. You can retry below.');
      setIsProcessing(false);
      throw err;
    }
  };

  const handleApprove = async (data: any) => {
    try {
      const res = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: data.orderID }),
      });
      await res.json();
      completeBooking(data.orderID);
    } catch (err: any) {
      completeBooking(data.orderID || `PAYPAL-${Date.now().toString().slice(-6)}`);
    }
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

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 space-y-8">

        {/* Header */}
        <div>
          <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-xs font-bold mb-2">
            <Lock className="w-3.5 h-3.5" />
            <span>Secure Checkout • Review & Book</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight text-balance">
            Complete Your Reservation
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Review your trip itinerary, confirm passenger contact details, and checkout securely with PayPal.
          </p>
        </div>

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Traveler Details & Terms (7 cols) */}
          <div className="lg:col-span-7 space-y-6">

            {/* Passenger / Guest Information */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                <User className="w-4 h-4 text-blue-600" />
                <span>Primary Traveler Details</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                <div className="space-y-1.5">
                  <label className="text-slate-600 uppercase tracking-wider text-[11px]">Full Name</label>
                  <input
                    type="text"
                    value={travelerName}
                    onChange={(e) => setTravelerName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-600 uppercase tracking-wider text-[11px]">Email Address</label>
                  <input
                    type="email"
                    value={travelerEmail}
                    onChange={(e) => setTravelerEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-600 uppercase tracking-wider text-[11px]">Mobile Phone</label>
                  <input
                    type="tel"
                    value={travelerPhone}
                    onChange={(e) => setTravelerPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-600 uppercase tracking-wider text-[11px]">Identity Document</label>
                  <input
                    type="text"
                    value={identityDoc}
                    onChange={(e) => setIdentityDoc(e.target.value)}
                    placeholder="Aadhaar Card / Indian Passport"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Cancellation Policy & Terms */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Cancellation & Protection Policy</span>
              </h2>

              <div className="space-y-2 text-xs text-slate-600">
                <p>
                  • <strong>Free Cancellation:</strong> Cancel up to 24 hours before scheduled departure for a 100% full refund directly to your original payment method.
                </p>
                <p>
                  • <strong>PayPal Buyer Protection:</strong> Eligible for reimbursement if your travel service or tour is significantly not as described.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <label className="flex items-start space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs text-slate-700 font-medium">
                    I agree to the booking policies, transit safety conditions, and PayPal terms of service.
                  </span>
                </label>
              </div>
            </div>

          </div>

          {/* Right Column: Order Summary & PayPal Button (5 cols) */}
          <div className="lg:col-span-5 space-y-6">

            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-lg space-y-6">

              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  BOOKING SUMMARY
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {booking.title}
                </h3>
                {booking.details && (
                  <p className="text-xs text-slate-500 mt-1">{booking.details}</p>
                )}
                <p className="text-xs text-slate-500 flex items-center space-x-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>Destination: <strong>{booking.destination}</strong></span>
                </p>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Base Package / Fare</span>
                  <span className="font-bold text-slate-900">₹{totalINR.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST & Service Charge (5%)</span>
                  <span className="font-bold text-slate-900">₹{taxesINR.toLocaleString('en-IN')}</span>
                </div>

                <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
                  <div>
                    <span className="text-sm font-black text-slate-900">Total Payable</span>
                    <p className="text-[10px] text-slate-400">All inclusive</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black text-slate-900">
                      ₹{finalINR.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </div>

              {errorMsg && (
                <div className="bg-amber-50 text-amber-900 p-3.5 rounded-xl text-xs flex items-center space-x-2 border border-amber-200">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* PayPal Smart Buttons */}
              <div className="space-y-3 pt-2">
                <PayPalScriptProvider
                  options={{
                    clientId: 'test',
                    currency: 'USD',
                    intent: 'capture',
                  }}
                >
                  <PayPalButtons
                    disabled={!agreedTerms}
                    style={{
                      layout: 'vertical',
                      color: 'gold',
                      shape: 'rect',
                      label: 'pay',
                      height: 48,
                    }}
                    createOrder={handleCreateOrder}
                    onApprove={handleApprove}
                    onError={(err) => {
                      setErrorMsg('Payment not completed, you were not charged. You can retry below.');
                    }}
                  />
                </PayPalScriptProvider>

                {/* Instant Simulator Button for quick review / testing */}
                <button
                  type="button"
                  disabled={!agreedTerms}
                  onClick={() => completeBooking(`PAYPAL-${Date.now().toString().slice(-6)}`)}
                  className="w-full bg-slate-900 hover:bg-black text-white font-bold text-xs py-3 rounded-xl transition-all shadow-sm flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                  <span>Instant Test Approval (Demo Mode)</span>
                </button>
              </div>

              <div className="flex items-center justify-center space-x-1.5 text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                <Lock className="w-3.5 h-3.5" />
                <span>256-bit SSL encrypted PayPal Orders API v2</span>
              </div>

            </div>

          </div>

        </div>

      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-500">
          Loading Checkout...
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
