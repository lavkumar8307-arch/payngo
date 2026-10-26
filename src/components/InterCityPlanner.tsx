'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MOCK_INTERCITY_PLANS } from '@/lib/mockData';
import { InterCityPlan, Place } from '@/types';
import { Compass, Train, Bus, Car, ArrowRight, ShieldCheck, CreditCard, Clock, Sparkles } from 'lucide-react';

interface InterCityPlannerProps {
  currency: 'INR' | 'USD';
  onBookPlanWithPayPal: (place: Place) => void;
}

export const InterCityPlanner: React.FC<InterCityPlannerProps> = ({
  currency,
  onBookPlanWithPayPal,
}) => {
  const router = useRouter();

  const formatDuration = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xl space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>Inter-City Multi-Modal Planner</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">Affordable Weekend & Day Trips</h2>
          <p className="text-xs text-slate-500 mt-1">
            Real multi-modal routes (Train + Cab + Bus) with accurate computed durations and guaranteed PayPal checkout.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_INTERCITY_PLANS.map((plan) => {
          // Compute totals dynamically from segment data
          const totalMinutes = plan.segments.reduce((acc, seg) => acc + (seg.durationMin || 0), 0);
          const computedTotalINR = plan.segments.reduce((acc, seg) => acc + seg.costINR, 0);
          const computedTotalUSD = Number((computedTotalINR / 83.2).toFixed(2));

          const outboundSegments = plan.segments.filter((s) => s.type !== 'return');
          const returnSegments = plan.segments.filter((s) => s.type === 'return');

          const costDisplay =
            currency === 'USD'
              ? `$${computedTotalUSD} USD`
              : `₹${computedTotalINR.toLocaleString('en-IN')}`;

          const tierColors: Record<string, string> = {
            'Fastest': 'bg-amber-100 text-amber-800 border-amber-300',
            'Cheapest': 'bg-emerald-100 text-emerald-800 border-emerald-300',
            'Most Comfortable': 'bg-purple-100 text-purple-800 border-purple-300'
          };

          return (
            <div
              key={plan.id}
              className="bg-slate-50/90 border border-slate-200/90 hover:border-blue-400 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all space-y-4 flex flex-col justify-between"
            >
              <div>
                {/* Plan Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    {plan.tier && (
                      <span className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-md border uppercase tracking-wider mb-1.5 ${tierColors[plan.tier] || 'bg-blue-100 text-blue-800'}`}>
                        {plan.tier}
                      </span>
                    )}
                    <h3 className="text-sm font-black text-slate-900 leading-snug">{plan.title}</h3>
                    <p className="text-xs text-slate-500 flex items-center space-x-1 mt-1 font-medium">
                      <span>{plan.origin}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="text-blue-600 font-bold">{plan.destination}</span>
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 block">
                      {costDisplay}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">estimated total</span>
                  </div>
                </div>

                {/* Itinerary Segments: Outbound */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                    <span className="text-blue-700 uppercase tracking-wider text-[10px]">Outbound Journey</span>
                    <span className="text-slate-400 font-normal">
                      {formatDuration(outboundSegments.reduce((s, x) => s + (x.durationMin || 0), 0))}
                    </span>
                  </div>
                  {outboundSegments.map((seg, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 rounded-xl p-2.5 flex items-center justify-between text-xs shadow-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                          {seg.mode === 'Train' ? <Train className="w-3.5 h-3.5 text-blue-600" /> :
                            seg.mode === 'Bus' ? <Bus className="w-3.5 h-3.5 text-amber-600" /> :
                              <Car className="w-3.5 h-3.5 text-purple-600" />}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-800 text-[11px] truncate">{seg.provider}</div>
                          <div className="text-[10px] text-slate-400">{seg.departure} ➔ {seg.arrival}</div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-bold text-slate-900 text-xs">₹{seg.costINR}</div>
                        <div className="text-[10px] text-slate-400">{seg.duration}</div>
                      </div>
                    </div>
                  ))}

                  {/* Return Segments */}
                  {returnSegments.length > 0 && (
                    <>
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 pt-2">
                        <span className="text-amber-700 uppercase tracking-wider text-[10px]">Return Journey</span>
                        <span className="text-slate-400 font-normal">
                          {formatDuration(returnSegments.reduce((s, x) => s + (x.durationMin || 0), 0))}
                        </span>
                      </div>
                      {returnSegments.map((seg, idx) => (
                        <div key={idx} className="bg-white border border-slate-200 rounded-xl p-2.5 flex items-center justify-between text-xs shadow-sm">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                              {seg.mode === 'Train' ? <Train className="w-3.5 h-3.5 text-blue-600" /> :
                                seg.mode === 'Bus' ? <Bus className="w-3.5 h-3.5 text-amber-600" /> :
                                  <Car className="w-3.5 h-3.5 text-purple-600" />}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-800 text-[11px] truncate">{seg.provider}</div>
                              <div className="text-[10px] text-slate-400">{seg.departure} ➔ {seg.arrival}</div>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-bold text-slate-900 text-xs">₹{seg.costINR}</div>
                            <div className="text-[10px] text-slate-400">{seg.duration}</div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>

              {/* Bottom Details & Review Button */}
              <div className="pt-3 border-t border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Total: {formatDuration(totalMinutes)}</span>
                  </div>
                  {plan.lastUpdated && (
                    <span className="text-[10px] text-slate-400">Updated {plan.lastUpdated}</span>
                  )}
                </div>

                <button
                  onClick={() => {
                    const params = new URLSearchParams({
                      title: plan.title,
                      amount: computedTotalINR.toString(),
                      type: 'plan',
                      details: `${plan.origin} to ${plan.destination} (${formatDuration(totalMinutes)})`
                    });
                    router.push(`/checkout?${params.toString()}`);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-3 rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Review & book</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
