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
        {children}
      </body>
    </html>
  );
}
