'use client';

import React from 'react';
import Link from 'next/link';

export const TechStackFooter: React.FC<{ dark?: boolean }> = ({ dark = false }) => {
  return (
    <footer className={`mt-16 py-8 border-t transition-colors ${
      dark 
        ? 'bg-slate-950 border-slate-800 text-slate-400' 
        : 'bg-slate-50 border-slate-200 text-slate-600'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium">
        <p className={dark ? 'text-slate-400' : 'text-slate-500'}>
          Built for the <span className={`font-bold ${dark ? 'text-white' : 'text-slate-800'}`}>PayPal AI Hackathon 2026</span>.
        </p>
        <div className="flex items-center space-x-6">
          <Link
            href="/about"
            className="text-blue-500 hover:text-blue-400 font-semibold hover:underline"
          >
            About & technology
          </Link>
          <span className={dark ? 'text-slate-700' : 'text-slate-300'}>•</span>
          <Link
            href="/planner"
            className={`${dark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'} font-semibold hover:underline`}
          >
            AI Planner
          </Link>
          <span className={dark ? 'text-slate-700' : 'text-slate-300'}>•</span>
          <Link
            href="/dashboard"
            className={`${dark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'} font-semibold hover:underline`}
          >
            My Trips
          </Link>
        </div>
      </div>
    </footer>
  );
};
