'use client';

import React, { useState } from 'react';
import { Place, RideOption } from '@/types';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { persistBooking } from '@/lib/db';
import { getStoredUser } from '@/lib/auth';
import {
  X,
  ShieldCheck,
  Lock,
  Sparkles,
  CreditCard,
  MapPin,
  Car,
  ChevronRight,
  Info,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

interface PayPalCheckoutDrawerProps {
  place: Place | null;
  rideOption?: RideOption | null;
  currency: 'INR' | 'USD';
  onClose: () => void;
  onSuccess: (orderId: string, amountUSD: number, placeName: string) => void;
}

export const PayPalCheckoutDrawer: React.FC<PayPalCheckoutDrawerProps> = ({
  place,
  rideOption,
  currency,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!place) return null;

  // Check if booking is pure point-to-point transit
  const isTransitOnly = place.category === 'transit' || place.id.startsWith('route-');
  const isIRCTC = rideOption?.provider.toLowerCase().includes('irctc') || rideOption?.icon === 'Train';

  // Compute total without duplicating transit fare
  const placePriceUSD = isTransitOnly ? 0 : parseFloat((place.avgPrice / 83.2).toFixed(2));
  const ridePriceUSD = rideOption ? rideOption.estimatedPriceUSD : parseFloat((place.avgPrice / 83.2).toFixed(2));
  const totalUSD = isTransitOnly ? ridePriceUSD : parseFloat((placePriceUSD + ridePriceUSD).toFixed(2));
  
  const placePriceINR = isTransitOnly ? 0 : place.avgPrice;
  const ridePriceINR = rideOption ? rideOption.estimatedPriceINR : place.avgPrice;
  const totalINR = isTransitOnly ? ridePriceINR : (placePriceINR + ridePriceINR);

  // Handle Create Order API call
  const handleCreateOrder = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountUSD: totalUSD,
          description: rideOption
            ? `${place.name} + Ride (${rideOption.provider})`
            : `Reservation: ${place.name}`,
          placeName: place.name,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to create PayPal order');
      }
      return data.orderId;
    } catch (err: any) {
      setErrorMsg(err.message || 'Order creation failed');
      setLoading(false);
      throw err;
    }
  };

  // Handle Capture Order API call
  const handleApproveOrder = async (data: { orderID: string }) => {
    setLoading(true);
    try {
      const res = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: data.orderID }),
      });

      const result = await res.json();
      if (result.success) {
        const currentUser = getStoredUser();
        persistBooking({
          order_id: data.orderID,
          title: rideOption ? `${place.name} + Ride (${rideOption.provider})` : place.name,
          destination: place.name,
          traveler_name: currentUser?.name || 'Guest Traveler',
          traveler_email: currentUser?.email || 'traveler@payngo.ai',
          amount_usd: totalUSD,
          amount_inr: totalINR,
          currency: currency,
          status: 'COMPLETED',
          payment_method: 'PayPal Orders API v2',
        });
        onSuccess(data.orderID, totalUSD, place.name);
      } else {
        throw new Error(result.error || 'Capture failed');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Capture failed');
    } finally {
      setLoading(false);
    }
  };

  // Instant Sandbox Demo Bypass (For rapid hackathon & testing presentation)
  const handleInstantSandboxCheckout = async () => {
    setLoading(true);
    try {
      const mockOrderId = `PAYPAL-WNDR-${Math.floor(100000 + Math.random() * 900000)}`;
      const currentUser = getStoredUser();
      persistBooking({
        order_id: mockOrderId,
        title: rideOption ? `${place.name} + Ride (${rideOption.provider})` : place.name,
        destination: place.name,
        traveler_name: currentUser?.name || 'Guest Traveler',
        traveler_email: currentUser?.email || 'traveler@payngo.ai',
        amount_usd: totalUSD,
        amount_inr: totalINR,
        currency: currency,
        status: 'COMPLETED',
        payment_method: 'PayPal Instant Sandbox (Verified)',
      });
      setTimeout(() => {
        onSuccess(mockOrderId, totalUSD, place.name);
      }, 750);
    } catch (err) {
      setLoading(false);
    }
  };

  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'test';

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/75 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="bg-white border border-slate-200/90 rounded-t-[32px] sm:rounded-[32px] max-w-md w-full overflow-hidden shadow-2xl relative max-h-[92vh] flex flex-col">
        
        {/* PayPal Premium Header */}
        <div className="p-5 bg-gradient-to-r from-[#003087] via-[#005ea6] to-[#0070ba] text-white flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-black text-amber-400 text-lg shadow-sm">
              <span className="text-white">P</span>
              <span className="text-amber-400 -ml-1">P</span>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="text-base font-black text-white tracking-tight">
                  {isIRCTC ? 'IRCTC Railway Booking' : 'PayPal Checkout'}
                </h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-[11px] text-sky-200 font-medium">
                {isIRCTC ? 'Direct Official IRCTC Indian Railways Portal' : 'Safe, Encrypted One-Click Travel Booking'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all active:scale-95"
            aria-label="Close checkout"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Ledger & Payment Section */}
        <div className="p-5 space-y-4 overflow-y-auto">
          
          {/* Order Itemized Summary Card */}
          <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 space-y-3 shadow-inner">
            <div className="flex items-center justify-between text-[11px] font-black text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-200/60">
              <span>Itemized Ledger</span>
              <span>Amount</span>
            </div>

            {/* If transit only, render single clear route line item without duplication */}
            {isTransitOnly ? (
              <div className="flex items-start justify-between text-xs gap-2">
                <div className="flex items-start space-x-2 min-w-0">
                  <Car className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{place.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {rideOption ? `${rideOption.provider} (${rideOption.vehicleType})` : 'Point-to-Point Route Fare'}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-slate-900">₹{totalINR.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ) : (
              <>
                {/* Destination/Place Item */}
                <div className="flex items-start justify-between text-xs gap-2">
                  <div className="flex items-start space-x-2 min-w-0">
                    <MapPin className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">{place.name}</p>
                      <p className="text-[11px] text-slate-500">Destination Access & Entry</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-slate-900">₹{place.avgPrice}</span>
                  </div>
                </div>

                {/* Transit Ride Item (if selected with destination) */}
                {rideOption && (
                  <div className="flex items-start justify-between text-xs gap-2 pt-2 border-t border-slate-200/60">
                    <div className="flex items-start space-x-2 min-w-0">
                      <Car className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate">
                          {rideOption.provider} ({rideOption.vehicleType})
                        </p>
                        <p className="text-[11px] text-slate-500">Dedicated Transit Link</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-bold text-slate-900">₹{rideOption.estimatedPriceINR}</span>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Guarantee Tag */}
            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Instant Digital Pass</span>
              </span>
              <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Guaranteed Fare
              </span>
            </div>

            {/* Total Payable Box */}
            <div className="pt-3 border-t-2 border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 block">Total Due</span>
                <span className="text-xs font-medium text-emerald-600">No Hidden Fees</span>
              </div>
              <div className="text-right">
                <div className="text-xl font-black text-slate-900 tracking-tight">
                  ₹{totalINR.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* If IRCTC Train Option, Direct User to Official IRCTC Portal */}
          {isIRCTC ? (
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 space-y-3 pt-3">
              <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs">
                <span className="text-xl">🚆</span>
                <div>
                  <h4 className="font-extrabold text-amber-950">Official IRCTC Railway Reservation</h4>
                  <p className="text-[10px] text-amber-800 font-normal">Indian Railways (Govt. of India)</p>
                </div>
              </div>
              <p className="text-[11px] text-amber-900 leading-relaxed">
                Indian Railways tickets (Vande Bharat, Rajdhani, Superfast) must be reserved directly through the official <strong>IRCTC Portal (irctc.co.in)</strong> with your IRCTC user credentials.
              </p>
              <a
                href="https://www.irctc.co.in/nget/train-search"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#d97706] hover:bg-[#b45309] text-white font-black text-xs py-3.5 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-md transition-all text-center uppercase tracking-wide cursor-pointer"
              >
                <span>Proceed to Official IRCTC Portal (irctc.co.in)</span>
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          ) : (
            /* PayPal Smart Buttons for standard rides/bookings */
            <div className="space-y-3 pt-1">
              <div className="min-h-[120px] rounded-2xl overflow-hidden">
                <PayPalScriptProvider options={{ clientId: paypalClientId, currency: 'USD' }}>
                  <PayPalButtons
                    style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay', height: 44 }}
                    createOrder={handleCreateOrder}
                    onApprove={handleApproveOrder}
                  />
                </PayPalScriptProvider>
              </div>

            {/* Instant Demo Sandbox Pay */}
            <div className="pt-2">
              <button
                onClick={handleInstantSandboxCheckout}
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 hover:from-slate-800 hover:to-slate-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all shadow-md active:scale-[0.99] border border-slate-700 group"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Authorizing Sandbox Capture...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-400 animate-pulse group-hover:rotate-12 transition-transform" />
                    <span>Instant Demo Sandbox One-Click Pay</span>
                  </>
                )}
              </button>
            </div>
          </div>
          )}

          {/* Trust & Compliance Seal */}
          <div className="pt-2 border-t border-slate-100 flex flex-col items-center space-y-1.5 text-center">
            <div className="flex items-center space-x-3 text-[11px] text-slate-400 font-semibold">
              <span className="flex items-center space-x-1 text-slate-600">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>256-Bit SSL Encrypted</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1 text-slate-600">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                <span>Buyer Protection</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              PayNGo integrates with PayPal Orders API v2. No credit card details are ever stored locally.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
