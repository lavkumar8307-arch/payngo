'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  ShieldCheck,
  Download,
  ArrowRight,
  Copy,
  Check,
  Sparkles,
  Ticket,
  QrCode,
  Calendar,
} from 'lucide-react';
import { downloadReceipt } from '@/lib/downloadReceipt';

interface BookingSuccessModalProps {
  orderId: string;
  amountUSD: number;
  placeName: string;
  onClose: () => void;
}

export const BookingSuccessModal: React.FC<BookingSuccessModalProps> = ({
  orderId,
  amountUSD,
  placeName,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-[10000] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white border border-slate-200/90 rounded-[32px] max-w-md w-full overflow-hidden shadow-2xl relative text-center flex flex-col max-h-[92vh]">
        
        {/* Celebratory Banner */}
        <div className="bg-gradient-to-b from-emerald-500 via-teal-600 to-emerald-700 p-6 text-white relative">
          <div className="w-16 h-16 rounded-3xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center mx-auto shadow-xl shadow-emerald-950/20 mb-3 animate-bounce">
            <CheckCircle2 className="w-9 h-9 text-white" />
          </div>

          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-black uppercase tracking-wider text-emerald-100 border border-white/20 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>PAYPAL PAYMENT CONFIRMED</span>
          </div>

          <h3 className="text-2xl font-black text-white tracking-tight mt-1">
            Booking Confirmed!
          </h3>
          <p className="text-xs text-emerald-100 font-medium mt-0.5">
            Your travel pass & transit link is active.
          </p>
        </div>

        {/* Digital Boarding Pass / Ticket Voucher */}
        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
              <div className="flex items-center space-x-2">
                <Ticket className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-700">Digital Travel Voucher</span>
              </div>
              <div className="flex items-center space-x-1 text-[11px] text-slate-500 font-medium">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>{todayFormatted}</span>
              </div>
            </div>

            {/* Destination Name */}
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Destination</span>
              <h4 className="text-base font-black text-slate-900 truncate">{placeName}</h4>
            </div>

            {/* Price & Order ID Grid */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/70">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Amount Paid</span>
                <span className="text-sm font-black text-emerald-700">₹{Math.round(amountUSD * 83.2).toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/70">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Payment Method</span>
                <span className="text-xs font-black text-[#003087] flex items-center space-x-1">
                  <span>PayPal Balance / Card</span>
                </span>
              </div>
            </div>

            {/* Order ID with Copy button */}
            <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200/70 text-xs">
              <div className="min-w-0 pr-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Order ID</span>
                <span className="font-mono text-xs font-bold text-sky-800 truncate block">{orderId}</span>
              </div>
              <button
                onClick={handleCopyOrderId}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors shrink-0"
                title="Copy Order ID"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Verification QR Badge */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-200/80">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-800 shadow-sm">
                  <QrCode className="w-6 h-6 text-slate-800" />
                </div>
                <div className="text-[11px] leading-tight">
                  <span className="font-bold text-slate-800 block">Scan at Venue / Transit</span>
                  <span className="text-slate-400 text-[10px]">Instant check-in code</span>
                </div>
              </div>
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified</span>
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="grid grid-cols-2 gap-2.5 pt-2">
            <button
              onClick={() =>
                downloadReceipt({
                  orderId,
                  placeName,
                  amountUSD,
                  amountINR: Math.round(amountUSD * 83.2),
                  status: 'PAYMENT CONFIRMED',
                })
              }
              className="py-3 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-bold flex items-center justify-center space-x-1.5 transition-all shadow-sm active:scale-95"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={onClose}
              className="py-3 px-3 rounded-2xl bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black flex items-center justify-center space-x-1.5 shadow-lg shadow-sky-600/20 transition-all active:scale-95"
            >
              <span>Explore More</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
