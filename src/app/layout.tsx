import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
});

export const metadata: Metadata = {
  title: 'PayNGo – AI Travel Companion & Instant PayPal Payments',
  description: 'PayNGo is an AI-powered travel companion that discovers highly-rated local places, compares transport fares across Rapido/Uber/Metro, and completes PayPal payments seamlessly.',
  keywords: ['PayNGo', 'PayPal AI Hackathon', 'Travel Agent', 'Ride Comparison', 'PayPal Orders API v2', 'Next.js'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className={`${jakarta.className} bg-slate-50 text-slate-900 antialiased selection:bg-sky-500 selection:text-white`}>
        <div className="bg-amber-100 text-amber-900 text-xs sm:text-sm text-center py-1.5 px-4 font-semibold border-b border-amber-200/80 sticky top-0 z-[60]">
          Demo mode: no real bookings or payments are made.
        </div>
        {children}
      </body>
    </html>
  );
}
